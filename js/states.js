/* ==========================================================
   states.js – Chapter 2: accessible flip cards (traffic light)
   ========================================================== */
(function initFlipCards() {
  const wrap = document.getElementById('flipCards');

  // Mini traffic light with one lamp turned on
  const trafficLight = (active) => `
    <span class="traffic" aria-hidden="true">
      ${['red', 'yellow', 'green'].map((c) => `<span class="traffic-lamp traffic-lamp--${c}${c === active ? ' is-on' : ''}"></span>`).join('')}
    </span>`;

  STATE_CARDS.forEach((card) => {
    const state = STATES[card.state];
    const col = document.createElement('div');
    col.className = 'col-md-4';
    col.innerHTML = `
      <button type="button" class="flip flip--${state.light}" aria-pressed="false">
        <span class="flip-face flip-front">
          ${trafficLight(state.light)}
          <span class="flip-title">${state.label}</span>
          <span class="flip-text">${card.front}</span>
          <span class="flip-hint">לדוגמה ←</span>
        </span>
        <span class="flip-face flip-back" aria-hidden="true">
          <span class="flip-title">${state.label}</span>
          <span class="flip-label">דוגמה</span>
          <span class="flip-text">${card.example}</span>
          <span class="flip-label">מה עושים</span>
          <span class="flip-text">${card.todo}</span>
          <span class="flip-hint">→ חזרה</span>
        </span>
      </button>`;
    wrap.appendChild(col);
  });

  // Toggle a card and keep screen readers on the visible face only
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.flip');
    if (!btn) return;
    const flipped = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(flipped));
    btn.querySelector('.flip-front').setAttribute('aria-hidden', String(flipped));
    btn.querySelector('.flip-back').setAttribute('aria-hidden', String(!flipped));
  });
})();
