'use strict';

(function () {
  const QUOTE_TEXT_PATTERN = /\b((request|get)(?: a| your)?(?: free)? quote|start now|find an agent|broker)\b/i;
  const QUOTE_PATH_PATTERN = /(?:^|[/_-])quote(?:[./_?#-]|$)/i;

  function sendEvent(eventName, parameters) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, parameters);
  }

  function getPagePath() {
    return window.location.pathname;
  }

  function getCtaLocation(element) {
    if (element.closest('#quoteModal, #mobileInsuranceModal, [role="dialog"], .modal')) return 'modal';
    if (element.closest('header, .site-header')) return 'header';
    if (element.closest('nav, .navbar, .motive-main-menu')) return 'navigation';
    if (element.closest('footer, .site-footer')) return 'footer';
    if (element.closest('.hero, [class*="hero"]')) return 'hero';
    if (element.closest('main')) return 'main_content';
    return 'page_content';
  }

  function getVisibleText(element) {
    return (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function getInsuranceType(element) {
    const insuranceElement = element.closest('[data-survey-title], [data-insurance-type]');
    if (!insuranceElement) return '';

    return (
      insuranceElement.getAttribute('data-survey-title') ||
      insuranceElement.getAttribute('data-insurance-type') ||
      ''
    ).trim();
  }

  function isInsuranceSelection(element) {
    return Boolean(element.closest(
      '.survey-direct-option, [data-survey-title], [data-survey-id]'
    ));
  }

  function isQuoteCta(element, visibleText) {
    const quoteElement = element.closest(
      '[data-quote-choice-opener], .survey-direct-option, ' +
      '[data-survey-title], [data-survey-id], ' +
      '[data-bs-target="#quoteModal"], [href="#quoteModal"]'
    );
    if (quoteElement) return true;

    const link = element.closest('a[href]');
    if (link) {
      const href = link.getAttribute('href') || '';
      if (QUOTE_PATH_PATTERN.test(href)) return true;
    }

    return QUOTE_TEXT_PATTERN.test(visibleText);
  }

  document.addEventListener('click', function (event) {
    const target = event.target instanceof Element
      ? event.target.closest('a, button, [role="button"], [data-survey-id], [data-survey-title]')
      : null;
    if (!target) return;

    const pagePath = getPagePath();
    const ctaLocation = getCtaLocation(target);
    const telephoneLink = target.closest('a[href^="tel:"]');
    const emailLink = target.closest('a[href^="mailto:"]');

    if (telephoneLink) {
      sendEvent('phone_click', {
        cta_location: ctaLocation,
        page_path: pagePath
      });
      return;
    }

    if (emailLink) {
      sendEvent('email_click', {
        cta_location: ctaLocation,
        page_path: pagePath
      });
      return;
    }

    const visibleText = getVisibleText(target);
    const insuranceType = getInsuranceType(target);

    if (isInsuranceSelection(target)) {
      sendEvent('insurance_type_click', {
        insurance_type: insuranceType || 'Insurance',
        cta_location: ctaLocation,
        page_path: pagePath
      });
    }

    if (isQuoteCta(target, visibleText)) {
      const quoteParameters = {
        cta_text: visibleText,
        cta_location: ctaLocation,
        page_path: pagePath
      };
      if (insuranceType) quoteParameters.insurance_type = insuranceType;
      sendEvent('quote_cta_click', quoteParameters);
    }
  // Capture direct survey clicks before the shared modal handler stops propagation.
  }, true);
})();
