'use strict';

const VERSION = '0.5.3';
const STORAGE_KEY = 'kreuzwortdrucker.v0.5.3.lastState';
const LEGACY_STORAGE_KEYS = ['kreuzwortdrucker.v0.5.2.lastState', 'kreuzwortdrucker.v0.5.1.lastState', 'kreuzwortdrucker.v0.5.0.lastState', 'kreuzwortdrucker.v0.4.1.lastState', 'kreuzwortdrucker.v0.4.0.lastState', 'kreuzwortdrucker.v0.3.4.lastState', 'kreuzwortdrucker.v0.3.2.lastState', 'kreuzwortdrucker.v0.3.lastState', 'kreuzwortdrucker.v0.2.lastState', 'kreuzwortdrucker.v0.1.lastState'];
const DB_NAME = 'kreuzwortdrucker-db-v0-3-3';
const DB_STORE = 'kv';

const els = {
  gridWidth: document.querySelector('#gridWidth'),
  gridHeight: document.querySelector('#gridHeight'),
  minLength: document.querySelector('#minLength'),
  maxWords: document.querySelector('#maxWords'),
  wordFormMode: document.querySelector('#wordFormMode'),
  nounWeight: document.querySelector('#nounWeight'),
  adjectiveWeight: document.querySelector('#adjectiveWeight'),
  verbWeight: document.querySelector('#verbWeight'),
  otherWeight: document.querySelector('#otherWeight'),
  seedAcross: document.querySelector('#seedAcross'),
  seedDown: document.querySelector('#seedDown'),
  saveSeedsToPersonal: document.querySelector('#saveSeedsToPersonal'),
  personalWordOptions: document.querySelector('#personalWordOptions'),
  cropToContent: document.querySelector('#cropToContent'),
  gridDisplayMode: document.querySelector('#gridDisplayMode'),
  cellSize: document.querySelector('#cellSize'),
  baseName: document.querySelector('#baseName'),
  wordInput: document.querySelector('#wordInput'),
  blockedWordsInput: document.querySelector('#blockedWordsInput'),
  dictionaryFile: document.querySelector('#dictionaryFile'),
  fillFromDictionary: document.querySelector('#fillFromDictionary'),
  clearDictionary: document.querySelector('#clearDictionary'),
  dictionaryStatus: document.querySelector('#dictionaryStatus'),
  dictionarySearch: document.querySelector('#dictionarySearch'),
  dictionaryResults: document.querySelector('#dictionaryResults'),
  safeVocabularyStatus: document.querySelector('#safeVocabularyStatus'),
  safeWordInput: document.querySelector('#safeWordInput'),
  safeAddWord: document.querySelector('#safeAddWord'),
  safeSearch: document.querySelector('#safeSearch'),
  safeVocabularyResults: document.querySelector('#safeVocabularyResults'),
  personalStatus: document.querySelector('#personalStatus'),
  personalListSelect: document.querySelector('#personalListSelect'),
  personalListName: document.querySelector('#personalListName'),
  personalCreateList: document.querySelector('#personalCreateList'),
  personalUseList: document.querySelector('#personalUseList'),
  personalCreatePuzzleFromList: document.querySelector('#personalCreatePuzzleFromList'),
  personalWordInput: document.querySelector('#personalWordInput'),
  personalAddWord: document.querySelector('#personalAddWord'),
  personalWordListPicker: document.querySelector('#personalWordListPicker'),
  personalFile: document.querySelector('#personalFile'),
  personalSearch: document.querySelector('#personalSearch'),
  personalResults: document.querySelector('#personalResults'),
  personalExportJson: document.querySelector('#personalExportJson'),
  personalImportJson: document.querySelector('#personalImportJson'),
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
  exportCluesTxt: document.querySelector('#exportCluesTxt'),
  exportCluesCsv: document.querySelector('#exportCluesCsv'),
  exportProjectJson: document.querySelector('#exportProjectJson'),
  acrossList: document.querySelector('#acrossList'),
  downList: document.querySelector('#downList'),
  unplacedList: document.querySelector('#unplacedList'),
  clueEditor: document.querySelector('#clueEditor'),
  acrossClues: document.querySelector('#acrossClues'),
  downClues: document.querySelector('#downClues'),
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
let clueBank = {};
let importedDictionaryState = { entries: [], stats: null, sourceName: '', importedAt: null, ambiguousSample: [] };
let dictionaryState = { entries: [], stats: null, sourceName: '', importedAt: null, ambiguousSample: [], builtInCount: 0, importedCount: 0, importSourceName: '' };
let dictionaryIndex = new Map();
const PERSONAL_STORAGE_KEY = 'kreuzwortdrucker.personalDictionary';
const LEGACY_PERSONAL_STORAGE_KEYS = ['kreuzwortdrucker.v0.4.1.personalDictionary', 'kreuzwortdrucker.v0.4.0.personalDictionary'];
const DEFAULT_PERSONAL_LIST = 'Allgemein';
let personalDictionary = createEmptyPersonalDictionary();
const SAFE_STORAGE_KEY = 'kreuzwortdrucker.safeVocabulary';
let safeVocabulary = createEmptySafeVocabulary();

function normalizeWord(raw) {
  const original = String(raw || '').trim();
  const upper = original.normalize('NFD').toUpperCase();
  const grid = upper
    .replace(/A\u0308/g, 'AE')
    .replace(/O\u0308/g, 'OE')
    .replace(/U\u0308/g, 'UE')
    .replaceAll('Ä', 'AE')
    .replaceAll('Ö', 'OE')
    .replaceAll('Ü', 'UE')
    .replaceAll('ẞ', 'SS')
    .replaceAll('ß', 'SS')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s\-–—_]+/g, '')
    .replace(/[^A-Z]/g, '');
  return { original, grid };
}

function hasGermanUmlaut(raw) {
  const decomposed = String(raw || '').normalize('NFD');
  return /[AOUaou]\u0308/.test(decomposed) || /[ÄÖÜäöü]/.test(String(raw || ''));
}

function getBareUmlautKey(raw) {
  const original = String(raw || '').trim();
  return original
    .normalize('NFD')
    .toUpperCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll('ẞ', 'SS')
    .replaceAll('ß', 'SS')
    .replace(/[\s\-–—_]+/g, '')
    .replace(/[^A-Z]/g, '');
}

const UMLAUTLESS_MINIMAL_PAIR_ALLOWLIST = new Set([
  'SCHON', 'WARE', 'WAREN', 'MULL', 'LOSEN', 'LOSE', 'LOST',
  'FORDERN', 'FORDERE', 'FORDERST', 'FORDERT', 'FORDERTE', 'FORDERTEN', 'FORDERTEST', 'FORDERTET',
  'MOCHTE', 'MOCHTEN', 'MOCHTEST', 'MOCHTET',
  'WURDE', 'WURDEN', 'WURDEST', 'WURDET'
]);

function isUmlautlessDictionaryVariant(item, plainKeysWithUmlaut) {
  if (!item || item.hasUmlaut) return false;
  if (!item.plainKey || !plainKeysWithUmlaut.has(item.plainKey)) return false;
  if (UMLAUTLESS_MINIMAL_PAIR_ALLOWLIST.has(item.clean.grid)) return false;
  return item.clean.grid === item.plainKey;
}



function createEmptyPersonalDictionary() {
  return {
    version: VERSION,
    selectedList: DEFAULT_PERSONAL_LIST,
    lists: { [DEFAULT_PERSONAL_LIST]: { name: DEFAULT_PERSONAL_LIST, wordGrids: [] } },
    words: {},
    updatedAt: new Date().toISOString(),
  };
}

function sanitizeListName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ').slice(0, 60) || DEFAULT_PERSONAL_LIST;
}

function ensurePersonalList(name) {
  const listName = sanitizeListName(name);
  if (!personalDictionary.lists) personalDictionary.lists = {};
  if (!personalDictionary.lists[listName]) {
    personalDictionary.lists[listName] = { name: listName, wordGrids: [] };
  }
  if (!personalDictionary.selectedList) personalDictionary.selectedList = listName;
  return personalDictionary.lists[listName];
}

