// ============ AVATAR 3D LÉA – Holographique futuriste ============

(function () {
  'use strict';

  const W = 100, H = 165;

  let renderer, scene, camera, clock;
  let headGroup, particleSys, mouthLine, eyeMats = [];
  let breathT = 0, talkT = 0, _talking = false;
  let scanT = 0, blinkTimer = 3;

  // ---- Boot ----
  function boot() {
    if (window.THREE) { init(); return; }
    const id = setInterval(() => { if (window.THREE) { clearInterval(id); init(); } }, 60);
  }

  function init() {
    const container = document.getElementById('avatar-3d');
    if (!container) return;
    container.innerHTML = '';

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    const cvs = renderer.domElement;
    cvs.style.cssText = `width:${W}px;height:${H}px;display:block;`;
    container.style.cssText = `width:${W}px;height:${H}px;flex-shrink:0;`;
    container.appendChild(cvs);

    scene = new THREE.Scene();
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(32, W / H, 0.01, 30);
    camera.position.set(0, 0.0, 2.8);
    camera.lookAt(0, -0.3, 0);

    // Gold point light in front
    const keyLight = new THREE.PointLight(0xc9a84c, 3.0, 6);
    keyLight.position.set(0.4, 0.8, 1.5);
    scene.add(keyLight);

    // Cool blue rim from behind for depth
    const rimLight = new THREE.PointLight(0x4488cc, 1.2, 6);
    rimLight.position.set(-0.5, 0.5, -2);
    scene.add(rimLight);

    scene.add(new THREE.AmbientLight(0x1a1008, 1.0));

    headGroup = new THREE.Group();
    headGroup.position.y = 0.04;
    scene.add(headGroup);

    buildHead();
    buildEyes();
    buildMouth();
    buildNeuralLines();
    buildHairParticles();
    buildNeck();
    buildBodyWire();
    buildAmbientParticles();

    tick();
  }

  // ---- Deform sphere to face shape ----
  function faceShape(geo) {
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      x *= 0.80; y *= 1.14; z *= 0.88;
      if (y < -0.22) x *= 1 - (-y - 0.22) * 0.38;
      pos.setXYZ(i, x, y, z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }

  // ---- Head: wireframe + inner glow shell ----
  function buildHead() {
    const geo = faceShape(new THREE.SphereGeometry(0.5, 28, 20));

    // Wireframe skeleton
    const wireframe = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.38 })
    );
    headGroup.add(wireframe);

    // Translucent inner shell – gives volume + glow
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0x2a1800,
      emissive: 0xc9a84c,
      emissiveIntensity: 0.14,
      transparent: true,
      opacity: 0.18,
      side: THREE.FrontSide,
    });
    headGroup.add(new THREE.Mesh(geo.clone(), shellMat));

    // Bright edge outline (slightly bigger sphere)
    const outlineGeo = faceShape(new THREE.SphereGeometry(0.51, 28, 20));
    const outlineMat = new THREE.MeshBasicMaterial({
      color: 0xc9a84c,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
    });
    headGroup.add(new THREE.Mesh(outlineGeo, outlineMat));
  }

  // ---- Eyes: glowing spheres ----
  function buildEyes() {
    [[-0.152, 0.108, 0.432], [0.152, 0.108, 0.432]].forEach(([x, y, z]) => {
      const mat = new THREE.MeshStandardMaterial({
        color: 0xf0d080,
        emissive: 0xf0d080,
        emissiveIntensity: 2.2,
      });
      eyeMats.push(mat);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 16), mat);
      eye.position.set(x, y, z);
      headGroup.add(eye);

      // Halo ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.042, 0.072, 24),
        new THREE.MeshBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
      );
      ring.position.set(x, y, z + 0.01);
      headGroup.add(ring);
    });
  }

  // ---- Mouth: glowing line ----
  function buildMouth() {
    const pts = [
      new THREE.Vector3(-0.1, -0.183, 0.485),
      new THREE.Vector3(-0.05, -0.193, 0.492),
      new THREE.Vector3(0, -0.195, 0.495),
      new THREE.Vector3(0.05, -0.193, 0.492),
      new THREE.Vector3(0.1, -0.183, 0.485),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: 0xf0c860, transparent: true, opacity: 0.75 });
    mouthLine = new THREE.Line(geo, mat);
    headGroup.add(mouthLine);
  }

  // ---- Neural / circuit lines on face ----
  function buildNeuralLines() {
    const mat = new THREE.LineBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.22 });
    const paths = [
      [[-0.32, 0.22, 0.34], [-0.16, 0.12, 0.44], [0, 0.08, 0.48]],
      [[0.32, 0.22, 0.34], [0.16, 0.12, 0.44]],
      [[-0.16, -0.08, 0.46], [0, -0.16, 0.49], [0.16, -0.08, 0.46]],
      [[-0.12, 0.27, 0.44], [0, 0.24, 0.472], [0.12, 0.27, 0.44]],
      [[-0.28, -0.18, 0.36], [-0.18, -0.22, 0.43]],
      [[0.28, -0.18, 0.36], [0.18, -0.22, 0.43]],
    ];
    paths.forEach(pts => {
      const geo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(...p)));
      headGroup.add(new THREE.Line(geo, mat.clone()));
    });
  }

  // ---- Hair: particle streams ----
  function buildHairParticles() {
    const TOTAL = 280;
    const pos = new Float32Array(TOTAL * 3);
    const col = new Float32Array(TOTAL * 3);
    const R = 201 / 255, G = 168 / 255, B = 76 / 255;

    // Strand paths (from crown outward and down)
    const strands = [
      [[-0.05, 0.56, 0.15], [-0.25, 0.38, 0.3], [-0.38, 0.1, 0.18], [-0.44, -0.25, 0.05], [-0.4, -0.6, -0.04], [-0.32, -0.9, -0.12]],
      [[-0.22, 0.52, 0.08], [-0.4, 0.26, 0.1], [-0.48, -0.08, 0.06], [-0.46, -0.4, 0.0], [-0.36, -0.75, -0.08]],
      [[0.1, 0.54, 0.14], [0.28, 0.36, 0.26], [0.35, 0.08, 0.18], [0.38, -0.22, 0.06], [0.32, -0.55, -0.02]],
      [[-0.08, 0.56, -0.1], [-0.18, 0.32, -0.35], [-0.28, 0.0, -0.52], [-0.32, -0.38, -0.46], [-0.26, -0.7, -0.3]],
      [[0.05, 0.56, -0.08], [0.14, 0.3, -0.38], [0.22, 0.0, -0.52], [0.24, -0.36, -0.44]],
    ];

    let idx = 0;
    strands.forEach((strand, si) => {
      const perStrand = Math.floor(TOTAL / strands.length);
      for (let i = 0; i < perStrand && idx < TOTAL; i++, idx++) {
        const t = i / perStrand;
        const seg = Math.min(Math.floor(t * (strand.length - 1)), strand.length - 2);
        const st = t * (strand.length - 1) - seg;
        const p0 = strand[seg], p1 = strand[seg + 1];
        pos[idx * 3]     = p0[0] + (p1[0] - p0[0]) * st + (Math.random() - 0.5) * 0.035;
        pos[idx * 3 + 1] = p0[1] + (p1[1] - p0[1]) * st + (Math.random() - 0.5) * 0.035;
        pos[idx * 3 + 2] = p0[2] + (p1[2] - p0[2]) * st + (Math.random() - 0.5) * 0.035;
        const br = (1 - t * 0.65) * (0.7 + Math.random() * 0.3);
        col[idx * 3]     = R * br;
        col[idx * 3 + 1] = G * br;
        col[idx * 3 + 2] = B * br * 0.5;
      }
    });
    // Fill remaining
    while (idx < TOTAL) {
      pos[idx * 3] = (Math.random() - 0.5) * 0.8;
      pos[idx * 3 + 1] = 0.3 + Math.random() * 0.3;
      pos[idx * 3 + 2] = (Math.random() - 0.5) * 0.5;
      col[idx * 3] = R * 0.3; col[idx * 3 + 1] = G * 0.3; col[idx * 3 + 2] = 0.05;
      idx++;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    particleSys = new THREE.Points(geo,
      new THREE.PointsMaterial({ size: 0.024, vertexColors: true, transparent: true, opacity: 0.88 })
    );
    particleSys.userData.orig = pos.slice();
    headGroup.add(particleSys);
  }

  // ---- Neck wireframe ----
  function buildNeck() {
    const geo = new THREE.CylinderGeometry(0.1, 0.125, 0.26, 8, 1);
    const neck = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.22 })
    );
    neck.position.set(0, -0.39, 0);
    headGroup.add(neck);
  }

  // ---- Body wireframe (shoulders + torso + chest lines) ----
  function buildBodyWire() {
    const mat = () => new THREE.LineBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.22 });

    // Upper torso
    const torso1 = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.28, 0.24, 0.44, 10, 2)),
      mat()
    );
    torso1.position.set(0, -0.72, 0);
    headGroup.add(torso1);

    // Lower torso
    const torso2 = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.24, 0.20, 0.38, 10, 2)),
      mat()
    );
    torso2.position.set(0, -1.08, 0);
    headGroup.add(torso2);

    // Shoulder spheres
    [-1, 1].forEach(s => {
      const geo = new THREE.SphereGeometry(0.16, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.6);
      const sh = new THREE.LineSegments(new THREE.EdgesGeometry(geo), mat());
      sh.position.set(s * 0.3, -0.62, 0);
      headGroup.add(sh);

      // Arms
      const arm = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.09, 0.07, 0.55, 8, 2)),
        mat()
      );
      arm.position.set(s * 0.42, -0.98, 0);
      arm.rotation.z = s * 0.18;
      headGroup.add(arm);
    });

    // Chest glowing lines (circuit style)
    const cMat = new THREE.LineBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.3 });
    const chestLines = [
      [[-0.15, -0.65, 0.24], [0, -0.7, 0.26], [0.15, -0.65, 0.24]],
      [[-0.1, -0.82, 0.22], [0, -0.85, 0.24], [0.1, -0.82, 0.22]],
      [[0, -0.7, 0.26], [0, -0.98, 0.22]],
    ];
    chestLines.forEach(pts => {
      const geo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(...p)));
      headGroup.add(new THREE.Line(geo, cMat.clone()));
    });

    // Gold pendant glow
    const pendant = new THREE.Mesh(
      new THREE.TorusGeometry(0.055, 0.008, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0xc9a84c, emissive: 0xc9a84c, emissiveIntensity: 1.0, metalness: 0.9, roughness: 0.1 })
    );
    pendant.position.set(0, -0.62, 0.22);
    pendant.rotation.x = 0.4;
    headGroup.add(pendant);
  }

  // ---- Ambient floating particles ----
  function buildAmbientParticles() {
    const N = 60;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 0.55 + Math.random() * 0.35;
      const h = (Math.random() - 0.4) * 1.2;
      pos[i * 3]     = Math.cos(theta) * r;
      pos[i * 3 + 1] = h;
      pos[i * 3 + 2] = Math.sin(theta) * r * 0.6;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo,
      new THREE.PointsMaterial({ color: 0xc9a84c, size: 0.018, transparent: true, opacity: 0.45 })
    );
    pts.userData.orig = pos.slice();
    headGroup.add(pts);
    headGroup.userData.ambientPts = pts;
  }

  // ---- Animation ----
  function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);

    breathT += dt;
    scanT += dt;

    // Idle head motion
    headGroup.position.y = 0.04 + Math.sin(breathT * 0.82) * 0.004;
    headGroup.rotation.y = Math.sin(breathT * 0.3) * 0.015;

    // Animate hair particles
    if (particleSys) {
      const p = particleSys.geometry.attributes.position;
      const o = particleSys.userData.orig;
      for (let i = 0; i < p.count; i++) {
        p.setX(i, o[i * 3]     + Math.sin(breathT * 1.1 + i * 0.7) * 0.006);
        p.setY(i, o[i * 3 + 1] + Math.cos(breathT * 0.9 + i * 0.5) * 0.008);
        p.setZ(i, o[i * 3 + 2] + Math.sin(breathT * 0.7 + i * 0.4) * 0.004);
      }
      p.needsUpdate = true;
    }

    // Animate ambient particles
    const amb = headGroup.userData.ambientPts;
    if (amb) {
      const ap = amb.geometry.attributes.position;
      const ao = amb.userData.orig;
      for (let i = 0; i < ap.count; i++) {
        ap.setY(i, ao[i * 3 + 1] + Math.sin(breathT * 0.6 + i * 1.1) * 0.025);
      }
      ap.needsUpdate = true;
    }

    // Blink (eye glow pulse)
    blinkTimer -= dt;
    if (blinkTimer <= 0) {
      blinkTimer = 2.5 + Math.random() * 3.5;
      doEyeBlink();
    }

    // Mouth glow / talking
    if (mouthLine) {
      if (_talking) {
        talkT += dt * 10;
        const op = (Math.sin(talkT) * 0.4 + 0.6);
        mouthLine.material.opacity = op;
        mouthLine.scale.y = 1 + (Math.sin(talkT * 1.6) * 0.5 + 0.5) * 0.6;
        mouthLine.scale.x = 1 + Math.sin(talkT * 2.1) * 0.05;
      } else {
        mouthLine.material.opacity += (0.75 - mouthLine.material.opacity) * dt * 6;
        mouthLine.scale.y += (1 - mouthLine.scale.y) * dt * 8;
        mouthLine.scale.x = 1;
      }
    }

    renderer.render(scene, camera);
  }

  function doEyeBlink() {
    let t = 0;
    (function step() {
      t += 0.016;
      const phase = t < 0.08 ? t / 0.08 : Math.max(0, 1 - (t - 0.08) / 0.12);
      const intensity = 2.2 * (1 - phase * 0.96);
      eyeMats.forEach(m => { m.emissiveIntensity = intensity; });
      if (t < 0.22) requestAnimationFrame(step);
      else eyeMats.forEach(m => { m.emissiveIntensity = 2.2; });
    })();
  }

  // ---- Public API ----
  window.leaStartTalking = function () { _talking = true; };
  window.leaStopTalking  = function () { _talking = false; };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
