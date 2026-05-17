import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this._generateTextures();
    this._buildUI();
  }

  _generateTextures() {
    // Player circle (white, tinted per team)
    const pg = this.make.graphics({ add: false });
    pg.fillStyle(0xffffff, 1);
    pg.fillCircle(18, 18, 16);
    pg.generateTexture('player', 36, 36);
    pg.destroy();

    // Ball
    const bg = this.make.graphics({ add: false });
    bg.fillStyle(0xffffff, 1);
    bg.fillCircle(12, 12, 12);
    bg.generateTexture('ball', 24, 24);
    bg.destroy();

    // Particle (small dot for trails / explosions)
    const ptg = this.make.graphics({ add: false });
    ptg.fillStyle(0xffffff, 1);
    ptg.fillCircle(4, 4, 4);
    ptg.generateTexture('particle', 8, 8);
    ptg.destroy();

    // Scrolling grid tile
    const gg = this.make.graphics({ add: false });
    gg.lineStyle(1, 0x002244, 1);
    gg.strokeRect(0, 0, 80, 80);
    gg.generateTexture('grid', 80, 80);
    gg.destroy();
  }

  _buildUI() {
    const cx = GAME_CONFIG.width / 2;
    const cy = GAME_CONFIG.height / 2;

    // Scrolling grid background
    this.grid = this.add.tileSprite(cx, cy, GAME_CONFIG.width, GAME_CONFIG.height, 'grid');
    this.grid.setAlpha(0.4);

    // Title glow (drawn behind title text)
    this.titleGlow = this.add.graphics();

    // Title
    this.titleText = this.add.text(cx, cy - 80, 'NEON FUTBOL', {
      fontFamily: 'monospace',
      fontSize: '72px',
      color: '#00ffff',
      stroke: '#0044ff',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(cx, cy, 'Sci-Fi Arcade Football', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#8888cc',
    }).setOrigin(0.5);

    // PLAY button
    const btn = this.add.text(cx, cy + 100, '[ PLAY ]', {
      fontFamily: 'monospace',
      fontSize: '36px',
      color: '#00ff88',
      stroke: '#006633',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor('#00ff88'));
    btn.on('pointerdown', () => this.scene.start('TeamSelectScene'));

    // Pulsing tween on title
    this.tweens.add({
      targets: this.titleText,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Blinking play button
    this.tweens.add({
      targets: btn,
      alpha: 0.4,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  update() {
    this.grid.tilePositionX += 0.4;
    this.grid.tilePositionY += 0.4;
  }
}
