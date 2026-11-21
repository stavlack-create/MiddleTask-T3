/* ==========================================================
   story.js – Chapter 1 (placeholder version).
   The animated stage was removed: an empty 16:9 placeholder
   waits for the case-story animation/video.
   Completion: once the learner has scrolled to the moral
   ("לא טעיתי בעבודה...") and it stayed in view ~2.5s, the
   chapter is completed and the next one opens.
   When the real animation is added, call
   Progress.complete('story') when it ends instead.
   ========================================================== */
(function initStory() {
  const moral = document.getElementById('storyMoral');
  let timer = null;

  // After answering the call in the hero, bring the learner to the chapter (already handled by Progress)
  if (!('IntersectionObserver' in window)) { Progress.complete('story'); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        timer = setTimeout(() => { Progress.complete('story'); io.disconnect(); }, 2500);
      } else {
        clearTimeout(timer);
      }
    });
  }, { threshold: 0.8 });
  // start watching only once the chapter is on the page
  const start = () => { if (!document.getElementById('story').hidden) io.observe(moral); else setTimeout(start, 400); };
  start();
})();
