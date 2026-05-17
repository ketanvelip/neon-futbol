import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

const PITCH = GAME_CONFIG.pitch;
const PITCH_TOP    = PITCH.y + 40;
const PITCH_BOTTOM = PITCH.y + PITCH.height - 40;

export class AIController {
  constructor(scene, players, ball, attackGoalX, defendGoalX) {
    this.scene = scene;
    this.players = players;
    this.ball = ball;
    this.attackGoalX = attackGoalX;
    this.goalY = PITCH.y + PITCH.height / 2;
    this.defendGoalX = defendGoalX;
    this.humanPlayers = null;
    this.kickCooldown = 0;
  }

  update(delta) {
    this.kickCooldown = Math.max(0, this.kickCooldown - delta);

    const phantom = this._isPhantomActive();

    // Goalkeeper stays near goal — never selected as chaser
    const gk      = this.players.find(p => p.homeX > this.defendGoalX - 200);
    const outfield = this.players.filter(p => p !== gk);

    // GK tracks ball Y along goal line
    if (gk) this._updateGK(gk);

    // Nearest outfield player chases the ball
    let chaser = outfield[0], chaserDist = Infinity;
    outfield.forEach(p => {
      const d = Phaser.Math.Distance.Between(p.x, p.y, this.ball.x, this.ball.y);
      if (d < chaserDist) { chaserDist = d; chaser = p; }
    });

    outfield.forEach(p => {
      if (p === chaser) {
        if (phantom) {
          p.setVelocity(p.body.velocity.x * 0.5, p.body.velocity.y * 0.5);
        } else {
          p.moveToward(this.ball.x, this.ball.y);
        }
        this._tryKick(p, chaserDist);
      } else {
        this._updateDefender(p);
      }
    });
  }

  _updateGK(gk) {
    const ty = Phaser.Math.Clamp(this.ball.y, this.goalY - PITCH.goalHeight / 2, this.goalY + PITCH.goalHeight / 2);
    gk.moveToward(gk.homeX, ty);
  }

  _updateDefender(p) {
    // Each defender holds a position between ball and own goal,
    // offset to their natural side so they don't stack on each other
    const defX = Phaser.Math.Clamp(
      (this.ball.x + this.defendGoalX) / 2,
      Math.min(this.attackGoalX, this.defendGoalX) + 60,
      Math.max(this.attackGoalX, this.defendGoalX) - 60
    );
    const sideOffset = p.homeY < this.goalY ? -75 : 75;
    const defY = Phaser.Math.Clamp(this.ball.y + sideOffset, PITCH_TOP, PITCH_BOTTOM);
    p.moveToward(defX, defY);
  }

  _isPhantomActive() {
    return this.humanPlayers && this.humanPlayers.some(p => p.isPhantom);
  }

  _tryKick(player, distToBall) {
    const touchRange = GAME_CONFIG.player.radius + GAME_CONFIG.ball.radius + 6;
    if (distToBall > touchRange || this.kickCooldown > 0) return;

    const dx = this.attackGoalX - this.ball.x;
    const dy = this.goalY - this.ball.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;

    const distToGoal = Phaser.Math.Distance.Between(player.x, player.y, this.attackGoalX, this.goalY);
    const inShootRange = distToGoal < GAME_CONFIG.ai.shootRange;
    const usePower = inShootRange && Math.random() < GAME_CONFIG.ai.powerShotChance;

    const speed = usePower
      ? GAME_CONFIG.ball.kickSpeed * 2.2
      : GAME_CONFIG.ball.kickSpeed * 0.85;

    this.ball.kick(dx / len, dy / len, speed);
    this.kickCooldown = 350;
  }
}
