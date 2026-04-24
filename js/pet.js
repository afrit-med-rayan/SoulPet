// =============================================
// pet.js — Pet Entity (Pixel Art)
// Drawn via an offscreen 16x24 canvas, upscaled.
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
    this.x = Math.floor(canvas.width / 2);
    this.y = Math.floor(canvas.height / 2);
    this._trueX = this.x;
    this._trueY = this.y;

    // Movement / Wandering
    this.targetX = this.x;
    this.targetY = this.y;
    this.speed   = 40; // px/s
    this.wanderTimer = 0;

    // Animation / State
    this.state       = 'idle'; // idle|happy|sad|sleepy|excited|eating|playing|hungry
    this.animTime    = 0;

    // Pixel Sprite Setup
    this.spriteW = 16;
    this.spriteH = 24;
    this.scale   = 6; // Upscale factor (96x144 on screen)
    
    this.offCanvas = document.createElement('canvas');
    this.offCanvas.width = this.spriteW;
    this.offCanvas.height = this.spriteH;
    this.offCtx = this.offCanvas.getContext('2d');
    
    // Override animation (triggered by button interactions)
    this._overrideTimer = 0;
    
    // Particles
    this.particles = [];
  }

  /** Set the visual state (from EvolutionSystem). Blocked while a triggered animation is playing. */
  setState(state) {
    if (this._overrideTimer > 0) return; // let button-triggered animation finish
    if (this.state !== state) {
      if (state === 'sleepy') this.spawnParticles('Zzz');
      if (state === 'sad')    this.spawnParticles('tear');
      this.state    = state;
      this.animTime = 0;
    }
  }

  /**
   * Temporarily force a visual state for button feedback, then yield back to evolution.
   * @param {string} state  — animation state to play
   * @param {number} durationSec — how long to hold it (seconds)
   */
  triggerAnimation(state, durationSec = 2) {
    this.state          = state;
    this.animTime       = 0;
    this._overrideTimer = durationSec;
  }

  /** Move toward a target position. */
  setTarget(x, y) {
    this.targetX = Math.floor(x);
    this.targetY = Math.floor(y);
  }

  /** Spawn a burst of particles. */
  spawnParticles(type) {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        type,
        x: this.x + (Math.random() * 40 - 20),
        y: this.y - 20 + (Math.random() * 20 - 10),
        vx: (Math.random() - 0.5) * 20,
        vy: -20 - Math.random() * 20,
        life: 1.0,
        maxLife: 1.0 + Math.random()
      });
    }
  }

  /** @param {number} dt */
  update(dt) {
    this.animTime += dt;

    if (this._overrideTimer > 0) {
      this._overrideTimer -= dt;
    }
    
    // 1. Particle Logic
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Spawn passive particles occasionally
    if (this.state === 'sleepy' && Math.random() < 0.01) this.spawnParticles('Zzz');
    if (this.state === 'sad' && Math.random() < 0.01) this.spawnParticles('tear');
    if (this.state === 'happy' && Math.random() < 0.02) this.spawnParticles('sparkle');

    // 2. Wandering Logic
    this.wanderTimer -= dt;
    if (this.wanderTimer <= 0) {
      this.wanderTimer = 3 + Math.random() * 5; // next wander in 3-8s
      if (this.state !== 'sleepy') {
        const margin = 50;
        this.targetX = Math.floor(margin + Math.random() * (this.canvas.width - margin * 2));
      }
    }

    // Move towards target (Pixel Snap)
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 2) {
      let currentSpeed = this.speed;
      if (this.state === 'sad') currentSpeed *= 0.5;
      if (this.state === 'excited') currentSpeed *= 1.5;
      if (this.state === 'sleepy') currentSpeed = 0;

      // Update true position
      this._trueX += (dx / dist) * currentSpeed * dt;
      this._trueY += (dy / dist) * currentSpeed * dt;
      
      // Snap visible position to pixels
      this.x = Math.floor(this._trueX);
      this.y = Math.floor(this._trueY);
    } else {
      this._trueX = this.x;
      this._trueY = this.y;
    }
  }

  _getColorForState(state) {
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
    return colors[state] || '#06b6d4';
  }

  /** Render the pet at current position. */
  render() {
    const { ctx } = this;
    
    // Draw Particles first (behind or in front, handled here)
    ctx.imageSmoothingEnabled = false;
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      const px = Math.floor(p.x);
      const py = Math.floor(p.y);
      
      if (p.type === 'Zzz') {
        ctx.fillStyle = '#ffffff';
        // Draw pixel 'Z'
        ctx.fillRect(px, py, 6, 2);
        ctx.fillRect(px + 4, py + 2, 2, 2);
        ctx.fillRect(px + 2, py + 4, 2, 2);
        ctx.fillRect(px, py + 6, 6, 2);
      } else if (p.type === 'tear') {
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(px, py, 4, 4);
        ctx.fillRect(px + 1, py - 2, 2, 2);
      } else if (p.type === 'sparkle') {
        ctx.fillStyle = '#fcd34d';
        ctx.fillRect(px, py, 4, 4);
      } else if (p.type === 'heart') {
        ctx.fillStyle = '#ec4899';
        // Pixel heart
        ctx.fillRect(px + 2, py, 4, 4);
        ctx.fillRect(px + 10, py, 4, 4);
        ctx.fillRect(px, py + 4, 16, 6);
        ctx.fillRect(px + 2, py + 10, 12, 4);
        ctx.fillRect(px + 6, py + 14, 4, 4);
      } else if (p.type === 'star') {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(px + 4, py, 4, 4);
        ctx.fillRect(px, py + 4, 12, 4);
        ctx.fillRect(px + 4, py + 8, 4, 4);
      }
    }
    ctx.globalAlpha = 1.0;

    // --- DRAW OFFSCREEN PIXEL SPRITE ---
    this.offCtx.clearRect(0, 0, this.spriteW, this.spriteH);
    this._drawPixelSprite(this.offCtx, this.state, this.animTime);

    // Calculate bounce offset based on animation time
    let bob = 0;
    const t = this.animTime;
    
    if (this.state === 'idle' || this.state === 'neutral') bob = Math.floor(Math.sin(t * 3) * 1);
    else if (this.state === 'happy') bob = Math.floor(Math.abs(Math.sin(t * 6)) * -3);
    else if (this.state === 'sad') bob = Math.floor(Math.sin(t * 1.5) * 1 + 1);
    else if (this.state === 'sleepy') bob = 2;
    else if (this.state === 'excited') bob = Math.floor(Math.sin(t * 15) * 1);
    else if (this.state === 'eating') bob = Math.floor(Math.sin(t * 8) * 1);
    else if (this.state === 'playing') bob = Math.floor(Math.sin(t * 8) * -2);
    else if (this.state === 'hungry') bob = Math.floor(Math.sin(t * 4) * 1);

    // Apply scale and draw
    const drawW = this.spriteW * this.scale;
    const drawH = this.spriteH * this.scale;
    const drawX = this.x - drawW / 2;
    const drawY = this.y - drawH / 2 + (bob * this.scale);

    ctx.drawImage(this.offCanvas, drawX, drawY, drawW, drawH);
  }

  /**
   * Draws the actual 16x24 pixel art onto the given context.
   */
  _drawPixelSprite(ctx, state, t) {
    const color = this._getColorForState(state);
    
    // We are drawing in a 16x24 grid.
    // Center is around x=8, y=12
    
    // Default shape:
    // Base Blob
    ctx.fillStyle = color;
    ctx.fillRect(4, 10, 8, 10); // core body
    ctx.fillRect(3, 11, 10, 8); // wider body
    ctx.fillRect(2, 13, 12, 6); // even wider base

    // Ears / Accents depending on state
    if (state === 'sad') {
      ctx.fillRect(1, 15, 2, 4); // drooping left
      ctx.fillRect(13, 15, 2, 4); // drooping right
    } else if (state === 'sleepy') {
      ctx.fillRect(2, 16, 2, 3);
      ctx.fillRect(12, 16, 2, 3);
    } else {
      ctx.fillRect(3, 8, 2, 3); // left ear
      ctx.fillRect(11, 8, 2, 3); // right ear
    }

    // Eyes
    ctx.fillStyle = '#ffffff';
    let blink = Math.random() < 0.05 && (state === 'idle' || state === 'neutral');
    
    if (state === 'sleepy') {
      // closed eyes
      ctx.fillStyle = '#1a1c2c';
      ctx.fillRect(4, 13, 2, 1);
      ctx.fillRect(10, 13, 2, 1);
    } else if (state === 'happy' || state === 'excited') {
      // big eyes
      ctx.fillRect(4, 11, 3, 4);
      ctx.fillRect(9, 11, 3, 4);
      ctx.fillStyle = '#1a1c2c';
      ctx.fillRect(5, 12, 1, 2);
      ctx.fillRect(10, 12, 1, 2);
    } else if (blink) {
      // blink
      ctx.fillStyle = '#1a1c2c';
      ctx.fillRect(4, 13, 2, 1);
      ctx.fillRect(10, 13, 2, 1);
    } else {
      // normal eyes
      ctx.fillRect(4, 12, 2, 3);
      ctx.fillRect(10, 12, 2, 3);
      ctx.fillStyle = '#1a1c2c';
      ctx.fillRect(5, 13, 1, 1);
      ctx.fillRect(10, 13, 1, 1);
    }

    // Mouth
    ctx.fillStyle = '#1a1c2c';
    if (state === 'sad') {
      ctx.fillRect(7, 16, 2, 1);
      ctx.fillRect(6, 17, 1, 1);
      ctx.fillRect(9, 17, 1, 1);
    } else if (state === 'happy' || state === 'excited') {
      ctx.fillRect(6, 16, 4, 1);
      ctx.fillRect(7, 17, 2, 2);
      ctx.fillStyle = '#ec4899'; // tongue
      ctx.fillRect(7, 18, 2, 1);
    } else if (state === 'eating') {
      if (Math.floor(t * 10) % 2 === 0) {
        ctx.fillRect(6, 16, 4, 3); // open mouth
      } else {
        ctx.fillRect(7, 16, 2, 1); // closed
      }
    } else if (state === 'hungry') {
      ctx.fillRect(6, 16, 4, 2); // open wide
    } else {
      ctx.fillRect(7, 16, 2, 1); // normal line
    }
  }
}
