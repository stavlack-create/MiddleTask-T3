/* ==========================================================
   record.js – Chapter 3: renders the "five M's" tiles
   ========================================================== */
(function initFiveM() {
  const grid = document.getElementById('mGrid');
  grid.innerHTML = FIVE_M.map((m) => `
    <li class="m-tile">
      <span class="m-icon">${icon(m.icon)}</span>
      <span class="m-word">${m.word}</span>
      <span class="m-question">${m.question}</span>
      <span class="m-detail">${m.detail}</span>
    </li>`).join('');
})();
