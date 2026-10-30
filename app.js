// MOTIVE INSURANCE - Client-side interactions
'use strict';
document.addEventListener('DOMContentLoaded', () => {
  initializeSharedFooter();
  initializeLocalRating();
  initializeHeroVideoFallback();
  initializeQuoteFlow();
  initializePersonalHeroSlider();
  initializeMegaMenuPreviews();

  const modalElement = document.getElementById('quoteModal');
  if (modalElement && window.bootstrap) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    document.querySelectorAll('#findAgentHeroBtn, .btn-find-agent, #startNowBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Quote-flow openers are handled by initializeQuoteFlow() so desktop and mobile
        // use the same Select Insurance path without Bootstrap/data-API conflicts.
        if (btn.matches('[data-quote-choice-opener]')) return;
        if (btn.getAttribute('data-bs-toggle') === 'modal') return;
        if (btn.getAttribute('href') === '#') e.preventDefault();
        modal.show();
      });
    });
    document.querySelectorAll('.btn-broker').forEach(btn => {
      btn.addEventListener('click', e => {
        if (btn.matches('.survey-direct-option[data-survey-id]')) return;
        const href = btn.getAttribute('href') || '';
        if (href.endsWith('freight-broker.html#quoteModal') && window.location.pathname.endsWith('/freight-broker.html')) {
          e.preventDefault();
          modal.show();
        }
      });
    });
    if (window.location.hash === '#quoteModal') modal.show();
  }


  const menuItems = document.querySelectorAll('.has-mega-menu, .has-submenu');
  const navbarCollapseEl = document.getElementById('motiveNavbar');
  const navbarCollapse = navbarCollapseEl && window.bootstrap
    ? bootstrap.Collapse.getOrCreateInstance(navbarCollapseEl, { toggle: false })
    : null;
  const closeMenu = item => {
    item.classList.remove('menu-open');
    const button = item.querySelector('.nav-menu-toggle');
    if (button) button.setAttribute('aria-expanded', 'false');
  };
  const closeAllMenus = () => menuItems.forEach(closeMenu);
  const openMenu = item => {
    menuItems.forEach(other => { if (other !== item) closeMenu(other); });
    item.classList.add('menu-open');
    const button = item.querySelector('.nav-menu-toggle');
    if (button) button.setAttribute('aria-expanded', 'true');
  };
  const usesDesktopHover = () => window.matchMedia('(min-width: 992px) and (hover: hover) and (pointer: fine)').matches;
  const usesMobileNav = () => window.matchMedia('(max-width: 991.98px)').matches;

  menuItems.forEach(item => {
    const toggle = item.querySelector('.nav-menu-toggle');
    if (!toggle) return;
    let closeTimer;
    const cancelClose = () => clearTimeout(closeTimer);
    const scheduleClose = () => {
      if (usesDesktopHover()) closeTimer = setTimeout(() => closeMenu(item), 180);
    };

    item.addEventListener('mouseenter', () => {
      if (usesDesktopHover()) {
        cancelClose();
        openMenu(item);
      }
    });
    item.addEventListener('mouseleave', scheduleClose);

    item.querySelectorAll('.mega-menu-panel, .standard-submenu').forEach(panel => {
      panel.addEventListener('mouseenter', cancelClose);
      panel.addEventListener('mouseleave', scheduleClose);
      panel.addEventListener('click', e => e.stopPropagation());
    });

    toggle.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      cancelClose();
      item.classList.contains('menu-open') ? closeMenu(item) : openMenu(item);
    });
  });

  document.querySelectorAll('.motive-main-menu a').forEach(link => {
    link.addEventListener('click', () => {
      closeAllMenus();
      if (usesMobileNav() && navbarCollapseEl && navbarCollapseEl.classList.contains('show') && navbarCollapse) {
        setTimeout(() => navbarCollapse.hide(), 80);
      }
    });
  });

  if (navbarCollapseEl) {
    navbarCollapseEl.addEventListener('hidden.bs.collapse', closeAllMenus);
  }

  document.addEventListener('click', e => {
    if (!e.target.closest('.motive-main-menu') && !e.target.closest('.navbar-toggler')) closeAllMenus();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllMenus(); });
});

