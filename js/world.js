// =============================================
// world.js — 2D Background Scene Renderer (Pixel Art)
// Draws sky, ground, clouds, stars, trees, sun/moon
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
        scale: 2 + Math.floor(Math.random() * 3), // Pixel scale 2-4
        speed: 10 + Math.random() * 20
      });
    }
  }

  _generateStars(w, h) {
    this.stars = [];
    for (let i = 0; i < 50; i++) {
      this.stars.push({
        x: Math.floor(Math.random() * w),
        y: Math.floor(Math.random() * (h * 0.6)),
        color: Math.random() > 0.8 ? '#fcd34d' : '#ffffff',
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
        x: Math.floor(spacing * (i + 1) + (Math.random() * 40 - 20)),
        scale: 3 + Math.floor(Math.random() * 2)
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

    // Disable smoothing for pixel art
    ctx.imageSmoothingEnabled = false;

    // 1. Sky
    const skyColor = this._getSkyColor(time);
    ctx.fillStyle = skyColor;
    ctx.fillRect(0, 0, w, h);

    // 2. Stars (visible mostly at night)
    if (time < 6 || time > 18) {
      this._drawStars(ctx);
    }

    // 3. Sun/Moon
    this._drawSunMoon(ctx, time, w, h);

    // 4. Clouds
    this._drawClouds(ctx);

    // 5. Ground (grass)
    this._drawGround(ctx, w, h);

    // 6. Trees
    this._drawTrees(ctx, h);
  }

  _drawStars(ctx) {
    for (const star of this.stars) {
      const alpha = 0.5 + 0.5 * Math.sin(star.twinkleTime);
      if (alpha > 0.4) {
        ctx.fillStyle = star.color;
        // Draw 2x2 pixel star
        ctx.fillRect(star.x, star.y, 2, 2);
      }
    }
  }

  _drawSunMoon(ctx, time, w, h) {
    // Basic orbit calculation
    const cx = w / 2;
    const cy = h * 0.8;
    const radius = w * 0.4;
    
    // Day: 6 to 18
    if (time >= 6 && time <= 18) {
      const progress = (time - 6) / 12; // 0 to 1
      const angle = Math.PI - (progress * Math.PI);
      const sx = cx + Math.cos(angle) * radius;
      const sy = cy - Math.sin(angle) * radius;
      
      // Draw pixel sun (square with rays)
      ctx.fillStyle = '#fcd34d';
      const size = 16;
      ctx.fillRect(Math.floor(sx - size/2), Math.floor(sy - size/2), size, size);
      // Rays
      ctx.fillRect(Math.floor(sx - size/2 + 4), Math.floor(sy - size/2 - 4), 8, 4);
      ctx.fillRect(Math.floor(sx - size/2 + 4), Math.floor(sy + size/2), 8, 4);
      ctx.fillRect(Math.floor(sx - size/2 - 4), Math.floor(sy - size/2 + 4), 4, 8);
      ctx.fillRect(Math.floor(sx + size/2), Math.floor(sy - size/2 + 4), 4, 8);
    } 
    // Night: 18 to 6
    else {
      let progress;
      if (time > 18) progress = (time - 18) / 12;
      else progress = (time + 6) / 12;
      const angle = Math.PI - (progress * Math.PI);
      const mx = cx + Math.cos(angle) * radius;
      const my = cy - Math.sin(angle) * radius;
      
      // Draw pixel moon (crescent)
      ctx.fillStyle = '#ffffff';
      const size = 16;
      ctx.fillRect(Math.floor(mx - size/2), Math.floor(my - size/2), size, size);
      // Cutout to make crescent
      ctx.fillStyle = this._getSkyColor(time);
      ctx.fillRect(Math.floor(mx - size/2 + 4), Math.floor(my - size/2 - 2), size, size + 4);
    }
  }

  _drawClouds(ctx) {
    ctx.fillStyle = '#ffffff';
    for (const cloud of this.clouds) {
      const s = cloud.scale;
      const x = Math.floor(cloud.x);
      const y = Math.floor(cloud.y);
      
      // Draw pixel cloud (3 overlapping rects)
      ctx.fillRect(x, y, 20 * s, 10 * s);
      ctx.fillRect(x + 5 * s, y - 6 * s, 10 * s, 6 * s);
      ctx.fillRect(x - 5 * s, y + 4 * s, 30 * s, 6 * s);
    }
  }

  _drawGround(ctx, w, h) {
    const groundHeight = h * 0.35;
    const groundY = Math.floor(h - groundHeight);

    // Pixel grass strip
    ctx.fillStyle = '#27523a'; // Dark green
    ctx.fillRect(0, groundY, w, groundHeight);

    // Light green edge
    ctx.fillStyle = '#3f7b4d';
    ctx.fillRect(0, groundY, w, 8);
    
    // Pixel details on grass
    ctx.fillStyle = '#1e3e2c';
    for(let i = 0; i < w; i += 30) {
      ctx.fillRect(i, groundY + 16, 4, 2);
      ctx.fillRect(i + 15, groundY + 30, 2, 2);
      ctx.fillRect(i + 5, groundY + 45, 6, 2);
    }
  }

  _drawTrees(ctx, h) {
    const groundY = Math.floor(h * 0.65);
    for (const tree of this.trees) {
      const s = tree.scale;
      const tx = Math.floor(tree.x);
      
      // Trunk
      ctx.fillStyle = '#4a3018';
      ctx.fillRect(tx - 2 * s, groundY - 20 * s, 4 * s, 20 * s);

      // Leaves (stacked pixel rects)
      ctx.fillStyle = '#1e3c15'; // Darker background leaves
      ctx.fillRect(tx - 12 * s, groundY - 30 * s, 24 * s, 16 * s);
      ctx.fillRect(tx - 8 * s, groundY - 40 * s, 16 * s, 10 * s);

      ctx.fillStyle = '#2d5a1e'; // Lighter foreground leaves
      ctx.fillRect(tx - 10 * s, groundY - 26 * s, 20 * s, 10 * s);
      ctx.fillRect(tx - 6 * s, groundY - 34 * s, 12 * s, 8 * s);
      ctx.fillRect(tx - 4 * s, groundY - 42 * s, 8 * s, 8 * s);
    }
  }

  /** Gets flat sky color based on time. */
  _getSkyColor(time) {
    if (time >= 0 && time < 5) return '#1a1c2c'; // Midnight
    if (time >= 5 && time < 8) return '#29366f'; // Dawn
    if (time >= 8 && time < 17) return '#83c5be'; // Day
    if (time >= 17 && time < 20) return '#d95763'; // Dusk
    if (time >= 20 && time <= 24) return '#1a1c2c'; // Night
    return '#83c5be';
  }
}
