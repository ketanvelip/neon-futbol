import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

export default class TeamSelectScene extends Phaser.Scene {
  constructor() {
    super('TeamSelectScene');
    this.selectedIndex = 0;
  }

  create() {
    const cx = GAME_CONFIG.width / 2;
    const { teams } = GAME_CONFIG;

    // Background grid
    const grid = this.add.tileSprite(cx, GAME_CONFIG.height / 2, GAME_CONFIG.width, GAME_CONFIG.height, 'grid');
    grid.setAlpha(0.3);

    this.add.text(cx, 40, 'SELECT YOUR TEAM', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#00ffff',
      stroke: '#0044ff',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Team cards
    const cardW = 300, cardH = 260;
    const spacing = 340;
    const startX = cx - spacing;
    const cardY = 300;

    this.cardGraphics = teams.map((team, i) => {
      const cardX = startX + i * spacing;
      const gfx = this.add.graphics();
      this._drawCard(gfx, cardX, cardY, cardW, cardH, team, i === this.selectedIndex);

      // Team name
      this.add.text(cardX, cardY - 90, team.name, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: team.colorHex,
      }).setOrigin(0.5);

      // Color swatch circle
      const swatch = this.add.graphics();
      swatch.fillStyle(team.color, 1);
      swatch.fillCircle(cardX, cardY - 30, 28);

      // Ability name
      this.add.text(cardX, cardY + 30, team.abilityName, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffff00',
      }).setOrigin(0.5);

      // Ability desc
      this.add.text(cardX, cardY + 65, team.abilityDesc, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#aaaaaa',
        wordWrap: { width: cardW - 20 },
        align: 'center',
      }).setOrigin(0.5);

      // Invisible hit area
      const zone = this.add.zone(cardX, cardY, cardW, cardH).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        this.selectedIndex = i;
        this._refreshCards();
      });

      return gfx;
    });

    // Confirm button
    this.confirmBtn = this.add.text(cx, 520, '[ CONFIRM ]', {
      fontFamily: 'monospace',
      fontSize: '30px',
      color: '#00ff88',
      stroke: '#006633',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.confirmBtn.on('pointerover', () => this.confirmBtn.setColor('#ffffff'));
    this.confirmBtn.on('pointerout', () => this.confirmBtn.setColor('#00ff88'));
    this.confirmBtn.on('pointerdown', () => this._startMatch());

    // Back button
    const back = this.add.text(60, 680, '< BACK', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#556677',
    }).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('BootScene'));
  }

  _drawCard(gfx, cx, cy, w, h, team, selected) {
    gfx.clear();
    const x = cx - w / 2;
    const y = cy - h / 2;
    gfx.fillStyle(selected ? 0x0a1a3a : 0x050a14, 1);
    gfx.fillRoundedRect(x, y, w, h, 12);
    gfx.lineStyle(selected ? 3 : 1, selected ? team.color : 0x223344, 1);
    gfx.strokeRoundedRect(x, y, w, h, 12);
  }

  _refreshCards() {
    const { teams } = GAME_CONFIG;
    const spacing = 340;
    const startX = GAME_CONFIG.width / 2 - spacing;
    const cardY = 300;
    const cardW = 300, cardH = 260;

    this.cardGraphics.forEach((gfx, i) => {
      this._drawCard(gfx, startX + i * spacing, cardY, cardW, cardH, teams[i], i === this.selectedIndex);
    });
  }

  _startMatch() {
    const { teams } = GAME_CONFIG;
    const humanTeam = teams[this.selectedIndex];
    const remaining = teams.filter((_, i) => i !== this.selectedIndex);
    const aiTeam = remaining[Math.floor(Math.random() * remaining.length)];
    this.scene.start('GameScene', { humanTeam, aiTeam });
  }
}
