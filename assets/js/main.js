/* Sadiq Ali — Athletisimo International */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const WA_NUMBER = '971562624915';
  const EMAIL = 'sadiqalia105@gmail.com';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);

  $('[data-year]').textContent = new Date().getFullYear();

  /* ---------------- Smooth scroll ---------------- */
  let lenis = null;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText && hasGSAP) gsap.registerPlugin(SplitText);

  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  const navH = () => $('[data-nav]').offsetHeight;
  const scrollToTarget = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: target === 0 ? 0 : -navH() + 1, duration: 1.4 });
    else if (target === 0) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  /* ---------------- Mobile menu ---------------- */
  const burger = $('.burger');
  const menu = $('#menu');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false); });

  /* anchor links */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = id === '#top' ? 0 : $(id);
    if (el === null) return;
    e.preventDefault();
    if (document.body.classList.contains('menu-open')) setMenu(false);
    scrollToTarget(el);
    history.replaceState(null, '', id);
  }));

  /* ---------------- Nav state & progress ---------------- */
  const nav = $('[data-nav]');
  const bar = $('.progress span');
  const fab = $('.fab');
  const contact = $('#contact');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('is-scrolled', y > 30);
    nav.classList.toggle('is-hidden', y > 700 && y > lastY && !document.body.classList.contains('menu-open'));
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    const contactTop = contact.getBoundingClientRect().top;
    fab.classList.toggle('is-on', y > innerHeight * .8 && contactTop > innerHeight * .6);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* active nav link */
  const navLinks = $$('.nav__links a');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(l => { const s = $(l.getAttribute('href')); if (s) io.observe(s); });
  }

  /* ---------------- Statement words (built regardless of GSAP) ---------------- */
  const statement = $('[data-words]');
  if (statement && hasGSAP && !reduce) {
    statement.innerHTML = statement.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  }

  /* ---------------- Chart ---------------- */
  const chartData = [
    { t: 'Core endurance', s: 'Plank', b: 38, l: 120 },
    { t: 'Hip-up hold', s: 'Bridge', b: 180, l: 180 },
    { t: 'Push-up hold', s: 'Isometric', b: 65, l: 120 },
    { t: 'Lower-body hold', s: 'Boat pose', b: 35, l: 85 },
    { t: 'Wall squat hold', s: 'Isometric', b: 24, l: 85 },
  ];
  const plot = $('[data-chart]');
  const tip = plot && $('.chart__tip', plot.closest('.chart'));
  const MAX = 180;
  if (plot) {
    const ticks = [0, 60, 120, 180];
    const axis = `<div class="chart__axis" aria-hidden="true">${ticks.map(t => `<span style="left:${t / MAX * 100}%"><b>${t}s</b></span>`).join('')}</div>`;
    const rows = chartData.map((d, i) => {
      const pct = ((d.l - d.b) / d.b * 100);
      const chg = pct === 0 ? 'Maintained at max' : `+${pct.toFixed(1)}%`;
      return `<div class="c-row" tabindex="0" data-i="${i}" aria-label="${d.t}: baseline ${d.b} seconds, latest ${d.l} seconds, ${chg}">
        <div class="c-row__label">${d.t}<small>${d.s}</small></div>
        <div class="c-bars" aria-hidden="true">
          <div class="c-bar c-bar--base" style="--w:${d.b / MAX * 100}%"><i></i><b>${d.b}s</b></div>
          <div class="c-bar c-bar--latest" style="--w:${d.l / MAX * 100}%"><i></i><b>${d.l}s</b></div>
        </div>
      </div>`;
    }).join('');
    plot.innerHTML = axis + rows;

    const chartEl = plot.closest('.chart');
    const showTip = (row, clientX) => {
      const d = chartData[row.dataset.i];
      const pct = ((d.l - d.b) / d.b * 100);
      tip.innerHTML = `<strong>${d.t} <span style="color:var(--muted);font-weight:400">· ${d.s}</span></strong>
        <div><span class="sw sw--base"></span><span>Baseline</span><span>${d.b} s</span></div>
        <div><span class="sw sw--latest"></span><span>Latest</span><span>${d.l} s</span></div>
        <div class="chg"><span>Change</span><span>${pct === 0 ? 'Maintained' : '+' + pct.toFixed(1) + '%'}</span></div>`;
      const cRect = chartEl.getBoundingClientRect();
      const rRect = row.getBoundingClientRect();
      const tw = tip.offsetWidth || 200;
      let x = (clientX ?? (rRect.left + rRect.width / 2)) - cRect.left - tw / 2;
      x = Math.max(12, Math.min(x, cRect.width - tw - 12));
      tip.style.left = x + 'px';
      tip.style.top = (rRect.bottom - cRect.top + 6) + 'px';
      tip.classList.add('is-on');
      $$('.c-row', plot).forEach(r => r.classList.toggle('is-dim', r !== row));
    };
    const hideTip = () => { tip.classList.remove('is-on'); $$('.c-row', plot).forEach(r => r.classList.remove('is-dim')); };
    $$('.c-row', plot).forEach(row => {
      row.addEventListener('pointermove', e => showTip(row, e.clientX));
      row.addEventListener('pointerleave', hideTip);
      row.addEventListener('focus', () => showTip(row));
      row.addEventListener('blur', hideTip);
    });
  }

  /* ---------------- Four-week outcomes chart ---------------- */
  const weeks = [
    { w: 'Week 1', v: [0.5, 1, 1.2] },
    { w: 'Week 2', v: [2.5, 2.7, 3.4] },
    { w: 'Week 3', v: [8, 5, 7.3] },
    { w: 'Week 4', v: [9, 7, 7.3] },
  ];
  const series = ['Energy', 'Strength', 'Endurance'];
  const wk = $('[data-weeks]');
  if (wk) {
    const grid = `<div class="wk__grid" aria-hidden="true">${[0, 2, 4, 6, 8, 10].map(t => `<span style="bottom:${t * 10}%"><b>${t}</b></span>`).join('')}</div>`;
    const groups = weeks.map((d, gi) => `<div class="wk__g" tabindex="0" data-i="${gi}" aria-label="${d.w}: ${series.map((n, i) => `${n} ${d.v[i]}`).join(', ')}">
        <div class="wk__bars" aria-hidden="true">${d.v.map((v, i) => `<i class="wk__bar wk__bar--s${i + 1}" style="--h:${v * 10}%">${gi === weeks.length - 1 ? `<b>${v}</b>` : ''}</i>`).join('')}</div>
        <span class="wk__x" aria-hidden="true">${d.w}</span>
      </div>`).join('');
    wk.innerHTML = grid + `<div class="wk__groups">${groups}</div>`;

    const fig = wk.closest('.chart');
    const wTip = $('.chart__tip', fig);
    const show = (g) => {
      const d = weeks[g.dataset.i];
      wTip.innerHTML = `<strong>${d.w}</strong>` + series.map((n, i) => `<div><span class="sw sw--s${i + 1}"></span><span>${n}</span><span>${d.v[i]} / 10</span></div>`).join('');
      const f = fig.getBoundingClientRect(), r = g.getBoundingClientRect();
      const tw = wTip.offsetWidth || 190;
      wTip.style.left = Math.max(12, Math.min(r.left - f.left + r.width / 2 - tw / 2, f.width - tw - 12)) + 'px';
      wTip.style.top = (r.top - f.top + 8) + 'px';
      wTip.classList.add('is-on');
      wk.classList.add('is-hovering');
      $$('.wk__g', wk).forEach(x => x.classList.toggle('is-on', x === g));
    };
    const hide = () => { wTip.classList.remove('is-on'); wk.classList.remove('is-hovering'); };
    $$('.wk__g', wk).forEach(g => {
      g.addEventListener('pointerenter', () => show(g));
      g.addEventListener('pointerleave', hide);
      g.addEventListener('focus', () => show(g));
      g.addEventListener('blur', hide);
    });
  }

  /* ---------------- FAQ accordion ---------------- */
  $$('.qa').forEach(d => {
    const sum = $('summary', d);
    const body = $('.qa__a', d);
    sum.addEventListener('click', e => {
      if (reduce || !hasGSAP) return;
      e.preventDefault();
      if (d.open) {
        gsap.to(body, { height: 0, duration: .5, ease: 'power3.inOut', onComplete: () => { d.open = false; body.style.height = ''; ScrollTrigger.refresh(); } });
      } else {
        d.open = true;
        gsap.fromTo(body, { height: 0 }, { height: body.scrollHeight, duration: .6, ease: 'power3.out', onComplete: () => { body.style.height = ''; ScrollTrigger.refresh(); } });
      }
    });
  });

  /* ---------------- Contact form → WhatsApp / email ---------------- */
  const form = $('[data-form]');
  if (form) {
    let via = 'wa';
    $$('[data-send]', form).forEach(b => b.addEventListener('click', () => { via = b.dataset.send; }));
    form.addEventListener('submit', e => {
      e.preventDefault();
      const f = form.elements;
      const name = f['name'].value.trim();
      const goal = f['goal'].value;
      const mode = f['mode'].value;
      const msg = f['message'].value.trim();
      const err = $('.form__error', form);
      f['name'].closest('.field').classList.toggle('is-invalid', !name);
      f['goal'].closest('.field').classList.toggle('is-invalid', !goal);
      if (!name || !goal) { err.hidden = false; (name ? f['goal'] : f['name']).focus(); return; }
      err.hidden = true;
      const text = `Hi Sadiq, I'm ${name}.\nI'm interested in: ${mode}\nMain goal: ${goal}` + (msg ? `\n\n${msg}` : '') + `\n\n(Sent from your website)`;
      if (via === 'mail') {
        location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Free consultation: ' + name)}&body=${encodeURIComponent(text)}`;
      } else {
        const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
        const w = window.open(url, '_blank');
        if (w) w.opener = null; else location.href = url; // popup blocked → same tab
      }
    });
  }

  /* ---------------- Lightbox ---------------- */
  const lb = $('.lightbox');
  if (lb && typeof lb.showModal === 'function') {
    const img = $('img', lb), cap = $('.lightbox__cap', lb);
    $$('[data-lightbox]').forEach(btn => btn.addEventListener('click', () => {
      img.src = btn.dataset.lightbox;
      img.alt = $('img', btn)?.alt || '';
      cap.textContent = btn.dataset.caption || '';
      lb.showModal();
      lenis?.stop();
    }));
    $('.lightbox__close', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', () => { if (!$('.case-modal[open]')) lenis?.start(); });
  }

  /* ---------------- Client case-study panels ---------------- */
  let playCase = () => {};
  const lockPage = (on) => {
    document.documentElement.style.overflow = on ? 'hidden' : '';
    if (lenis) on ? lenis.stop() : lenis.start();
  };
  $$('.case-modal').forEach(dlg => {
    if (typeof dlg.showModal !== 'function') return;
    const close = () => {
      if (!dlg.open || dlg.classList.contains('is-closing')) return;
      if (reduce) return dlg.close();
      dlg.classList.add('is-closing');
      setTimeout(() => { dlg.classList.remove('is-closing'); dlg.close(); }, 340);
    };
    dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });
    dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
    $$('[data-case-close]', dlg).forEach(b => b.addEventListener('click', close));
    dlg.addEventListener('close', () => { lockPage(false); history.replaceState(null, '', '#results'); });
  });
  const openCase = (id) => {
    const dlg = document.getElementById(id);
    if (!dlg || typeof dlg.showModal !== 'function' || dlg.open) return;
    dlg.showModal();
    dlg.scrollTop = 0;
    lockPage(true);
    history.replaceState(null, '', '#' + id);
    playCase(dlg);
  };
  $$('[data-case-open]').forEach(b => b.addEventListener('click', () => openCase(b.dataset.caseOpen)));
  /* deep link, e.g. /#case-jaleel opens that case study */
  const deep = location.hash.slice(1);
  if (deep && document.getElementById(deep)?.classList.contains('case-modal')) {
    setTimeout(() => openCase(deep), hasGSAP && !reduce ? 2600 : 0);
  }

  /* ======================================================================
     Everything below is animation; the site is complete without it.
     ====================================================================== */
  const loader = $('.loader');
  if (!hasGSAP || reduce) {
    loader?.remove();
    $$('.c-bar i').forEach(i => (i.style.transform = 'none'));
    $$('[data-counter]').forEach(el => (el.textContent = el.dataset.counter));
    return;
  }

  document.body.classList.add('is-loading');
  lenis?.stop();

  /* ---------------- Magnetic & tilt ---------------- */
  if (finePointer) {
    $$('.magnetic').forEach(el => {
      const mx = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1, .4)' });
      const my = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1, .4)' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * .3);
        my((e.clientY - r.top - r.height / 2) * .35);
      });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });

    /* tilt cards */
    $$('[data-tilt]').forEach(card => {
      const rx = gsap.quickTo(card, 'rotationX', { duration: .8, ease: 'power3' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: .8, ease: 'power3' });
      gsap.set(card, { transformPerspective: 1200 });
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        rx(((e.clientY - r.top) / r.height - .5) * -5);
        ry(((e.clientX - r.left) / r.width - .5) * 6);
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  /* ---------------- Preloader → hero intro ---------------- */
  const heroWords = $$('[data-hero-word]');
  const heroFades = $$('[data-hero-fade]');
  const heroImg = $('[data-hero-img]');
  const floats = $$('[data-float]');
  const spin = $('.spin');

  gsap.set(heroWords, { yPercent: 110 });
  gsap.set(heroFades, { autoAlpha: 0, y: 26 });
  gsap.set(heroImg, { clipPath: 'inset(100% 0% 0% 0% round 22px)' });
  gsap.set($('img', heroImg), { scale: 1.3 });
  gsap.set([...floats, spin], { autoAlpha: 0, scale: .6 });
  gsap.set('.nav', { yPercent: -100, autoAlpha: 0 });

  const counter = { v: 0 };
  const countEl = $('[data-count]');
  const intro = gsap.timeline({ paused: true });
  const mobile = innerWidth <= 960;

  intro
    .to(heroImg, { clipPath: mobile ? 'inset(0% 0% 0% 0% round 0px)' : 'inset(0% 0% 0% 0% round 22px)', duration: 1.4, ease: 'expo.inOut' }, 0)
    .to($('img', heroImg), { scale: 1, duration: 1.8, ease: 'expo.out' }, .2)
    .to(heroWords, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: .1 }, .55)
    .to(heroFades, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .08 }, .85)
    .to([...floats, spin], { autoAlpha: 1, scale: 1, duration: .9, ease: 'back.out(1.7)', stagger: .12 }, 1.1)
    .to('.nav', { yPercent: 0, autoAlpha: 1, duration: .9, ease: 'power3.out', clearProps: 'transform' }, .9)
    .add(() => {
      floats.forEach((f, i) => gsap.to(f, { y: i ? 10 : -10, duration: 2.6 + i * .4, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    });

  const seen = (() => { try { return sessionStorage.getItem('sa-seen') === '1'; } catch { return false; } })();
  const loadTl = gsap.timeline({
    onComplete: () => {
      document.body.classList.remove('is-loading');
      lenis?.start();
      loader.remove();
      try { sessionStorage.setItem('sa-seen', '1'); } catch {}
    },
  });
  loadTl
    .from('.loader__word', { yPercent: 100, duration: .7, ease: 'expo.out' })
    .to(counter, { v: 100, duration: seen ? .5 : 1.3, ease: 'power2.inOut', onUpdate: () => (countEl.textContent = Math.round(counter.v)) }, '<.1')
    .to('.loader__bar span', { scaleX: 1, duration: seen ? .5 : 1.3, ease: 'power2.inOut' }, '<')
    .to('.loader__inner', { yPercent: -120, autoAlpha: 0, duration: .5, ease: 'power3.in' })
    .to(loader, { clipPath: 'inset(0% 0% 100% 0%)', duration: .9, ease: 'expo.inOut' }, '-=.15')
    .add(() => intro.play(), '-=.65');

  /* ---------------- Hero scroll parallax ---------------- */
  gsap.to($('img', heroImg), { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__title', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------------- Marquee: constant loop, eases faster while scrolling ---------------- */
  const mq = $('.marquee__track');
  mq.style.animation = 'none';
  const loop = gsap.to(mq, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
  const boost = { v: 1 };
  ScrollTrigger.create({
    trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onUpdate: self => {
      const target = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 4);
      gsap.to(boost, { v: target, duration: .3, overwrite: true, onUpdate: () => loop.timeScale(boost.v) });
      gsap.to(boost, { v: 1, duration: 1.2, delay: .3, ease: 'power2.out', onUpdate: () => loop.timeScale(boost.v) });
    },
  });

  /* ---------------- Section headings: line reveal ---------------- */
  const splitReveal = (el) => {
    if (window.SplitText) {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'split-line-inner',
        onSplit: self => gsap.from(self.lines, {
          yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .09,
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        }),
      });
    } else {
      gsap.from(el, { y: 40, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
    }
  };
  document.fonts.ready.then(() => $$('[data-split]').forEach(splitReveal));

  /* eyebrows & generic fades */
  $$('main .eyebrow:not([data-hero-fade]), .sec-head__aside, .method__intro, .faq__more').forEach(el =>
    gsap.from(el, { y: 20, autoAlpha: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));

  /* ---------------- About ---------------- */
  if (statement) {
    gsap.to($$('.w', statement), {
      opacity: 1, stagger: .1, ease: 'none',
      scrollTrigger: { trigger: statement, start: 'top 80%', end: 'bottom 50%', scrub: .6 },
    });
  }
  $$('.reveal-img').forEach(fig => {
    const im = $('img', fig) || $('button', fig);
    gsap.fromTo(fig, { clipPath: 'inset(18% 10% 18% 10% round 24px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: fig, start: 'top 95%', end: 'top 40%', scrub: true },
    });
    gsap.fromTo(im, { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: fig, start: 'top 95%', end: 'top 40%', scrub: true } });
  });
  gsap.from('.pillars li', { y: 30, autoAlpha: 0, duration: .8, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.pillars', start: 'top 90%', once: true } });

  /* ---------------- Training cards ---------------- */
  $$('.mode').forEach((card, i) => {
    gsap.from(card, { y: 90, autoAlpha: 0, duration: 1.2, delay: i * .12, ease: 'expo.out', scrollTrigger: { trigger: '.modes', start: 'top 85%', once: true } });
    gsap.fromTo($('.mode__bg img', card), { yPercent: -8 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from($$('.ticks li', card), { x: -20, autoAlpha: 0, duration: .7, stagger: .06, ease: 'power3.out', scrollTrigger: { trigger: $('.ticks', card), start: 'top 92%', once: true } });
  });

  /* ---------------- Disciplines ---------------- */
  gsap.from('.disc__row', { y: 50, autoAlpha: 0, duration: 1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.disc', start: 'top 85%', once: true } });

  /* ---------------- Method ---------------- */
  gsap.to('.steps__line span', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 60%', end: 'bottom 60%', scrub: true } });
  $$('.step').forEach(step => {
    gsap.from(step, { y: 60, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: step, start: 'top 88%', once: true } });
    ScrollTrigger.create({ trigger: step, start: 'top 62%', end: 'bottom 38%', toggleClass: 'is-active' });
  });

  /* ---------------- Outcomes ---------------- */
  gsap.from('.gains li', { y: 24, autoAlpha: 0, duration: .8, stagger: .06, ease: 'power3.out', scrollTrigger: { trigger: '.gains', start: 'top 88%', once: true } });
  gsap.from('.chart--weeks', { y: 50, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.chart--weeks', start: 'top 88%', once: true } });
  gsap.from('.wk__bar', { scaleY: 0, duration: 1.2, stagger: .05, ease: 'expo.out', scrollTrigger: { trigger: '.wk', start: 'top 80%', once: true } });

  /* ---------------- Client profiles & case study ---------------- */
  gsap.from('.profile', { y: 60, autoAlpha: 0, duration: 1.1, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.profiles', start: 'top 85%', once: true } });
  playCase = (dlg) => {
    $$('[data-counter]', dlg).forEach(el => {
      const end = parseFloat(el.dataset.counter);
      const dec = parseInt(el.dataset.dec || '0', 10);
      const o = { v: 0 };
      el.textContent = o.v.toFixed(dec);
      gsap.to(o, { v: end, duration: 1.8, delay: .3, ease: 'power3.out', onUpdate: () => (el.textContent = o.v.toFixed(dec)) });
    });
    gsap.fromTo($$('.kpi, .chart, .case__docs .doc, .case__ai', dlg), { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: .07, delay: .15, ease: 'expo.out' });
    gsap.fromTo($$('.c-bar i', dlg), { scaleX: 0 }, { scaleX: 1, duration: 1.3, stagger: .06, delay: .5, ease: 'expo.out' });
    gsap.fromTo($$('.c-bar b', dlg), { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: .6, stagger: .06, delay: 1, ease: 'power2.out' });
  };

  /* ---------------- Gallery: horizontal on desktop ---------------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 961px)', () => {
    const pin = $('.gallery__pin');
    const track = $('[data-gallery]');
    pin.style.minHeight = '100vh';
    pin.style.display = 'flex';
    pin.style.flexDirection = 'column';
    pin.style.justifyContent = 'center';
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: pin, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
    });
    $$('.g img', track).forEach(im => {
      gsap.fromTo(im, { xPercent: -6 }, {
        xPercent: 6, ease: 'none',
        scrollTrigger: { trigger: im.parentElement, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
      });
    });
    return () => { pin.removeAttribute('style'); };
  });
  mm.add('(max-width: 960px)', () => {
    gsap.from('.g', { x: 80, autoAlpha: 0, duration: 1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.gallery__track', start: 'top 88%', once: true } });
  });

  /* ---------------- FAQ items ---------------- */
  gsap.from('.qa', { y: 30, autoAlpha: 0, duration: .8, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: '.faq__list', start: 'top 88%', once: true } });

  /* ---------------- Contact ---------------- */
  gsap.to('.contact__bg img', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.channel, .location', { y: 40, autoAlpha: 0, duration: .9, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.channels', start: 'top 88%', once: true } });
  gsap.from('.form', { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.form', start: 'top 90%', once: true } });

  /* ---------------- Footer word fill ---------------- */
  const word = $('.footer__word');
  gsap.fromTo(word, { '--fill': '0%' }, { '--fill': '100%', ease: 'none', scrollTrigger: { trigger: word, start: 'top 95%', end: 'bottom 85%', scrub: true } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
