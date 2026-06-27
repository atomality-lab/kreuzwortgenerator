'use strict';

const VERSION = '0.1.0';
const STORAGE_KEY = 'kreuzwortdrucker.v0.1.lastState';

const els = {
  gridWidth: document.querySelector('#gridWidth'),
  gridHeight: document.querySelector('#gridHeight'),
  minLength: document.querySelector('#minLength'),
  maxWords: document.querySelector('#maxWords'),
  seedAcross: document.querySelector('#seedAcross'),
  seedDown: document.querySelector('#seedDown'),
  cropToContent: document.querySelector('#cropToContent'),
  cellSize: document.querySelector('#cellSize'),
  baseName: document.querySelector('#baseName'),
  wordInput: document.querySelector('#wordInput'),
  generateButton: document.querySelector('#generateButton'),
  exampleButton: document.querySelector('#exampleButton'),
  resetButton: document.querySelector('#resetButton'),
  installButton: document.querySelector('#installButton'),
  messages: document.querySelector('#messages'),
  stats: document.querySelector('#stats'),
  gridWrap: document.querySelector('#gridWrap'),
  emptyViewButton: document.querySelector('#emptyViewButton'),
  solutionViewButton: document.querySelector('#solutionViewButton'),
  exportEmptySvg: document.querySelector('#exportEmptySvg'),
  exportSolutionSvg: document.querySelector('#exportSolutionSvg'),
  exportSolutionsTxt: document.querySelector('#exportSolutionsTxt'),
  exportProjectJson: document.querySelector('#exportProjectJson'),
  acrossList: document.querySelector('#acrossList'),
  downList: document.querySelector('#downList'),
  unplacedList: document.querySelector('#unplacedList'),
};

const examples = [
  'Ambivalenz', 'Metapher', 'Resonanz', 'Katalysator', 'Paradox', 'Dialektik',
  'Synthese', 'Analyse', 'Kognition', 'Diskurs', 'Symbolik', 'Ironie', 'Allegorie',
  'These', 'Antithese', 'Kontext', 'Abstraktion', 'Deduktion', 'Induktion',
  'Hermeneutik', 'Perspektive', 'Erkenntnis', 'Argument', 'Logik', 'Semantik',
  'Pragmatik', 'Axiom', 'Kategorie', 'Narrativ', 'Motiv', 'Theseus'
];

let currentPuzzle = null;
let currentView = 'empty';
let deferredInstallPrompt = null;

function normalizeWord(raw) {
  const original = String(raw || '').trim();
  const grid = original
    .normalize('NFC')
    .toUpperCase()
    .replaceAll('Ä', 'AE')
    .replaceAll('Ö', 'OE')
    .replaceAll('Ü', 'UE')
    .replaceAll('ẞ', 'SS')
    .replaceAll('ß', 'SS')
    .replace(/[\s\-–—_]+/g, '')
    .replace(/[^A-Z]/g, '');
  return { original, grid };
}

function parseWords(text, minLength, maxWords, seeds) {
  const rawLines = String(text || '').split(/\r?\n/);
  const normalized = [];
  const issues = [];
  const seenGrid = new Map();

  const addWord = (word, source) => {
    const clean = normalizeWord(word);
    if (!clean.original) return;
    if (!clean.grid) {
      issues.push(`${clean.original}: keine gültigen Buchstaben nach der Umschrift.`);
      return;
    }
    if (clean.grid.length < minLength) {
      issues.push(`${clean.original}: kürzer als Mindestlänge ${minLength}.`);
      return;
    }
    if (seenGrid.has(clean.grid)) {
      const first = seenGrid.get(clean.grid);
      issues.push(`${clean.original}: gleiche Gitterform wie „${first.original}“ (${clean.grid}).`);
      return;
    }
    seenGrid.set(clean.grid, clean);
    normalized.push({ ...clean, source });
  };

  addWord(seeds.across, 'seedAcross');
  addWord(seeds.down, 'seedDown');
  rawLines.forEach((line) => addWord(line, 'list'));

  normalized.sort((a, b) => b.grid.length - a.grid.length || a.grid.localeCompare(b.grid));
  return {
    words: normalized.slice(0, maxWords),
    issues,
    skippedByLimit: Math.max(0, normalized.length - maxWords),
  };
}