function normalizePersonalDictionary(data) {
  const next = createEmptyPersonalDictionary();
  if (!data || typeof data !== 'object') return next;
  next.words = {};
  next.lists = {};
  const sourceLists = data.lists && typeof data.lists === 'object' ? data.lists : {};
  Object.values(sourceLists).forEach((list) => {
    const listName = sanitizeListName(list && (list.name || list.id));
    if (!next.lists[listName]) next.lists[listName] = { name: listName, wordGrids: [] };
  });
  if (!Object.keys(next.lists).length) next.lists[DEFAULT_PERSONAL_LIST] = { name: DEFAULT_PERSONAL_LIST, wordGrids: [] };

  const addToList = (grid, listName) => {
    const cleanListName = sanitizeListName(listName);
    if (!next.lists[cleanListName]) next.lists[cleanListName] = { name: cleanListName, wordGrids: [] };
    if (!next.lists[cleanListName].wordGrids.includes(grid)) next.lists[cleanListName].wordGrids.push(grid);
  };

  const sourceWords = data.words && typeof data.words === 'object' ? data.words : {};
  Object.values(sourceWords).forEach((word) => {
    const clean = normalizeWord(word.original || word.grid || '');
    if (!clean.grid) return;
    const lists = Array.isArray(word.lists) && word.lists.length ? word.lists.map(sanitizeListName) : [DEFAULT_PERSONAL_LIST];
    next.words[clean.grid] = {
      original: word.original || clean.original || clean.grid,
      grid: clean.grid,
      blocked: Boolean(word.blocked),
      lists: Array.from(new Set(lists)),
      createdAt: word.createdAt || new Date().toISOString(),
      updatedAt: word.updatedAt || new Date().toISOString(),
    };
    lists.forEach((listName) => addToList(clean.grid, listName));
  });

  Object.entries(sourceLists).forEach(([key, list]) => {
    const listName = sanitizeListName(list && (list.name || key));
    const grids = Array.isArray(list && list.wordGrids) ? list.wordGrids : [];
    grids.forEach((grid) => {
      const clean = normalizeWord(grid);
      if (!clean.grid) return;
      if (!next.words[clean.grid]) {
        next.words[clean.grid] = {
          original: clean.original || clean.grid,
          grid: clean.grid,
          blocked: false,
          lists: [listName],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      if (!next.words[clean.grid].lists.includes(listName)) next.words[clean.grid].lists.push(listName);
      addToList(clean.grid, listName);
    });
  });

  next.selectedList = next.lists[sanitizeListName(data.selectedList)] ? sanitizeListName(data.selectedList) : Object.keys(next.lists)[0];
  next.updatedAt = data.updatedAt || new Date().toISOString();
  return next;
}

function savePersonalDictionary() {
  personalDictionary.updatedAt = new Date().toISOString();
  localStorage.setItem(PERSONAL_STORAGE_KEY, JSON.stringify(personalDictionary));
}

function loadPersonalDictionary() {
  try {
    let raw = localStorage.getItem(PERSONAL_STORAGE_KEY);
    if (!raw) {
      for (const legacyKey of LEGACY_PERSONAL_STORAGE_KEYS) {
        raw = localStorage.getItem(legacyKey);
        if (raw) break;
      }
    }
    personalDictionary = normalizePersonalDictionary(raw ? JSON.parse(raw) : null);
    if (raw) savePersonalDictionary();
  } catch (error) {
    console.warn('Persönlicher Wortschatz konnte nicht geladen werden:', error);
    personalDictionary = createEmptyPersonalDictionary();
  }
}

function normalizeTargetListNames(listNames) {
  const raw = Array.isArray(listNames) ? listNames : [listNames || personalDictionary.selectedList || DEFAULT_PERSONAL_LIST];
  const clean = raw.map(sanitizeListName).filter(Boolean);
  return Array.from(new Set(clean.length ? clean : [DEFAULT_PERSONAL_LIST]));
}

function addPersonalWordToList(grid, listName) {
  const clean = normalizeWord(grid);
  const targetListName = sanitizeListName(listName);
  if (!clean.grid || !targetListName) return false;
  const word = personalDictionary.words[clean.grid];
  if (!word) return false;
  const list = ensurePersonalList(targetListName);
  if (!word.lists.includes(targetListName)) word.lists.push(targetListName);
  if (!list.wordGrids.includes(clean.grid)) list.wordGrids.push(clean.grid);
  word.updatedAt = new Date().toISOString();
  return true;
}

function upsertPersonalWord(rawWord, listNames = personalDictionary.selectedList || DEFAULT_PERSONAL_LIST) {
  const clean = normalizeWord(rawWord);
  if (!clean.original || !clean.grid) return { ok: false, reason: 'Keine gültigen Buchstaben gefunden.' };
  const targetListNames = normalizeTargetListNames(listNames);
  const now = new Date().toISOString();
  const existing = personalDictionary.words[clean.grid];
  if (existing) {
    existing.original = existing.original || clean.original;
    existing.updatedAt = now;
  } else {
    personalDictionary.words[clean.grid] = {
      original: clean.original,
      grid: clean.grid,
      blocked: false,
      lists: [],
      createdAt: now,
      updatedAt: now,
    };
  }
  targetListNames.forEach((targetListName) => addPersonalWordToList(clean.grid, targetListName));
  personalDictionary.selectedList = targetListNames[0] || personalDictionary.selectedList || DEFAULT_PERSONAL_LIST;
  return { ok: true, word: personalDictionary.words[clean.grid], listNames: targetListNames };
}

function removePersonalWordFromList(grid, listName = personalDictionary.selectedList) {
  const clean = normalizeWord(grid);
  const targetListName = sanitizeListName(listName);
  const list = personalDictionary.lists[targetListName];
  if (!clean.grid || !list) return;
  list.wordGrids = list.wordGrids.filter((value) => value !== clean.grid);
  const word = personalDictionary.words[clean.grid];
  if (word) {
    word.lists = word.lists.filter((name) => name !== targetListName);
    if (!word.lists.length) delete personalDictionary.words[clean.grid];
  }
}

function setPersonalWordBlocked(grid, blocked) {
  const clean = normalizeWord(grid);
  if (!clean.grid) return;
  if (!personalDictionary.words[clean.grid]) {
    upsertPersonalWord(clean.original || clean.grid, personalDictionary.selectedList || DEFAULT_PERSONAL_LIST);
  }
  if (personalDictionary.words[clean.grid]) {
    personalDictionary.words[clean.grid].blocked = Boolean(blocked);
    personalDictionary.words[clean.grid].updatedAt = new Date().toISOString();
  }
}

function getPersonalBlockedGridSet() {
  const set = new Set();
  Object.values(personalDictionary.words || {}).forEach((word) => {
    if (word.blocked && word.grid) set.add(word.grid);
  });
  return set;
}

function getPersonalWordsForList(listName = personalDictionary.selectedList) {
  const list = personalDictionary.lists[sanitizeListName(listName)];
  if (!list) return [];
  return list.wordGrids
    .map((grid) => personalDictionary.words[grid])
    .filter(Boolean)
    .sort((a, b) => a.original.localeCompare(b.original, 'de'));
}

function getPersonalStats() {
  const words = Object.values(personalDictionary.words || {});
  return {
    listCount: Object.keys(personalDictionary.lists || {}).length,
    wordCount: words.length,
    blockedCount: words.filter((word) => word.blocked).length,
  };
}

function parsePersonalWordList(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^\uFEFF/, '').trim())
    .filter(Boolean)
    .flatMap((line) => {
      const firstColumn = line.split(/[;\t,]/)[0].trim();
      return firstColumn ? [firstColumn] : [];
    });
}


function createEmptySafeVocabulary() {
  return {
    version: VERSION,
    words: {},
    updatedAt: new Date().toISOString(),
  };
}

function normalizeSafeVocabulary(data) {
  const next = createEmptySafeVocabulary();
  if (!data || typeof data !== 'object') return next;
  const sourceWords = data.words && typeof data.words === 'object' ? data.words : {};
  Object.values(sourceWords).forEach((word) => {
    const clean = normalizeWord(word.original || word.grid || '');
    if (!clean.grid) return;
    next.words[clean.grid] = {
      original: word.original || clean.original || clean.grid,
      grid: clean.grid,
      source: word.source || 'gesichert',
      useCount: Number(word.useCount || 0),
      createdAt: word.createdAt || new Date().toISOString(),
      updatedAt: word.updatedAt || new Date().toISOString(),
    };
  });
  next.updatedAt = data.updatedAt || new Date().toISOString();
  return next;
}

function saveSafeVocabulary() {
  safeVocabulary.updatedAt = new Date().toISOString();
  localStorage.setItem(SAFE_STORAGE_KEY, JSON.stringify(safeVocabulary));
}

function loadSafeVocabulary() {
  try {
    safeVocabulary = normalizeSafeVocabulary(JSON.parse(localStorage.getItem(SAFE_STORAGE_KEY) || 'null'));
  } catch (error) {
    console.warn('Gesicherter Wortschatz konnte nicht geladen werden:', error);
    safeVocabulary = createEmptySafeVocabulary();
  }
}

function upsertSafeWord(rawWord, source = 'manuell', increment = 0) {
  const clean = normalizeWord(rawWord);
  if (!clean.original || !clean.grid) return { ok: false, reason: 'Keine gültigen Buchstaben gefunden.' };
  const now = new Date().toISOString();
  const existing = safeVocabulary.words[clean.grid];
  if (existing) {
    existing.original = existing.original || clean.original;
    existing.source = existing.source === 'manuell' ? existing.source : source || existing.source;
    existing.useCount = Number(existing.useCount || 0) + Number(increment || 0);
    existing.updatedAt = now;
  } else {
    safeVocabulary.words[clean.grid] = {
      original: clean.original,
      grid: clean.grid,
      source,
      useCount: Number(increment || 0),
      createdAt: now,
      updatedAt: now,
    };
  }
  return { ok: true, word: safeVocabulary.words[clean.grid] };
}

function addPlacedWordsToSafeVocabulary(puzzle) {
  if (!puzzle || !Array.isArray(puzzle.placed)) return;
  puzzle.placed.forEach((word) => {
    if (!word || !word.grid) return;
    const source = word.source === 'dictionary' ? 'Datenbank verwendet' : word.source === 'safe' ? 'gesichert verwendet' : 'persönlich verwendet';
    upsertSafeWord(word.original || word.grid, source, 1);
  });
  saveSafeVocabulary();
  renderSafeVocabularyUi();
}

function getSafeVocabularyEntries(settings = getSettings(), extraExcluded = new Set()) {
  const maxLength = Math.max(settings.width, settings.height);
  const blocked = getBlockedGridSet(settings.blockedWordsText || '');
  return Object.values(safeVocabulary.words || {})
    .map((word) => ({ original: word.original, grid: word.grid, length: word.grid.length, source: 'safe', useCount: word.useCount || 0 }))
    .filter((entry) => entry.length >= settings.minLength
      && entry.length <= maxLength
      && !blocked.has(entry.grid)
      && !extraExcluded.has(entry.grid));
}

function renderSafeVocabularyUi() {
  if (!els.safeVocabularyStatus) return;
  const words = Object.values(safeVocabulary.words || {}).sort((a, b) => (b.useCount || 0) - (a.useCount || 0) || a.original.localeCompare(b.original, 'de'));
  els.safeVocabularyStatus.innerHTML = `${formatNumber(words.length)} gesicherte Wörter · davon ${formatNumber(words.filter((word) => (word.useCount || 0) > 0).length)} bereits verwendet`;
  renderSafeVocabularyResults();
}

function renderSafeVocabularyResults() {
  if (!els.safeVocabularyResults) return;
  const queryRaw = els.safeSearch ? els.safeSearch.value.trim() : '';
  const query = normalizeWord(queryRaw).grid;
  let words = Object.values(safeVocabulary.words || {});
  if (query) {
    const rawUpper = queryRaw.toUpperCase();
    words = words.filter((word) => word.grid.includes(query) || word.original.toUpperCase().includes(rawUpper));
  }
  words.sort((a, b) => (b.useCount || 0) - (a.useCount || 0) || a.original.localeCompare(b.original, 'de'));
  const visible = words.slice(0, 80);
  if (!visible.length) {
    els.safeVocabularyResults.classList.add('empty-clue-list');
    els.safeVocabularyResults.textContent = query ? 'Keine gesicherten Wörter gefunden.' : 'Noch keine gesicherten Wörter vorhanden.';
    return;
  }
  els.safeVocabularyResults.classList.remove('empty-clue-list');
  els.safeVocabularyResults.innerHTML = `
    <div class="dictionary-result-summary">${formatNumber(words.length)} ${query ? 'Treffer' : 'gesicherte Wörter'}</div>
    <div class="personal-word-list">
      ${visible.map((word) => `
        <div class="personal-word" data-safe-word-grid="${escapeHtml(word.grid)}">
          <div>
            <strong>${escapeHtml(word.original)}</strong>
            <span class="word-meta">${escapeHtml(word.grid)} · ${word.grid.length} · ${escapeHtml(word.source || 'gesichert')} · ${formatNumber(word.useCount || 0)}× verwendet</span>
          </div>
        </div>`).join('')}
    </div>
    ${words.length > visible.length ? `<div class="word-meta">Weitere ${formatNumber(words.length - visible.length)} Wörter ausgeblendet.</div>` : ''}`;
}

function renderPersonalWordOptions() {
  if (!els.personalWordOptions) return;
  const words = getPersonalWordsForList(personalDictionary.selectedList).filter((word) => !word.blocked);
  els.personalWordOptions.innerHTML = words.map((word) => `<option value="${escapeHtml(word.original)}">${escapeHtml(word.grid)}</option>`).join('');
}