function initializeSharedFooter() {
  const footers = document.querySelectorAll('[data-site-footer]');
  if (!footers.length) return;
  const socialStyles = {
    Facebook: ['bg-facebook', 'fa-facebook-f'],
    X: ['bg-twitter', 'fa-twitter'],
    LinkedIn: ['bg-linkedin', 'fa-linkedin-in'],
    Instagram: ['bg-instagram', 'fa-instagram'],
    YouTube: ['bg-youtube', 'fa-youtube'],
    TikTok: ['bg-tiktok', 'fa-tiktok']
  };
  const text = value => typeof value === 'string' && value.trim().length > 0;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);
  fetch('/data/site-footer.json', { cache: 'no-store', signal: controller.signal })
    .then(response => {
      if (!response.ok) throw new Error('Footer unavailable');
      return response.json();
    })
    .then(data => {
      if (!data || !text(data.company) || !text(data.phone) ||
          typeof data.phoneHref !== 'string' || !/^tel:\+?[\d ()-]+$/.test(data.phoneHref) ||
          typeof data.logo !== 'string' || !/^\/images\/[a-zA-Z0-9_./-]+$/.test(data.logo) ||
          !Array.isArray(data.locations) || !data.locations.length ||
          !data.locations.every(location => location && text(location.street) && text(location.city)) ||
          !Array.isArray(data.states) || !data.states.length || !data.states.every(text) ||
          !Array.isArray(data.socials) ||
          !data.socials.every(social => social && Object.hasOwn(socialStyles, social.name) &&
            typeof social.url === 'string' && /^https:\/\/[^/\s]+(?:\/[^\s]*)?$/.test(social.url))) {
        throw new Error('Invalid footer data');
      }
      footers.forEach(footer => {
        // Only this fixed layout is HTML. All fetched text is inserted with textContent.
        const container = document.createElement('div');
        container.className = 'container pt-5 pb-4';
        container.innerHTML = `
<div class="row g-5 align-items-start">
  <div class="col-md-5" data-footer-location-column>
    <h5 class="footer-title mt-3">Locations</h5>
    <address class="small" data-footer-addresses></address>
  </div>
  <div class="col-md-3">
    <h5 class="footer-title mt-3">States We Serve</h5>
    <ul class="list-unstyled small state-list" data-footer-states></ul>
  </div>
  <div class="col-md-4">
    <h5 class="footer-title mt-3">Connect With Us</h5>
    <div class="d-flex flex-wrap gap-3 mt-2 footer-socials" data-footer-socials></div>
  </div>
</div>
<hr class="mt-5 opacity-25"/>
<div class="row mt-4"><div class="col text-center small"><p data-footer-copyright></p></div></div>`;
        const icon = classes => {
          const element = document.createElement('i');
          element.className = classes;
          element.setAttribute('aria-hidden', 'true');
          return element;
        };
        const phoneLink = () => {
          const link = document.createElement('a');
          link.href = data.phoneHref;
          link.className = 'text-white text-decoration-none';
          link.textContent = data.phone;
          return link;
        };
        const logo = document.createElement('img');
        logo.src = data.logo;
        logo.alt = 'Motive Insurance';
        logo.className = 'footer-logo mb-2';
        logo.style.maxHeight = '50px';
        container.querySelector('[data-footer-location-column]').prepend(logo);
        const address = container.querySelector('[data-footer-addresses]');
        data.locations.forEach(location => {
          const city = document.createElement('span');
          city.className = 'ms-4';
          city.textContent = location.city;
          address.append(icon('fa-solid fa-location-dot text-orange me-2'),
            document.createTextNode(location.street), document.createElement('br'),
            city, document.createElement('br'));
        });
        address.append(icon('fa-solid fa-phone text-orange me-2'), phoneLink());
        const states = container.querySelector('[data-footer-states]');
        data.states.forEach(state => {
          const item = document.createElement('li');
          item.append(icon('fa-solid fa-check-circle text-orange me-2'), document.createTextNode(' ' + state));
          states.append(item);
        });
        const socials = container.querySelector('[data-footer-socials]');
        data.socials.forEach(social => {
          const [background, glyph] = socialStyles[social.name];
          const link = document.createElement('a');
          link.className = 'social-icon ' + background;
          link.href = social.url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.setAttribute('aria-label', social.name);
          link.append(icon('fa-brands ' + glyph));
          socials.append(link);
        });
        const privacy = document.createElement('a');
        privacy.href = '/privacy.html';
        privacy.className = 'text-white text-decoration-none';
        privacy.textContent = 'PRIVACY POLICY';
        container.querySelector('[data-footer-copyright]').append(
          document.createTextNode(`© ${new Date().getFullYear()} ${data.company} | `),
          phoneLink(), document.createTextNode(' | '), privacy);
        footer.replaceChildren(container);
        footer.dataset.footerState = 'loaded';
      });
    })
    .catch(() => {
      // Keep the contact/privacy fallback; never substitute stale address details.
      footers.forEach(footer => { footer.dataset.footerState = 'unavailable'; });
    })
    .finally(() => window.clearTimeout(timeout));
}

