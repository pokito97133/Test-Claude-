// ============ AVATAR LÉA – Les Jardiniers ============

const RESPONSES = {
  fr: {
    greet:     "Bonjour, je suis Léa 🌿\nJe suis votre guide sur ce site. Je peux vous présenter l'équipe, nos services, vous montrer la galerie ou vous mettre en contact. Que souhaitez-vous ?",
    team:      "Notre équipe c'est 6 passionnés 💚\n• Rémi – Co-fondateur & chef de projet\n• Jonathan – Co-fondateur & expert terrain\n• 4 experts : paysagiste, maître jardinier, irrigation, plantation\n\nVoulez-vous voir leur présentation complète ?",
    remi:      "Rémi est co-fondateur des Jardiniers 🌿\nVisionnaire et chef de projet, il orchestre chaque réalisation depuis plus de 15 ans sur l'île.\n📞 06 90 48 39 34",
    jonathan:  "Jonathan est co-fondateur et expert terrain 🌿\nIl transforme chaque espace en jardin d'exception à Saint-Barth.\n📞 06 90 49 29 83",
    services:  "Nos 6 expertises :\n01 · Entretien régulier\n02 · Création sur mesure\n03 · Taille & élagage\n04 · Plantation & aménagement\n05 · Arrosage & irrigation\n06 · Évacuation des déchets verts\n\nJe vous montre ?",
    gallery:   "Notre galerie présente des réalisations à Saint-Barth 📸\nJardins tropicaux, allées, villas, pergolas, terrasses...\nJe vous y emmène ?",
    contact:   "Contactez-nous directement :\n📞 Rémi : 06 90 48 39 34\n📞 Jonathan : 06 90 49 29 83\n📧 les.jardiniers@outlook.com\n📍 Saint-Barthélemy (97133)\n🕐 Lun–Sam : 7h–17h\n\nOu remplissez notre formulaire pour un devis gratuit !",
    price:     "Nous établissons des devis personnalisés selon la surface, le type de travaux et la fréquence.\nContactez Rémi ou Jonathan pour un devis gratuit et sans engagement 😊",
    zone:      "Nous intervenons sur toute l'île de Saint-Barthélemy 🌴\nNous connaissons parfaitement le microclimat et la végétation de chaque quartier.",
    hours:     "Nous sommes disponibles :\n🕐 Lundi au Samedi\n⏰ 7h00 – 17h00\n\nHors ces horaires, laissez-nous un message et nous vous rappelons rapidement !",
    about:     "Les Jardiniers, c'est une passion de l'île et de la nature 🌿\n6 experts · +15 ans d'expérience · +500 jardins réalisés à Saint-Barth.\nFondés par Rémi et Jonathan, nous créons des jardins d'exception.",
    instagram: "Retrouvez nos réalisations sur Instagram 📸\n@les_jardiniers_st_barth\n\nDes photos au quotidien de nos jardins à Saint-Barth !",
    email:     "Notre adresse email :\n📧 les.jardiniers@outlook.com\n\nNous répondons sous 24h !",
    thanks:    "Avec plaisir ! Je reste disponible si vous avez d'autres questions 🌿",
    hello:     "Bonjour ! Ravi de vous retrouver. Comment puis-je vous aider ?",
    default:   "Je peux vous renseigner sur :\n• L'équipe\n• Nos services\n• La galerie\n• Les tarifs & devis\n• Nous contacter\n\nQue souhaitez-vous savoir ?",
  },
  en: {
    greet:     "Hello, I'm Léa 🌿\nI'm your guide on this site. I can introduce the team, our services, show you the gallery or connect you with us. What would you like?",
    team:      "Our team is 6 passionate professionals 💚\n• Rémi – Co-founder & project manager\n• Jonathan – Co-founder & field expert\n• 4 experts: landscape, master gardener, irrigation, planting\n\nWould you like to see the full team?",
    remi:      "Rémi is co-founder of Les Jardiniers 🌿\nA visionary project manager with over 15 years on the island.\n📞 06 90 48 39 34",
    jonathan:  "Jonathan is co-founder and field expert 🌿\nHe transforms every space into an exceptional garden in Saint-Barth.\n📞 06 90 49 29 83",
    services:  "Our 6 areas of expertise:\n01 · Regular maintenance\n02 · Custom garden design\n03 · Pruning & trimming\n04 · Planting & landscaping\n05 · Watering & irrigation\n06 · Green waste removal\n\nShall I show you?",
    gallery:   "Our gallery features our work across Saint-Barth 📸\nTropical gardens, walkways, villas, pergolas, terraces...\nWant me to take you there?",
    contact:   "Reach us directly:\n📞 Rémi: 06 90 48 39 34\n📞 Jonathan: 06 90 49 29 83\n📧 les.jardiniers@outlook.com\n📍 Saint-Barthélemy (97133)\n🕐 Mon–Sat: 7am–5pm\n\nOr fill in our form for a free quote!",
    price:     "We provide personalised quotes based on surface area, type of work and frequency.\nContact Rémi or Jonathan for a free, no-obligation quote 😊",
    zone:      "We work across the entire island of Saint-Barthélemy 🌴\nWe know the microclimate and vegetation of every neighbourhood perfectly.",
    hours:     "We are available:\n🕐 Monday to Saturday\n⏰ 7am – 5pm\n\nOutside these hours, leave us a message and we'll call you back quickly!",
    about:     "Les Jardiniers is a passion for the island and nature 🌿\n6 experts · 15+ years experience · 500+ gardens in Saint-Barth.\nFounded by Rémi and Jonathan, we create exceptional gardens.",
    instagram: "Find our work on Instagram 📸\n@les_jardiniers_st_barth\n\nDaily photos of our gardens in Saint-Barth!",
    email:     "Our email address:\n📧 les.jardiniers@outlook.com\n\nWe reply within 24 hours!",
    thanks:    "You're welcome! I'm here if you have more questions 🌿",
    hello:     "Hello again! How can I help you?",
    default:   "I can tell you about:\n• The team\n• Our services\n• The gallery\n• Pricing & quotes\n• How to contact us\n\nWhat would you like to know?",
  }
};

