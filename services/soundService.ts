// Audio Notification Service using Web Audio API
// 100% offline, zero latency, guaranteed to work in modern browsers without external asset dependencies.

class SoundService {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Unlocks audio upon user gesture
  public enableAudio() {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  // 1. Restaurant Order Notification Chime (Bell / Cash Register Ring)
  public playRestaurantOrderChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // First Ding (High frequency crystal bell)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.15); // E6
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.9);

      // Second Harmonic Ding (0.18s later)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1760, now + 0.18); // A6
      gain2.gain.setValueAtTime(0.3, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 1.2);

      // Third Rich Low Body
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(587.33, now + 0.18); // D5
      gain3.gain.setValueAtTime(0.2, now + 0.18);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.18);
      osc3.stop(now + 1.0);
    } catch (e) {
      console.warn('Could not play restaurant chime:', e);
    }
  }

  // 2. Driver Notification Ringtone (Dynamic rhythmic dispatch alert for incoming delivery)
  public playDriverDispatchRingtone() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // 3 distinct pulsed alerts: Bip-Bip-Ring!
      const beeps = [0, 0.16, 0.32];
      beeps.forEach((timeOffset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 2 ? 1046.5 : 783.99, now + timeOffset); // G5 -> C6
        gain.gain.setValueAtTime(0.4, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.15);
      });

      // Tail chime
      const oscTail = ctx.createOscillator();
      const gainTail = ctx.createGain();
      oscTail.type = 'triangle';
      oscTail.frequency.setValueAtTime(1318.51, now + 0.48); // E6
      gainTail.gain.setValueAtTime(0.35, now + 0.48);
      gainTail.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      oscTail.connect(gainTail);
      gainTail.connect(ctx.destination);
      oscTail.start(now + 0.48);
      oscTail.stop(now + 1.2);
    } catch (e) {
      console.warn('Could not play driver dispatch ringtone:', e);
    }
  }

  // 3. Success / Order Accepted Chime
  public playSuccessChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.36);
      });
    } catch (e) {
      console.warn('Could not play success chime:', e);
    }
  }

  // 4. Timer Urgency Click / Tick for 30s countdown final seconds
  public playTimerTick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn('Could not play tick:', e);
    }
  }
}

export const soundService = new SoundService();
