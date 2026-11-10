'use strict';
document.querySelectorAll('[data-review-carousel]').forEach(carousel => {
  const viewport = carousel.querySelector('.review-viewport');
  const track = carousel.querySelector('.review-track');
  const original = carousel.querySelector('[data-review-original]');
  const cards = [...original.children];
  if (cards.length < 2) return;
  const controls = carousel.querySelector('.review-controls');
  const toggle = carousel.querySelector('[data-review-toggle]');
  const status = carousel.querySelector('[data-review-status]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motion.matches, hovered = false, focused = false, interacting = false;
  let period = 0, step = 0, last = 0, raf = 0, dragStart = null, dragScroll = 0, autoPosition = null;
  const modulo = (n, m) => ((n % m) + m) % m;
  const copies = [original.cloneNode(true), original.cloneNode(true)];
  for (const copy of copies) {
    copy.removeAttribute('data-review-original');
    copy.setAttribute('aria-hidden', 'true');
    copy.inert = true;
    copy.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    copy.querySelectorAll('[aria-labelledby]').forEach(el => el.removeAttribute('aria-labelledby'));
    copy.querySelectorAll('a,button,[tabindex]').forEach(el => el.tabIndex = -1);
  }
  track.prepend(copies[0]); track.append(copies[1]);
  function avatarFallback(img) {
    const initials = document.createElement('span');
    initials.className = 'review-avatar';
    initials.setAttribute('aria-hidden', 'true');
    initials.textContent = img.dataset.initials;
    img.replaceWith(initials);
  }
  carousel.querySelectorAll('img.review-avatar').forEach(img => {
    img.addEventListener('error', () => avatarFallback(img), { once: true });
    if (img.complete && !img.naturalWidth) avatarFallback(img);
  });
  carousel.classList.add('is-enhanced');
  controls.hidden = false;
  function resize() {
    const fraction = period ? modulo(viewport.scrollLeft - period, period) / period : 0;
    const gap = parseFloat(getComputedStyle(track).gap);
    const columns = innerWidth >= 1200 ? 3 : innerWidth >= 768 ? 2 : 1;
    const width = (viewport.clientWidth - gap * (columns - 1)) / columns;
    carousel.style.setProperty('--review-card-width', `${width}px`);
    step = width + gap;
    period = original.getBoundingClientRect().width + gap;
    viewport.scrollLeft = period + fraction * period;
    autoPosition = null;
  }
  function normalize() {
    if (!period) return;
    const current = viewport.scrollLeft;
    if (current < period || current >= period * 2) viewport.scrollLeft = period + modulo(current - period, period);
  }
  function label() {
    toggle.textContent = paused ? 'Play reviews' : 'Pause reviews';
    toggle.setAttribute('aria-label', paused ? 'Start automatic review scrolling' : 'Pause automatic review scrolling');
  }
  function tick(now) {
    if (last && !paused && !hovered && !focused && !interacting && !document.hidden) {
      if (autoPosition === null) autoPosition = viewport.scrollLeft;
      autoPosition = period + modulo(autoPosition - period + Math.min(now - last, 50) * .025, period);
      viewport.scrollLeft = autoPosition;
    } else autoPosition = null;
    last = now;
    raf = requestAnimationFrame(tick);
  }
  function move(direction) {
    paused = true; label();
    const index = Math.round(modulo(viewport.scrollLeft - period, period) / step);
    const next = modulo(index + direction, cards.length);
    viewport.scrollLeft = period + next * step;
    status.textContent = `Review ${next + 1} of ${cards.length}`;
  }
  toggle.addEventListener('click', () => { paused = !paused; label(); });
  carousel.querySelector('[data-review-prev]').addEventListener('click', () => move(-1));
  carousel.querySelector('[data-review-next]').addEventListener('click', () => move(1));
  viewport.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
    else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); paused = true; label(); const index = event.key === 'Home' ? 0 : cards.length - 1; viewport.scrollLeft = period + index * step; status.textContent = `Review ${index + 1} of ${cards.length}`; }
  });
  carousel.addEventListener('mouseenter', () => { hovered = true; });
  carousel.addEventListener('mouseleave', () => { hovered = false; });
  carousel.addEventListener('focusin', () => { focused = true; });
  carousel.addEventListener('focusout', () => { requestAnimationFrame(() => { focused = carousel.contains(document.activeElement); }); });
  viewport.addEventListener('pointerdown', event => {
    if (event.target.closest('a,button')) return;
    interacting = true; paused = true; label();
    if (event.pointerType === 'mouse') { dragStart = event.clientX; dragScroll = viewport.scrollLeft; viewport.setPointerCapture(event.pointerId); }
  });
  viewport.addEventListener('pointermove', event => { if (dragStart !== null) viewport.scrollLeft = dragScroll - (event.clientX - dragStart); });
  const release = () => { interacting = false; dragStart = null; normalize(); };
  viewport.addEventListener('pointerup', release);
  viewport.addEventListener('pointercancel', release);
  viewport.addEventListener('wheel', () => { paused = true; label(); }, { passive: true });
  viewport.addEventListener('scroll', () => { if (!interacting) normalize(); }, { passive: true });
  motion.addEventListener('change', () => { if (motion.matches) { paused = true; label(); } });
  new ResizeObserver(resize).observe(viewport);
  document.addEventListener('visibilitychange', () => { last = 0; if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(tick); });
  resize(); label(); raf = requestAnimationFrame(tick);
});
