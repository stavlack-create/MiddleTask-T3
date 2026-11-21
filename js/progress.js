/* ==========================================================
   progress.js – the one-pager grows as the learner advances.
   Gate 0 is the hero (answering the first call). After that,
   each chapter calls Progress.complete('<id>') when its
   completion condition is met. Then:
     1. a short "done" line + toast appear,
     2. the next chapter is revealed with a soft animation,
     3. the page scrolls smoothly to it (only the first time).
   No "continue" buttons. Finished chapters stay on the page.
   Everything is kept in localStorage.
   ========================================================== */
const Progress = (function () {
  const KEY = 'kishurim-lomda-progress';
  const KEY_INTRO = 'kishurim-lomda-intro';
  const DONE_TEXT = {
    story: 'ראיתם מה קורה כשפרט אחד לא עובר. עכשיו נלמד איך מונעים את זה.',
    states: 'דחוף, פתוח או הסתיים, והמצב תלוי בשעה.',
    record: 'מי, מה, מצב, מתי, משימה. הרשומה עונה על הכול.',
    practice: 'סיימתם את המיון. בכל פנייה מופיע ההסבר למצב הנכון.',
    sim: 'עברתם ארבעה רגעים אמיתיים מהמוקד.',
    handover: 'הדף ברור, ואבי יודע במה להתחיל ועד מתי.',
    quiz: 'סיימתם את הלומדה.'
  };
  // Time to read the feedback before the next part opens (longer where the result matters)
  const REVEAL_DELAY = { practice: 4500, handover: 2200 };

  const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch (e) { return fallback; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } };

  /* Editor mode (address ends with #editor, or #overview for the all-screens view): every screen is open, nothing is locked,
     nothing is saved and nothing scrolls by itself. */
  const EDITOR = location.hash === '#editor' || location.hash === '#overview';
  const ids = CHAPTERS.map((c) => c.id);
  const done = new Set(read(KEY, []).filter((id) => ids.includes(id)));
  let intro = Boolean(read(KEY_INTRO, false)) || done.size > 0;

  /* Index of the furthest chapter that may be on the page (-1 = none) */
  const openUntil = () => {
    if (!intro) return -1;
    const i = ids.findIndex((id) => !done.has(id));
    return i === -1 ? ids.length - 1 : i;
  };
  const canOpen = (id) => EDITOR || ids.indexOf(id) <= openUntil();
  const allDone = () => EDITOR || done.size === ids.length;
  const nextOpenId = () => (allDone() ? 'finale' : ids[openUntil()]);

  /* ---- Top navigation: numbered steps, current chapter expands with its name ---- */
  let currentId = null;
  function renderSteps() {
    const list = document.getElementById('steps');
    list.innerHTML = CHAPTERS.map((c, i) => {
      const state = done.has(c.id) ? 'done' : canOpen(c.id) ? 'open' : 'locked';
      const sr = state === 'done' ? 'הושלם' : state === 'locked' ? 'נעול' : 'בתהליך';
      return `<li><button type="button" class="step step--${state}" data-go="${c.id}" ${state === 'locked' ? 'disabled' : ''}
        aria-label="פרק ${i + 1}: ${c.label} (${sr})">
        ${state === 'done' ? icon('i-check') : ''}<span aria-hidden="true">${c.label}</span></button></li>`;
    }).join('');
    document.getElementById('footerReset').hidden = !intro;
    setCurrent(currentId, true);
  }

  /* Marks the chapter that is in view right now */
  function setCurrent(id, force) {
    if (id === currentId && !force) return;
    currentId = id;
    document.querySelectorAll('#steps .step').forEach((b) => {
      const on = b.dataset.go === id;
      b.classList.toggle('is-current', on);
      if (on) {
        b.setAttribute('aria-current', 'step');
        const list = b.closest('.steps');
        if (list.scrollWidth > list.clientWidth) list.scrollTo({ left: b.offsetLeft - (list.clientWidth - b.offsetWidth) / 2, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
      } else b.removeAttribute('aria-current');
    });
  }

  function watchSections() {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) setCurrent(ids.includes(en.target.id) ? en.target.id : null);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', ...ids, 'finale'].forEach((id) => io.observe(document.getElementById(id)));
  }

  /* Short "done" line at the end of a chapter (no button) */
  function renderDone(id) {
    const box = document.querySelector(`#${id} .ch-done`);
    if (!box || id === 'quiz') return;
    box.innerHTML = `<span class="done-mark">${icon('i-check')}</span><p>${DONE_TEXT[id]}</p>`;
    box.hidden = false;
  }

  function toast(text) {
    const t = document.getElementById('toast');
    t.innerHTML = `${icon('i-check')} <span>${text}</span>`;
    t.classList.remove('is-on');
    void t.offsetWidth;
    t.classList.add('is-on');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('is-on'), 2600);
  }

  /* Shows every unlocked part; future parts stay closed */
  function revealOpen(animate) {
    ids.forEach((cid) => {
      const el = document.getElementById(cid);
      const open = canOpen(cid);
      if (open && el.hidden && animate) el.classList.add('is-new');
      el.hidden = !open;
    });
    const finale = document.getElementById('finale');
    if (allDone() && finale.hidden && animate) finale.classList.add('is-new');
    finale.hidden = !allDone();
    if (allDone()) renderFinale();
  }

  function renderFinale() {
    const score = read('kishurim-lomda-score', null);
    document.getElementById('finaleScore').textContent = score === null ? '' : `הציון שלך במבחן: ${score} מתוך 100`;
  }

  /* Smooth scroll to a section, below the fixed top bar */
  function scrollTo(id, focus = true) {
    const section = document.getElementById(id);
    if (!section || section.hidden) return;
    const top = section.getBoundingClientRect().top + window.scrollY - document.querySelector('.topbar').getBoundingClientRect().bottom - 12;
    window.scrollTo({ top, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
    const title = section.querySelector('[tabindex="-1"]');
    if (focus && title) title.focus({ preventScroll: true });
  }

  function go(id) { if (id === 'finale' ? allDone() : canOpen(id)) scrollTo(id); }

  /* Called by each chapter once its condition is met (first time only) */
  function complete(id) {
    if (EDITOR) { toast(`התנאי של "${CHAPTERS.find((c) => c.id === id).label}" הושלם (מצב עורך)`); return; }
    if (done.has(id)) return;
    done.add(id);
    write(KEY, [...done]);
    renderDone(id);
    renderSteps();
    const i = ids.indexOf(id);
    toast(i < ids.length - 1 ? `פרק ${i + 1} הושלם` : 'הלומדה הושלמה');
    setTimeout(() => {
      revealOpen(true);
      scrollTo(nextOpenId());
    }, REVEAL_DELAY[id] || 1200);
  }

  /* Gate 0: the hero call was answered */
  function completeIntro() {
    if (EDITOR) {
      setTimeout(() => { scrollTo('story'); document.dispatchEvent(new CustomEvent('lomda:storyStart')); }, 1200);
      return;
    }
    if (intro) return;
    intro = true;
    write(KEY_INTRO, true);
    renderSteps();
    setTimeout(() => {
      revealOpen(true);
      scrollTo('story');
      document.dispatchEvent(new CustomEvent('lomda:storyStart'));
    }, 1500);
  }

  function init() {
    done.forEach(renderDone);
    revealOpen(false);
    renderSteps();
    watchSections();
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-go]');
      if (b && !b.disabled) go(b.dataset.go);
    });
    if (EDITOR) document.getElementById('footerReset').hidden = true;
    window.addEventListener('hashchange', () => window.location.reload());
    document.querySelectorAll('.js-reset').forEach((b) => b.addEventListener('click', () => {
      try {
        [KEY, KEY_INTRO, 'kishurim-lomda-score', 'kishurim-lomda-current'].forEach((k) => localStorage.removeItem(k));
      } catch (e) { /* storage blocked */ }
      window.scrollTo(0, 0);
      window.location.reload();
    }));
  }

  init();
  return { complete, completeIntro, go, scrollTo, nextOpenId, editor: EDITOR, isDone: (id) => (EDITOR && id === 'story') || done.has(id), introDone: () => !EDITOR && intro };
})();
