// =============================================
// pet.js — Pet Entity (Canvas 2D)
// Drawn entirely via Canvas API — no images.
// Handles: drawing, animation states, wandering
// =============================================

export class Pet {
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {HTMLCanvasElement} canvas
   * @param {string} name
   */
  constructor(ctx, canvas, name = 'Pip') {
    this.ctx    = ctx;
    this.canvas = canvas;
    this.name   = name;

    // Position (centre of pet)
    this.x = canvas.width  / 2;
    this.y = canvas.height / 2;

    // Movement
    this.targetX = this.x;
    this.targetY = this.y;
    this.speed   = 60; // px/s

    // Animation
    this.state       = 'idle'; // idle|happy|sad|sleepy|excited|eating|playing
    this.animTime    = 0;
    this.bobOffset   = 0;

    // Particles
    this.particles = [];
  }

  /** Set the visual state (from EvolutionSystem). */
  setState(state) {
    if (this.state !== state) {
      this.state   = state;
      this.animTime = 0;
    }
  }

  /** Move toward a target position. */
  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  /** Spawn a burst of particles. */
  spawnParticles(type) { /* TODO (Phase 4 Step 2) */ }

  /** @param {number} dt */
  update(dt) { 
    // Basic update for step 1: just tick animTime
    this.animTime += dt;
  }

  _getColorForState(state) {
    const colors = {
      idle: '#f59e0b',    // warm amber
      happy: '#10b981',   // emerald green
      sad: '#3b82f6',     // blue
      sleepy: '#6366f1',  // indigo
      excited: '#ec4899', // pink
      eating: '#f97316',  // orange
      playing: '#8b5cf6', // purple
      neutral: '#06b6d4'  // cyan
    };
    return colors[state] || '#06b6d4';
  }

  /** Draw the pet at current position. */
  render() {
    const { ctx } = this;
    ctx.save();
    
    // Translate to pet's centre
    ctx.translate(this.x, this.y + this.bobOffset);

    const bodyColor = this._getColorForState(this.state);

    // 1. Draw Tail
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(-20, 15, 25, 8, Math.PI / -6, 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw Ears
    ctx.beginPath();
    ctx.moveTo(-15, -30);
    ctx.lineTo(-25, -50);
    ctx.lineTo(-5, -35);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(15, -30);
    ctx.lineTo(25, -50);
    ctx.lineTo(5, -35);
    ctx.fill();

    // 3. Draw Body (Squishy rounded shape)
    ctx.beginPath();
    ctx.ellipse(0, 0, 30, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body shading/glow
    ctx.shadowColor = bodyColor;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // 4. Draw Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-10, -5, 8, 12, 0, 0, Math.PI * 2); // left eye
    ctx.ellipse(10, -5, 8, 12, 0, 0, Math.PI * 2);  // right eye
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#0a0a1a';
    ctx.beginPath();
    ctx.arc(-10, -2, 4, 0, Math.PI * 2);
    ctx.arc(10, -2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-12, -4, 2, 0, Math.PI * 2);
    ctx.arc(8, -4, 2, 0, Math.PI * 2);
    ctx.fill();

    // 5. Draw Mouth
    ctx.strokeStyle = '#0a0a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 10, 5, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }
}
