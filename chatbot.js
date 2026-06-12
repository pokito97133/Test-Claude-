// ============ AVATAR GUIDE – Les Jardiniers ============

const BOT_NAME = { fr: 'Léa', en: 'Lea' };

const RESPONSES = {
  fr: {
    greet: "Bonjour ! Je suis Léa, votre guide 🌿\nComment puis-je vous aider aujourd'hui ?",
    services: "Nous proposons :\n• Entretien régulier\n• Création sur mesure\n• Taille & élagage\n• Plantation & aménagement\n• Arrosage & irrigation\n\nVous voulez en savoir plus sur un service en particulier ?",
    contact: "Vous pouvez nous contacter :\n📞 Rémi : 06 90 48 39 34\n📞 Jonathan : 06 90 49 29 83\n📧 les.jardiniers@outlook.com\n\nOu remplissez notre formulaire de devis sur cette page !",
    gallery: "Notre galerie montre quelques-unes de nos réalisations à Saint-Barth 📸\nFaites défiler la page pour les découvrir !",
    price: "Nous établissons des devis personnalisés selon la surface, le type de travaux et la fréquence. Contactez-nous pour un devis gratuit !",
    zone: "Nous intervenons sur toute l'île de Saint-Barthélemy 🌴",
    hours: "Nous sommes disponibles du lundi au samedi, de 7h à 17h.",
    about: "Les Jardiniers, c'est une équipe de 6 passionnés avec plus de 15 ans d'expérience à Saint-Barth. Nous créons et entretenons des jardins d'exception pour particuliers et professionnels.",
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
    about: "Les Jardiniers is a team of 6 passionate professionals with over 15 years of experience in Saint-Barth. We create and maintain exceptional gardens for private and professional clients.",
    default: "I'm not sure I understand 😊\nHere's what I can tell you:",
  }
};

const SUGGESTIONS = {
  fr: ['Nos services', 'Nous contacter', 'Voir la galerie', 'Tarifs & devis', 'Zone d\'intervention', 'Horaires'],
  en: ['Our services', 'Contact us', 'See gallery', 'Pricing & quotes', 'Service area', 'Opening hours']
};

const KEYWORDS = {
  fr: {
    services: ['service', 'prestation', 'travaux', 'taille', 'entretien', 'création', 'plantation', 'arrosage', 'élagage'],
    contact: ['contact', 'téléphone', 'appel', 'email', 'mail', 'joindre', 'rémi', 'jonathan'],
    gallery: ['galerie', 'photo', 'réalisation', 'exemple', 'voir'],
    price: ['prix', 'tarif', 'devis', 'coût', 'combien'],
    zone: ['zone', 'secteur', 'intervention', 'île', 'barth'],
    hours: ['horaire', 'heure', 'ouvert', 'disponible', 'quand'],
    about: ['qui', 'entreprise', 'équipe', 'expérience', 'présentation'],
  },
  en: {
    services: ['service', 'work', 'pruning', 'maintenance', 'creation', 'planting', 'watering', 'trimming'],
    contact: ['contact', 'phone', 'call', 'email', 'reach', 'remi', 'jonathan'],
    gallery: ['gallery', 'photo', 'picture', 'project', 'see'],
    price: ['price', 'cost', 'quote', 'estimate', 'how much'],
    zone: ['zone', 'area', 'island', 'barth', 'where'],
    hours: ['hours', 'schedule', 'open', 'available', 'when'],
    about: ['who', 'company', 'team', 'experience', 'about'],
  }
};

const SCROLL_TARGETS = {
  'Nos services': '#services',
  'Voir la galerie': '#galerie',
  'Nous contacter': '#contact',
  'Our services': '#services',
  'See gallery': '#galerie',
  'Contact us': '#contact',
};

let lang = document.documentElement.lang === 'en' ? 'en' : 'fr';
let chatOpen = false;
let greeted = false;

function getLang() {
  return document.documentElement.lang === 'en' ? 'en' : 'fr';
}

function detectIntent(text) {
  const l = getLang();
  const t = text.toLowerCase();
  for (const [intent, words] of Object.entries(KEYWORDS[l])) {
    if (words.some(w => t.includes(w))) return intent;
  }
  return 'default';
}

function getResponse(text) {
  const l = getLang();
  const intent = detectIntent(text);
  return RESPONSES[l][intent];
}

function addMessage(text, type) {
  const messages = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  div.innerText = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function updateSuggestions() {
  const l = getLang();
  const container = document.getElementById('chat-suggestions');
  container.innerHTML = '';
  SUGGESTIONS[l].forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'suggestion-btn';
    btn.innerText = s;
    btn.onclick = () => handleSuggestion(s);
    container.appendChild(btn);
  });
}

function handleSuggestion(text) {
  const l = getLang();
  addMessage(text, 'user');
  const responses = RESPONSES[l];
  let reply = responses.default + '\n';

  const map = {
    'Nos services': responses.services,
    'Our services': responses.services,
    'Nous contacter': responses.contact,
    'Contact us': responses.contact,
    'Voir la galerie': responses.gallery,
    'See gallery': responses.gallery,
    'Tarifs & devis': responses.price,
    'Pricing & quotes': responses.price,
    "Zone d'intervention": responses.zone,
    'Service area': responses.zone,
    'Horaires': responses.hours,
    'Opening hours': responses.hours,
  };

  reply = map[text] || getResponse(text);
  setTimeout(() => {
    addMessage(reply, 'bot');
    if (SCROLL_TARGETS[text]) {
      setTimeout(() => {
        document.querySelector(SCROLL_TARGETS[text])?.scrollIntoView({ behavior: 'smooth' });
      }, 600);
    }
  }, 350);
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  addMessage(text, 'user');
  setTimeout(() => addMessage(getResponse(text), 'bot'), 400);
}

function openChat() {
  chatOpen = true;
  document.getElementById('chat-window').classList.add('open');
  document.getElementById('chat-bubble').style.display = 'none';
  document.querySelector('#chat-btn .badge').style.display = 'none';
  updateSuggestions();
  if (!greeted) {
    greeted = true;
    const l = getLang();
    setTimeout(() => addMessage(RESPONSES[l].greet, 'bot'), 200);
  }
}

function closeChat() {
  chatOpen = false;
  document.getElementById('chat-window').classList.remove('open');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  // Bulle de bienvenue après 3s
  setTimeout(() => {
    const l = getLang();
    const bubble = document.getElementById('chat-bubble');
    bubble.innerText = l === 'fr'
      ? '👋 Bonjour ! Besoin d\'aide ?\nJe suis Léa, votre guide.'
      : '👋 Hello! Need help?\nI\'m Lea, your guide.';
    bubble.style.display = 'block';
  }, 3000);

  document.getElementById('chat-btn').addEventListener('click', () => {
    chatOpen ? closeChat() : openChat();
  });

  document.getElementById('chat-close').addEventListener('click', closeChat);
  document.getElementById('chat-bubble').addEventListener('click', openChat);

  document.getElementById('chat-send').addEventListener('click', sendMessage);
  document.getElementById('chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });
});

// Re-greet on language change
window.addEventListener('langchange', () => {
  greeted = false;
  const messages = document.getElementById('chat-messages');
  if (messages) messages.innerHTML = '';
  updateSuggestions();
  if (chatOpen) {
    const l = getLang();
    setTimeout(() => addMessage(RESPONSES[l].greet, 'bot'), 200);
  }
  greeted = true;
});
