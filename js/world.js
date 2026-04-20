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
    this.trees  = [];
  }

  /**
   * Called when canvas resizes. We regenerate elements to fit new dimensions.
   * @param {number} w 
   * @param {number} h 
   */
  onResize(w, h) {
    this._generateClouds(w, h);
    this._generateStars(w, h);
    this._generateTrees(w, h);
  }

  _generateClouds(w, h) {
    this.clouds = [];
    for (let i = 0; i < 5; i++) {
      this.clouds.push({
        x: Math.random() * w,
        y: Math.random() * (h * 0.4),
        scale: 0.5 + Math.random() * 1.5,
        speed: 10 + Math.random() * 20
      });
    }
  }

  _generateStars(w, h) {
    this.stars = [];
    for (let i = 0; i < 50; i++) {
      this.stars.push({
        x: Math.random() * w,
        y: Math.random() * (h * 0.6),
        radius: 0.5 + Math.random() * 1.5,
        alpha: Math.random()
      });
    }
  }

  _generateTrees(w, h) {
    this.trees = [];
    const numTrees = 3;
    const spacing = w / (numTrees + 1);
    for (let i = 0; i < numTrees; i++) {
      this.trees.push({
        x: spacing * (i + 1) + (Math.random() * 40 - 20),
        scale: 0.8 + Math.random() * 0.4
      });
    }
  }

  /** @param {number} dt — delta time in seconds */
  update(dt) { 
    // TODO: Animate clouds and stars (Phase 3 Step 2)
  }

  /** Render the full background scene. */
  render(hourOfDay) {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // 1. Sky
    const skyGradient = this._getSkyGradient(hourOfDay, h);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, w, h);

    // 2. Stars (only visible at night loosely)
    if (hourOfDay < 6 || hourOfDay >= 18) {
      this._drawStars(ctx);
    }

    // 3. Clouds
    this._drawClouds(ctx);

    // 4. Ground (grass)
    this._drawGround(ctx, w, h);

    // 5. Trees
    this._drawTrees(ctx, h);
  }

  _drawStars(ctx) {
    ctx.fillStyle = 'white';
    for (const star of this.stars) {
      ctx.globalAlpha = star.alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  _drawClouds(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (const cloud of this.clouds) {
      ctx.save();
      ctx.translate(cloud.x, cloud.y);
      ctx.scale(cloud.scale, cloud.scale);
      
      ctx.beginPath();
      ctx.arc(0, 0, 20, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(25, -10, 25, Math.PI * 1, Math.PI * 1.8);
      ctx.arc(55, -5, 20, Math.PI * 1.2, Math.PI * 2);
      ctx.arc(60, 10, 15, Math.PI * 1.5, Math.PI * 0.5);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }
  }

  _drawGround(ctx, w, h) {
    const groundHeight = h * 0.35;
    const groundY = h - groundHeight;

    const grad = ctx.createLinearGradient(0, groundY, 0, h);
    grad.addColorStop(0, '#2d4c1e');
    grad.addColorStop(1, '#1a3011');

    ctx.fillStyle = grad;
    ctx.fillRect(0, groundY, w, groundHeight);

    // Floor highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.ellipse(w / 2, groundY + 30, w * 0.8, 40, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawTrees(ctx, h) {
    const groundY = h * 0.65;
    for (const tree of this.trees) {
      ctx.save();
      ctx.translate(tree.x, groundY);
      ctx.scale(tree.scale, tree.scale);

      // Trunk
      ctx.fillStyle = '#4a3018';
      ctx.fillRect(-10, -60, 20, 60);

      // Leaves
      ctx.fillStyle = '#1e3c15';
      ctx.beginPath();
      ctx.arc(0, -80, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2d5a1e';
      ctx.beginPath();
      ctx.arc(-20, -60, 30, 0, Math.PI * 2);
      ctx.arc(20, -60, 30, 0, Math.PI * 2);
      ctx.arc(0, -110, 35, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /** Returns a sky gradient based on hour 0–23. */
  _getSkyGradient(hourOfDay, h) {
    // Basic day/night mapping for step 1
    const grad = this.ctx.createLinearGradient(0, 0, 0, h * 0.8);
    
    if (hourOfDay >= 5 && hourOfDay < 8) {
      // Dawn
      grad.addColorStop(0, '#1a1a3a');
      grad.addColorStop(1, '#ff7e5f');
    } else if (hourOfDay >= 8 && hourOfDay < 18) {
      // Day
      grad.addColorStop(0, '#4facfe');
      grad.addColorStop(1, '#00f2fe');
    } else if (hourOfDay >= 18 && hourOfDay < 21) {
      // Dusk
      grad.addColorStop(0, '#ff7e5f');
      grad.addColorStop(1, '#2f1b41');
    } else {
      // Night
      grad.addColorStop(0, '#0a0a1a');
      grad.addColorStop(1, '#1a1a3a');
    }

    return grad;
  }
}
