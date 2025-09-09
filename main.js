// Smooth scroll, mobile menu, reveal on scroll, progress bars,
// tilt-hover-3d, typewriter, contact form with Formspree + toast

document.addEventListener('DOMContentLoaded', () => {
    setupSmoothScroll();
    setupMobileMenu();
    setupIntersectionReveals();
    setupProgressBarsOnReveal();
    setupProjectTilt();
    setupTypewriter();
    setupContactForm();
  });
  
  function setupSmoothScroll() {
    const links = document.querySelectorAll('a.nav-link, .back-to-top, .btn.btn-ghost[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu if open (avoid calling inner function from another scope)
        const mobile = document.getElementById('mobile-menu');
        const burger = document.querySelector('.burger');
        if (mobile && burger && !mobile.hasAttribute('hidden')) {
          burger.setAttribute('aria-expanded', 'false');
          mobile.setAttribute('hidden', '');
        }
      });
    });
  }
  
  function setupMobileMenu() {
    const burger = document.querySelector('.burger');
    const mobile = document.getElementById('mobile-menu');
    if (!burger || !mobile) return;

    burger.addEventListener('click', () => {
      const expanded = burger.getAttribute('aria-expanded') === 'true';
      toggleMobileMenu(!expanded);
    });
  
    function escHandler(e) {
      if (e.key === 'Escape') toggleMobileMenu(false);
    }
  
    function outsideClick(e) {
      if (!mobile.contains(e.target) && !burger.contains(e.target)) toggleMobileMenu(false);
    }
  
    function toggleMobileMenu(open) {
      burger.setAttribute('aria-expanded', String(open));
      if (open) {
        mobile.removeAttribute('hidden');
        document.addEventListener('keydown', escHandler);
        document.addEventListener('click', outsideClick);
      } else {
        mobile.setAttribute('hidden', '');
        document.removeEventListener('keydown', escHandler);
        document.removeEventListener('click', outsideClick);
      }
    }
  }
  
  function setupIntersectionReveals() {
    const toReveal = document.querySelectorAll('.fade-up, .scale-in');
    if (!('IntersectionObserver' in window) || toReveal.length === 0) {
      // Fallback: reveal immediately
      toReveal.forEach(el => el.classList.add('revealed'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    toReveal.forEach(el => io.observe(el));
  }
  
  function setupProgressBarsOnReveal() {
    const fills = document.querySelectorAll('.fill');
    if (fills.length === 0) return;
  
    const trigger = (el) => {
      const val = el.getAttribute('data-value');
      const pct = Math.max(0, Math.min(100, Number(val || 0)));
      requestAnimationFrame(() => { el.style.width = pct + '%'; });
    };
  
    // Trigger when parent skill is revealed
    const skills = document.querySelectorAll('.skill');
    if (!('IntersectionObserver' in window)) {
      fills.forEach(trigger);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.fill').forEach(trigger);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    skills.forEach(s => io.observe(s));
  }
  
  function setupProjectTilt() {
    const cards = document.querySelectorAll('.project-card');
    const maxDeg = 8;
  
    cards.forEach(card => {
      let raf = null;
      let bounds = null;
  
      const reset = () => {
        card.style.transition = 'transform .2s ease';
        card.style.transform = 'perspective(700px) rotateX(0) rotateY(0) scale(1.02)';
        setTimeout(() => { card.style.transition = ''; }, 220);
      };
  
      const onMove = (e) => {
        // Prefer actual pointer positions
        const { clientX, clientY } = 'touches' in e ? e.touches[0] : e;
        if (!bounds) bounds = card.getBoundingClientRect();
        const x = clientX - bounds.left;
        const y = clientY - bounds.top;
        const px = x / bounds.width;   // 0..1
        const py = y / bounds.height;  // 0..1
        const rotY = (px - 0.5) * (maxDeg * 2);
        const rotX = (0.5 - py) * (maxDeg * 2);
  
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `perspective(700px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.02)`;
        });
      };
  
      const onEnter = () => { bounds = card.getBoundingClientRect(); };
      const onLeave = () => { reset(); bounds = null; };
  
      card.addEventListener('mousemove', onMove, { passive: true });
      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);
      card.addEventListener('touchstart', onEnter, { passive: true });
      card.addEventListener('touchmove', onMove, { passive: true });
      card.addEventListener('touchend', onLeave);
    });
  }
  
  function setupTypewriter() {
    const el = document.querySelector('.typewriter');
    if (!el) return;
    const text = el.getAttribute('data-text') || el.textContent || '';
    el.textContent = '';
    let i = 0;
    const speed = 40; // 30–60ms recommended range
  
    const tick = () => {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(tick, speed);
      }
    };
    tick();
  }
  
  function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const endpoint = form.getAttribute('action') || '';
      const data = new FormData(form);
  
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: data
        });
        if (res.ok) {
          showToast('Message sent successfully! ✅');
          form.reset();
        } else {
          showToast('Something went wrong. Please try again. ⚠️');
        }
      } catch (err) {
        showToast('Network error. Please try again later. ⚠️');
      }
    });
  }
  
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toast.classList.remove('show');
    }, 2600);
  }