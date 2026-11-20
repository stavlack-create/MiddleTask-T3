/* ==========================================================
   utils.js – small shared helpers used by every module
   ========================================================== */

/* Returns an inline SVG icon that points to the page sprite */
function icon(id) {
  return `<svg class="ic" aria-hidden="true"><use href="#${id}"/></svg>`;
}

/* Returns a small traffic-light lamp */
function lamp(light) {
  return `<span class="lamp lamp--${light}" aria-hidden="true"></span>`;
}

/* Feedback types shared by the practice, the handover sheet and the quiz */
const FEEDBACK = {
  correct: { cls: 'fb--correct', icon: 'i-check', title: 'נכון.' },
  partial: { cls: 'fb--partial', icon: 'i-dots', title: 'כמעט.' },
  wrong: { cls: 'fb--wrong', icon: 'i-x', title: 'לא נכון.' },
  missing: { cls: 'fb--missing', icon: 'i-alert', title: 'חסרה תשובה.' },
  invalid: { cls: 'fb--missing', icon: 'i-alert', title: 'יש לבדוק את התשובה.' }
};

/* Renders a feedback box into a container */
function showFeedback(container, type, message) {
  const fb = FEEDBACK[type];
  container.classList.remove('fb', 'fb--correct', 'fb--partial', 'fb--wrong', 'fb--missing');
  container.classList.add('fb', fb.cls);
  container.innerHTML = `<div><strong>${fb.title}</strong> ${message}</div>`;
}

/* Clears a feedback box */
function clearFeedback(container) {
  container.classList.remove('fb', 'fb--correct', 'fb--partial', 'fb--wrong', 'fb--missing');
  container.innerHTML = '';
}

/* Marks a form field as valid / invalid for screen readers and styling */
function setInvalid(field, isInvalid) {
  field.classList.toggle('is-invalid', isInvalid);
  field.setAttribute('aria-invalid', String(isInvalid));
}
