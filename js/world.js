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
        alpha: Math.random(),
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinkleTime: Math.random() * Math.PI * 2
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
    // Animate clouds
    for (const cloud of this.clouds) {
      cloud.x += cloud.speed * dt;
      if (cloud.x > this.canvas.width + 100) {
        cloud.x = -100;
        cloud.y = Math.random() * (this.canvas.height * 0.4);
      }
    }

    // Animate stars
    for (const star of this.stars) {
      star.twinkleTime += star.twinkleSpeed * dt;
      star.alpha = 0.5 + 0.5 * Math.sin(star.twinkleTime);
    }
  }

  /** Render the full background scene. */
  render(hourOfDay) {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Get continuous time (0-24) to allow smooth shifts
    const d = new Date();
    const time = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;

    // 1. Sky
    const stops = this._getSkyGradientStops(time);
    const grad = ctx.createLinearGradient(0, 0, 0, h * 0.8);
    grad.addColorStop(0, stops.top);
    grad.addColorStop(1, stops.bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 2. Stars (visible mostly at night)
    // Smooth alpha for stars
    let starMasterAlpha = 0;
    if (time < 6 || time > 18) {
      if (time > 18 && time <= 20) starMasterAlpha = (time - 18) / 2; // fade in dusk
      else if (time >= 4 && time < 6) starMasterAlpha = 1 - (time - 4) / 2; // fade out dawn
      else starMasterAlpha = 1; // full night
    }
    
    if (starMasterAlpha > 0) {
      this._drawStars(ctx, starMasterAlpha);
    }

    // 3. Clouds
    this._drawClouds(ctx);

    // 4. Ground (grass)
    this._drawGround(ctx, w, h);

    // 5. Trees
    this._drawTrees(ctx, h);
  }

  _drawStars(ctx, masterAlpha) {
    ctx.fillStyle = 'white';
    for (const star of this.stars) {
      ctx.globalAlpha = star.alpha * masterAlpha;
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

  /** Gets smoothly interpolated sky colors based on time (0-24). */
  _getSkyGradientStops(time) {
    const phases = [
      { t: 0,  top: [10, 10, 26], bottom: [26, 26, 58] },     // Midnight
      { t: 5,  top: [26, 26, 58], bottom: [255, 126, 95] },   // Dawn start
      { t: 8,  top: [79, 172, 254], bottom: [0, 242, 254] },  // Day
      { t: 18, top: [79, 172, 254], bottom: [0, 242, 254] },  // Day end
      { t: 20, top: [255, 126, 95], bottom: [47, 27, 65] },   // Dusk
      { t: 22, top: [10, 10, 26], bottom: [26, 26, 58] },     // Night start
      { t: 24, top: [10, 10, 26], bottom: [26, 26, 58] }      // Midnight
    ];

    let p1 = phases[0];
    let p2 = phases[1];
    
    for (let i = 0; i < phases.length - 1; i++) {
      if (time >= phases[i].t && time <= phases[i+1].t) {
        p1 = phases[i];
        p2 = phases[i+1];
        break;
      }
    }

    const range = p2.t - p1.t;
    const progress = range === 0 ? 0 : (time - p1.t) / range;

    const lerp = (c1, c2, p) => Math.round(c1 + (c2 - c1) * p);
    
    return {
      top: \`rgb(\${lerp(p1.top[0], p2.top[0], progress)}, \${lerp(p1.top[1], p2.top[1], progress)}, \${lerp(p1.top[2], p2.top[2], progress)})\`,
      bottom: \`rgb(\${lerp(p1.bottom[0], p2.bottom[0], progress)}, \${lerp(p1.bottom[1], p2.bottom[1], progress)}, \${lerp(p1.bottom[2], p2.bottom[2], progress)})\`
    };
  }
}
