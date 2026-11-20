/* ==========================================================
   sort.js – Chapter 4: drag cases into traffic-light zones.
   Pointer events = works with mouse AND touch.
   Keyboard alternative: focus a card and press 1 / 2 / 3.
   ========================================================== */
(function initSort() {
  const pool = document.getElementById('sortPool');
  const zonesWrap = document.getElementById('sortZones');
  const feedback = document.getElementById('sortFeedback');
  const stateKeys = Object.keys(STATES);
  const DRAG_THRESHOLD = 6;

  // Build the three zones
  zonesWrap.innerHTML = stateKeys.map((key) => `
    <div class="col-md-4">
      <div class="sort-zone sort-zone--${STATES[key].light}" data-zone="${key}">
        <h3 class="zone-title">${lamp(STATES[key].light)} ${STATES[key].label}</h3>
        <ul class="sort-list" aria-label="פניות במצב ${STATES[key].label}"></ul>
      </div>
    </div>`).join('');

  // Build the cards
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
      li.innerHTML = `<span class="sort-grip">${icon('i-grip')}</span>
        <span class="sort-card-body"><span class="sort-card-text">${card.text}</span>
        <span class="sort-card-result"></span></span>`;
      pool.appendChild(li);
    });
  }

  // Moves a card into a zone (or back to the pool)
  function moveCard(card, zoneKey) {
    const list = zoneKey ? zonesWrap.querySelector(`[data-zone="${zoneKey}"] .sort-list`) : pool;
    list.appendChild(card);
    card.dataset.placed = zoneKey || '';
    card.classList.remove('is-correct', 'is-wrong');
    card.querySelector('.sort-card-result').textContent = '';
    card.setAttribute('aria-label', `${card.querySelector('.sort-card-text').textContent} – ${zoneKey ? 'הועבר ל' + STATES[zoneKey].label : 'לא מוין'}`);
  }

  // ---- Pointer dragging (mouse + touch) ----
  let drag = null;

  document.addEventListener('pointerdown', (e) => {
    const card = e.target.closest('.sort-card');
    if (!card || e.button > 0) return;
    drag = { card, startX: e.clientX, startY: e.clientY, ghost: null };
    card.setPointerCapture(e.pointerId);
  });

  document.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.ghost && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    if (!drag.ghost) {
      const rect = drag.card.getBoundingClientRect();
      drag.ghost = drag.card.cloneNode(true);
      drag.ghost.classList.add('sort-ghost');
      drag.ghost.style.width = `${rect.width}px`;
      drag.offsetX = drag.startX - rect.left;
      drag.offsetY = drag.startY - rect.top;
      document.body.appendChild(drag.ghost);
      drag.card.classList.add('is-dragging');
    }
    drag.ghost.style.transform = `translate(${e.clientX - drag.offsetX}px, ${e.clientY - drag.offsetY}px)`;

    // Highlight the zone under the pointer
    const zone = zoneAt(e.clientX, e.clientY);
    document.querySelectorAll('[data-zone]').forEach((z) => z.classList.toggle('is-over', z === zone));
  });

  document.addEventListener('pointerup', (e) => {
    if (!drag) return;
    if (drag.ghost) {
      const zone = zoneAt(e.clientX, e.clientY);
      drag.ghost.remove();
      drag.card.classList.remove('is-dragging');
      document.querySelectorAll('[data-zone]').forEach((z) => z.classList.remove('is-over'));
      if (zone) moveCard(drag.card, zone.dataset.zone === 'pool' ? '' : zone.dataset.zone);
    }
    drag = null;
  });

  // Finds the drop zone under a point (the ghost is ignored by CSS pointer-events)
  function zoneAt(x, y) {
    const el = document.elementFromPoint(x, y);
    return el ? el.closest('[data-zone]') : null;
  }

  // ---- Keyboard alternative ----
  document.addEventListener('keydown', (e) => {
    const card = e.target.closest && e.target.closest('.sort-card');
    if (!card) return;
    const key = stateKeys.find((k) => STATES[k].key === e.key);
    if (key) {
      e.preventDefault();
      moveCard(card, key);
      card.focus();
    }
  });

  // ---- Check ----
  document.getElementById('sortCheck').addEventListener('click', () => {
    const left = pool.querySelectorAll('.sort-card').length;
    if (left > 0) {
      showFeedback(feedback, 'missing', `נשארו עוד ${left} פניות שלא מוינו. גררו את כולן ונסו שוב.`);
      return;
    }
    let correct = 0;
    SORT_CARDS.forEach((data) => {
      const card = document.querySelector(`.sort-card[data-id="${data.id}"]`);
      const ok = card.dataset.placed === data.answer;
      if (ok) correct++;
      card.classList.toggle('is-correct', ok);
      card.classList.toggle('is-wrong', !ok);
      card.querySelector('.sort-card-result').innerHTML = ok
        ? `נכון. ${data.why}`
        : `זה ${STATES[data.answer].label}: ${data.why}`;
    });

    if (correct === SORT_CARDS.length) {
      showFeedback(feedback, 'correct', 'כל הפניות במקום. עכשיו המחליף יודע במה לטפל קודם.');
    } else if (correct > 0) {
      showFeedback(feedback, 'partial', `${correct} מתוך ${SORT_CARDS.length} במקום. קראו את ההסבר בכרטיסים המסומנים והעבירו אותם.`);
    } else {
      showFeedback(feedback, 'wrong', 'אף פנייה לא במקום. שאלו את עצמכם: מה יקרה אם לא יטפלו בזה בשעה הקרובה?');
    }
  });

  document.getElementById('sortReset').addEventListener('click', buildCards);
  buildCards();
})();
