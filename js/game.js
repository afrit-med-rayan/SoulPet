// =============================================
// game.js — Game Loop & Canvas Controller
// Phase 2: Full implementation
//   • requestAnimationFrame loop
//   • capped deltaTime (spiral-of-death proof)
//   • FPS counter
//   • slow-tick accumulator (30 s)
//   • auto-save accumulator (30 s)
//   • ResizeObserver canvas sizing
//   • day/night phase system
// =============================================

import { World }             from './world.js';
import { Pet }               from './pet.js';
import { EmotionEngine }     from './emotions.js';
import { MemorySystem }      from './memory.js';
import { PersonalitySystem } from './personality.js';
import { EvolutionSystem }   from './evolution.js';
import { PetAI }             from './pet_ai.js';
import { Storage }           from './storage.js';

// ── Timing constants ──────────────────────────────
const SLOW_TICK_S = 30;   // seconds between passive-decay ticks
const AUTOSAVE_S  = 30;   // seconds between auto-saves
const MAX_DELTA   = 0.10; // cap at 100 ms — prevents physics spiral

export class Game {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');

    // ── Load / create save ────────────────────────
    const save = Storage.load();

    // ── Core systems ──────────────────────────────
    this.emotions    = new EmotionEngine(save?.emotions);
    this.memory      = new MemorySystem(save?.memory);
    this.personality = new PersonalitySystem();
    this.evolution   = new EvolutionSystem();

    // ── Rendering systems ─────────────────────────
    this.world = new World(this.ctx, this.canvas);
    this.pet   = new Pet(this.ctx, this.canvas, save?.petName ?? 'Pip');

    // ── AI layer ──────────────────────────────────
    this.ai = new PetAI(this.pet, this.emotions, this.memory);

    // ── Loop state ────────────────────────────────
    this._running      = false;
    this._lastTime     = 0;      // performance.now() of last frame
    this._slowTickAcc  = 0;      // seconds since last slow tick
    this._autoSaveAcc  = 0;      // seconds since last auto-save

    // ── FPS tracking ──────────────────────────────
    this._fps        = 0;        // last measured FPS
    this._frameCount = 0;        // frames counted in current 1-s window
    this._fpsTimer   = 0;        // accumulates toward 1 s

    // ── Day/Night ─────────────────────────────────
    this.hourOfDay = new Date().getHours();

    // ── Canvas sizing ─────────────────────────────
    this._setupResize();

