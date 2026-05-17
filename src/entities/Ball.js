import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

export class Ball extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, cx, cy) {
    super(scene, cx, cy, 'ball');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCircle(GAME_CONFIG.ball.radius, 0, 0);
    this.setTint(0x00ffff);
    this.setDepth(15);

    this.glowGfx = scene.add.graphics().setDepth(14);

    this.trail = scene.add.particles(0, 0, 'particle', {
      follow: this,
      lifespan: 220,
      speed: { min: 0, max: 15 },
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.5, end: 0 },
      frequency: 25,
      tint: 0x00ffff,
    });
    this.trail.setDepth(13);

    this.blazeMode = false;
  }

  kick(dx, dy, speed) {
    this.body.setVelocity(dx * speed, dy * speed);
  }

  setBlaze(active) {
    this.blazeMode = active;
    if (active) {
      this.setTint(0xff8800);
      this.trail.setParticleTint(0xff4400);
    } else {
      this.setTint(0x00ffff);
      this.trail.setParticleTint(0x00ffff);
    }
  }

  resetToCenter(cx, cy) {
    this.body.reset(cx, cy);
    this.body.setVelocity(0, 0);
    this.setBlaze(false);
  }

  // Returns true if ball is inside either goal (goal detected externally)
  update(delta, pLeft, pRight, pTop, pBottom, goalTop, goalBottom) {
    const vel = this.body.velocity;

    // Friction
    vel.x *= GAME_CONFIG.ball.friction;
    vel.y *= GAME_CONFIG.ball.friction;
    if (Math.abs(vel.x) < 0.8) vel.x = 0;
    if (Math.abs(vel.y) < 0.8) vel.y = 0;

    const r = GAME_CONFIG.ball.radius;

    // Top / bottom bounce
    if (this.y - r <= pTop) {
      this.y = pTop + r;
      vel.y = Math.abs(vel.y) * GAME_CONFIG.ball.bounceWalls;
    } else if (this.y + r >= pBottom) {
      this.y = pBottom - r;
      vel.y = -Math.abs(vel.y) * GAME_CONFIG.ball.bounceWalls;
    }

    const inGoalY = this.y >= goalTop && this.y <= goalBottom;

    // Left wall — bounce unless in goal lane
    if (this.x - r <= pLeft && !inGoalY) {
      this.x = pLeft + r;
      vel.x = Math.abs(vel.x) * GAME_CONFIG.ball.bounceWalls;
    }

    // Right wall — bounce unless in goal lane
    if (this.x + r >= pRight && !inGoalY) {
      this.x = pRight - r;
      vel.x = -Math.abs(vel.x) * GAME_CONFIG.ball.bounceWalls;
    }

    // Draw glow
    this.glowGfx.clear();
    this.glowGfx.fillStyle(this.blazeMode ? 0xff6600 : 0x00ffff, 0.28);
    this.glowGfx.fillCircle(this.x, this.y, r + 12);
  }

  destroy(fromScene) {
    if (this.glowGfx) this.glowGfx.destroy();
    if (this.trail) this.trail.destroy();
    super.destroy(fromScene);
  }
}