function saveSeedWordsToCurrentList() {
  const listName = personalDictionary.selectedList || DEFAULT_PERSONAL_LIST;
  const values = [els.seedAcross && els.seedAcross.value, els.seedDown && els.seedDown.value].filter((value) => String(value || '').trim());
  if (!values.length) {
    setMessages([{ type: 'error', text: 'Bitte zuerst mindestens ein Leitwort eintragen.' }]);
    return;
  }
  let added = 0;
  values.forEach((value) => {
    const result = upsertPersonalWord(value, listName);
    if (result.ok) added += 1;
  });
  savePersonalDictionary();
  renderPersonalDictionaryUi();
  setMessages([{ type: 'ok', text: `${formatNumber(added)} Leitwort/Leitwörter wurden in „${listName}“ gespeichert.` }]);
}


function getSelectedPersonalTargetLists() {
  if (!els.personalWordListPicker) return [personalDictionary.selectedList || DEFAULT_PERSONAL_LIST];
  const selected = Array.from(els.personalWordListPicker.selectedOptions || []).map((option) => option.value);
  return normalizeTargetListNames(selected.length ? selected : [personalDictionary.selectedList || DEFAULT_PERSONAL_LIST]);
}

function renderPersonalListPicker() {
  if (!els.personalWordListPicker) return;
  const lists = Object.values(personalDictionary.lists || {}).sort((a, b) => a.name.localeCompare(b.name, 'de'));
  const previous = Array.from(els.personalWordListPicker.selectedOptions || []).map((option) => option.value);
  const selected = new Set(previous.length ? previous : [personalDictionary.selectedList || DEFAULT_PERSONAL_LIST]);
  els.personalWordListPicker.innerHTML = lists.map((list) => `<option value="${escapeHtml(list.name)}"${selected.has(list.name) ? ' selected' : ''}>${escapeHtml(list.name)} (${formatNumber(list.wordGrids.length)})</option>`).join('');
}

function renderPersonalDictionaryUi() {
  if (!els.personalStatus) return;
  ensurePersonalList(personalDictionary.selectedList || DEFAULT_PERSONAL_LIST);
  const lists = Object.values(personalDictionary.lists).sort((a, b) => a.name.localeCompare(b.name, 'de'));
  els.personalListSelect.innerHTML = lists.map((list) => `<option value="${escapeHtml(list.name)}">${escapeHtml(list.name)} (${formatNumber(list.wordGrids.length)})</option>`).join('');
  els.personalListSelect.value = personalDictionary.selectedList;
  renderPersonalListPicker();

  const stats = getPersonalStats();
  const selectedWords = getPersonalWordsForList(personalDictionary.selectedList);
  const allowedInList = selectedWords.filter((word) => !word.blocked).length;
  els.personalStatus.innerHTML = `
    <strong>${escapeHtml(personalDictionary.selectedList)}</strong><br>
    ${formatNumber(stats.wordCount)} persönliche Wörter in ${formatNumber(stats.listCount)} Listen · ${formatNumber(stats.blockedCount)} gesperrt · ${formatNumber(allowedInList)} in der aktuellen Liste verwendbar`;
  renderPersonalResults();
  renderPersonalWordOptions();
}


function renderPersonalResults() {
  if (!els.personalResults) return;
  const queryRaw = els.personalSearch.value.trim();
  const query = normalizeWord(queryRaw).grid;
  let words = getPersonalWordsForList(personalDictionary.selectedList);
  if (query) {
    const rawUpper = queryRaw.toUpperCase();
    words = Object.values(personalDictionary.words || {})
      .filter((word) => word.grid.includes(query) || word.original.toUpperCase().includes(rawUpper) || word.lists.some((list) => list.toUpperCase().includes(rawUpper)))
      .sort((a, b) => a.original.localeCompare(b.original, 'de'));
  }
  const visible = words.slice(0, 160);
  if (!visible.length) {
    els.personalResults.classList.add('empty-clue-list');
    els.personalResults.textContent = query ? 'Keine persönlichen Wörter gefunden.' : 'Diese Liste ist noch leer.';
    return;
  }
  els.personalResults.classList.remove('empty-clue-list');
  const intro = query
    ? `${formatNumber(words.length)} Treffer im persönlichen Wortschatz`
    : `${formatNumber(words.length)} Wörter in dieser Liste`;
  els.personalResults.innerHTML = `
    <div class="dictionary-result-summary">${escapeHtml(intro)}</div>
    <div class="personal-word-list">
      ${visible.map((word) => {
        const missingLists = Object.values(personalDictionary.lists || {})
          .map((list) => list.name)
          .filter((name) => !word.lists.includes(name))
          .sort((a, b) => a.localeCompare(b, 'de'));
        return `
        <div class="personal-word ${word.blocked ? 'blocked' : ''}" data-personal-word-grid="${escapeHtml(word.grid)}">
          <div>
            <strong>${escapeHtml(word.original)}</strong>
            <span class="word-meta">${escapeHtml(word.grid)} · ${word.grid.length} · Listen: ${word.lists.map(escapeHtml).join(', ')}</span>
          </div>
          <div class="personal-word-actions">
            ${missingLists.length ? `<select class="mini-select" data-personal-list-target>
              <option value="">zu Liste hinzufügen …</option>
              ${missingLists.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('')}
            </select>
            <button class="mini ghost" type="button" data-personal-add-to-list="${escapeHtml(word.grid)}">hinzufügen</button>` : '<span class="word-meta">in allen Listen</span>'}
            <button class="mini ghost" type="button" data-personal-toggle-block="${escapeHtml(word.grid)}">${word.blocked ? 'freigeben' : 'sperren'}</button>
            <button class="mini ghost" type="button" data-personal-remove="${escapeHtml(word.grid)}">aus aktueller Liste entfernen</button>
          </div>
        </div>`;
      }).join('')}
    </div>
    ${words.length > visible.length ? `<div class="word-meta">Weitere ${formatNumber(words.length - visible.length)} Wörter ausgeblendet.</div>` : ''}`;
}

function useSelectedPersonalList() {
  const words = getPersonalWordsForList(personalDictionary.selectedList).filter((word) => !word.blocked);
  if (!words.length) {
    setMessages([{ type: 'error', text: 'Die ausgewählte persönliche Liste enthält keine verwendbaren Wörter.' }]);
    return false;
  }
  els.wordInput.value = words.map((word) => word.original).join('\n');
  saveState();
  setMessages([{ type: 'ok', text: `${formatNumber(words.length)} Wörter aus „${personalDictionary.selectedList}“ wurden als Themenwörter übernommen.` }]);
  return true;
}

function createPuzzleFromSelectedPersonalList() {
  if (!useSelectedPersonalList()) return;
  createPuzzle(false);
}

function exportPersonalDictionary() {
  const payload = JSON.stringify({
    exportVersion: VERSION,
    exportedAt: new Date().toISOString(),
    personalDictionary,
    safeVocabulary,
  }, null, 2);
  downloadText('kreuzwortdrucker_wortschatz_sicherung.json', payload, 'application/json;charset=utf-8');
}

async function importPersonalDictionaryJson(file) {
  if (!file) return;
  const text = await file.text();
  const parsed = JSON.parse(text);
  const imported = normalizePersonalDictionary(parsed.personalDictionary || parsed);
  const importedSafe = parsed.safeVocabulary ? normalizeSafeVocabulary(parsed.safeVocabulary) : safeVocabulary;
  const before = getPersonalStats();
  personalDictionary = imported;
  safeVocabulary = importedSafe;
  savePersonalDictionary();
  saveSafeVocabulary();
  renderPersonalDictionaryUi();
  renderSafeVocabularyUi();
  const after = getPersonalStats();
  setMessages([{ type: 'ok', text: `Wortschatz-Sicherung importiert: ${formatNumber(after.wordCount)} persönliche Wörter in ${formatNumber(after.listCount)} Listen und ${formatNumber(Object.keys(safeVocabulary.words || {}).length)} gesicherte Wörter.` }, ...(before.wordCount ? [{ text: 'Der bisherige persönliche Wortschatz wurde durch den Import ersetzt. Vorherige Exporte kannst Du bei Bedarf wieder einspielen.' }] : [])]);
}

async function importPersonalWordFile(file) {
  if (!file) return;
  const text = await file.text();
  const words = parsePersonalWordList(text);
  const targetLists = getSelectedPersonalTargetLists();
  let added = 0;
  let skipped = 0;
  words.forEach((word) => {
    const result = upsertPersonalWord(word, targetLists);
    if (result.ok) added += 1;
    else skipped += 1;
  });
  savePersonalDictionary();
  renderPersonalDictionaryUi();
  const listLabel = targetLists.join(', ');
  setMessages([{ type: 'ok', text: `${formatNumber(added)} Wörter wurden in ${targetLists.length === 1 ? '„' + listLabel + '“' : 'die Listen „' + listLabel + '“'} importiert.` }, ...(skipped ? [{ text: `${formatNumber(skipped)} Zeilen konnten nicht importiert werden.` }] : [])]);
}

function extractDictionaryWord(line, index) {
  let value = String(line || '').replace(/^\uFEFF/, '').trim();
  if (!value || value.startsWith('#')) return '';
  if (index === 0 && /^\d+$/.test(value)) return '';
  value = value.split(/\s+/)[0] || '';
  value = value.split('/')[0] || '';
  return value.trim();
}

function analyzeDictionaryText(text, sourceName, minImportLength = 3) {
  const lines = String(text || '').split(/\r?\n/);
  const groups = new Map();
  const stats = {
    rawLines: lines.length,
    usable: 0,
    invalid: 0,
    tooShort: 0,
    duplicateLines: 0,
    ambiguousGridForms: 0,
    umlautlessVariantsSkipped: 0,
    minImportLength,
  };

  const parsedItems = [];
  const plainKeysWithUmlaut = new Set();

  lines.forEach((line, index) => {
    const word = extractDictionaryWord(line, index);
    if (!word) return;
    const clean = normalizeWord(word);
    if (!clean.grid) {
      stats.invalid += 1;
      return;
    }
    if (clean.grid.length < minImportLength) {
      stats.tooShort += 1;
      return;
    }
    const item = {
      clean,
      plainKey: getBareUmlautKey(word),
      hasUmlaut: hasGermanUmlaut(word),
    };
    if (item.hasUmlaut && item.plainKey) plainKeysWithUmlaut.add(item.plainKey);
    parsedItems.push(item);
  });

  parsedItems.forEach((item) => {
    const clean = item.clean;
    if (isUmlautlessDictionaryVariant(item, plainKeysWithUmlaut)) {
      stats.umlautlessVariantsSkipped += 1;
      return;
    }
    if (!groups.has(clean.grid)) {
      groups.set(clean.grid, {
        grid: clean.grid,
        preferred: { original: clean.original, grid: clean.grid, length: clean.grid.length, source: 'dictionary' },
        originals: new Set([clean.original]),
      });
      return;
    }
    const group = groups.get(clean.grid);
    if (group.originals.has(clean.original)) {
      stats.duplicateLines += 1;
    } else {
      group.originals.add(clean.original);
      if (hasGermanUmlaut(clean.original) && !hasGermanUmlaut(group.preferred.original)) {
        group.preferred = { original: clean.original, grid: clean.grid, length: clean.grid.length, source: 'dictionary' };
      }
    }
  });

  const entries = [];
  const ambiguousSample = [];
  groups.forEach((group) => {
    entries.push(group.preferred);
    if (group.originals.size > 1) {
      stats.ambiguousGridForms += 1;
      if (ambiguousSample.length < 50) {
        ambiguousSample.push({ grid: group.grid, originals: Array.from(group.originals).slice(0, 8) });
      }
    }
  });

  entries.sort((a, b) => b.length - a.length || a.grid.localeCompare(b.grid, 'de'));
  stats.usable = entries.length;

  return {
    sourceName: sourceName || 'woerterbuch.txt',
    importedAt: new Date().toISOString(),
    minImportLength,
    entries,
    stats,
    ambiguousSample,
  };
}

