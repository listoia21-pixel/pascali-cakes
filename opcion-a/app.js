(() => {
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = 'https://wa.me/573247900026';

  /* Hero: slow crossfade, each column on its own clock */
  const cols = [...document.querySelectorAll('[data-cycle]')];
  cols.forEach((col) => {
    const imgs = [...col.querySelectorAll('img')];
    imgs[0].classList.add('is-on');
  });
  if (!reduce) {
    let timers = [];
    const start = () => {
      timers = cols.map((col, c) => {
        const imgs = [...col.querySelectorAll('img')];
        let i = 0;
        return setTimeout(function tick() {
          imgs[i].classList.remove('is-on');
          i = (i + 1) % imgs.length;
          imgs[i].classList.add('is-on');
          timers[c] = setTimeout(tick, 5600);
        }, 4200 + c * 1400);
      });
    };
    const stop = () => timers.forEach(clearTimeout);
    start();
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }

  /* Phone menu */
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('menu');
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.textContent = open ? 'Menú' : 'Cerrar';
    menu.classList.toggle('is-open', !open);
  });
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = 'Menú'; menu.classList.remove('is-open'); }
  });

  /* Section entrances, staggered within each section */
  // Whatever arrives on screen together is staggered together, 80ms apart
  const reveal = (els) => els.forEach((el, k) => {
    el.style.setProperty('--d', `${Math.min(k, 5) * 80}ms`);
    el.classList.add('in');
    io.unobserve(el);
  });
  const io = new IntersectionObserver((entries) => {
    reveal(entries.filter((en) => en.isIntersecting).map((en) => en.target));
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
  // Fallback for jumps (anchor links, fast scrolls): anything already above the fold line shows
  let pending = false;
  const sweep = () => {
    pending = false;
    const line = innerHeight * 0.96;
    reveal([...document.querySelectorAll('[data-reveal]:not(.in), [data-lift]:not(.in), .verb:not(.in)')].filter((el) => el.getBoundingClientRect().top < line));
  };
  window.addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(sweep); } }, { passive: true });
  document.querySelectorAll('[data-reveal], [data-lift], .verb').forEach((el) => io.observe(el));

  /* Dock on phones, after the hero */
  const dock = document.querySelector('.dock');
  const hero = document.querySelector('.hero');
  const foot = document.querySelector('.foot');
  let heroGone = false, footIn = false, goingUp = false, lastY = window.scrollY;
  const setDock = () => dock.classList.toggle('is-on', heroGone && !footIn && goingUp);
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (Math.abs(y - lastY) > 8) { goingUp = y < lastY; lastY = y; setDock(); }
  }, { passive: true });
  new IntersectionObserver(([en]) => { heroGone = !en.isIntersecting; setDock(); }).observe(hero);
  new IntersectionObserver(([en]) => { footIn = en.isIntersecting; setDock(); }).observe(foot);

  /* Gallery: drag to scroll, lightbox */
  const strip = document.querySelector('.strip');
  let down = null, moved = false;
  strip.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = { x: e.clientX, left: strip.scrollLeft }; moved = false;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - down.x;
    if (Math.abs(dx) > 6) { moved = true; strip.classList.add('is-drag'); }
    strip.scrollLeft = down.left - dx;
  });
  window.addEventListener('pointerup', () => { down = null; setTimeout(() => strip.classList.remove('is-drag'), 0); });
  strip.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { strip.scrollBy({ left: 260, behavior: 'smooth' }); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -260, behavior: 'smooth' }); e.preventDefault(); }
  });

  const frames = [...document.querySelectorAll('.frame')];
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCap = document.getElementById('lb-cap');
  let cur = 0;
  const show = (i) => {
    cur = (i + frames.length) % frames.length;
    const f = frames[cur];
    lbImg.src = f.getAttribute('href');
    lbImg.alt = f.dataset.cap;
    lbCap.textContent = f.dataset.cap;
    const fig = lb.querySelector('figure');
    fig.style.animation = 'none'; void fig.offsetWidth; fig.style.animation = '';
  };
  frames.forEach((f, i) => f.addEventListener('click', (e) => {
    if (moved || typeof lb.showModal !== 'function') { if (moved) e.preventDefault(); return; }
    e.preventDefault(); show(i); lb.showModal();
  }));
  lb.addEventListener('click', (e) => {
    const act = e.target.closest('[data-lb]')?.dataset.lb;
    if (act === 'close' || e.target === lb) lb.close();
    if (act === 'next') show(cur + 1);
    if (act === 'prev') show(cur - 1);
  });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(cur + 1);
    if (e.key === 'ArrowLeft') show(cur - 1);
  });

  /* Bodas tabs */
  const bodas = [
    { img: 'boda-cathy-steven', title: 'Para 60 invitados', alt: 'Pastel de boda de dos pisos con rosas de crema y monograma dorado S y C, en un jardín de Llanogrande',
      text: 'Viajamos a Llanogrande para entregarlo en Zona E: dos pisos con rosas de crema, perlas y el monograma dorado de los novios.' },
    { img: 'boda-valentina-nick', title: 'Un año planeándolo', alt: 'Pastel de boda alto y blanco de líneas limpias con flores blancas',
      text: 'Empezamos a diseñarlo con un año de anticipación. Un pastel alto y blanco, de líneas limpias, para una boda pensada con calma.' },
    { img: 'boda-sofi-uvas', title: 'Uvas verdes y crema', alt: 'Pareja de novios cortando un pastel rectangular decorado con uvas verdes y kisses de crema',
      text: 'Una cuadrícula de kisses de crema con uvas verdes. Sofi sabía exactamente el tamaño y la decoración que quería para su boda campestre.' },
    { img: 'vintage-la-boda-intima', title: 'Una boda íntima', alt: 'Pastel vintage blanco con borlas de crema y las iniciales L y A',
      text: 'Vintage de 15 porciones, con borlas de crema, las iniciales de los novios y la fecha escrita a mano.' },
  ];
  const tabs = [...document.querySelectorAll('[data-boda]')];
  const bImg = document.getElementById('boda-img');
  const bPanel = document.getElementById('boda-panel');
  const bTitle = document.getElementById('boda-title');
  const bText = document.getElementById('boda-text');
  bodas.forEach((b) => { const p = new Image(); p.src = `../assets/fotos/${b.img}.webp`; });
  const pick = (i, focus) => {
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
    if (focus) tabs[i].focus();
    bPanel.setAttribute('aria-labelledby', tabs[i].id);
    const b = bodas[i];
    bImg.classList.add('is-out');
    setTimeout(() => { bImg.src = `../assets/fotos/${b.img}.webp`; bImg.alt = b.alt; bImg.classList.remove('is-out'); }, reduce ? 0 : 260);
    bTitle.textContent = b.title; bText.textContent = b.text;
    bPanel.classList.remove('is-swap'); void bPanel.offsetWidth; bPanel.classList.add('is-swap');
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(i));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') pick((i + 1) % tabs.length, true);
      if (e.key === 'ArrowLeft') pick((i - 1 + tabs.length) % tabs.length, true);
    });
  });

  /* Order builder */
  const form = document.getElementById('pedido-form');
  const fecha = document.getElementById('fecha');
  const verdict = document.getElementById('ticket-verdict');
  const msg = document.getElementById('ticket-msg');
  const tImg = document.getElementById('ticket-img');
  const waText = document.getElementById('wa-text');
  const DAY = 86400000;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const nice = (d) => d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  const earliest = new Date(today.getTime() + 7 * DAY);
  fecha.min = iso(today);

  const list = (arr) => arr.length < 2 ? arr.join('') : `${arr.slice(0, -1).join(', ')} y ${arr[arr.length - 1]}`;
  let lastImg = tImg.getAttribute('src');

  const update = () => {
    const fd = new FormData(form);
    const ocasion = fd.get('ocasion');
    const estilo = fd.get('estilo');
    const colores = fd.getAll('color');
    const porciones = fd.get('porciones');
    const dedic = (fd.get('dedicatoria') || '').trim();
    const f = fecha.value ? new Date(`${fecha.value}T00:00:00`) : null;

    let line = `Hola Pascali, quiero un pastel de ${ocasion === 'Un regalo' ? 'regalo' : ocasion.toLowerCase()} estilo ${estilo.toLowerCase()}`;
    if (colores.length) line += ` con flores en tonos ${list(colores)}`;
    line += `, para ${porciones} porciones`;
    if (f) line += `, para el ${nice(f)}`;
    line += '.';
    if (dedic) line += ` Que diga: «${dedic}».`;
    msg.textContent = line;
    waText.value = line;

    verdict.classList.remove('is-warn');
    if (!f) {
      verdict.textContent = `Elige la fecha. La más próxima que alcanzamos: ${nice(earliest)}.`;
    } else {
      const days = Math.round((f - today) / DAY);
      if (days < 7) {
        verdict.textContent = 'Es en menos de una semana. Escríbenos y revisamos si nos alcanza la agenda.';
        verdict.classList.add('is-warn');
      } else if (f.getDay() === 0) {
        verdict.textContent = 'Los domingos no hacemos envíos. Escríbenos y coordinamos la entrega el sábado o el lunes.';
        verdict.classList.add('is-warn');
      } else if (ocasion === 'Boda' && days < 30) {
        verdict.textContent = 'Para bodas recomendamos un mes. Escríbenos ya para apartar la fecha.';
        verdict.classList.add('is-warn');
      } else {
        verdict.textContent = `Hay tiempo de sobra: faltan ${days} días.`;
      }
    }

    const chosen = form.querySelector('input[name="estilo"]:checked').dataset.img;
    const src = `../assets/fotos/${chosen}.webp`;
    if (src !== lastImg) {
      lastImg = src;
      tImg.classList.add('is-out');
      setTimeout(() => { tImg.src = src; tImg.alt = `Ejemplo de pastel estilo ${estilo.toLowerCase()}`; tImg.classList.remove('is-out'); }, reduce ? 0 : 220);
    }
  };
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    update();
    window.open(`${WA}?text=${encodeURIComponent(waText.value)}`, '_blank', 'noopener');
  });
  fecha.required = false;
  update();
})();
