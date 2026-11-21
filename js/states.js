/* ==========================================================
   states.js – Chapter 2: the three states as a flow diagram.
   One state is shown at a time in a shared detail panel.
   Below: one case through the day on a time slider.
   Completion: moving the clock to the end of the day.
   ========================================================== */
(function initStates() {
  const cols = document.getElementById('stateCols');
  const detail = document.getElementById('stateDetail');

  cols.innerHTML = STATE_CARDS.map((card, i) => {
    const s = STATES[card.state];
    return `${i ? '<span class="flow-arrow" aria-hidden="true"></span>' : ''}
      <button type="button" class="flow-node flow-node--${s.light}" aria-pressed="false" aria-controls="stateDetail" data-state="${card.state}">
        <span class="flow-light" aria-hidden="true"></span>
        <span class="flow-name">${s.label}</span>
        <span class="flow-def">${card.front}</span>
      </button>`;
  }).join('');
  detail.innerHTML = '<p class="flow-empty">בחרו מצב למעלה.</p>';

  cols.addEventListener('click', (e) => {
    const btn = e.target.closest('.flow-node');
    if (!btn) return;
    cols.querySelectorAll('.flow-node').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    const card = STATE_CARDS.find((c) => c.state === btn.dataset.state);
    const s = STATES[card.state];
    detail.className = `flow-detail flow-detail--${s.light} is-swap`;
    detail.innerHTML = `
      <div><p class="fd-label">לדוגמה</p><p class="fd-text">${card.example}</p></div>
      <div><p class="fd-label">מה עושים</p><p class="fd-text">${card.todo}</p></div>`;
  });

  // ---- One case through the day ----
  const range = document.getElementById('lifeRange');
  const ticks = document.getElementById('lifeTicks');
  const out = document.getElementById('lifeLog');
  range.max = String(LIFECYCLE.length - 1);
  // Time chips: click one to jump there (same as dragging the slider)
  const seen = new Set([0]);
  ticks.innerHTML = LIFECYCLE.map((p, n) => `<button type="button" class="life-tick" data-i="${n}" aria-label="${p.time}"><span class="dot dot--${STATES[p.state].light}" aria-hidden="true"></span>${p.time}</button>`).join('');
  ticks.addEventListener('click', (e) => {
    const b = e.target.closest('.life-tick');
    if (!b) return;
    range.value = b.dataset.i;
    update();
  });

  function update() {
    const i = Number(range.value);
    const p = LIFECYCLE[i];
    const owner = p.owner === 'avi'
      ? `<span class="life-owner"><svg class="noa" aria-hidden="true"><use href="#avi"/></svg> מטפל: אבי</span>`
      : `<span class="life-owner"><img class="noa" src="assets/img/noa.jpg" alt="" width="28" height="28"> מטפלת: נועה</span>`;
    out.innerHTML = `
      <span class="life-top"><span class="life-time">${p.time}</span>${stateWord(p.state)}${owner}</span>
      <span class="life-title">${p.title}</span>
      <span class="life-text">${p.text}</span>
      <span class="life-why">${p.why}</span>`;
    out.classList.remove('is-swap'); void out.offsetWidth; out.classList.add('is-swap');
    out.dataset.light = STATES[p.state].light;
    range.setAttribute('aria-valuetext', `${p.time}, ${STATES[p.state].label}, ${p.owner === 'avi' ? 'אצל אבי' : 'אצל נועה'}`);
    range.style.setProperty('--fill', `${(i / (LIFECYCLE.length - 1)) * 100}%`);
    seen.add(i);
    ticks.querySelectorAll('.life-tick').forEach((t, n) => {
      t.classList.toggle('is-active', n === i);
      t.classList.toggle('is-seen', seen.has(n) && n !== i);
      t.classList.toggle('is-next', n === i + 1);
      t.setAttribute('aria-pressed', String(n === i));
    });
    if (i === LIFECYCLE.length - 1) Progress.complete('states');
  }
  range.addEventListener('input', update);
  update();
})();
