'use strict';
(() => {
  const modal = document.getElementById('quoteModal');
  let returnFocus = null;
  // Remember the trigger only; app.js remains the sole survey/modal controller.
  document.addEventListener('click', event => {
    const trigger = event.target instanceof Element && event.target.closest('.survey-direct-option');
    if (trigger && !modal.contains(trigger)) returnFocus = trigger;
  }, true);
  modal.addEventListener('hidden.bs.modal', () => {
    if (returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
  });
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!motion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.quote-reveal').forEach(element => observer.observe(element));
  }
})();
