// ============================================================
// sweeper-hormuz — Persian Gulf Minesweeper
// Pure HTML/CSS/JS — no dependencies
// ============================================================

'use strict';

// ---- Map constants ----
const COLS = 40;
const ROWS = 15;

// Shorthand for readability in the mask
const T = true, F = false;

// Persian Gulf / Strait of Hormuz water mask
// Row 0 = North (Iran coast), Row 14 = South (Arabian Peninsula)
// Col 0 = West (Kuwait/Iraq head), Col 39 = East (Gulf of Oman)
const WATER_MASK = [
  // Row 0: Far north — Iran interior, all land
  [F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F],
  // Row 1: Still Iran interior
  [F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F],
  // Row 2: Northern water edge appears in mid-gulf (Iran coastline)
  [F,F,F,F,F,F,F,F,F,F,F,F,F,T,T,T,T,T,T,T,T,T,T,T,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F],
  // Row 3: N. Gulf widens — Qatar/Bahrain region; Gulf of Oman peek right
  [F,F,F,F,F,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,F,F,F,F,F,F,F,F,F,T,T,T,F,F,F],
  // Row 4: Gulf expands; Musandam peninsula gap (cols 26-30)
  [F,F,F,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,F,F,F,F,F,T,F,F,T,T,T,T,F,F],
  // Row 5: Gulf further open; Hormuz starts (cols 29-38 = narrows + Gulf of Oman)
  [F,F,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,F,F,T,T,T,T,T,T,T,T,T,T,F],
  // Row 6: Wide central gulf
  [F,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  // Row 7: Widest row — full gulf width; col 28 = Qeshm Island (land)
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,F,T,T,T,T,T,T,T,T,T,T,T],
  // Row 8: Wide, slightly south of center; Qeshm south channel open
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  // Row 9: Gulf narrows toward Hormuz; land pinch at cols 30-31
  [F,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,F,F,T,T,T,T,T,T,T,F],
  // Row 10: Southern gulf, UAE coast (land from col 27)
  [F,F,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,F,F,F,F,F,F,F,T,T,T,T,F,F],
  // Row 11: Narrowing further, Oman coast
  [F,F,F,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,F,F,F,F,F,F,F,F,F,F,T,T,F,F,F],
  // Row 12: Head of Gulf narrows (Iraq/Kuwait) and south narrows (UAE)
  [F,F,F,F,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F],
  // Row 13: Arabian Peninsula coast — very narrow water strip
  [F,F,F,F,F,F,T,T,T,T,T,T,T,T,T,T,T,T,T,T,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F],
  // Row 14: Far south — all land (Arabian Peninsula interior)
  [F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F],
];

// ---- Game state ----
let state = {
  mines:          [],   // 2D bool [row][col]
  revealed:       [],   // 2D bool
  flagged:        [],   // 2D bool
  numbers:        [],   // 2D int (count of adjacent mines)
  gameStatus:     'idle', // 'idle' | 'playing' | 'won' | 'lost'
  mineCount:      60,
  firstClick:     true, // mines placed after first click (guarantees safe start)
  timerInterval:  null,
  seconds:        0,
  flagsPlaced:    0,
  totalWaterCells: 0,
  revealedCount:  0,
};

// ---- DOM references ----
let gridEl, minesRemainingEl, timeDisplayEl, statusEl, difficultyEl, newGameBtn;

// ============================================================
// ENTRY POINT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  gridEl            = document.getElementById('grid');
  minesRemainingEl  = document.getElementById('mines-remaining');
  timeDisplayEl     = document.getElementById('time-display');
  statusEl          = document.getElementById('status-message');
  difficultyEl      = document.getElementById('difficulty');
  newGameBtn        = document.getElementById('new-game');

  newGameBtn.addEventListener('click', initGame);
  difficultyEl.addEventListener('change', () => {
    state.mineCount = parseInt(difficultyEl.value, 10);
    initGame();
  });

  // Prevent context menu on game grid
  gridEl.addEventListener('contextmenu', e => e.preventDefault());

  // Count total water cells once
  state.totalWaterCells = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (WATER_MASK[r][c]) state.totalWaterCells++;
    }
  }

  initGame();
});

