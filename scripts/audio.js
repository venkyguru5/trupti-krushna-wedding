/* ==========================================================================
   ROYAL INDIAN CLASSICAL SOUNDSCAPE & CEREMONIAL AUDIO ENGINE
   Uses Web Audio API for authentic Tanpura drone, Raag Yaman sitar/santoor
   notes, temple bells, and interactive chimes.
   Never autoplays without explicit user interaction.
   ========================================================================== */
(function (window) {
  'use strict';

  const STORAGE_KEY = 'tk_royal_sound_pref';

  class RoyalSoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = false;
      this.masterGain = null;
      this.droneOscs = [];
      this.melodyTimer = null;
      this.lastScratchTick = 0;

      // Raag Yaman frequencies (D4 base: Sa, Re, Ga, Ma#, Pa, Dha, Ni, Sa')
      this.raagYaman = [293.66, 329.63, 369.99, 415.30, 440.00, 493.88, 554.37, 587.33];
    }

    initContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.22;
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return true;
    }

    toggle(forceState) {
      const next = typeof forceState === 'boolean' ? forceState : !this.enabled;
      if (next) {
        if (!this.initContext()) return false;
        this.enabled = true;
        this.startAmbience();
        this.playChime(587.33, 0.35);
      } else {
        this.enabled = false;
        this.stopAmbience();
      }
      try {
        localStorage.setItem(STORAGE_KEY, this.enabled ? 'on' : 'off');
      } catch (_) {}
      this.syncUI();
      return this.enabled;
    }

    syncUI() {
      const navBtn = document.getElementById('soundToggleBtn');
      const navLabel = document.getElementById('soundToggleLabel');
      const introBtn = document.getElementById('introSoundBtn');

      if (navBtn) {
        navBtn.classList.toggle('playing', this.enabled);
        navBtn.setAttribute('aria-pressed', String(this.enabled));
      }
      if (navLabel) {
        navLabel.textContent = this.enabled ? 'ROYAL SOUND ON' : 'SOUND OFF';
      }
      if (introBtn) {
        introBtn.classList.toggle('active', this.enabled);
        introBtn.textContent = this.enabled
          ? '♫ Royal Sitar & Tanpura Ambience: ON'
          : '♫ Enable Royal Sitar & Tanpura Ambience';
      }
    }

    startAmbience() {
      this.stopAmbience();
      if (!this.ctx || !this.enabled) return;

      // Soft Tanpura Drone (D3 = 146.83 Hz, A3 = 220 Hz)
      const freqs = [146.83, 220.0, 293.66];
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = idx === 2 ? 'sine' : 'triangle';
        osc.frequency.value = f;

        filter.type = 'lowpass';
        filter.frequency.value = 420;

        gain.gain.value = idx === 0 ? 0.045 : 0.028;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        this.droneOscs.push({ osc, gain });
      });

      // Gentle periodic Santoor/Sitar pluck in Raag Yaman
      const playNextNote = () => {
        if (!this.enabled || !this.ctx) return;
        const note = this.raagYaman[Math.floor(Math.random() * this.raagYaman.length)];
        this.pluckSantoor(note, 0.09);
        this.melodyTimer = setTimeout(playNextNote, 2400 + Math.random() * 2600);
      };
      this.melodyTimer = setTimeout(playNextNote, 900);
    }

    stopAmbience() {
      if (this.melodyTimer) {
        clearTimeout(this.melodyTimer);
        this.melodyTimer = null;
      }
      this.droneOscs.forEach((item) => {
        try {
          item.osc.stop();
          item.osc.disconnect();
        } catch (_) {}
      });
      this.droneOscs = [];
    }

    pluckSantoor(freq, volume = 0.12) {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 2.4);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 2.5);
      osc2.stop(now + 2.5);
    }

    playChime(baseFreq = 587.33, vol = 0.2) {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      [1, 1.5, 2].forEach((mult, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * mult, now + i * 0.08);
        gain.gain.setValueAtTime(0.001, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(vol / (i + 1), now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + i * 0.08 + 1.8);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 1.9);
      });
    }

    playDoorGrandReveal() {
      if (!this.enabled || !this.ctx) return;
      // Ascending Raag Yaman arpeggio + temple bell
      const chord = [293.66, 369.99, 440.0, 554.37, 587.33, 739.99];
      chord.forEach((f, idx) => {
        setTimeout(() => this.pluckSantoor(f, 0.16), idx * 130);
      });
    }

    playScratchGrain() {
      if (!this.enabled || !this.ctx) return;
      const now = performance.now();
      if (now - this.lastScratchTick < 95) return;
      this.lastScratchTick = now;
      this.pluckSantoor(880 + Math.random() * 440, 0.025);
    }
  }

  window.RoyalAudio = new RoyalSoundEngine();
})(window);
