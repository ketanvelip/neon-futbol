import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';
import { Player } from '../entities/Player.js';
import { Ball } from '../entities/Ball.js';
import { AIController } from '../entities/AIController.js';
import { SoundManager } from '../systems/SoundManager.js';
import { HUD } from '../systems/HUD.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init(data) {
    this.humanTeam = data.humanTeam;
    this.aiTeam = data.aiTeam;
  }

  create() {
    this.humanScore = 0;
    this.aiScore = 0;
    this.timeRemaining = GAME_CONFIG.matchDuration;
    this.isGoalScored = false;
    this.matchEnded = false;
    this.charging = false;
    this.chargeStart = 0;
    this.chargePercent = 0;

    const p = GAME_CONFIG.pitch;
    this.pLeft   = p.x;
    this.pRight  = p.x + p.width;
    this.pTop    = p.y;
    this.pBottom = p.y + p.height;
    this.pCX     = p.x + p.width / 2;
    this.pCY     = p.y + p.height / 2;
    this.goalTop    = this.pCY - p.goalHeight / 2;
    this.goalBottom = this.pCY + p.goalHeight / 2;

    this._drawPitch();

    this.ball = new Ball(this, this.pCX, this.pCY);

    this.humanPlayers = GAME_CONFIG.playerPositions.human.map(pos => {
      const p = new Player(this, pos.x, pos.y, this.humanTeam, false);
      p.homeX = pos.x;
      p.homeY = pos.y;
      return p;
    });
    this.aiPlayers = GAME_CONFIG.playerPositions.ai.map(pos =>
      new Player(this, pos.x, pos.y, this.aiTeam, true)
    );

    this.controlledPlayer = this.humanPlayers[0];

    // Ball bounces off all players
    const allPlayers = [...this.humanPlayers, ...this.aiPlayers];
    allPlayers.forEach(p => p.setImmovable(true));
    this.ball.setBounce(0.55);
    this.physics.add.collider(this.ball, allPlayers);

    // AI attacks the human's left goal, defends its own right goal
    this.aiController = new AIController(
      this, this.aiPlayers, this.ball,
      this.pLeft,   // attack goal x (human's goal)
      this.pRight   // defend goal x (ai's goal)
    );
    this.aiController.humanPlayers = this.humanPlayers;

    this.sound$ = new SoundManager(this);
    this.hud = new HUD(this);
    this.hud.setTeams(this.humanTeam, this.aiTeam);

    this._setupInput();
    this._setupTimer();
  }

  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.qKey    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
  }

  _setupTimer() {
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      repeat: GAME_CONFIG.matchDuration - 1,
      callback: () => {
        if (!this.matchEnded && !this.isGoalScored) {
          this.timeRemaining = Math.max(0, this.timeRemaining - 1);
          if (this.timeRemaining === 0) this._endMatch();
        }
      },
    });
  }

  _drawPitch() {
    const p = GAME_CONFIG.pitch;
    const cx = p.x + p.width / 2;
    const cy = p.y + p.height / 2;

    // Outer background panels
    const bg = this.add.graphics().setDepth(0);
    bg.fillStyle(0x050510);
    bg.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);

    const g = this.add.graphics().setDepth(1);

    // Pitch surface
    g.fillStyle(0x03100a);
    g.fillRect(p.x, p.y, p.width, p.height);

    // Grid lines
    g.lineStyle(1, 0x062010, 1);
    for (let x = p.x; x <= p.x + p.width; x += 80) {
      g.beginPath(); g.moveTo(x, p.y); g.lineTo(x, p.y + p.height); g.strokePath();
    }
    for (let y = p.y; y <= p.y + p.height; y += 80) {
      g.beginPath(); g.moveTo(p.x, y); g.lineTo(p.x + p.width, y); g.strokePath();
    }

    // Sidelines
    g.lineStyle(2, 0x00ff88, 0.85);
    g.strokeRect(p.x, p.y, p.width, p.height);

    // Centre line
    g.lineStyle(2, 0x00ff88, 0.55);
    g.beginPath(); g.moveTo(cx, p.y); g.lineTo(cx, p.y + p.height); g.strokePath();

    // Centre circle
    g.strokeCircle(cx, cy, 80);
    g.fillStyle(0x00ff88, 0.75);
    g.fillCircle(cx, cy, 5);

    // Penalty areas
    const penW = 160, penH = 260;
    const penY = cy - penH / 2;
    g.lineStyle(2, 0x00ff88, 0.5);
    g.strokeRect(p.x, penY, penW, penH);
    g.strokeRect(p.x + p.width - penW, penY, penW, penH);

    // Goals
    const gH = p.goalHeight, gD = p.goalDepth;
    const gY = cy - gH / 2;
    g.lineStyle(3, 0x00ffff, 1);
    g.strokeRect(p.x - gD, gY, gD, gH);
    g.strokeRect(p.x + p.width, gY, gD, gH);
    g.fillStyle(0x00ffff, 0.08);
    g.fillRect(p.x - gD, gY, gD, gH);
    g.fillRect(p.x + p.width, gY, gD, gH);
  }

  update(time, delta) {
    if (this.matchEnded || this.isGoalScored) return;

    this._updateControlledPlayer();
    this._handleMovement();
    this._handleKick(time);
    this._handleAbility();

    this.humanPlayers.forEach(p => p.tickCooldown(delta));
    this.aiController.update(delta);

    this.ball.update(delta, this.pLeft, this.pRight, this.pTop, this.pBottom, this.goalTop, this.goalBottom);

    this._checkGoals();

    const cdFrac = this.controlledPlayer.abilityCooldownTimer > 0
      ? 1 - (this.controlledPlayer.abilityCooldownTimer / GAME_CONFIG.abilities.cooldown)
      : 1;
    this.hud.update(
      this.humanScore, this.aiScore, this.timeRemaining,
      cdFrac, this.charging, this.chargePercent, this.controlledPlayer
    );
  }

  _updateControlledPlayer() {
    const outfield = this.humanPlayers.filter(p => p.homeX >= 250);
    let nearest = outfield[0], nearDist = Infinity;
    outfield.forEach(p => {
      const d = Phaser.Math.Distance.Between(p.x, p.y, this.ball.x, this.ball.y);
      if (d < nearDist) { nearDist = d; nearest = p; }
    });
    this.controlledPlayer = nearest;
  }

  _handleMovement() {
    const player = this.controlledPlayer;
    let dx = 0, dy = 0;

    if (this.cursors.left.isDown  || this.wasd.left.isDown)  dx -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) dx += 1;
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    dy -= 1;
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  dy += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      player.faceDirection(dx / len, dy / len);
      const spd = (player.abilityActive && player.team.ability === 'dash')
        ? GAME_CONFIG.player.speed * GAME_CONFIG.abilities.dashMultiplier
        : GAME_CONFIG.player.speed;
      player.setVelocity(dx / len * spd, dy / len * spd);
    } else {
      player.setVelocity(0, 0);
    }

    // Non-controlled players: GK tracks ball Y, others stand still
    this.humanPlayers.forEach(p => {
      if (p === player) return;
      if (p.homeX < 250) {
        // Goalkeeper: slide along goal line tracking ball Y
        const ty = Phaser.Math.Clamp(this.ball.y, this.goalTop, this.goalBottom);
        const dy = ty - p.y;
        if (Math.abs(dy) > 4) {
          p.setVelocity(0, Math.sign(dy) * GAME_CONFIG.player.speed * 0.7);
        } else {
          p.setVelocity(0, 0);
        }
      } else {
        p.setVelocity(0, 0);
      }
    });

    // Clamp all players to pitch
    const r = GAME_CONFIG.player.radius;
    [...this.humanPlayers, ...this.aiPlayers].forEach(p => {
      p.x = Phaser.Math.Clamp(p.x, this.pLeft + r, this.pRight - r);
      p.y = Phaser.Math.Clamp(p.y, this.pTop  + r, this.pBottom - r);
    });
  }

  _handleKick(time) {
    const player = this.controlledPlayer;
    const dist = Phaser.Math.Distance.Between(player.x, player.y, this.ball.x, this.ball.y);
    const inRange = dist < GAME_CONFIG.player.radius + GAME_CONFIG.ball.radius + GAME_CONFIG.player.kickRange;

    if (this.spaceKey.isDown) {
      if (!this.charging) {
        this.charging = true;
        this.chargeStart = time;
        this.chargePercent = 0;
      } else {
        this.chargePercent = Math.min(1, (time - this.chargeStart) / GAME_CONFIG.ball.chargeTime);
      }
    } else if (this.charging) {
      // Released — fire kick
      if (inRange) {
        let speed = GAME_CONFIG.ball.kickSpeed *
          (1 + (GAME_CONFIG.ball.powerKickMultiplier - 1) * this.chargePercent);

        if (player.blazeReady) {
          speed *= 2;
          player.blazeReady = false;
          player.abilityActive = false;
          this.ball.setBlaze(true);
          this.time.delayedCall(2200, () => this.ball.setBlaze(false));
        }

        const isPower = this.chargePercent >= 0.8;
        this.ball.kick(player.facing.x, player.facing.y, speed);

        if (isPower) {
          this.sound$.playPowerShot();
          this._shockwave(player.x, player.y);
          if (this.chargePercent >= 1) this._screenFlash();
        } else {
          this.sound$.playKick();
        }
      }
      this.charging = false;
      this.chargePercent = 0;
    }
  }

  _handleAbility() {
    if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
      const ok = this.controlledPlayer.activateAbility();
      ok ? this.sound$.playAbilityActivate() : this.sound$.playAbilityCooldown();
    }
  }

  _checkGoals() {
    const bx = this.ball.x;
    const by = this.ball.y;
    const inGoalY = by >= this.goalTop && by <= this.goalBottom;
    if (!inGoalY) return;

    if (bx <= this.pLeft) {
      this.aiScore++;
      this._onGoal(this.pLeft, this.pCY, this.aiTeam);
    } else if (bx >= this.pRight) {
      this.humanScore++;
      this._onGoal(this.pRight, this.pCY, this.humanTeam);
    }
  }

  _onGoal(gx, gy, scoringTeam) {
    this.isGoalScored = true;
    this.sound$.playGoal();

    const goalText = this.add.text(this.pCX, this.pCY - 30, 'GOAL!', {
      fontFamily: 'monospace',
      fontSize: '88px',
      color: '#ffff00',
      stroke: '#ff6600',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(200);

    this.tweens.add({
      targets: goalText,
      scaleX: 1.2, scaleY: 1.2,
      duration: 300,
      yoyo: true,
      repeat: 2,
    });

    const emitter = this.add.particles(gx, gy, 'particle', {
      speed: { min: 80, max: 380 },
      angle: { min: 0, max: 360 },
      lifespan: { min: 600, max: 1600 },
      scale: { start: 1.8, end: 0 },
      tint: [0xffff00, 0xff00ff, 0x00ffff, 0xff8800, scoringTeam.color],
      emitting: false,
    });
    emitter.explode(70, gx, gy);

    this.time.delayedCall(2200, () => {
      goalText.destroy();
      emitter.destroy();
      this._kickoff();
    });
  }

  _kickoff() {
    this.ball.resetToCenter(this.pCX, this.pCY);
    GAME_CONFIG.playerPositions.human.forEach((pos, i) => {
      this.humanPlayers[i].setPosition(pos.x, pos.y);
      this.humanPlayers[i].setVelocity(0, 0);
    });
    GAME_CONFIG.playerPositions.ai.forEach((pos, i) => {
      this.aiPlayers[i].setPosition(pos.x, pos.y);
      this.aiPlayers[i].setVelocity(0, 0);
    });
    this.isGoalScored = false;
    this.charging = false;
    this.chargePercent = 0;
  }

  _shockwave(x, y) {
    const g = this.add.graphics().setDepth(50);
    this.tweens.addCounter({
      from: 0, to: 1, duration: 420,
      onUpdate: t => {
        const prog = t.getValue();
        g.clear();
        g.lineStyle(3, 0xffffff, 1 - prog);
        g.strokeCircle(x, y, 10 + prog * 75);
      },
      onComplete: () => g.destroy(),
    });
  }

  _screenFlash() {
    const flash = this.add.graphics().setDepth(300);
    flash.fillStyle(0xffffff, 0.75);
    flash.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
    this.tweens.add({
      targets: flash, alpha: 0, duration: 200,
      onComplete: () => flash.destroy(),
    });
  }

  _endMatch() {
    if (this.matchEnded) return;
    this.matchEnded = true;
    this.timerEvent.remove();

    this.humanPlayers.forEach(p => p.setVelocity(0, 0));
    this.aiPlayers.forEach(p => p.setVelocity(0, 0));
    this.ball.body.setVelocity(0, 0);

    this.sound$.playMatchEnd();

    this.time.delayedCall(1800, () => {
      this.scene.start('EndScene', {
        humanScore: this.humanScore,
        aiScore: this.aiScore,
        humanTeam: this.humanTeam,
        aiTeam: this.aiTeam,
      });
    });
  }
}
