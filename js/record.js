/* ==========================================================
   record.js – Chapter 3: the five M's.
   Each M is a row of the record. Clicking it fills that part.
   When the record is complete, a short drill opens:
   find the missing M, one record at a time.
   ========================================================== */
(function initFiveM() {
  const list = document.getElementById('mList');
  const status = document.getElementById('recordVerdict');
  const drill = document.getElementById('drill');
  const drillItem = document.getElementById('drillItem');
  const added = new Set();
  let builderDone = false;
  let drillIndex = 0;

  const fields = document.getElementById('recFields');
  const meter = document.getElementById('recMeter');

  // The M buttons (side) and the record that fills up (center)
  list.innerHTML = FIVE_M.map((m) => `
    <li>
      <button type="button" class="m-row" aria-pressed="false" data-m="${m.word}" aria-controls="rf-${m.word}">
        <span class="m-word">${m.word}</span>
        <span class="m-q">${m.question}</span>
      </button>
    </li>`).join('');

  fields.innerHTML = FIVE_M.map((m) => `
    <div class="rf" id="rf-${m.word}">
      <dt>${m.word}<span>${m.detail}</span></dt>
      <dd><span class="rf-empty" aria-hidden="true"></span><span class="rf-val">${RECORD_PARTS[m.word]}</span></dd>
    </div>`).join('');

  function renderStatus() {
    const n = added.size;
    meter.style.width = `${(n / FIVE_M.length) * 100}%`;
    if (n === FIVE_M.length) {
      status.innerHTML = `${icon('i-check')} הרשומה מלאה. המחליף יכול להמשיך בלי לשאול אף שאלה.`;
      status.className = 'm-status is-full';
      if (!builderDone) {
        builderDone = true;
        drill.hidden = false;
        drill.classList.add('is-new');
        renderDrill();
      }
    } else {
      status.textContent = n === 0 ? '' : `${n} מתוך 5`;
      status.className = 'm-status';
    }
  }

  list.addEventListener('click', (e) => {
    const row = e.target.closest('.m-row');
    if (!row) return;
    const m = row.dataset.m;
    if (added.has(m)) added.delete(m); else added.add(m);
    row.setAttribute('aria-pressed', String(added.has(m)));
    document.getElementById(`rf-${m}`).classList.toggle('is-filled', added.has(m));
    renderStatus();
  });

  // ---- Drill: one record at a time ----
  function renderDrill() {
    const d = MISSING_M_DRILL[drillIndex];
    drillItem.innerHTML = `
      <p class="drill-count">רשומה ${drillIndex + 1} מתוך ${MISSING_M_DRILL.length}</p>
      <p class="drill-rec">${d.text}</p>
      <div class="drill-opts" role="group" aria-label="איזה מ' חסר ברשומה">
        ${FIVE_M.map((m) => `<button type="button" class="drill-btn" data-m="${m.word}">${m.word}</button>`).join('')}
      </div>
      <div class="drill-fb" aria-live="polite"></div>`;
  }

  drillItem.addEventListener('click', (e) => {
    const next = e.target.closest('.drill-next');
    if (next) {
      drillIndex++;
      renderDrill();
      drillItem.querySelector('.drill-btn').focus();
      return;
    }
    const btn = e.target.closest('.drill-btn');
    if (!btn || btn.disabled) return;
    const d = MISSING_M_DRILL[drillIndex];
    const fb = drillItem.querySelector('.drill-fb');
    if (btn.dataset.m === d.answer) {
      btn.classList.add('is-right');
      drillItem.querySelectorAll('.drill-btn').forEach((b) => { b.disabled = true; });
      const last = drillIndex === MISSING_M_DRILL.length - 1;
      showFeedback(fb, 'correct', `חסר "${d.answer}". ${d.why}`);
      if (!last) {
        fb.insertAdjacentHTML('afterend', `<button type="button" class="btn btn-main drill-next mt-3">לרשומה הבאה ${icon('i-arrow')}</button>`);
        drillItem.querySelector('.drill-next').focus();
      } else if (builderDone) {
        Progress.complete('record');
      }
    } else {
      btn.classList.add('is-wrong');
      btn.disabled = true;
      showFeedback(fb, 'wrong', `"${btn.dataset.m}" כבר מופיע ברשומה. נסו מ' אחר.`);
    }
  });

  renderStatus();
  // Editor mode: show the "which M is missing" drill right away
  if (Progress.editor && !builderDone) { drill.hidden = false; renderDrill(); }
})();
