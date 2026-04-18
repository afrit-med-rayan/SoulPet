// =============================================
// storage.js — Persistence via localStorage
// Serialises / deserialises the full game state
// =============================================

const SAVE_KEY = 'soulpet_save_v1';

export const Storage = {
  /**
   * Persist the current state snapshot.
   * @param {object} snapshot
   */
  save(snapshot) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        ...snapshot,
        saved_at: Date.now(),
      }));
    } catch (e) {
      console.warn('[SoulPet] Could not save state:', e);
    }
  },

  /**
   * Load a previously saved state.
   * Returns null if nothing is saved yet.
   * @returns {object|null}
   */
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('[SoulPet] Could not load state:', e);
      return null;
    }
  },

  /** Wipe the saved state (used for "new pet" flow). */
  clear() {
    localStorage.removeItem(SAVE_KEY);
  },

  /** True if a save exists. */
  hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
  },
};
