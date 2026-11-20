/* ==========================================================
   handover.js – Section 5: digital handover sheet.
   Validates required fields, checks the main answers and
   shows an example sheet. Can print an empty sheet.
   ========================================================== */
(function initHandover() {
  const form = document.getElementById('handoverForm');
  const feedback = document.getElementById('handoverFeedback');
  const example = document.getElementById('handoverExample');
  const fields = [...form.querySelectorAll('input[required]')];

  // Clear the error state as soon as the learner types
  fields.forEach((f) => f.addEventListener('input', () => setInvalid(f, false)));

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Validation: every required field must be filled
    const empty = fields.filter((f) => f.value.trim() === '');
    fields.forEach((f) => setInvalid(f, empty.includes(f)));
    if (empty.length) {
      showFeedback(feedback, 'missing', `יש ${empty.length} שדות ריקים. מחליף שמקבל דף חסר יצטרך לנחש.`);
      empty[0].focus();
      return;
    }

    // 2. Content check: right customer in the right block + a time in each action
    const val = (id) => document.getElementById(id).value;
    const hasTime = (s) => /\d{1,2}[:.]?\d{0,2}|מחר|היום|עד/.test(s);
    const checks = [
      { ok: /רונית/.test(val('urgCustomer')), msg: 'בדחוף צריכה להיות רונית אברהם: הביקור שלה בעוד שעה ואין טכנאי.' },
      { ok: /משה|כהן/.test(val('openCustomer')), msg: 'בפתוח צריך להיות משה כהן: מחכים לאישור שלו עד הערב.' },
      { ok: hasTime(val('urgAction')), msg: 'בדחוף חסר "עד מתי". המחליף צריך לדעת שיש לו עד 15:30.' },
      { ok: hasTime(val('openAction')), msg: 'בפתוח חסר "עד מתי". כתבו עד איזו שעה לחזור למשה.' }
    ];
    const failed = checks.filter((c) => !c.ok);

    if (failed.length === 0) {
      showFeedback(feedback, 'correct', 'הדף ברור. המחליף יודע במה לטפל קודם ועד מתי.');
    } else if (failed.length < checks.length) {
      showFeedback(feedback, 'partial', `<ul class="mb-0 mt-1">${failed.map((c) => `<li>${c.msg}</li>`).join('')}</ul>`);
    } else {
      showFeedback(feedback, 'wrong', 'הפניות לא במקום הנכון. השוו לדף לדוגמה ונסו שוב.');
    }
    example.hidden = false;
  });

  // Print an empty sheet for the work stations
  document.getElementById('printBlank').addEventListener('click', () => {
    form.reset();
    fields.forEach((f) => setInvalid(f, false));
    clearFeedback(feedback);
    example.hidden = true;
    document.body.classList.add('print-sheet');
    try { window.print(); } catch (err) { /* printing may be blocked in previews */ }
    document.body.classList.remove('print-sheet');
  });
})();
