export class SoundManager {
  constructor(scene) {
    // Use Phaser's Web Audio context so it respects browser autoplay policy
    this.ctx = scene.sound && scene.sound.context ? scene.sound.context : null;
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {}
    }
  }

  _tone(freq, type, duration, volume = 0.3, delay = 0) {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.start(now);
      osc.stop(now + duration + 0.01);
    } catch (_) {}
  }

  playKick() {
    this._tone(220, 'square', 0.08, 0.4);
    this._tone(160, 'sawtooth', 0.12, 0.25, 0.04);
  }

  playPowerShot() {
    this._tone(90, 'sawtooth', 0.35, 0.5);
    this._tone(60, 'sine', 0.5, 0.55, 0.08);
    this._tone(140, 'square', 0.2, 0.3, 0.15);
  }

  playGoal() {
    [440, 554, 659, 880, 1100].forEach((f, i) => {
      this._tone(f, 'sine', 0.35, 0.45, i * 0.13);
    });
  }

  playAbilityActivate() {
    this._tone(880, 'sine', 0.08, 0.3);
    this._tone(1320, 'sine', 0.12, 0.3, 0.09);
    this._tone(1760, 'sine', 0.1, 0.2, 0.18);
  }

  playAbilityCooldown() {
    this._tone(200, 'square', 0.08, 0.2);
  }

  playMatchEnd() {
    [330, 415, 494, 622, 740, 880, 622].forEach((f, i) => {
      this._tone(f, 'sine', 0.45, 0.4, i * 0.18);
    });
  }
}
