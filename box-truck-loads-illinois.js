'use strict';

(() => {
  const articleTopic = 'boxtruck_loads';
  const sendEvent = (name, details = {}) => {
    if (typeof window.gtag === 'function') window.gtag('event', name, { article_topic: articleTopic, ...details });
  };
  const makeList = (node, values) => {
    node.replaceChildren(...values.map(value => {
      const item = document.createElement('li');
      item.textContent = value;
      return item;
    }));
  };

  function initNavigator() {
    const root = document.querySelector('[data-freight-navigator]');
    if (!root) return;
    const form = root.querySelector('form');
    const steps = Array.from(form.querySelectorAll('[data-nav-step]'));
    const previous = root.querySelector('[data-nav-previous]');
    const next = root.querySelector('[data-nav-next]');
    const progressText = root.querySelector('[data-nav-progress-text]');
    const progressBar = root.querySelector('[data-nav-progress-bar]');
    const result = root.querySelector('[data-nav-result]');
    steps.forEach(step => step.querySelector('legend').setAttribute('tabindex', '-1'));
    let currentStep = 0;
    let started = false;

    const paths = {
      boards: {
        title: 'Load Boards', section: '#load-boards', link: 'Jump to Load Boards',
        why: 'You need access to available freight while you learn which lanes and rates fit your truck.',
        actions: ['Set equipment and location filters for box-truck freight.', 'Compare total miles and expenses before booking.', 'Record which postings lead to workable lanes.'],
        avoid: 'Booking only from the posted rate without checking deadhead and delivery requirements.',
        secondary: ['Build a short list of brokers who move matching freight.', 'Track customers whose repeat needs match your service area.']
      },
      brokers: {
        title: 'Broker Relationships', section: '#freight-brokers', link: 'Jump to Freight Brokers',
        why: 'You want repeat opportunities without carrying the full direct-customer sales effort immediately.',
        actions: ['Build a complete carrier setup packet.', 'Identify brokers who regularly move straight-truck freight.', 'Follow up after each successfully completed load.'],
        avoid: 'Applying blindly to brokers whose freight does not match your equipment.',
        secondary: ['Use load boards to understand active lanes.', 'Document your service promise for future direct outreach.']
      },
      direct: {
        title: 'Direct Shippers', section: '#direct-customers', link: 'Jump to Direct Shippers',
        why: 'You are prepared to invest in customer outreach and own more of the service relationship.',
        actions: ['Define a specific service area and delivery promise.', 'Build a prospect list of shippers with matching needs.', 'Schedule weekly outreach and follow-up.'],
        avoid: 'Pitching every business with a vague “we have a truck” message.',
        secondary: ['Use brokers for capacity gaps while accounts develop.', 'Measure which customer requests could become recurring routes.']
      },
      routes: {
        title: 'Dedicated Routes', section: '#dedicated-routes', link: 'Jump to Dedicated Routes',
        why: 'You prefer recurring work and can plan around a consistent lane or schedule.',
        actions: ['Identify customers with repeat delivery patterns.', 'Estimate weekly miles, timing, and equipment needs.', 'Price the whole recurring service, including repositioning.'],
        avoid: 'Committing to a schedule before validating capacity and the full route cost.',
        secondary: ['Build direct-customer conversations around reliability.', 'Use broker freight only when it fits your route commitments.']
      },
      new: {
        title: 'New-Authority Starting Plan', section: '#new-authority', link: 'Jump to New Authority',
        why: 'Your operation is still building its first track record, so a focused, realistic starting process matters.',
        actions: ['Confirm your carrier profile and required documents are ready.', 'Choose one equipment-matched lane or customer type.', 'Price each first load using total miles and your own costs.'],
        avoid: 'Assuming every broker or board accepts new authority or that any first load is worthwhile.',
        secondary: ['Prepare your broker packet before outreach.', 'Begin a small direct-shipper prospect list for repeat work.']
      }
    };

    function selected(name) { return form.querySelector(`input[name="${name}"]:checked`)?.value || ''; }
    function showStep() {
      form.hidden = false;
      result.hidden = true;
      steps.forEach((step, index) => { step.hidden = index !== currentStep; });
      const percent = (currentStep + 1) * 25;
      progressText.textContent = `Question ${currentStep + 1} of 4`;
      progressBar.setAttribute('aria-valuenow', String(percent));
      progressBar.querySelector('span').style.width = `${percent}%`;
      previous.disabled = currentStep === 0;
      next.disabled = !selected(['priority', 'stage', 'relationship', 'effort'][currentStep]);
      next.textContent = currentStep === 3 ? 'See my starting path' : 'Next';
    }
    function recommend() {
      const priority = selected('priority');
      const stage = selected('stage');
      const relationship = selected('relationship');
      const effort = selected('effort');
      const score = { boards: 0, brokers: 0, direct: 0, routes: 0, new: 0 };
      score[priority] += 6;
      const relationshipPath = { fast: 'boards', brokers: 'brokers', direct: 'direct', routes: 'routes' }[relationship];
      if (relationshipPath) score[relationshipPath] += 3;
      if (stage === 'new') score.new += 4;
      if (stage === 'under_year') { score.boards += 1; score.brokers += 1; }
      if (stage === 'established') { score.direct += 1; score.routes += 1; }
      if (effort === 'little') { score.boards += 2; score.brokers += 1; }
      if (effort === 'some') score.brokers += 2;
      if (effort === 'weekly') { score.direct += 2; score.routes += 1; }
      if (effort === 'accounts') { score.direct += 3; score.routes += 2; }
      const primary = Object.keys(score).sort((a, b) => score[b] - score[a] || (a === priority ? -1 : b === priority ? 1 : 0))[0];
      return { primary, stage, effort, path: paths[primary] };
    }
    function complete() {
      const { primary, stage, effort, path } = recommend();
      form.hidden = true;
      result.hidden = false;
      progressText.textContent = 'Starting path ready';
      progressBar.setAttribute('aria-valuenow', '100');
      progressBar.querySelector('span').style.width = '100%';
      result.querySelector('[data-nav-title]').textContent = path.title;
      result.querySelector('[data-nav-why]').textContent = `${path.why} This starting path reflects your ${stage === 'new' ? 'new business' : stage === 'under_year' ? 'first year' : 'established operation'} and ${effort === 'little' ? 'limited' : effort === 'some' ? 'moderate' : effort === 'weekly' ? 'weekly' : 'active account-building'} sales effort; it is not a universal rule.`;
      makeList(result.querySelector('[data-nav-actions]'), path.actions);
      result.querySelector('[data-nav-avoid]').textContent = path.avoid;
      makeList(result.querySelector('[data-nav-secondary]'), path.secondary);
      const link = result.querySelector('[data-nav-link]');
      link.href = path.section;
      link.textContent = path.link;
      sendEvent('pf20_freight_navigator_complete', { primary_result: primary, business_stage: stage, sales_effort: effort });
      result.querySelector('[data-nav-title]').setAttribute('tabindex', '-1');
      result.querySelector('[data-nav-title]').focus();
    }
    form.addEventListener('change', event => {
      if (event.target.matches('input[type="radio"]')) {
        if (!started) { sendEvent('pf20_freight_navigator_start'); started = true; }
        showStep();
      }
    });
    next.addEventListener('click', () => {
      if (!selected(['priority', 'stage', 'relationship', 'effort'][currentStep])) return;
      if (currentStep < 3) { currentStep += 1; showStep(); steps[currentStep].querySelector('legend').focus(); }
      else complete();
    });
    previous.addEventListener('click', () => { if (currentStep > 0) { currentStep -= 1; showStep(); steps[currentStep].querySelector('legend').focus(); } });
    result.querySelector('[data-nav-restart]').addEventListener('click', () => { form.reset(); currentStep = 0; started = false; showStep(); steps[0].querySelector('legend').focus(); });
    showStep();
  }

  function initCalculator() {
    const root = document.querySelector('[data-load-calculator]');
    if (!root) return;
    const form = root.querySelector('form');
    const names = ['loadPay', 'loadedMiles', 'deadheadPickup', 'deadheadAfter', 'costPerMile', 'tolls', 'otherExpenses', 'desiredMargin'];
    const required = new Set(['loadPay', 'loadedMiles', 'costPerMile']);
    const results = Object.fromEntries(Array.from(root.querySelectorAll('[data-calc-result]')).map(node => [node.dataset.calcResult, node]));
    const signal = root.querySelector('[data-calc-signal]');
    const signalTitle = root.querySelector('[data-calc-signal-title]');
    const signalCopy = root.querySelector('[data-calc-signal-copy]');
    const announcement = root.querySelector('[data-calc-announce]');
    const money = value => Number.isFinite(value) ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
    const miles = value => Number.isFinite(value) ? value.toLocaleString('en-US', { maximumFractionDigits: 1 }) + ' mi' : '—';
    const percent = value => Number.isFinite(value) ? value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%' : '—';
    let started = false;
    let completed = false;
    let announceTimer;

    function read(name, showErrors) {
      const input = form.elements[name];
      const raw = input.value.trim();
      let error = '';
      let value = 0;
      if (input.validity.badInput) error = 'Enter a numeric value.';
      else if (!raw && required.has(name)) error = 'This field is required.';
      else if (raw) {
        value = Number(raw);
        if (!Number.isFinite(value)) error = 'Enter a finite number.';
        else if (value < Number(input.min)) error = 'Use zero or a positive number.';
        else if (input.max && value > Number(input.max)) error = 'This value is too large.';
      }
      input.setAttribute('aria-invalid', String(Boolean(error && showErrors)));
      const message = form.querySelector(`#error-${name}`);
      message.textContent = showErrors ? error : '';
      return { value, valid: !error };
    }
    function setSignal(state, title, copy) {
      signal.dataset.state = state;
      if (signalTitle.textContent !== title) signalTitle.textContent = title;
      if (signalCopy.textContent !== copy) signalCopy.textContent = copy;
    }
    function announce(text) {
      clearTimeout(announceTimer);
      announceTimer = setTimeout(() => { announcement.textContent = text; }, 500);
    }
    function clearResults() { Object.values(results).forEach(node => { node.textContent = '—'; }); }
    function band(value, limits, labels) { return value <= limits[0] ? labels[0] : value <= limits[1] ? labels[1] : value <= limits[2] ? labels[2] : labels[3]; }
    function update(showErrors = started) {
      const fields = Object.fromEntries(names.map(name => [name, read(name, showErrors)]));
      if (Object.values(fields).some(field => !field.valid)) {
        clearResults();
        announce('');
        setSignal('incomplete', 'Incomplete Inputs', 'Complete the required fields and resolve any highlighted values.');
        return;
      }
      const get = name => fields[name].value;
      const pay = get('loadPay');
      const loaded = get('loadedMiles');
      const deadhead = get('deadheadPickup') + get('deadheadAfter');
      const total = loaded + deadhead;
      const cost = total * get('costPerMile') + get('tolls') + get('otherExpenses');
      const contribution = pay - cost;
      const margin = pay > 0 ? contribution / pay * 100 : NaN;
      const deadheadPercent = total > 0 ? deadhead / total * 100 : NaN;
      results.loadPay.textContent = money(pay);
      results.totalMiles.textContent = miles(total);
      results.totalDeadhead.textContent = miles(deadhead);
      results.rateLoaded.textContent = loaded > 0 ? money(pay / loaded) : '—';
      results.rateTotal.textContent = total > 0 ? money(pay / total) : '—';
      results.operatingCost.textContent = money(cost);
      results.contribution.textContent = money(contribution);
      results.margin.textContent = percent(margin);
      results.deadheadPercent.textContent = percent(deadheadPercent);
      if (pay <= 0 || loaded <= 0 || total <= 0) {
        announce('');
        setSignal('incomplete', 'Incomplete Inputs', 'Use positive load pay and loaded miles to compare a margin and per-mile rates.');
        return;
      }
      if (!Number.isFinite(margin)) {
        announce('');
        setSignal('incomplete', 'Incomplete Inputs', 'These values produce a margin too large to display. Review the amounts before comparing this load.');
        return;
      }
      const meets = margin >= get('desiredMargin');
      setSignal(meets ? 'meets' : 'below', meets ? 'Meets Your Target' : 'Below Your Target', meets
        ? 'This load meets the minimum margin you entered.'
        : 'This load falls below the minimum margin you entered. Review the rate, deadhead, operating cost, or other expenses before deciding.');
      announce(`Estimated contribution ${money(contribution)}. Estimated margin ${percent(margin)}. ${meets ? 'Meets' : 'Below'} your target.`);
      if (!completed) {
        sendEvent('pf20_load_calculator_complete', {
          margin_result: meets ? 'meets_target' : 'below_target',
          deadhead_band: band(Math.round(deadheadPercent), [10, 25, 40], ['0-10', '11-25', '26-40', '40+']),
          margin_band: band(margin, [0, 10, 25], ['zero_or_below', 'above_0_to_10', 'above_10_to_25', 'above_25'])
        });
        completed = true;
      }
    }
    form.addEventListener('input', () => {
      if (!started) { sendEvent('pf20_load_calculator_start'); started = true; }
      update();
    });
    form.addEventListener('change', () => update());
    form.addEventListener('submit', event => event.preventDefault());
    form.addEventListener('reset', () => {
      sendEvent('pf20_load_calculator_reset');
      started = false;
      completed = false;
      clearTimeout(announceTimer);
      announcement.textContent = '';
      setTimeout(() => update(false), 0);
    });
    update(false);
  }

  function initChecklist() {
    const root = document.querySelector('[data-checklist]');
    if (!root) return;
    const section = root.closest('.loads-checklist-section');
    const boxes = Array.from(root.querySelectorAll('input[data-check-id]'));
    const countNode = section.querySelector('[data-check-count]');
    const percentNode = section.querySelector('[data-check-percent]');
    const progress = section.querySelector('[data-check-progress]');
    const reset = section.querySelector('[data-check-reset]');
    const complete = section.querySelector('[data-check-complete]');
    const storageKey = 'motive_boxtruck_freight_ready_v1';
    const milestones = [25, 50, 75, 100];
    const fired = new Set();
    let started = false;
    let completeSent = false;
    let previousPercent = 0;

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(saved)) {
        const checked = new Set(saved);
        boxes.forEach(box => { box.checked = checked.has(box.dataset.checkId); });
      }
    } catch (error) { /* Storage can be unavailable or stale; the checklist remains usable. */ }
    function save() {
      try { localStorage.setItem(storageKey, JSON.stringify(boxes.filter(box => box.checked).map(box => box.dataset.checkId))); }
      catch (error) { /* A blocked storage write does not block the checklist. */ }
    }
    function update(track = true) {
      const done = boxes.filter(box => box.checked).length;
      const pct = Math.round(done / boxes.length * 100);
      countNode.textContent = `${done} / ${boxes.length} complete`;
      percentNode.textContent = `${pct}%`;
      progress.setAttribute('aria-valuenow', String(pct));
      progress.querySelector('span').style.width = `${pct}%`;
      reset.disabled = done === 0;
      root.querySelectorAll('[data-check-category]').forEach(group => {
        const groupBoxes = Array.from(group.querySelectorAll('input[data-check-id]'));
        const groupDone = groupBoxes.filter(box => box.checked).length;
        group.querySelector('[data-category-progress]').textContent = `${groupDone} / ${groupBoxes.length}`;
      });
      complete.hidden = done !== boxes.length;
      if (track) {
        milestones.forEach(milestone => {
          if (previousPercent < milestone && pct >= milestone && !fired.has(milestone)) {
            sendEvent('pf20_freight_checklist_progress', { progress_milestone: milestone });
            fired.add(milestone);
          }
        });
        if (done === boxes.length && !completeSent) {
          sendEvent('pf20_freight_checklist_complete', { progress_milestone: 100 });
          completeSent = true;
        }
      }
      previousPercent = pct;
      save();
    }
    update(false);
    milestones.filter(value => value <= previousPercent).forEach(value => fired.add(value));
    completeSent = boxes.every(box => box.checked);
    root.addEventListener('change', event => {
      if (!event.target.matches('input[data-check-id]')) return;
      if (!started) { sendEvent('pf20_freight_checklist_start'); started = true; }
      update();
    });
    reset.addEventListener('click', () => {
      const done = boxes.filter(box => box.checked).length;
      if (done >= 5 && !window.confirm(`Reset all ${done} checked items? This cannot be undone.`)) return;
      boxes.forEach(box => { box.checked = false; });
      fired.clear();
      completeSent = false;
      started = false;
      previousPercent = 0;
      update(false);
      sendEvent('pf20_freight_checklist_reset');
    });
  }

  initNavigator();
  initCalculator();
  initChecklist();
})();