const SUGGESTIONS = {
  fr: ['L\'équipe', 'Nos services', 'La galerie', 'Tarifs & devis', 'Nous contacter', 'Horaires'],
  en: ['The team', 'Our services', 'The gallery', 'Pricing', 'Contact us', 'Opening hours']
};

const KEYWORDS = {
  fr: {
    team:      ['équipe', 'membre', 'collaborateur', 'présentation', 'qui travaille'],
    remi:      ['rémi', 'remi', 'fondateur'],
    jonathan:  ['jonathan'],
    services:  ['service', 'prestation', 'taille', 'entretien', 'création', 'plantation', 'arrosage', 'élagage', 'déchet', 'travaux'],
    gallery:   ['galerie', 'photo', 'réalisation', 'exemple', 'travaux', 'portfolio'],
    contact:   ['contact', 'téléphone', 'appeler', 'email', 'mail', 'joindre', 'numéro', 'coordonnée'],
    price:     ['prix', 'tarif', 'devis', 'coût', 'combien', 'gratuit'],
    zone:      ['zone', 'secteur', 'intervention', 'île', 'barth', 'où', 'quartier'],
    hours:     ['horaire', 'heure', 'ouvert', 'disponible', 'quand', 'matin'],
    about:     ['qui', 'entreprise', 'expérience', 'propos', 'histoire', 'depuis'],
    instagram: ['instagram', 'insta', 'réseau', 'social'],
    email:     ['email', 'mail', 'courrier', 'outlook'],
    thanks:    ['merci', 'super', 'parfait', 'génial', 'nickel', 'top', 'cool'],
    hello:     ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou', 'hey'],
  },
  en: {
    team:      ['team', 'member', 'staff', 'who', 'meet', 'people'],
    remi:      ['remi', 'rémi'],
    jonathan:  ['jonathan'],
    services:  ['service', 'work', 'pruning', 'maintenance', 'creation', 'planting', 'watering', 'trimming', 'waste'],
    gallery:   ['gallery', 'photo', 'picture', 'project', 'portfolio', 'work', 'example'],
    contact:   ['contact', 'phone', 'call', 'email', 'reach', 'number'],
    price:     ['price', 'cost', 'quote', 'estimate', 'how much', 'fee'],
    zone:      ['zone', 'area', 'island', 'barth', 'where', 'location'],
    hours:     ['hours', 'schedule', 'open', 'available', 'when', 'time'],
    about:     ['company', 'experience', 'about', 'history', 'since', 'story'],
    instagram: ['instagram', 'insta', 'social', 'network'],
    email:     ['email', 'mail', 'outlook'],
    thanks:    ['thank', 'thanks', 'great', 'perfect', 'awesome', 'nice', 'good'],
    hello:     ['hello', 'hi', 'hey', 'good morning', 'bonjour'],
  }
};

// Section anchors for navigation
const NAV_TARGETS = {
  fr: {
    team:     document.documentElement.lang === 'en' ? '#team' : '#presentation',
    services: '#services',
    gallery:  document.documentElement.lang === 'en' ? '#gallery' : '#galerie',
    contact:  '#contact',
  },
  en: {
    team:     '#team',
    services: '#services',
    gallery:  '#gallery',
    contact:  '#contact',
  }
};

