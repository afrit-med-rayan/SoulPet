// =============================================
// memory.js — Memory System
// Records every interaction and computes
// metrics like days_ignored, favorite_activity
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
    this.favorite_activity = initialMemory.favorite_activity ?? null;
    this.days_ignored      = initialMemory.days_ignored      ?? 0;
    this.session_count     = initialMemory.session_count     ?? 1;
    this.total_playtime_ms = initialMemory.total_playtime_ms ?? 0;
  }

  // --- Record an interaction (Phase 6) ---
  record(activity) { /* TODO */ }

  // --- Compute days_ignored from last_interaction (Phase 6) ---
  computeNeglect() { /* TODO */ }

  // --- Return top activity ---
  getFavoriteActivity() { return this.favorite_activity ?? 'none'; }

  // --- Days alive ---
  getDaysAlive() {
    return Math.floor((Date.now() - this.first_met) / (1000 * 60 * 60 * 24));
  }

  toJSON() {
    return { ...this };
  }
}