function initializeHeroVideoFallback() {
  document.querySelectorAll('.hero-section [data-vimeo-fallback]').forEach(wrapper => {
    const frame = wrapper.querySelector('iframe[src^="https://player.vimeo.com/"]');
    const fallback = wrapper.querySelector('.video-fallback');
    if (!frame || !fallback || wrapper.dataset.videoInitialized) return;
    wrapper.dataset.videoInitialized = 'true';

    const playerOrigin = 'https://player.vimeo.com';
    let state = 'LOADING';
    let subscribed = false;
    let previousSeconds = null;
    let startupTimer;

    const setState = next => {
      if (state === next) return;
      state = next;
      clearTimeout(startupTimer);
      wrapper.dataset.videoState = next;
      fallback.hidden = next !== 'FALLBACK';
      fallback.setAttribute('aria-hidden', String(next !== 'FALLBACK'));
      frame.setAttribute('aria-hidden', String(next !== 'PLAYING'));
    };
    const send = (method, value) => {
      const message = { method };
      if (value !== undefined) message.value = value;
      frame.contentWindow?.postMessage(JSON.stringify(message), playerOrigin);
    };
    const subscribe = () => {
      if (subscribed) return;
      subscribed = true;
      // Observe the existing embed without controlling its playback or native loop.
      ['playing', 'timeupdate', 'error'].forEach(event => {
        send('addEventListener', event);
      });
    };

    window.addEventListener('message', event => {
      if (event.origin !== playerOrigin || event.source !== frame.contentWindow) return;
      let message = event.data;
      if (typeof message === 'string') {
        try { message = JSON.parse(message); } catch { return; }
      }
      if (!message || typeof message !== 'object') return;
      if (message.event === 'ready' || message.method === 'ping') {
        subscribe();
      } else if (message.event === 'playing') {
        setState('PLAYING');
      } else if (message.event === 'timeupdate') {
        // Also detect playback that started before our event subscription.
        if (state === 'PLAYING') return;
        const seconds = message.data?.seconds;
        if (!Number.isFinite(seconds) || seconds < 0) return;
        if (previousSeconds !== null && seconds !== previousSeconds) setState('PLAYING');
        previousSeconds = seconds;
      } else if (message.event === 'error') {
        previousSeconds = null;
        setState('FALLBACK');
      }
    });

    frame.addEventListener('load', () => send('ping'));
    frame.addEventListener('error', () => setState('FALLBACK'));
    // A single startup deadline covers blocked autoplay and an unreachable player.
    // Keep listening in fallback so delayed playback recovers without a reload.
    startupTimer = setTimeout(() => setState('FALLBACK'), 20000);
    send('ping');
  });
}
function initializeLocalRating() {
  document.querySelectorAll('[data-rating-source]').forEach(ratingEl => {
    const source = ratingEl.getAttribute('data-rating-source');
    const status = ratingEl.querySelector('[data-rating-status]');
    const content = ratingEl.querySelector('.rating-content');
    const showStarsOnly = () => {
      if (status) {
        status.hidden = true;
        status.textContent = '';
      }
      if (content) content.hidden = false;
      ratingEl.querySelectorAll('[data-rating-value], [data-rating-count], [data-rating-label]').forEach(el => {
        el.textContent = '';
        el.hidden = true;
      });
      ratingEl.querySelectorAll('.stars i').forEach(star => star.style.setProperty('--star-fill', '100%'));
      ratingEl.setAttribute('aria-busy', 'false');
    };
    // Keep the same quiet, stars-only presentation during loading and on failure.
    showStarsOnly();
    if (!source || !window.fetch) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    fetch(source, { cache: 'no-store', signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Rating data unavailable');
        return response.json();
      })
      .then(data => {
        if (!data || typeof data !== 'object') throw new Error('Invalid rating data');
        if (data.verified !== true) throw new Error('Rating data is unverified');
        // Accept the existing numeric-string rating as well as scraper numbers.
        const rating = typeof data.rating === 'number' ? data.rating :
          (typeof data.rating === 'string' && /^\d(?:\.\d+)?$/.test(data.rating) ? Number(data.rating) : NaN);
        const reviewCount = data.reviewCount;
        if (!Number.isFinite(rating) || rating < 1 || rating > 5 ||
            !Number.isSafeInteger(reviewCount) || reviewCount <= 0) throw new Error('Invalid rating data');

        const label = 'Google reviews';
        const displayedRating = rating.toFixed(1);
        const displayedCount = reviewCount.toLocaleString('en-US');

        const ratingValue = ratingEl.querySelector('[data-rating-value]');
        const ratingCount = ratingEl.querySelector('[data-rating-count]');
        const ratingLabel = ratingEl.querySelector('[data-rating-label]');
        if (ratingValue) ratingValue.textContent = displayedRating;
        if (ratingCount) ratingCount.textContent = `from ${displayedCount}`;
        if (ratingLabel) ratingLabel.textContent = label;
        [ratingValue, ratingCount, ratingLabel].forEach(el => { if (el) el.hidden = false; });
        ratingEl.querySelectorAll('.stars i').forEach((star, index) => {
          const fill = Math.max(0, Math.min(1, rating - index)) * 100;
          star.style.setProperty('--star-fill', `${fill}%`);
        });
        if (status) status.hidden = true;
        if (content) content.hidden = false;
        ratingEl.setAttribute('aria-busy', 'false');
      })
      .catch(showStarsOnly)
      .finally(() => window.clearTimeout(timeout));
  });
}

