const body = document.body;
const header = document.querySelector('.site-header');
const nav = document.querySelector('.site-nav');
const menuToggle = document.querySelector('.menu-toggle');
const progress = document.querySelector('.scroll-progress');
const cursorGlow = document.querySelector('.cursor-glow');
const transitionLayer = document.querySelector('.page-transition');

// Fade the initial page transition away once the page is ready.
window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    transitionLayer.style.transform = 'translateY(-100%)';
  });
});

function setMenu(open) {
  nav.classList.toggle('open', open);
  body.classList.toggle('nav-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}

menuToggle?.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? (scrollTop / max) * 100 : 0}%`;
  header.classList.toggle('scrolled', scrollTop > 50);
}
window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el, index) => {
  el.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
  revealObserver.observe(el);
});

// Active navigation state based on the section currently on screen.
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav-link')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
sections.forEach((section) => sectionObserver.observe(section));

// Cursor glow on desktop.
if (window.matchMedia('(pointer:fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    cursorGlow.style.opacity = '1';
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  }, { passive: true });
  document.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0'; });
}

// Gentle card tilt. Disabled for touch devices and reduced-motion preferences.
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReduced && window.matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1100px) rotateX(${y * -5}deg) rotateY(${x * 6}deg) translateZ(4px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

// Magnetic buttons.
if (!prefersReduced && window.matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.magnetic').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.14;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.14;
      button.style.transform = `translate(${x}px, ${y}px)`;
    });
    button.addEventListener('pointerleave', () => {
      button.style.transform = '';
    });
  });
}

// Gallery lightbox.
const lightbox = document.querySelector('.lightbox');
const lightboxImage = document.querySelector('.lightbox-image');
const lightboxClose = document.querySelector('.lightbox-close');

document.querySelectorAll('[data-lightbox]').forEach((card) => {
  card.addEventListener('click', () => {
    const source = card.dataset.lightbox;
    lightboxImage.src = source;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    body.classList.add('nav-open');
  });
});
function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  body.classList.remove('nav-open');
  setTimeout(() => { lightboxImage.src = ''; }, 250);
}
lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLightbox();
});

// Smooth anchor transitions without requiring a framework.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
  });
});
