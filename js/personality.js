// =============================================
// personality.js — Personality Adaptation
// Derives active traits from memory + emotions
// Traits: affectionate, playful, curious,
//         shy, energetic, mischievous, withdrawn
// =============================================

export class PersonalitySystem {
  constructor() {
    this.traitScores = {
      affectionate: 0,
      playful:      0,
      curious:      0,
      shy:          0,
      energetic:    0,
      mischievous:  0,
      withdrawn:    0,
    };
  }

  // --- Recompute trait scores from memory + emotions (Phase 7) ---
  update(emotions, memory) { /* TODO */ }

  // --- Returns top 1–3 active trait names ---
  getActiveTraits() { return []; }

  toJSON() {
    return { traitScores: { ...this.traitScores } };
  }
}
