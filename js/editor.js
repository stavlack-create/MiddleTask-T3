/* ==========================================================
   editor.js – editor mode (open the page with #editor).
   • All screens are open, no locks, nothing saved.
   • A toolbar: jump to any screen, turn text editing on/off,
     copy a list of every text you changed (old → new),
     undo all edits, leave editor mode.
   Edits are a live preview on this page only: they are not
   saved into the lomda files. "Copy changes" gives a list to
   apply in the source.
   ========================================================== */
(function initEditor() {
  if (!Progress.editor) return;
  document.body.classList.add('is-editor');

  const SCREENS = [{ id: 'top', label: 'מסך פתיחה' }, ...CHAPTERS.map((c, i) => ({ id: c.id, label: `${i + 1}. ${c.label}` })), { id: 'finale', label: 'סיום' }];
  const EDITABLE = [
    '.hero-title', '.hero-lead', '.bubble p', '.ch-title', '.ch-lead', '.sub-title', '.say-bubble', '.life-head p',
    '.moral-main', '.moral-sub', '.flow-name', '.flow-def', '.today li', '.sheet-title', '.sheet-block legend', '.form-label',
    '.tip p', '.sim-title', '.sim-role', '.quiz-q legend', '.q-hint', '.match-row label', '.finale-title', '.recap li', '.drill-rec'
  ].join(',');

  const bar = document.createElement('div');
  bar.className = 'editor-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'סרגל עורך');
  bar.innerHTML = `
    <span class="eb-tag">מצב עורך</span>
    <button type="button" class="eb-btn" id="ebOverview">כל המסכים</button>
    <label class="visually-hidden" for="ebJump">קפיצה למסך</label>
    <select id="ebJump" class="eb-select">${SCREENS.map((s) => `<option value="${s.id}">${s.label}</option>`).join('')}</select>
    <button type="button" class="eb-btn" id="ebEdit" aria-pressed="false">עריכת טקסט</button>
    <button type="button" class="eb-btn" id="ebCopy" disabled>העתקת השינויים <span class="eb-count" id="ebCount">0</span></button>
    <button type="button" class="eb-btn eb-btn--ghost" id="ebUndo" disabled>ביטול כל השינויים</button>
    <button type="button" class="eb-btn eb-btn--ghost" id="ebExit">יציאה</button>`;
  document.body.appendChild(bar);

  const jump = bar.querySelector('#ebJump');
  const editBtn = bar.querySelector('#ebEdit');
  const copyBtn = bar.querySelector('#ebCopy');
  const undoBtn = bar.querySelector('#ebUndo');
  const count = bar.querySelector('#ebCount');
  const originals = new Map(); // element -> original HTML
  let editing = false;

  jump.addEventListener('change', () => {
    const el = document.getElementById(jump.value);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - document.querySelector('.topbar').getBoundingClientRect().bottom - 12;
    window.scrollTo({ top: jump.value === 'top' ? 0 : top, behavior: 'smooth' });
  });

  // Keep the menu in sync with the screen in view
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) jump.value = en.target.id; });
    }, { rootMargin: '-45% 0px -50% 0px' });
    SCREENS.forEach((s) => { const el = document.getElementById(s.id); if (el) io.observe(el); });
  }

  const changed = () => [...originals].filter(([el, html]) => el.innerHTML !== html);
  function refresh() {
    const n = changed().length;
    count.textContent = String(n);
    copyBtn.disabled = n === 0;
    undoBtn.disabled = n === 0;
  }

  function setEditing(on) {
    editing = on;
    editBtn.setAttribute('aria-pressed', String(on));
    editBtn.textContent = on ? 'סיום עריכה' : 'עריכת טקסט';
    document.body.classList.toggle('is-editing', on);
    document.querySelectorAll(EDITABLE).forEach((el) => {
      if (on) {
        if (!originals.has(el)) originals.set(el, el.innerHTML);
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('spellcheck', 'false');
      } else {
        el.removeAttribute('contenteditable');
      }
    });
  }

  editBtn.addEventListener('click', () => setEditing(!editing));
  document.addEventListener('input', (e) => { if (e.target.closest('[contenteditable="true"]')) refresh(); });
  // Clicking edited text inside a label/button must not trigger the activity
  document.addEventListener('click', (e) => { if (editing && e.target.closest('[contenteditable="true"]')) e.preventDefault(); }, true);

  const plain = (html) => { const d = document.createElement('div'); d.innerHTML = html.replace(/<br\s*\/?>/gi, ' / '); return d.textContent.replace(/\s+/g, ' ').trim(); };
  const where = (el) => {
    const sec = el.closest('section');
    const screen = SCREENS.find((s) => sec && s.id === sec.id);
    return screen ? screen.label : 'כללי';
  };

  copyBtn.addEventListener('click', async () => {
    const lines = changed().map(([el, html], i) => `${i + 1}. [${where(el)}]\nלפני: ${plain(html)}\nאחרי: ${plain(el.innerHTML)}`);
    const text = `שינויי טקסט בלומדה (${lines.length}):\n\n${lines.join('\n\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.firstChild.textContent = 'הועתק ';
    } catch (e) {
      // Clipboard blocked: show the text so it can be copied by hand
      const box = document.createElement('textarea');
      box.className = 'eb-out';
      box.value = text;
      document.body.appendChild(box);
      box.select();
      setTimeout(() => box.remove(), 15000);
    }
    setTimeout(() => { copyBtn.firstChild.textContent = 'העתקת השינויים '; }, 1800);
  });

  undoBtn.addEventListener('click', () => {
    originals.forEach((html, el) => { el.innerHTML = html; });
    refresh();
  });

  bar.querySelector('#ebExit').addEventListener('click', () => {
    history.replaceState(null, '', location.pathname + location.search);
    window.location.reload();
  });

  /* ---------- Notes per screen (kept in localStorage) + "copy notes" ---------- */
  const NOTES_KEY = 'kishurim-editor-notes';
  let notes = {};
  try { notes = JSON.parse(localStorage.getItem(NOTES_KEY)) || {}; } catch (e) { notes = {}; }
  const saveNotes = () => { try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch (e) { /* storage blocked */ } };
  const noteCount = () => SCREENS.filter((s) => (notes[s.id] || '').trim()).length;

  SCREENS.forEach((s) => {
    const sec = document.getElementById(s.id);
    if (!sec) return;
    const box = document.createElement('div');
    box.className = 'ed-note';
    box.innerHTML = `
      <label class="ed-note-label" for="note-${s.id}">הערות למסך: ${s.label}</label>
      <textarea class="ed-note-area" id="note-${s.id}" rows="3" placeholder="מה לתקן במסך הזה? (נשמר אוטומטית)"></textarea>`;
    const area = box.querySelector('textarea');
    area.value = notes[s.id] || '';
    area.addEventListener('input', () => {
      notes[s.id] = area.value;
      saveNotes();
      refreshNotes();
    });
    sec.after(box);
  });

  // "Copy notes" button at the top (in the navbar) + the same in the overview header
  const topBtn = document.createElement('button');
  topBtn.type = 'button';
  topBtn.className = 'ed-copy js-copy-notes';
  topBtn.innerHTML = `העתקת הערות <span class="eb-count js-note-count">0</span>`;
  document.querySelector('.topbar').insertBefore(topBtn, document.getElementById('themeToggle'));

  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'eb-btn eb-btn--ghost';
  clearBtn.textContent = 'מחיקת ההערות';
  bar.insertBefore(clearBtn, bar.querySelector('#ebExit'));
  let clearArmed = false;
  clearBtn.addEventListener('click', () => {
    if (!clearArmed) { clearArmed = true; clearBtn.textContent = 'למחוק את כל ההערות? לחצו שוב'; setTimeout(() => { clearArmed = false; clearBtn.textContent = 'מחיקת ההערות'; }, 3000); return; }
    notes = {};
    saveNotes();
    document.querySelectorAll('.ed-note-area').forEach((a) => { a.value = ''; });
    clearArmed = false;
    clearBtn.textContent = 'מחיקת ההערות';
    refreshNotes();
  });

  function refreshNotes() {
    const n = noteCount();
    document.querySelectorAll('.js-note-count').forEach((c) => { c.textContent = String(n); });
    document.querySelectorAll('.js-copy-notes').forEach((b) => { b.disabled = n === 0 && changed().length === 0; });
    clearBtn.disabled = n === 0;
  }

  function buildPrompt() {
    const parts = SCREENS.filter((s) => (notes[s.id] || '').trim()).map((s) => `## ${s.label}\n${notes[s.id].trim()}`);
    const edits = changed().map(([el, html]) => `- [${where(el)}] "${plain(html)}" ← במקום זה: "${plain(el.innerHTML)}"`);
    let text = 'תיקונים ללומדה "מעבירים משמרת ושומרים על הרצף":\n\n';
    if (parts.length) text += `${parts.join('\n\n')}\n`;
    if (edits.length) text += `\n## שינויי טקסט\n${edits.join('\n').replace(/"([^"]*)" ← במקום זה: "([^"]*)"/g, 'במקום "$1" לכתוב "$2"')}\n`;
    return text.trim();
  }

  async function copyNotes(btn) {
    const text = buildPrompt();
    const label = btn.firstChild;
    try {
      await navigator.clipboard.writeText(text);
      label.textContent = 'הועתק! ';
    } catch (e) {
      const box = document.createElement('textarea');
      box.className = 'eb-out';
      box.value = text;
      document.body.appendChild(box);
      box.select();
      setTimeout(() => box.remove(), 20000);
    }
    setTimeout(() => { label.textContent = 'העתקת הערות '; }, 1800);
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.js-copy-notes');
    if (b) copyNotes(b);
  });
  document.addEventListener('input', (e) => { if (e.target.closest('[contenteditable="true"]')) refreshNotes(); });
  refreshNotes();

  /* ---------- Overview: every screen as a live-looking thumbnail ---------- */
  const BASE_W = 1440; // thumbnails are drawn at desktop width, then scaled down
  const layer = document.createElement('div');
  layer.className = 'overview';
  layer.hidden = true;
  layer.setAttribute('role', 'dialog');
  layer.setAttribute('aria-modal', 'true');
  layer.setAttribute('aria-labelledby', 'ovTitle');
  layer.innerHTML = `
    <header class="ov-head">
      <div>
        <h2 class="ov-title" id="ovTitle">כל המסכים</h2>
        <p class="ov-sub">${SCREENS.length} מסכים · לחצו על מסך כדי לעבור אליו ולערוך</p>
      </div>
      <div class="ov-actions">
        <button type="button" class="ed-copy js-copy-notes">העתקת הערות <span class="eb-count js-note-count">0</span></button>
        <button type="button" class="btn btn-main" id="ovClose">לעמוד המלא</button>
      </div>
    </header>
    <ol class="ov-grid" id="ovGrid"></ol>`;
  document.body.appendChild(layer);
  const grid = layer.querySelector('#ovGrid');

  function cloneScreen(id) {
    const src = document.getElementById(id);
    const copy = src.cloneNode(true);
    copy.hidden = false;
    copy.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    copy.removeAttribute('id');
    copy.querySelectorAll('[contenteditable]').forEach((n) => n.removeAttribute('contenteditable'));
    copy.querySelectorAll('[aria-live]').forEach((n) => n.removeAttribute('aria-live'));
    copy.querySelectorAll('.reveal').forEach((n) => n.classList.add('in'));
    copy.classList.remove('is-new');
    return copy;
  }

  function buildOverview() {
    grid.innerHTML = '';
    SCREENS.forEach((s, i) => {
      const li = document.createElement('li');
      li.className = 'ov-card';
      li.innerHTML = `
        <button type="button" class="ov-open" data-id="${s.id}" aria-label="מעבר למסך: ${s.label}">
          <span class="ov-thumb"><span class="ov-canvas" inert></span></span>
          <span class="ov-meta"><span class="ov-num">${i + 1}</span><span class="ov-name">${s.label.replace(/^\d+\.\s*/, '')}</span>${(notes[s.id] || '').trim() ? '<span class="ov-has-note">יש הערה</span>' : ''}<span class="ov-go">מעבר ועריכה ${icon('i-arrow')}</span></span>
        </button>`;
      const canvas = li.querySelector('.ov-canvas');
      canvas.style.width = `${BASE_W}px`;
      canvas.appendChild(cloneScreen(s.id));
      grid.appendChild(li);
    });
    fit();
  }

  function fit() {
    grid.querySelectorAll('.ov-card').forEach((card) => {
      const thumb = card.querySelector('.ov-thumb');
      const canvas = card.querySelector('.ov-canvas');
      const scale = thumb.clientWidth / BASE_W;
      canvas.style.transform = `scale(${scale})`;
      thumb.style.height = `${Math.min(canvas.scrollHeight, 1300) * scale}px`;
    });
  }
  window.addEventListener('resize', () => { if (!layer.hidden) fit(); });

  function openOverview() {
    if (editing) setEditing(false);
    layer.hidden = false;
    document.body.classList.add('is-overview');
    buildOverview();
    refreshNotes();
    layer.scrollTop = 0;
    history.replaceState(null, '', '#overview');
    layer.querySelector('#ovClose').focus();
  }

  function closeOverview(goTo) {
    layer.hidden = true;
    document.body.classList.remove('is-overview');
    grid.innerHTML = '';
    history.replaceState(null, '', '#editor');
    if (goTo) {
      jump.value = goTo;
      jump.dispatchEvent(new Event('change'));
    }
  }

  bar.querySelector('#ebOverview').addEventListener('click', openOverview);
  layer.querySelector('#ovClose').addEventListener('click', () => closeOverview());
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('.ov-open');
    if (b) closeOverview(b.dataset.id);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !layer.hidden) closeOverview(); });

  if (location.hash === '#overview') {
    // wait for fonts/images so the thumbnails measure correctly
    window.addEventListener('load', () => setTimeout(openOverview, 150));
  }
})();
