/* =========================================================
   Mohammed Fajel Jaseem — Portfolio
   Interactions: preloader, cursor, particle hero, scroll
   reveals, counters, nav, project filtering, spotlight.
   ========================================================= */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const $  = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

  /* ---------------------------------------------------------
     1. Preloader
     --------------------------------------------------------- */
  const preloader = $('#preloader');
  const bar = $('.preloader__bar span');
  function runPreloader() {
    if (!preloader) return;
    if (reduceMotion) { finish(); return; }
    let p = 0;
    const tick = setInterval(() => {
      p += Math.random() * 18 + 6;
      if (p >= 100) { p = 100; clearInterval(tick); setTimeout(finish, 250); }
      if (bar) bar.style.width = p + '%';
    }, 130);
    function finish() {
      preloader.classList.add('is-done');
      document.body.style.overflow = '';
      kickHeroReveals();
    }
  }
  // lock scroll briefly during load
  document.body.style.overflow = 'hidden';
  window.addEventListener('load', runPreloader);
  // safety: never trap the user
  setTimeout(() => { preloader && preloader.classList.add('is-done'); document.body.style.overflow = ''; }, 4000);

  function kickHeroReveals() {
    $$('.hero .reveal').forEach(el => el.classList.add('in-view'));
  }

  /* ---------------------------------------------------------
     2. Custom cursor
     --------------------------------------------------------- */
  if (!isTouch) {
    const dot = $('#cursorDot');
    const ring = $('#cursorRing');
    let mx = innerWidth / 2, my = innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });

    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();

    document.addEventListener('mouseover', e => {
      if (e.target.closest('[data-cursor="hover"]')) {
        ring.classList.add('is-hover'); dot.classList.add('is-hover');
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest('[data-cursor="hover"]')) {
        ring.classList.remove('is-hover'); dot.classList.remove('is-hover');
      }
    });
    document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = ring.style.opacity = '1'; });
  }

  /* ---------------------------------------------------------
     3. Hero particle network
     --------------------------------------------------------- */
  const canvas = $('#heroCanvas');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, particles = [], raf, running = true;
    const mouse = { x: null, y: null, r: 150 };

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      const count = Math.min(110, Math.floor((w * h) / 13000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 1.6 + 0.6
      }));
    }

    const LINK = 130;
    function draw() {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // gentle mouse repulsion
        if (mouse.x !== null) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < mouse.r) {
            const f = (mouse.r - d) / mouse.r;
            p.x += (dx / d) * f * 1.6;
            p.y += (dy / d) * f * 1.6;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(120, 190, 255, 0.8)';
        ctx.fill();

        // links
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            const a = (1 - d / LINK) * 0.35;
            ctx.strokeStyle = `rgba(90, 160, 255, ${a})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }

        // link to cursor
        if (mouse.x !== null) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < mouse.r) {
            const a = (1 - d / mouse.r) * 0.5;
            ctx.strokeStyle = `rgba(58, 214, 255, ${a})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }

    const hero = $('#home');
    hero.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
    });
    hero.addEventListener('mouseleave', () => { mouse.x = mouse.y = null; });

    window.addEventListener('resize', size);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); running = false; }
      else if (!running) { running = true; draw(); }
    });

    size();
    draw();
  }

  /* ---------------------------------------------------------
     4. Scroll progress + nav state
     --------------------------------------------------------- */
  const nav = $('#nav');
  const progress = $('#scrollProgress');
  function onScroll() {
    const st = window.scrollY;
    const docH = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = (docH > 0 ? (st / docH) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('is-scrolled', st > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     5. Mobile nav
     --------------------------------------------------------- */
  const toggle = $('#navToggle');
  if (toggle) {
    toggle.addEventListener('click', () => nav.classList.toggle('is-open'));
    $$('#navLinks a').forEach(a => a.addEventListener('click', () => nav.classList.remove('is-open')));
  }

  /* ---------------------------------------------------------
     6. Reveal on scroll
     --------------------------------------------------------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ---------------------------------------------------------
     7. Stat counters
     --------------------------------------------------------- */
  const counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        animateCount(en.target);
        cio.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(c => cio.observe(c));
  } else {
    counters.forEach(c => c.textContent = c.dataset.count + (c.dataset.suffix || ''));
  }
  function animateCount(el) {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const dur = 1500; const start = performance.now();
    (function step(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }

  /* ---------------------------------------------------------
     8. Active section in nav
     --------------------------------------------------------- */
  const navLinks = $$('#navLinks a[href^="#"]');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const id = '#' + en.target.id;
          navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === id));
        }
      });
    }, { threshold: 0.5, rootMargin: '-20% 0px -50% 0px' });
    sections.forEach(s => sio.observe(s));
  }

  /* ---------------------------------------------------------
     9. Project filtering
     --------------------------------------------------------- */
  const filters = $$('#filters .filter');
  const projects = $$('#projects .project');
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const f = btn.dataset.filter;
      projects.forEach(p => {
        const match = f === 'all' || p.dataset.category.includes(f);
        p.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ---------------------------------------------------------
     10. Project video popup
     Video filenames match the visible project titles.
     --------------------------------------------------------- */
  const videoModal = $('#videoModal');
  const projectVideo = $('#projectVideo');
  const videoModalTitle = $('#videoModalTitle');
  const closeVideoButtons = $$('.video-modal__close, .video-modal__backdrop');

  projects.forEach(project => {
    project.setAttribute('tabindex', '0');
    project.setAttribute('role', 'button');
    prepareProjectThumbnail(project);
    const open = () => openProjectVideo(project);
    project.addEventListener('click', open);
    project.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  function getProjectVideo(project) {
    if (project._videoCheck) return project._videoCheck;
    const title = $('.project__title', project).textContent.trim();
    const src = `videos/${title}.mp4`;
    project._videoCheck = fetch(src, { method: 'HEAD' })
      .then(response => response.ok ? src : null)
      .catch(() => null);
    return project._videoCheck;
  }

  async function prepareProjectThumbnail(project) {
    const src = await getProjectVideo(project);
    if (!src || project.querySelector('.project__thumbnail')) return;

    const thumbnail = document.createElement('div');
    thumbnail.className = 'project__thumbnail';
    thumbnail.innerHTML = `
      <video muted playsinline preload="auto" aria-hidden="true"></video>
      <span class="project__thumbnail-play" aria-hidden="true">▶</span>
    `;
    const preview = $('video', thumbnail);
    preview.src = src;
    preview.addEventListener('loadedmetadata', () => {
      const previewTime = Number.isFinite(preview.duration)
        ? Math.min(0.35, Math.max(0, preview.duration * 0.05))
        : 0.1;
      preview.currentTime = previewTime;
    }, { once: true });
    preview.addEventListener('seeked', () => preview.pause(), { once: true });
    project.prepend(thumbnail);
    project.classList.add('has-video');
  }

  async function openProjectVideo(project) {
    if (!videoModal || !projectVideo) return;
    const title = $('.project__title', project).textContent.trim();
    const src = await getProjectVideo(project);
    videoModalTitle.textContent = title;
    videoModal.classList.remove('has-video');
    projectVideo.removeAttribute('src');
    projectVideo.load();
    videoModal.classList.add('is-open');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    $('.video-modal__close').focus();

    try {
      if (!src || !videoModal.classList.contains('is-open')) return;
      projectVideo.src = src;
      videoModal.classList.add('has-video');
      projectVideo.play().catch(() => {});
    } catch {}
  }

  function closeProjectVideo() {
    if (!videoModal) return;
    videoModal.classList.remove('is-open', 'has-video');
    videoModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    projectVideo.pause();
    projectVideo.removeAttribute('src');
    projectVideo.load();
  }

  closeVideoButtons.forEach(button => button.addEventListener('click', closeProjectVideo));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && videoModal?.classList.contains('is-open')) closeProjectVideo();
  });

  /* ---------------------------------------------------------
     11. Card / project spotlight (cursor-follow glow)
     --------------------------------------------------------- */
  if (!isTouch) {
    $$('.card--spotlight').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------------------------------------------------------
     12. Copy email + toast
     --------------------------------------------------------- */
  const copyBtn = $('#copyEmail');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        showToast('Email copied to clipboard');
      } catch {
        showToast(email);
      }
    });
  }
  let toastEl;
  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    requestAnimationFrame(() => toastEl.classList.add('is-visible'));
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove('is-visible'), 2400);
  }

  /* ---------------------------------------------------------
     13. Footer year
     --------------------------------------------------------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

})();
