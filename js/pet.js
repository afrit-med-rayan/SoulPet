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
  spawnParticles(type) { /* TODO (Phase 4) */ }

  /** @param {number} dt */
  update(dt) { /* TODO (Phase 4) */ }

  /** Draw the pet at current position. */
  render() { /* TODO (Phase 4) */ }
}
