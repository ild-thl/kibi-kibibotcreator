;(function () {
  var SUPPORTED = ['de', 'en'];
  var STORAGE_KEY = 'wizard.locale';
  var DEFAULT_LOCALE = 'de';
  var FALLBACK_LOCALE = 'de';

  var locale = DEFAULT_LOCALE;
  var messages = {};
  var readyResolve;
  var readyPromise = new Promise(function (resolve) {
    readyResolve = resolve;
  });

  var STATE_FIELDS = [
    'usage_context',
    'help_context',
    'role',
    'personality_greeting',
    'personality_humor',
    'personality_answer',
    'personality_tone',
    'personality_style',
    'interaction_workflow',
    'interaction_examples',
    'knowledge',
    'knowledge_source',
    'decision_mode',
    'feedback',
    'privacy'
  ];

  var MULTI_FIELDS = {
    help_context: true,
    knowledge: true,
    knowledge_source: true,
    feedback: true,
    privacy: true
  };

  function normalizeLocale(raw) {
    if (!raw) return null;
    var s = String(raw).trim().toLowerCase();
    if (s.indexOf('en') === 0) return 'en';
    if (s.indexOf('de') === 0) return 'de';
    return SUPPORTED.indexOf(s) >= 0 ? s : null;
  }

  function detectLocale() {
    try {
      var params = new URLSearchParams(window.location.search);
      var fromUrl = normalizeLocale(params.get('lang'));
      if (fromUrl) return fromUrl;
    } catch (e) {}
    try {
      var stored = normalizeLocale(localStorage.getItem(STORAGE_KEY));
      if (stored) return stored;
    } catch (e2) {}
    try {
      var nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (nav.indexOf('en') === 0) return 'en';
    } catch (e3) {}
    return DEFAULT_LOCALE;
  }

  function get(obj, path) {
    if (!obj || !path) return undefined;
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function interpolate(str, vars) {
    if (!str || !vars) return str;
    return String(str).replace(/\{\{(\w+)\}\}/g, function (_, key) {
      return vars[key] != null ? String(vars[key]) : '';
    });
  }

  function loadLocale(lang) {
    locale = lang;
    return fetch('./src/i18n/locales/' + lang + '.json')
      .then(function (res) {
        if (!res.ok) throw new Error('locale ' + lang);
        return res.json();
      })
      .then(function (data) {
        messages = data || {};
        return lang;
      })
      .catch(function () {
        if (lang !== FALLBACK_LOCALE) return loadLocale(FALLBACK_LOCALE);
        messages = {};
        return lang;
      });
  }

  function t(key, vars) {
    var val = get(messages, key);
    if (val == null) return key;
    if (typeof val !== 'string') return key;
    return interpolate(val, vars);
  }

  function optionLabel(field, optionKey) {
    if (!field || optionKey == null || optionKey === '') return '';
    return t('options.' + field + '.' + optionKey) || String(optionKey);
  }

  function optionLabelsJoined(field, keys) {
    if (!Array.isArray(keys) || !keys.length) return '';
    return keys.map(function (k) {
      return optionLabel(field, k);
    }).join(', ');
  }

  function toOptionKey(field, value) {
    if (value == null || value === '') return value;
    if (window.WizardI18nLegacy && window.WizardI18nLegacy.toKey) {
      return window.WizardI18nLegacy.toKey(field, value);
    }
    return value;
  }

  function migrateState(state) {
    if (!state) return;
    STATE_FIELDS.forEach(function (field) {
      if (MULTI_FIELDS[field]) {
        if (!Array.isArray(state[field])) return;
        state[field] = state[field].map(function (v) {
          return toOptionKey(field, v);
        });
        return;
      }
      if (state[field]) state[field] = toOptionKey(field, state[field]);
    });
  }

  function assetUrl(assetKey) {
    var file = get(messages, 'assets.' + assetKey);
    if (!file) return '';
    return './assets/i18n/' + locale + '/' + file;
  }

  function applyAssets(root) {
    var scope = root || document;
    scope.querySelectorAll('[data-asset]').forEach(function (el) {
      var key = el.getAttribute('data-asset');
      var url = assetUrl(key);
      if (!url) return;
      if (el.tagName === 'IMG') el.src = url;
      else el.setAttribute('src', url);
    });
  }

  function applyI18n(root) {
    var scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!key) return;
      el.textContent = t(key);
    });
    scope.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (key) el.placeholder = t(key);
    });
    scope.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (key) el.setAttribute('aria-label', t(key));
    });
    scope.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-alt');
      if (key) el.alt = t(key);
    });
    applyAssets(scope);
    document.title = t('meta.title');
    document.documentElement.lang = locale;
    updateLangSwitchUi();
    if (window.WizardTheme && typeof window.WizardTheme.updateThemeSwitchUi === 'function') {
      window.WizardTheme.updateThemeSwitchUi();
    }
  }

  function updateLangSwitchUi() {
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      var active = btn.getAttribute('data-lang') === locale;
      btn.classList.toggle('lang-switch__btn--active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function applyNameSuggestionButtons() {
    var suggestionButtons = Array.prototype.slice.call(
      document.querySelectorAll('#step3 .card-select[data-field="nameChoice"][data-suggestion]:not([data-suggestion=""])')
    ).filter(function (btn) {
      return !btn.hasAttribute('data-fixed-name');
    });
    suggestionButtons.forEach(function (btn) {
      btn.textContent = btn.getAttribute('data-suggestion') || '';
    });
    document.querySelectorAll('#step3 .card-select[data-field="nameChoice"][data-fixed-name]').forEach(function (btn) {
      btn.textContent = btn.getAttribute('data-suggestion') || t('name.chatbot');
    });
    document.querySelectorAll('#step3 .card-select[data-field="nameChoice"][data-suggestion=""]').forEach(function (btn) {
      btn.textContent = t('name.manual');
    });
  }

  function setLocale(lang, opts) {
    var next = normalizeLocale(lang);
    if (!next || next === locale) {
      applyI18n(document);
      applyNameSuggestionButtons();
      return Promise.resolve(locale);
    }
    return loadLocale(next).then(function () {
      try {
        localStorage.setItem(STORAGE_KEY, locale);
      } catch (e) {}
      applyI18n(document);
      applyNameSuggestionButtons();
      if (opts && typeof opts.onChange === 'function') opts.onChange(locale);
      return locale;
    });
  }

  function bindLangSwitch(onChange) {
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = btn.getAttribute('data-lang');
        setLocale(lang, { onChange: onChange });
      });
    });
  }

  function initI18n(onReady) {
    locale = detectLocale();
    return loadLocale(locale).then(function () {
      try {
        localStorage.setItem(STORAGE_KEY, locale);
      } catch (e) {}
      applyI18n(document);
      if (typeof onReady === 'function') onReady(locale);
      if (typeof readyResolve === 'function') readyResolve(locale);
      return locale;
    });
  }

  window.WizardI18n = {
    SUPPORTED: SUPPORTED,
    ready: function () {
      return readyPromise;
    },
    init: initI18n,
    getLocale: function () {
      return locale;
    },
    setLocale: setLocale,
    t: t,
    optionLabel: optionLabel,
    optionLabelsJoined: optionLabelsJoined,
    migrateState: migrateState,
    assetUrl: assetUrl,
    applyI18n: applyI18n,
    applyNameSuggestionButtons: applyNameSuggestionButtons,
    updateLangSwitchUi: updateLangSwitchUi,
    bindLangSwitch: bindLangSwitch
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initI18n();
    });
  } else {
    initI18n();
  }
})();
