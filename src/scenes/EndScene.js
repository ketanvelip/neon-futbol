import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

export default class EndScene extends Phaser.Scene {
  constructor() { super('EndScene'); }

  init(data) {
    this.humanScore = data.humanScore;
    this.aiScore    = data.aiScore;
    this.humanTeam  = data.humanTeam;
    this.aiTeam     = data.aiTeam;
  }

  create() {
    const cx = GAME_CONFIG.width / 2;
    const cy = GAME_CONFIG.height / 2;

    // Background
    const grid = this.add.tileSprite(cx, cy, GAME_CONFIG.width, GAME_CONFIG.height, 'grid');
    grid.setAlpha(0.3);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x050510, 0.6);
    overlay.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);

    // Result panel
    const panelW = 600, panelH = 400;
    const panel = this.add.graphics();
    panel.fillStyle(0x080820, 0.95);
    panel.fillRoundedRect(cx - panelW / 2, cy - panelH / 2, panelW, panelH, 16);
    panel.lineStyle(2, 0x00ffff, 0.8);
    panel.strokeRoundedRect(cx - panelW / 2, cy - panelH / 2, panelW, panelH, 16);

    // Winner / Outcome text
    let outcomeText, outcomeColor;
    if (this.humanScore > this.aiScore) {
      outcomeText = 'VICTORY!';
      outcomeColor = '#00ff88';
    } else if (this.aiScore > this.humanScore) {
      outcomeText = 'DEFEAT';
      outcomeColor = '#ff4444';
    } else {
      outcomeText = 'DRAW';
      outcomeColor = '#ffff00';
    }

    this.add.text(cx, cy - 140, outcomeText, {
      fontFamily: 'monospace',
      fontSize: '52px',
      color: outcomeColor,
      stroke: '#000033',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Team names row
    this.add.text(cx - 120, cy - 60, this.humanTeam.name, {
      fontFamily: 'monospace', fontSize: '18px', color: this.humanTeam.colorHex,
    }).setOrigin(0.5);

    this.add.text(cx + 120, cy - 60, this.aiTeam.name, {
      fontFamily: 'monospace', fontSize: '18px', color: this.aiTeam.colorHex,
    }).setOrigin(0.5);

    // Final score
    this.add.text(cx, cy, `${this.humanScore}  —  ${this.aiScore}`, {
      fontFamily: 'monospace',
      fontSize: '64px',
      color: '#00ffff',
      stroke: '#003366',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Buttons
    const playAgainBtn = this.add.text(cx - 130, cy + 120, '[ PLAY AGAIN ]', {
      fontFamily: 'monospace', fontSize: '24px', color: '#00ff88',
      stroke: '#006633', strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const changeTeamBtn = this.add.text(cx + 130, cy + 120, '[ CHANGE TEAM ]', {
      fontFamily: 'monospace', fontSize: '24px', color: '#aaaaff',
      stroke: '#222266', strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playAgainBtn.on('pointerover', () => playAgainBtn.setColor('#ffffff'));
    playAgainBtn.on('pointerout',  () => playAgainBtn.setColor('#00ff88'));
    playAgainBtn.on('pointerdown', () => {
      this.scene.start('GameScene', { humanTeam: this.humanTeam, aiTeam: this.aiTeam });
    });

    changeTeamBtn.on('pointerover', () => changeTeamBtn.setColor('#ffffff'));
    changeTeamBtn.on('pointerout',  () => changeTeamBtn.setColor('#aaaaff'));
    changeTeamBtn.on('pointerdown', () => this.scene.start('TeamSelectScene'));

    // Particle burst on victory
    if (this.humanScore > this.aiScore) {
      const emitter = this.add.particles(cx, cy - 200, 'particle', {
        speed: { min: 100, max: 350 },
        angle: { min: 0, max: 360 },
        lifespan: 1500,
        scale: { start: 1.5, end: 0 },
        tint: [0x00ff88, 0x00ffff, 0xffff00],
        emitting: false,
      });
      emitter.explode(50, cx, cy - 200);
    }

    // Scrolling grid
    this.gridTile = grid;
  }

  update() {
    this.gridTile.tilePositionX += 0.3;
    this.gridTile.tilePositionY += 0.3;
  }
}
