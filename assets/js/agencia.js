const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.nav-links');

const setMenu = (open) => {
  if (!toggle || !menu) return;
  menu.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
};

toggle?.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
window.addEventListener('scroll', () => header?.classList.toggle('is-scrolled', window.scrollY > 12), { passive: true });

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-reveal]').forEach((item) => observer.observe(item));
} else {
  document.querySelectorAll('[data-reveal]').forEach((item) => item.classList.add('is-visible'));
}

const contactForm = document.querySelector('#contacto-agencia');
contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const email = contactForm.dataset.email;
  const subject = `Solicitud Gama Consultores · ${data.get('interes')}`;
  const body = [
    `Nombre: ${data.get('nombre')}`,
    `Teléfono: ${data.get('telefono') || 'No indicado'}`,
    `Correo: ${data.get('correo')}`,
    '',
    'Quiero resolver:',
    data.get('mensaje')
  ].join('\n');
  window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

/* ===== Carrusel de testimonios: 2 a la vez, lento ===== */
(function () {
  const carousel = document.querySelector('.testimonial-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.testimonial-track');
  const cards = Array.from(track.children);
  const dotsBox = carousel.querySelector('.t-dots');
  const AUTOPLAY_MS = 7000; // sube este número para hacerlo aún más lento
  const GAP = 24;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let perView = 2;
  let page = 0;
  let pages = 1;
  let timer = null;
  let hovering = false;

  function measure() {
    perView = window.matchMedia('(max-width: 760px)').matches ? 1 : 2;
    pages = Math.ceil(cards.length / perView);
    if (page >= pages) page = 0;

    dotsBox.innerHTML = '';
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 't-dot';
      d.setAttribute('aria-label', 'Ir a la página ' + (i + 1));
      d.addEventListener('click', () => { go(i); restart(); });
      dotsBox.appendChild(d);
    }
    render();
  }

  function render() {
    // el último grupo nunca deja huecos vacíos
    const first = Math.max(0, Math.min(page * perView, cards.length - perView));
    const step = cards[0].offsetWidth + GAP;
    track.style.transform = 'translateX(' + -first * step + 'px)';

    cards.forEach((c, i) =>
      c.classList.toggle('is-active', i >= first && i < first + perView)
    );
    Array.from(dotsBox.children).forEach((d, i) =>
      d.classList.toggle('is-active', i === page)
    );
  }

  function go(p) {
    page = (p + pages) % pages;
    render();
  }

  function start() {
    if (reduceMotion || timer) return;
    timer = setInterval(() => { if (!hovering) go(page + 1); }, AUTOPLAY_MS);
  }
  function stop() { clearInterval(timer); timer = null; }
  function restart() { stop(); start(); }

  carousel.querySelector('.t-next').addEventListener('click', () => { go(page + 1); restart(); });
  carousel.querySelector('.t-prev').addEventListener('click', () => { go(page - 1); restart(); });

  carousel.addEventListener('mouseenter', () => (hovering = true));
  carousel.addEventListener('mouseleave', () => (hovering = false));
  carousel.addEventListener('focusin', () => (hovering = true));
  carousel.addEventListener('focusout', () => (hovering = false));

  // deslizar con el dedo / mouse
  let startX = null;
  track.addEventListener('pointerdown', (e) => { startX = e.clientX; });
  track.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 50) { go(page + (dx < 0 ? 1 : -1)); restart(); }
    startX = null;
  });

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(measure, 150);
  });

  measure();
  start();
})();