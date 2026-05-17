import { GAME_CONFIG } from '../config.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;
    const cx = GAME_CONFIG.width / 2;

    this.humanNameText = scene.add.text(90, 18, '', {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffffff',
    }).setDepth(100);

    this.aiNameText = scene.add.text(GAME_CONFIG.width - 90, 18, '', {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffffff',
    }).setOrigin(1, 0).setDepth(100);

    this.scoreText = scene.add.text(cx, 14, '0 — 0', {
      fontFamily: 'monospace', fontSize: '34px', color: '#00ffff',
      stroke: '#003366', strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(100);

    this.timerText = scene.add.text(cx, 50, '3:00', {
      fontFamily: 'monospace', fontSize: '22px', color: '#aaddff',
    }).setOrigin(0.5, 0).setDepth(100);

    // Ability cooldown circle (bottom-left)
    this.abilityGfx = scene.add.graphics().setDepth(100);
    this.abilityLabel = scene.add.text(58, 670, 'Q', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(101);

    // Charge text (center bottom)
    this.chargeText = scene.add.text(cx, 676, '', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ffff00',
      stroke: '#ff6600', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(100);

    // Charge ring (drawn around controlled player externally)
    this.chargeGfx = scene.add.graphics().setDepth(50);
  }

  setTeams(humanTeam, aiTeam) {
    this.humanNameText.setText(humanTeam.name).setColor(humanTeam.colorHex);
    this.aiNameText.setText(aiTeam.name).setColor(aiTeam.colorHex);
  }

  update(humanScore, aiScore, timeRemaining, cooldownFrac, charging, chargePercent, controlledPlayer) {
    // Score
    this.scoreText.setText(`${humanScore} — ${aiScore}`);

    // Timer
    const m = Math.floor(timeRemaining / 60);
    const s = Math.floor(timeRemaining % 60);
    this.timerText.setText(`${m}:${s.toString().padStart(2, '0')}`);
    if (timeRemaining <= 30) this.timerText.setColor('#ff4444');

    // Ability cooldown arc
    this._drawCooldown(cooldownFrac);

    // Charge indicator
    if (charging && chargePercent > 0) {
      const msg = chargePercent >= 1 ? 'POWER SHOT CHARGED!' : `Charging ${Math.round(chargePercent * 100)}%`;
      this.chargeText.setText(msg);
    } else {
      this.chargeText.setText('');
    }

    // Charge ring around player
    this.chargeGfx.clear();
    if (charging && chargePercent > 0 && controlledPlayer) {
      const r = 28;
      const start = -Math.PI / 2;
      const end = start + chargePercent * Math.PI * 2;
      const color = chargePercent >= 1 ? 0xffffff : 0xffff00;
      this.chargeGfx.lineStyle(3, color, 1);
      this.chargeGfx.beginPath();
      this.chargeGfx.arc(controlledPlayer.x, controlledPlayer.y, r, start, end, false);
      this.chargeGfx.strokePath();
    }
  }

  _drawCooldown(frac) {
    const gfx = this.abilityGfx;
    const cx = 58, cy = 670, r = 22;
    gfx.clear();
    gfx.fillStyle(0x111133, 0.85);
    gfx.fillCircle(cx, cy, r);
    gfx.lineStyle(2, frac >= 1 ? 0x00ff88 : 0x334466, 1);
    gfx.strokeCircle(cx, cy, r);

    if (frac < 1) {
      // Cooldown remaining sweep (depleting from top, clockwise)
      const sweepEnd = -Math.PI / 2 + frac * Math.PI * 2;
      gfx.fillStyle(0x0022aa, 0.45);
      gfx.slice(cx, cy, r - 2, -Math.PI / 2, sweepEnd, false);
      gfx.fillPath();
    }
  }

  destroy() {
    [this.humanNameText, this.aiNameText, this.scoreText, this.timerText,
      this.abilityGfx, this.abilityLabel, this.chargeText, this.chargeGfx,
    ].forEach(o => o.destroy());
  }
}
