// =============================================
// world.js — 2D Background Scene Renderer
// Draws sky, ground, clouds, stars, trees
// with day/night awareness
// =============================================

export class World {
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {HTMLCanvasElement} canvas
   */
  constructor(ctx, canvas) {
    this.ctx    = ctx;
    this.canvas = canvas;
    this.clouds = [];
    this.stars  = [];
    // TODO: initialise cloud + star positions (Phase 3)
  }

  /** @param {number} dt — delta time in seconds */
  update(dt) { /* TODO (Phase 3) */ }

  /** Render the full background scene. */
  render(hourOfDay) { /* TODO (Phase 3) */ }

  /** Returns a sky gradient based on hour 0–23. */
  _getSkyGradient(hourOfDay) { /* TODO (Phase 3) */ }
}
