# Product Requirements Document
## Sci-Fi Arcade Football Game (Top-Down) — *Neon Futbol*

---

## 1. Overview

A top-down, arcade-style sci-fi football (soccer) game built in the browser using **Phaser 3** (loaded via CDN). The player controls a futuristic team against an AI opponent on a neon-lit pitch. The game emphasizes fast, fun gameplay with power shots, special abilities, and team customization.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Game Framework | Phaser 3 (CDN) |
| Physics | Phaser 3 built-in Matter.js or Arcade Physics |
| Rendering | HTML5 Canvas |
| Delivery | Single HTML file artifact |
| Audio | Phaser 3 Sound Manager (Web Audio API) |

---

## 3. Game Modes

- **Player vs AI** only (single-player)
- AI controls the opposing team using basic heuristics (chase ball, defend goal, shoot when in range)

---

## 4. Theme & Aesthetic

- **Sci-fi / futuristic** setting
- Neon color palette: electric blue, hot pink, cyan, purple on a dark background
- Glowing ball with particle trail
- Players rendered as sleek humanoid robots or energy-form avatars (geometric shapes with glow effects are acceptable for MVP)
- Pitch: dark surface with glowing grid lines, neon sidelines, and holographic goal posts
- HUD styled like a futuristic dashboard with digital fonts

---

## 5. Core Gameplay

### 5.1 Field & Ball
- Top-down 2D pitch with clearly marked center circle, penalty areas, and goal zones
- Ball moves with physics: velocity, friction, and bounce off walls/players
- Ball responds to kick direction and power

### 5.2 Player Control (Human Team)
- **Movement:** Arrow keys or WASD — moves the nearest player to the ball automatically (auto-switch on proximity)
- **Kick / Pass:** Spacebar — kicks the ball in the direction the player is facing
- **Power Shot:** Hold Spacebar (charge up) then release — fires a high-speed shot with visual charge indicator and screen flash on release
- **Special Ability:** `Q` key — triggers the selected player's unique ability (see Section 7)

### 5.3 AI Opponent
- AI team has the same number of players as the human team
- AI behavior:
  - Nearest AI player to the ball chases it
  - AI shoots when within a defined shooting range of the goal
  - Defenders position between the ball and their own goal
  - AI uses power shots occasionally (randomized chance) when in range
  - AI does NOT use special abilities (MVP simplification)

---

## 6. Match Structure

- Match duration: **3 minutes** (configurable via a constant)
- Score tracked for both teams
- Match ends when timer hits 0:00
- End screen shows final score with options to **Play Again** or **Change Team**
- No extra time or penalties in MVP

---

## 7. Team Selection

### 7.1 Screen
- Shown before each match
- Player picks one of **3 teams**, AI is randomly assigned one of the remaining two

### 7.2 Teams

| Team Name | Color | Special Ability |
|---|---|---|
| **Nova Squad** | Electric Blue / White | **Dash** — burst of speed for 2 seconds |
| **Void Strikers** | Purple / Black | **Phantom** — brief invisibility (AI cannot track you for 2s) |
| **Solar Blaze** | Orange / Yellow | **Blaze Shot** — next shot is 2× speed and ignites the ball with particle FX |

### 7.3 Team Display
- Each team shown as a card with team name, color swatch, and ability description
- Highlight selected team; confirm button starts the match

---

## 8. Power Shot Mechanics

- Player holds Spacebar to charge (0 to 100% over ~1 second)
- A visible circular charge indicator fills up around the player
- On release:
  - Shot speed scales linearly with charge (minimum kick speed to 3× maximum)
  - A shockwave ring visual effect emits from the player
  - Ball glows brighter during travel
  - Screen briefly flashes white at full charge

---

## 9. Special Abilities

- Triggered with `Q` key
- Each ability has a **cooldown of 8 seconds** shown as a circular timer in the HUD
- Cooldown begins immediately after use

| Ability | Effect | Duration |
|---|---|---|
| **Dash** | Player velocity ×3 in current direction | 2 seconds |
| **Phantom** | Player turns semi-transparent; AI ignores them | 2 seconds |
| **Blaze Shot** | Next kick fires at 2× speed with fire particle trail | Until next kick |

---

## 10. HUD (Score & Timer)

Displayed at the top of the screen:

```
[NOVA SQUAD]  2 — 1  [VOID STRIKERS]    02:34
```

- Team names and score on left/right
- Countdown timer in center
- Ability cooldown icon in bottom-left corner (circular cooldown overlay)
- "POWER SHOT CHARGED!" text flash when charge reaches 100%
- Goal scored: large centered text "GOAL!" with particle burst, 2-second pause before kick-off restart

---

## 11. Sound Effects

All sounds synthesized or loaded as short audio cues:

| Event | Sound |
|---|---|
| Kick | Short percussive hit |
| Power shot | Bass-heavy whoosh |
| Goal scored | Ascending synth fanfare |
| Special ability activate | Sci-fi activation chime |
| Ability on cooldown (if pressed too early) | Short error buzz |
| Match end | Longer fanfare or ambient fade |

> Use Phaser's `this.sound` with Web Audio API tones if no asset files are available. Synthesized tones are acceptable for MVP.

---

## 12. Screens & Flow

```
Start Screen
    ↓
Team Selection Screen
    ↓
Match (3 minutes)
    ↓
End Screen (Final Score)
    ↓  [Play Again]     [Change Team]
  Match              Team Selection
```

### Start Screen
- Game title: **"NEON FUTBOL"**
- Subtitle: "Sci-Fi Arcade Football"
- Single button: **PLAY**
- Animated background (scrolling neon grid or pulsing glow)

---

## 13. Out of Scope (MVP)

The following are explicitly excluded from the initial build:

- Online multiplayer
- 1v1 local multiplayer
- More than 3 teams
- Player ability upgrades or progression
- Replay / highlights
- Difficulty settings
- Mobile / touch controls
- Persistent leaderboard or save state

---

## 14. File Deliverable

- **Single self-contained HTML file**
- Phaser 3 loaded from CDN: `https://cdnjs.cloudflare.com/ajax/libs/phaser/3.60.0/phaser.min.js`
- No external assets required (all graphics drawn via Phaser Graphics API or Canvas; sounds synthesized)
- Must run by opening the HTML file in any modern browser

---

## 15. Success Criteria

- [ ] Team selection screen with 3 teams and ability descriptions
- [ ] Playable match vs AI with working kick and movement controls
- [ ] Power shot mechanic with charge indicator and visual feedback
- [ ] At least one special ability working per team (Q key)
- [ ] Score HUD and countdown timer
- [ ] Goal detection and restart from center
- [ ] Match end screen with final score
- [ ] At least 3 sound effects playing correctly
- [ ] All rendered in sci-fi/neon visual style