function createBuiltInDictionaryState() {
  const builtInWords = Array.isArray(window.KW_BUILTIN_DE_WORDS) ? window.KW_BUILTIN_DE_WORDS : [];
  return analyzeDictionaryText(builtInWords.join('\n'), 'Eingebauter deutscher Vollfundus', 2);
}

function refreshCombinedDictionary() {
  const builtIn = createBuiltInDictionaryState();
  const importedEntries = Array.isArray(importedDictionaryState.entries) ? importedDictionaryState.entries : [];
  const combinedWords = [
    ...(Array.isArray(window.KW_BUILTIN_DE_WORDS) ? window.KW_BUILTIN_DE_WORDS : []),
    ...importedEntries.map((entry) => entry.original || entry.grid).filter(Boolean),
  ];
  const sourceName = importedEntries.length
    ? `Eingebauter Vollfundus + ${importedDictionaryState.sourceName || 'Zusatzliste'}`
    : 'Eingebauter deutscher Vollfundus';
  dictionaryState = analyzeDictionaryText(combinedWords.join('\n'), sourceName, 2);
  dictionaryState.builtInCount = builtIn.entries.length;
  dictionaryState.importedCount = importedEntries.length;
  dictionaryState.importSourceName = importedDictionaryState.sourceName || '';
  dictionaryState.importedAt = importedDictionaryState.importedAt || null;
  buildDictionaryIndex();
}

function hasImportedDictionary() {
  return Boolean(importedDictionaryState.entries && importedDictionaryState.entries.length);
}

function buildDictionaryIndex() {
  dictionaryIndex = new Map();
  dictionaryState.entries.forEach((entry) => dictionaryIndex.set(entry.grid, entry));
}

function hasDictionary() {
  return Boolean(dictionaryState.entries && dictionaryState.entries.length);
}

function openDictionaryDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(DB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveDictionaryToDb() {
  const db = await openDictionaryDb();
  if (!db) return;
  await new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put(importedDictionaryState, 'importedDictionary');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function loadDictionaryFromDb() {
  try {
    const db = await openDictionaryDb();
    if (!db) {
      refreshCombinedDictionary();
      return;
    }
    const loaded = await new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const store = tx.objectStore(DB_STORE);
      const request = store.get('importedDictionary');
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
          return;
        }
        const legacy = store.get('dictionary');
        legacy.onsuccess = () => resolve(legacy.result || null);
        legacy.onerror = () => reject(legacy.error);
      };
      request.onerror = () => reject(request.error);
    });
    db.close();
    if (loaded && Array.isArray(loaded.entries)) {
      importedDictionaryState = loaded;
    }
    refreshCombinedDictionary();
  } catch (error) {
    console.warn('Wörterbuch konnte nicht geladen werden:', error);
    refreshCombinedDictionary();
  }
}

