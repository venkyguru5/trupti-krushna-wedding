/* ==========================================================================
   MAIN PALACE CHOREOGRAPHY, CINEMATIC INTRO, GSAP SCROLL STORYTELLING & UX
   ========================================================================== */
(function (window) {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initIntroSequence() {
    const introStage = $('#intro');
    const openBtn = $('#openBtn');
    const introSeal = $('#introSeal');
    const skipBtn = $('#skipIntroBtn');
    const replayBtn = $('#replayIntroBtn');
    const navbar = $('#royalNavbar');
    const soundBtn = $('#soundToggleBtn');
    const introSoundBtn = $('#introSoundBtn');

    let introFinished = false;

    function completeIntro(instant = false) {
      if (introFinished) return;
      introFinished = true;

      if (instant || reduceMotion) {
        document.body.classList.remove('intro-locked');
        if (introStage) {
          introStage.classList.add('intro-complete');
          introStage.hidden = true;
        }
        if (navbar) navbar.classList.remove('nav-hidden');
        if (window.setupScratchCard) window.setupScratchCard();
        runHeroEntrance();
        return;
      }

      // Trigger 3D Palace Doors Opening
      if (introStage) {
        introStage.classList.add('doors-opening');
      }
      if (window.RoyalParticles) {
        window.RoyalParticles.surgeIntro();
      }
      if (window.RoyalAudio && window.RoyalAudio.enabled) {
        window.RoyalAudio.playDoorGrandReveal();
      }

      setTimeout(() => {
        document.body.classList.remove('intro-locked');
        if (navbar) navbar.classList.remove('nav-hidden');
        if (window.setupScratchCard) window.setupScratchCard();
        runHeroEntrance();
      }, 900);

      setTimeout(() => {
        if (introStage) {
          introStage.classList.add('intro-complete');
          introStage.hidden = true;
        }
      }, 1550);
    }

    if (openBtn) {
      openBtn.addEventListener('click', () => completeIntro(false));
    }
    if (introSeal) {
      introSeal.addEventListener('click', () => completeIntro(false));
      introSeal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          completeIntro(false);
        }
      });
    }
    if (skipBtn) {
      skipBtn.addEventListener('click', () => completeIntro(true));
    }

    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'auto' });
        introFinished = false;
        document.body.classList.add('intro-locked');
        if (navbar) navbar.classList.add('nav-hidden');
        if (introStage) {
          introStage.hidden = false;
          introStage.classList.remove('intro-complete', 'doors-opening');
        }
      });
    }

    // Sound Toggle Buttons
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        if (window.RoyalAudio) window.RoyalAudio.toggle();
      });
    }
    if (introSoundBtn) {
      introSoundBtn.addEventListener('click', () => {
        if (window.RoyalAudio) window.RoyalAudio.toggle();
      });
    }
  }

  function runHeroEntrance() {
    if (reduceMotion || typeof window.gsap === 'undefined') return;
    const gsap = window.gsap;
    gsap.fromTo(
      '.hero-crest-badge, .hero-name-word, .hero-ampersand, .hero-forever-quote, .hero-journey-quote, .hero-fact-plaque, .hero-palace-arch .chips, .hero-cta-row',
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.09,
        ease: 'power3.out',
        clearProps: 'all'
      }
    );
  }

  function initScrollStorytelling() {
    const progressBar = $('#scrollProgressBar');
    const navLinks = $$('.nav-link');
    const sections = $$('section[id]');

    function updateScrollProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      if (progressBar) {
        progressBar.style.width = `${pct}%`;
      }

      // Active section spy
      let currentId = 'hero-section';
      sections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.42) {
          currentId = sec.id;
        }
      });
      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === `#${currentId}`);
      });
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    // If GSAP + ScrollTrigger are available, add rich choreographed scroll storytelling & parallax
    if (!reduceMotion && typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      // Section reveals
      $$('.scroll-reveal').forEach((sec) => {
        gsap.fromTo(
          sec,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sec,
              start: 'top 84%',
              toggleActions: 'play none none none'
            }
          }
        );
      });

      // Staggered Countdown Cards
      gsap.fromTo(
        '.countdown-card',
        { opacity: 0, y: 28, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          stagger: 0.1,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: '.countdown-grid',
            start: 'top 85%'
          }
        }
      );

      // Staggered Timeline Items
      gsap.fromTo(
        '.timeline-item',
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.16,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.royal-timeline',
            start: 'top 85%'
          }
        }
      );

      // Staggered Jharokha Gallery Cards
      gsap.fromTo(
        '.jharokha-card',
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.14,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.jharokha-gallery-grid',
            start: 'top 85%'
          }
        }
      );

      return;
    }

    // Fallback IntersectionObserver for smooth scroll reveals if offline
    if (!reduceMotion && 'IntersectionObserver' in window) {
      const revealEls = $$('.scroll-reveal');
      revealEls.forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(28px)';
        el.style.transition = 'opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1), transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)';
      });

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );

      revealEls.forEach((el) => io.observe(el));
    }
  }

  function initMicroInteractions() {
    // Return to Top Button (without replaying intro)
    const topBtn = $('#returnTopBtn');
    if (topBtn) {
      topBtn.addEventListener('click', () => {
        const hero = $('#hero-section');
        if (hero) {
          hero.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      });
    }

    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;

    // 3D Tilt on Luxury Cards
    const tiltCards = $$('.royal-detail-card, .jharokha-card');
    tiltCards.forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });

    // Subtle Magnetic Pull on Primary Buttons
    const magBtns = $$('.hero-cta-row .btn, #openBtn, #sendBlessingsBtn');
    magBtns.forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.16;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.22;
        btn.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
      });
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    initIntroSequence();
    initScrollStorytelling();
    initMicroInteractions();
  });
})(window);
