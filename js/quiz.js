/* ==========================================================
   quiz.js – Chapter 7: summative assessment, one question at
   a time. Every checker returns { status, msg } where status
   is correct | partial | wrong | missing | invalid.
   missing / invalid block moving on; the rest lock the answer.
   getFinalScore() is kept separate for the SCORM stage.
   ========================================================== */
const POINTS = { correct: 20, partial: 10, wrong: 0, missing: 0, invalid: 0 };
let lastResults = [];

const QUESTIONS = [
  {
    id: 'q1',
    fields: () => [...document.querySelectorAll('input[name="q1"]')],
    check() {
      const picked = document.querySelector('input[name="q1"]:checked');
      if (!picked) return { status: 'missing', msg: 'בחרו פנייה אחת.' };
      if (picked.value === 'ronit') return { status: 'correct', msg: 'לרונית יש ביקור בעוד שעה ואין טכנאי. אם המחליף לא יידע, אף אחד לא יגיע.' };
      return { status: 'wrong', msg: 'הפנייה של רונית דחופה יותר: הביקור בעוד שעה ואין טכנאי.' };
    }
  },
  {
    id: 'q2',
    fields: () => [...document.querySelectorAll('input[name="q2"]')],
    check() {
      const picked = [...document.querySelectorAll('input[name="q2"]:checked')].map((c) => c.value);
      if (!picked.length) return { status: 'missing', msg: 'סמנו לפחות תשובה אחת.' };
      const right = ['issue', 'hour', 'deadline'];
      const hits = picked.filter((p) => right.includes(p)).length;
      const extra = picked.includes('firstcall');
      if (hits === 3 && !extra) return { status: 'correct', msg: 'בלי התקלה, השעה ומועד האישור, המחליף לא יכול להמשיך.' };
      if (hits === 0) return { status: 'wrong', msg: 'חסרים מה התקלה, באיזו שעה הביקור ועד מתי מחכים לאישור.' };
      return {
        status: 'partial',
        msg: `זיהיתם ${hits} מתוך 3.${extra ? ' מתי הלקוח הצטרף לחברה לא עוזר למחליף עכשיו.' : ''} חסר לו: מה התקלה, השעה, ועד מתי מחכים לאישור.`
      };
    }
  },
  {
    id: 'q3',
    fields: () => [...document.querySelectorAll('select[name="q3"]')],
    check() {
      const answers = { q3a: 'urgent', q3b: 'open', q3c: 'done' };
      const ids = Object.keys(answers);
      if (ids.some((id) => document.getElementById(id).value === '')) return { status: 'missing', msg: 'בחרו מצב לכל אחת מהפניות.' };
      const hits = ids.filter((id) => document.getElementById(id).value === answers[id]).length;
      if (hits === 3) return { status: 'correct', msg: 'הלקוחה שמחכה עכשיו דחופה, ההצעה למחר פתוחה, והקו שתוקן הסתיים.' };
      if (hits > 0) return { status: 'partial', msg: `${hits} מתוך 3 נכונות. זכרו: מישהו מחכה עכשיו = דחוף. ממתינים למחר = פתוח. הכול עובד = הסתיים.` };
      return { status: 'wrong', msg: 'הטכנאי התקוע דחוף, ההצעה למחר פתוחה, והקו שתוקן הסתיים.' };
    }
  },
  {
    id: 'q4',
    fields: () => [...document.querySelectorAll('input[name="q4"]')],
    check() {
      const picked = document.querySelector('input[name="q4"]:checked');
      if (!picked) return { status: 'missing', msg: 'בחרו תשובה אחת.' };
      if (picked.value === 'mesima') return { status: 'correct', msg: 'יש מי, מה ומתי, אבל המחליף לא יודע מה עליו לעשות. למשל: "לאשר מול דורית עד 18:00".' };
      return { status: 'wrong', msg: 'שם הלקוחה ושעת הביקור כבר כתובים. חסרה המשימה: מה המחליף צריך לעשות.' };
    }
  },
  {
    id: 'q5',
    fields: () => [document.getElementById('q5input')],
    check() {
      const text = document.getElementById('q5input').value.trim();
      if (text === '') return { status: 'missing', msg: 'כתבו משפט למחליף.' };
      if (text.length < 20) return { status: 'invalid', msg: `המשפט קצר מדי (${text.length} תווים). כתבו לפחות 20 תווים.` };
      const parts = [
        { ok: /אינטרנט|טלפון|תקלה|קו/.test(text), name: 'מה התקלה' },
        { ok: /\d|שעה|עכשיו|מיד/.test(text), name: 'מתי' },
        { ok: /טכנאי|לשבץ|לקבוע|לשלוח|לעדכן/.test(text), name: 'מה לעשות' }
      ];
      const missing = parts.filter((p) => !p.ok).map((p) => p.name);
      if (!missing.length) return { status: 'correct', msg: 'המשפט עונה על מה, מתי ומה לעשות. המחליף יכול להתחיל מיד.' };
      if (missing.length < 3) return { status: 'partial', msg: `טוב. חסר עוד: ${missing.join(', ')}.` };
      return { status: 'wrong', msg: 'המחליף לא יבין מהמשפט מה קרה. כתבו מה התקלה, מתי הביקור ומה לעשות.' };
    }
  }
];

