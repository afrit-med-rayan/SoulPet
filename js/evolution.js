// =============================================
// evolution.js — Visual State Resolver
// Maps emotion values → pet visual state string
// and draw parameter overrides
// =============================================

export class EvolutionSystem {
  /**
   * Resolve the current visual state from emotions.
   * @param {import('./emotions.js').EmotionEngine} emotions
   * @returns {'happy'|'sad'|'sleepy'|'excited'|'hungry'|'neutral'}
   */
  resolveState(emotions) {
    // Priority-ordered rules (Phase 8)
    if (emotions.energy     < 20) return 'sleepy';
    if (emotions.hunger     > 70) return 'hungry';
    if (emotions.loneliness > 65) return 'sad';
    if (emotions.happiness  > 75 && emotions.curiosity > 60) return 'excited';
    if (emotions.happiness  > 65) return 'happy';
    return 'neutral';
  }

  /**
   * Returns draw overrides per state (Phase 8).
   * e.g. { bodyColor, eyeScale, particleFX }
   */
  getDrawParams(state) {
    // TODO: full params in Phase 8
    return { state };
  }
}
