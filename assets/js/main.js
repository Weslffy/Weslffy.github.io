/* =========================================================
 * Weslffy.github.io · Interactions
 *  - Boot loader
 *  - Particle background (with mouse interaction)
 *  - Custom cursor
 *  - Typewriter
 *  - Scroll reveal / nav highlight / back-to-top
 *  - Theme toggle (persisted in localStorage)
 *  - Animated number counters
 *  - Card 3D tilt
 * ======================================================= */

(() => {
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle ---------- */
  const themeToggle = $('#themeToggle');
  const savedTheme  = localStorage.getItem('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
  themeToggle?.addEventListener('click', () => {
    const cur  = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    refreshParticleColors();
  });

  /* ---------- Current year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Boot loader ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => $('#loader')?.classList.add('hide'), 450);
  });

  /* ---------- Custom cursor ---------- */
  const dot  = $('.cursor-dot');
  const ring = $('.cursor-ring');
  if (dot && ring && window.matchMedia('(hover: hover)').matches) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });
    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const hoverables = 'a, button, [data-tilt], .chip';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverables)) ring.classList.add('hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverables)) ring.classList.remove('hover');
    });
  }

  /* ---------- Spotlight that follows the cursor on buttons ---------- */
  $$('.btn').forEach(b => {
    b.addEventListener('mousemove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100) + '%');
      b.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100) + '%');
    });
  });

  /* ---------- Typewriter ---------- */
  const tw = $('#typewriter');
  if (tw) {
    const words = [
      'whoami → Weslffy',
      'building cool stuff on the web',
      'turning coffee into code ☕',
      'open source enthusiast',
      'always shipping, never stopping',
    ];
    let i = 0, j = 0, deleting = false;
    const type = () => {
      const w = words[i];
      tw.textContent = w.slice(0, j);
      if (!deleting && j < w.length) {
        j++;
        setTimeout(type, 60 + Math.random() * 40);
      } else if (deleting && j > 0) {
        j--;
        setTimeout(type, 28);
      } else {
        if (!deleting) setTimeout(() => { deleting = true; type(); }, 1500);
        else { deleting = false; i = (i + 1) % words.length; setTimeout(type, 220); }
      }
    };
    type();
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
        if (e.target.classList.contains('kpi')) animateCount(e.target.querySelector('.num'));
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- Animated number counter ---------- */
  function animateCount(el) {
    if (!el) return;
    const raw    = el.dataset.raw ?? el.dataset.count;
    const target = parseInt(raw, 10);
    const label  = el.dataset.count;
    if (Number.isNaN(target)) { el.textContent = label || '∞'; return; }
    const dur = 1400;
    const t0  = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.floor(target * eased);
      el.textContent = (label === '∞' && p === 1) ? '∞' : v;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Nav: scrolled state + active section highlight ---------- */
  const nav = $('#nav');
  const links = $$('.nav-links a');
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const toTop = $('#toTop');

  function onScroll() {
    const y = window.scrollY;
    nav?.classList.toggle('scrolled', y > 30);
    toTop?.classList.toggle('show', y > 480);

    let activeIdx = 0;
    const probe = y + window.innerHeight * 0.35;
    sections.forEach((s, idx) => { if (s.offsetTop <= probe) activeIdx = idx; });
    links.forEach((a, i) => a.classList.toggle('active', i === activeIdx));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Card 3D tilt ---------- */
  $$('[data-tilt], .proj, .skill, .stat-card, .about-card, .kpi').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `translateY(-4px) perspective(900px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*5).toFixed(2)}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ---------- Particle background ---------- */
  const canvas = $('#bg-canvas');
  const ctx = canvas?.getContext('2d');
  let particles = [];
  let mouse = { x: -9999, y: -9999 };
  let dpr  = Math.min(window.devicePixelRatio || 1, 2);
  let palette = ['#00e5ff', '#b14bff', '#ff4d8d'];

  function refreshParticleColors() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    palette = isLight
      ? ['#0096c8', '#7a3ad6', '#ff4d8d']
      : ['#00e5ff', '#b14bff', '#ff4d8d'];
  }
  refreshParticleColors();

  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
    spawn();
  }
  function spawn() {
    const area = window.innerWidth * window.innerHeight;
    const count = Math.min(110, Math.max(40, Math.floor(area / 18000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - .5) * 0.25 * dpr,
      vy: (Math.random() - .5) * 0.25 * dpr,
      r: (Math.random() * 1.6 + 0.6) * dpr,
      c: palette[Math.floor(Math.random() * palette.length)],
    }));
  }

  function step() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const linkDist = 130 * dpr;
    const mouseDist = 160 * dpr;
    const mx = mouse.x * dpr, my = mouse.y * dpr;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      // Mouse attraction
      const dxm = mx - p.x, dym = my - p.y;
      const dm  = Math.hypot(dxm, dym);
      if (dm < mouseDist) {
        const f = (1 - dm / mouseDist) * 0.06;
        p.vx += (dxm / dm) * f;
        p.vy += (dym / dm) * f;
      }
      // Damping
      p.vx *= 0.985; p.vy *= 0.985;
      // Keep particles from stalling out
      if (Math.abs(p.vx) < 0.02 * dpr) p.vx += (Math.random() - .5) * 0.04 * dpr;
      if (Math.abs(p.vy) < 0.02 * dpr) p.vy += (Math.random() - .5) * 0.04 * dpr;

      ctx.beginPath();
      ctx.fillStyle = p.c;
      ctx.globalAlpha = 0.85;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.hypot(dx, dy);
        if (d < linkDist) {
          ctx.globalAlpha = (1 - d / linkDist) * 0.35;
          ctx.strokeStyle = p.c;
          ctx.lineWidth = 0.5 * dpr;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(step);
  }

  if (canvas && !prefersReduced) {
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
    resize();
    step();
  }

  /* ---------- Console easter egg ---------- */
  console.log(
    '%c Hi there 👋 %c Welcome to Weslffy.github.io ',
    'background:linear-gradient(90deg,#00e5ff,#b14bff);color:#0a0a14;font-weight:700;padding:6px 8px;border-radius:6px 0 0 6px;',
    'background:#0a0a14;color:#00e5ff;padding:6px 10px;border-radius:0 6px 6px 0;border:1px solid #00e5ff;'
  );
  console.log('%cIf you are reading this, you have great taste in DevTools. ⌘+⌥+I', 'color:#8a93a6;font-style:italic;');
})();
