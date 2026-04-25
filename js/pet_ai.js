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
  update(dt) {
    // 1. Autonomous Speech
    this._speechTimer -= dt;
    if (this._speechTimer <= 0) {
      this.speak();
      this._speechTimer = 45 + Math.random() * 45; // 45-90s
    }

    // 2. AI-driven wander behavior with day/night adaptation
    this._wanderTimer -= dt;
    if (this._wanderTimer <= 0) {
      this.pickWanderTarget();
      
      let delay = 3 + Math.random() * 4; // base 3-7s
      const h = new Date().getHours();
      
      // Day/Night behavior adaptation
      if (h >= 6 && h < 12) {
        // Morning: active
        delay *= 0.7;
      } else if (h >= 12 && h < 18) {
        // Afternoon: playful peak
        delay *= 0.6;
      } else if (h >= 18 && h < 22) {
        // Evening: calmer
        delay *= 1.5;
      } else {
        // Night: sleepy
        delay *= 3.0;
      }
      
      this._wanderTimer = delay;
    }
  }

  // --- Emit a contextual speech bubble (Phase 9) ---
  speak() {
    const state = this.pet.state;
    const lines = {
      happy:   ["I'm so happy!", "Life is great! ✨", "I love you! 💜"],
      sad:     ["I feel lonely...", "Please don't ignore me. 😢", "I miss you."],
      sleepy:  ["So tired...", "Need... sleep... 💤", "Yawn..."],
      excited: ["Wow! What's that?!", "Zoomies! ⚡", "I want to play! 🎾"],
      hungry:  ["My tummy is rumbling...", "Food? 🍗", "I'm starving!"],
      eating:  ["Yum! 😋", "So tasty!"],
      playing: ["Wheee! 🎉", "This is fun!"],
      neutral: ["Hmm...", "What a nice day.", "Just thinking..."],
      idle:    ["Hmm...", "What a nice day.", "Just thinking..."]
    };
    
    // Day/Night specific lines
    const h = new Date().getHours();
    if (h >= 22 || h < 6) {
      lines.idle = ["It's so dark...", "Quiet night...", "Should we sleep?"];
      lines.neutral = lines.idle;
    } else if (h >= 6 && h < 10) {
      lines.idle = ["Good morning! 🌅", "A fresh new day!", "I feel rested!"];
      lines.neutral = lines.idle;
    }
    
    const pool = lines[state] || lines.neutral;
    const text = pool[Math.floor(Math.random() * pool.length)];
    
    window.dispatchEvent(new CustomEvent('soulpet:speech', {
      detail: { text, duration: 4000 }
    }));
  }

  // --- Choose a new wander target position (Phase 9) ---
  pickWanderTarget() {
    // Pet chooses random target position and walks to it
    if (this.pet.state === 'sleepy') return; // Don't wander if sleepy
    
    const margin = 50;
    const canvasWidth = this.pet.canvas.width;
    const newX = Math.floor(margin + Math.random() * (canvasWidth - margin * 2));
    
    this.pet.setTarget(newX, this.pet.y);
  }

  // --- Return greeting line based on neglect (Phase 9) ---
  getGreeting() {
    const ignored = this.memory.days_ignored ?? 0;
    if (ignored > 3) return "You were gone so long… I missed you. 😢";
    if (ignored > 1) return "Hey, you're back! I was getting lonely. 🥺";
    return "Hi! I'm so happy to see you! ✨";
  }
}
