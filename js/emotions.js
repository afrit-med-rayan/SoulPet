// =============================================
// emotions.js — Emotional State Engine
// Tracks: happiness, hunger, energy, trust,
//         loneliness, curiosity (all 0–100)
// =============================================

export class EmotionEngine {
  constructor(initialState = {}) {
    this.happiness  = initialState.happiness  ?? 70;
    this.hunger     = initialState.hunger     ?? 20;
    this.energy     = initialState.energy     ?? 80;
    this.trust      = initialState.trust      ?? 50;
    this.loneliness = initialState.loneliness ?? 30;
    this.curiosity  = initialState.curiosity  ?? 60;
  }

  // --- Interaction methods (Phase 5) ---

  feed()  { /* TODO */ }
  play()  { /* TODO */ }
  talk()  { /* TODO */ }
  sleep() { /* TODO */ }
  clean() { /* TODO */ }

  // --- Passive decay tick (Phase 5) ---
  tick(deltaSeconds) { /* TODO */ }

  // --- Returns dominant mood string ---
  getOverallMood() { return 'neutral'; }

  // --- Serialise for storage ---
  toJSON() {
    return {
      happiness:  this.happiness,
      hunger:     this.hunger,
      energy:     this.energy,
      trust:      this.trust,
      loneliness: this.loneliness,
      curiosity:  this.curiosity,
    };
  }
}
