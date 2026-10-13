/* ==========================================================================
   INTERACTIVE ROYAL WEDDING ACTIVITIES ENGINE
   - Upgraded Heart Scratch-to-Reveal Activity (with progress & sparks)
   - Activity 1: 3D Wax-Sealed Unfolding Royal Invitation
   - Activity 2: Interactive T & K Royal Monogram Forge
   - Activity 3: Live Muhurat Countdown (1 Nov 2026, 11:00 AM) & Calendar .ics
   - Activity 4: Royal Wishes Guestbook (Local preview + WhatsApp Share)
   - Activity 5: Interactive Palace Diyas & Pushpavrishti Blessing Shower
   - Activity 6: Royal Jharokha Gallery & Live Photo Frame Previewer
   - Activity 7: Royal Celebration Theme Switcher
   ========================================================================== */
(function (window) {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ========================================================================
     1. UPGRADED SCRATCH-TO-REVEAL ACTIVITY (Retaining original IDs & heart)
     ======================================================================== */
  function initScratchCard() {
    const cv = $('#scratch');
    if (!cv) return;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    const wrap = $('#wrap');
    const hint = $('#hint');
    const details = $('#details');
    const tip = $('#tip');
    const againBtn = $('#again');
    const instantBtn = $('#instantRevealBtn');
    const progFill = $('#scratchProgressFill');
    const progLabel = $('#scratchProgressLabel');

    const CFG = {
      threshold: 0.42, // fraction of coating that must be cleared to auto-reveal
      brush: 32,       // brush diameter in CSS px
      checkMs: 100
    };

    let W = 0, H = 0, dpr = 1, cssW = 0, baseline = 1;
    let done = false, drawing = false, pid = null, last = null, lastCheck = 0;
    let milestone1 = false, milestone2 = false;

    function heart(c, w, h) {
      c.beginPath();
      c.moveTo(0.5 * w, h);
      c.bezierCurveTo(0.15 * w, 0.72 * h, 0, 0.52 * h, 0, 0.3 * h);
      c.bezierCurveTo(0, 0.13 * h, 0.13 * w, 0, 0.28 * w, 0);
      c.bezierCurveTo(0.38 * w, 0, 0.46 * w, 0.05 * h, 0.5 * w, 0.14 * h);
      c.bezierCurveTo(0.54 * w, 0.05 * h, 0.62 * w, 0, 0.72 * w, 0);
      c.bezierCurveTo(0.87 * w, 0, w, 0.13 * h, w, 0.3 * h);
      c.bezierCurveTo(w, 0.52 * h, 0.85 * w, 0.72 * h, 0.5 * w, h);
      c.closePath();
    }

    function updateProgressUI(fraction) {
      const pct = Math.min(100, Math.round((fraction / CFG.threshold) * 100));
      if (progFill) progFill.style.width = `${pct}%`;
      if (progLabel) {
        if (pct === 0) progLabel.textContent = '0% REVEALED';
        else if (pct < 100) progLabel.textContent = `${pct}% REVEALED`;
        else progLabel.textContent = '100% · UNLOCKED ✨';
      }
    }

    function setup() {
      const r = cv.getBoundingClientRect();
      if (!r.width) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssW = r.width;
      W = cv.width = Math.round(r.width * dpr);
      H = cv.height = Math.round(r.height * dpr);

      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      heart(ctx, W, H);
      ctx.clip();

      // Rich 24K Royal Gold Foil Coating
      const g = ctx.createLinearGradient(0, 0, W, H);
      ['#FFF2C2', '#D4AF37', '#F6E7B8', '#9A7432', '#E5C158', '#FFF4CE', '#B58B42'].forEach((c, i, a) =>
        g.addColorStop(i / (a.length - 1), c)
      );
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Ornate Mandala Rings on the Gold Foil
      ctx.strokeStyle = 'rgba(122, 90, 31, 0.25)';
      ctx.lineWidth = 1.2 * dpr;
      [0.16, 0.26, 0.36, 0.44].forEach((rad) => {
        ctx.beginPath();
        ctx.arc(W / 2, H * 0.44, W * rad, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Brushed-metal shimmer lines
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2 * dpr;
      for (let x = -H; x < W; x += 14 * dpr) {
        ctx.beginPath();
        ctx.moveTo(x, H);
        ctx.lineTo(x + H, 0);
        ctx.stroke();
      }

      // Fine 24K gold dust glitter
      ctx.globalAlpha = 0.38;
      for (let i = 0; i < 280; i++) {
        ctx.fillStyle = Math.random() < 0.55 ? '#fff' : '#8C6520';
        ctx.fillRect(Math.random() * W, Math.random() * H, dpr * rnd(0.8, 2.2), dpr * rnd(0.8, 2.2));
      }

      // Royal Emblem & Instructions embossed on foil
      ctx.globalAlpha = 0.42;
      ctx.fillStyle = '#5C3E0E';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${W * 0.11}px "Cinzel Decorative", Georgia, serif`;
      ctx.fillText('T ♡ K', W / 2, H * 0.38);

      ctx.font = `600 ${W * 0.036}px Montserrat, sans-serif`;
      ctx.fillText('A SPECIAL SURPRISE AWAITS', W / 2, H * 0.54);

      ctx.font = `700 ${W * 0.042}px Montserrat, sans-serif`;
      ctx.fillText('✦ SCRATCH HERE ✦', W / 2, H * 0.64);

      ctx.restore();
      baseline = Math.max(1, opaque());
      cv.style.visibility = 'visible';
      milestone1 = false;
      milestone2 = false;
      updateProgressUI(0);
    }

    function opaque() {
      const d = ctx.getImageData(0, 0, W, H).data;
      let n = 0;
      for (let i = 3; i < d.length; i += 20) {
        if (d[i] > 128) n++;
      }
      return n;
    }

    function check(force) {
      const now = performance.now();
      if (!force && now - lastCheck < CFG.checkMs) return;
      lastCheck = now;
      const cleared = Math.max(0, 1 - opaque() / baseline);
      updateProgressUI(cleared);

      if (!milestone1 && cleared >= CFG.threshold * 0.35) {
        milestone1 = true;
        if (tip) tip.textContent = 'Golden foil giving way... keep scratching! ✨';
      }
      if (!milestone2 && cleared >= CFG.threshold * 0.72) {
        milestone2 = true;
        if (tip) tip.textContent = 'Almost there! The royal secret is emerging... ♡';
      }
      if (cleared >= CFG.threshold) {
        reveal();
      }
    }

    function pos(e) {
      const r = cv.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) * W) / r.width,
        y: ((e.clientY - r.top) * H) / r.height
      };
    }

    function stroke(a, b) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = CFG.brush * dpr;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    cv.addEventListener('pointerdown', (e) => {
      if (done || drawing) return;
      drawing = true;
      pid = e.pointerId;
      last = pos(e);
      try {
        cv.setPointerCapture(pid);
      } catch (_) {}
      if (hint) hint.classList.add('off');
      e.preventDefault();
    });

    cv.addEventListener('pointermove', (e) => {
      if (!drawing || e.pointerId !== pid || done) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      (evs.length ? evs : [e]).forEach((ev) => {
        const p = pos(ev);
        stroke(last, p);
        last = p;
      });
      if (window.RoyalParticles) {
        window.RoyalParticles.sparkAt(e.clientX, e.clientY, 2);
      }
      if (window.RoyalAudio) {
        window.RoyalAudio.playScratchGrain();
      }
      check(false);
      e.preventDefault();
    });

    function end(e) {
      if (e.pointerId !== pid) return;
      drawing = false;
      pid = null;
      if (!done) check(true);
    }

    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
    cv.addEventListener('touchmove', (e) => {
      if (drawing) e.preventDefault();
    }, { passive: false });
    cv.addEventListener('contextmenu', (e) => e.preventDefault());

    function reveal() {
      if (done) return;
      done = true;
      drawing = false;
      updateProgressUI(CFG.threshold);
      cv.classList.add('gone');
      setTimeout(() => {
        if (done) cv.style.visibility = 'hidden';
      }, reduceMotion ? 0 : 900);
      if (details) details.hidden = false;
      if (tip) tip.textContent = '✨ Our Auspicious Date is Revealed! ✨';
      if (window.RoyalParticles) {
        window.RoyalParticles.confetti(0.45, 130);
        window.RoyalParticles.hearts();
      }
      if (window.RoyalAudio) {
        window.RoyalAudio.playDoorGrandReveal();
      }
      setTimeout(() => {
        if (details) details.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
      }, 550);
    }

    if (againBtn) {
      againBtn.addEventListener('click', () => {
        done = false;
        if (details) details.hidden = true;
        if (tip) tip.textContent = 'Scratch the golden heart to reveal our special day ✨';
        setup();
        cv.classList.remove('gone');
        if (hint) hint.classList.remove('off');
        if (wrap) wrap.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      });
    }

    if (instantBtn) {
      instantBtn.addEventListener('click', () => {
        if (hint) hint.classList.add('off');
        reveal();
      });
    }

    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (!done && Math.abs(cv.getBoundingClientRect().width - cssW) > 1) {
          setup();
        }
      }, 150);
    });

    // Expose setup so it can be called on init and after intro
    window.setupScratchCard = setup;
    setup();
  }

  /* ========================================================================
     2. ACTIVITY 1: OPEN THE ROYAL INVITATION (3D Wax-Sealed Card)
     ======================================================================== */
  function initRoyalScrollCard() {
    const card = $('#trifoldCard');
    const sealBtn = $('#waxSealBtn');
    const resealBtn = $('#resealCardBtn');
    if (!card || !sealBtn) return;

    sealBtn.addEventListener('click', (e) => {
      card.classList.add('is-open');
      if (window.RoyalParticles) {
        window.RoyalParticles.sparkAt(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, 28);
        window.RoyalParticles.confetti(0.5, 70);
      }
      if (window.RoyalAudio) {
        window.RoyalAudio.playDoorGrandReveal();
      }
    });

    if (resealBtn) {
      resealBtn.addEventListener('click', () => {
        card.classList.remove('is-open');
        if (window.RoyalAudio) {
          window.RoyalAudio.playChime(440, 0.12);
        }
      });
    }
  }

  /* ========================================================================
     3. ACTIVITY 2: DISCOVER THE COUPLE'S INITIALS (Royal Monogram Forge)
     ======================================================================== */
  function initMonogramForge() {
    const buttons = $$('.jewel-node-btn');
    const crestBox = $('#monogramCenterCrest');
    const statusEl = $('#monogramStatusText');
    const awakenAllBtn = $('#awakenAllMonogramBtn');
    if (!buttons.length) return;

    const awakenedSet = new Set();
    const notes = [293.66, 369.99, 440.0, 587.33];

    function activatePart(partName, idx, clientX, clientY) {
      if (awakenedSet.has(partName)) return;
      awakenedSet.add(partName);

      const btn = $(`.jewel-node-btn[data-part="${partName}"]`);
      if (btn) btn.classList.add('active');

      const svgPart = $(`#mono-${partName}`);
      if (svgPart) svgPart.classList.add('awakened');

      if (window.RoyalParticles && clientX) {
        window.RoyalParticles.sparkAt(clientX, clientY, 16);
      }
      if (window.RoyalAudio) {
        window.RoyalAudio.pluckSantoor(notes[idx % notes.length], 0.16);
      }

      const remaining = 4 - awakenedSet.size;
      if (remaining > 0) {
        if (statusEl) {
          statusEl.textContent = `${awakenedSet.size} of 4 Royal Symbols Awakened · Tap ${remaining} more to forge the emblem`;
        }
      } else {
        if (crestBox) crestBox.classList.add('fully-awakened');
        if (statusEl) {
          statusEl.textContent = '✨ THE ROYAL MONOGRAM OF TRUPTI & KRUSHNA IS FORGED! ✨';
        }
        if (window.RoyalParticles) {
          window.RoyalParticles.confetti(0.55, 85);
        }
        if (window.RoyalAudio) {
          window.RoyalAudio.playDoorGrandReveal();
        }
      }
    }

    buttons.forEach((btn, idx) => {
      btn.addEventListener('click', (e) => {
        activatePart(btn.dataset.part, idx, e.clientX, e.clientY);
      });
    });

    if (awakenAllBtn) {
      awakenAllBtn.addEventListener('click', (e) => {
        ['crown', 't', 'k', 'heart'].forEach((part, idx) => {
          setTimeout(() => activatePart(part, idx, e.clientX, e.clientY), idx * 180);
        });
      });
    }
  }

  /* ========================================================================
     4. ACTIVITY 3: MUHURAT COUNTDOWN (1 NOV 2026, 11:00 AM IST) & CALENDAR
     ======================================================================== */
  function initCountdownAndCalendar() {
    // Factual Date from original invitation: Sunday, 1 November 2026, 11:00 AM IST
    const targetTime = new Date('2026-11-01T11:00:00+05:30').getTime();
    const dEl = $('#cdDays');
    const hEl = $('#cdHours');
    const mEl = $('#cdMins');
    const sEl = $('#cdSecs');
    const statusMsg = $('#countdownStatusMsg');

    function pad(n) {
      return String(Math.max(0, n)).padStart(2, '0');
    }

    function tick() {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        if (dEl) dEl.textContent = '00';
        if (hEl) hEl.textContent = '00';
        if (mEl) mEl.textContent = '00';
        if (sEl) sEl.textContent = '00';
        if (statusMsg) {
          statusMsg.textContent = '✨ The Auspicious Day Has Arrived! Celebrating Trupti & Krushna! ✨';
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      if (dEl) dEl.textContent = pad(days);
      if (hEl) hEl.textContent = pad(hours);
      if (mEl) mEl.textContent = pad(mins);
      if (sEl) sEl.textContent = pad(secs);
    }

    tick();
    setInterval(tick, 1000);

    // Add to Calendar (.ics download)
    $$('.calendar-trigger-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const icsContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Trupti & Krushna//Save The Date Royal Invitation//EN',
          'BEGIN:VEVENT',
          'UID:trupti-krushna-20261101@thecacodercouple.in',
          'DTSTAMP:20261013T053000Z',
          'DTSTART:20261101T053000Z',
          'DTEND:20261101T093000Z',
          'SUMMARY:Engagement Ceremony · Trupti & Krushna (The CA Coder Couple)',
          'DESCRIPTION:Two hearts. Two careers. One beautiful journey. We cannot wait to celebrate this special beginning with you! — Trupti & Krushna (@the_ca_coder_couple)',
          'LOCATION:Balaji Mandir\\, Badnapur',
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Trupti-and-Krushna-Save-The-Date-1-Nov-2026.ics';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      });
    });
  }

  /* ========================================================================
     5. ACTIVITY 4: ROYAL WISHES GUESTBOOK
     ======================================================================== */
  function initRoyalWishes() {
    const STORAGE_KEY = 'tk_royal_wishes_v1';
    const form = $('#wishesForm');
    const wall = $('#wishesWall');
    const shareWaBtn = $('#shareWishWhatsappBtn');
    const feedbackEl = $('#wishFormFeedback');
    if (!form || !wall) return;

    const defaultWishes = [
      {
        name: 'Warmest Blessings (Sample Preview)',
        relation: 'Family & Well-Wishers',
        motif: 'Eternal Love & Joy',
        message: 'May Lord Balaji bless Trupti & Krushna with a lifetime of love, laughter, and endless harmony as you begin this royal chapter on 1st November 2026!'
      },
      {
        name: 'Friends of The CA Coder Couple (Sample Preview)',
        relation: 'Colleagues & Friends',
        motif: 'Prosperity & Adventure',
        message: "When Trupti's innovation (</> Engineer) meets Krushna's precision (₹ CA), magic happens! Congratulations Trupti & Krushna on your engagement!"
      }
    ];

    let wishes = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      wishes = saved ? JSON.parse(saved) : defaultWishes;
    } catch (_) {
      wishes = defaultWishes;
    }

    function renderWishes() {
      wall.innerHTML = '';
      wishes.forEach((w) => {
        const card = document.createElement('article');
        card.className = 'wish-item-card';

        const header = document.createElement('div');
        header.className = 'wish-item-header';

        const author = document.createElement('span');
        author.className = 'wish-author';
        author.textContent = w.name + (w.relation ? ` · ${w.relation}` : '');

        const badge = document.createElement('span');
        badge.className = 'wish-badge';
        badge.textContent = `✦ ${w.motif || 'Royal Blessing'}`;

        header.appendChild(author);
        header.appendChild(badge);

        const body = document.createElement('p');
        body.className = 'wish-body';
        body.textContent = `“${w.message}”`;

        card.appendChild(header);
        card.appendChild(body);
        wall.appendChild(card);
      });
    }

    renderWishes();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = $('#wishName');
      const relInput = $('#wishRelation');
      const motifInput = $('#wishMotif');
      const msgInput = $('#wishMessage');

      const name = (nameInput.value || '').trim();
      const relation = (relInput.value || '').trim();
      const motif = motifInput ? motifInput.value : 'Eternal Love & Joy';
      const message = (msgInput.value || '').trim();

      if (!name || !message) return;

      const newWish = { name, relation, motif, message };
      wishes.unshift(newWish);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes.slice(0, 30)));
      } catch (_) {}

      renderWishes();
      msgInput.value = '';

      if (feedbackEl) {
        feedbackEl.hidden = false;
        feedbackEl.textContent = '✨ Inscribed on your local Royal Wishes preview wall! Use "Send via WhatsApp" below to deliver your message directly to Trupti & Krushna.';
      }
      if (window.RoyalParticles) {
        window.RoyalParticles.confetti(0.65, 65);
      }
      if (window.RoyalAudio) {
        window.RoyalAudio.playChime(587.33, 0.18);
      }
    });

    if (shareWaBtn) {
      shareWaBtn.addEventListener('click', () => {
        const name = ($('#wishName').value || 'A Well-Wisher').trim();
        const msg = ($('#wishMessage').value || 'Wishing Trupti & Krushna a magical engagement on 1st November 2026 and a lifetime of happiness!').trim();
        const text = `✨ *Royal Blessings for Trupti & Krushna* ✨\n\n“${msg}”\n\n— With love, *${name}* ♡`;
        const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      });
    }
  }

  /* ========================================================================
     6. ACTIVITY 5: CELEBRATION CONFETTI & INTERACTIVE PALACE DIYAS
     ======================================================================== */
  function initBlessingsAndDiyas() {
    const diyaBtns = $$('.diya-btn');
    const diyaStatus = $('#diyaStatusText');
    const blessBtn = $('#sendBlessingsBtn');
    const blessCountEl = $('#blessingCounterText');
    const BLESS_KEY = 'tk_royal_blessing_count';

    let blessCount = 108;
    try {
      const saved = parseInt(localStorage.getItem(BLESS_KEY), 10);
      if (!isNaN(saved) && saved >= 108) blessCount = saved;
    } catch (_) {}

    function updateBlessUI() {
      if (blessCountEl) {
        blessCountEl.textContent = `${blessCount.toLocaleString()} Royal Showers of Blessings Sent ♡`;
      }
    }
    updateBlessUI();

    if (blessBtn) {
      blessBtn.addEventListener('click', (e) => {
        blessCount++;
        try {
          localStorage.setItem(BLESS_KEY, String(blessCount));
        } catch (_) {}
        updateBlessUI();
        if (window.RoyalParticles) {
          window.RoyalParticles.confetti(0.5, 135);
          window.RoyalParticles.hearts();
          if (e.clientX) window.RoyalParticles.sparkAt(e.clientX, e.clientY, 20);
        }
        if (window.RoyalAudio) {
          window.RoyalAudio.playDoorGrandReveal();
        }
      });
    }

    // Interactive Palace Diyas
    diyaBtns.forEach((btn, idx) => {
      btn.addEventListener('click', (e) => {
        btn.classList.toggle('lit');
        const litCount = $$('.diya-btn.lit').length;
        if (window.RoyalParticles && e.clientX) {
          window.RoyalParticles.sparkAt(e.clientX, e.clientY, 14);
        }
        if (window.RoyalAudio) {
          window.RoyalAudio.pluckSantoor(329.63 + idx * 55, 0.14);
        }
        if (diyaStatus) {
          if (litCount === diyaBtns.length) {
            diyaStatus.textContent = '✨ All 5 Auspicious Palace Diyas Are Glowing Brightly! Shubh Deepotsav! ✨';
            if (window.RoyalParticles) window.RoyalParticles.confetti(0.55, 95);
          } else {
            diyaStatus.textContent = `${litCount} of ${diyaBtns.length} Palace Diyas Lit · Tap each diya to illuminate the mandap`;
          }
        }
      });
    });
  }

  /* ========================================================================
     7. ACTIVITY 6: ROYAL JHAROKHA GALLERY & PHOTO PREVIEWER
     ======================================================================== */
  function initJharokhaGallery() {
    const fileInputs = $$('.frame-photo-input');
    const lightbox = $('#royalLightbox');
    const lightboxTitle = $('#lightboxTitle');
    const lightboxDesc = $('#lightboxDesc');
    const lightboxPreview = $('#lightboxPreviewArea');
    const closeLbBtn = $('#closeLightboxBtn');

    fileInputs.forEach((input) => {
      input.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const card = input.closest('.jharokha-card');
        const viewport = card ? card.querySelector('.jharokha-arch-viewport') : null;
        if (!viewport) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
          viewport.innerHTML = '';
          const img = document.createElement('img');
          img.className = 'user-preview-photo';
          img.src = ev.target.result;
          img.alt = 'Preview photograph in Royal Jharokha Frame';
          viewport.appendChild(img);
          if (window.RoyalParticles) window.RoyalParticles.confetti(0.6, 55);
        };
        reader.readAsDataURL(file);
      });
    });

    $$('.jharokha-arch-viewport').forEach((vp) => {
      vp.addEventListener('click', () => {
        if (!lightbox) return;
        const card = vp.closest('.jharokha-card');
        const title = card ? card.querySelector('.jharokha-card-title')?.textContent : 'Royal Portrait Frame';
        const desc = card ? card.querySelector('.jharokha-card-caption')?.textContent : '';
        if (lightboxTitle) lightboxTitle.textContent = title;
        if (lightboxDesc) lightboxDesc.textContent = desc;
        if (lightboxPreview) {
          lightboxPreview.innerHTML = vp.innerHTML;
        }
        lightbox.hidden = false;
      });
    });

    if (closeLbBtn && lightbox) {
      closeLbBtn.addEventListener('click', () => {
        lightbox.hidden = true;
      });
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.hidden = true;
      });
    }
  }

  /* ========================================================================
     8. ACTIVITY 7: CHOOSE YOUR CELEBRATION THEME
     ======================================================================== */
  function initThemeSwitcher() {
    const THEME_KEY = 'tk_royal_theme_mood';
    const themeBtns = $$('[data-set-theme]');

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      themeBtns.forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-set-theme') === theme);
      });
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (_) {}
    }

    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved && ['burgundy', 'gold', 'emerald'].includes(saved)) {
        applyTheme(saved);
      }
    } catch (_) {}

    themeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextTheme = btn.getAttribute('data-set-theme');
        applyTheme(nextTheme);
        if (window.RoyalAudio) {
          window.RoyalAudio.playChime(523.25, 0.12);
        }
      });
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    initScratchCard();
    initRoyalScrollCard();
    initMonogramForge();
    initCountdownAndCalendar();
    initRoyalWishes();
    initBlessingsAndDiyas();
    initJharokhaGallery();
    initThemeSwitcher();
  });
})(window);
