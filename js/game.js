// =============================================
// game.js — Game Loop & Canvas Controller
// Owns the requestAnimationFrame loop,
// deltaTime, slow-tick, and resize handling
// =============================================

import { World }           from './world.js';
import { Pet }             from './pet.js';
import { EmotionEngine }   from './emotions.js';
import { MemorySystem }    from './memory.js';
import { PersonalitySystem } from './personality.js';
import { EvolutionSystem } from './evolution.js';
import { PetAI }           from './pet_ai.js';
import { Storage }         from './storage.js';

const SLOW_TICK_INTERVAL = 30; // seconds

export class Game {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');

    // Load or create save
    const save = Storage.load();

    // Core systems
    this.emotions    = new EmotionEngine(save?.emotions);
    this.memory      = new MemorySystem(save?.memory);
    this.personality = new PersonalitySystem();
    this.evolution   = new EvolutionSystem();

    // Rendering systems
    this.world = new World(this.ctx, this.canvas);
    this.pet   = new Pet(this.ctx, this.canvas, save?.petName ?? 'Pip');

    // AI
    this.ai = new PetAI(this.pet, this.emotions, this.memory);

    // Timing
    this._lastTime     = 0;
    this._slowTickAcc  = 0;
    this._autoSaveAcc  = 0;
    this._running      = false;

    // Resize handling
    window.addEventListener('resize', () => this._resize());
    this._resize();

    // Auto-save on unload
    window.addEventListener('beforeunload', () => this.save());
  }

  /** Start the game loop. */
  start() {
    if (this._running) return;
    this._running  = true;
    this._lastTime = performance.now();
    requestAnimationFrame(ts => this._loop(ts));
  }

  /** Pause the loop. */
  pause() { this._running = false; }

  /** Main loop. */
  _loop(timestamp) {
    if (!this._running) return;
    const dt = Math.min((timestamp - this._lastTime) / 1000, 0.1); // cap at 100ms
    this._lastTime = timestamp;

    this._update(dt);
    this._render();

    requestAnimationFrame(ts => this._loop(ts));
  }

  _update(dt) {
    // Slow tick (stat decay, AI speech, etc.)
    this._slowTickAcc += dt;
    if (this._slowTickAcc >= SLOW_TICK_INTERVAL) {
      this._slowTick(this._slowTickAcc);
      this._slowTickAcc = 0;
    }

    // Auto-save every 30 s
    this._autoSaveAcc += dt;
    if (this._autoSaveAcc >= 30) {
      this.save();
      this._autoSaveAcc = 0;
    }

    // Update subsystems (Phase 2 wiring; logic filled in later phases)
    this.world.update(dt);
    this.pet.update(dt);
    this.ai.update(dt);
  }

  _slowTick(elapsedSeconds) {
    this.emotions.tick(elapsedSeconds);
    this.personality.update(this.emotions, this.memory);

    const state = this.evolution.resolveState(this.emotions);
    this.pet.setState(state);
  }

  _render() {
    const hour = new Date().getHours();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.world.render(hour);
    this.pet.render();
  }

  /** Fit canvas to its CSS container. */
  _resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width  = rect.width  || window.innerWidth;
    this.canvas.height = rect.height || window.innerHeight * 0.65;
    if (this.pet) {
      this.pet.x = this.canvas.width / 2;
      this.pet.y = this.canvas.height / 2;
    }
  }

  /** Trigger an interaction action. */
  interact(action) {
    switch (action) {
      case 'feed':  this.emotions.feed();  this.memory.record('feed');  break;
      case 'play':  this.emotions.play();  this.memory.record('play');  break;
      case 'talk':  this.emotions.talk();  this.memory.record('talk');  break;
      case 'sleep': this.emotions.sleep(); this.memory.record('sleep'); break;
      case 'clean': this.emotions.clean(); this.memory.record('clean'); break;
    }
    this.personality.update(this.emotions, this.memory);
    const state = this.evolution.resolveState(this.emotions);
    this.pet.setState(state);
    this.save();

    // Dispatch event so UI can update
    window.dispatchEvent(new CustomEvent('soulpet:statechange', {
      detail: this.getSnapshot(),
    }));
  }

  /** Serialisable snapshot of the full game state. */
  getSnapshot() {
    return {
      petName:     this.pet.name,
      emotions:    this.emotions.toJSON(),
      memory:      this.memory.toJSON(),
      personality: this.personality.toJSON(),
      petState:    this.evolution.resolveState(this.emotions),
      activeTraits: this.personality.getActiveTraits(),
    };
  }

  save() {
    Storage.save(this.getSnapshot());
  }
}
