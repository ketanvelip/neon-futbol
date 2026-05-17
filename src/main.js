import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import TeamSelectScene from './scenes/TeamSelectScene.js';
import GameScene from './scenes/GameScene.js';
import EndScene from './scenes/EndScene.js';
import { GAME_CONFIG } from './config.js';

new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  backgroundColor: '#050510',
  physics: {
    default: 'arcade',
    arcade: { debug: false, gravity: { x: 0, y: 0 } },
  },
  scene: [BootScene, TeamSelectScene, GameScene, EndScene],
});