const SUGGESTION_INTENT = {
  'L\'équipe': 'team', 'The team': 'team',
  'Nos services': 'services', 'Our services': 'services',
  'La galerie': 'gallery', 'The gallery': 'gallery',
  'Tarifs & devis': 'price', 'Pricing': 'price',
  'Nous contacter': 'contact', 'Contact us': 'contact',
  'Horaires': 'hours', 'Opening hours': 'hours',
};

const SCROLL_ON = new Set(['team', 'services', 'gallery', 'contact']);

// ---- State ----
let avatarOpen = false;
let avatarGreeted = false;
let recognition = null;
let isListening = false;
let isSpeaking = false;
let typingEl = null;

function getLang() {
  return document.documentElement.lang === 'en' ? 'en' : 'fr';
}

// ---- TTS ----
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const l = getLang();
  const clean = text.replace(/[📞📧📸🌿🌴😊💚🕐⏰📍·•]/g, '').replace(/\d{2} \d{2} \d{2} \d{2} \d{2}/g, m => m.split(' ').join(' '));
  const utter = new SpeechSynthesisUtterance(clean);
  utter.lang = l === 'fr' ? 'fr-FR' : 'en-US';
  utter.rate = 0.92;
  utter.pitch = 1.15;
  utter.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const preferred = l === 'fr'
    ? ['Amélie', 'Marie', 'Audrey', 'Juliette', 'Google français', 'fr-FR']
    : ['Samantha', 'Ava', 'Karen', 'Victoria', 'Google US English', 'en-US'];
  let voice = null;
  for (const name of preferred) {
    voice = voices.find(v => v.name.includes(name) || v.lang === name);
    if (voice) break;
  }
  if (!voice) voice = voices.find(v => v.lang.startsWith(l === 'fr' ? 'fr' : 'en') && v.name.toLowerCase().includes('female'));
  if (!voice) voice = voices.find(v => v.lang.startsWith(l === 'fr' ? 'fr' : 'en'));
  if (voice) utter.voice = voice;

  utter.onstart = () => {
    isSpeaking = true;
    if (window.leaStartTalking) window.leaStartTalking();
    setStatus(l === 'fr' ? 'Je parle...' : 'Speaking...');
  };
  utter.onend = () => {
    isSpeaking = false;
    if (window.leaStopTalking) window.leaStopTalking();
    setStatus(l === 'fr' ? 'Votre guide' : 'Your guide');
  };
  window.speechSynthesis.speak(utter);
}

// ---- STT ----
function setupRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.continuous = false;
  r.interimResults = false;
  r.lang = getLang() === 'fr' ? 'fr-FR' : 'en-US';
  r.onstart = () => {
    isListening = true;
    document.getElementById('mic-btn')?.classList.add('listening');
    setStatus(getLang() === 'fr' ? 'J\'écoute...' : 'Listening...');
  };
  r.onresult = e => {
    const text = e.results[0][0].transcript;
    const input = document.getElementById('avatar-input');
    if (input) input.value = text;
    stopListening();
    handleText(text);
  };
  r.onerror = () => stopListening();
  r.onend = () => stopListening();
  return r;
}

function startListening() {
  if (!recognition) recognition = setupRecognition();
  if (!recognition) {
    const l = getLang();
    addMsg(l === 'fr' ? "Désolée, la reconnaissance vocale n'est pas disponible ici." : "Sorry, voice recognition is not available here.", 'bot');
    return;
  }
  if (isListening) { stopListening(); return; }
  try { recognition.start(); } catch(e) {}
}

function stopListening() {
  isListening = false;
  document.getElementById('mic-btn')?.classList.remove('listening');
  setStatus(getLang() === 'fr' ? 'Votre guide' : 'Your guide');
  try { recognition?.stop(); } catch(e) {}
}

// ---- UI ----
function setStatus(txt) {
  const el = document.getElementById('avatarStatus');
  if (el) el.textContent = txt;
}

function addMsg(text, type) {
  const msgs = document.getElementById('avatar-messages');
  if (!msgs) return;
  if (typingEl) { typingEl.remove(); typingEl = null; }
  const div = document.createElement('div');
  div.className = `amsg ${type}`;
  div.innerText = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
  const msgs = document.getElementById('avatar-messages');
  if (!msgs) return;
  typingEl = document.createElement('div');
  typingEl.className = 'speaking-dots';
  typingEl.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(typingEl);
  msgs.scrollTop = msgs.scrollHeight;
}

function renderSuggestions() {
  const l = getLang();
  const container = document.getElementById('avatar-suggestions');
  if (!container) return;
  container.innerHTML = '';
  SUGGESTIONS[l].forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'sug-btn';
    btn.innerText = s;
    btn.onclick = () => handleSuggestion(s);
    container.appendChild(btn);
  });
}

