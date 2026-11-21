/* ==========================================================
   utils.js – small shared helpers used by every module
   ========================================================== */

/* Returns an inline SVG icon that points to the page sprite */
function icon(id) {
  return `<svg class="ic" aria-hidden="true"><use href="#${id}"/></svg>`;
}

/* A state name in its traffic-light color (color + text, never color alone) */
function stateWord(stateKey) {
  const s = STATES[stateKey];
  return `<span class="sw sw--${s.light}"><span class="dot dot--${s.light}" aria-hidden="true"></span>${s.label}</span>`;
}

/* True when the learner asked the OS for less motion */
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Promise based pause (used for sequential reveals) */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, REDUCED_MOTION ? 0 : ms));
}

/* Escapes learner input before it is placed in innerHTML */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* Feedback types shared by the practice, the handover sheet and the quiz */
const FEEDBACK = {
  correct: { cls: 'fb--correct', icon: 'i-check', title: 'נכון.' },
  partial: { cls: 'fb--partial', icon: 'i-dots', title: 'כמעט.' },
  wrong: { cls: 'fb--wrong', icon: 'i-x', title: 'לא נכון.' },
  missing: { cls: 'fb--missing', icon: 'i-alert', title: 'חסרה תשובה.' },
  invalid: { cls: 'fb--missing', icon: 'i-alert', title: 'יש לבדוק את התשובה.' }
};

/* Renders a feedback message into a container */
function showFeedback(container, type, message) {
  const fb = FEEDBACK[type];
  clearFeedback(container);
  container.classList.add('fb', fb.cls);
  container.innerHTML = `<span class="fb-icon">${icon(fb.icon)}</span><div><strong>${fb.title}</strong> ${message}</div>`;
}

/* Clears a feedback message */
function clearFeedback(container) {
  container.classList.remove('fb', 'fb--correct', 'fb--partial', 'fb--wrong', 'fb--missing');
  container.innerHTML = '';
}

/* Marks a form field as valid / invalid for screen readers and styling */
function setInvalid(field, isInvalid) {
  field.classList.toggle('is-invalid', isInvalid);
  field.setAttribute('aria-invalid', String(isInvalid));
}
