/* ============================================================
   JM Villas Nazaré — Main JS
   ============================================================ */

(function () {
  'use strict';

  /* ── Language Switcher ──────────────────────────────────── */
  // Chave nova para ignorar a preferência "en" guardada antes de PT ser a predefinição
  const LANG_KEY = 'cma_lang';
  const CONTACT_EMAIL = 'martimmsousa@gmail.com';
  let currentLang = localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'pt';

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.body.classList.toggle('is-pt', lang === 'pt');
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.langBtn === lang);
    });
    document.documentElement.lang = lang === 'pt' ? 'pt-PT' : 'en';
  }

  function initLang() {
    setLang(currentLang);
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.addEventListener('click', () => setLang(btn.dataset.langBtn));
    });
  }

  // O script está no fim do body, por isso o DOM já existe e evita-se o flash em inglês
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLang);
  } else {
    initLang();
  }

  /* ── Sticky Header ──────────────────────────────────────── */
  const header = document.getElementById('header');

  // On inner pages the header starts as 'scrolled' — never switch to hero-mode
  const IS_INNER_PAGE = header && !header.classList.contains('hero-mode');

  function onScroll() {
    if (!header) return;
    if (!IS_INNER_PAGE) {
      const scrolled = window.scrollY > 60;
      header.classList.toggle('scrolled', scrolled);
      header.classList.toggle('hero-mode', !scrolled);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('DOMContentLoaded', onScroll);

  /* ── Mobile Menu ────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  });

  /* ── Scroll Reveal ──────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  });

  /* ── Hero BG pan ────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) setTimeout(() => heroBg.classList.add('loaded'), 100);
  });

  /* ── FAQ Accordion ──────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.faq-question').forEach(q => {
      q.addEventListener('click', () => {
        const item = q.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  });

  /* ── Active nav link ────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a, .mobile-menu a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  });

  /* ── Contact form submit (demo) ─────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const v = name => (form.elements[name] ? form.elements[name].value.trim() : '');
      const body = [
        `Nome: ${v('nome')}`,
        `Email: ${v('email')}`,
        `Entrada: ${v('in') || '-'}`,
        `Saída: ${v('out') || '-'}`,
        `Quarto: ${v('suite') || '-'}`,
        `Pessoas: ${v('pax') || '-'}`,
        '',
        v('msg')
      ].join('\n');
      const subject = `Pedido de reserva — ${v('nome')}`;
      window.location.href =
        `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      let note = form.querySelector('.form-note');
      if (!note) {
        note = document.createElement('p');
        note.className = 'form-note';
        note.style.cssText = 'margin-top:1rem;font-size:.85rem;color:var(--text-light);';
        form.appendChild(note);
      }
      note.textContent = currentLang === 'pt'
        ? 'A abrir a sua aplicação de email com o pedido preparado. Basta carregar em enviar.'
        : 'Opening your email app with the request ready. Just press send.';
    });
  });

  /* ── Smooth anchor scroll ───────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });

    /* ── Auto copyright year ──────────────────────────────── */
    document.querySelectorAll('.copy-year').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  });

})();

/* ── Fundo fixo: opacidade com o scroll ──
   .fx-img (heroes interiores): queda ligeira. --page-o (foto de página): visível no hero e
   esbatida a partir do gestor de reservas até zero no início das últimas secções (só homepage). */
(function () {
  const layers = document.querySelectorAll('[data-fx]');
  const root = document.documentElement;
  const hero = document.querySelector('.h-hero, .page-hero');
  const avail = document.querySelector('.h-avail');
  const expRef = document.querySelector('.exp-detail-grid') || (document.querySelector('.fx-img[style*="bg-suites"]') && document.querySelector('.page-hero ~ .section')); // Nazaré e Quartos: ponto onde a foto chega a 10%
  const EXP_MIN = 0.1;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MIN_OPACITY = 0.88; // queda máxima das camadas .fx-img: ~12%
  let ticking = false;
  const top = el => el.getBoundingClientRect().top + window.scrollY;
  function update() {
    const y = window.scrollY, vh = window.innerHeight;
    if (!reduced) {
      const o = (1 - (1 - MIN_OPACITY) * Math.min(y / vh, 1)).toFixed(3);
      layers.forEach(el => el.style.setProperty('--fx-o', o));
    }
    if (expRef) {
      // Esbate linearmente com o scroll real: 1 no topo, 0.1 quando a secção das ondas chega ao topo, e fica a 0.1 até ao fim.
      const stop = Math.max(top(expRef) - (parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 80) - 16, 1);
      const k = Math.min(Math.max(y / stop, 0), 1);
      root.style.setProperty('--page-o', (1 - (1 - EXP_MIN) * k * k * (3 - 2 * k)).toFixed(3));
      ticking = false; return;
    }
    // Só a homepage (tem gestor de reservas) esbate a foto; nas restantes páginas fica fixa e visível.
    if (!avail) { ticking = false; return; }
    // O meio do gestor de reservas é onde o hero acaba (onda): a foto esbate até aí.
    const mid = top(avail) + avail.offsetHeight / 2;
    const start = mid - vh * 0.85;
    const end = mid - vh * 0.15;
    const t = Math.min(Math.max((y - start) / Math.max(end - start, 1), 0), 1);
    root.style.setProperty('--page-o', (1 - t * t * (3 - 2 * t)).toFixed(3));
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
