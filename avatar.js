// ============ AVATAR VOCAL 3D – Les Jardiniers ============

const AVATAR_RESPONSES = {
  fr: {
    greet: "Bonjour ! Je suis Léa, votre guide 🌿\nComment puis-je vous aider aujourd'hui ?",
    services: "Nous proposons :\n• Entretien régulier\n• Création sur mesure\n• Taille & élagage\n• Plantation & aménagement\n• Arrosage & irrigation\n\nVous voulez en savoir plus sur un service ?",
    contact: "Contactez-nous :\n📞 Rémi : 06 90 48 39 34\n📞 Jonathan : 06 90 49 29 83\n📧 les.jardiniers@outlook.com\n\nOu remplissez le formulaire de devis sur cette page !",
    gallery: "Notre galerie présente quelques-unes de nos réalisations à Saint-Barth 📸\nFaites défiler la page pour les découvrir !",
    price: "Nous établissons des devis personnalisés selon la surface, le type de travaux et la fréquence. Contactez-nous pour un devis gratuit !",
    zone: "Nous intervenons sur toute l'île de Saint-Barthélemy 🌴",
    hours: "Nous sommes disponibles du lundi au samedi, de 7h à 17h.",
    about: "Les Jardiniers, c'est une équipe de 6 passionnés avec plus de 15 ans d'expérience à Saint-Barth. Nous créons et entretenons des jardins d'exception.",
    thanks: "Avec plaisir ! N'hésitez pas si vous avez d'autres questions 🌿",
    hello: "Bonjour ! Ravi de vous retrouver. En quoi puis-je vous aider ?",
    default: "Je ne suis pas sûre de comprendre 😊\nVoici ce que je peux vous dire :",
  },
  en: {
    greet: "Hello! I'm Lea, your guide 🌿\nHow can I help you today?",
    services: "We offer:\n• Regular maintenance\n• Custom garden design\n• Pruning & trimming\n• Planting & landscaping\n• Watering & irrigation\n\nWould you like more info on a specific service?",
    contact: "You can reach us at:\n📞 Rémi: 06 90 48 39 34\n📞 Jonathan: 06 90 49 29 83\n📧 les.jardiniers@outlook.com\n\nOr fill out our quote form on this page!",
    gallery: "Our gallery showcases some of our garden projects in Saint-Barth 📸\nScroll down to discover them!",
    price: "We provide personalized quotes based on surface area, type of work, and frequency. Contact us for a free estimate!",
    zone: "We work across the entire island of Saint-Barthélemy 🌴",
    hours: "We are available Monday to Saturday, 7am to 5pm.",
    about: "Les Jardiniers is a team of 6 passionate professionals with over 15 years of experience in Saint-Barth. We create and maintain exceptional gardens.",
    thanks: "You're welcome! Feel free to ask if you have more questions 🌿",
    hello: "Hello again! How can I help you?",
    default: "I'm not sure I understand 😊\nHere's what I can tell you:",
  }
};

const AVATAR_SUGGESTIONS = {
  fr: ['Nos services', 'Nous contacter', 'Voir la galerie', 'Tarifs & devis', 'Zone d\'intervention', 'Horaires'],
  en: ['Our services', 'Contact us', 'See gallery', 'Pricing & quotes', 'Service area', 'Opening hours']
};

const AVATAR_KEYWORDS = {
  fr: {
    services: ['service', 'prestation', 'travaux', 'taille', 'entretien', 'création', 'plantation', 'arrosage', 'élagage'],
    contact: ['contact', 'téléphone', 'appel', 'email', 'mail', 'joindre', 'rémi', 'jonathan'],
    gallery: ['galerie', 'photo', 'réalisation', 'exemple', 'voir'],
    price: ['prix', 'tarif', 'devis', 'coût', 'combien'],
    zone: ['zone', 'secteur', 'intervention', 'île', 'barth', 'où'],
    hours: ['horaire', 'heure', 'ouvert', 'disponible', 'quand'],
    about: ['qui', 'entreprise', 'équipe', 'expérience', 'présentation', 'propos'],
    thanks: ['merci', 'super', 'parfait', 'génial', 'nickel'],
    hello: ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou'],
  },
  en: {
    services: ['service', 'work', 'pruning', 'maintenance', 'creation', 'planting', 'watering', 'trimming'],
    contact: ['contact', 'phone', 'call', 'email', 'reach', 'remi', 'jonathan'],
    gallery: ['gallery', 'photo', 'picture', 'project', 'see'],
    price: ['price', 'cost', 'quote', 'estimate', 'how much'],
    zone: ['zone', 'area', 'island', 'barth', 'where'],
    hours: ['hours', 'schedule', 'open', 'available', 'when'],
    about: ['who', 'company', 'team', 'experience', 'about'],
    thanks: ['thank', 'thanks', 'great', 'perfect', 'awesome'],
    hello: ['hello', 'hi', 'hey', 'good morning', 'bonjour'],
  }
};

