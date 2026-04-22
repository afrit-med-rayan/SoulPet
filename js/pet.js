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

    // Movement / Wandering
    this.targetX = this.x;
    this.targetY = this.y;
    this.speed   = 40; // px/s
    this.wanderTimer = 0;

    // Animation / State
    this.state       = 'idle'; // idle|happy|sad|sleepy|excited|eating|playing|hungry
    this.animTime    = 0;
    
    // Draw Parameters (smoothed via lerp)
    this.bobOffset   = 0;
    this.scaleX      = 1;
    this.scaleY      = 1;
    this.rotation    = 0;
    this.eyeOpenness = 1;
    this.earAngle    = 0;
    this.mouthOpen   = 0;
    this.glow        = 0;

    // Override animation (triggered by button interactions)
    this._overrideTimer = 0;
    
    // Smooth target parameters
    this._tBob = 0;
    this._tScaleX = 1;
    this._tScaleY = 1;
    this._tRot = 0;
    this._tEye = 1;
    this._tEar = 0;
    this._tMouth = 0;
    this._tGlow = 0;

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
    this.targetX = x;
    this.targetY = y;
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

    // Countdown override timer; once it expires the next setState() call will resume
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
      // Only wander if not sleeping
      if (this.state !== 'sleepy') {
        const margin = 50;
        this.targetX = margin + Math.random() * (this.canvas.width - margin * 2);
      }
    }

    // Move towards target
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 2) {
      // Scale speed based on mood
      let currentSpeed = this.speed;
      if (this.state === 'sad') currentSpeed *= 0.5;
      if (this.state === 'excited') currentSpeed *= 1.5;
      if (this.state === 'sleepy') currentSpeed = 0;

      this.x += (dx / dist) * currentSpeed * dt;
      this.y += (dy / dist) * currentSpeed * dt;
    }

    // 3. Animation State Targets
    const t = this.animTime;
    
    // Reset targets to default
    this._tScaleX = 1;
    this._tScaleY = 1;
    this._tRot = 0;
    this._tEye = 1; // 1 = open, 0 = closed
    this._tEar = 0; // 0 = up, 1 = droop
    this._tMouth = 0; // 0 = lines, >0 = open arc
    this._tGlow = 0;

    switch (this.state) {
      case 'idle':
      case 'neutral':
        this._tBob = Math.sin(t * 3) * 5; 
        if (Math.random() < 0.005) this._tEye = 0.1; // blink
        break;
      case 'happy':
        this._tBob = Math.abs(Math.sin(t * 6)) * -15; // bouncy jump
        this._tGlow = 10;
        this._tEar = Math.sin(t * 6) * 0.2;
        break;
      case 'sad':
        this._tBob = Math.sin(t * 1.5) * 3 + 5; // low bob
        this._tEar = 1.0; // drooping ears
        break;
      case 'sleepy':
        this._tBob = Math.sin(t * 1) * 2 + 10; // resting lower
        this._tEye = 0.2; // half closed
        this._tEar = 0.8;
        break;
      case 'excited':
        this._tBob = Math.sin(t * 15) * 4; // fast wiggle
        this._tScaleX = 1 + Math.sin(t * 20) * 0.1;
        this._tGlow = 20;
        this._tMouth = 1;
        break;
      case 'eating':
        this._tBob = Math.sin(t * 8) * 3;
        this._tScaleX = 1 + Math.sin(t * 10) * 0.15; // chomping
        this._tScaleY = 1 - Math.sin(t * 10) * 0.1;
        this._tMouth = (Math.sin(t * 10) > 0) ? 1 : 0;
        break;
      case 'playing':
        this._tBob = Math.sin(t * 8) * -20;
        this._tRot = t * 4; // spinning
        this._tMouth = 0.5;
        break;
      case 'hungry':
        this._tBob = Math.sin(t * 4) * 5;
        this._tMouth = 0.8;
        break;
      default:
        this._tBob = 0;
        break;
    }

    // 4. Lerp actual draw parameters towards targets for smoothness
    const lerp = (a, b, amt) => a + (b - a) * amt;
    const lerpFactor = 10 * dt; // speed of transition

    this.bobOffset   = lerp(this.bobOffset, this._tBob, lerpFactor);
    this.scaleX      = lerp(this.scaleX, this._tScaleX, lerpFactor);
    this.scaleY      = lerp(this.scaleY, this._tScaleY, lerpFactor);
    this.eyeOpenness = lerp(this.eyeOpenness, this._tEye, 20 * dt); // fast blink
    this.earAngle    = lerp(this.earAngle, this._tEar, lerpFactor);
    this.mouthOpen   = lerp(this.mouthOpen, this._tMouth, lerpFactor);
    this.glow        = lerp(this.glow, this._tGlow, lerpFactor);
    
    // Spin needs special wrap handling or just direct override if playing
    if (this.state === 'playing') this.rotation = this._tRot;
    else this.rotation = lerp(this.rotation, 0, lerpFactor);
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
      neutral: '#06b6d4', // cyan
      hungry: '#eab308'   // yellow
    };
    return colors[state] || '#06b6d4';
  }

  /** Draw the pet at current position. */
  render() {
    const { ctx } = this;
    
    // Draw Particles first (behind)
    for (const p of this.particles) {
      ctx.globalAlpha = p.life / p.maxLife;
      if (p.type === 'Zzz') {
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '14px Nunito, sans-serif';
        ctx.fillText('Zzz', p.x, p.y);
      } else if (p.type === 'tear') {
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'sparkle') {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'heart') {
        ctx.fillStyle = '#ec4899';
        ctx.font = '16px sans-serif';
        ctx.fillText('♥', p.x, p.y);
      } else if (p.type === 'star') {
        ctx.fillStyle = '#fbbf24';
        ctx.font = '16px sans-serif';
        ctx.fillText('★', p.x, p.y);
      }
    }
    ctx.globalAlpha = 1.0;

    ctx.save();
    
    // Translate and Apply Rotation/Scale
    ctx.translate(this.x, this.y + this.bobOffset);
    ctx.rotate(this.rotation);
    ctx.scale(this.scaleX, this.scaleY);

    const bodyColor = this._getColorForState(this.state);

    // 1. Draw Tail
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(-20, 15, 25, 8, Math.PI / -6, 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw Ears
    ctx.save();
    // Left ear
    ctx.translate(-15, -30);
    ctx.rotate(this.earAngle * -0.5); // droops outwards
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, -20);
    ctx.lineTo(10, -5);
    ctx.fill();
    ctx.restore();

    ctx.save();
    // Right ear
    ctx.translate(15, -30);
    ctx.rotate(this.earAngle * 0.5); // droops outwards
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(10, -20);
    ctx.lineTo(-10, -5);
    ctx.fill();
    ctx.restore();

    // 3. Draw Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 30, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glow effects
    if (this.glow > 0) {
      ctx.shadowColor = bodyColor;
      ctx.shadowBlur = this.glow;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 4. Draw Eyes
    ctx.fillStyle = '#ffffff';
    // Left eye
    ctx.beginPath();
    ctx.ellipse(-10, -5, 8, 12 * this.eyeOpenness, 0, 0, Math.PI * 2); 
    ctx.fill();
    // Right eye
    ctx.beginPath();
    ctx.ellipse(10, -5, 8, 12 * this.eyeOpenness, 0, 0, Math.PI * 2); 
    ctx.fill();

    // Pupils (only draw if open)
    if (this.eyeOpenness > 0.1) {
      ctx.fillStyle = '#0a0a1a';
      ctx.beginPath();
      ctx.arc(-10, -2, 4, 0, Math.PI * 2);
      ctx.arc(10, -2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Eye highlights (sparkling if happy/excited)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-12, -4, 2, 0, Math.PI * 2);
      ctx.arc(8, -4, 2, 0, Math.PI * 2);
      if (this.state === 'happy' || this.state === 'excited') {
         ctx.arc(-8, -1, 1, 0, Math.PI * 2);
         ctx.arc(12, -1, 1, 0, Math.PI * 2);
      }
      ctx.fill();
    } else {
      // Draw closed eye lines
      ctx.strokeStyle = '#0a0a1a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-15, -5); ctx.lineTo(-5, -5);
      ctx.moveTo(5, -5); ctx.lineTo(15, -5);
      ctx.stroke();
    }

    // 5. Draw Mouth
    ctx.strokeStyle = '#0a0a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (this.mouthOpen > 0.1) {
      // Open mouth O shape
      ctx.fillStyle = '#4c1d95';
      ctx.ellipse(0, 10, 4, 4 * this.mouthOpen, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Smile arc
      ctx.arc(0, 10, 5, 0, Math.PI);
      ctx.stroke();
    }

    ctx.restore();
  }
}
