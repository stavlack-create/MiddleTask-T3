/* ==========================================================
   scenarios.js – Chapter 5: four moments in the call center.
   Messages arrive one by one, the learner picks an action,
   the consequence appears, and customer trust goes up or down.
   ========================================================== */
(function initSim() {
  const thread = document.getElementById('simThread');
  const optionsWrap = document.getElementById('simOptionsWrap');
  const options = document.getElementById('simOptions');
  const question = document.getElementById('simQuestion');
  const fbBox = document.getElementById('simFeedback');
  const startBtn = document.getElementById('simStart');
  const nextBtn = document.getElementById('simNext');
  const restartBtn = document.getElementById('simRestart');
  const count = document.getElementById('simCount');
  const trustText = document.getElementById('kpiTrust');
  const trustBar = document.getElementById('kpiTrustBar');

  const START_TRUST = 70;
  let current = 0;
  let trust = START_TRUST;
  let correct = 0;
  let busy = false;

  async function addMessage(m, time) {
    await wait(550);
    const tone = m.kind === 'alert' ? ' ev--alert' : m.kind === 'ok' ? ' ev--ok' : '';
    thread.insertAdjacentHTML('beforeend', `
      <li class="ev${tone}${m.mine ? ' ev--mine' : ''}">
        <span class="ev-time">${time}</span>
        <div><p class="ev-who">${m.who}</p><p class="ev-text">${m.text}</p></div>
      </li>`);
    const li = thread.lastElementChild;
    requestAnimationFrame(() => li.classList.add('is-in'));
  }

  function setTrust(value) {
    trust = Math.max(0, Math.min(100, value));
    trustText.textContent = `${trust}%`;
    trustBar.style.width = `${trust}%`;
    trustBar.dataset.level = trust >= 70 ? 'good' : trust >= 45 ? 'mid' : 'low';
  }

  async function runScenario(index) {
    busy = true;
    current = index;
    const s = SCENARIOS[index];
    thread.innerHTML = '';
    clearFeedback(fbBox);
    optionsWrap.hidden = true;
    nextBtn.hidden = true;
    restartBtn.hidden = true;
    count.textContent = `רגע ${index + 1} מתוך ${SCENARIOS.length}`;
    document.getElementById('simTitle').textContent = s.title;
    document.getElementById('simRole').textContent = `${s.role} · ${s.time}`;

    for (const m of s.messages) await addMessage(m, s.time);

    question.textContent = s.question;
    options.innerHTML = s.options.map((o, i) => `<button type="button" class="option" data-i="${i}">${o.text}</button>`).join('');
    optionsWrap.hidden = false;
    options.querySelector('.option').focus({ preventScroll: true });
    busy = false;
  }

  options.addEventListener('click', async (e) => {
    const btn = e.target.closest('.option');
    if (!btn || busy) return;
    busy = true;
    const s = SCENARIOS[current];
    const opt = s.options[Number(btn.dataset.i)];
    const best = s.options.find((o) => o.result === 'correct');

    options.querySelectorAll('.option').forEach((b) => {
      b.disabled = true;
      if (b === btn) b.classList.add(`is-${opt.result}`);
      else if (s.options[Number(b.dataset.i)].result === 'correct') b.classList.add('is-correct', 'is-hint');
      else b.classList.add('is-dim');
    });

    if (opt.result === 'correct') correct++;
    setTrust(trust + opt.trust);
    await addMessage(opt.reply, s.time);

    showFeedback(fbBox, opt.result, opt.result === 'correct'
      ? opt.feedback
      : `${opt.feedback} <br><b>הפעולה הנכונה:</b> ${best.text}`);

    if (current < SCENARIOS.length - 1) {
      nextBtn.hidden = false;
      nextBtn.focus({ preventScroll: true });
    } else {
      finish();
    }
    busy = false;
  });

  function finish() {
    count.textContent = `${correct} מתוך ${SCENARIOS.length} החלטות נכונות`;
    fbBox.insertAdjacentHTML('beforeend', `<p class="sim-end">${correct === SCENARIOS.length
      ? 'משמרת מצוינת: הדחוף טופל קודם, וכל פנייה פתוחה עברה עם מה שצריך.'
      : correct >= 2
        ? 'משמרת סבירה. שימו לב לרגעים שבהם האמון ירד.'
        : 'הלקוחות הרגישו את זה. נסו שוב, ושימו לב מה דחוף עכשיו.'}</p>`);
    restartBtn.hidden = false;
    Progress.complete('sim');
  }

  function restart() {
    correct = 0;
    setTrust(START_TRUST);
    runScenario(0);
  }

  startBtn.addEventListener('click', () => { startBtn.hidden = true; restart(); });
  nextBtn.addEventListener('click', () => { if (!busy) runScenario(current + 1); });
  restartBtn.addEventListener('click', () => { if (!busy) restart(); });
  setTrust(START_TRUST);
})();