function makeEmptyGrid(width, height) {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => null));
}

function inside(width, height, row, col) {
  return row >= 0 && row < height && col >= 0 && col < width;
}

function getCell(grid, row, col) {
  if (!inside(grid[0].length, grid.length, row, col)) return null;
  return grid[row][col];
}

function setCell(grid, row, col, letter) {
  grid[row][col] = letter;
}

function axisDelta(direction) {
  return direction === 'across'
    ? { dr: 0, dc: 1, pr: 1, pc: 0 }
    : { dr: 1, dc: 0, pr: 0, pc: 1 };
}

function canPlace(grid, word, row, col, direction, requireCross = true) {
  const height = grid.length;
  const width = grid[0].length;
  const { dr, dc, pr, pc } = axisDelta(direction);
  let crosses = 0;

  const beforeRow = row - dr;
  const beforeCol = col - dc;
  const afterRow = row + dr * word.length;
  const afterCol = col + dc * word.length;

  if (inside(width, height, beforeRow, beforeCol) && getCell(grid, beforeRow, beforeCol)) return { ok: false };
  if (inside(width, height, afterRow, afterCol) && getCell(grid, afterRow, afterCol)) return { ok: false };

  for (let i = 0; i < word.length; i += 1) {
    const r = row + dr * i;
    const c = col + dc * i;
    if (!inside(width, height, r, c)) return { ok: false };

    const existing = getCell(grid, r, c);
    if (existing && existing !== word[i]) return { ok: false };

    if (existing === word[i]) {
      crosses += 1;
      continue;
    }

    const sideA = getCell(grid, r - pr, c - pc);
    const sideB = getCell(grid, r + pr, c + pc);
    if (sideA || sideB) return { ok: false };
  }

  if (requireCross && crosses === 0) return { ok: false };
  return { ok: true, crosses };
}

function placeWord(grid, wordObj, row, col, direction) {
  const { dr, dc } = axisDelta(direction);
  for (let i = 0; i < wordObj.grid.length; i += 1) {
    setCell(grid, row + dr * i, col + dc * i, wordObj.grid[i]);
  }
  return {
    ...wordObj,
    row,
    col,
    direction,
    placed: true,
  };
}

function getUsedCells(grid) {
  const cells = [];
  for (let r = 0; r < grid.length; r += 1) {
    for (let c = 0; c < grid[0].length; c += 1) {
      if (grid[r][c]) cells.push({ row: r, col: c, letter: grid[r][c] });
    }
  }
  return cells;
}

function getBounds(grid) {
  const used = getUsedCells(grid);
  if (!used.length) {
    return { minRow: 0, minCol: 0, maxRow: grid.length - 1, maxCol: grid[0].length - 1, width: grid[0].length, height: grid.length };
  }
  const rows = used.map((cell) => cell.row);
  const cols = used.map((cell) => cell.col);
  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const minCol = Math.min(...cols);
  const maxCol = Math.max(...cols);
  return { minRow, minCol, maxRow, maxCol, width: maxCol - minCol + 1, height: maxRow - minRow + 1 };
}

