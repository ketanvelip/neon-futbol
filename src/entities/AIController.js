import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

export class AIController {
  constructor(scene, players, ball, attackGoalX, defendGoalX) {
    this.scene = scene;
    this.players = players;
    this.ball = ball;
    this.attackGoalX = attackGoalX; // x of the goal to attack (human's left goal)
    this.goalY = GAME_CONFIG.pitch.y + GAME_CONFIG.pitch.height / 2;
    this.defendGoalX = defendGoalX; // x of goal to protect (AI's right goal)
    this.humanPlayers = null; // set by GameScene for phantom awareness
    this.kickCooldown = 0;
  }

  update(delta) {
    this.kickCooldown = Math.max(0, this.kickCooldown - delta);

    const phantom = this._isPhantomActive();

    // Find nearest AI player to ball
    let chaser = this.players[0];
    let chaserDist = Infinity;
    this.players.forEach(p => {
      const d = Phaser.Math.Distance.Between(p.x, p.y, this.ball.x, this.ball.y);
      if (d < chaserDist) { chaserDist = d; chaser = p; }
    });

    this.players.forEach(p => {
      if (p === chaser) {
        // Phantom: chaser moves at half speed — loses confidence without a visible player
        if (phantom) p.setVelocity(p.body.velocity.x * 0.5, p.body.velocity.y * 0.5);
        else p.moveToward(this.ball.x, this.ball.y);
        this._tryKick(p, chaserDist);
      } else {
        const defX = (this.ball.x + this.defendGoalX) / 2;
        const defY = (this.ball.y + this.goalY) / 2;
        p.moveToward(defX, defY);
      }
    });
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

    const distToGoal = Phaser.Math.Distance.Between(player.x, player.y, this.attackGoalX, this.attackGoalY);
    const inShootRange = distToGoal < GAME_CONFIG.ai.shootRange;
    const usePower = inShootRange && Math.random() < GAME_CONFIG.ai.powerShotChance;

    const speed = usePower
      ? GAME_CONFIG.ball.kickSpeed * 2.2
      : GAME_CONFIG.ball.kickSpeed * 0.85;

    this.ball.kick(dx / len, dy / len, speed);
    this.kickCooldown = 350; // prevent rapid re-kicking
  }
}
