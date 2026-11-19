// Leonida Trophy Guide — offline tracker for all 55 GTA VI PS5 trophies.
// Data lives in data/trophies.json; progress lives only in this browser.
const EARNED_KEY = 'gta6-trophy-guide-earned-v1';
const SPOILER_KEY = 'gta6-trophy-guide-spoiler-v1';

const $ = (id) => document.getElementById(id);
const cardsEl = $('cards');
const params = new URLSearchParams(location.search);

let doc;
try {
  doc = await (await fetch('data/trophies.json')).json();
} catch (e) {
  cardsEl.innerHTML = '<p class="empty-state">Could not load the trophy data. Open this page from the app folder (or run node serve.ts) — it does not work from file:// in some browsers.</p>';
  throw e;
}
const trophies = doc.trophies;

let earned = new Set();
try { earned = new Set(JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]').filter((n) => Number.isInteger(n))); } catch { earned = new Set(); }
// Demo mode (?demo=1) seeds a representative set of earned trophies so screenshots
// show the tracker with real progress. Only used for screenshots, never by default.
if (params.get('demo') === '1' && earned.size === 0) {
  earned = new Set([2, 3, 4, 8, 9, 15, 16, 19, 21, 28, 35, 42, 44, 46, 53]);
}
let spoiler = localStorage.getItem(SPOILER_KEY) === '1' || params.get('spoiler') === '1';

const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
const KIND_LABEL = { story: 'Story', side: 'Side strand', activity: 'Activity', collectible: 'Collectible', combat: 'Combat & crime', misc: 'Misc', platinum: 'Platinum' };
const ROADMAP = [
  { n: 1, title: 'Story first', text: 'Play the story through. Nothing here needs a guide — just follow the gold markers.', steps: ['Chapters 1–4 and the finale', 'Mission trophies: Breakfast Run, Cartel Heist, VCIA Takedown…', 'Unlocks the map and every strand'], ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] },
  { n: 2, title: 'Grinds, started early', text: 'The long counts. Start them in Phase 1 and chip away between missions.', steps: ['250 stunts · 100 vehicles discovered', '100 WAiNK photos · 50 challenges', '$250k laundered · $100k spent'], ids: [15, 19, 31, 32, 35, 52, 53] },
  { n: 3, title: 'Side strands & activities', text: 'Character strands, strangers and the activity list — the heart of the guide.', steps: ['Andy, Kenton, Billy, Randy, Tyrone finales', '8 stranger strands · Bret’s hunt', 'Gold all 42 Shooting Range challenges'], ids: [16, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 46] },
  { n: 4, title: 'Cleanup & collectibles', text: 'Everything left: collectibles, combat feats, exploration and the random moments.', steps: ['3 card sets · all 52 areas · 8 garages', 'Bank vaults, armored truck, gang operations', '100% completion, then the platinum'], ids: [14, 30, 33, 34, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47, 48, 49, 50, 51, 54, 55] },
];

function save() { localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b))); }
function isHidden(t) { return spoiler && t.kind === 'story' && !earned.has(t.id); }

function renderProgress() {
  const total = trophies.length;
  const n = earned.size;
  const pct = Math.round((n / total) * 100);
  $('progressText').textContent = `${n} of ${total} earned · ${pct}% to platinum`;
  $('progressFill').style.width = `${pct}%`;
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const tot = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    return `${g} ${got}/${tot}`;
  }).join(' · ');
  $('gradeCounts').textContent = counts;
}

function renderRoadmap() {
  $('roadmapPhases').replaceChildren();
  for (const phase of ROADMAP) {
    const div = document.createElement('div');
    div.className = 'phase';
    const done = phase.ids.filter((id) => earned.has(id)).length;
    const h = document.createElement('h3');
    h.innerHTML = `<span class="phase-num">${phase.n}</span>${phase.title} <span style="color:var(--ink-faint);font-size:14px">(${done}/${phase.ids.length})</span>`;
    div.append(h);
    const p = document.createElement('p');
    p.textContent = phase.text;
    div.append(p);
    const ul = document.createElement('ul');
    for (const s of phase.steps) {
      const li = document.createElement('li');
      li.textContent = s;
      ul.append(li);
    }
    div.append(ul);
    $('roadmapPhases').append(div);
  }
}

function visibleTrophies() {
  const q = $('search').value.trim().toLowerCase();
  const grade = $('gradeFilter').value;
  const kind = $('kindFilter').value;
  const sort = $('sortFilter').value;
  let list = trophies.filter((t) => {
    if (grade !== 'all' && t.grade !== grade) return false;
    if (kind !== 'all' && t.kind !== kind) return false;
    if ($('earnedOnly').checked && !earned.has(t.id)) return false;
    if ($('missableOnly').checked && !t.missable) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide + ' ' + KIND_LABEL[t.kind]).toLowerCase().includes(q)) return false;
    return true;
  });
  if (sort === 'grade') list = [...list].sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id);
  else if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  else list = [...list].sort((a, b) => a.id - b.id);
  return list;
}

