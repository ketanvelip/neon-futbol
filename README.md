# Neon Futbol

A top-down sci-fi arcade football (soccer) game built with Phaser 3 and Vite.

## Tech Stack

- **Phaser 3** — game framework
- **Vite** — dev server and bundler
- **Arcade Physics** — ball and player movement
- **Web Audio API** — synthesized sound effects (no asset files)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Controls

| Input | Action |
|---|---|
| `WASD` / Arrow keys | Move (auto-switches to player nearest the ball) |
| `Space` | Kick |
| Hold `Space`, release | Power shot (charges over ~1 second) |
| `Q` | Special ability (8s cooldown) |

## Teams

| Team | Color | Ability |
|---|---|---|
| Nova Squad | Electric Blue | **Dash** — 3× speed for 2s |
| Void Strikers | Purple | **Phantom** — AI ignores you for 2s |
| Solar Blaze | Orange | **Blaze Shot** — next kick fires at 2× speed with fire trail |

## Project Structure

```
neon-futbol/
├── index.html
├── src/
│   ├── main.js            # Phaser game init
│   ├── config.js          # All game constants
│   ├── scenes/
│   │   ├── BootScene.js       # Start screen + texture generation
│   │   ├── TeamSelectScene.js # Team picker
│   │   ├── GameScene.js       # Main gameplay
│   │   └── EndScene.js        # Match result
│   ├── entities/
│   │   ├── Player.js          # Player sprite + ability logic
│   │   ├── Ball.js            # Ball physics + effects
│   │   └── AIController.js    # AI heuristics
│   └── systems/
│       ├── HUD.js             # Score, timer, cooldown UI
│       └── SoundManager.js    # Web Audio synthesis
└── football-game-PRD.md   # Original product requirements
```

## Build

```bash
npm run build   # outputs to dist/
```