function initializeQuoteFlow() {
  normalizeQuoteModal();
  const defaultInsuranceOptions = [
    { surveyId: 'DDrT5ZLhDEoqP4Jmg9X9', title: 'Personal Insurance' },
    { surveyId: 'STYcNr0ZkXucPSUdoTHE', title: 'Commercial Auto' },
    { surveyId: 'RW0jwFCB03NszVELqqSa', title: 'Commercial Insurance' },
    { surveyId: 'qjuynuDi5uLhptxzWksw', title: 'Trucking Insurance' },
    { surveyId: '07vbqHxpBy7M4r4rxWcC', title: 'Freight Broker' },
    { surveyId: 'emSzkTAQ7h7mH2VSg3zq', title: 'Specialty Transportation' }
  ];

  const quoteModalEl = document.getElementById('quoteModal');
  const quoteModalTitle = document.getElementById('quoteModalTitle');
  const quoteModalContext = document.getElementById('quoteModalContext');
  const choicePanel = document.getElementById('quoteChoicePanel');
  const quoteOptionsPanel = document.getElementById('quoteInsuranceOptions');
  const surveyPanel = document.getElementById('quoteSurveyPanel');
  const surveyFrame = document.getElementById('quoteSurveyFrame');
  const surveyLabel = document.getElementById('quoteSurveyLabel');
  const backBtn = document.getElementById('quoteBackBtn');
  const heroDropdown = document.getElementById('insuranceDropdown');
  const dropdownToggle = heroDropdown ? heroDropdown.querySelector('.dropdown-toggle-btn') : null;
  const mobileModalEl = document.getElementById('mobileInsuranceModal');
  const mobileOptionsPanel = document.getElementById('mobileInsuranceOptions');

  if (!quoteModalEl || !choicePanel || !surveyPanel || !surveyFrame || !window.bootstrap) return;

  const quoteModal = bootstrap.Modal.getOrCreateInstance(quoteModalEl);
  const mobileModal = mobileModalEl ? bootstrap.Modal.getOrCreateInstance(mobileModalEl) : null;
  const usesMobileInsuranceMenu = () => window.matchMedia('(max-width: 991.98px)').matches;
  const heroInsuranceLinks = heroDropdown
    ? Array.from(heroDropdown.querySelectorAll('.dropdown-menu-custom a[data-survey-id]'))
    : defaultInsuranceOptions.map(option => ({
      dataset: { surveyId: option.surveyId, surveyTitle: option.title },
      textContent: option.title
    }));

  const getOptionData = option => ({
    surveyId: option.dataset.surveyId || '',
    title: (
      heroDropdown && heroDropdown.contains(option)
        ? option.textContent || option.dataset.surveyTitle || 'Insurance'
        : option.dataset.surveyTitle || option.textContent || 'Insurance'
    ).trim()
  });

  function addOptionIcon(option) {
    if (option.querySelector('i')) return;
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-shield-halved';
    icon.setAttribute('aria-hidden', 'true');
    option.prepend(icon);
  }

  function buildOptionButton(sourceOption, extraClass) {
    const optionData = getOptionData(sourceOption);
    const button = document.createElement('button');
    button.className = `insurance-select-option ${extraClass || ''}`.trim();
    button.type = 'button';
    button.dataset.surveyId = optionData.surveyId;
    button.dataset.surveyTitle = optionData.title;
    button.dataset.quoteGenerated = 'true';

    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-shield-halved';
    icon.setAttribute('aria-hidden', 'true');

    const labelWrap = document.createElement('span');
    const label = document.createElement('strong');
    label.textContent = optionData.title;
    labelWrap.append(label);

    button.append(icon, labelWrap);
    button.addEventListener('click', e => {
      e.preventDefault();
      openSurveyFromOption(button);
    });
    return button;
  }

  if (heroDropdown) heroInsuranceLinks.forEach(addOptionIcon);

  if (quoteOptionsPanel && heroInsuranceLinks.length) {
    quoteOptionsPanel.replaceChildren(...heroInsuranceLinks.map(link => buildOptionButton(link, 'survey-modal-option')));
  }

  if (mobileOptionsPanel && heroInsuranceLinks.length) {
    mobileOptionsPanel.replaceChildren(...heroInsuranceLinks.map(link => buildOptionButton(link, 'mobile-insurance-option')));
  }

  quoteModalEl.querySelectorAll('[data-bs-dismiss="modal"]').forEach(closeControl => {
    closeControl.addEventListener('click', () => quoteModal.hide());
  });

  function showChoices() {
    if (quoteModalTitle) quoteModalTitle.textContent = 'Select Insurance';
    if (quoteModalContext) quoteModalContext.textContent = 'Choose the coverage path that fits what you need today.';
    choicePanel.hidden = false;
    surveyPanel.hidden = true;
    quoteModalEl.dataset.openingSurvey = '';
    quoteModalEl.dataset.activeSurveyId = '';
  }

  function showSurvey(surveyId, surveyTitle) {
    if (!surveyId) return;
    const cleanTitle = surveyTitle || 'Insurance';
    if (quoteModalTitle) quoteModalTitle.textContent = cleanTitle + ' Quote Form';
    if (quoteModalContext) quoteModalContext.textContent = 'You selected ' + cleanTitle + '. Complete the form below to continue.';
    if (surveyLabel) surveyLabel.textContent = cleanTitle + ' Quote Form';
    choicePanel.hidden = true;
    surveyPanel.hidden = false;
    quoteModalEl.dataset.activeSurveyId = surveyId;

    const nextSrc = 'https://apiautomate.nowcerts.com/widget/survey/' + encodeURIComponent(surveyId);
    if (surveyFrame.dataset.currentSurveyId !== surveyId) {
      surveyFrame.dataset.currentSurveyId = surveyId;
      surveyFrame.src = nextSrc;
    }
  }

  function openSurveyFromOption(option) {
    const optionData = getOptionData(option);
    const openQuoteSurvey = () => {
      quoteModalEl.dataset.openingSurvey = 'true';
      showSurvey(optionData.surveyId, optionData.title);
      quoteModal.show();
    };

    if (mobileModalEl && mobileModalEl.classList.contains('show') && mobileModal) {
      mobileModalEl.addEventListener('hidden.bs.modal', openQuoteSurvey, { once: true });
      mobileModal.hide();
      return;
    }

    openQuoteSurvey();
  }

  if (heroDropdown && dropdownToggle) {
    dropdownToggle.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();

      if (usesMobileInsuranceMenu() && mobileModal) {
        heroDropdown.classList.remove('show');
        dropdownToggle.setAttribute('aria-expanded', 'false');
        mobileModal.show();
        return;
      }

      const isOpen = heroDropdown.classList.toggle('show');
      dropdownToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', e => {
      if (!heroDropdown.contains(e.target)) {
        heroDropdown.classList.remove('show');
        dropdownToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  quoteModalEl.addEventListener('show.bs.modal', () => {
    if (quoteModalEl.dataset.openingSurvey !== 'true') showChoices();
  });

  quoteModalEl.addEventListener('hidden.bs.modal', showChoices);

  if (backBtn) backBtn.addEventListener('click', showChoices);

  document.querySelectorAll('[data-quote-choice-opener]').forEach(opener => {
    opener.addEventListener('click', e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      quoteModalEl.dataset.openingSurvey = '';
      showChoices();
      quoteModal.show();
    });
  });

  document.querySelectorAll('.survey-modal-option').forEach(option => {
    if (option.dataset.quoteGenerated === 'true') return;
    option.addEventListener('click', e => {
      e.preventDefault();
      openSurveyFromOption(option);
    });
  });

  document.querySelectorAll('.survey-direct-option').forEach(option => {
    option.addEventListener('click', e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (heroDropdown && heroDropdown.contains(option)) {
        heroDropdown.classList.remove('show');
        if (dropdownToggle) dropdownToggle.setAttribute('aria-expanded', 'false');
      }
      openSurveyFromOption(option);
    });
  });
}

