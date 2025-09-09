/* Phase 1 - Core visuals & interactions
 - GSAP scroll/reveal (lazy-loaded)
 - particles.js starfield (lazy-loaded on view)
 - cursor glow trail (canvas)
 - button ripple
 - burger neon glow toggle
 - prefers-reduced-motion guards
*/
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('phase1-ready');
    if (!prefersReduced) document.body.classList.add('use-gsap');

    setupButtonRipple();
    setupBurgerGlowSync();
    setupHoverWhoosh();
    // Cursor trail disabled per request
    // if (!prefersReduced) setupCursorTrail();
    if (!prefersReduced) lazyLoadGSAP();
    if (!prefersReduced) lazyLoadParticles();
    setupConsoleEasterEgg();
  });

  // Load external script helper
  function loadScript(src){
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.async = true; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // GSAP scroll/reveal
  function lazyLoadGSAP(){
    // If no reveal candidates exist, skip
    const targets = $$('.fade-up, .scale-in');
    if (!targets.length) return;

    // Load GSAP core
    loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js')
      .then(() => loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js'))
      .then(() => {
        if (!window.gsap) return; // safety
        gsap.registerPlugin(ScrollTrigger);

        // Reduced-motion already checked earlier
        targets.forEach(el => {
          const y = el.classList.contains('fade-up') ? 24 : 0;
          const s = el.classList.contains('scale-in') ? 0.94 : 1;
          gsap.fromTo(el,
            { opacity: 0, y, scale: s },
            {
              opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
            }
          );
        });
      })
      .catch(()=>{});
  }

  // particles.js starfield (very light config)
  function lazyLoadParticles(){
    const container = $('#particles');
    if (!container) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        loadScript('https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js')
          .then(() => {
            if (!window.particlesJS) return;
            particlesJS('particles', {
              particles: {
                number: { value: 80, density: { enable: true, value_area: 900 } },
                color: { value: '#8a2be2' },
                shape: { type: 'circle' },
                opacity: { value: 0.3 },
                size: { value: 2, random: true },
                move: { enable: true, speed: 0.6, out_mode: 'out' },
                line_linked: { enable: false }
              },
              interactivity: { detect_on: 'canvas', events: { onhover: { enable: false }, onclick: { enable: false }, resize: true } },
              retina_detect: true
            });
          })
          .catch(()=>{});
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    io.observe(container);
  }

  // Cursor trail (neon glow)
  function setupCursorTrail(){
    const canvas = $('#cursor-trail');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const trail = [];
    const maxPoints = 18;

    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);

    const pushPoint = (x, y) => {
      trail.push({ x, y, t: performance.now() });
      if (trail.length > maxPoints) trail.shift();
    };

    window.addEventListener('mousemove', (e)=> pushPoint(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e)=>{
      if (e.touches && e.touches[0]) pushPoint(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    const draw = () => {
      ctx.clearRect(0,0,w,h);
      for (let i=0;i<trail.length;i++){
        const p = trail[i];
        const alpha = (i+1)/trail.length;
        const r = 8 + i*2;
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        grd.addColorStop(0, `rgba(0,249,255,${0.25*alpha})`);
        grd.addColorStop(0.6, `rgba(30,144,255,${0.18*alpha})`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI*2); ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  // Button ripple
  function setupButtonRipple(){
    document.addEventListener('click', (e)=>{
      const btn = e.target.closest('.btn, .btn.btn-ghost');
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX || (e.touches && e.touches[0]?.clientX) || rect.width/2) - rect.left;
      const y = (e.clientY || (e.touches && e.touches[0]?.clientY) || rect.height/2) - rect.top;
      const rip = document.createElement('span');
      rip.className = 'ripple';
      rip.style.left = x + 'px';
      rip.style.top = y + 'px';
      btn.appendChild(rip);
      rip.addEventListener('animationend', ()=> rip.remove());
    }, { passive: true });
  }

  // Sync burger glow with menu state
  function setupBurgerGlowSync(){
    const burger = $('.burger');
    if (!burger) return;
    burger.addEventListener('click', ()=>{
      const expanded = burger.getAttribute('aria-expanded') === 'true';
      // Note: click runs before main.js toggles; defer to next tick
      setTimeout(()=>{
        const nowExpanded = burger.getAttribute('aria-expanded') === 'true';
        burger.classList.toggle('is-active', nowExpanded);
      }, 0);
    });
  }

  // Subtle hover whoosh sound (throttled, hover-capable devices only)
  function setupHoverWhoosh(){
    const canHover = window.matchMedia('(hover: hover)').matches;
    if (!canHover) return;
    // small base64 wav, very short soft whoosh
    const src = 'data:audio/wav;base64,UklGRkQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAZGF0YQA...';
    let audio;
    try { audio = new Audio(src); audio.volume = 0.15; } catch { return; }
    let last = 0;
    const cooldown = 220; // ms
    const play = () => {
      const now = performance.now();
      if (now - last < cooldown) return;
      last = now;
      // clone to allow overlapping slightly
      try { const a = audio.cloneNode(); a.volume = audio.volume; a.play().catch(()=>{}); } catch{}
    };
    document.addEventListener('mouseenter', (e)=>{
      const el = e.target;
      // Only proceed for Element nodes and when closest() exists
      if (!el || !(el instanceof Element) || typeof el.closest !== 'function') return;
      if (el.closest('.btn, .project-card, .nav-link, .burger')) play();
    }, true);
  }

  // Console easter egg: type AI to trigger neon body flash
  function setupConsoleEasterEgg(){
    try{
      let buffer = '';
      const target = 'ai';
      const handler = (e)=>{
        buffer += (e.key || '').toLowerCase();
        if (buffer.length > target.length) buffer = buffer.slice(-target.length);
        if (buffer === target){
          buffer='';
          document.body.style.boxShadow='inset 0 0 0 2px rgba(0,249,255,0.6)';
          document.body.animate([
            { filter:'brightness(1)' }, { filter:'brightness(1.6)' }, { filter:'brightness(1)' }
          ], { duration: 700, easing:'ease-out' });
          setTimeout(()=>{ document.body.style.boxShadow=''; }, 720);
        }
      };
      window.addEventListener('keydown', handler);
    }catch{}
  }
})();
