// =============================================
// emotions.js — Emotional State Engine
// Tracks: happiness, hunger, energy, trust,
//         loneliness, curiosity  (all 0–100)
// Phase 2: passive tick/decay implemented
// Phase 5: interaction methods filled in
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

  // ═══════════════════════════════════════════════
  //  Interaction Methods
  // ═══════════════════════════════════════════════

  feed() {
    this.hunger     = this._clamp(this.hunger     - 25);
    this.happiness  = this._clamp(this.happiness  + 10);
    this.trust      = this._clamp(this.trust      +  5);
    this.energy     = this._clamp(this.energy     +  5);
  }

  play() {
    this.happiness  = this._clamp(this.happiness  + 20);
    this.energy     = this._clamp(this.energy     - 15);
    this.loneliness = this._clamp(this.loneliness - 20);
    this.curiosity  = this._clamp(this.curiosity  + 10);
    this.hunger     = this._clamp(this.hunger     +  8);
  }

  talk() {
    this.loneliness = this._clamp(this.loneliness - 25);
    this.trust      = this._clamp(this.trust      + 10);
    this.happiness  = this._clamp(this.happiness  + 10);
    this.curiosity  = this._clamp(this.curiosity  +  5);
  }

  sleep() {
    this.energy     = this._clamp(this.energy     + 35);
    this.happiness  = this._clamp(this.happiness  +  5);
    this.hunger     = this._clamp(this.hunger     + 10);  // sleeping makes hungry
  }

  clean() {
    this.happiness  = this._clamp(this.happiness  + 12);
    this.trust      = this._clamp(this.trust      +  8);
    this.loneliness = this._clamp(this.loneliness - 10);
  }

  // ═══════════════════════════════════════════════
  //  Passive Decay  (called by slow tick every 30 s)
  // ═══════════════════════════════════════════════

  /**
   * Apply time-based drift to all stats.
   * Rates scaled per 30-second tick (tuned for ~8-hour "day").
   * @param {number} elapsedSeconds — actual seconds since last tick
   */
  tick(elapsedSeconds) {
    // Normalise to a standard 30-second unit so decay is predictable
    const t = elapsedSeconds / 30;

    this.hunger     = this._clamp(this.hunger     + 3.0 * t);  // always grows
    this.energy     = this._clamp(this.energy     - 2.0 * t);  // tires over time
    this.happiness  = this._clamp(this.happiness  - 1.0 * t);  // drifts to neutral
    this.loneliness = this._clamp(this.loneliness + 2.5 * t);  // grows without interaction
    this.trust      = this._clamp(this.trust      - 0.5 * t);  // very slow erosion
    this.curiosity  = this._clamp(this.curiosity  - 1.0 * t);  // fades without play
  }

  // ═══════════════════════════════════════════════
  //  Derived Mood
  // ═══════════════════════════════════════════════

  /**
   * Returns a human-readable dominant mood string.
   * @returns {string}
   */
  getOverallMood() {
    if (this.energy     < 20) return 'Sleepy 💤';
    if (this.hunger     > 70) return 'Hungry 🍖';
    if (this.loneliness > 65) return 'Lonely 🥺';
    if (this.happiness  > 80 && this.curiosity > 60) return 'Excited ✨';
    if (this.happiness  > 65) return 'Happy 😊';
    if (this.trust      < 30) return 'Wary 😤';
    return 'Neutral 😐';
  }

  // ═══════════════════════════════════════════════
  //  Serialisation
  // ═══════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════
  //  Util
  // ═══════════════════════════════════════════════

  /** Clamp a value between 0 and 100. */
  _clamp(v) { return Math.max(0, Math.min(100, v)); }
}
