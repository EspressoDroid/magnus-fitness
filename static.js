
  (() => {
    const { gsap, ScrollTrigger } = window;
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const header = document.querySelector('.site-header');
    const compass = document.querySelector('.scroll-compass');
    const progress = document.querySelector('.scroll-progress');
    const progressRing = compass?.querySelector('circle');
    const updateUI = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const amount = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progress) progress.style.transform = 'scaleX(' + amount + ')';
      if (progressRing) progressRing.style.strokeDashoffset = String(1 - amount);
      if (compass) compass.classList.toggle('is-visible', window.scrollY > 520);
      if (header) header.classList.toggle('is-solid', window.scrollY > 44);
    };
    updateUI(); window.addEventListener('scroll', updateUI, { passive: true });
    compass?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    document.querySelectorAll('.menu-button').forEach((button) => button.addEventListener('click', () => {
      const nav = button.parentElement.querySelector('nav'); const open = nav.classList.toggle('open'); button.setAttribute('aria-expanded', String(open));
    }));
    const goToHash = (hash, behavior = 'smooth') => {
      const target = document.getElementById(hash.replace('#', '')); if (!target) return false;
      window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top, behavior }); return true;
    };
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]'); const hash = link?.getAttribute('href');
      if (hash && hash !== '#' && goToHash(hash)) { event.preventDefault(); history.replaceState(null, '', hash); }
    });
    // Links from the service detail pages use ?go= instead of a normal hash.
    // That stops the browser restoring an old scroll position after navigation.
    const goTarget = new URLSearchParams(location.search).get('go');
    const initialHash = goTarget ? '#' + goTarget : location.hash;
    if (goTarget && document.getElementById(goTarget)) {
      history.replaceState(null, '', location.pathname + initialHash);
    }
    const placeInitialTarget = () => {
      if (!initialHash || !document.getElementById(initialHash.slice(1))) return;
      // Run after the page has fully laid out, then repeat one frame later in
      // case the browser's history-restoration pass runs after the first jump.
      requestAnimationFrame(() => {
        goToHash(initialHash, 'auto');
        requestAnimationFrame(() => goToHash(initialHash, 'auto'));
      });
    };
    if (initialHash) {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      if (document.readyState === 'complete') placeInitialTarget();
      else window.addEventListener('load', placeInitialTarget, { once: true });
      window.addEventListener('pageshow', placeInitialTarget, { once: true });
    }

    document.querySelectorAll('[data-lightbox]').forEach((button) => button.addEventListener('click', () => {
      const box = document.createElement('div'); box.className = 'lightbox'; box.setAttribute('role', 'dialog');
      const close = document.createElement('button'); close.className = 'lightbox-close'; close.setAttribute('aria-label', 'Затвори фотографија'); close.textContent = '×';
      const figure = document.createElement('figure'); const image = document.createElement('img'); image.src = button.dataset.lightbox.replace(/^\//, ''); image.alt = button.dataset.caption || 'Magnus Fitness Centar';
      const caption = document.createElement('figcaption'); caption.textContent = button.dataset.caption || 'Magnus Fitness Centar'; figure.append(image, caption); box.append(close, figure);
      const dismiss = () => { box.remove(); document.body.classList.remove('lightbox-open'); };
      close.addEventListener('click', dismiss); box.addEventListener('mousedown', (event) => { if (event.target === box) dismiss(); });
      document.addEventListener('keydown', function escape(event) { if (event.key === 'Escape') { dismiss(); document.removeEventListener('keydown', escape); } });
      document.body.classList.add('lightbox-open'); document.body.append(box);
    }));

    const reveals = [...document.querySelectorAll('[data-reveal]')];
    if (reduced) { reveals.forEach((item) => item.classList.add('is-visible')); return; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    reveals.forEach((item) => observer.observe(item));

    const heroImage = document.querySelector('.hero-image'); const heroChapter = document.querySelector('.hero-chapter');
    if (heroImage && heroChapter) gsap.to(heroImage, { yPercent: 9, scale: 1.05, ease: 'none', scrollTrigger: { trigger: heroChapter, start: 'top top', end: 'bottom top', scrub: 0.7 } });
    document.querySelectorAll('[data-scroll-marquee]').forEach((track) => {
      const section = track.closest('.intro'); if (!section) return; const distance = () => Math.max(180, Math.round(innerWidth * .42));
      gsap.set(track, { x: () => -distance() * .16 }); gsap.to(track, { x: () => -distance(), ease: 'none', scrollTrigger: { trigger: section, start: 'top 92%', end: 'bottom 12%', scrub: .75, invalidateOnRefresh: true } });
    });
    document.querySelectorAll('[data-luxury-title]').forEach((title) => gsap.fromTo(title, { clipPath: 'inset(0 0 100% 0)', y: 36 }, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: .85, ease: 'power4.out', scrollTrigger: { trigger: title, start: 'top 84%', once: true } }));
    document.querySelectorAll('.section-layer').forEach((section) => gsap.fromTo(section, { '--luxury-edge': 0 }, { '--luxury-edge': 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top 86%', end: 'top 32%', scrub: true } }));
    ['za-nas','treninzi','raspored','clenarini','kontakt'].forEach((id) => { const section = document.getElementById(id); const link = [...document.querySelectorAll('.site-header nav a')].find((item) => item.getAttribute('href') === '#' + id); if (section && link) ScrollTrigger.create({ trigger: section, start: 'top 48%', end: 'bottom 48%', onToggle: (self) => link.classList.toggle('is-active', self.isActive) }); });
    // Service cards own their hover transform in CSS. Keeping them out of
    // this GSAP cursor-motion loop prevents an inline transform from leaving
    // a card enlarged on the first hover.
    if (matchMedia('(hover: hover)').matches) document.querySelectorAll('.gallery-image, .combat-image').forEach((element) => { const xTo = gsap.quickTo(element, 'x', { duration: .38, ease: 'power3.out' }); const yTo = gsap.quickTo(element, 'y', { duration: .38, ease: 'power3.out' }); element.addEventListener('pointermove', (event) => { const rect = element.getBoundingClientRect(); xTo(((event.clientX - rect.left) / rect.width - .5) * 7); yTo(((event.clientY - rect.top) / rect.height - .5) * 7); }); element.addEventListener('pointerleave', () => { xTo(0); yTo(0); }); });
  })();