function scrollToSection(intent) {
  const l = getLang();
  const sectionMap = {
    team:     l === 'fr' ? '#presentation' : '#team',
    services: '#services',
    gallery:  l === 'fr' ? '#galerie' : '#gallery',
    contact:  '#contact',
  };
  const target = sectionMap[intent];
  if (target) {
    setTimeout(() => {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 800);
  }
}

// ---- Intent detection ----
function detectIntent(text) {
  const l = getLang();
  const t = text.toLowerCase();
  for (const [intent, words] of Object.entries(KEYWORDS[l])) {
    if (words.some(w => t.includes(w))) return intent;
  }
  return 'default';
}

// ---- Handlers ----
function handleText(text) {
  if (!text.trim()) return;
  const l = getLang();
  addMsg(text, 'user');
  const input = document.getElementById('avatar-input');
  if (input) input.value = '';

  showTyping();
  const intent = detectIntent(text);
  const reply = RESPONSES[l][intent] || RESPONSES[l].default;

  setTimeout(() => {
    if (typingEl) { typingEl.remove(); typingEl = null; }
    addMsg(reply, 'bot');
    speak(reply);
    if (SCROLL_ON.has(intent)) scrollToSection(intent);
  }, 480);
}

function handleSuggestion(text) {
  const l = getLang();
  addMsg(text, 'user');
  const intent = SUGGESTION_INTENT[text] || 'default';
  const reply = RESPONSES[l][intent] || RESPONSES[l].default;

  showTyping();
  setTimeout(() => {
    if (typingEl) { typingEl.remove(); typingEl = null; }
    addMsg(reply, 'bot');
    speak(reply);
    if (SCROLL_ON.has(intent)) scrollToSection(intent);
  }, 480);
}

// ---- Open / Close ----
function openAvatar() {
  avatarOpen = true;
  document.getElementById('avatar-window')?.classList.add('open');
  document.getElementById('avatar-bubble') && (document.getElementById('avatar-bubble').style.display = 'none');
  // Init 3D avatar now that the window is visible
  if (window.leaInit3D) window.leaInit3D();
  renderSuggestions();
  if (!avatarGreeted) {
    avatarGreeted = true;
    const l = getLang();
    setTimeout(() => {
      addMsg(RESPONSES[l].greet, 'bot');
      speak(RESPONSES[l].greet);
    }, 280);
  }
}

function closeAvatar() {
  avatarOpen = false;
  window.speechSynthesis?.cancel();
  stopListening();
  document.getElementById('avatar-window')?.classList.remove('open');
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  // Welcome bubble after 3.5s
  setTimeout(() => {
    const l = getLang();
    const bubble = document.getElementById('avatar-bubble');
    if (bubble && !avatarOpen) {
      bubble.innerText = l === 'fr'
        ? '👋 Bonjour ! Je suis Léa\nVotre guide Les Jardiniers 🌿'
        : '👋 Hello! I\'m Léa\nYour Les Jardiniers guide 🌿';
      bubble.style.display = 'block';
      // Auto-hide bubble after 8s
      setTimeout(() => { if (!avatarOpen) bubble.style.display = 'none'; }, 8000);
    }
  }, 3500);

  // Preload voices
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }

  // Events
  document.getElementById('avatar-btn')?.addEventListener('click', () => avatarOpen ? closeAvatar() : openAvatar());
  document.getElementById('avatar-close')?.addEventListener('click', closeAvatar);
  document.getElementById('avatar-bubble')?.addEventListener('click', openAvatar);
  document.getElementById('mic-btn')?.addEventListener('click', startListening);
  document.getElementById('avatar-send')?.addEventListener('click', () => {
    const v = document.getElementById('avatar-input')?.value?.trim();
    if (v) handleText(v);
  });
  document.getElementById('avatar-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const v = e.target.value.trim();
      if (v) handleText(v);
    }
  });

  // Scroll-aware: update bubble text based on current section
  const sections = ['presentation', 'team', 'services', 'galerie', 'gallery', 'contact'];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !avatarOpen) {
        const id = e.target.id;
        const bubble = document.getElementById('avatar-bubble');
        if (!bubble) return;
        const l = getLang();
        const hints = {
          fr: { presentation: '💚 Vous découvrez l\'équipe !', services: '🌿 Nos 6 expertises vous attendent', galerie: '📸 Nos réalisations à Saint-Barth', contact: '📞 Un devis gratuit ? Je vous aide !' },
          en: { team: '💚 Meet our passionate team!', services: '🌿 Discover our 6 areas of expertise', gallery: '📸 Our creations in Saint-Barth', contact: '📞 Free quote? I can help you!' },
        };
        const hint = (hints[l] || {})[id];
        if (hint) {
          bubble.innerText = hint;
          bubble.style.display = 'block';
          setTimeout(() => { if (!avatarOpen) bubble.style.display = 'none'; }, 5000);
        }
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
});
