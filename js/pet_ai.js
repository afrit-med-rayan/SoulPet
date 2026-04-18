// =============================================
// pet_ai.js — Autonomous Pet AI
// Handles: speech bubbles, wander behaviour,
//          day/night adaptation, neglect greetings
// =============================================

export class PetAI {
  constructor(pet, emotions, memory) {
    this.pet      = pet;
    this.emotions = emotions;
    this.memory   = memory;

    this._speechTimer  = 0;
    this._speechDelay  = 45 + Math.random() * 45; // 45–90 s
    this._wanderTimer  = 0;
    this._wanderDelay  = 3  + Math.random() * 4;  // 3–7 s
  }

  // --- Called every frame with deltaTime in seconds (Phase 9) ---
  update(dt) { /* TODO */ }

  // --- Emit a contextual speech bubble (Phase 9) ---
  speak() { /* TODO */ }

  // --- Choose a new wander target position (Phase 9) ---
  pickWanderTarget() { /* TODO */ }

  // --- Return greeting line based on neglect (Phase 9) ---
  getGreeting() {
    const ignored = this.memory.days_ignored ?? 0;
    if (ignored > 3) return "You were gone so long… I missed you. 😢";
    if (ignored > 1) return "Hey, you're back! I was getting lonely. 🥺";
    return "Hi! I'm so happy to see you! ✨";
  }
}
