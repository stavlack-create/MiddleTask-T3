/* ==========================================================
   quiz.js – Section 6: summative assessment.
   Every checker returns { status, msg } where status is
   correct | partial | wrong | missing | invalid.
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
        msg: `זיהיתם ${hits} מתוך 3.${extra ? ' מתי הלקוח התקשר לפני שנה לא עוזר למחליף עכשיו.' : ''} חסר לו: מה התקלה, השעה, ועד מתי מחכים לאישור.`
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
  return lastResults.reduce((sum, r) => sum + POINTS[r.status], 0);
}

(function initQuiz() {
  const form = document.getElementById('quizForm');
  const summary = document.getElementById('quizSummary');
  const resetBtn = document.getElementById('quizReset');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    lastResults = QUESTIONS.map((q) => {
      const result = q.check();
      const box = document.getElementById(`${q.id}-fb`);
      showFeedback(box, result.status, result.msg);
      const bad = result.status === 'missing' || result.status === 'invalid';
      q.fields().forEach((f) => setInvalid(f, bad));
      document.getElementById(q.id).dataset.status = result.status;
      return result;
    });

    // Missing or invalid answers block the summary
    const blocking = QUESTIONS.filter((q, i) => ['missing', 'invalid'].includes(lastResults[i].status));
    if (blocking.length) {
      summary.hidden = false;
      summary.className = 'quiz-summary fb fb--missing';
      summary.innerHTML = `<div><strong>עוד לא סיימתם.</strong> יש ${blocking.length} שאלות שצריך להשלים או לתקן.</div>`;
      blocking[0].fields()[0].focus();
      return;
    }

    const score = getFinalScore();
    const type = score >= 80 ? 'correct' : score >= 50 ? 'partial' : 'wrong';
    const message = score >= 80
      ? 'המחליף שלך יקבל תמונת מצב ברורה ויידע במה לטפל קודם.'
      : score >= 50
        ? 'רוב המידע עובר, אבל המחליף עלול לפספס פרט חשוב. עברו על המשוב בשאלות המסומנות.'
        : 'המחליף שלך עלול להיכנס למשמרת בלי לדעת מה דחוף. מומלץ לחזור לפרקים 2 ו-3.';
    summary.hidden = false;
    summary.className = `quiz-summary fb ${FEEDBACK[type].cls}`;
    summary.innerHTML = `<div><p class="quiz-score">${score} / 100</p><p class="mb-0">${message}</p></div>`;
    summary.focus();
    resetBtn.hidden = false;
  });

  resetBtn.addEventListener('click', () => {
    form.reset();
    lastResults = [];
    QUESTIONS.forEach((q) => {
      clearFeedback(document.getElementById(`${q.id}-fb`));
      q.fields().forEach((f) => setInvalid(f, false));
      delete document.getElementById(q.id).dataset.status;
    });
    summary.hidden = true;
    resetBtn.hidden = true;
    document.getElementById('q1a').focus();
  });
})();
