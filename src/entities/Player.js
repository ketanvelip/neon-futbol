import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, team, isAI) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.team = team;
    this.isAI = isAI;
    this.facing = new Phaser.Math.Vector2(isAI ? -1 : 1, 0);
    this.abilityActive = false;
    this.abilityCooldownTimer = 0;
    this.blazeReady = false;

    // Center the physics circle on the sprite
    const r = GAME_CONFIG.player.radius;
    this.setCircle(r, 18 - r, 18 - r);
    this.setTint(team.color);
    this.setDepth(10);

    // Glow graphics rendered behind the sprite
    this.glowGfx = scene.add.graphics().setDepth(9);
    this._drawGlow();
  }

  _drawGlow(alpha = 0.35) {
    this.glowGfx.clear();
    this.glowGfx.fillStyle(this.team.color, alpha);
    this.glowGfx.fillCircle(this.x, this.y, GAME_CONFIG.player.radius + 8);
  }

  faceDirection(dx, dy) {
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) this.facing.set(dx / len, dy / len);
  }

  moveToward(tx, ty) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 4) { this.setVelocity(0, 0); return; }
    const speed = this._currentSpeed();
    this.facing.set(dx / dist, dy / dist);
    this.setVelocity(this.facing.x * speed, this.facing.y * speed);
  }

  _currentSpeed() {
    if (this.abilityActive && this.team.ability === 'dash') {
      return GAME_CONFIG.player.speed * GAME_CONFIG.abilities.dashMultiplier;
    }
    return this.isAI ? GAME_CONFIG.ai.speed : GAME_CONFIG.player.speed;
  }

  activateAbility() {
    if (this.abilityCooldownTimer > 0) return false;

    this.abilityCooldownTimer = GAME_CONFIG.abilities.cooldown;
    this.abilityActive = true;

    if (this.team.ability === 'dash') {
      this.scene.time.delayedCall(GAME_CONFIG.abilities.dashDuration, () => {
        this.abilityActive = false;
      });
    } else if (this.team.ability === 'phantom') {
      this.isPhantom = true;
      this.setAlpha(0.25);
      this.scene.time.delayedCall(GAME_CONFIG.abilities.phantomDuration, () => {
        this.abilityActive = false;
        this.isPhantom = false;
        this.setAlpha(1);
      });
    } else if (this.team.ability === 'blaze') {
      this.blazeReady = true;
      // Fallback: clear blaze state after 10s if the player never kicks
      this.scene.time.delayedCall(10000, () => {
        if (this.blazeReady) {
          this.blazeReady = false;
          this.abilityActive = false;
        }
      });
    }

    return true;
  }

  tickCooldown(delta) {
    if (this.abilityCooldownTimer > 0) {
      this.abilityCooldownTimer = Math.max(0, this.abilityCooldownTimer - delta);
    }
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this._drawGlow(this.abilityActive ? 0.65 : 0.3);
  }

  destroy(fromScene) {
    if (this.glowGfx) this.glowGfx.destroy();
    super.destroy(fromScene);
  }
}
