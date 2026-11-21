/* ==========================================================
   sort.js – Chapter 4: sort the cases into state lanes.
   Three ways to move a case:
   1. The state buttons on every case (main way, also on mobile)
   2. Drag (pointer events = mouse AND touch, from the handle)
   3. Keyboard: focus a case and press 1 / 2 / 3
   One attempt: each case is placed once. When all are placed,
   every case shows right/wrong + why, and the chapter completes.
   ========================================================== */
(function initSort() {
  const pool = document.getElementById('sortPool');
  const zonesWrap = document.getElementById('sortZones');
  const feedback = document.getElementById('sortFeedback');
  const live = document.getElementById('sortLive');
  const stateKeys = Object.keys(STATES);
  const DRAG_THRESHOLD = 6;
  const HINTS = {
    urgent: 'מה יקרה אם אף אחד לא יטפל בזה בשעה הקרובה?',
    open: 'יש עוד מה לעשות, אבל לא חייבים בשעה הקרובה.',
    done: 'האם נשאר משהו לעשות בפנייה הזו?'
  };

  zonesWrap.innerHTML = stateKeys.map((key) => `
    <div class="lane lane--${STATES[key].light}" data-zone="${key}">
      <h3 class="lane-title">${stateWord(key)}</h3>
      <ul class="sort-list" aria-label="פניות במצב ${STATES[key].label}"></ul>
    </div>`).join('');

  function buildCards() {
    pool.innerHTML = '';
    zonesWrap.querySelectorAll('.sort-list').forEach((l) => (l.innerHTML = ''));
    clearFeedback(feedback);
    SORT_CARDS.forEach((card) => {
      const li = document.createElement('li');
      li.className = 'sort-card';
      li.tabIndex = 0;
      li.dataset.id = card.id;
      li.dataset.placed = '';
      li.setAttribute('aria-describedby', 'sortKbdHint');
      li.innerHTML = `
        <span class="sort-grip" title="גרירה">${icon('i-grip')}</span>
        <span class="sort-body">
          <span class="sort-text">${card.text}</span>
          <span class="sort-result"></span>
          <span class="sort-actions" role="group" aria-label="בחירת מצב">
            ${stateKeys.map((k) => `<button type="button" class="sort-to sort-to--${STATES[k].light}" data-to="${k}"><span class="visually-hidden">העברה ל</span>${STATES[k].label}</button>`).join('')}
          </span>
        </span>`;
      pool.appendChild(li);
      label(li);
    });
  }

  function label(card) {
    const zone = card.dataset.placed;
    card.setAttribute('aria-label', `${card.querySelector('.sort-text').textContent} – ${zone ? 'במצב ' + STATES[zone].label : 'לא מוין'}`);
    card.querySelectorAll('.sort-to').forEach((b) => { b.hidden = b.dataset.to === zone; });
  }

  /* One attempt only: a case can be placed once (from the pool into a lane)
     and then stays there. Results are revealed only when all cases are
     placed – right or wrong, the chapter is then completed. */
  let revealed = false;
  function moveCard(card, zoneKey) {
    if (revealed || !zoneKey || card.dataset.placed) return;
    const list = zonesWrap.querySelector(`[data-zone="${zoneKey}"] .sort-list`);
    list.appendChild(card);
    card.dataset.placed = zoneKey;
    card.classList.add('is-placed');
    card.removeAttribute('tabindex');
    live.textContent = `הפנייה הועברה ל${STATES[zoneKey].label}.`;
    label(card);
    if (pool.querySelectorAll('.sort-card').length === 0) reveal(true);
  }

  // Shows right/wrong on every card + a summary, then completes the chapter
  function reveal(complete) {
    revealed = true;
    let correct = 0;
    SORT_CARDS.forEach((d) => {
      const card = document.querySelector(`.sort-card[data-id="${d.id}"]`);
      const ok = card.dataset.placed === d.answer;
      if (ok) correct++;
      card.classList.add(ok ? 'is-correct' : 'is-wrong');
      card.querySelector('.sort-result').innerHTML = ok
        ? `${icon('i-check')} ${d.why}`
        : `${icon('i-x')} המצב הנכון: <b>${STATES[d.answer].label}</b>. ${d.why}`;
    });
    clearFeedback(feedback);
    const n = SORT_CARDS.length;
    if (correct === n) showFeedback(feedback, 'correct', `כל ${n} הפניות במקום. עכשיו המחליף יודע במה לטפל קודם.`);
    else if (correct > 0) showFeedback(feedback, 'partial', `${correct} מתוך ${n} נכונות. עברו על הפניות המסומנות באדום וראו מה המצב הנכון שלהן.`);
    else showFeedback(feedback, 'wrong', `אף פנייה לא מוינה נכון. עברו על ההסברים בכל פנייה: השאלה המכרעת היא מה יקרה אם לא יטפלו בה בשעה הקרובה.`);
    if (complete) Progress.complete('practice');
  }

  function summary() {}

  // ---- Buttons ----
  document.getElementById('practice').addEventListener('click', (e) => {
    const btn = e.target.closest('.sort-to');
    if (!btn) return;
    const card = btn.closest('.sort-card');
    moveCard(card, btn.dataset.to);
    card.focus({ preventScroll: true });
  });

  // ---- Pointer dragging (mouse + touch) ----
  let drag = null;
  document.addEventListener('pointerdown', (e) => {
    const card = e.target.closest('.sort-card');
    if (!card || card.dataset.placed || revealed || e.button > 0 || e.target.closest('button')) return;
    drag = { card, startX: e.clientX, startY: e.clientY, ghost: null };
    card.setPointerCapture(e.pointerId);
  });

  document.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (!drag.ghost && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < DRAG_THRESHOLD) return;
    if (!drag.ghost) {
      const rect = drag.card.getBoundingClientRect();
      drag.ghost = drag.card.cloneNode(true);
      drag.ghost.classList.add('sort-ghost');
      drag.ghost.removeAttribute('tabindex');
      drag.ghost.setAttribute('aria-hidden', 'true');
      drag.ghost.style.width = `${rect.width}px`;
      drag.offsetX = drag.startX - rect.left;
      drag.offsetY = drag.startY - rect.top;
      document.body.appendChild(drag.ghost);
      drag.card.classList.add('is-dragging');
    }
    drag.ghost.style.transform = `translate(${e.clientX - drag.offsetX}px, ${e.clientY - drag.offsetY}px)`;
    const zone = zoneAt(e.clientX, e.clientY);
    document.querySelectorAll('[data-zone]').forEach((z) => z.classList.toggle('is-over', z === zone));
  });

  function endDrag(e, cancelled) {
    if (!drag) return;
    if (drag.ghost) {
      const zone = cancelled ? null : zoneAt(e.clientX, e.clientY);
      drag.ghost.remove();
      drag.card.classList.remove('is-dragging');
      document.querySelectorAll('[data-zone]').forEach((z) => z.classList.remove('is-over'));
      if (zone) moveCard(drag.card, zone.dataset.zone === 'pool' ? '' : zone.dataset.zone);
    }
    drag = null;
  }
  document.addEventListener('pointerup', (e) => endDrag(e, false));
  document.addEventListener('pointercancel', (e) => endDrag(e, true));

  function zoneAt(x, y) {
    const el = document.elementFromPoint(x, y);
    return el ? el.closest('[data-zone]') : null;
  }

  // ---- Keyboard alternative ----
  document.addEventListener('keydown', (e) => {
    if (!e.target.classList || !e.target.classList.contains('sort-card')) return;
    const key = stateKeys.find((k) => STATES[k].key === e.key);
    if (key) {
      e.preventDefault();
      moveCard(e.target, key);
      e.target.focus();
    }
  });

  const resetBtn = document.getElementById('sortReset');
  resetBtn.hidden = !Progress.editor; // one attempt: restart only in editor mode
  resetBtn.addEventListener('click', () => { revealed = false; buildCards(); });
  buildCards();

  // Returning learner who already did the exercise: show the correct sorting
  if (Progress.isDone('practice') && !Progress.editor) {
    SORT_CARDS.forEach((d) => {
      const card = document.querySelector(`.sort-card[data-id="${d.id}"]`);
      zonesWrap.querySelector(`[data-zone="${d.answer}"] .sort-list`).appendChild(card);
      card.dataset.placed = d.answer;
      card.classList.add('is-placed');
      card.removeAttribute('tabindex');
    });
    reveal(false);
    clearFeedback(feedback);
    showFeedback(feedback, 'correct', 'כבר ביצעתם את התרגול. כך נראה המיון הנכון.');
  }
})();