/* Total score 0–100 (will be reported to the LMS in stage 2) */
function getFinalScore() {
  return lastResults.reduce((sum, r) => sum + (r ? POINTS[r.status] : 0), 0);
}

(function initQuiz() {
  const form = document.getElementById('quizForm');
  const body = document.getElementById('quizBody');
  const summary = document.getElementById('quizSummary');
  const resetBtn = document.getElementById('quizReset');
  const prevBtn = document.getElementById('quizPrev');
  const actionBtn = document.getElementById('quizAction');
  const bar = document.getElementById('quizBar');
  let current = 0;

  const checked = (i) => Boolean(lastResults[i]);

  function show(index) {
    current = index;
    QUESTIONS.forEach((q, i) => { document.getElementById(q.id).hidden = i !== index; });
    prevBtn.hidden = index === 0;
    if (!checked(index)) actionBtn.textContent = 'בדיקה';
    else actionBtn.textContent = index < QUESTIONS.length - 1 ? 'לשאלה הבאה' : 'לציון';
    bar.style.width = `${(lastResults.filter(Boolean).length / QUESTIONS.length) * 100}%`;
  }

  const lock = (q, locked) => q.fields().forEach((f) => { f.disabled = locked; });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = QUESTIONS[current];

    // Already answered – move on
    if (checked(current)) {
      if (current < QUESTIONS.length - 1) {
        show(current + 1);
        document.querySelector(`#${QUESTIONS[current].id} input, #${QUESTIONS[current].id} select, #${QUESTIONS[current].id} textarea`).focus();
      } else {
        showSummary();
      }
      return;
    }

    const result = q.check();
    showFeedback(document.getElementById(`${q.id}-fb`), result.status, result.msg);
    const bad = result.status === 'missing' || result.status === 'invalid';
    q.fields().forEach((f) => setInvalid(f, bad));
    if (bad) { q.fields()[0].focus(); return; }

    lastResults[current] = result;
    document.getElementById(q.id).dataset.status = result.status;
    lock(q, true);
    show(current);
    actionBtn.focus();
  });

  prevBtn.addEventListener('click', () => { if (current > 0) show(current - 1); });

  function showSummary() {
    const score = getFinalScore();
    const type = score >= 80 ? 'correct' : score >= 50 ? 'partial' : 'wrong';
    const message = score >= 80
      ? 'המחליף שלך יקבל תמונת מצב ברורה ויידע במה לטפל קודם.'
      : score >= 50
        ? 'רוב המידע עובר, אבל המחליף עלול לפספס פרט חשוב.'
        : 'המחליף שלך עלול להיכנס למשמרת בלי לדעת מה דחוף. מומלץ לחזור לפרקים 2 ו-3.';
    body.hidden = true;
    summary.hidden = false;
    summary.className = `quiz-summary quiz-summary--${type}`;
    summary.innerHTML = `<p class="score" style="--p:${score}"><span>${score}</span><small>מתוך 100</small></p><p class="score-msg">${message}</p>`;
    summary.focus();
    resetBtn.hidden = false;
    try { localStorage.setItem('kishurim-lomda-score', JSON.stringify(score)); } catch (e) { /* storage blocked */ }
    Progress.complete('quiz');
  }

  resetBtn.addEventListener('click', () => {
    form.reset();
    lastResults = [];
    QUESTIONS.forEach((q) => {
      clearFeedback(document.getElementById(`${q.id}-fb`));
      lock(q, false);
      q.fields().forEach((f) => setInvalid(f, false));
      delete document.getElementById(q.id).dataset.status;
    });
    summary.hidden = true;
    body.hidden = false;
    resetBtn.hidden = true;
    show(0);
    document.getElementById('q1a').focus();
  });

  show(0);
})();