function normalizeQuoteModal() {
  const quoteModalEl = document.getElementById('quoteModal');
  if (!quoteModalEl || quoteModalEl.querySelector('#quoteChoicePanel')) return;

  const dialog = quoteModalEl.querySelector('.modal-dialog');
  const content = quoteModalEl.querySelector('.modal-content');
  const header = quoteModalEl.querySelector('.modal-header');
  const body = quoteModalEl.querySelector('.modal-body');
  if (!dialog || !content || !header || !body) return;

  dialog.classList.add('quote-flow-dialog');
  content.classList.add('quote-flow-modal');
  header.className = 'modal-header border-0 text-white quote-modal-header';
  header.innerHTML = `
<div class="quote-modal-heading">
<span class="quote-modal-icon"><i class="fa-solid fa-shield-halved"></i></span>
<div>
<h5 class="modal-title" id="quoteModalTitle">Select Insurance</h5>
<p id="quoteModalContext">Choose the coverage path that fits what you need today.</p>
</div>
</div>
<button aria-label="Close" class="btn-close btn-close-white" data-bs-dismiss="modal" type="button"></button>`;

  body.id = 'quoteModalBody';
  body.className = 'modal-body p-0';
  body.innerHTML = `
<div class="quote-choice-grid" id="quoteChoicePanel">
<div class="insurance-select-feature">
<span class="mega-eyebrow">Motive Insurance</span>
<h3>Select Insurance</h3>
<p>Choose the coverage path that fits what you need today.</p>
</div>
<div class="insurance-select-options" id="quoteInsuranceOptions"></div>
</div>
<div class="quote-survey-panel" id="quoteSurveyPanel" hidden>
<div class="quote-survey-toolbar">
<button class="btn btn-sm btn-outline-primary quote-back-btn" id="quoteBackBtn" type="button"><i class="fa-solid fa-arrow-left me-1"></i> Select Insurance</button>
<span id="quoteSurveyLabel">Quote Form</span>
</div>
<div class="quote-survey-frame-wrap">
<iframe class="quote-survey-frame" id="quoteSurveyFrame" src="about:blank" data-current-survey-id="" title="Insurance quote form"></iframe>
</div>
</div>`;
}

