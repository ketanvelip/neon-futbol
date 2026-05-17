# Neon Futbol — Claude Code Guide

## Commands

```bash
npm run dev    # start Vite dev server at http://localhost:5173
npm run build  # production build → dist/
```

## Architecture

All game constants live in `src/config.js`. Change values there — do not hardcode numbers in scene or entity files.

Scenes run in this order: `BootScene → TeamSelectScene → GameScene → EndScene`. Scene data is passed via `this.scene.start('SceneName', { ... })` and received in `init(data)`.

Textures are generated programmatically in `BootScene.create()` using `this.make.graphics` + `generateTexture()`. They are globally available to all scenes. Do not add external image assets.

Sounds are synthesized in `SoundManager` using the Web Audio API via `scene.sound.context`. No audio files are used.

## Key Conventions

- **No external assets** — all graphics are Phaser Graphics API or Canvas; all audio is synthesized.
- **Single source of truth** — team definitions (color, ability, name) live only in `GAME_CONFIG.teams`. Adding a team means adding one entry there.
- **Player auto-switch** — `GameScene._updateControlledPlayer()` runs every frame and sets `this.controlledPlayer` to whichever human player is nearest the ball.
- **Non-controlled players** return to `p.homeX / p.homeY` at 55% speed. Home positions are set from `GAME_CONFIG.playerPositions.human` at player creation time.
- **Ball physics** are manual (not Phaser world bounds): friction applied each frame, wall bounce handled in `Ball.update()`, goal detection in `GameScene._checkGoals()`.
- **AI kick cooldown** (`AIController.kickCooldown`) prevents the AI from re-kicking the ball every frame.

## Adding a New Team

1. Add an entry to `GAME_CONFIG.teams` in `src/config.js` with `id`, `name`, `color`, `colorHex`, `ability`, `abilityName`, `abilityDesc`.
2. Implement the ability effect in `Player.activateAbility()` (`src/entities/Player.js`).
3. The team will automatically appear in `TeamSelectScene`.

## Out of Scope (MVP)

- Online or local multiplayer
- Mobile / touch controls
- Difficulty settings
- Persistent scores or save state
- External asset files (images, audio)
