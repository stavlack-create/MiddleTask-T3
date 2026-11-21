/* ==========================================================
   handover.js – Chapter 6: digital handover sheet.
   On submit: validates required fields, checks the main
   answers, then shows what the replacement will receive
   (and the example sheet). Can print an empty sheet.
   ========================================================== */
(function initHandover() {
  const form = document.getElementById('handoverForm');
  const feedback = document.getElementById('handoverFeedback');
  const example = document.getElementById('handoverExample');
  const previewWrap = document.getElementById('hoPreviewWrap');
  const preview = document.getElementById('hoPreview');
  const fields = [...form.querySelectorAll('input[required]')];
  const val = (id) => document.getElementById(id).value.trim();

  // Clear the error state as soon as the learner types
  fields.forEach((f) => f.addEventListener('input', () => setInvalid(f, false)));

  /* What the replacement will receive */
  function renderPreview() {
    const v = (id) => escapeHtml(val(id));
    preview.innerHTML = `
      <p class="pv-head">מ${v('hoFrom')} ל${v('hoTo')}, ${v('hoTime')}</p>
      <p>${stateWord('urgent')} ${v('urgCustomer')} · ${v('urgIssue')} · ${v('urgAction')}</p>
      <p class="mb-0">${stateWord('open')} ${v('openCustomer')} · ${v('openIssue')} · ${v('openAction')}</p>`;
    previewWrap.hidden = false;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Validation: every required field must be filled
    const empty = fields.filter((f) => f.value.trim() === '');
    fields.forEach((f) => setInvalid(f, empty.includes(f)));
    if (empty.length) {
      showFeedback(feedback, 'missing', `ההעברה לא נשלחה. יש ${empty.length} שדות ריקים, ומחליף שמקבל דף חסר יצטרך לנחש.`);
      previewWrap.hidden = true;
      empty[0].focus();
      return;
    }

    // 2. Content check: right customer in the right block + a time in each action
    const hasTime = (s) => /\d{1,2}[:.]?\d{0,2}|מחר|היום|עד/.test(s);
    const checks = [
      { ok: /רונית/.test(val('urgCustomer')), msg: 'בדחוף צריכה להיות רונית אברהם: הביקור שלה בעוד שעה ואין טכנאי.' },
      { ok: /משה|כהן/.test(val('openCustomer')), msg: 'בפתוח צריך להיות משה כהן: מחכים לאישור שלו עד הערב.' },
      { ok: hasTime(val('urgAction')), msg: 'בדחוף חסר "עד מתי". המחליף צריך לדעת שיש לו עד 15:30.' },
      { ok: hasTime(val('openAction')), msg: 'בפתוח חסר "עד מתי". כתבו עד איזו שעה לחזור למשה.' }
    ];
    const failed = checks.filter((c) => !c.ok);

    renderPreview();
    if (failed.length === 0) {
      showFeedback(feedback, 'correct', 'הדף ברור. המחליף יודע במה לטפל קודם ועד מתי.');
      example.hidden = true;
      Progress.complete('handover');
    } else {
      if (failed.length < checks.length) {
        showFeedback(feedback, 'partial', `<ul class="mb-0 mt-1">${failed.map((c) => `<li>${c.msg}</li>`).join('')}</ul>`);
      } else {
        showFeedback(feedback, 'wrong', 'הפניות לא במקום הנכון. השוו לדף לדוגמה ונסו שוב.');
      }
      example.hidden = false;
    }
  });

  // Print an empty sheet for the work stations
  document.getElementById('printBlank').addEventListener('click', () => {
    form.reset();
    fields.forEach((f) => setInvalid(f, false));
    clearFeedback(feedback);
    example.hidden = true;
    previewWrap.hidden = true;
    document.body.classList.add('print-sheet');
    try { window.print(); } catch (err) { /* printing may be blocked in previews */ }
    document.body.classList.remove('print-sheet');
  });
})();