function initializePersonalHeroSlider() {
  document.querySelectorAll('.personal-hero-slider').forEach(slider => {
    const slides = Array.from(slider.querySelectorAll('.personal-hero-slide'));
    const dots = Array.from(slider.querySelectorAll('.personal-hero-dots button'));
    if (!slides.length || slides.length !== dots.length) return;
    let activeIndex = slides.findIndex(slide => slide.classList.contains('is-active'));
    if (activeIndex < 0) activeIndex = 0;

    const showSlide = index => {
      activeIndex = index;
      slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === index));
      dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
    };

    let slideTimer = setInterval(() => {
      showSlide((activeIndex + 1) % slides.length);
    }, 2500);

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        clearInterval(slideTimer);
        slideTimer = setInterval(() => {
          showSlide((activeIndex + 1) % slides.length);
        }, 2500);
      });
    });
  });
}


function initializeMegaMenuPreviews() {
  const previewMap = {
    'auto.html': 'images/automobile_hero.jpg',
    'bundled-insurance.html': 'images/personal_bundle.jpg',
    'motorcycle.html': 'images/motorcycle.png',
    'homeowners.html': 'images/personal_home2.jpg',
    'rental.html': 'images/rental.png',
    'condo.html': 'images/condo.png',
    'ilivs.html': 'images/sr22.png',
    'commercial-truck.html': 'images/hero-commercial-2.png',
    'commercial-van.html': 'images/commercial_van3.jpg',
    'specialtytransportation.html': 'images/commercial_specialty.jpg',
    'surety-bonds.html': 'images/suretybond2.png',
    'general-liability.html': 'images/generalliability.jpg',
    'workers-compensation.html': 'images/commercial_workerscomp.jpg'
  };
  const previewPositionMap = {
    'condo.html': 'calc(75% - 45px) center'
  };

  document.querySelectorAll('.has-mega-menu .mega-menu-panel').forEach(panel => {
    const feature = panel.querySelector('.mega-menu-feature');
    if (!feature) return;
    const defaultImage = previewMap['auto.html'];
    feature.style.setProperty('--mega-preview-img', `url('${defaultImage}')`);
    feature.style.setProperty('--mega-preview-position', '75% center');

    panel.querySelectorAll('.mega-link-card[href]').forEach(link => {
      const href = (link.getAttribute('href') || '').split('#')[0].split('?')[0];
      const previewImage = previewMap[href];
      if (!previewImage) return;

      const setPreview = () => {
        feature.style.setProperty('--mega-preview-img', `url('${previewImage}')`);
        feature.style.setProperty('--mega-preview-position', previewPositionMap[href] || '75% center');
      };

      link.addEventListener('mouseenter', setPreview);
      link.addEventListener('focus', setPreview);
    });
  });
}