function cardFor(t) {
  const hidden = isHidden(t);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'card' + (earned.has(t.id) ? ' earned' : '') + (hidden ? ' hidden-spoiler' : '');
  btn.dataset.id = t.id;
  const check = document.createElement('span');
  check.className = 'card-check';
  check.textContent = '✓';
  check.setAttribute('aria-hidden', 'true');
  const body = document.createElement('div');
  body.className = 'card-body';
  const top = document.createElement('div');
  top.className = 'card-top';
  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${t.grade}`;
  badge.textContent = t.grade;
  top.append(badge);
  if (t.kind !== 'platinum') {
    const kind = document.createElement('span');
    kind.className = 'kind-tag';
    kind.textContent = KIND_LABEL[t.kind] ?? t.kind;
    top.append(kind);
  }
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'missable-badge';
    m.textContent = 'Missable';
    top.append(m);
  }
  body.append(top);
  const h = document.createElement('h3');
  h.textContent = hidden ? 'Story trophy — hidden' : t.name;
  body.append(h);
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = hidden ? 'Spoiler-safe mode is on. Earn it (or turn the setting off) to reveal it.' : t.description;
  body.append(desc);
  if (!hidden) {
    const guide = document.createElement('p');
    guide.className = 'guide-preview';
    guide.textContent = t.guide;
    body.append(guide);
    const src = document.createElement('p');
    src.className = 'sources';
    src.textContent = 'Sources: ' + t.sources.join(' · ');
    body.append(src);
  }
  btn.append(check, body);
  btn.addEventListener('click', (e) => {
    if (e.target === check) return;
    openDetail(t);
  });
  check.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleEarned(t.id);
  });
  return btn;
}

function renderCards() {
  const list = visibleTrophies();
  cardsEl.replaceChildren();
  for (const t of list) cardsEl.append(cardFor(t));
  $('emptyState').hidden = list.length > 0;
  $('resultCount').textContent = `Showing ${list.length} of ${trophies.length} trophies` + (earned.size ? ` · ${earned.size} earned` : '');
}

function render() { renderProgress(); renderRoadmap(); renderCards(); }

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id); else earned.add(id);
  save();
  render();
}

function openDetail(t) {
  const hidden = isHidden(t);
  const body = $('detailBody');
  body.replaceChildren();
  const top = document.createElement('div');
  top.className = 'card-top';
  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${t.grade}`;
  badge.textContent = t.grade;
  top.append(badge);
  if (t.kind !== 'platinum') {
    const kind = document.createElement('span');
    kind.className = 'kind-tag';
    kind.textContent = KIND_LABEL[t.kind] ?? t.kind;
    top.append(kind);
  }
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'missable-badge';
    m.textContent = 'Missable';
    top.append(m);
  }
  body.append(top);
  const h = document.createElement('h2');
  h.id = 'detailTitle';
  h.textContent = hidden ? 'Story trophy — hidden' : t.name;
  body.append(h);
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = hidden ? 'Spoiler-safe mode is on. Earn it (or turn the setting off) to reveal it.' : t.description;
  body.append(desc);
  if (!hidden) {
    const guide = document.createElement('p');
    guide.className = 'guide-full';
    guide.textContent = t.guide;
    body.append(guide);
    if (t.missable && t.missableNote) {
      const note = document.createElement('p');
      note.className = 'missable-note';
      note.textContent = 'Missable: ' + t.missableNote;
      body.append(note);
    }
    const src = document.createElement('p');
    src.className = 'sources';
    src.textContent = 'Sources: ' + t.sources.join(' · ');
    body.append(src);
  }
  const actions = document.createElement('div');
  actions.className = 'modal-actions';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'earned-btn';
  toggle.textContent = earned.has(t.id) ? '✓ Earned — mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => { toggleEarned(t.id); closeDetail(); });
  actions.append(toggle);
  body.append(actions);
  $('detailModal').hidden = false;
}
function closeDetail() { $('detailModal').hidden = true; }
$('detailClose').addEventListener('click', closeDetail);
$('detailModal').addEventListener('click', (e) => { if (e.target === $('detailModal')) closeDetail(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });

// Controls
for (const id of ['search', 'gradeFilter', 'kindFilter', 'sortFilter', 'earnedOnly', 'missableOnly']) {
  $(id).addEventListener('input', renderCards);
}
$('spoilerToggle').checked = spoiler;
$('spoilerToggle').addEventListener('change', (e) => {
  spoiler = e.target.checked;
  localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0');
  renderCards();
});
$('exportBtn').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = new Set(trophies.map((t) => t.id));
    const next = new Set((ids ?? []).filter((n) => valid.has(n)));
    earned = next;
    save();
    render();
    alert(`Imported ${next.size} earned trophies.`);
  } catch {
    alert('That file could not be read as trophy progress.');
  }
  e.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned trophies? This cannot be undone (export first if you want a backup).')) {
    earned = new Set();
    save();
    render();
  }
});

// URL params for deep links (and screenshots) — applied before the first render
// so filtered views actually render filtered.
if (params.get('grade')) $('gradeFilter').value = params.get('grade');
if (params.get('kind')) $('kindFilter').value = params.get('kind');
if (params.get('sort')) $('sortFilter').value = params.get('sort');

render();
if (params.get('view') === 'roadmap') $('roadmap').scrollIntoView();
if (params.get('view') === 'cards') document.querySelector('.controls').scrollIntoView();
const detailId = Number(params.get('detail'));
if (detailId) {
  const t = trophies.find((x) => x.id === detailId);
  if (t) openDetail(t);
}
document.fonts?.ready?.then(() => { window.__shotReady = true; });
window.__shotReady = true;