const AVATAR_SCROLL_TARGETS = {
  'Nos services': '#services',
  'Voir la galerie': '#galerie',
  'Nous contacter': '#contact',
  'Our services': '#services',
  'See gallery': '#galerie',
  'Contact us': '#contact',
};

const AVATAR_SUGGESTION_MAP = {
  'Nos services': 'services',
  'Our services': 'services',
  'Nous contacter': 'contact',
  'Contact us': 'contact',
  'Voir la galerie': 'gallery',
  'See gallery': 'gallery',
  'Tarifs & devis': 'price',
  'Pricing & quotes': 'price',
  "Zone d'intervention": 'zone',
  'Service area': 'zone',
  'Horaires': 'hours',
  'Opening hours': 'hours',
};

let avatarOpen = false;
let avatarGreeted = false;
let recognition = null;
let isListening = false;
let isSpeaking = false;
let typingEl = null;

function getAvatarLang() {
  return document.documentElement.lang === 'en' ? 'en' : 'fr';
}

// ---- TTS ----
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const l = getAvatarLang();
  const utter = new SpeechSynthesisUtterance(text.replace(/[📞📧📸🌿🌴😊]/g, ''));
  utter.lang = l === 'fr' ? 'fr-FR' : 'en-US';
  utter.rate = 0.95;
  utter.pitch = 1.1;

  const voices = window.speechSynthesis.getVoices();
  const preferred = l === 'fr'
    ? ['Amélie', 'Marie', 'Audrey', 'Google français', 'fr-FR']
    : ['Samantha', 'Ava', 'Karen', 'Google US English', 'en-US'];
  let voice = null;
  for (const name of preferred) {
    voice = voices.find(v => v.name.includes(name) || v.lang === name);
    if (voice) break;
  }
  if (!voice) voice = voices.find(v => v.lang.startsWith(l === 'fr' ? 'fr' : 'en') && v.name.toLowerCase().includes('female'));
  if (!voice) voice = voices.find(v => v.lang.startsWith(l === 'fr' ? 'fr' : 'en'));
  if (voice) utter.voice = voice;

  const mouth = document.getElementById('avatarMouth');
  utter.onstart = () => {
    isSpeaking = true;
    if (mouth) mouth.classList.add('talking');
    setAvatarStatus(l === 'fr' ? 'Je parle...' : 'Speaking...');
  };
  utter.onend = () => {
    isSpeaking = false;
    if (mouth) mouth.classList.remove('talking');
    setAvatarStatus(l === 'fr' ? 'Votre guide' : 'Your guide');
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
  r.lang = getAvatarLang() === 'fr' ? 'fr-FR' : 'en-US';
  r.onstart = () => {
    isListening = true;
    const btn = document.getElementById('mic-btn');
    if (btn) btn.classList.add('listening');
    const l = getAvatarLang();
    setAvatarStatus(l === 'fr' ? 'J\'écoute...' : 'Listening...');
  };
  r.onresult = e => {
    const text = e.results[0][0].transcript;
    const input = document.getElementById('avatar-input');
    if (input) input.value = text;
    stopListening();
    handleAvatarText(text);
  };
  r.onerror = () => stopListening();
  r.onend = () => stopListening();
  return r;
}

function startListening() {
  if (!recognition) recognition = setupRecognition();
  if (!recognition) {
    const l = getAvatarLang();
    addAvatarMessage(l === 'fr' ? "Désolée, la reconnaissance vocale n'est pas disponible dans ce navigateur." : "Sorry, voice recognition is not available in this browser.", 'bot');
    return;
  }
  if (isListening) { stopListening(); return; }
  try { recognition.start(); } catch(e) {}
}

function stopListening() {
  isListening = false;
  const btn = document.getElementById('mic-btn');
  if (btn) btn.classList.remove('listening');
  const l = getAvatarLang();
  setAvatarStatus(l === 'fr' ? 'Votre guide' : 'Your guide');
  try { if (recognition) recognition.stop(); } catch(e) {}
}

