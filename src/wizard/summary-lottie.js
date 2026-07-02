;(function () {
  var TYPE_PREFIX = {
    human: 'mensch',
    robot: 'roboter',
    owl: 'eule'
  };

  var instance = null;

  function variantFileSegment(variant) {
    return variant === 'schwarz_weiss' ? 's_w' : variant;
  }

  function resolveSummaryChatAnimationUrl(state) {
    if (!state) return '';
    var typePrefix = TYPE_PREFIX[state.avatarType];
    var locale =
      window.WizardI18n && typeof window.WizardI18n.getLocale === 'function'
        ? window.WizardI18n.getLocale()
        : 'de';
    var themeModus =
      window.WizardI18n && typeof window.WizardI18n.themeModusSegment === 'function'
        ? window.WizardI18n.themeModusSegment()
        : 'hell';
    if (state.avatarType === 'none') {
      return './assets/i18n/' + locale + '/chat_auswahl_icon_' + themeModus + 'modus_ohne_auswahl.json';
    }
    if (!typePrefix || !state.avatarVariant) return '';
    var variant = variantFileSegment(state.avatarVariant);
    var file =
      'chat_auswahl_icon_' + themeModus + 'modus_' + typePrefix + '_' + variant + '.json';
    return './assets/i18n/' + locale + '/' + file;
  }

  function getLottieEl() {
    return document.getElementById('summaryChatLottie');
  }

  function destroy() {
    if (instance && typeof instance.destroy === 'function') {
      try {
        instance.destroy();
      } catch (e) {}
    }
    instance = null;
    var el = getLottieEl();
    if (el) el.innerHTML = '';
  }

  function setVisible(showLottie) {
    var lottieEl = getLottieEl();
    if (lottieEl) {
      lottieEl.classList.toggle('hidden', !showLottie);
      lottieEl.setAttribute('aria-hidden', showLottie ? 'false' : 'true');
    }
  }

  function mount(state) {
    destroy();
    var el = getLottieEl();
    if (!el) return;
    var url = resolveSummaryChatAnimationUrl(state);
    if (!url) {
      setVisible(false);
      return;
    }

    setVisible(true);

    if (!window.lottie || typeof window.lottie.loadAnimation !== 'function') return;

    instance = window.lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: url
    });
  }

  function refresh(state) {
    if (!document.querySelector('#step9:not(.hidden)')) {
      destroy();
      return;
    }
    mount(state);
  }

  window.WizardSummaryLottie = {
    resolveSummaryChatAnimationUrl: resolveSummaryChatAnimationUrl,
    mount: mount,
    refresh: refresh,
    destroy: destroy
  };
})();
