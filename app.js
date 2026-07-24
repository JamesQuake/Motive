// MOTIVE INSURANCE - Client-side interactions
'use strict';
const SITE_INFO = {
  phone: '888 943 0888',
  addresses: [
    ['4801 Southwick Dr, Suite 270', 'Matteson, IL 60443'],
    ['333 N Wood Dale Rd # 207', 'Wood Dale, IL 60191']
  ],
  statesServed: ['Illinois', 'Indiana', 'Wisconsin']
};

document.addEventListener('DOMContentLoaded', () => {
  applySiteInfo();
  initializeLocalRating();
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

function initializeLocalRating() {
  document.querySelectorAll('[data-rating-source]').forEach(ratingEl => {
    const source = ratingEl.getAttribute('data-rating-source');
    if (!source || !window.fetch) return;

    fetch(source, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('Rating data unavailable');
        return response.json();
      })
      .then(data => {
        const rating = data.rating;
        const reviewCount = data.reviewCount;
        const label = data.source || 'reviews';
        if (!rating || reviewCount === undefined) return;

        const ratingValue = ratingEl.querySelector('[data-rating-value]');
        const ratingCount = ratingEl.querySelector('[data-rating-count]');
        const ratingLabel = ratingEl.querySelector('[data-rating-label]');
        if (ratingValue) ratingValue.textContent = String(rating);
        if (ratingCount) ratingCount.textContent = `from ${Number(reviewCount).toLocaleString()}`;
        if (ratingLabel) ratingLabel.textContent = label;
        ratingEl.setAttribute('aria-label', `${rating} rating from ${Number(reviewCount).toLocaleString()} ${label}`);
      })
      .catch(() => {
        // Keep the embedded fallback text when the local JSON cannot be loaded.
      });
  });
}

function initializeQuoteFlow() {
  normalizeQuoteModal();

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
    : Array.from(document.querySelectorAll('.survey-direct-option[data-survey-id]')).filter((link, index, links) => (
      links.findIndex(candidate => candidate.dataset.surveyId === link.dataset.surveyId) === index
    ));

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

function applySiteInfo() {
  document.querySelectorAll('.footer').forEach(footer => {
    const locationTitle = Array.from(footer.querySelectorAll('.footer-title')).find(title => title.textContent.trim() === 'Locations');
    if (locationTitle) locationTitle.textContent = 'Locations';

    const address = footer.querySelector('address');
    if (address) {
      const locations = SITE_INFO.addresses
        .map((lines, index) => `${index ? '<br/>' : ''}<i class="fa-solid fa-location-dot text-orange me-2"></i>${lines[0]}<br/>
<span class="ms-4">${lines[1]}</span>`)
        .join('');
      address.innerHTML = `${locations}<br/>
<i class="fa-solid fa-phone text-orange me-2"></i>${SITE_INFO.phone}`;
    }

    const stateList = footer.querySelector('.state-list');
    if (stateList) {
      stateList.innerHTML = SITE_INFO.statesServed
        .map(state => `<li><i class="fa-solid fa-check-circle text-orange me-2"></i> ${state}</li>`)
        .join('');
    }
  });
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
    'auto.html': 'images/automobile_hero.png',
    'bundled-insurance.html': 'images/personal_bundle.png',
    'motorcycle.html': 'images/motorcycle.png',
    'homeowners.html': 'images/personal_home2.png',
    'rental.html': 'images/rental.png',
    'condo.html': 'images/condo.png',
    'ilivs.html': 'images/sr22.png',
    'commercial-truck.html': 'images/hero-commercial-2.png',
    'commercial-van.html': 'images/commercial_van3.jpg',
    'specialtytransportation.html': 'images/commercial_specialty.png',
    'surety-bonds.html': 'images/suretybond2.png',
    'general-liability.html': 'images/generalliability.png',
    'workers-compensation.html': 'images/commercial_workerscomp.png'
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
