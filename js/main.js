// =============================================
// main.js — App Bootstrap
// Entry point: wires Game to DOM, handles
// welcome modal, action buttons, UI updates
// =============================================

import { Game }    from './game.js';
import { Storage } from './storage.js';

// --- DOM refs ---
const canvas        = document.getElementById('game-canvas');
const welcomeModal  = document.getElementById('welcome-modal');
const petNameInput  = document.getElementById('pet-name-input');
const startBtn      = document.getElementById('start-btn');
const journalModal  = document.getElementById('journal-modal');
const journalBtn    = document.getElementById('btn-journal');
const closeJournal  = document.getElementById('close-journal');
const actionButtons = document.querySelectorAll('[data-action]');

let game;

// --- Bootstrap ---
function init() {
  if (Storage.hasSave()) {
    // Returning player — skip welcome modal
    startGame(null);
  } else {
    // New player — show welcome modal
    welcomeModal.classList.remove('hidden');
  }
}

function startGame(name) {
  welcomeModal.classList.add('hidden');

  // If new name provided, store it temporarily so Game can pick it up
  if (name) {
    const existing = Storage.load() ?? {};
    Storage.save({ ...existing, petName: name });
  }

  game = new Game(canvas);
  game.start();

  // Initial UI sync
  updateUI(game.getSnapshot());

  // Show neglect greeting if needed
  const snap = game.getSnapshot();
  if (snap.memory?.days_ignored > 0) {
    showSpeechBubble(game.ai.getGreeting(), 4000);
  }
}

// --- Welcome modal ---
startBtn.addEventListener('click', () => {
  const name = petNameInput.value.trim() || 'Pip';
  startGame(name);
});
petNameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') startBtn.click();
});

// --- Action buttons ---
actionButtons.forEach(btn => {
  const action = btn.dataset.action;
  if (action === 'journal') return; // handled separately
  btn.addEventListener('click', () => {
    if (!game) return;
    game.interact(action);
  });
});

// --- Journal modal ---
journalBtn.addEventListener('click', () => {
  if (!game) return;
  populateJournal(game.getSnapshot());
  journalModal.classList.remove('hidden');
});
closeJournal.addEventListener('click', () => {
  journalModal.classList.add('hidden');
});
journalModal.addEventListener('click', e => {
  if (e.target === journalModal) journalModal.classList.add('hidden');
});

// --- React to state changes ---
window.addEventListener('soulpet:statechange', e => {
  updateUI(e.detail);
});

// --- UI update helpers (Phase 10) ---
function updateUI(snapshot) { /* TODO */ }
function showSpeechBubble(text, duration) { /* TODO */ }
function populateJournal(snapshot) { /* TODO */ }

// --- Boot ---
init();