    // ── Save on tab close ─────────────────────────
    window.addEventListener('beforeunload', () => this.save());
  }

  // ═══════════════════════════════════════════════
  //  Public API
  // ═══════════════════════════════════════════════

  /** Start the RAF loop. */
  start() {
    if (this._running) return;
    this._running  = true;
    this._lastTime = performance.now();
    requestAnimationFrame(ts => this._loop(ts));
    console.log('[SoulPet] 🚀 Game loop started');
  }

  /** Pause the RAF loop without destroying state. */
  pause() {
    this._running = false;
    console.log('[SoulPet] ⏸ Game loop paused');
  }

  /**
   * Trigger an interaction from a UI button.
   * @param {'feed'|'play'|'talk'|'sleep'|'clean'} action
   */
  interact(action) {
    switch (action) {
      case 'feed':  this.emotions.feed();  this.memory.record('feed');  break;
      case 'play':  this.emotions.play();  this.memory.record('play');  break;
      case 'talk':  this.emotions.talk();  this.memory.record('talk');  break;
      case 'sleep': this.emotions.sleep(); this.memory.record('sleep'); break;
      case 'clean': this.emotions.clean(); this.memory.record('clean'); break;
      default:
        console.warn('[SoulPet] Unknown action:', action);
        return;
    }
    this._syncEvolution();
    this.save();
    this._dispatchStateChange();
  }

  /** Full serialisable snapshot of current game state. */
  getSnapshot() {
    return {
      petName:      this.pet.name,
      emotions:     this.emotions.toJSON(),
      memory:       this.memory.toJSON(),
      personality:  this.personality.toJSON(),
      petState:     this.evolution.resolveState(this.emotions),
      activeTraits: this.personality.getActiveTraits(),
      hourOfDay:    this.hourOfDay,
      dayPhase:     this.getDayPhase(),
      fps:          this._fps,
    };
  }

  save() {
    Storage.save(this.getSnapshot());
  }

  // ═══════════════════════════════════════════════
  //  Day / Night Phase
  // ═══════════════════════════════════════════════

  /**
   * Maps current hour → one of four phase strings.
   * @returns {'dawn'|'day'|'dusk'|'night'}
   */
  getDayPhase() {
    const h = this.hourOfDay;
    if (h >= 5  && h < 8)  return 'dawn';
    if (h >= 8  && h < 18) return 'day';
    if (h >= 18 && h < 21) return 'dusk';
    return 'night';
  }

  // ═══════════════════════════════════════════════
  //  RAF Loop
  // ═══════════════════════════════════════════════

  /**
   * Core loop — called every animation frame.
   * @param {number} timestamp — performance.now() value from rAF
   */
  _loop(timestamp) {
    if (!this._running) return;

    // ── Delta time ────────────────────────────────
    // Measure seconds since last frame; cap at MAX_DELTA so a tab
    // that was hidden for seconds doesn't cause a huge physics jump.
    const rawDelta = (timestamp - this._lastTime) / 1000;
    const dt       = Math.min(rawDelta, MAX_DELTA);
    this._lastTime = timestamp;

    // ── FPS counter (measured over 1-second windows) ──
    this._frameCount++;
    this._fpsTimer += dt;
    if (this._fpsTimer >= 1) {
      this._fps        = this._frameCount;
      this._frameCount = 0;
      this._fpsTimer  -= 1;  // subtract rather than reset — avoids drift
    }

    this._update(dt);
    this._render();

    // Schedule next frame
    requestAnimationFrame(ts => this._loop(ts));
  }

  // ═══════════════════════════════════════════════
  //  Update
  // ═══════════════════════════════════════════════

  /** @param {number} dt — seconds since last frame */
  _update(dt) {
    // Refresh wall-clock hour once per measured FPS window
    if (this._frameCount === 1) {
      this.hourOfDay = new Date().getHours();
    }

    // ── Slow tick ─────────────────────────────────
    this._slowTickAcc += dt;
    if (this._slowTickAcc >= SLOW_TICK_S) {
      this._slowTick(this._slowTickAcc);
      this._slowTickAcc = 0;
    }

    // ── Auto-save ─────────────────────────────────
    this._autoSaveAcc += dt;
    if (this._autoSaveAcc >= AUTOSAVE_S) {
      this.save();
      this._autoSaveAcc = 0;
      console.log('[SoulPet] 💾 Auto-saved');
    }

    // ── Subsystem updates ─────────────────────────
    // world, pet, ai all receive dt for their own internal timers
    this.world.update(dt);
    this.pet.update(dt);
    this.ai.update(dt);
  }

  // ═══════════════════════════════════════════════
  //  Slow Tick  (runs every SLOW_TICK_S seconds)
  // ═══════════════════════════════════════════════

  /** @param {number} elapsed — actual seconds elapsed (may be slightly > 30) */
  _slowTick(elapsed) {
    // Passive emotion decay
    this.emotions.tick(elapsed);

    // Sync visual state and personality
    this._syncEvolution();

    // Notify UI
    this._dispatchStateChange();

    console.log(
      `[SoulPet] ⏱ Slow tick | mood: ${this.evolution.resolveState(this.emotions)} | phase: ${this.getDayPhase()}`
    );
  }

  // ═══════════════════════════════════════════════
  //  Render
  // ═══════════════════════════════════════════════

  _render() {
    const { ctx, canvas } = this;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Background world (sky, ground, clouds…)
    this.world.render(this.hourOfDay);

    // 2. Pet entity
    this.pet.render();

    // 3. Debug overlay (only when ?debug is in URL)
    if (location.search.includes('debug')) {
      this._renderDebug();
    }
  }

  /** Debug HUD drawn directly on canvas. */
  _renderDebug() {
    const { ctx } = this;
    const snap    = this.emotions.toJSON();

    ctx.save();
    ctx.fillStyle    = 'rgba(0,0,0,0.55)';
    ctx.fillRect(4, 4, 220, 130);

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font      = '11px monospace';

    const lines = [
      `FPS: ${this._fps}`,
      `Phase: ${this.getDayPhase()} (${this.hourOfDay}h)`,
      `State: ${this.evolution.resolveState(this.emotions)}`,
      `Happy: ${snap.happiness.toFixed(1)}  Hunger: ${snap.hunger.toFixed(1)}`,
      `Energy: ${snap.energy.toFixed(1)}   Trust: ${snap.trust.toFixed(1)}`,
      `Lonely: ${snap.loneliness.toFixed(1)}  Curio: ${snap.curiosity.toFixed(1)}`,
      `dt-cap: ${MAX_DELTA * 1000}ms  tick-acc: ${this._slowTickAcc.toFixed(1)}s`,
    ];
    lines.forEach((l, i) => ctx.fillText(l, 10, 20 + i * 16));
    ctx.restore();
  }

  // ═══════════════════════════════════════════════
  //  Private Helpers
  // ═══════════════════════════════════════════════

  /** Re-resolve visual state and push to pet + personality. */
  _syncEvolution() {
    this.personality.update(this.emotions, this.memory);
    const state = this.evolution.resolveState(this.emotions);
    this.pet.setState(state);
  }

  /** Broadcast game state so UI modules can react without polling. */
  _dispatchStateChange() {
    window.dispatchEvent(new CustomEvent('soulpet:statechange', {
      detail: this.getSnapshot(),
    }));
  }

  // ═══════════════════════════════════════════════
  //  Canvas Resize  (ResizeObserver)
  // ═══════════════════════════════════════════════

  _setupResize() {
    const resize = () => {
      const parent = this.canvas.parentElement;
      const rect   = parent
        ? parent.getBoundingClientRect()
        : { width: window.innerWidth, height: window.innerHeight * 0.65 };

      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);

      // Skip if unchanged — prevents unnecessary redraws
      if (this.canvas.width === w && this.canvas.height === h) return;

      this.canvas.width  = w;
      this.canvas.height = h;

      // Re-anchor pet to bottom-centre of new canvas size
      if (this.pet) {
        this.pet.x       = w / 2;
        this.pet.y       = h * 0.60;
        this.pet.targetX = this.pet.x;
        this.pet.targetY = this.pet.y;
      }

      // Re-init world background to match new size (Phase 3)
      if (this.world && typeof this.world.onResize === 'function') {
        this.world.onResize(w, h);
      }

      console.log(`[SoulPet] 📐 Canvas resized → ${w}×${h}`);
    };

    // ResizeObserver keeps canvas in sync with CSS layout
    if (window.ResizeObserver && this.canvas.parentElement) {
      this._resizeObserver = new ResizeObserver(resize);
      this._resizeObserver.observe(this.canvas.parentElement);
    } else {
      // Fallback: listen to window resize
      window.addEventListener('resize', resize);
    }

    // Initial sizing pass
    resize();
  }
}