function scoreCandidate(grid, word, row, col, direction, crosses) {
  const height = grid.length;
  const width = grid[0].length;
  const centerRow = (height - 1) / 2;
  const centerCol = (width - 1) / 2;
  const { dr, dc } = axisDelta(direction);
  const positions = Array.from({ length: word.length }, (_, i) => ({ row: row + dr * i, col: col + dc * i }));
  const avgRow = positions.reduce((sum, pos) => sum + pos.row, 0) / positions.length;
  const avgCol = positions.reduce((sum, pos) => sum + pos.col, 0) / positions.length;
  const centrality = Math.abs(avgRow - centerRow) + Math.abs(avgCol - centerCol);

  const bounds = getBounds(grid);
  const minRow = Math.min(bounds.minRow, ...positions.map((pos) => pos.row));
  const maxRow = Math.max(bounds.maxRow, ...positions.map((pos) => pos.row));
  const minCol = Math.min(bounds.minCol, ...positions.map((pos) => pos.col));
  const maxCol = Math.max(bounds.maxCol, ...positions.map((pos) => pos.col));
  const area = (maxRow - minRow + 1) * (maxCol - minCol + 1);

  return crosses * 1000 + word.length * 25 - area * 2 - centrality * 8;
}

function findCandidates(grid, wordObj) {
  const used = getUsedCells(grid);
  const candidates = [];
  if (!used.length) return candidates;

  for (const cell of used) {
    const letterIndexes = [];
    for (let i = 0; i < wordObj.grid.length; i += 1) {
      if (wordObj.grid[i] === cell.letter) letterIndexes.push(i);
    }

    for (const index of letterIndexes) {
      for (const direction of ['across', 'down']) {
        const { dr, dc } = axisDelta(direction);
        const row = cell.row - dr * index;
        const col = cell.col - dc * index;
        const result = canPlace(grid, wordObj.grid, row, col, direction, true);
        if (!result.ok) continue;
        const score = scoreCandidate(grid, wordObj.grid, row, col, direction, result.crosses);
        candidates.push({ row, col, direction, score, crosses: result.crosses });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score || b.crosses - a.crosses);
  return candidates;
}

function tryPlaceSeeds(grid, words, width, height, seedAcrossRaw, seedDownRaw) {
  const placed = [];
  const seedAcross = normalizeWord(seedAcrossRaw);
  const seedDown = normalizeWord(seedDownRaw);
  const byGrid = new Map(words.map((word) => [word.grid, word]));
  const acrossObj = seedAcross.grid ? byGrid.get(seedAcross.grid) : null;
  const downObj = seedDown.grid ? byGrid.get(seedDown.grid) : null;
  const centerRow = Math.floor(height / 2);
  const centerCol = Math.floor(width / 2);

  if (acrossObj && downObj) {
    const possibilities = [];
    for (let ai = 0; ai < acrossObj.grid.length; ai += 1) {
      for (let di = 0; di < downObj.grid.length; di += 1) {
        if (acrossObj.grid[ai] !== downObj.grid[di]) continue;
        const aRow = centerRow;
        const aCol = centerCol - ai;
        const dRow = centerRow - di;
        const dCol = centerCol;
        if (!inside(width, height, aRow, aCol) || !inside(width, height, aRow, aCol + acrossObj.grid.length - 1)) continue;
        if (!inside(width, height, dRow, dCol) || !inside(width, height, dRow + downObj.grid.length - 1, dCol)) continue;
        possibilities.push({ aRow, aCol, dRow, dCol, ai, di });
      }
    }
    possibilities.sort((a, b) => Math.abs(a.ai - acrossObj.grid.length / 2) + Math.abs(a.di - downObj.grid.length / 2)
      - (Math.abs(b.ai - acrossObj.grid.length / 2) + Math.abs(b.di - downObj.grid.length / 2)));

    if (possibilities.length) {
      const p = possibilities[0];
      placed.push(placeWord(grid, acrossObj, p.aRow, p.aCol, 'across'));
      placed.push(placeWord(grid, downObj, p.dRow, p.dCol, 'down'));
      return placed;
    }
  }

  if (acrossObj && acrossObj.grid.length <= width) {
    const row = centerRow;
    const col = Math.max(0, Math.floor((width - acrossObj.grid.length) / 2));
    if (canPlace(grid, acrossObj.grid, row, col, 'across', false).ok) {
      placed.push(placeWord(grid, acrossObj, row, col, 'across'));
      return placed;
    }
  }

  if (downObj && downObj.grid.length <= height) {
    const row = Math.max(0, Math.floor((height - downObj.grid.length) / 2));
    const col = centerCol;
    if (canPlace(grid, downObj.grid, row, col, 'down', false).ok) {
      placed.push(placeWord(grid, downObj, row, col, 'down'));
      return placed;
    }
  }

  return placed;
}

function generatePuzzle(options) {
  const grid = makeEmptyGrid(options.width, options.height);
  const { words, issues, skippedByLimit } = parseWords(options.wordText, options.minLength, options.maxWords, {
    across: options.seedAcross,
    down: options.seedDown,
  });
  const unplaced = [];
  let placed = tryPlaceSeeds(grid, words, options.width, options.height, options.seedAcross, options.seedDown);
  const placedGrids = new Set(placed.map((word) => word.grid));

  if (!placed.length && words.length) {
    const first = words.find((word) => word.grid.length <= options.width) || words.find((word) => word.grid.length <= options.height);
    if (first) {
      const direction = first.grid.length <= options.width ? 'across' : 'down';
      const row = direction === 'across' ? Math.floor(options.height / 2) : Math.max(0, Math.floor((options.height - first.grid.length) / 2));
      const col = direction === 'across' ? Math.max(0, Math.floor((options.width - first.grid.length) / 2)) : Math.floor(options.width / 2);
      placed.push(placeWord(grid, first, row, col, direction));
      placedGrids.add(first.grid);
    }
  }

  for (const word of words) {
    if (placedGrids.has(word.grid)) continue;
    if (word.grid.length > Math.max(options.width, options.height)) {
      unplaced.push({ ...word, reason: 'länger als Breite und Höhe des Formats' });
      continue;
    }
    const candidates = findCandidates(grid, word);
    if (!candidates.length) {
      unplaced.push({ ...word, reason: 'keine passende Kreuzung gefunden' });
      continue;
    }
    const best = candidates[0];
    placed.push(placeWord(grid, word, best.row, best.col, best.direction));
    placedGrids.add(word.grid);
  }

  const numbered = numberGrid(grid);
  return {
    version: VERSION,
    createdAt: new Date().toISOString(),
    settings: options,
    grid,
    placed,
    unplaced,
    parseIssues: issues,
    skippedByLimit,
    numbers: numbered.numbers,
    entries: numbered.entries,
    bounds: getBounds(grid),
  };
}

function numberGrid(grid) {
  const height = grid.length;
  const width = grid[0].length;
  const numbers = new Map();
  const entries = [];
  let nextNumber = 1;

  const hasLetter = (row, col) => inside(width, height, row, col) && Boolean(grid[row][col]);

  for (let r = 0; r < height; r += 1) {
    for (let c = 0; c < width; c += 1) {
      if (!hasLetter(r, c)) continue;
      const startsAcross = !hasLetter(r, c - 1) && hasLetter(r, c + 1);
      const startsDown = !hasLetter(r - 1, c) && hasLetter(r + 1, c);
      if (!startsAcross && !startsDown) continue;
      const key = `${r},${c}`;
      numbers.set(key, nextNumber);
      if (startsAcross) entries.push(readEntry(grid, r, c, 'across', nextNumber));
      if (startsDown) entries.push(readEntry(grid, r, c, 'down', nextNumber));
      nextNumber += 1;
    }
  }

  return { numbers, entries };
}

function readEntry(grid, row, col, direction, number) {
  const { dr, dc } = axisDelta(direction);
  let value = '';
  let r = row;
  let c = col;
  while (inside(grid[0].length, grid.length, r, c) && grid[r][c]) {
    value += grid[r][c];
    r += dr;
    c += dc;
  }
  return { number, direction, row, col, value, length: value.length };
}

function getRenderBounds(puzzle, cropToContent) {
  if (cropToContent) return puzzle.bounds;
  return { minRow: 0, minCol: 0, maxRow: puzzle.grid.length - 1, maxCol: puzzle.grid[0].length - 1, width: puzzle.grid[0].length, height: puzzle.grid.length };
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function buildSvg(puzzle, view, settings) {
  const cell = settings.cellSize;
  const padding = Math.max(8, Math.round(cell * 0.16));
  const bounds = getRenderBounds(puzzle, settings.cropToContent);
  const svgWidth = bounds.width * cell + padding * 2;
  const svgHeight = bounds.height * cell + padding * 2;
  const numberSize = Math.max(7, Math.round(cell * 0.24));
  const letterSize = Math.max(14, Math.round(cell * 0.50));
  const lines = [];
  const showSolution = view === 'solution';

  lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" role="img" aria-label="Kreuzworträtsel">`);
  lines.push(`<rect width="100%" height="100%" fill="white"/>`);

  for (let r = bounds.minRow; r <= bounds.maxRow; r += 1) {
    for (let c = bounds.minCol; c <= bounds.maxCol; c += 1) {
      const x = padding + (c - bounds.minCol) * cell;
      const y = padding + (r - bounds.minRow) * cell;
      const letter = puzzle.grid[r][c];
      if (!letter) {
        lines.push(`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="#111111"/>`);
        continue;
      }
      lines.push(`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="white" stroke="#111111" stroke-width="1.6"/>`);
      const number = puzzle.numbers.get(`${r},${c}`);
      if (number) {
        lines.push(`<text x="${x + Math.round(cell * 0.08)}" y="${y + Math.round(cell * 0.26)}" font-family="Arial, Helvetica, sans-serif" font-size="${numberSize}" font-weight="700" fill="#111111">${number}</text>`);
      }
      if (showSolution) {
        lines.push(`<text x="${x + cell / 2}" y="${y + cell * 0.66}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${letterSize}" font-weight="700" fill="#111111">${escapeXml(letter)}</text>`);
      }
    }
  }

  lines.push('</svg>');
  return lines.join('\n');
}

function renderPuzzle() {
  if (!currentPuzzle) return;
  const settings = getSettings();
  const svg = buildSvg(currentPuzzle, currentView, settings);
  els.gridWrap.innerHTML = svg;
  const svgEl = els.gridWrap.querySelector('svg');
  if (svgEl) svgEl.classList.add('crossword-svg');
  els.emptyViewButton.classList.toggle('active', currentView === 'empty');
  els.solutionViewButton.classList.toggle('active', currentView === 'solution');
  renderLists();
}

function renderLists() {
  if (!currentPuzzle) return;
  const across = currentPuzzle.entries.filter((entry) => entry.direction === 'across');
  const down = currentPuzzle.entries.filter((entry) => entry.direction === 'down');
  els.acrossList.innerHTML = across.map((entry) => `<li value="${entry.number}"><strong>${escapeHtml(entry.value)}</strong> <span class="word-meta">(${entry.length})</span></li>`).join('');
  els.downList.innerHTML = down.map((entry) => `<li value="${entry.number}"><strong>${escapeHtml(entry.value)}</strong> <span class="word-meta">(${entry.length})</span></li>`).join('');

  const items = [];
  currentPuzzle.parseIssues.forEach((issue) => items.push(`<li>${escapeHtml(issue)}</li>`));
  currentPuzzle.unplaced.forEach((word) => items.push(`<li><strong>${escapeHtml(word.grid)}</strong>: ${escapeHtml(word.reason)}</li>`));
  if (currentPuzzle.skippedByLimit) items.push(`<li>${currentPuzzle.skippedByLimit} Wörter wegen Maximalgrenze nicht verarbeitet.</li>`);
  if (!items.length) items.push('<li>Keine Hinweise. Das Rätsel ist für v0.1 sauber erzeugt.</li>');
  els.unplacedList.innerHTML = items.join('');
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function setMessages(messages) {
  els.messages.innerHTML = messages.map((message) => `<div class="message ${message.type || ''}">${escapeHtml(message.text)}</div>`).join('');
}

function getSettings() {
  return {
    width: clampNumber(els.gridWidth.value, 5, 40, 22),
    height: clampNumber(els.gridHeight.value, 5, 40, 15),
    minLength: clampNumber(els.minLength.value, 2, 30, 4),
    maxWords: clampNumber(els.maxWords.value, 1, 200, 40),
    seedAcross: els.seedAcross.value,
    seedDown: els.seedDown.value,
    cropToContent: els.cropToContent.checked,
    cellSize: clampNumber(els.cellSize.value, 20, 120, 42),
    baseName: sanitizeFileBase(els.baseName.value || 'raetsel_001'),
    wordText: els.wordInput.value,
  };
}

function clampNumber(value, min, max, fallback) {
  const number = Number.parseInt(value, 10);
  if (Number.isNaN(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function sanitizeFileBase(value) {
  return String(value).trim().replace(/[^a-zA-Z0-9_\-]+/g, '_') || 'raetsel_001';
}

function updateButtons(enabled) {
  [els.exportEmptySvg, els.exportSolutionSvg, els.exportSolutionsTxt, els.exportProjectJson].forEach((button) => {
    button.disabled = !enabled;
  });
}

function createPuzzle() {
  const settings = getSettings();
  if (!settings.wordText.trim() && !settings.seedAcross.trim() && !settings.seedDown.trim()) {
    setMessages([{ type: 'error', text: 'Bitte gib mindestens ein paar Wörter oder ein Leitwort ein.' }]);
    return;
  }

  currentPuzzle = generatePuzzle(settings);
  currentView = 'empty';
  const used = getUsedCells(currentPuzzle.grid).length;
  const placedCount = currentPuzzle.placed.length;
  const unplacedCount = currentPuzzle.unplaced.length;
  els.stats.textContent = `${placedCount} Wörter platziert, ${unplacedCount} nicht platziert, ${used} belegte Felder. Ausgabeformat: ${settings.width} × ${settings.height}.`;
  setMessages([
    { type: placedCount ? 'ok' : 'error', text: placedCount ? `Rätsel erzeugt: ${placedCount} Wörter wurden platziert.` : 'Es konnte kein Startwort platziert werden.' },
    ...(unplacedCount ? [{ text: `${unplacedCount} Wörter konnten in v0.1 nicht sinnvoll gekreuzt werden. Sie stehen unten in der Prüfliste.` }] : []),
  ]);
  updateButtons(Boolean(placedCount));
  saveState();
  renderPuzzle();
}

function buildSolutionsText(puzzle) {
  const across = puzzle.entries.filter((entry) => entry.direction === 'across');
  const down = puzzle.entries.filter((entry) => entry.direction === 'down');
  const lines = [];
  lines.push('Kreuzwortdrucker v' + VERSION);
  lines.push('Erzeugt: ' + new Date(puzzle.createdAt).toLocaleString('de-DE'));
  lines.push('');
  lines.push('Waagrecht');
  across.forEach((entry) => lines.push(`${entry.number}. ${entry.value}`));
  lines.push('');
  lines.push('Senkrecht');
  down.forEach((entry) => lines.push(`${entry.number}. ${entry.value}`));
  lines.push('');
  lines.push('Nicht platziert');
  if (puzzle.unplaced.length) {
    puzzle.unplaced.forEach((word) => lines.push(`- ${word.grid}: ${word.reason}`));
  } else {
    lines.push('- keine');
  }
  return lines.join('\n');
}

function downloadText(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function saveState() {
  const data = {
    fields: {
      gridWidth: els.gridWidth.value,
      gridHeight: els.gridHeight.value,
      minLength: els.minLength.value,
      maxWords: els.maxWords.value,
      seedAcross: els.seedAcross.value,
      seedDown: els.seedDown.value,
      cropToContent: els.cropToContent.checked,
      cellSize: els.cellSize.value,
      baseName: els.baseName.value,
      wordInput: els.wordInput.value,
    },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data.fields) return;
    Object.entries(data.fields).forEach(([key, value]) => {
      if (!els[key]) return;
      if (els[key].type === 'checkbox') els[key].checked = Boolean(value);
      else els[key].value = value;
    });
  } catch (error) {
    console.warn('Status konnte nicht geladen werden:', error);
  }
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  els.gridWidth.value = '22';
  els.gridHeight.value = '15';
  els.minLength.value = '4';
  els.maxWords.value = '40';
  els.seedAcross.value = '';
  els.seedDown.value = '';
  els.cropToContent.checked = true;
  els.cellSize.value = '42';
  els.baseName.value = 'raetsel_001';
  els.wordInput.value = examples.join('\n');
  currentPuzzle = null;
  currentView = 'empty';
  updateButtons(false);
  els.stats.textContent = 'Noch kein Rätsel erzeugt.';
  els.gridWrap.innerHTML = '<div class="empty-state">Klick auf „Rätsel erstellen“ und die Buchstaben nehmen Aufstellung.</div>';
  els.acrossList.innerHTML = '';
  els.downList.innerHTML = '';
  els.unplacedList.innerHTML = '';
  setMessages([{ text: 'Zurückgesetzt. Beispielwörter sind wieder geladen.' }]);
}

els.generateButton.addEventListener('click', createPuzzle);
els.exampleButton.addEventListener('click', () => {
  els.wordInput.value = examples.join('\n');
  els.seedAcross.value = 'Katalysator';
  els.seedDown.value = 'Kognition';
  saveState();
  setMessages([{ text: 'Beispielwörter und zwei Leitwörter wurden geladen.' }]);
});
els.resetButton.addEventListener('click', resetState);

els.emptyViewButton.addEventListener('click', () => {
  currentView = 'empty';
  renderPuzzle();
});
els.solutionViewButton.addEventListener('click', () => {
  currentView = 'solution';
  renderPuzzle();
});

[els.cropToContent, els.cellSize].forEach((input) => input.addEventListener('change', () => {
  saveState();
  renderPuzzle();
}));

els.exportEmptySvg.addEventListener('click', () => {
  if (!currentPuzzle) return;
  const settings = getSettings();
  const svg = buildSvg(currentPuzzle, 'empty', settings);
  downloadText(`${settings.baseName}_gitter_leer.svg`, svg, 'image/svg+xml;charset=utf-8');
});

els.exportSolutionSvg.addEventListener('click', () => {
  if (!currentPuzzle) return;
  const settings = getSettings();
  const svg = buildSvg(currentPuzzle, 'solution', settings);
  downloadText(`${settings.baseName}_gitter_geloest.svg`, svg, 'image/svg+xml;charset=utf-8');
});

els.exportSolutionsTxt.addEventListener('click', () => {
  if (!currentPuzzle) return;
  const settings = getSettings();
  downloadText(`${settings.baseName}_loesungsliste.txt`, buildSolutionsText(currentPuzzle), 'text/plain;charset=utf-8');
});

els.exportProjectJson.addEventListener('click', () => {
  if (!currentPuzzle) return;
  const settings = getSettings();
  const serializable = {
    ...currentPuzzle,
    numbers: Array.from(currentPuzzle.numbers.entries()),
  };
  downloadText(`${settings.baseName}_projekt.json`, JSON.stringify(serializable, null, 2), 'application/json;charset=utf-8');
});

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  els.installButton.classList.remove('hidden');
});

els.installButton.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  els.installButton.classList.add('hidden');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.warn('Service Worker konnte nicht registriert werden:', error);
    });
  });
}

loadState();
setMessages([{ text: 'Bereit für v0.1. Tipp: Mit den Beispielwörtern lässt sich der erste Generatorlauf testen.' }]);
