'use strict';
(() => {
  const page = document.querySelector('.mc-page');
  if (!page) return;
  // Measure the actual menu instead of assuming the same header height on every phone.
  const headerParts = document.querySelectorAll('.top-tabs-bar, .glass-nav');
  const updateHeroHeaderHeight = () => {
    const height = Array.from(headerParts).reduce((total, element) =>
      total + element.getBoundingClientRect().height, 0);
    page.style.setProperty('--mc-header-height', `${height}px`);
  };
  updateHeroHeaderHeight();
  if ('ResizeObserver' in window) {
    const headerObserver = new ResizeObserver(updateHeroHeaderHeight);
    headerParts.forEach(element => headerObserver.observe(element));
  }
  window.addEventListener('resize', updateHeroHeaderHeight, {passive: true});
  const track = (name, parameters = {}) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, {page_path: '/medical-courier-insurance.html', ...parameters});
    }
  };
  // Use only fixed labels in analytics. Never read form values into event payloads.
  page.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    if (link.getAttribute('href').startsWith('tel:')) track('medical_courier_phone_click');
    if (link.hasAttribute('data-mc-cta')) track('medical_courier_cta_click', {cta_location: link.dataset.mcCta});
  });
  const nextSteps = {
    building: ['Build your insurance brief.', 'Outline your delivery type, service area, vehicles and driver model. Ask prospective clients for their insurance requirements before committing to a route or vehicle.'],
    pursuing: ['Compare the contract with your coverage.', 'Bring the proposed agreement and insurance exhibit to Motive. Review required limits, excluded cargo, additional insured wording and any professional liability or cyber requirements before you sign.'],
    ready: ['Confirm the details before dispatch.', 'Review effective dates, scheduled vehicles and drivers, endorsements and certificate wording with your agent. Confirm client acceptance of the insurance documents before the first pickup.'],
    scaling: ['Review coverage before the next vehicle joins.', 'Discuss new drivers, contractor vehicles, expanded territory, larger cargo values and additional customers with Motive. Growth can change the coverage and limits your operation needs.']
  };
  page.querySelectorAll('[data-mc-stage]').forEach(button => {
    button.addEventListener('click', () => {
      page.querySelectorAll('[data-mc-stage]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      const stage = button.dataset.mcStage;
      document.getElementById('mc-stage-title').textContent = nextSteps[stage][0];
      document.getElementById('mc-stage-description').textContent = nextSteps[stage][1];
      track('medical_courier_contract_review', {readiness_stage: stage});
    });
  });
  page.querySelectorAll('.mc-media img').forEach(img => {
    const fallback = () => { img.hidden = true; };
    img.addEventListener('error', fallback);
    if (img.complete && img.naturalWidth === 0) fallback();
  });
})();
