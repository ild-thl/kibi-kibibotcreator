;(function () {
  var SUPPORTED = ['light', 'dark'];
  var STORAGE_KEY = 'wizard.theme';
  var DEFAULT_THEME = 'light';

  var theme = DEFAULT_THEME;
  var listeners = [];

  function normalizeTheme(raw) {
    if (!raw) return null;
    var s = String(raw).trim().toLowerCase();
    if (s === 'light' || s === 'hell') return 'light';
    if (s === 'dark' || s === 'dunkel') return 'dark';
    return SUPPORTED.indexOf(s) >= 0 ? s : null;
  }

  function detectTheme() {
    try {
      var params = new URLSearchParams(window.location.search);
      var fromUrl = normalizeTheme(params.get('theme'));
      if (fromUrl) return fromUrl;
    } catch (e) {}
    try {
      var stored = normalizeTheme(localStorage.getItem(STORAGE_KEY));
      if (stored) return stored;
    } catch (e2) {}
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e3) {}
    return DEFAULT_THEME;
  }

  function wheelBaseUrl() {
    return './assets/wizard-wheel/' + theme + '/';
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeSwitchUi();
    syncWheelStaticLayers();
  }

  /** HG-Hintergrund aller Wheel-Instanzen (Fortschritt/Schritt setzt WizardWheel). */
  function syncWheelStaticLayers() {
    var bg = wheelBaseUrl() + 'hg.svg';
    document.querySelectorAll('.wizard-wheel-bg').forEach(function (img) {
      if (img.getAttribute('src') !== bg) img.setAttribute('src', bg);
    });
  }

  function notifyListeners() {
    listeners.forEach(function (fn) {
      try {
        fn(theme);
      } catch (e) {}
    });
  }

  function updateThemeSwitchUi() {
    document.querySelectorAll('[data-theme-option]').forEach(function (btn) {
      var active = btn.getAttribute('data-theme-option') === theme;
      btn.classList.toggle('theme-switch__btn--active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function setTheme(next, opts) {
    var t = normalizeTheme(next);
    if (!t || t === theme) {
      applyTheme();
      return theme;
    }
    theme = t;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
    applyTheme();
    notifyListeners();
    if (opts && typeof opts.onChange === 'function') opts.onChange(theme);
    return theme;
  }

  function bindThemeSwitch(onChange) {
    if (typeof onChange === 'function') {
      onThemeChange(onChange);
    }
    document.querySelectorAll('[data-theme-option]').forEach(function (btn) {
      if (btn._themeBound) return;
      btn._themeBound = true;
      btn.addEventListener('click', function () {
        setTheme(btn.getAttribute('data-theme-option'), { onChange: onChange });
      });
    });
  }

  function onThemeChange(fn) {
    if (typeof fn === 'function') listeners.push(fn);
  }

  function initTheme() {
    theme = detectTheme();
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
    applyTheme();
    return theme;
  }

  window.WizardTheme = {
    SUPPORTED: SUPPORTED,
    init: initTheme,
    getTheme: function () {
      return theme;
    },
    setTheme: setTheme,
    wheelBaseUrl: wheelBaseUrl,
    applyTheme: applyTheme,
    syncWheelStaticLayers: syncWheelStaticLayers,
    updateThemeSwitchUi: updateThemeSwitchUi,
    bindThemeSwitch: bindThemeSwitch,
    onThemeChange: onThemeChange
  };

  initTheme();
})();
