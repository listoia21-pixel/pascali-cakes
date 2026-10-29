(() => {
  document.documentElement.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desk = window.matchMedia('(min-width: 901px)');
  const WA = 'https://wa.me/573247900026';

  /* Mosaic: the big tile changes its cake every few seconds */
  const cyc = document.querySelector('[data-cycle]');
  if (cyc && !reduce) {
    const imgs = [...cyc.querySelectorAll('img')];
    let i = 0, t;
    const tick = () => { imgs[i].classList.remove('is-on'); i = (i + 1) % imgs.length; imgs[i].classList.add('is-on'); t = setTimeout(tick, 5200); };
    t = setTimeout(tick, 4200);
    document.addEventListener('visibilitychange', () => { clearTimeout(t); if (!document.hidden) t = setTimeout(tick, 4200); });
  }

  /* The stage follows the reading column */
  const slides = [...document.querySelectorAll('[data-slide]')];
  const show = (n) => slides.forEach((s) => s.classList.toggle('is-on', s.dataset.slide === String(n)));
  const stageIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting && desk.matches) show(en.target.dataset.stage); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  document.querySelectorAll('[data-stage]').forEach((s) => stageIO.observe(s));

  /* Weddings: the list drives the stage */
  const couples = [...document.querySelectorAll('.couples button')];
  const stageImg = document.getElementById('stage-boda');
  const phoneImg = document.getElementById('phone-boda');
  couples.forEach((b) => { const p = new Image(); p.src = `assets/hd/${b.dataset.img}.webp`; });
  couples.forEach((b) => b.addEventListener('click', () => {
    couples.forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
    const src = `assets/hd/${b.dataset.img}.webp`;
    const plate = stageImg.parentElement;
    if (!reduce) { plate.classList.add('is-swap'); void plate.offsetWidth; }
    stageImg.src = src;
    requestAnimationFrame(() => plate.classList.remove('is-swap'));
    phoneImg.src = `assets/hd/sm/${b.dataset.img}.webp`; phoneImg.alt = b.dataset.alt;
    if (desk.matches) show(2);
  }));

  /* Entrances: what arrives together is staggered together */
  const reveal = (els) => els.forEach((el, k) => {
    el.style.setProperty('--d', `${Math.min(k, 5) * 80}ms`);
    el.classList.add('in');
    io.unobserve(el);
  });
  const io = new IntersectionObserver((entries) => {
    reveal(entries.filter((en) => en.isIntersecting).map((en) => en.target));
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
  document.querySelectorAll('[data-reveal], .visit').forEach((el) => io.observe(el));
  let pending = false;
  const sweep = () => {
    pending = false;
    const line = innerHeight * 0.96;
    reveal([...document.querySelectorAll('[data-reveal]:not(.in), .visit:not(.in)')].filter((el) => el.getBoundingClientRect().top < line));
  };
  window.addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(sweep); } }, { passive: true });

  /* Phone dock: shown when scrolling back up, never over the footer */
  const dock = document.querySelector('.dock');
  let past = false, footIn = false, up = false, lastY = scrollY;
  const setDock = () => dock.classList.toggle('is-on', past && up && !footIn);
  new IntersectionObserver(([en]) => { past = !en.isIntersecting; setDock(); }).observe(document.querySelector('.open'));
  new IntersectionObserver(([en]) => { footIn = en.isIntersecting; setDock(); }).observe(document.querySelector('.quiet'));
  window.addEventListener('scroll', () => {
    const y = scrollY;
    if (Math.abs(y - lastY) > 8) { up = y < lastY; lastY = y; setDock(); }
  }, { passive: true });

  /* Gallery: drag with the mouse, arrows from the keyboard, lightbox */
  const row = document.querySelector('.row');
  let down = null, moved = false;
  row.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = { x: e.clientX, left: row.scrollLeft }; moved = false;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - down.x;
    if (Math.abs(dx) > 6) { moved = true; row.classList.add('is-drag'); }
    row.scrollLeft = down.left - dx;
  });
  window.addEventListener('pointerup', () => { down = null; setTimeout(() => row.classList.remove('is-drag'), 0); });
  row.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { row.scrollBy({ left: 320, behavior: 'smooth' }); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { row.scrollBy({ left: -320, behavior: 'smooth' }); e.preventDefault(); }
  });

  const all = [...document.querySelectorAll('.frame')];
  let frames = all;
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCap = document.getElementById('lb-cap');
  let cur = 0;
  const open = (i) => {
    cur = (i + frames.length) % frames.length;
    const f = frames[cur];
    lbImg.src = f.getAttribute('href'); lbImg.alt = f.dataset.cap; lbCap.textContent = f.dataset.cap;
    const fig = lb.querySelector('figure');
    fig.style.animation = 'none'; void fig.offsetWidth; fig.style.animation = '';
  };
  all.forEach((f) => f.addEventListener('click', (e) => {
    if (moved) { e.preventDefault(); return; }
    if (typeof lb.showModal !== 'function') return;
    e.preventDefault(); open(frames.indexOf(f)); lb.showModal();
  }));

  /* Themes: filter the row and rebuild its modules (tall, pair, tall…) */
  const temas = JSON.parse(document.getElementById('temas-data').textContent);
  const track = document.querySelector('.row__track');
  const filterBtns = [...document.querySelectorAll('[data-tema]')];
  const temaD = document.getElementById('tema-d');
  const temaGo = document.getElementById('tema-go');
  const temaCount = document.getElementById('tema-count');
  const introD = temaD.textContent;
  let current = 'todas';
  const build = (list) => {
    track.textContent = '';
    for (let i = 0, tall = true; i < list.length; tall = !tall) {
      const li = document.createElement('li');
      const n = tall || i === list.length - 1 ? 1 : 2;
      li.className = `mod ${n === 1 ? 'mod--tall' : 'mod--pair'}`;
      list.slice(i, i + n).forEach((f) => li.append(f));
      track.append(li);
      i += n;
    }
  };
  const filter = (key) => {
    current = key;
    filterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tema === key)));
    frames = key === 'todas' ? all : all.filter((f) => f.dataset.temas.split(' ').includes(key));
    const swap = () => {
      build(frames);
      row.scrollLeft = 0;
      temaCount.textContent = frames.length;
      temaD.textContent = key === 'todas' ? introD : temas[key].d;
      temaGo.textContent = key === 'todas' ? 'Quiero uno así' : `Quiero algo ${key === 'boda' ? 'para mi boda' : 'así'}`;
      track.classList.remove('is-out');
    };
    if (reduce) swap();
    else { track.classList.add('is-out'); setTimeout(swap, 260); }
  };
  filterBtns.forEach((b) => b.addEventListener('click', () => filter(b.dataset.tema)));
  lb.addEventListener('click', (e) => {
    const act = e.target.closest('[data-lb]')?.dataset.lb;
    if (act === 'close' || e.target === lb) lb.close();
    if (act === 'next') open(cur + 1);
    if (act === 'prev') open(cur - 1);
  });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') open(cur + 1);
    if (e.key === 'ArrowLeft') open(cur - 1);
  });

  /* The slip: a receipt with a cut edge that prints the order as it is chosen */
  const slip = document.querySelector('.slip');
  const zig = () => {
    const teeth = Math.max(12, Math.round(slip.offsetWidth / 22));
    const pts = ['0 0', '100% 0', '100% calc(100% - 12px)'];
    for (let k = teeth; k > 0; k--) {
      pts.push(`${((k - 0.5) / teeth * 100).toFixed(2)}% 100%`, `${((k - 1) / teeth * 100).toFixed(2)}% calc(100% - 12px)`);
    }
    slip.style.clipPath = `polygon(${pts.join(',')})`;
  };
  zig();
  window.addEventListener('resize', zig);

  const form = document.getElementById('pedido-form');
  const fecha = document.getElementById('fecha');
  const $ = (id) => document.getElementById(id);
  const DAY = 86400000;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const short = (d) => d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
  const long = (d) => d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  const list = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} y ${a[a.length - 1]}`);
  fecha.min = iso(today);
  $('s-hoy').textContent = short(today);

  const put = (id, val) => {
    const el = $(id);
    if (el.textContent === val) return;
    el.textContent = val;
    if (reduce) return;
    el.classList.add('is-new');
    setTimeout(() => el.classList.remove('is-new'), 700);
  };

  const update = () => {
    const fd = new FormData(form);
    const ocasion = fd.get('ocasion');
    const estilo = fd.get('estilo');
    const colores = fd.getAll('color');
    const porciones = fd.get('porciones');
    const dedic = (fd.get('dedicatoria') || '').trim();
    const f = fecha.value ? new Date(`${fecha.value}T00:00:00`) : null;

    put('s-ocasion', { Regalo: 'Un regalo', Evento: 'Un evento' }[ocasion] || ocasion);
    put('s-estilo', estilo);
    put('s-flores', colores.length ? list(colores) : 'a tu gusto');
    put('s-porciones', porciones);
    $('s-dedic-row').hidden = !dedic;
    put('s-dedic', dedic ? `«${dedic}»` : '');
    $('s-total-l').textContent = ocasion === 'Boda' ? 'Entrega y montaje' : 'Entrega';
    put('s-total', f ? short(f) : 'elige la fecha');

    const v = $('s-verdict');
    if (!f) v.textContent = `La fecha más próxima que alcanzamos: ${long(new Date(today.getTime() + 7 * DAY))}.`;
    else {
      const days = Math.round((f - today) / DAY);
      if (days < 7) v.textContent = 'Es en menos de una semana. Escríbenos y revisamos si nos alcanza la agenda.';
      else if (f.getDay() === 0) v.textContent = 'Los domingos no hacemos envíos. Escríbenos y coordinamos la entrega el sábado o el lunes.';
      else if (ocasion === 'Boda' && days < 30) v.textContent = 'Para bodas recomendamos un mes. Escríbenos ya para apartar la fecha.';
      else v.textContent = `Hay tiempo de sobra: faltan ${days} días.`;
    }

    const para = { Regalo: 'de regalo', Evento: 'para un evento' }[ocasion] || `de ${ocasion.toLowerCase()}`;
    let line = `Hola Pascali, quiero un pastel ${para} estilo ${estilo.toLowerCase()}`;
    if (colores.length) line += ` con flores en tonos ${list(colores)}`;
    line += `, para ${porciones} porciones`;
    if (f) line += `, para el ${long(f)}`;
    line += '.';
    if (dedic) line += ` Que diga: «${dedic}».`;
    $('wa-text').value = line;
    zig();
  };
  temaGo.addEventListener('click', () => {
    const t = temas[current];
    if (t?.estilo) { const r = form.querySelector(`input[name="estilo"][value="${t.estilo}"]`); if (r) r.checked = true; }
    if (t?.ocasion) { const r = form.querySelector(`input[name="ocasion"][value="${t.ocasion}"]`); if (r) r.checked = true; }
    update();
  });
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    update();
    window.open(`${WA}?text=${encodeURIComponent($('wa-text').value)}`, '_blank', 'noopener');
  });
  update();
})();