// ============================================================
// INITIALIZATION
// ============================================================

function initGame() {
  stopTimer();

  state.mineCount     = parseInt(difficultyEl.value, 10);
  state.gameStatus    = 'idle';
  state.firstClick    = true;
  state.flagsPlaced   = 0;
  state.revealedCount = 0;
  state.seconds       = 0;

  // Reset 2D arrays
  state.mines    = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  state.revealed = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  state.flagged  = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  state.numbers  = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

  // Clear game-over class from grid
  gridEl.classList.remove('game-over');

  buildDOM();
  updateMineCounter();
  updateTimer();

  statusEl.textContent = '';
  statusEl.className   = '';
}

// ============================================================
// DOM BUILDING
// ============================================================

function buildDOM() {
  gridEl.innerHTML = '';

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell ' + (WATER_MASK[r][c] ? 'water' : 'land');
      cell.dataset.r = r;
      cell.dataset.c = c;

      if (WATER_MASK[r][c]) {
        cell.addEventListener('click',       () => handleLeftClick(r, c));
        cell.addEventListener('contextmenu', (e) => { e.preventDefault(); handleRightClick(r, c); });
      }

      gridEl.appendChild(cell);
    }
  }
}

function getCellEl(r, c) {
  return gridEl.children[r * COLS + c];
}

// ============================================================
// MINE PLACEMENT
// ============================================================

function placeMines(safeR, safeC) {
  // Collect all water cells excluding the safe zone (clicked cell + its neighbors)
  const safe = new Set();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = safeR + dr, nc = safeC + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && WATER_MASK[nr][nc]) {
        safe.add(nr * COLS + nc);
      }
    }
  }

  const candidates = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (WATER_MASK[r][c] && !safe.has(r * COLS + c)) {
        candidates.push([r, c]);
      }
    }
  }

  // Fisher-Yates shuffle, take first mineCount
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const count = Math.min(state.mineCount, candidates.length);
  for (let i = 0; i < count; i++) {
    const [r, c] = candidates[i];
    state.mines[r][c] = true;
  }

  computeCounts();
}

function computeCounts() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!WATER_MASK[r][c]) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS &&
              WATER_MASK[nr][nc] && state.mines[nr][nc]) {
            count++;
          }
        }
      }
      state.numbers[r][c] = count;
    }
  }
}

// ============================================================
// CLICK HANDLERS
// ============================================================

function handleLeftClick(r, c) {
  if (state.gameStatus === 'won' || state.gameStatus === 'lost') return;
  if (state.flagged[r][c]) return;
  if (state.revealed[r][c]) return;

  // Start game and timer on first click
  if (state.firstClick) {
    state.firstClick = false;
    state.gameStatus = 'playing';
    placeMines(r, c);
    startTimer();
  }

  if (state.mines[r][c]) {
    triggerLose(r, c);
  } else {
    revealCell(r, c);
    checkWin();
  }
}

function handleRightClick(r, c) {
  if (state.gameStatus === 'won' || state.gameStatus === 'lost') return;
  if (state.revealed[r][c]) return;

  state.flagged[r][c] = !state.flagged[r][c];
  if (state.flagged[r][c]) {
    state.flagsPlaced++;
  } else {
    state.flagsPlaced--;
  }

  renderCell(r, c);
  updateMineCounter();
}

// ============================================================
// REVEAL LOGIC
// ============================================================

function revealCell(r, c) {
  if (!WATER_MASK[r][c]) return;
  if (state.revealed[r][c]) return;
  if (state.flagged[r][c]) return;

  state.revealed[r][c] = true;
  state.revealedCount++;
  renderCell(r, c);

  if (state.numbers[r][c] === 0) {
    floodFill(r, c);
  }
}