async function clearDictionaryFromDb() {
  try {
    const db = await openDictionaryDb();
    if (!db) return;
    await new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      const store = tx.objectStore(DB_STORE);
      store.delete('importedDictionary');
      store.delete('dictionary');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (error) {
    console.warn('Themenwörterbuch konnte nicht gelöscht werden:', error);
  }
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('de-DE');
}

function getBlockedGridSet(text = '') {
  const set = new Set();
  String(text || '')
    .split(/[\n,;]+/)
    .map((part) => normalizeWord(part).grid)
    .filter(Boolean)
    .forEach((grid) => set.add(grid));
  getPersonalBlockedGridSet().forEach((grid) => set.add(grid));
  return set;
}



function getWordFormModeLabel(mode) {
  if (mode === 'all') return 'alle Wörterbuchformen';
  if (mode === 'strict') return 'streng: möglichst nur Singular/Grundform';
  return 'Grundformen + Substantiv-Mehrzahl';
}

function getWordTypeWeights(settings = getSettings()) {
  const noun = clampNumber(settings.nounWeight ?? 60, 0, 100, 60);
  const adjective = clampNumber(settings.adjectiveWeight ?? 20, 0, 100, 20);
  const verb = clampNumber(settings.verbWeight ?? 10, 0, 100, 10);
  const other = clampNumber(settings.otherWeight ?? 10, 0, 100, 10);
  const total = noun + adjective + verb + other;
  if (!total) return { noun: 60, adjective: 20, verb: 10, other: 10 };
  return { noun, adjective, verb, other };
}

function formatWordTypeWeights(settings = getSettings()) {
  const weights = getWordTypeWeights(settings);
  return `${weights.noun}:${weights.adjective}:${weights.verb}:${weights.other}`;
}

function getWordTypeLabel(type) {
  if (type === 'noun') return 'Substantiv';
  if (type === 'adjective') return 'Adjektiv';
  if (type === 'verb') return 'Verb';
  return 'Andere';
}

function getShortWordTypeLabel(type) {
  if (type === 'noun') return 'Subst.';
  if (type === 'adjective') return 'Adj.';
  if (type === 'verb') return 'Verb';
  return 'Andere';
}

function getGridDisplayLabel(mode) {
  if (mode === 'lines') return 'Begrenzungslinien';
  return 'Schwarze Felder';
}

function countWordTypes(entries = []) {
  const counts = { noun: 0, adjective: 0, verb: 0, other: 0 };
  entries.forEach((entry) => {
    const type = classifyWordType(entry);
    counts[type] = (counts[type] || 0) + 1;
  });
  return counts;
}

function formatWordTypeCounts(entries = []) {
  const counts = countWordTypes(entries);
  return ['noun', 'adjective', 'verb', 'other']
    .map((type) => `${getShortWordTypeLabel(type)} ${counts[type] || 0}`)
    .join(', ');
}

function classifyWordType(entry) {
  if (!entry) return 'other';
  if (entry.wordType) return entry.wordType;
  const original = String(entry.original || entry.grid || '');
  const grid = entry.grid || normalizeWord(original).grid;
  const lower = original.toLocaleLowerCase('de-DE');
  let type = 'other';

  if (/\.$/.test(original) || /[0-9]/.test(original) || /[^A-Za-zÄÖÜäöüßẞ.\-]/.test(original)) {
    type = 'other';
  } else if (/^[A-ZÄÖÜẞ]/.test(original)) {
    type = 'noun';
  } else if (likelyInflectedVerb(grid, lower) || /(ieren|igen|eln|ern|en|n)$/.test(lower)) {
    const adjectiveLike = /(bar|haft|ig|isch|lich|los|sam|weise|artig|förmig|reich|arm|voll|leer|nah|fern|weit|weitig|malig)$/.test(lower);
    type = adjectiveLike ? 'adjective' : 'verb';
  } else if (likelyInflectedAdjective(grid) || /(bar|haft|ig|isch|lich|los|sam|weise|artig|förmig|reich|arm|voll|leer|nah|fern|weit|weitig|malig|al|ell|iv|ös|ant|ent)$/.test(lower)) {
    type = 'adjective';
  }

  entry.wordType = type;
  return type;
}

function scoreDictionaryEntry(entry, settings) {
  const maxLength = Math.max(settings.width, settings.height);
  const idealLength = Math.min(Math.max(settings.minLength + 3, 7), Math.max(8, Math.min(maxLength, 12)));
  return Math.random() * 100 + Math.max(0, 90 - Math.abs(entry.length - idealLength) * 9) + Math.min(entry.length, 10) * 2;
}

function getWeightedTargets(total, settings) {
  const weights = getWordTypeWeights(settings);
  const sum = Math.max(1, weights.noun + weights.adjective + weights.verb + weights.other);
  const exact = {
    noun: total * weights.noun / sum,
    adjective: total * weights.adjective / sum,
    verb: total * weights.verb / sum,
    other: total * weights.other / sum,
  };
  const targets = Object.fromEntries(Object.entries(exact).map(([type, value]) => [type, Math.floor(value)]));
  let assigned = Object.values(targets).reduce((a, b) => a + b, 0);
  Object.entries(exact)
    .sort((a, b) => (b[1] - Math.floor(b[1])) - (a[1] - Math.floor(a[1])))
    .forEach(([type]) => {
      if (assigned < total) {
        targets[type] += 1;
        assigned += 1;
      }
    });
  return targets;
}

function addReservoirSample(bucket, entry, limit) {
  bucket.checked += 1;
  if (bucket.entries.length < limit) {
    bucket.entries.push(entry);
    return;
  }
  const replaceIndex = Math.floor(Math.random() * bucket.checked);
  if (replaceIndex < limit) bucket.entries[replaceIndex] = entry;
}

function hasAnyDictionaryGrid(...grids) {
  return grids.some((grid) => grid && grid.length >= 2 && dictionaryIndex.has(grid));
}

function stemExistsByRemoving(grid, suffixes) {
  return suffixes.some((suffix) => {
    if (!grid.endsWith(suffix) || grid.length <= suffix.length + 2) return false;
    const stem = grid.slice(0, -suffix.length);
    return hasAnyDictionaryGrid(stem);
  });
}

function likelyInflectedNoun(grid) {
  const checks = [
    ['INNEN', 'IN'],
    ['ERN', 'ER'],
    ['EN', ''],
    ['ES', ''],
    ['E', ''],
    ['ER', ''],
    ['N', ''],
    ['S', ''],
  ];
  return checks.some(([suffix, replacement]) => {
    if (!grid.endsWith(suffix) || grid.length <= suffix.length + 2) return false;
    const stem = grid.slice(0, -suffix.length) + replacement;
    return dictionaryIndex.has(stem);
  });
}

function likelyInflectedAdjective(grid) {
  const comparativeSuffixes = ['EREM', 'EREN', 'ERER', 'ERES', 'ERE', 'ER'];
  const superlativeSuffixes = ['STEM', 'STEN', 'STER', 'STES', 'STE'];
  const adjectiveSuffixes = ['EM', 'EN', 'ER', 'ES', 'E'];
  return stemExistsByRemoving(grid, comparativeSuffixes)
    || stemExistsByRemoving(grid, superlativeSuffixes)
    || stemExistsByRemoving(grid, adjectiveSuffixes);
}

function likelyInflectedVerb(grid, originalLower) {
  const verbRoots = (root) => hasAnyDictionaryGrid(`${root}EN`, `${root}N`);

  const participleSuffixes = ['ENDES', 'ENDER', 'ENDEN', 'ENDEM', 'ENDE', 'END'];
  if (participleSuffixes.some((suffix) => grid.endsWith(suffix) && verbRoots(grid.slice(0, -suffix.length)))) return true;

  const pastSuffixes = ['TETEST', 'TETET', 'TEST', 'TETEN', 'TEN', 'TETE', 'TET', 'TE'];
  if (pastSuffixes.some((suffix) => grid.endsWith(suffix) && verbRoots(grid.slice(0, -suffix.length)))) return true;

  if (grid.endsWith('ST') && verbRoots(grid.slice(0, -2))) return true;
  if (grid.endsWith('T') && verbRoots(grid.slice(0, -1))) return true;
  if (grid.endsWith('E') && hasAnyDictionaryGrid(`${grid}N`, `${grid.slice(0, -1)}EN`, `${grid.slice(0, -1)}N`)) return true;

  if (/ge/.test(originalLower) && /(t|et|en|ene|enem|enen|ener|enes)$/.test(originalLower)) return true;
  return false;
}


function likelyGenitiveNoun(grid) {
  if (!grid || grid.length <= 3) return false;
  if (grid.endsWith('ES') && grid.length > 4 && dictionaryIndex.has(grid.slice(0, -2))) return true;
  if (grid.endsWith('S') && grid.length > 3 && dictionaryIndex.has(grid.slice(0, -1))) return true;
  return false;
}

function likelyBaseVerb(grid, originalLower) {
  if (!grid || !originalLower) return false;
  if (likelyInflectedVerb(grid, originalLower)) return false;
  return /(ieren|eln|ern|en|n)$/.test(originalLower);
}

function likelyBaseAdjective(grid, originalLower) {
  if (!grid || !originalLower) return false;
  if (likelyInflectedAdjective(grid)) return false;
  if (/(erem|eren|erer|eres|ere|stem|sten|ster|stes|ste|em|en|es)$/.test(originalLower)) return false;
  if (/(bar|haft|ig|isch|lich|los|sam|weise|artig|förmig|foermig|reich|arm|voll|leer|nah|fern|weit|weitig|malig|al|ell|iv|ös|oes|ant|ent)$/.test(originalLower)) return true;
  return classifyWordType({ original: originalLower, grid }) === 'adjective';
}

function isAllowedDatabaseBaseForm(entry, mode = 'basic') {
  if (!entry || mode === 'all') return true;
  const original = String(entry.original || entry.grid || '');
  const grid = entry.grid || normalizeWord(original).grid;
  if (!grid || grid.length <= 2) return true;

  const originalLower = original.toLocaleLowerCase('de-DE');
  const startsUpper = /^[A-ZÄÖÜẞ]/.test(original);
  const startsLower = /^[a-zäöüß]/.test(original);

  if (startsUpper) {
    if (mode === 'strict') return !likelyInflectedNoun(grid) && !likelyGenitiveNoun(grid);
    return !likelyGenitiveNoun(grid);
  }

  if (startsLower) {
    const type = classifyWordType(entry);
    if (type === 'verb') return likelyBaseVerb(grid, originalLower);
    if (type === 'adjective') return likelyBaseAdjective(grid, originalLower);
    if (likelyInflectedVerb(grid, originalLower) || likelyInflectedAdjective(grid)) return false;
    return true;
  }

  return true;
}

function isLikelyInflectedEntry(entry, mode = 'basic') {
  if (!entry || mode === 'all') return false;
  return !isAllowedDatabaseBaseForm(entry, mode);
}

function appendBlockedWord(rawWord) {
  const clean = normalizeWord(rawWord);
  if (!clean.grid || !els.blockedWordsInput) return;
  const existing = getBlockedGridSet(els.blockedWordsInput.value);
  if (existing.has(clean.grid)) {
    setMessages([{ text: `${clean.grid} ist bereits als „nicht verwenden“ markiert.` }]);
    return;
  }
  const current = els.blockedWordsInput.value.trim();
  els.blockedWordsInput.value = current ? `${current}\n${clean.grid}` : clean.grid;
  if (personalDictionary.words[clean.grid]) {
    setPersonalWordBlocked(clean.grid, true);
    savePersonalDictionary();
    renderPersonalDictionaryUi();
  }
  saveState();
  setMessages([{ type: 'ok', text: `${clean.grid} wird künftig ausgeschlossen. Das Rätsel wurde neu erzeugt.` }]);
  createPuzzle();
}

function updateDictionaryUi() {
  if (!els.dictionaryStatus) return;
  const enabled = hasDictionary();
  if (els.fillFromDictionary) els.fillFromDictionary.disabled = !enabled;
  els.clearDictionary.disabled = !hasImportedDictionary();
  els.dictionarySearch.disabled = !enabled;
  if (!enabled) {
    els.dictionaryStatus.textContent = 'Die eingebaute Wortliste konnte nicht geladen werden.';
    els.dictionaryResults.textContent = 'Keine Wörter verfügbar.';
    els.dictionaryResults.classList.add('empty-clue-list');
    return;
  }
  const stats = dictionaryState.stats || {};
  const settings = getSettings();
  const filteredCount = getFilteredDictionaryEntries(settings).length;
  const importedInfo = hasImportedDictionary()
    ? `<br><span class="word-meta">Zusatzliste: ${escapeHtml(dictionaryState.importSourceName)} · ${formatNumber(dictionaryState.importedCount)} importierte Einträge</span>`
    : '<br><span class="word-meta">Keine Zusatzliste importiert. Du kannst fremdsprachige oder eigene Wörter zusätzlich laden.</span>';
  const ambiguous = stats.ambiguousGridForms ? ` · ${formatNumber(stats.ambiguousGridForms)} mehrdeutige Gitterformen erkannt` : '';
  const umlautless = stats.umlautlessVariantsSkipped ? ` · ${formatNumber(stats.umlautlessVariantsSkipped)} umlautlose Parallelformen entfernt` : '';
  const filterInfo = `<br><span class="word-meta">Datenbank-Formen: ${escapeHtml(getWordFormModeLabel(settings.wordFormMode))} · Wortarten-Gewichtung ${escapeHtml(formatWordTypeWeights(settings))} · ${formatNumber(filteredCount)} Wörter als gefilterter Füllfundus nutzbar</span>`;
  els.dictionaryStatus.innerHTML = `
    <strong>${escapeHtml(dictionaryState.sourceName)}</strong><br>
    ${formatNumber(stats.usable)} nutzbare Wörter verfügbar · davon ${formatNumber(dictionaryState.builtInCount)} eingebaut · ${formatNumber(stats.tooShort)} sehr kurze Wörter ausgeschlossen${escapeHtml(ambiguous)}${escapeHtml(umlautless)}
    ${filterInfo}
    ${importedInfo}`;
  renderDictionaryResults();
}

function getFilteredDictionaryEntries(settings = getSettings(), extraExcluded = new Set()) {
  const maxLength = Math.max(settings.width, settings.height);
  const blocked = getBlockedGridSet(settings.blockedWordsText || '');
  return dictionaryState.entries.filter((entry) => entry.length >= settings.minLength
    && entry.length <= maxLength
    && !blocked.has(entry.grid)
    && !extraExcluded.has(entry.grid)
    && !isLikelyInflectedEntry(entry, settings.wordFormMode));
}

function pickDictionaryWords(settings = getSettings(), extraExcluded = new Set(), targetCount = settings.maxWords) {
  const maxLength = Math.max(settings.width, settings.height);
  const blocked = getBlockedGridSet(settings.blockedWordsText || '');
  const sampleTarget = Math.min(Math.max(targetCount, settings.maxWords * 8, 250), 1600);
  const targets = getWeightedTargets(sampleTarget, settings);
  const sampleLimits = {
    noun: Math.max(80, targets.noun * 4),
    adjective: Math.max(60, targets.adjective * 4),
    verb: Math.max(40, targets.verb * 4),
    other: Math.max(40, targets.other * 4),
  };
  const buckets = {
    noun: { entries: [], checked: 0 },
    adjective: { entries: [], checked: 0 },
    verb: { entries: [], checked: 0 },
    other: { entries: [], checked: 0 },
  };
  let checked = 0;

  dictionaryState.entries.forEach((entry) => {
    if (entry.length < settings.minLength || entry.length > maxLength) return;
    if (blocked.has(entry.grid) || extraExcluded.has(entry.grid)) return;
    if (isLikelyInflectedEntry(entry, settings.wordFormMode)) return;
    checked += 1;
    const type = classifyWordType(entry);
    addReservoirSample(buckets[type] || buckets.other, entry, sampleLimits[type] || sampleLimits.other);
  });

  const scoredByType = {};
  Object.keys(buckets).forEach((type) => {
    scoredByType[type] = buckets[type].entries
      .map((entry) => ({ entry, type, score: scoreDictionaryEntry(entry, settings) }))
      .sort((a, b) => b.score - a.score || b.entry.length - a.entry.length || a.entry.grid.localeCompare(b.entry.grid, 'de'));
  });

  const selectedItems = [];
  const selectedKeys = new Set();
  const take = (item) => {
    if (!item || selectedKeys.has(item.entry.grid)) return false;
    selectedItems.push(item);
    selectedKeys.add(item.entry.grid);
    return true;
  };

  Object.entries(targets).forEach(([type, count]) => {
    scoredByType[type].slice(0, count).forEach(take);
  });

  if (selectedItems.length < sampleTarget) {
    const leftovers = Object.values(scoredByType)
      .flat()
      .filter((item) => !selectedKeys.has(item.entry.grid))
      .sort((a, b) => b.score - a.score || b.entry.length - a.entry.length || a.entry.grid.localeCompare(b.entry.grid, 'de'));
    for (const item of leftovers) {
      if (selectedItems.length >= sampleTarget) break;
      take(item);
    }
  }

  selectedItems.sort((a, b) => b.score - a.score || b.entry.length - a.entry.length || a.entry.grid.localeCompare(b.entry.grid, 'de'));
  const selected = selectedItems.map((item) => item.entry);
  selected.checkedDictionaryEntries = checked;
  selected.typeTargets = targets;
  selected.typeCounts = Object.fromEntries(Object.keys(buckets).map((type) => [type, buckets[type].checked]));
  return selected;
}

function renderDictionaryResults() {
  if (!els.dictionaryResults) return;
  if (!hasDictionary()) {
    els.dictionaryResults.textContent = 'Der Datenbank-Wortschatz konnte nicht geladen werden.';
    els.dictionaryResults.classList.add('empty-clue-list');
    return;
  }

  const settings = getSettings();
  const queryRaw = els.dictionarySearch.value.trim();
  const query = normalizeWord(queryRaw).grid;
  const filtered = getFilteredDictionaryEntries(settings);

  if (!query) {
    els.dictionaryResults.classList.add('empty-clue-list');
    els.dictionaryResults.innerHTML = `Datenbank-Fundus aktiv: ${formatNumber(filtered.length)} Wörter passen zu Mindestlänge und Wortformenfilter. Gib einen Suchbegriff ein, wenn Du gezielt prüfen möchtest, ob ein Wort enthalten ist.`;
    return;
  }

  const rawUpper = queryRaw.toUpperCase();
  const matches = filtered.filter((entry) => entry.grid.includes(query) || entry.original.toUpperCase().includes(rawUpper));
  const limit = 40;
  const visible = matches.slice(0, limit);
  els.dictionaryResults.classList.remove('empty-clue-list');
  if (!visible.length) {
    els.dictionaryResults.innerHTML = '<span class="word-meta">Keine Treffer mit der aktuellen Mindestlänge.</span>';
    return;
  }
  els.dictionaryResults.innerHTML = `
    <div class="dictionary-result-summary">${formatNumber(matches.length)} Treffer für „${escapeHtml(queryRaw)}“</div>
    <div class="dictionary-result-list">
      ${visible.map((entry) => `<span class="dictionary-word" title="${escapeHtml(entry.original)}">${escapeHtml(entry.original)} <small>${escapeHtml(entry.grid)} · ${entry.length} · ${escapeHtml(getWordTypeLabel(classifyWordType(entry)))}</small></span>`).join('')}
    </div>
    ${matches.length > limit ? `<div class="word-meta">Weitere ${formatNumber(matches.length - limit)} Treffer ausgeblendet.</div>` : ''}`;
}

async function importDictionaryFile(file) {
  if (!file) return;
  setMessages([{ text: `Wörterbuch „${file.name}“ wird importiert. Bei großen Listen kann der Browser kurz beschäftigt sein.` }]);
  const text = await file.text();
  importedDictionaryState = analyzeDictionaryText(text, file.name, 3);
  refreshCombinedDictionary();
  await saveDictionaryToDb();
  updateDictionaryUi();
  const stats = importedDictionaryState.stats || {};
  setMessages([
    { type: 'ok', text: `Zusatzliste importiert: ${formatNumber(stats.usable)} Wörter wurden zur eingebauten Vollfundus ergänzt.` },
    ...(stats.ambiguousGridForms ? [{ text: `${formatNumber(stats.ambiguousGridForms)} mehrdeutige Gitterformen wurden in der Zusatzliste erkannt, z. B. MASSE aus unterschiedlichen Originalwörtern. Für das Rätsel wird jeweils eine bevorzugte Form verwendet.` }] : []),
  ]);
}

function fillWordInputFromDictionary() {
  const settings = getSettings();
  if (!hasDictionary()) {
    setMessages([{ type: 'error', text: 'Die Wortliste ist nicht verfügbar. Bitte lade die Seite neu.' }]);
    return false;
  }
  const picked = pickDictionaryWords(settings);
  if (!picked.length) {
    setMessages([{ type: 'error', text: 'Keine Wörter in der eingebauten/ergänzten Wortliste passen zur aktuellen Mindestlänge und zum Format.' }]);
    return false;
  }
  els.wordInput.value = picked.map((entry) => entry.original).join('\n');
  saveState();
  setMessages([{ type: 'ok', text: `${picked.length} Wörter aus der eingebauten/ergänzten Wortliste wurden übernommen.` }]);
  return true;
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

function buildGenerationWords(options) {
  const maxLength = Math.max(options.width, options.height);
  const blocked = getBlockedGridSet(options.blockedWordsText || '');
  const manual = parseWords(options.wordText, options.minLength, 10000, {
    across: options.seedAcross,
    down: options.seedDown,
  });
  const issues = [...manual.issues];
  const seen = new Set();
  const words = [];

  manual.words.forEach((word) => {
    if (blocked.has(word.grid)) {
      issues.push(`${word.original}: als „nicht verwenden“ markiert.`);
      return;
    }
    if (word.grid.length > maxLength) {
      issues.push(`${word.original}: länger als Breite und Höhe des Formats.`);
      return;
    }
    if (!seen.has(word.grid)) {
      seen.add(word.grid);
      words.push(word);
    }
  });

  if (options.useDictionary && options.maxFillerWords > 0) {
    const safeEntries = getSafeVocabularyEntries(options, seen);
    safeEntries.forEach((entry) => {
      if (!seen.has(entry.grid)) {
        seen.add(entry.grid);
        words.push({ original: entry.original, grid: entry.grid, source: 'safe' });
      }
    });

    if (hasDictionary()) {
      const targetPool = Math.max(options.maxFillerWords * 10, 300);
      const picked = pickDictionaryWords({ ...options, maxWords: Math.max(options.maxFillerWords, 1) }, seen, targetPool);
      picked.forEach((entry) => {
        if (!seen.has(entry.grid)) {
          seen.add(entry.grid);
          words.push({ original: entry.original, grid: entry.grid, source: 'dictionary' });
        }
      });
    }
  } else if (!words.length && !options.useDictionary) {
    issues.push('Keine Themen-/Leitwörter eingetragen.');
  } else if (!words.length) {
    issues.push('Kein Wörterbuch verfügbar und keine Themen-/Leitwörter eingetragen.');
  }

  return {
    words,
    issues,
    skippedByLimit: Math.max(0, words.length - Math.max(options.maxWords * 10, 300)),
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


function getEntryKey(entry) {
  return `${entry.direction}|${entry.value}`;
}

function getDirectionLabel(direction) {
  return direction === 'across' ? 'Waagrecht' : 'Senkrecht';
}

function collectCurrentClues() {
  const collected = { ...clueBank };
  if (currentPuzzle && currentPuzzle.clues) {
    Object.assign(collected, currentPuzzle.clues);
  }
  if (els.clueEditor) {
    els.clueEditor.querySelectorAll('textarea[data-clue-key]').forEach((input) => {
      collected[input.dataset.clueKey] = input.value;
    });
  }
  return collected;
}

function attachCluesToPuzzle(puzzle, existingClues) {
  const clues = {};
  puzzle.entries.forEach((entry) => {
    const key = getEntryKey(entry);
    clues[key] = existingClues[key] || '';
  });
  puzzle.clues = clues;
  clueBank = { ...existingClues, ...clues };
  return puzzle;
}

function getClueForEntry(entry) {
  const key = getEntryKey(entry);
  if (currentPuzzle && currentPuzzle.clues && Object.prototype.hasOwnProperty.call(currentPuzzle.clues, key)) {
    return currentPuzzle.clues[key] || '';
  }
  return clueBank[key] || '';
}

function findPlacedWordForEntry(puzzle, entry) {
  return puzzle.placed.find((word) => word.direction === entry.direction && word.row === entry.row && word.col === entry.col && word.grid === entry.value)
    || puzzle.placed.find((word) => word.grid === entry.value)
    || null;
}

function generatePuzzle(options) {
  const grid = makeEmptyGrid(options.width, options.height);
  const { words, issues, skippedByLimit } = buildGenerationWords(options);
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

  let placedFillerCount = placed.filter((word) => word.source === 'dictionary' || word.source === 'safe').length;

  for (const word of words) {
    const isFiller = word.source === 'dictionary' || word.source === 'safe';
    if (isFiller && placedFillerCount >= options.maxFillerWords) continue;
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
    if (isFiller) placedFillerCount += 1;
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
  const displayMode = settings.displayMode || 'black';

  lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" role="img" aria-label="Kreuzworträtsel">`);
  lines.push(`<rect width="100%" height="100%" fill="white"/>`);

  for (let r = bounds.minRow; r <= bounds.maxRow; r += 1) {
    for (let c = bounds.minCol; c <= bounds.maxCol; c += 1) {
      const x = padding + (c - bounds.minCol) * cell;
      const y = padding + (r - bounds.minRow) * cell;
      const letter = puzzle.grid[r][c];
      if (!letter) {
        if (displayMode === 'black') {
          lines.push(`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="#111111"/>`);
        }
        continue;
      }
      const strokeWidth = displayMode === 'lines' ? 1.8 : 1.6;
      lines.push(`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="white" stroke="#111111" stroke-width="${strokeWidth}"/>`);
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
  renderClueEditors();
}

function renderLists() {
  if (!currentPuzzle) return;
  const across = currentPuzzle.entries.filter((entry) => entry.direction === 'across');
  const down = currentPuzzle.entries.filter((entry) => entry.direction === 'down');
  const itemHtml = (entry) => `<li value="${entry.number}"><strong>${escapeHtml(entry.value)}</strong> <span class="word-meta">(${entry.length})</span> <button class="mini ghost" type="button" data-block-word="${escapeHtml(entry.value)}">nicht verwenden</button></li>`;
  els.acrossList.innerHTML = across.map(itemHtml).join('');
  els.downList.innerHTML = down.map(itemHtml).join('');

  const items = [];
  currentPuzzle.parseIssues.forEach((issue) => items.push(`<li>${escapeHtml(issue)}</li>`));
  const themeUnplaced = getThemeUnplacedWords(currentPuzzle);
  themeUnplaced.forEach((word) => items.push(`<li><strong>${escapeHtml(word.grid)}</strong>: ${escapeHtml(word.reason)}</li>`));
  if (currentPuzzle.skippedByLimit) items.push(`<li>${currentPuzzle.skippedByLimit} Themen- oder Füllkandidaten wurden wegen der Maximalgrenze nicht verarbeitet.</li>`);
  const hiddenDictionaryUnplaced = currentPuzzle.unplaced.filter((word) => word.source === 'dictionary').length;
  if (hiddenDictionaryUnplaced) items.push(`<li class="word-meta">${formatNumber(hiddenDictionaryUnplaced)} nicht passende Datenbank-Füllkandidaten wurden ausgeblendet, weil sie für die Themenkontrolle nicht wichtig sind.</li>`);
  if (!items.length) items.push('<li>Keine Hinweise. Alle verarbeiteten Themenwörter wurden platziert oder es gab keine Themenwörter.</li>');
  els.unplacedList.innerHTML = items.join('');
}

function getThemeUnplacedWords(puzzle) {
  if (!puzzle || !Array.isArray(puzzle.unplaced)) return [];
  return puzzle.unplaced.filter((word) => word.source !== 'dictionary');
}


function renderClueEditors() {
  if (!currentPuzzle) {
    els.acrossClues.textContent = 'Nach dem Erstellen erscheinen hier die Fragenfelder.';
    els.downClues.textContent = 'Nach dem Erstellen erscheinen hier die Fragenfelder.';
    els.acrossClues.classList.add('empty-clue-list');
    els.downClues.classList.add('empty-clue-list');
    return;
  }

  const across = currentPuzzle.entries.filter((entry) => entry.direction === 'across');
  const down = currentPuzzle.entries.filter((entry) => entry.direction === 'down');
  renderClueList(els.acrossClues, across);
  renderClueList(els.downClues, down);
}

function renderClueList(container, entries) {
  if (!entries.length) {
    container.textContent = 'Keine Einträge in dieser Richtung.';
    container.classList.add('empty-clue-list');
    return;
  }
  container.classList.remove('empty-clue-list');
  container.innerHTML = entries.map((entry) => {
    const key = getEntryKey(entry);
    const clue = getClueForEntry(entry);
    const placedWord = findPlacedWordForEntry(currentPuzzle, entry);
    const original = placedWord ? placedWord.original : entry.value;
    const statusClass = clue.trim() ? 'done' : 'missing';
    const statusText = clue.trim() ? 'Frage eingetragen' : 'Frage fehlt';
    const textareaId = `clue-${entry.direction}-${entry.number}-${entry.row}-${entry.col}`;
    return `
      <div class="clue-card">
        <label for="${textareaId}">
          <span class="clue-meta-line">
            <span class="clue-number">${entry.number}. ${getDirectionLabel(entry.direction)}</span>
            <span class="clue-solution">${escapeHtml(original)} / ${escapeHtml(entry.value)} (${entry.length})</span>
          </span>
          <textarea id="${textareaId}" class="clue-input" data-clue-key="${escapeHtml(key)}" data-direction="${entry.direction}" data-number="${entry.number}" placeholder="Frage zu ${escapeHtml(entry.value)} eingeben">${escapeHtml(clue)}</textarea>
          <span class="clue-status ${statusClass}">${statusText}</span>
        </label>
      </div>`;
  }).join('');
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
    minLength: clampNumber(els.minLength.value, 2, 30, 3),
    maxWords: clampNumber(els.maxWords.value, 0, 200, 40),
    maxFillerWords: clampNumber(els.maxWords.value, 0, 200, 40),
    wordFormMode: els.wordFormMode ? els.wordFormMode.value : 'basic',
    nounWeight: els.nounWeight ? els.nounWeight.value : 60,
    adjectiveWeight: els.adjectiveWeight ? els.adjectiveWeight.value : 20,
    verbWeight: els.verbWeight ? els.verbWeight.value : 10,
    otherWeight: els.otherWeight ? els.otherWeight.value : 10,
    seedAcross: els.seedAcross.value,
    seedDown: els.seedDown.value,
    cropToContent: els.cropToContent.checked,
    displayMode: els.gridDisplayMode ? els.gridDisplayMode.value : 'black',
    cellSize: clampNumber(els.cellSize.value, 20, 120, 42),
    baseName: sanitizeFileBase(els.baseName.value || 'raetsel_001'),
    wordText: els.wordInput.value,
    blockedWordsText: els.blockedWordsInput ? els.blockedWordsInput.value : '',
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
  [els.exportEmptySvg, els.exportSolutionSvg, els.exportSolutionsTxt, els.exportCluesTxt, els.exportCluesCsv, els.exportProjectJson].forEach((button) => {
    button.disabled = !enabled;
  });
}

function createPuzzle(useDictionary = true) {
  const settings = { ...getSettings(), useDictionary };
  if (!settings.wordText.trim() && !settings.seedAcross.trim() && !settings.seedDown.trim() && (!useDictionary || !hasDictionary())) {
    setMessages([{ type: 'error', text: useDictionary ? 'Bitte gib Themenwörter ein, trage ein Leitwort ein oder nutze den Basiswortschatz zum Füllen.' : 'Bitte wähle eine persönliche Liste oder trage Themen-/Leitwörter ein.' }]);
    return;
  }

  const existingClues = collectCurrentClues();
  currentPuzzle = attachCluesToPuzzle(generatePuzzle(settings), existingClues);
  currentView = 'empty';
  const used = getUsedCells(currentPuzzle.grid).length;
  const placedCount = currentPuzzle.placed.length;
  const themeUnplacedCount = getThemeUnplacedWords(currentPuzzle).length;
  const dictionaryUnplacedCount = currentPuzzle.unplaced.filter((word) => word.source === 'dictionary' || word.source === 'safe').length;
  els.stats.textContent = `${placedCount} Wörter platziert, ${themeUnplacedCount} Themenwörter nicht platziert, ${used} belegte Felder. Wortarten: ${formatWordTypeCounts(currentPuzzle.placed)}. Ausgabeformat: ${settings.width} × ${settings.height}. Darstellung: ${getGridDisplayLabel(settings.displayMode)}.`;
  addPlacedWordsToSafeVocabulary(currentPuzzle);
  setMessages([
    { type: placedCount ? 'ok' : 'error', text: placedCount ? (useDictionary ? `Rätsel erzeugt und gefüllt: ${placedCount} Wörter wurden platziert.` : `Rätsel aus Themenliste erzeugt: ${placedCount} Wörter wurden platziert.`) : 'Es konnte kein Startwort platziert werden.' },
    ...(themeUnplacedCount ? [{ text: `${themeUnplacedCount} Themenwörter konnten nicht sinnvoll gekreuzt werden. Sie stehen unten in der Prüfliste.` }] : []),
    ...(!themeUnplacedCount && dictionaryUnplacedCount ? [{ text: `Nicht passende Datenbank-Füllkandidaten wurden ausgeblendet. Wichtig sind unten nur Deine Themenwörter.` }] : []),
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
  lines.push('Nicht platzierte Themenwörter');
  const themeUnplaced = getThemeUnplacedWords(puzzle);
  if (themeUnplaced.length) {
    themeUnplaced.forEach((word) => lines.push(`- ${word.grid}: ${word.reason}`));
  } else {
    lines.push('- keine');
  }
  return lines.join('\n');
}


function buildCluesText(puzzle) {
  const across = puzzle.entries.filter((entry) => entry.direction === 'across');
  const down = puzzle.entries.filter((entry) => entry.direction === 'down');
  const lines = [];
  lines.push('Kreuzwortdrucker v' + VERSION);
  lines.push('Fragenkatalog');
  lines.push('Erzeugt: ' + new Date(puzzle.createdAt).toLocaleString('de-DE'));
  lines.push('');
  lines.push('Waagrecht');
  across.forEach((entry) => {
    const clue = getClueForEntry(entry).trim();
    lines.push(`${entry.number}. ${clue || '[Frage fehlt]'}`);
  });
  lines.push('');
  lines.push('Senkrecht');
  down.forEach((entry) => {
    const clue = getClueForEntry(entry).trim();
    lines.push(`${entry.number}. ${clue || '[Frage fehlt]'}`);
  });
  return lines.join('\n');
}

function csvEscape(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

function buildCluesCsv(puzzle) {
  const header = ['Nummer', 'Richtung', 'Frage', 'Originalwort', 'Gitterwort', 'Laenge', 'Status'];
  const rows = [header];
  const orderedEntries = [
    ...puzzle.entries.filter((entry) => entry.direction === 'across'),
    ...puzzle.entries.filter((entry) => entry.direction === 'down'),
  ];
  orderedEntries.forEach((entry) => {
    const placedWord = findPlacedWordForEntry(puzzle, entry);
    const clue = getClueForEntry(entry).trim();
    rows.push([
      entry.number,
      getDirectionLabel(entry.direction),
      clue,
      placedWord ? placedWord.original : entry.value,
      entry.value,
      entry.length,
      clue ? 'fertig' : 'offen',
    ]);
  });
  return '\uFEFF' + rows.map((row) => row.map(csvEscape).join(';')).join('\r\n');
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
  if (els.clueEditor) {
    clueBank = collectCurrentClues();
  }
  const data = {
    fields: {
      gridWidth: els.gridWidth.value,
      gridHeight: els.gridHeight.value,
      minLength: els.minLength.value,
      maxWords: els.maxWords.value,
      wordFormMode: els.wordFormMode ? els.wordFormMode.value : 'basic',
      nounWeight: els.nounWeight ? els.nounWeight.value : '60',
      adjectiveWeight: els.adjectiveWeight ? els.adjectiveWeight.value : '20',
      verbWeight: els.verbWeight ? els.verbWeight.value : '10',
      otherWeight: els.otherWeight ? els.otherWeight.value : '10',
      seedAcross: els.seedAcross.value,
      seedDown: els.seedDown.value,
      cropToContent: els.cropToContent.checked,
      gridDisplayMode: els.gridDisplayMode ? els.gridDisplayMode.value : 'black',
      cellSize: els.cellSize.value,
      baseName: els.baseName.value,
      wordInput: els.wordInput.value,
      blockedWordsInput: els.blockedWordsInput ? els.blockedWordsInput.value : '',
      dictionarySearch: els.dictionarySearch ? els.dictionarySearch.value : '',
    },
    clueBank,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadState() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        raw = localStorage.getItem(legacyKey);
        if (raw) break;
      }
    }
    if (!raw) return;
    const data = JSON.parse(raw);
    clueBank = data.clueBank || {};
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
  LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  els.gridWidth.value = '22';
  els.gridHeight.value = '15';
  els.minLength.value = '3';
  els.maxWords.value = '40';
  if (els.wordFormMode) els.wordFormMode.value = 'basic';
  if (els.nounWeight) els.nounWeight.value = '60';
  if (els.adjectiveWeight) els.adjectiveWeight.value = '20';
  if (els.verbWeight) els.verbWeight.value = '10';
  if (els.otherWeight) els.otherWeight.value = '10';
  els.seedAcross.value = '';
  els.seedDown.value = '';
  els.cropToContent.checked = true;
  if (els.gridDisplayMode) els.gridDisplayMode.value = 'black';
  els.cellSize.value = '42';
  els.baseName.value = 'raetsel_001';
  els.wordInput.value = '';
  if (els.blockedWordsInput) els.blockedWordsInput.value = '';
  if (els.dictionarySearch) els.dictionarySearch.value = '';
  currentPuzzle = null;
  currentView = 'empty';
  clueBank = {};
  updateButtons(false);
  els.stats.textContent = 'Noch kein Rätsel erzeugt.';
  els.gridWrap.innerHTML = '<div class="empty-state">Klick auf „Rätsel erstellen“ und die Buchstaben nehmen Aufstellung.</div>';
  els.acrossList.innerHTML = '';
  els.downList.innerHTML = '';
  els.unplacedList.innerHTML = '';
  els.acrossClues.textContent = 'Nach dem Erstellen erscheinen hier die Fragenfelder.';
  els.downClues.textContent = 'Nach dem Erstellen erscheinen hier die Fragenfelder.';
  els.acrossClues.classList.add('empty-clue-list');
  els.downClues.classList.add('empty-clue-list');
  setMessages([{ text: 'Zurückgesetzt. Der eingebaute Vollfundus, die importierte Zusatzliste und Dein persönlicher Wortschatz bleiben erhalten.' }]);
}



if (els.saveSeedsToPersonal) {
  els.saveSeedsToPersonal.addEventListener('click', saveSeedWordsToCurrentList);
}

if (els.personalListSelect) {
  els.personalListSelect.addEventListener('change', () => {
    personalDictionary.selectedList = sanitizeListName(els.personalListSelect.value);
    savePersonalDictionary();
    renderPersonalDictionaryUi();
  });
}

if (els.personalCreateList) {
  els.personalCreateList.addEventListener('click', () => {
    const listName = sanitizeListName(els.personalListName.value);
    ensurePersonalList(listName);
    personalDictionary.selectedList = listName;
    els.personalListName.value = '';
    savePersonalDictionary();
    renderPersonalDictionaryUi();
    setMessages([{ type: 'ok', text: `Liste „${listName}“ wurde angelegt oder ausgewählt.` }]);
  });
}

if (els.personalAddWord) {
  els.personalAddWord.addEventListener('click', () => {
    const targetLists = getSelectedPersonalTargetLists();
    const result = upsertPersonalWord(els.personalWordInput.value, targetLists);
    if (!result.ok) {
      setMessages([{ type: 'error', text: result.reason }]);
      return;
    }
    els.personalWordInput.value = '';
    savePersonalDictionary();
    renderPersonalDictionaryUi();
    setMessages([{ type: 'ok', text: `${result.word.original} wurde in ${targetLists.length === 1 ? '„' + targetLists[0] + '“' : 'mehreren Listen'} gespeichert.` }]);
  });
  els.personalWordInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      els.personalAddWord.click();
    }
  });
}

if (els.personalUseList) {
  els.personalUseList.addEventListener('click', useSelectedPersonalList);
}

if (els.personalCreatePuzzleFromList) {
  els.personalCreatePuzzleFromList.addEventListener('click', createPuzzleFromSelectedPersonalList);
}

if (els.personalFile) {
  els.personalFile.addEventListener('change', async () => {
    const file = els.personalFile.files && els.personalFile.files[0];
    if (!file) return;
    try {
      await importPersonalWordFile(file);
    } catch (error) {
      console.error(error);
      setMessages([{ type: 'error', text: 'Die Wortliste konnte nicht importiert werden. Bitte prüfe die Datei.' }]);
    } finally {
      els.personalFile.value = '';
    }
  });
}

if (els.personalSearch) {
  els.personalSearch.addEventListener('input', renderPersonalResults);
}

if (els.personalResults) {
  els.personalResults.addEventListener('click', (event) => {
    const blockButton = event.target.closest('button[data-personal-toggle-block]');
    if (blockButton) {
      const grid = blockButton.dataset.personalToggleBlock;
      const word = personalDictionary.words[grid];
      setPersonalWordBlocked(grid, !(word && word.blocked));
      savePersonalDictionary();
      renderPersonalDictionaryUi();
      renderDictionaryResults();
      setMessages([{ type: 'ok', text: `${grid} wurde ${personalDictionary.words[grid].blocked ? 'gesperrt' : 'freigegeben'}.` }]);
      return;
    }
    const addToListButton = event.target.closest('button[data-personal-add-to-list]');
    if (addToListButton) {
      const grid = addToListButton.dataset.personalAddToList;
      const row = addToListButton.closest('[data-personal-word-grid]');
      const picker = row && row.querySelector('[data-personal-list-target]');
      const listName = picker && picker.value;
      if (!listName) {
        setMessages([{ type: 'error', text: 'Bitte zuerst eine Zielliste auswählen.' }]);
        return;
      }
      addPersonalWordToList(grid, listName);
      savePersonalDictionary();
      renderPersonalDictionaryUi();
      setMessages([{ type: 'ok', text: `${grid} wurde zusätzlich in „${listName}“ gespeichert.` }]);
      return;
    }
    const removeButton = event.target.closest('button[data-personal-remove]');
    if (removeButton) {
      const grid = removeButton.dataset.personalRemove;
      removePersonalWordFromList(grid, personalDictionary.selectedList);
      savePersonalDictionary();
      renderPersonalDictionaryUi();
      setMessages([{ type: 'ok', text: `${grid} wurde aus „${personalDictionary.selectedList}“ entfernt.` }]);
    }
  });
}

if (els.personalExportJson) {
  els.personalExportJson.addEventListener('click', exportPersonalDictionary);
}

if (els.personalImportJson) {
  els.personalImportJson.addEventListener('change', async () => {
    const file = els.personalImportJson.files && els.personalImportJson.files[0];
    if (!file) return;
    try {
      await importPersonalDictionaryJson(file);
    } catch (error) {
      console.error(error);
      setMessages([{ type: 'error', text: 'Der persönliche Wortschatz konnte nicht importiert werden. Bitte prüfe die JSON-Datei.' }]);
    } finally {
      els.personalImportJson.value = '';
    }
  });
}

if (els.safeAddWord) {
  els.safeAddWord.addEventListener('click', () => {
    const result = upsertSafeWord(els.safeWordInput.value, 'manuell', 0);
    if (!result.ok) {
      setMessages([{ type: 'error', text: result.reason }]);
      return;
    }
    els.safeWordInput.value = '';
    saveSafeVocabulary();
    renderSafeVocabularyUi();
    setMessages([{ type: 'ok', text: `${result.word.original} wurde in den gesicherten Wortschatz aufgenommen.` }]);
  });
  els.safeWordInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      els.safeAddWord.click();
    }
  });
}

if (els.safeSearch) {
  els.safeSearch.addEventListener('input', renderSafeVocabularyResults);
}

if (els.dictionaryFile) {
  els.dictionaryFile.addEventListener('change', async () => {
    const file = els.dictionaryFile.files && els.dictionaryFile.files[0];
    if (!file) return;
    try {
      await importDictionaryFile(file);
    } catch (error) {
      console.error(error);
      setMessages([{ type: 'error', text: 'Die Zusatzliste konnte nicht importiert werden. Bitte prüfe die Datei.' }]);
    } finally {
      els.dictionaryFile.value = '';
    }
  });
}

if (els.fillFromDictionary) {
  els.fillFromDictionary.addEventListener('click', fillWordInputFromDictionary);
}

if (els.clearDictionary) {
  els.clearDictionary.addEventListener('click', async () => {
    importedDictionaryState = { entries: [], stats: null, sourceName: '', importedAt: null, ambiguousSample: [] };
    await clearDictionaryFromDb();
    refreshCombinedDictionary();
    updateDictionaryUi();
    saveState();
    setMessages([{ type: 'ok', text: 'Zusatzliste entfernt. Die eingebaute deutsche Vollfundus-Liste bleibt aktiv.' }]);
  });
}

if (els.dictionarySearch) {
  els.dictionarySearch.addEventListener('input', () => {
    renderDictionaryResults();
    saveState();
  });
}

[els.minLength, els.gridWidth, els.gridHeight, els.maxWords, els.wordFormMode, els.nounWeight, els.adjectiveWeight, els.verbWeight, els.otherWeight, els.gridDisplayMode].filter(Boolean).forEach((input) => {
  input.addEventListener('change', () => {
    renderDictionaryResults();
    saveState();
  });
});

if (els.blockedWordsInput) {
  els.blockedWordsInput.addEventListener('input', () => {
    renderDictionaryResults();
    saveState();
  });
}

els.generateButton.addEventListener('click', () => createPuzzle(true));
if (els.exampleButton) els.exampleButton.addEventListener('click', () => {
  els.wordInput.value = examples.join('\n');
  els.seedAcross.value = 'Katalysator';
  els.seedDown.value = 'Kognition';
  saveState();
  setMessages([{ text: 'Testbeispiel wurde geladen: Das Themenfeld enthält Beispielwörter und zwei Leitwörter.' }]);
});
els.resetButton.addEventListener('click', resetState);

[els.acrossList, els.downList].forEach((list) => {
  list.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-block-word]');
    if (!button) return;
    appendBlockedWord(button.dataset.blockWord);
  });
});

