/* ============================================================
   NIMI KINGS — script.js
   Nav · Theme · Animations · Counters · Carousel · Forms
   ============================================================ */

(function () {
  'use strict';

  /* ===== PRELOADER ===== */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    const hidePreloader = () => preloader.classList.add('preloader-hide');
    window.addEventListener('load', () => setTimeout(hidePreloader, 400));
    setTimeout(hidePreloader, 3000);
  }

  /* ===== STICKY NAV ===== */
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ===== MOBILE MENU ===== */
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mobileNav  = document.getElementById('mobile-nav');

  if (menuToggle && mobileNav) {
    const backdrop = document.createElement('div');
    backdrop.className = 'mobile-nav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);

    const openMenu = () => {
      menuToggle.classList.add('open');
      menuToggle.setAttribute('aria-expanded', 'true');
      mobileNav.classList.add('open');
      mobileNav.setAttribute('aria-hidden', 'false');
      backdrop.classList.add('visible');
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('open');
      mobileNav.setAttribute('aria-hidden', 'true');
      backdrop.classList.remove('visible');
      document.body.style.overflow = '';
    };

    menuToggle.addEventListener('click', () => {
      menuToggle.classList.contains('open') ? closeMenu() : openMenu();
    });

    backdrop.addEventListener('click', closeMenu);

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeMenu();
    });
  }

  /* ===== THEME TOGGLE ===== */
  const themeToggle = document.getElementById('theme-toggle');
  const html        = document.documentElement;

  const applyTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('nk-theme', theme);
  };

  const savedTheme = localStorage.getItem('nk-theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme('light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      applyTheme(current === 'light' ? 'dark' : 'light');
    });
  }

  /* ===== SMOOTH SCROLL (for same-page anchors) ===== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ===== SCROLL-TRIGGERED ANIMATIONS ===== */
  const animatedEls = document.querySelectorAll('.animate-fade-up');
  if (animatedEls.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    animatedEls.forEach(el => observer.observe(el));
  }

  /* ===== ANIMATED COUNTERS ===== */
  const counterEls = document.querySelectorAll('.stat-number[data-target]');

  if (counterEls.length > 0) {
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const animateCounter = (el) => {
      const target   = parseInt(el.dataset.target, 10);
      const suffix   = el.dataset.suffix || '';
      const duration = 1800;
      const start    = performance.now();

      const tick = (now) => {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const value    = Math.round(easeOut(progress) * target);
        el.textContent = value.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterEls.forEach(el => counterObserver.observe(el));
  }

  /* ===== TESTIMONIAL CAROUSEL ===== */
  const track     = document.getElementById('testimonials-track');
  const dots      = document.querySelectorAll('.carousel-dot');
  const prevBtn   = document.getElementById('carousel-prev');
  const nextBtn   = document.getElementById('carousel-next');

  if (track && dots.length > 0) {
    let current    = 0;
    const total    = dots.length;
    let autoTimer  = null;

    const goTo = (index) => {
      current = (index + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === current);
        d.setAttribute('aria-selected', String(i === current));
      });
    };

    const startAuto = () => {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    };

    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goTo(i); startAuto(); });
    });

    /* Touch/swipe support */
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const delta = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 50) { goTo(delta > 0 ? current + 1 : current - 1); startAuto(); }
    }, { passive: true });

    startAuto();
  }

  /* ===== CONTACT FORM VALIDATION ===== */
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    const showError = (fieldId, msg) => {
      const field = document.getElementById(fieldId);
      const error = document.getElementById(fieldId + '-error');
      if (field) field.classList.add('error');
      if (error) error.textContent = msg;
    };
    const clearError = (fieldId) => {
      const field = document.getElementById(fieldId);
      const error = document.getElementById(fieldId + '-error');
      if (field) field.classList.remove('error');
      if (error) error.textContent = '';
    };

    ['name', 'email', 'interest'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => clearError(id));
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      let valid = true;

      const name     = document.getElementById('name');
      const email    = document.getElementById('email');
      const interest = document.getElementById('interest');

      clearError('name'); clearError('email'); clearError('interest');

      if (!name || !name.value.trim()) {
        showError('name', 'Please enter your full name.');
        valid = false;
      }
      if (!email || !email.value.trim()) {
        showError('email', 'Please enter your email address.');
        valid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        showError('email', 'Please enter a valid email address.');
        valid = false;
      }
      if (!interest || !interest.value) {
        showError('interest', 'Please select an area of interest.');
        valid = false;
      }

      if (!valid) return;

      const submitBtn = document.getElementById('form-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Redirecting to WhatsApp...';
      }

      const phone    = document.getElementById('phone');
      const company  = document.getElementById('company');
      const location = document.getElementById('location');
      const budget   = document.getElementById('budget');
      const message  = document.getElementById('message');
      const interestText = interest.options[interest.selectedIndex]
        ? interest.options[interest.selectedIndex].text
        : '';

      const lines = [
        'New inquiry from the Nimi Kings website:',
        `Name: ${name.value.trim()}`,
        `Email: ${email.value.trim()}`
      ];
      if (phone && phone.value.trim()) lines.push(`Phone: ${phone.value.trim()}`);
      if (company && company.value.trim()) lines.push(`Company: ${company.value.trim()}`);
      lines.push(`Area of Interest: ${interestText}`);
      if (location && location.value.trim()) lines.push(`Preferred Location: ${location.value.trim()}`);
      if (budget && budget.value.trim()) lines.push(`Budget: ${budget.value.trim()}`);
      if (message && message.value.trim()) lines.push(`Message: ${message.value.trim()}`);

      const waText = encodeURIComponent(lines.join('\n'));
      window.location.href = `https://wa.me/2349049653231?text=${waText}`;
    });
  }

  /* ===== NEWSLETTER FORM ===== */
  document.querySelectorAll('.footer-newsletter, #newsletter-form').forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = this.querySelector('.newsletter-input');
      const btn   = this.querySelector('.newsletter-btn');
      if (!input || !input.value.trim()) return;
      if (btn) {
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
        btn.style.background = '#4ADE80';
      }
      input.value = '';
      input.placeholder = 'You\'re subscribed — thank you!';
      input.disabled = true;
    });
  });

  /* ===== ACTIVE NAV LINK (for multi-page) ===== */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link, .footer-link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href && href === currentPath) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  /* ===== SCORE RING ANIMATION ===== */
  const scoreRingCircle = document.querySelector('.score-ring circle:last-child');
  if (scoreRingCircle) {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        scoreRingCircle.style.transition = 'stroke-dasharray 1.5s ease';
        scoreRingCircle.setAttribute('stroke-dasharray', '211 251');
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    const ring = document.querySelector('.score-ring');
    if (ring) {
      scoreRingCircle.setAttribute('stroke-dasharray', '0 251');
      obs.observe(ring);
    }
  }

  /* ===== RISK BAR ANIMATION ===== */
  const riskBar = document.querySelector('.risk-bar');
  if (riskBar) {
    const targetWidth = riskBar.style.width || '15%';
    riskBar.style.width = '0%';
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        riskBar.style.width = targetWidth;
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    const panel = riskBar.closest('.dashboard-panel');
    if (panel) obs.observe(panel);
  }

})();
