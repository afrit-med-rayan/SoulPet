# 🐾 SoulPet (Pixel Art Edition)

> A living 2D virtual pet with an emotional AI engine, memory system, and adaptive personality — built entirely with HTML5 Canvas + Vanilla JS. Zero dependencies, runs in the browser.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎨 2D Canvas World | Hand-drawn pet & environment using Canvas 2D API (Pixel Art style) |
| 😊 Emotional Engine | 6 live stats: happiness, hunger, energy, trust, loneliness, curiosity |
| 🧠 Memory System | Tracks every interaction across sessions and computes lifetime level |
| 🧬 Personality System | 7 dynamic traits derived from behaviour with UI badges |
| 🌗 Day/Night Cycle | World background and AI behaviour adapt to your real-world clock |
| 💬 AI Speech Bubbles | Pet speaks autonomously based on internal state and time of day |
| 💾 Persistence | Full state saved to `localStorage`, survives page reloads |
| ⏳ Offline Fast-Forward | Pet's stats continue to evolve while the app is closed |
| 📖 Pet Journal | Rich modal showing memory + personality breakdown |

---

## 🚀 Getting Started

Because SoulPet uses ES6 modules, it must be run via a local web server (to avoid CORS issues).

```bash
# Clone the repo
git clone https://github.com/afrit-med-rayan/SoulPet.git
cd SoulPet

# Serve locally using Python
python -m http.server 8000
# Then open http://localhost:8000

# Or serve using npx
npx serve .
```

---

## 🗂️ Project Structure

```
SoulPet/
├── index.html              # App shell + modals
├── css/
│   └── style.css           # Full design system (Pixel Art Edition)
├── js/
│   ├── main.js             # App bootstrap + UI wiring
│   ├── game.js             # RAF game loop + canvas controller
│   ├── world.js            # Background scene (sky, ground, clouds, stars)
│   ├── pet.js              # Pet entity — drawn with Canvas 2D, animated states
│   ├── emotions.js         # Emotional state engine (6 stats, decay, interactions)
│   ├── memory.js           # Memory system (interaction logs, neglect tracking)
│   ├── personality.js      # Personality adaptation (7 traits)
│   ├── evolution.js        # Emotion → visual state mapping
│   ├── pet_ai.js           # Autonomous AI: speech, wander, day/night behaviour
│   └── storage.js          # localStorage save/load + offline progression
└── assets/
    └── README.md
```

---

## 🧬 Personality System

Seven personality traits are dynamically computed from live emotions and interaction memory:

| Trait | Color | Driven By |
|---|---|---|
| 💗 Affectionate | Pink | High trust + frequent talking |
| 🎾 Playful | Amber | High play session ratio |
| 🔭 Curious | Green | High curiosity stat + play |
| 🫣 Shy | Indigo | Low trust + few interactions |
| ⚡ Energetic | Cyan | High energy + frequent play |
| 😈 Mischievous | Orange | Play far outweighs sleep |
| 🌑 Withdrawn | Slate | Neglect days + loneliness |

- Traits are **scored 0–100** and recomputed continuously.
- The **top 1–3 traits** scoring above 35/100 are shown as **color-coded badges** in the stat panel.
- Hovering over a badge shows the exact score as a tooltip.
- The **Journal modal** shows a full breakdown of all 7 traits.

---

## 🎮 Interactions

| Button | Effect |
|---|---|
| 🍖 Feed | Hunger ↓, Happiness ↑, Trust ↑ |
| 🎾 Play | Happiness ↑↑, Energy ↓, Loneliness ↓, Curiosity ↑ |
| 💬 Talk | Loneliness ↓, Trust ↑, Happiness ↑ |
| 💤 Sleep | Energy ↑↑, Hunger ↑ slightly |
| 🛁 Clean | Happiness ↑, Trust ↑ |
| 📖 Journal | Opens memory + personality breakdown |

---

## 🏗️ Implementation Phases

- [x] Phase 1 — Project scaffolding & module setup
- [x] Phase 2 — Game loop & canvas engine (`game.js`)
- [x] Phase 3 — World renderer — sky, ground, clouds, day/night (`world.js`)
- [x] Phase 4 — Pet entity — Canvas-drawn, animated states (`pet.js`)
- [x] Phase 5 — Emotional state engine (`emotions.js`)
- [x] Phase 6 — Memory system (`memory.js`)
- [x] Phase 7 — Personality system (`personality.js`)
- [x] Phase 8 — Visual evolution (`evolution.js`)
- [x] Phase 9 — Pet AI layer (`pet_ai.js`)
- [x] Phase 10 — UI overlays polish (`index.html`, `style.css`)
- [x] Phase 11 — Persistence layer & Offline fast-forward (`storage.js`)
- [x] Phase 12 — Polish & final README

---

## 🎨 Design System

- **Theme:** 8-bit Pixel Art Aesthetic
- **Palette:** Deep space dark `#1a1c2c` · Cosmic purple `#7c3aed` · Warm amber `#f59e0b` · Soft cyan `#06b6d4`
- **Typography:** [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) — retro pixel font
- **Effects:** Solid borders · Pixel-snapped canvas drawing · Retro button press animations

---

## 📄 License

MIT — see [LICENSE](LICENSE)
