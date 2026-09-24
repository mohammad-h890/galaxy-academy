// Web Audio API Synthesizer for Galaxy Academy
let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export const SoundFX = {
  isMuted: () => !soundEnabled,
  toggleSound: () => {
    soundEnabled = !soundEnabled;
    return soundEnabled;
  },
  setSoundEnabled: (val: boolean) => {
    soundEnabled = val;
  },

  init: () => {
    if (typeof window === 'undefined') return;
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  },

  playTone: (freq: number, type: OscillatorType, duration: number, gainVal = 0.15) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      SoundFX.init();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Audio context might fail in silent autoplay policies
    }
  },

  click: () => {
    SoundFX.playTone(580, 'sine', 0.08, 0.1);
  },

  success: () => {
    SoundFX.playTone(440, 'triangle', 0.12, 0.15);
    setTimeout(() => {
      SoundFX.playTone(660, 'triangle', 0.18, 0.18);
    }, 80);
    setTimeout(() => {
      SoundFX.playTone(880, 'sine', 0.25, 0.2);
    }, 160);
  },

  lifeEnergy: () => {
    SoundFX.playTone(523.25, 'sine', 0.1, 0.15);
    setTimeout(() => SoundFX.playTone(659.25, 'sine', 0.12, 0.15), 60);
    setTimeout(() => SoundFX.playTone(783.99, 'sine', 0.15, 0.18), 120);
    setTimeout(() => SoundFX.playTone(1046.5, 'sine', 0.25, 0.2), 180);
  },

  terraforming: () => {
    SoundFX.playTone(220, 'triangle', 0.2, 0.2);
    setTimeout(() => SoundFX.playTone(330, 'triangle', 0.25, 0.2), 100);
    setTimeout(() => SoundFX.playTone(440, 'sine', 0.35, 0.22), 200);
    setTimeout(() => SoundFX.playTone(554.37, 'sine', 0.45, 0.25), 320);
  },

  error: () => {
    SoundFX.playTone(220, 'sawtooth', 0.25, 0.2);
  },

  shatter: () => {
    SoundFX.playTone(850, 'square', 0.06, 0.12);
    setTimeout(() => {
      SoundFX.playTone(520, 'square', 0.12, 0.14);
    }, 50);
  },

  laserAlign: () => {
    SoundFX.playTone(360, 'sawtooth', 0.09, 0.15);
    setTimeout(() => {
      SoundFX.playTone(780, 'sine', 0.32, 0.2);
    }, 80);
  },

  laser: () => {
    SoundFX.laserAlign();
  },

  gearSpin: () => {
    SoundFX.playTone(190, 'sawtooth', 0.09, 0.15);
    setTimeout(() => {
      SoundFX.playTone(280, 'sawtooth', 0.16, 0.18);
    }, 90);
  },

  victory: () => {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((note, idx) => {
      setTimeout(() => {
        SoundFX.playTone(note, 'triangle', 0.4, 0.22);
      }, idx * 130);
    });
  }
};