function floodFill(r, c) {
  // BFS flood fill for zero-count cells
  const queue = [[r, c]];
  const visited = new Set([r * COLS + c]);

  while (queue.length > 0) {
    const [cr, cc] = queue.shift();

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = cr + dr, nc = cc + dc;
        const key = nr * COLS + nc;

        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        if (!WATER_MASK[nr][nc]) continue;
        if (visited.has(key)) continue;
        if (state.flagged[nr][nc]) continue;
        if (state.mines[nr][nc]) continue;

        visited.add(key);

        if (!state.revealed[nr][nc]) {
          state.revealed[nr][nc] = true;
          state.revealedCount++;
          renderCell(nr, nc);
        }

        if (state.numbers[nr][nc] === 0) {
          queue.push([nr, nc]);
        }
      }
    }
  }
}

// ============================================================
// WIN / LOSE
// ============================================================

function checkWin() {
  if (state.revealedCount === state.totalWaterCells - state.mineCount) {
    state.gameStatus = 'won';
    stopTimer();
    gridEl.classList.add('game-over');

    // Auto-flag all unflagged mines
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (WATER_MASK[r][c] && state.mines[r][c] && !state.flagged[r][c]) {
          state.flagged[r][c] = true;
          state.flagsPlaced++;
          renderCell(r, c);
        }
      }
    }
    updateMineCounter();

    const t = formatTime(state.seconds);
    statusEl.textContent = `\u2693 Strait cleared! Time: ${t}`;
    statusEl.className = 'win';
  }
}

function triggerLose(clickedR, clickedC) {
  state.gameStatus = 'lost';
  stopTimer();
  gridEl.classList.add('game-over');

  // Reveal all mines; mark wrong flags
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!WATER_MASK[r][c]) continue;
      if (state.mines[r][c]) {
        if (!state.flagged[r][c]) {
          const el = getCellEl(r, c);
          el.className = 'cell water mine-revealed';
          el.textContent = '\u{1F4A3}'; // 💣
        }
      } else if (state.flagged[r][c]) {
        // Wrong flag
        const el = getCellEl(r, c);
        el.className = 'cell water wrong-flag';
        el.textContent = '\u274C'; // ❌
      }
    }
  }

  // Highlight the mine that was clicked
  const clickedEl = getCellEl(clickedR, clickedC);
  clickedEl.className = 'cell water mine-clicked';
  clickedEl.textContent = '\u{1F4A3}';

  statusEl.textContent = '\u{1F4A5} Mine detonated! Game over.';
  statusEl.className = 'lose';
}

// ============================================================
// RENDERING
// ============================================================

function renderCell(r, c) {
  const el = getCellEl(r, c);
  if (!WATER_MASK[r][c]) return; // land cells are static

  // Reset
  el.textContent = '';
  el.removeAttribute('data-number');

  if (state.flagged[r][c] && !state.revealed[r][c]) {
    el.className = 'cell water flagged';
    el.textContent = '\u26F3'; // ⛳ (flag)
    return;
  }

  if (!state.revealed[r][c]) {
    el.className = 'cell water';
    return;
  }

  // Revealed
  const n = state.numbers[r][c];
  if (n === 0) {
    el.className = 'cell water revealed empty';
  } else {
    el.className = 'cell water revealed';
    el.dataset.number = n;
    el.textContent = n;
  }
}

// ============================================================
// TIMER
// ============================================================

function startTimer() {
  stopTimer();
  state.seconds = 0;
  updateTimer();
  state.timerInterval = setInterval(() => {
    state.seconds++;
    updateTimer();
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function updateTimer() {
  timeDisplayEl.textContent = formatTime(state.seconds);
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ============================================================
// MINE COUNTER
// ============================================================

function updateMineCounter() {
  minesRemainingEl.textContent = state.mineCount - state.flagsPlaced;
}
