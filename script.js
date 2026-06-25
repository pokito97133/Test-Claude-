/* ===========================
   INJECT BACK TO TOP BUTTON
=========================== */
const bttBtn = document.createElement('button');
bttBtn.id = 'backToTop';
bttBtn.setAttribute('aria-label', 'Retour en haut');
bttBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M18 15l-6-6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
document.body.appendChild(bttBtn);

/* ===========================
   HEADER SCROLL (homepage)
=========================== */
const header = document.getElementById('header');
if (header) {
  const isHome = document.body.classList.contains('page-home');
  window.addEventListener('scroll', () => {
    if (isHome) {
      header.classList.toggle('scrolled', window.scrollY > 80);
    }
  }, { passive: true });
}

/* ===========================
   MOBILE NAV
=========================== */
const burger = document.getElementById('burger');
const nav    = document.getElementById('nav');
if (burger && nav) {
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('.nav__link, .btn--cta').forEach(el => {
    el.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
  document.addEventListener('click', e => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) {
      nav.classList.remove('open');
      burger.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ===========================
   SCROLL ANIMATIONS
=========================== */
const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('in-view'), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ===========================
   ANIMATED COUNTERS
=========================== */
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.target;
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current);
      if (current >= target) clearInterval(timer);
    }, 16);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

/* ===========================
   CAROUSEL (Réalisations)
=========================== */
const track  = document.getElementById('carouselTrack');
const dotsEl = document.getElementById('carouselDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

if (track) {
  const slides = track.querySelectorAll('.carousel__slide');
  let current  = 0;
  let startX   = 0;
  let isDragging = false;
  let dragOffset = 0;

  const slideWidth = () => slides[0].offsetWidth + 12;
  const maxIndex   = () => Math.max(0, slides.length - Math.floor(track.parentElement.offsetWidth / slideWidth()));

  // Build dots
  if (dotsEl) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });
  }

  function updateDots() {
    dotsEl?.querySelectorAll('.carousel__dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    track.style.transform = `translateX(-${current * slideWidth()}px)`;
    updateDots();
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  // Drag / touch
  track.addEventListener('mousedown', e => { isDragging = true; startX = e.clientX; track.style.transition = 'none'; });
  track.addEventListener('touchstart', e => { isDragging = true; startX = e.touches[0].clientX; track.style.transition = 'none'; }, { passive: true });

  function onMove(x) {
    if (!isDragging) return;
    dragOffset = x - startX;
    track.style.transform = `translateX(${-current * slideWidth() + dragOffset}px)`;
  }
  track.addEventListener('mousemove', e => onMove(e.clientX));
  track.addEventListener('touchmove', e => onMove(e.touches[0].clientX), { passive: true });

  function onEnd() {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = '';
    if (Math.abs(dragOffset) > 60) {
      goTo(dragOffset < 0 ? current + 1 : current - 1);
    } else {
      goTo(current);
    }
    dragOffset = 0;
  }
  track.addEventListener('mouseup', onEnd);
  track.addEventListener('mouseleave', onEnd);
  track.addEventListener('touchend', onEnd);

  // Lightbox on slide click
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbImg     = document.getElementById('lightboxImg');
    const lbCaption = document.getElementById('lightboxCaption');
    let lbIndex     = 0;

    function openLightbox(index) {
      lbIndex = index;
      const slide = slides[lbIndex];
      const img   = slide.querySelector('img');
      lbImg.src   = img.src.replace(/w=\d+/, 'w=1400');
      lbImg.alt   = img.alt;
      lbCaption.textContent = slide.querySelector('.carousel__slide-overlay span')?.textContent || '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    slides.forEach((slide, i) => {
      slide.addEventListener('click', () => { if (Math.abs(dragOffset) < 5) openLightbox(i); });
    });

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
    document.getElementById('lightboxPrev')?.addEventListener('click', () => openLightbox((lbIndex - 1 + slides.length) % slides.length));
    document.getElementById('lightboxNext')?.addEventListener('click', () => openLightbox((lbIndex + 1) % slides.length));
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft')  document.getElementById('lightboxPrev')?.click();
      if (e.key === 'ArrowRight') document.getElementById('lightboxNext')?.click();
    });
  }
}

/* ===========================
   CONTACT FORM
=========================== */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn     = document.getElementById('submitBtn');
    const success = document.getElementById('formSuccess');
    btn.disabled  = true;
    btn.textContent = 'Envoi en cours…';
    setTimeout(() => {
      btn.style.display  = 'none';
      if (success) success.style.display = 'block';
      form.querySelectorAll('input, select, textarea').forEach(el => el.value = '');
    }, 1000);
  });
}

/* ===========================
   BACK TO TOP
=========================== */
const btt = document.getElementById('backToTop');
if (btt) {
  window.addEventListener('scroll', () => {
    btt.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
