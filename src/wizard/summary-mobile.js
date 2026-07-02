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

  var DESKTOP_COLUMN_ORDER = {
    left: ['einsatz-zweck', 'personality', 'role-name', 'interaction'],
    right: ['knowledge', 'feedback', 'privacy', 'visual']
  };

  function currentThemeFolder() {
    var theme = document.documentElement.getAttribute('data-theme');
    return theme === 'dark' ? 'dark' : 'light';
  }

  function iconUrl(key) {
    if (!SECTION_ICONS[key]) return '';
    var themeFolder = currentThemeFolder();
    return './assets/summary/icons/' + themeFolder + '/' + key + '.svg';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderSection(section, iconSize) {
    var size = iconSize || 45;
    var itemsHtml = section.items
      .map(function (item) {
        return '<li class="summary-mobile-section__item">' + escapeHtml(item) + '</li>';
      })
      .join('');
    var icon = iconUrl(section.icon);
    return (
      '<article class="summary-mobile-section">' +
      '<img class="summary-mobile-section__icon" src="' + icon + '" alt="" width="' + size + '" height="' + size + '" decoding="async" />' +
      '<div class="summary-mobile-section__body">' +
      '<h4 class="summary-mobile-section__title">' + escapeHtml(section.title) + '</h4>' +
      '<ul class="summary-mobile-section__list">' + itemsHtml + '</ul>' +
      '</div>' +
      '</article>'
    );
  }

  function renderPage(pageIndex, page) {
    var sectionsHtml = page.sections.map(function (section) {
      return renderSection(section, 45);
    }).join('');
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

  function buildPages(state) {
    return window.WizardSerializer && window.WizardSerializer.buildSummaryMobilePages
      ? window.WizardSerializer.buildSummaryMobilePages(state)
      : [];
  }

  function sectionMap(pages) {
    var byIcon = {};
    pages.forEach(function (page) {
      page.sections.forEach(function (section) {
        byIcon[section.icon] = section;
      });
    });
    return byIcon;
  }

  function renderDesktop(state) {
    var root = document.getElementById('summaryDesktopRoot');
    if (!root) return;

    var byIcon = sectionMap(buildPages(state));

    function columnHtml(keys) {
      return keys
        .map(function (key) {
          return byIcon[key];
        })
        .filter(Boolean)
        .map(function (section) {
          return renderSection(section, 55);
        })
        .join('');
    }

    root.innerHTML =
      '<div class="summary-desktop-column">' + columnHtml(DESKTOP_COLUMN_ORDER.left) + '</div>' +
      '<div class="summary-desktop-column">' + columnHtml(DESKTOP_COLUMN_ORDER.right) + '</div>';
  }

  function renderMobile(state, page) {
    var root = document.getElementById('summaryMobileRoot');
    if (!root) return;

    var pages = buildPages(state);
    root.innerHTML = pages
      .map(function (p, idx) {
        return renderPage(idx + 1, p);
      })
      .join('');

    setPage(page || 1);
  }

  function render(state, page) {
    if (isDesktopSummaryLayout()) {
      renderDesktop(state);
      var mobileRoot = document.getElementById('summaryMobileRoot');
      if (mobileRoot) mobileRoot.innerHTML = '';
      return;
    }

    var desktopRoot = document.getElementById('summaryDesktopRoot');
    if (desktopRoot) desktopRoot.innerHTML = '';
    renderMobile(state, page);
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

  function isDesktopSummaryLayout() {
    return window.matchMedia('(min-width: 1025px)').matches;
  }

  window.WizardSummaryMobile = {
    SUMMARY_PAGE_COUNT: SUMMARY_PAGE_COUNT,
    render: render,
    setPage: setPage,
    isMobileSummaryLayout: isMobileSummaryLayout,
    isDesktopSummaryLayout: isDesktopSummaryLayout
  };
})();