// ---- UI helpers ----
function setAvatarStatus(txt) {
  const el = document.getElementById('avatarStatus');
  if (el) el.textContent = txt;
}

function addAvatarMessage(text, type) {
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

function hideTyping() {
  if (typingEl) { typingEl.remove(); typingEl = null; }
}

function updateAvatarSuggestions() {
  const l = getAvatarLang();
  const container = document.getElementById('avatar-suggestions');
  if (!container) return;
  container.innerHTML = '';
  AVATAR_SUGGESTIONS[l].forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'sug-btn';
    btn.innerText = s;
    btn.onclick = () => handleAvatarSuggestion(s);
    container.appendChild(btn);
  });
}

// ---- Intent ----
function detectAvatarIntent(text) {
  const l = getAvatarLang();
  const t = text.toLowerCase();
  for (const [intent, words] of Object.entries(AVATAR_KEYWORDS[l])) {
    if (words.some(w => t.includes(w))) return intent;
  }
  return 'default';
}

// ---- Message handling ----
function handleAvatarText(text) {
  if (!text.trim()) return;
  const l = getAvatarLang();
  addAvatarMessage(text, 'user');
  const input = document.getElementById('avatar-input');
  if (input) input.value = '';

  showTyping();
  const intent = detectAvatarIntent(text);
  const reply = AVATAR_RESPONSES[l][intent];

  setTimeout(() => {
    hideTyping();
    addAvatarMessage(reply, 'bot');
    speak(reply);
  }, 420);
}

function handleAvatarSuggestion(text) {
  const l = getAvatarLang();
  addAvatarMessage(text, 'user');
  const intent = AVATAR_SUGGESTION_MAP[text];
  const reply = intent ? AVATAR_RESPONSES[l][intent] : AVATAR_RESPONSES[l].default;

  showTyping();
  setTimeout(() => {
    hideTyping();
    addAvatarMessage(reply, 'bot');
    speak(reply);
    if (AVATAR_SCROLL_TARGETS[text]) {
      setTimeout(() => {
        document.querySelector(AVATAR_SCROLL_TARGETS[text])?.scrollIntoView({ behavior: 'smooth' });
      }, 700);
    }
  }, 420);
}

// ---- Open / Close ----
function openAvatar() {
  avatarOpen = true;
  const win = document.getElementById('avatar-window');
  const bubble = document.getElementById('avatar-bubble');
  if (win) win.classList.add('open');
  if (bubble) bubble.style.display = 'none';
  updateAvatarSuggestions();

  if (!avatarGreeted) {
    avatarGreeted = true;
    const l = getAvatarLang();
    setTimeout(() => {
      addAvatarMessage(AVATAR_RESPONSES[l].greet, 'bot');
      speak(AVATAR_RESPONSES[l].greet);
    }, 250);
  }
}

function closeAvatar() {
  avatarOpen = false;
  window.speechSynthesis && window.speechSynthesis.cancel();
  stopListening();
  const win = document.getElementById('avatar-window');
  if (win) win.classList.remove('open');
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  // Welcome bubble
  setTimeout(() => {
    const l = getAvatarLang();
    const bubble = document.getElementById('avatar-bubble');
    if (bubble) {
      bubble.innerText = l === 'fr'
        ? '👋 Bonjour ! Je suis Léa\nVotre guide virtuel 🌿'
        : '👋 Hello! I\'m Lea\nYour virtual guide 🌿';
      bubble.style.display = 'block';
    }
  }, 4000);

  // Voices may load async
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }

  const btn = document.getElementById('avatar-btn');
  const closeBtn = document.getElementById('avatar-close');
  const bubble = document.getElementById('avatar-bubble');
  const micBtn = document.getElementById('mic-btn');
  const sendBtn = document.getElementById('avatar-send');
  const inputEl = document.getElementById('avatar-input');

  if (btn) btn.addEventListener('click', () => avatarOpen ? closeAvatar() : openAvatar());
  if (closeBtn) closeBtn.addEventListener('click', closeAvatar);
  if (bubble) bubble.addEventListener('click', openAvatar);
  if (micBtn) micBtn.addEventListener('click', startListening);
  if (sendBtn) sendBtn.addEventListener('click', () => handleAvatarText(inputEl?.value?.trim() || ''));
  if (inputEl) inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') handleAvatarText(inputEl.value.trim()); });
});