els.emptyViewButton.addEventListener('click', () => {
  currentView = 'empty';
  renderPuzzle();
});
els.solutionViewButton.addEventListener('click', () => {
  currentView = 'solution';
  renderPuzzle();
});

[els.cropToContent, els.cellSize, els.gridDisplayMode].filter(Boolean).forEach((input) => input.addEventListener('change', () => {
  saveState();
  renderPuzzle();
}));


els.clueEditor.addEventListener('input', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLTextAreaElement) || !input.matches('textarea[data-clue-key]')) return;
  const key = input.dataset.clueKey;
  clueBank[key] = input.value;
  if (currentPuzzle && currentPuzzle.clues) {
    currentPuzzle.clues[key] = input.value;
  }
  const card = input.closest('.clue-card');
  const status = card ? card.querySelector('.clue-status') : null;
  if (status) {
    const done = input.value.trim().length > 0;
    status.textContent = done ? 'Frage eingetragen' : 'Frage fehlt';
    status.classList.toggle('done', done);
    status.classList.toggle('missing', !done);
  }
  saveState();
});

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

els.exportCluesTxt.addEventListener('click', () => {
  if (!currentPuzzle) return;
  const settings = getSettings();
  clueBank = collectCurrentClues();
  downloadText(`${settings.baseName}_fragen.txt`, buildCluesText(currentPuzzle), 'text/plain;charset=utf-8');
});

els.exportCluesCsv.addEventListener('click', () => {
  if (!currentPuzzle) return;
  const settings = getSettings();
  clueBank = collectCurrentClues();
  downloadText(`${settings.baseName}_fragen.csv`, buildCluesCsv(currentPuzzle), 'text/csv;charset=utf-8');
});

els.exportProjectJson.addEventListener('click', () => {
  if (!currentPuzzle) return;
  const settings = getSettings();
  clueBank = collectCurrentClues();
  if (currentPuzzle) currentPuzzle.clues = Object.fromEntries(currentPuzzle.entries.map((entry) => [getEntryKey(entry), clueBank[getEntryKey(entry)] || '']));
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

loadPersonalDictionary();
loadSafeVocabulary();
loadState();
renderPersonalDictionaryUi();
renderSafeVocabularyUi();
loadDictionaryFromDb().then(() => {
  updateDictionaryUi();
  setMessages([{ text: 'Bereit für v0.5.3. Persönliche Listen bilden die Themenbasis; der deutsche Vollfundus liefert gefilterte Grundformen als Füllmaterial.' }]);
});
