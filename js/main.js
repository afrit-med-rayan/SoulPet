// =============================================
// main.js — App Bootstrap
// Phase 2: statechange → UI update pipeline,
//          day/night badge, stat bar sync,
//          journal population, toast/speech
// =============================================

import { Game }    from './game.js';
import { Storage } from './storage.js';

// ── DOM refs ──────────────────────────────────────
const canvas           = document.getElementById('game-canvas');
const welcomeModal     = document.getElementById('welcome-modal');
const petNameInput     = document.getElementById('pet-name-input');
const startBtn         = document.getElementById('start-btn');
const journalModal     = document.getElementById('journal-modal');
const closeJournal     = document.getElementById('close-journal');
const journalBody      = document.getElementById('journal-body');
const actionButtons    = document.querySelectorAll('[data-action]');

// Top bar
const petNameDisplay   = document.getElementById('pet-name-display');
const dayCounter       = document.getElementById('day-counter');
const timeOfDayBadge   = document.getElementById('time-of-day');

// Stat bars + values
const statEls = {
  happiness:  { bar: document.getElementById('bar-happiness'),  val: document.getElementById('stat-happiness-val')  },
  hunger:     { bar: document.getElementById('bar-hunger'),     val: document.getElementById('stat-hunger-val')     },
  energy:     { bar: document.getElementById('bar-energy'),     val: document.getElementById('stat-energy-val')     },
  trust:      { bar: document.getElementById('bar-trust'),      val: document.getElementById('stat-trust-val')      },
  loneliness: { bar: document.getElementById('bar-loneliness'), val: document.getElementById('stat-loneliness-val') },
  curiosity:  { bar: document.getElementById('bar-curiosity'),  val: document.getElementById('stat-curiosity-val')  },
};

// Personality & mood
const personalityBadges = document.getElementById('personality-badges');
const moodLabel         = document.getElementById('mood-label');

// Speech bubble
const speechBubble  = document.getElementById('speech-bubble');
const speechText    = document.getElementById('speech-text');

// Toast
const toast         = document.getElementById('toast');
const toastText     = document.getElementById('toast-text');

// ─────────────────────────────────────────────────
let game;
let speechTimeout;
let toastTimeout;

// ── Bootstrap ─────────────────────────────────────
function init() {
  if (Storage.hasSave()) {
    startGame(null);            // returning player
  } else {
    welcomeModal.classList.remove('hidden');
    petNameInput.focus();
  }
}

function startGame(name) {
  welcomeModal.classList.add('hidden');

  if (name) {
    // Persist name before Game reads the save
    const existing = Storage.load() ?? {};
    Storage.save({ ...existing, petName: name });
  }

  game = new Game(canvas);
  game.start();

  // Immediate UI sync
  updateUI(game.getSnapshot());

  // Neglect greeting if returning after absence
  const snap = game.getSnapshot();
  if ((snap.memory?.days_ignored ?? 0) > 0) {
    const greeting = game.ai.getGreeting();
    showSpeechBubble(greeting, 5000);
    if (snap.memory.days_ignored > 1) {
      showToast(`Your pet missed you! (${snap.memory.days_ignored} day${snap.memory.days_ignored > 1 ? 's' : ''} away)`);
    }
  }
}

// ── Welcome modal ─────────────────────────────────
startBtn.addEventListener('click', () => {
  const name = petNameInput.value.trim() || 'Pip';
  startGame(name);
});
petNameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') startBtn.click();
});

// ── Action buttons ────────────────────────────────
actionButtons.forEach(btn => {
  const action = btn.dataset.action;
  if (!action || action === 'journal') return;

  btn.addEventListener('click', () => {
    if (!game) return;
    game.interact(action);

    // Show a quick feedback speech bubble
    const lines = {
      feed:  ['Yum! Thanks! 🍖', 'That was delicious! 😋', 'More please! 😊'],
      play:  ['Wheee! 🎾', 'This is so fun! ✨', 'Again, again! 🎉'],
      talk:  ['I love our chats! 💬', 'Tell me more! 👂', 'You always know what to say 💜'],
      sleep: ['Zzz… 💤', 'Good night… 😴', 'So sleepy… 💤'],
      clean: ['All sparkly! 🛁', 'I feel so fresh! ✨', 'Thank you~! 🫧'],
    };
    const pool = lines[action] ?? ['♥'];
    showSpeechBubble(pool[Math.floor(Math.random() * pool.length)], 2500);
  });
});

