;(function () {
  var SUMMARY_PAGE_COUNT = 3;

  var SECTION_ICONS = {
    'einsatz-zweck': true,
    personality: true,
    'role-name': true,
    interaction: true,
    knowledge: true,
    feedback: true,
    privacy: true,
    visual: true
  };

  function iconUrl(key) {
    if (!SECTION_ICONS[key]) return '';
    return './assets/summary/icons/' + key + '.svg';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderSection(section) {
    var itemsHtml = section.items
      .map(function (item) {
        return '<li class="summary-mobile-section__item">' + escapeHtml(item) + '</li>';
      })
      .join('');
    var icon = iconUrl(section.icon);
    return (
      '<article class="summary-mobile-section">' +
      '<img class="summary-mobile-section__icon" src="' + icon + '" alt="" width="45" height="45" decoding="async" />' +
      '<div class="summary-mobile-section__body">' +
      '<h4 class="summary-mobile-section__title">' + escapeHtml(section.title) + '</h4>' +
      '<ul class="summary-mobile-section__list">' + itemsHtml + '</ul>' +
      '</div>' +
      '</article>'
    );
  }

  function renderPage(pageIndex, page) {
    var sectionsHtml = page.sections.map(renderSection).join('');
    return (
      '<div class="summary-mobile-page' +
      (pageIndex === 1 ? ' summary-mobile-page--active' : '') +
      '" data-summary-page="' +
      pageIndex +
      '">' +
      sectionsHtml +
      '</div>'
    );
  }

  function render(state, page) {
    var root = document.getElementById('summaryMobileRoot');
    if (!root) return;

    var pages =
      window.WizardSerializer && window.WizardSerializer.buildSummaryMobilePages
        ? window.WizardSerializer.buildSummaryMobilePages(state)
        : [];

    root.innerHTML = pages.map(function (p, idx) {
      return renderPage(idx + 1, p);
    }).join('');

    setPage(page || 1);
  }

  function setPage(page) {
    page = Math.max(1, Math.min(SUMMARY_PAGE_COUNT, Number(page) || 1));
    document.querySelectorAll('#summaryMobileRoot .summary-mobile-page').forEach(function (el) {
      var n = Number(el.getAttribute('data-summary-page'));
      el.classList.toggle('summary-mobile-page--active', n === page);
    });
    return page;
  }

  function isMobileSummaryLayout() {
    return window.matchMedia('(max-width: 520px)').matches;
  }

  window.WizardSummaryMobile = {
    SUMMARY_PAGE_COUNT: SUMMARY_PAGE_COUNT,
    render: render,
    setPage: setPage,
    isMobileSummaryLayout: isMobileSummaryLayout
  };
})();
