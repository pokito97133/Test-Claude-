// Navbar shadow on scroll
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile menu toggle
document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

// Close mobile menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
  });
});

// Contact form feedback (sans backend)
function sendForm(e) {
  e.preventDefault();
  const feedback = document.getElementById('form-feedback');
  feedback.textContent = '✅ Merci ! Votre message a bien été envoyé. Nous vous répondrons rapidement.';
  e.target.reset();
}
