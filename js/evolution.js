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
  resolveState(emotions, memory) {
    // Priority-ordered rules (Phase 8)
    if (emotions.energy     < 20) return 'sleepy';
    if (emotions.hunger     > 70) return 'hungry';
    if (emotions.loneliness > 65) return 'sad';
    
    // Excited: curiosity > 70 + recent play (within last 5 mins)
    const recentPlay = memory && memory.last_played && (Date.now() - memory.last_played < 300000);
    if (emotions.curiosity  > 70 && recentPlay) return 'excited';
    
    if (emotions.happiness  > 75) return 'happy';
    return 'neutral';
  }

  /**
   * Returns draw overrides per state (Phase 8).
   * e.g. { bodyColor, eyeShape, particleFX }
   */
  getDrawParams(state) {
    const colors = {
      idle: '#f59e0b',    // amber
      happy: '#10b981',   // green
      sad: '#3b82f6',     // blue
      sleepy: '#6366f1',  // indigo
      excited: '#ec4899', // pink
      eating: '#f97316',  // orange
      playing: '#8b5cf6', // purple
      neutral: '#06b6d4', // cyan
      hungry: '#eab308'   // yellow
    };

    const particles = {
      sleepy: 'Zzz',
      sad: 'tear',
      happy: 'sparkle',
      eating: 'heart',
      playing: 'star',
      talk: 'heart'
    };

    return { 
      state,
      bodyColor: colors[state] || '#06b6d4',
      particleFX: particles[state] || null
    };
  }
}
