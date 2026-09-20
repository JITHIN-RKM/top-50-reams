(function () {
  'use strict';

  var DATA_URL = 'assets/data/sih2026-ps.json';
  var PAGE_SIZE = 24;
  var EBOOK_URL = 'https://topmate.io/dasandcode/2222164?coupon_code=SIH26&utm_source=website&utm_medium=cta&utm_campaign=sih2026ps&utm_content=detail-panel';
  var MASTER_PROMPT_URL = 'https://harvest-english-1be.notion.site/SIH-Problem-Statement-Master-Prompt-3bf474fce16681aeb13ac8494644cb7d';

  var VERDICT_EMOJI = { GREEN: '🟢', YELLOW: '🟡', RED: '🔴' };

  var FILTER_LABELS = {
    psFilterCategory: 'Category',
    psFilterTheme: 'Theme',
    psFilterOrg: 'Org',
    psFilterInnovation: 'Innovation',
    psFilterEffort: 'Effort',
    psFilterVerdict: 'Verdict'
  };

  var TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'evaluator', label: 'Evaluator Lens' },
    { id: 'plan', label: '36-Hr Plan' },
    { id: 'unlock', label: 'Unlock More' }
  ];

  var allRecords = [];
  var filtered = [];
  var visibleCount = PAGE_SIZE;
  var activeTab = 'overview';
  var el = {};

  function qs(id) { return document.getElementById(id); }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort();
  }

  function populateSelect(select, values) {
    values.forEach(function (v) {
      var opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      select.appendChild(opt);
    });
  }

  function daysUntil(dateStr) {
    if (!dateStr) return null;
    var target = new Date(dateStr + 'T00:00:00');
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.round((target - now) / 86400000);
  }

  function parseIdeas(str) {
    if (!str) return 0;
    var m = String(str).match(/^(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  function tierClass(prefix, tier) {
    return prefix + '-' + (tier || '').toLowerCase().replace(/\s+/g, '-');
  }

  /* ---------------- Grid ---------------- */

  function cardTemplate(r, idx) {
    var days = daysUntil(r.deadline_date);
    var soonClass = (days !== null && days <= 14 && days >= 0) ? ' deadline-soon' : '';
    var deadlineLabel = r.deadline || 'TBA';
    if (days !== null && days >= 0) deadlineLabel += ' (' + days + 'd left)';
    var innovationTier = (r.innovation_scope && r.innovation_scope.tier) || 'Moderate';
    var effortTier = (r.invention_effort && r.invention_effort.tier) || 'Medium';
    var verdictTier = (r.verdict && r.verdict.tier) || 'YELLOW';
    var staggerClass = ' reveal-stagger-' + ((idx % 8) + 1);

    var catIcon = r.category === 'Hardware' ? 'microchip' : 'code';

    return (
      '<article class="sih-ps-card' + staggerClass + '" data-ps="' + r.ps_number + '" data-reveal tabindex="0" role="button" aria-label="Open ' + escapeHtml(r.ps_number) + '">' +
        '<div class="ps-top-row">' +
          '<span class="ps-number"><span class="ps-verdict-emoji" title="Verdict: ' + verdictTier + '" aria-label="Verdict ' + verdictTier + '">' + (VERDICT_EMOJI[verdictTier] || '') + '</span>' + r.ps_number + '</span>' +
          '<span class="ps-category ' + r.category.toLowerCase() + '"><i class="fa-sharp fa-solid fa-' + catIcon + '"></i>' + r.category + '</span>' +
        '</div>' +
        '<h3 class="ps-title">' + escapeHtml(r.title) + '</h3>' +
        '<span class="ps-org"><i class="fa-sharp fa-regular fa-building-columns"></i>' + escapeHtml(r.org) + '</span>' +
        '<span class="ps-theme"><i class="fa-sharp fa-regular fa-tag"></i>' + escapeHtml(r.theme) + '</span>' +
        '<div class="ps-signal-strip">' +
          '<span class="ps-signal-meta">' +
            '<span class="ps-signal-item tier-' + innovationTier.toLowerCase() + '"><i class="ps-dot"></i>' + innovationTier + '</span>' +
            '<span class="ps-signal-item tier-' + effortTier.toLowerCase() + '"><i class="ps-dot"></i>' + effortTier + ' Effort</span>' +
          '</span>' +
        '</div>' +
        '<div class="ps-meta-row">' +
          '<span class="' + (soonClass ? 'deadline-soon' : '') + '">Deadline: ' + escapeHtml(deadlineLabel) + '</span>' +
          '<span>Ideas: ' + escapeHtml(r.ideas || 'N/A') + '</span>' +
        '</div>' +
      '</article>'
    );
  }

  function renderGrid() {
    var toShow = filtered.slice(0, visibleCount);
    el.grid.innerHTML = toShow.length
      ? toShow.map(function (r, i) { return cardTemplate(r, i); }).join('')
      : '<div class="sih-empty-state">No problem statements match these filters. Try widening your search.</div>';
    el.resultCount.innerHTML = 'Showing <b>' + toShow.length + '</b> of <b>' + filtered.length + '</b> problem statements (226 total)';
    el.loadMoreWrap.classList.toggle('is-hidden', visibleCount >= filtered.length);
    initScrollReveal();
  }

  /* ---------------- Filters ---------------- */

  function currentFilterValues() {
    return {
      psFilterCategory: el.filterCategory.value,
      psFilterTheme: el.filterTheme.value,
      psFilterOrg: el.filterOrg.value,
      psFilterInnovation: el.filterInnovation.value,
      psFilterEffort: el.filterEffort.value,
      psFilterVerdict: el.filterVerdict.value
    };
  }

  function renderActiveChips() {
    var values = currentFilterValues();
    var chips = [];
    Object.keys(values).forEach(function (key) {
      if (values[key]) {
        chips.push({ key: key, label: FILTER_LABELS[key] + ': ' + values[key] });
      }
    });
    el.activeChips.innerHTML = chips.map(function (c) {
      return '<span class="sih-chip" data-filter-key="' + c.key + '">' + escapeHtml(c.label) +
        '<button type="button" aria-label="Remove filter">&times;</button></span>';
    }).join('');

    var count = chips.length;
    el.filterActiveCount.textContent = count;
    el.filterActiveCount.classList.toggle('is-hidden', count === 0);
  }

  function applyFilters() {
    var q = el.search.value.trim().toLowerCase();
    var v = currentFilterValues();

    filtered = allRecords.filter(function (r) {
      if (v.psFilterCategory && r.category !== v.psFilterCategory) return false;
      if (v.psFilterTheme && r.theme !== v.psFilterTheme) return false;
      if (v.psFilterOrg && r.org !== v.psFilterOrg) return false;
      if (v.psFilterInnovation && (r.innovation_scope || {}).tier !== v.psFilterInnovation) return false;
      if (v.psFilterEffort && (r.invention_effort || {}).tier !== v.psFilterEffort) return false;
      if (v.psFilterVerdict && (r.verdict || {}).tier !== v.psFilterVerdict) return false;
      if (q) {
        var hay = (r.title + ' ' + r.org + ' ' + r.theme + ' ' + r.ps_number + ' ' + (r.description || '')).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    sortFiltered();
    visibleCount = PAGE_SIZE;
    renderActiveChips();
    renderGrid();
  }

  function sortFiltered() {
    var mode = el.sort.value;
    var effortRank = { Low: 0, Medium: 1, High: 2 };
    var innovationRank = { Incremental: 0, Moderate: 1, Breakthrough: 2 };
    var verdictRank = { RED: 0, YELLOW: 1, GREEN: 2 };

    filtered.sort(function (a, b) {
      switch (mode) {
        case 'deadline-asc': return (a.deadline_date || '9999').localeCompare(b.deadline_date || '9999');
        case 'ideas-desc': return parseIdeas(b.ideas) - parseIdeas(a.ideas);
        case 'ideas-asc': return parseIdeas(a.ideas) - parseIdeas(b.ideas);
        case 'effort-asc': return effortRank[(a.invention_effort || {}).tier] - effortRank[(b.invention_effort || {}).tier];
        case 'innovation-desc': return innovationRank[(b.innovation_scope || {}).tier] - innovationRank[(a.innovation_scope || {}).tier];
        case 'verdict-desc': return verdictRank[(b.verdict || {}).tier] - verdictRank[(a.verdict || {}).tier];
        default: return a.sno - b.sno;
      }
    });
  }

  function toggleDrawer(forceOpen) {
    var isOpen = typeof forceOpen === 'boolean' ? forceOpen : !el.filterDrawer.classList.contains('is-open');
    el.filterDrawer.classList.toggle('is-open', isOpen);
    el.filterToggle.setAttribute('aria-expanded', String(isOpen));
  }

  /* ---------------- Detail panel (tabbed) ---------------- */

  var VERDICT_LABEL = { GREEN: 'Strong Pick', YELLOW: 'Workable, Read the Fine Print', RED: 'High Risk Pick' };

  /* Icon-led section headings: purely decorative, the heading text itself is untouched, this
     just gives each section a scannable visual anchor instead of a wall of identical bold labels. */
  function h3(icon, text) {
    return '<h3><i class="fa-sharp fa-regular fa-' + icon + '"></i>' + text + '</h3>';
  }

  function renderHead(r) {
    var verdict = r.verdict || { tier: 'YELLOW' };
    var catIcon = r.category === 'Hardware' ? 'microchip' : 'code';
    var days = daysUntil(r.deadline_date);
    var soonClass = (days !== null && days <= 14 && days >= 0) ? ' is-soon' : '';
    return (
      '<div class="d-head-top">' +
        '<span class="d-ps-number">' + r.ps_number + '</span>' +
        '<span class="d-verdict-pill verdict-' + verdict.tier.toLowerCase() + '">' + verdict.tier + ' &middot; ' + (VERDICT_LABEL[verdict.tier] || '') + '</span>' +
      '</div>' +
      '<h2 class="d-title" id="sihDetailTitle">' + escapeHtml(r.title) + '</h2>' +
      '<div class="d-meta-row">' +
        '<span><i class="fa-sharp fa-regular fa-building-columns"></i>' + escapeHtml(r.org) + '</span>' +
        '<span><i class="fa-sharp fa-solid fa-' + catIcon + '"></i>' + r.category + '</span>' +
        '<span><i class="fa-sharp fa-regular fa-tag"></i>' + escapeHtml(r.theme) + '</span>' +
      '</div>' +
      '<div class="d-meta-row d-meta-row-stats">' +
        '<span class="' + (soonClass ? 'is-soon' : '') + '"><i class="fa-sharp fa-regular fa-calendar"></i>Deadline: ' + escapeHtml(r.deadline || 'TBA') + '</span>' +
        '<span><i class="fa-sharp fa-regular fa-chart-simple"></i>Ideas submitted: ' + escapeHtml(r.ideas || 'N/A') + '</span>' +
      '</div>'
    );
  }

  function renderTabBar() {
    return TABS.map(function (t) {
      return '<button type="button" class="sih-tab-btn' + (t.id === activeTab ? ' is-active' : '') +
        '" data-tab="' + t.id + '">' + t.label + '</button>';
    }).join('');
  }

  function swotBlock(label, cls, items) {
    if (!items || !items.length) return '';
    return (
      '<div class="d-swot-cell ' + cls + '">' +
        '<h4>' + label + '</h4>' +
        '<ul>' + items.map(function (i) { return '<li>' + escapeHtml(i) + '</li>'; }).join('') + '</ul>' +
      '</div>'
    );
  }

  function tabOverview(r) {
    var bullets = r.expected_solution_bullets || [];
    var pd = r.problem_decode || {};
    var pains = pd.pain_points || [];
    return (
      (pd.plain_summary ? h3('align-left', 'In Plain Terms') + '<p>' + escapeHtml(pd.plain_summary) + '</p>' : '') +
      (pd.why_it_matters ? '<p class="d-why-matters"><strong>Why it matters:</strong> ' + escapeHtml(pd.why_it_matters) + '</p>' : '') +
      (pains.length
        ? h3('triangle-exclamation', 'The Real Pain Points') + '<ul class="d-bullets">' + pains.map(function (b) { return '<li>' + escapeHtml(b) + '</li>'; }).join('') + '</ul>'
        : '') +
      (r.background ? h3('book-open', 'Background') + '<p>' + escapeHtml(r.background) + '</p>' : '') +
      (r.description ? h3('list-check', 'What They\'re Asking For') + '<p>' + escapeHtml(r.description) + '</p>' : '') +
      h3('lightbulb', 'Expected Solution, Key Points') +
      (bullets.length
        ? '<ul class="d-bullets">' + bullets.map(function (b) { return '<li>' + escapeHtml(b) + '</li>'; }).join('') + '</ul>'
        : '<p>Full breakdown not published by the ministry yet, check the source PS for the latest text.</p>')
    );
  }

  function tabAnalysis(r) {
    var innovation = r.innovation_scope || { tier: 'Moderate', reason: '' };
    var effort = r.invention_effort || { tier: 'Medium', score: 0 };
    var cl = r.competitive_landscape || {};
    var swot = r.swot || {};
    return (
      h3('wand-magic-sparkles', 'Innovation Scope') +
      '<div class="d-tier-callout">' +
        '<span class="tier-badge ' + tierClass('innovation', innovation.tier) + '">' + innovation.tier + '</span>' +
        '<p>' + escapeHtml(innovation.reason) + '</p>' +
      '</div>' +

      h3('gears', 'Invention Effort') +
      '<div class="d-tier-callout">' +
        '<span class="tier-badge ' + tierClass('effort', effort.tier) + '">' + effort.tier + '</span>' +
        '<div>' +
          '<p>Scored from the number of distinct components asked for, plus hardware/offline/multilingual/integration complexity signals in the official text.</p>' +
          '<p class="d-effort-score">Effort score: ' + effort.score + '</p>' +
        '</div>' +
      '</div>' +
      (r.category === 'Hardware'
        ? '<p class="d-note">This is a Hardware PS, budget real time for physical prototyping, sourcing parts and testing, not just code.</p>'
        : '<p class="d-note">Software effort scales with how many distinct components the expected solution asks for, more moving parts means more integration risk.</p>') +

      h3('chart-line', 'Competitive Landscape') +
      '<div class="d-tier-callout">' +
        '<span class="tier-badge ' + tierClass('crowd', cl.tier) + '">' + (cl.tier || 'Medium') + ' Crowding</span>' +
        '<p>' + escapeHtml(cl.reason || '') + '</p>' +
      '</div>' +
      (cl.common_approaches ? '<p class="d-note"><strong>What most teams will build:</strong> ' + escapeHtml(cl.common_approaches) + '</p>' : '') +
      (cl.differentiation_angle ? '<p class="d-note"><strong>How to stand out:</strong> ' + escapeHtml(cl.differentiation_angle) + '</p>' : '') +

      h3('grid-2', 'SWOT Snapshot') +
      '<div class="d-swot-grid">' +
        swotBlock('Strengths', 's-strength', swot.strengths) +
        swotBlock('Weaknesses', 's-weakness', swot.weaknesses) +
        swotBlock('Opportunities', 's-opportunity', swot.opportunities) +
        swotBlock('Threats', 's-threat', swot.threats) +
      '</div>'
    );
  }

  var SCORECARD_PREFIX = {
    innovation: 'innovation', invention: 'effort', technical_feasibility: 'feas',
    impact_benefits: 'impact', architecture: 'arch'
  };
  var SCORECARD_ORDER = ['innovation', 'invention', 'technical_feasibility', 'impact_benefits', 'architecture'];

  function scorecardRow(key, axis) {
    if (!axis) return '';
    var prefix = SCORECARD_PREFIX[key] || 'tier';
    return (
      '<div class="d-score-row">' +
        '<div class="d-score-head">' +
          '<span class="d-score-label">' + escapeHtml(axis.label) + '</span>' +
          '<span class="tier-badge ' + tierClass(prefix, axis.tier) + '">' + axis.tier + '</span>' +
        '</div>' +
        '<p>' + escapeHtml(axis.note) + '</p>' +
      '</div>'
    );
  }

  function tabEvaluator(r) {
    var verdict = r.verdict || { tier: 'YELLOW', why: '', strength: '', risk: '', validate: '' };
    var qs = r.evaluator_questions || [];
    var scorecard = r.evaluation_scorecard || {};
    return (
      h3('clipboard-check', 'Evaluation Scorecard') +
      '<div class="d-scorecard">' +
        SCORECARD_ORDER.map(function (k) { return scorecardRow(k, scorecard[k]); }).join('') +
      '</div>' +

      h3('gavel', 'Overall Verdict') +
      '<div class="d-verdict-block verdict-' + verdict.tier.toLowerCase() + '">' +
        '<span class="d-verdict-tier">' + verdict.tier + '</span>' +
        '<p>' + escapeHtml(verdict.why) + '</p>' +
      '</div>' +
      '<ul class="d-bullets d-verdict-detail">' +
        (verdict.strength ? '<li><strong>Biggest strength:</strong> ' + escapeHtml(verdict.strength) + '</li>' : '') +
        (verdict.risk ? '<li><strong>Biggest risk:</strong> ' + escapeHtml(verdict.risk) + '</li>' : '') +
        (verdict.validate ? '<li><strong>Validate before you commit:</strong> ' + escapeHtml(verdict.validate) + '</li>' : '') +
      '</ul>' +
      h3('circle-question', 'What The Evaluator Will Likely Ask') +
      (qs.length
        ? '<ul class="d-bullets d-eval-questions">' + qs.map(function (q) { return '<li>' + escapeHtml(q) + '</li>'; }).join('') + '</ul>'
        : '<p>Run this PS through the Master Prompt for a full evaluator-style stress test.</p>')
    );
  }

  function planStageBlock(stage) {
    if (!stage) return '';
    return (
      '<div class="d-phase-block"><h4>' + escapeHtml(stage.label) + '</h4><ul>' +
        (stage.items || []).map(function (b) { return '<li>' + escapeHtml(b) + '</li>'; }).join('') +
      '</ul></div>'
    );
  }

  function tabPlan(r) {
    var plan = r.build_plan_36h || {};
    return (
      h3('stopwatch', '36-Hour Build Plan') +
      planStageBlock(plan.stage_idea) +
      planStageBlock(plan.stage_prototype) +
      planStageBlock(plan.stage_integration) +
      planStageBlock(plan.stage_polish)
    );
  }

  function tabUnlock(r) {
    return (
      h3('arrow-up-right-from-square', 'Go Deeper On This Exact PS') +
      '<div class="d-cta-block">' +
        '<h4>Run the full 10-point AI breakdown</h4>' +
        '<p>Free Master Prompt, paste this problem statement in and get pain points, feasibility, evaluator lens, AI-buildability split and a Judge Q&amp;A stress-test.</p>' +
        '<a class="tmp-btn radius-round" target="_blank" rel="noopener noreferrer" href="' + MASTER_PROMPT_URL + '">Open the Master Prompt</a>' +
      '</div>' +
      '<div class="d-cta-block d-cta-ebook">' +
        '<h4>Want the SWOT, Go/No-Go Checklist and full system?</h4>' +
        '<p>The Hackathon Playbook: Universal Edition unlocks the rest, Problem &rarr; Idea &rarr; MVP &rarr; Presentation &rarr; Evaluation.</p>' +
        '<a class="tmp-btn radius-round" target="_blank" rel="noopener noreferrer" href="' + EBOOK_URL + '">Get the Playbook, Code SIH26</a>' +
      '</div>' +
      (r.dataset_link
        ? '<p class="d-source-note">Dataset: <a target="_blank" rel="noopener noreferrer" href="' + escapeHtml(r.dataset_link) + '">' + escapeHtml(r.dataset_link) + '</a><br>Source: Smart India Hackathon, sih.gov.in</p>'
        : '<p class="d-source-note">Source: Smart India Hackathon, sih.gov.in. Innovation Scope, Invention Effort and the 36-Hour Build Plan are CodeHunters\' own structured breakdown of the official text, always verify the live PS on sih.gov.in before submitting.</p>')
    );
  }

  var TAB_RENDERERS = {
    overview: tabOverview,
    analysis: tabAnalysis,
    evaluator: tabEvaluator,
    plan: tabPlan,
    unlock: tabUnlock
  };

  var currentRecord = null;

  function renderActiveTabContent() {
    if (!currentRecord) return;
    el.detailContent.innerHTML = '<div class="sih-tab-panel is-active">' + TAB_RENDERERS[activeTab](currentRecord) + '</div>';
  }

  function openDetail(psNumber) {
    var r = allRecords.find(function (x) { return x.ps_number === psNumber; });
    if (!r) return;
    currentRecord = r;
    activeTab = 'overview';

    el.detailHead.innerHTML = renderHead(r);
    el.tabBar.innerHTML = renderTabBar();
    renderActiveTabContent();

    el.detailOverlay.classList.add('is-open');
    el.detailPanel.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    history.replaceState(null, '', '#' + psNumber);
  }

  function closeDetail() {
    el.detailOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
    history.replaceState(null, '', location.pathname);
  }

  function switchTab(tabId) {
    if (tabId === activeTab) return;
    activeTab = tabId;
    var buttons = el.tabBar.querySelectorAll('.sih-tab-btn');
    buttons.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-tab') === tabId); });
    renderActiveTabContent();
    el.detailPanel.scrollTop = 0;
  }

  /* ---------------- Init ---------------- */

  function init(data) {
    allRecords = data;
    filtered = data.slice();

    populateSelect(el.filterCategory, uniqueSorted(data.map(function (r) { return r.category; })));
    populateSelect(el.filterTheme, uniqueSorted(data.map(function (r) { return r.theme; })));
    populateSelect(el.filterOrg, uniqueSorted(data.map(function (r) { return r.org; })));
    populateSelect(el.filterInnovation, ['Incremental', 'Moderate', 'Breakthrough']);
    populateSelect(el.filterEffort, ['Low', 'Medium', 'High']);
    populateSelect(el.filterVerdict, ['GREEN', 'YELLOW', 'RED']);

    sortFiltered();
    renderActiveChips();
    renderGrid();

    if (window.innerWidth >= 993) toggleDrawer(true);

    var hash = location.hash.replace('#', '');
    if (hash) openDetail(hash);
  }

  var revealObserver = null;
  function initScrollReveal() {
    var targets = document.querySelectorAll('[data-reveal]:not([data-reveal-bound])');
    if (!targets.length) return;
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (t) { t.classList.add('is-revealed'); t.setAttribute('data-reveal-bound', '1'); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    }
    targets.forEach(function (t) { t.setAttribute('data-reveal-bound', '1'); revealObserver.observe(t); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();

    el.grid = qs('psGrid');
    el.search = qs('psSearch');
    el.sort = qs('psSort');
    el.filterCategory = qs('psFilterCategory');
    el.filterTheme = qs('psFilterTheme');
    el.filterOrg = qs('psFilterOrg');
    el.filterInnovation = qs('psFilterInnovation');
    el.filterEffort = qs('psFilterEffort');
    el.filterVerdict = qs('psFilterVerdict');
    el.resetBtn = qs('psFilterReset');
    el.resultCount = qs('psResultCount');
    el.loadMoreWrap = qs('psLoadMoreWrap');
    el.loadMoreBtn = qs('psLoadMore');
    el.filterToggle = qs('psFilterToggle');
    el.filterDrawer = qs('psFilterDrawer');
    el.filterActiveCount = qs('psFilterActiveCount');
    el.activeChips = qs('psActiveChips');
    el.detailOverlay = qs('sihDetailOverlay');
    el.detailPanel = qs('sihDetailPanel');
    el.detailHead = qs('sihDetailHead');
    el.tabBar = qs('sihTabBar');
    el.detailContent = qs('sihDetailContent');
    el.detailClose = qs('sihDetailClose');

    var debounceTimer;
    el.search.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(applyFilters, 180);
    });
    [el.sort, el.filterCategory, el.filterTheme, el.filterOrg, el.filterInnovation, el.filterEffort, el.filterVerdict].forEach(function (elm) {
      elm.addEventListener('change', applyFilters);
    });
    el.resetBtn.addEventListener('click', function () {
      el.search.value = '';
      el.sort.value = 'sno-asc';
      el.filterCategory.value = '';
      el.filterTheme.value = '';
      el.filterOrg.value = '';
      el.filterInnovation.value = '';
      el.filterEffort.value = '';
      el.filterVerdict.value = '';
      applyFilters();
    });
    el.loadMoreBtn.addEventListener('click', function () {
      visibleCount += PAGE_SIZE;
      renderGrid();
    });
    el.filterToggle.addEventListener('click', function () { toggleDrawer(); });
    el.activeChips.addEventListener('click', function (e) {
      var chip = e.target.closest('.sih-chip');
      if (!chip) return;
      var key = chip.getAttribute('data-filter-key');
      if (el[keyToElName(key)]) el[keyToElName(key)].value = '';
      applyFilters();
    });
    el.grid.addEventListener('click', function (e) {
      var card = e.target.closest('.sih-ps-card');
      if (card) openDetail(card.getAttribute('data-ps'));
    });
    el.grid.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        var card = e.target.closest('.sih-ps-card');
        if (card) openDetail(card.getAttribute('data-ps'));
      }
    });
    el.tabBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.sih-tab-btn');
      if (btn) switchTab(btn.getAttribute('data-tab'));
    });
    el.detailClose.addEventListener('click', closeDetail);
    el.detailOverlay.addEventListener('click', function (e) {
      if (e.target === el.detailOverlay) closeDetail();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDetail();
    });

    fetch(DATA_URL)
      .then(function (res) { return res.json(); })
      .then(init)
      .catch(function (err) {
        el.grid.innerHTML = '<div class="sih-empty-state">Could not load problem statements right now, refresh the page. (' + err + ')</div>';
      });
  });

  function keyToElName(key) {
    var map = {
      psFilterCategory: 'filterCategory',
      psFilterTheme: 'filterTheme',
      psFilterOrg: 'filterOrg',
      psFilterInnovation: 'filterInnovation',
      psFilterEffort: 'filterEffort',
      psFilterVerdict: 'filterVerdict'
    };
    return map[key];
  }
})();
