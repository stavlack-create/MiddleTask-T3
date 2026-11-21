/* ==========================================================
   hero.js – the opening. Noa (the guide) asks the learner to
   answer the ringing desk phone. Answering lifts the handset,
   the phone screen shows the live call, Noa reacts, and
   chapter 1 opens below. Returning learners see the call as
   answered + a "continue" button.
   ========================================================== */
(function initHero() {
  const phone = document.getElementById('deskphone');
  const answer = document.getElementById('heroAnswer');
  const state = document.getElementById('incomingWho');
  const name = document.getElementById('incomingSub');
  const ask = document.getElementById('noaAsk');
  const resume = document.getElementById('heroResume');

  function setAnswered() {
    phone.classList.remove('is-ringing');
    phone.classList.add('is-live');
    state.textContent = 'בשיחה · 00:00';
    name.textContent = '"זה הטלפון היחיד שלי"';
    answer.hidden = true;
    ask.textContent = 'מצוין. עכשיו נראה מה קרה לשיחה הזו אחרי 15:00.';
  }

  answer.addEventListener('click', () => {
    setAnswered();
    let sec = 0;
    const t = setInterval(() => { sec++; state.textContent = `בשיחה · 00:${String(sec).padStart(2, '0')}`; if (sec >= 59) clearInterval(t); }, 1000);
    Progress.completeIntro();
  });

  if (Progress.introDone()) {
    setAnswered();
    state.textContent = 'השיחה הסתיימה';
    name.textContent = 'גב\' לוי · טלפון ביתי';
    ask.textContent = 'ממשיכים מאיפה שעצרתם?';
    resume.hidden = false;
    resume.innerHTML = `${Progress.nextOpenId() === 'finale' ? 'לסיכום הלומדה' : 'ממשיכים מאיפה שעצרתם'} ${icon('i-down')}`;
    resume.addEventListener('click', () => Progress.go(Progress.nextOpenId()));
  }
})();

/* ---------- Dark mode toggle (choice kept in localStorage) ---------- */
(function initTheme() {
  const btn = document.getElementById('themeToggle');
  const root = document.documentElement;
  function sync() {
    const dark = root.dataset.theme === 'dark';
    btn.setAttribute('aria-pressed', String(dark));
    btn.setAttribute('aria-label', dark ? 'מצב בהיר' : 'מצב כהה');
    btn.querySelector('use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
  }
  btn.addEventListener('click', () => {
    if (root.dataset.theme === 'dark') delete root.dataset.theme; else root.dataset.theme = 'dark';
    try { localStorage.setItem('kishurim-theme', root.dataset.theme || 'light'); } catch (e) { /* storage blocked */ }
    sync();
  });
  sync();
})();

/* ---------- Fade-up on scroll for the main blocks of each section ---------- */
(function initReveal() {
  if (REDUCED_MOTION || !('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll('.ch-head, .split-body > .ch-title, .split-body > .ch-lead, .split-media, .flow, .life, .rec-intro, .rec-card, .board, .sim-intro, .app, .ho-side, .sheet, .quiz, .finale-inner');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  targets.forEach((el) => { el.classList.add('reveal'); io.observe(el); });
})();
