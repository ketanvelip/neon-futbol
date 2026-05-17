export const GAME_CONFIG = {
  width: 1280,
  height: 720,
  matchDuration: 180,

  pitch: {
    x: 80,
    y: 60,
    width: 1120,
    height: 600,
    goalDepth: 20,
    goalHeight: 140,
  },

  ball: {
    radius: 12,
    friction: 0.987,
    bounceWalls: 0.72,
    kickSpeed: 460,
    powerKickMultiplier: 3,
    chargeTime: 1000,
  },

  player: {
    radius: 16,
    speed: 220,
    kickRange: 48,
  },

  ai: {
    speed: 195,
    shootRange: 330,
    powerShotChance: 0.22,
  },

  abilities: {
    cooldown: 8000,
    dashDuration: 2000,
    dashMultiplier: 3,
    phantomDuration: 2000,
  },

  teams: [
    {
      id: 'nova',
      name: 'Nova Squad',
      color: 0x00aaff,
      colorHex: '#00aaff',
      ability: 'dash',
      abilityName: 'Dash',
      abilityDesc: 'Burst of speed for 2 seconds',
    },
    {
      id: 'void',
      name: 'Void Strikers',
      color: 0xaa00ff,
      colorHex: '#aa00ff',
      ability: 'phantom',
      abilityName: 'Phantom',
      abilityDesc: 'Invisibility — AI ignores you for 2s',
    },
    {
      id: 'solar',
      name: 'Solar Blaze',
      color: 0xff8800,
      colorHex: '#ff8800',
      ability: 'blaze',
      abilityName: 'Blaze Shot',
      abilityDesc: 'Next shot fires 2× speed with fire trail',
    },
  ],

  playerPositions: {
    human: [
      { x: 160, y: 360 },
      { x: 360, y: 220 },
      { x: 360, y: 500 },
    ],
    ai: [
      { x: 1120, y: 360 },
      { x: 920, y: 220 },
      { x: 920, y: 500 },
    ],
  },
};