// ── Journal modal ─────────────────────────────────
document.getElementById('btn-journal').addEventListener('click', () => {
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

// ── React to any state change ─────────────────────
window.addEventListener('soulpet:statechange', e => {
  updateUI(e.detail);
});

// ─────────────────────────────────────────────────
//  UI Update Pipeline
// ─────────────────────────────────────────────────

function updateUI(snapshot) {
  const { emotions, memory, activeTraits, petState, dayPhase, petName } = snapshot;

  // Top bar
  if (petName) petNameDisplay.textContent = petName;
  dayCounter.textContent  = `Day ${(memory?.getDaysAlive?.() ?? 0) + 1}`;

  // Day/night badge
  const phaseMap = {
    dawn:  '🌅 Dawn',
    day:   '☀️ Day',
    dusk:  '🌇 Dusk',
    night: '🌙 Night',
  };
  timeOfDayBadge.textContent = phaseMap[dayPhase] ?? '☀️ Day';

  // Stat bars + values
  if (emotions) {
    for (const [key, el] of Object.entries(statEls)) {
      const raw = emotions[key] ?? 0;
      // hunger bar should be INVERTED visually (full = not hungry)
      const display = key === 'hunger'     ? 100 - raw
                    : key === 'loneliness' ? 100 - raw   // social bar (inverse of lonely)
                    : raw;
      el.bar.style.width = `${display.toFixed(1)}%`;
      el.val.textContent = Math.round(raw);
    }
  }

  // Mood label
  if (game) moodLabel.textContent = game.emotions.getOverallMood();

  // Personality badges (with per-trait color via data-trait attribute)
  if (activeTraits) {
    personalityBadges.innerHTML = '';
    if (activeTraits.length === 0) {
      const span = document.createElement('span');
      span.className = 'trait-badge';
      span.dataset.trait = 'mysterious';
      span.textContent = 'Mysterious';
      personalityBadges.appendChild(span);
    } else {
      // Grab scores for tooltip display
      const scores = game?.personality?.traitScores ?? {};
      activeTraits.forEach(trait => {
        const span = document.createElement('span');
        span.className       = 'trait-badge';
        span.dataset.trait   = trait;                                  // CSS hook
        span.textContent     = trait.charAt(0).toUpperCase() + trait.slice(1);
        const score = scores[trait];
        if (score !== undefined) {
          span.title = `${trait}: ${Math.round(score)}/100`;          // tooltip
        }
        personalityBadges.appendChild(span);
      });
    }
  }
}

// ─────────────────────────────────────────────────
//  Speech Bubble
// ─────────────────────────────────────────────────

/**
 * Show a speech bubble above the pet for `duration` ms.
 * @param {string} text
 * @param {number} [duration=3000]
 */
export function showSpeechBubble(text, duration = 3000) {
  clearTimeout(speechTimeout);
  speechText.textContent = text;
  speechBubble.classList.remove('hidden');

  speechTimeout = setTimeout(() => {
    speechBubble.classList.add('hidden');
  }, duration);
}

// ─────────────────────────────────────────────────
//  Toast Notification
// ─────────────────────────────────────────────────

/**
 * Show a bottom toast for `duration` ms.
 * @param {string} text
 * @param {number} [duration=3500]
 */
export function showToast(text, duration = 3500) {
  clearTimeout(toastTimeout);
  toastText.textContent = text;
  toast.classList.remove('hidden');

  toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, duration);
}

// ─────────────────────────────────────────────────
//  Journal Population
// ─────────────────────────────────────────────────

function populateJournal(snapshot) {
  const m      = snapshot.memory ?? {};
  const scores = game?.personality?.traitScores ?? {};
  const active = new Set(snapshot.activeTraits ?? []);

  // ── General entries ──────────────────────────────
  const entries = [
    ['🐾 Pet Name',        snapshot.petName ?? 'Pip'],
    ['📅 First Met',       m.first_met ? new Date(m.first_met).toLocaleDateString() : '—'],
    ['📆 Days Alive',      `${Math.floor((Date.now() - (m.first_met ?? Date.now())) / 86400000)}`],
    ['🔄 Sessions',        m.session_count ?? 1],
    ['⏳ Total Playtime',  `${Math.floor((m.total_playtime_ms ?? 0) / 60000)} min`],
    ['🍖 Times Fed',       m.times_fed     ?? 0],
    ['🎾 Times Played',    m.times_played  ?? 0],
    ['💬 Times Talked',    m.times_talked  ?? 0],
    ['💤 Times Slept',     m.times_slept   ?? 0],
    ['🛁 Times Cleaned',   m.times_cleaned ?? 0],
    ['⭐ Fav Activity',    m.favorite_activity ?? 'none'],
    ['😴 Days Ignored',    m.days_ignored  ?? 0],
    ['💜 Current Mood',    game ? game.emotions.getOverallMood() : '—'],
  ];

  const entriesHtml = entries.map(([key, val]) => `
    <div class="journal-entry">
      <span class="journal-entry__key">${key}</span>
      <span class="journal-entry__val">${val}</span>
    </div>
  `).join('');

  // ── Personality breakdown section ────────────────
  const TRAIT_META = {
    affectionate: { emoji: '💗', label: 'Affectionate' },
    playful:      { emoji: '🎾', label: 'Playful'      },
    curious:      { emoji: '🔭', label: 'Curious'      },
    shy:          { emoji: '🫣', label: 'Shy'          },
    energetic:    { emoji: '⚡', label: 'Energetic'    },
    mischievous:  { emoji: '😈', label: 'Mischievous'  },
    withdrawn:    { emoji: '🌑', label: 'Withdrawn'    },
  };

  const traitRows = Object.entries(TRAIT_META).map(([trait, { emoji, label }]) => {
    const score   = Math.round(scores[trait] ?? 0);
    const isActive = active.has(trait);
    return `
      <div class="journal-trait-row ${isActive ? 'journal-trait-row--active' : ''}">
        <span class="journal-trait-label">
          ${emoji} ${label}
          ${isActive ? '<span class="trait-badge trait-badge--sm" data-trait="' + trait + '">Active</span>' : ''}
        </span>
        <div class="journal-trait-bar-track">
          <div class="journal-trait-bar" data-trait="${trait}" style="width:${score}%"></div>
        </div>
        <span class="journal-trait-score">${score}</span>
      </div>
    `;
  }).join('');

  journalBody.innerHTML = `
    ${entriesHtml}
    <div class="journal-section-header">🧬 Personality Breakdown</div>
    <div class="journal-traits">${traitRows}</div>
  `;
}


// ─────────────────────────────────────────────────
//  Boot
// ─────────────────────────────────────────────────
init();
