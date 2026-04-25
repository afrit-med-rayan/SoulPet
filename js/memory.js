// =============================================
// memory.js — Memory System
// Records every interaction and computes
// metrics like days_ignored, favorite_activity
// Phase 2: record() and computeNeglect() implemented
// =============================================

export class MemorySystem {
  constructor(initialMemory = {}) {
    this.first_met         = initialMemory.first_met         ?? Date.now();
    this.last_fed          = initialMemory.last_fed          ?? null;
    this.last_played       = initialMemory.last_played       ?? null;
    this.last_interaction  = initialMemory.last_interaction  ?? Date.now();
    this.times_fed         = initialMemory.times_fed         ?? 0;
    this.times_played      = initialMemory.times_played      ?? 0;
    this.times_talked      = initialMemory.times_talked      ?? 0;
    this.times_cleaned     = initialMemory.times_cleaned     ?? 0;
    this.times_slept       = initialMemory.times_slept       ?? 0;
    this.favorite_activity = initialMemory.favorite_activity ?? null;
    this.days_ignored      = initialMemory.days_ignored      ?? 0;
    this.session_count     = (initialMemory.session_count    ?? 0) + 1;
    this.total_playtime_ms = initialMemory.total_playtime_ms ?? 0;

    // Compute neglect on load (measures time since last session)
    this.computeNeglect();
  }

  // ═══════════════════════════════════════════════
  //  Record an interaction
  // ═══════════════════════════════════════════════

  /**
   * Log a user interaction by activity name.
   * @param {'feed'|'play'|'talk'|'sleep'|'clean'} activity
   */
  record(activity) {
    const now = Date.now();
    this.last_interaction = now;

    switch (activity) {
      case 'feed':
        this.times_fed++;
        this.last_fed = now;
        break;
      case 'play':
        this.times_played++;
        this.last_played = now;
        break;
      case 'talk':
        this.times_talked++;
        break;
      case 'sleep':
        this.times_slept++;
        break;
      case 'clean':
        this.times_cleaned++;
        break;
    }

    // Recompute favourite activity
    this.favorite_activity = this._topActivity();

    // Reset neglect counter on any interaction
    this.days_ignored = 0;
  }

  // ═══════════════════════════════════════════════
  //  Neglect Calculation
  // ═══════════════════════════════════════════════

  /**
   * Measures how many full days have passed since last_interaction.
   * Called on construction (app load) so emotion engine can penalise neglect.
   */
  computeNeglect() {
    if (!this.last_interaction) {
      this.days_ignored = 0;
      return;
    }
    const msPerDay    = 1000 * 60 * 60 * 24;
    const elapsed     = Date.now() - this.last_interaction;
    this.days_ignored = Math.floor(elapsed / msPerDay);
  }

  // ═══════════════════════════════════════════════
  //  Playtime Tracking
  // ═══════════════════════════════════════════════

  /** @param {number} dt delta time in seconds */
  tick(dt) {
    this.total_playtime_ms += dt * 1000;
  }

  // ═══════════════════════════════════════════════
  //  Derived helpers
  // ═══════════════════════════════════════════════

  /** Days since pet was created. */
  getDaysAlive() {
    return Math.floor((Date.now() - this.first_met) / (1000 * 60 * 60 * 24));
  }

  /** Calculate the pet's level based on interaction volume and lifespan. */
  getLevel() {
    const interactions = this.times_fed + this.times_played + this.times_talked + this.times_slept + this.times_cleaned;
    const basePoints = this.getDaysAlive() + Math.floor(interactions / 5) + this.session_count;
    return 1 + Math.floor(basePoints / 10);
  }

  /** Formatted date string of first meeting. */
  getFirstMetDate() {
    return new Date(this.first_met).toLocaleDateString();
  }

  /** Total active playtime in minutes. */
  getTotalPlaytimeMinutes() {
    return Math.floor(this.total_playtime_ms / (1000 * 60));
  }

  /** Returns the activity the user has done most often. */
  _topActivity() {
    const counts = {
      feed:  this.times_fed,
      play:  this.times_played,
      talk:  this.times_talked,
      sleep: this.times_slept,
      clean: this.times_cleaned,
    };
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  // ═══════════════════════════════════════════════
  //  Serialisation
  // ═══════════════════════════════════════════════

  toJSON() {
    return {
      first_met:        this.first_met,
      last_fed:         this.last_fed,
      last_played:      this.last_played,
      last_interaction: this.last_interaction,
      times_fed:        this.times_fed,
      times_played:     this.times_played,
      times_talked:     this.times_talked,
      times_cleaned:    this.times_cleaned,
      times_slept:      this.times_slept,
      favorite_activity:this.favorite_activity,
      days_ignored:     this.days_ignored,
      session_count:    this.session_count,
      total_playtime_ms:this.total_playtime_ms,
    };
  }
}
