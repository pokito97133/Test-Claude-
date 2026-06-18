// Navbar scroll effect
window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 60);
});

// Mobile menu
const toggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (toggle && navLinks) {
  toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );
}

// Scroll reveal
const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Contact form
function sendForm(e) {
  e.preventDefault();
  const fb = document.getElementById('form-feedback');
  if (fb) {
    const isEn = document.documentElement.lang === 'en';
    fb.textContent = isEn
      ? '✓ Message sent! We will get back to you shortly.'
      : '✓ Message envoyé ! Nous vous répondrons rapidement.';
    setTimeout(() => { fb.textContent = ''; e.target.reset(); }, 4500);
  }
}
