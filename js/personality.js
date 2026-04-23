// =============================================
// personality.js — Personality Adaptation
// Phase 7 — Full Implementation
//
// Traits (each scored 0–100):
//   affectionate — high trust + frequent talk
//   playful      — high play count
//   curious      — high curiosity stat
//   shy          — low trust + few total interactions
//   energetic    — high energy + frequent play
//   mischievous  — play >> sleep (chaotic ratio)
//   withdrawn    — high neglect days
//
// Scoring is computed from live emotions + memory.
// Top 1–3 traits above threshold are "active".
// =============================================

export class PersonalitySystem {
  /**
   * @param {Object} [savedScores] — optional persisted traitScores
   */
  constructor(savedScores = {}) {
    // Restore persisted scores, fall back to 0
    this.traitScores = {
      affectionate: savedScores.affectionate ?? 0,
      playful:      savedScores.playful      ?? 0,
      curious:      savedScores.curious      ?? 0,
      shy:          savedScores.shy          ?? 0,
      energetic:    savedScores.energetic    ?? 0,
      mischievous:  savedScores.mischievous  ?? 0,
      withdrawn:    savedScores.withdrawn    ?? 0,
    };
  }

  // ═══════════════════════════════════════════════
  //  Recompute trait scores from live state
  // ═══════════════════════════════════════════════

  /**
   * Derive trait scores from current emotions + memory.
   * Called after every interaction and on each slow tick.
   *
   * @param {import('./emotions.js').EmotionEngine} emotions
   * @param {import('./memory.js').MemorySystem}    memory
   */
  update(emotions, memory) {
    const {
      trust, loneliness, curiosity, energy, happiness,
    } = emotions;

    const {
      times_talked   = 0,
      times_played   = 0,
      times_fed      = 0,
      times_slept    = 0,
      times_cleaned  = 0,
      days_ignored   = 0,
      session_count  = 1,
    } = memory;

    const totalInteractions = times_talked + times_played + times_fed
                            + times_slept + times_cleaned;

    // ── Affectionate ──────────────────────────────
    // High trust AND frequent talking → warm, bonded pet
    const talkRatio = totalInteractions > 0
      ? (times_talked / totalInteractions) * 100
      : 0;
    this.traitScores.affectionate = this._clamp(
      trust * 0.55 + talkRatio * 0.30 + (happiness - 50) * 0.15
    );

    // ── Playful ───────────────────────────────────
    // Frequent play sessions drive this trait up
    const playRatio = totalInteractions > 0
      ? (times_played / totalInteractions) * 100
      : 0;
    this.traitScores.playful = this._clamp(
      playRatio * 0.60 + happiness * 0.25 + curiosity * 0.15
    );

    // ── Curious ───────────────────────────────────
    // Driven primarily by the curiosity emotion stat
    this.traitScores.curious = this._clamp(
      curiosity * 0.70 + playRatio * 0.20 + happiness * 0.10
    );

    // ── Shy ───────────────────────────────────────
    // Low trust AND low interaction count → timid, reserved
    const interactionScore = Math.min(totalInteractions, 50) * 2; // 0-100
    this.traitScores.shy = this._clamp(
      (100 - trust) * 0.55 + (100 - interactionScore) * 0.30
      + (loneliness - 50) * 0.15
    );

    // ── Energetic ─────────────────────────────────
    // High energy stat + lots of play
    this.traitScores.energetic = this._clamp(
      energy * 0.50 + playRatio * 0.35 + (happiness - 40) * 0.15
    );

    // ── Mischievous ───────────────────────────────
    // Play far outweighs sleep → chaotic, impulsive nature
    const chaoticRatio = times_slept > 0
      ? Math.min(times_played / times_slept, 5) * 20  // caps at 100
      : times_played > 0 ? 60 : 0;
    this.traitScores.mischievous = this._clamp(
      chaoticRatio * 0.65 + curiosity * 0.20 + (energy - 50) * 0.15
    );

    // ── Withdrawn ─────────────────────────────────
    // Prolonged neglect builds distance and sadness
    const neglectScore = Math.min(days_ignored, 7) * (100 / 7); // 0-100 over 7 days
    this.traitScores.withdrawn = this._clamp(
      neglectScore * 0.60 + loneliness * 0.25 + (100 - trust) * 0.15
    );
  }

  // ═══════════════════════════════════════════════
  //  Active trait resolution
  // ═══════════════════════════════════════════════

  /**
   * Returns the top 1–3 trait names whose score exceeds the threshold.
   * If none pass the threshold, returns the single highest-scoring trait.
   *
   * @param {number} [threshold=35] — minimum score to be "active"
   * @returns {string[]}
   */
  getActiveTraits(threshold = 35) {
    const sorted = Object.entries(this.traitScores)
      .sort((a, b) => b[1] - a[1]);   // descending by score

    const active = sorted
      .filter(([, score]) => score >= threshold)
      .slice(0, 3)
      .map(([trait]) => trait);

    // Always return at least one trait (the dominant one)
    if (active.length === 0) {
      active.push(sorted[0][0]);
    }

    return active;
  }

  // ═══════════════════════════════════════════════
  //  Serialisation
  // ═══════════════════════════════════════════════

  toJSON() {
    return { traitScores: { ...this.traitScores } };
  }

  // ═══════════════════════════════════════════════
  //  Util
  // ═══════════════════════════════════════════════

  _clamp(v) { return Math.max(0, Math.min(100, v)); }
}
