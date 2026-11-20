/* ==========================================================
   story.js – Chapter 1: clickable timeline that reveals the story
   ========================================================== */
(function initStory() {
  const buttonsWrap = document.getElementById('timelineButtons');
  const panel = document.getElementById('storyPanel');
  const moral = document.getElementById('storyMoral');
  let furthestStep = 0;

  // One button per step
  STORY_STEPS.forEach((step, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'timeline-btn';
    btn.innerHTML = `<span class="timeline-dot" aria-hidden="true"></span>${step.time}`;
    btn.setAttribute('aria-label', `שעה ${step.time}: ${step.title}`);
    btn.addEventListener('click', () => showStep(index));
    buttonsWrap.appendChild(btn);
  });

  // Shows one step and updates the buttons
  function showStep(index) {
    const step = STORY_STEPS[index];
    const isLast = index === STORY_STEPS.length - 1;
    furthestStep = Math.max(furthestStep, index);

    buttonsWrap.querySelectorAll('.timeline-btn').forEach((b, i) => {
      b.setAttribute('aria-pressed', String(i === index));
      b.classList.toggle('is-seen', i <= furthestStep);
    });

    panel.innerHTML = `
      <p class="story-time">${step.time}</p>
      <h3 class="story-step-title">${step.title}</h3>
      <p class="story-text">${step.text}</p>
      ${isLast ? '' : `<button type="button" class="btn btn-cyan" id="storyNext">מה קרה אחר כך?</button>`}`;

    const next = document.getElementById('storyNext');
    if (next) next.addEventListener('click', () => {
      showStep(index + 1);
      buttonsWrap.querySelectorAll('.timeline-btn')[index + 1].focus();
    });

    // The pinned note appears only after the whole story was seen
    if (isLast) moral.hidden = false;
  }

  showStep(0);
})();
