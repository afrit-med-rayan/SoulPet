# 🐾 SoulPet

> A living 2D virtual pet with an emotional AI engine, memory system, and adaptive personality — built entirely with HTML5 Canvas + Vanilla JS. Zero dependencies, runs in the browser.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎨 2D Canvas World | Hand-drawn pet & environment using Canvas 2D API |
| 😊 Emotional Engine | 6 live stats: happiness, hunger, energy, trust, loneliness, curiosity |
| 🧠 Memory System | Tracks every interaction across sessions |
| 🧬 Personality System | 7 dynamic traits derived from behaviour (Phase 7) |
| 🌗 Day/Night Cycle | World and AI behaviour adapts to real-world clock |
| 💬 AI Speech Bubbles | Pet speaks autonomously based on internal state |
| 💾 Persistence | Full state saved to `localStorage`, survives page reloads |
| 📖 Pet Journal | Rich modal showing memory + personality breakdown |

---

## 🚀 Getting Started

No install required. Simply open `index.html` in any modern browser:

```bash
# Clone the repo
git clone https://github.com/afrit-med-rayan/SoulPet.git
cd SoulPet

# Open directly (Windows)
start index.html

# Or serve locally
npx serve .
```

---

## 🗂️ Project Structure

```
SoulPet/
├── index.html              # App shell + modals
├── css/
│   └── style.css           # Full design system (glassmorphism, dark cosmic theme)
├── js/
│   ├── main.js             # App bootstrap + UI wiring
│   ├── game.js             # RAF game loop + canvas controller
│   ├── world.js            # Background scene (sky, ground, clouds, stars)
│   ├── pet.js              # Pet entity — drawn with Canvas 2D, animated states
│   ├── emotions.js         # Emotional state engine (6 stats, decay, interactions)
│   ├── memory.js           # Memory system (interaction logs, neglect tracking)
│   ├── personality.js      # Personality adaptation (7 traits — Phase 7)
│   ├── evolution.js        # Emotion → visual state mapping
│   ├── pet_ai.js           # Autonomous AI: speech, wander, day/night behaviour
│   └── storage.js          # localStorage save/load
└── assets/
    └── README.md
```

---

## 🧬 Personality System (Phase 7)

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

- Traits are **scored 0–100** and recomputed after every interaction and every 30-second slow tick.
- The **top 1–3 traits** scoring above 35/100 are shown as **color-coded badges** in the stat panel.
- Hovering over a badge shows the exact score as a tooltip (e.g. `curious: 72/100`).
- Trait scores **persist across sessions** via `localStorage`.
- The **Journal modal** shows a full breakdown of all 7 traits with colored mini progress bars, with active traits highlighted.

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
- [x] **Phase 7 — Personality system (`personality.js`)** ← Current
- [ ] Phase 8 — Visual evolution (`evolution.js`)
- [ ] Phase 9 — Pet AI layer (`pet_ai.js`)
- [ ] Phase 10 — UI overlays polish
- [ ] Phase 11 — Persistence layer (`storage.js`)
- [ ] Phase 12 — Polish & final README

---

## 🎨 Design System

- **Palette:** Deep space dark `#07071a` · Cosmic purple `#7c3aed` · Warm amber `#f59e0b` · Soft cyan `#06b6d4`
- **Typography:** [Nunito](https://fonts.google.com/specimen/Nunito) — rounded, friendly
- **Effects:** Glassmorphism panels · Animated nebula background · Gradient stat bars · Bounce micro-animations

---

## 📄 License

MIT — see [LICENSE](LICENSE)
