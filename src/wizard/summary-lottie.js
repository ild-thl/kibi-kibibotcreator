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
    if (!state || state.avatarType === 'none' || !state.avatarVariant) return '';
    var typePrefix = TYPE_PREFIX[state.avatarType];
    if (!typePrefix) return '';
    var locale =
      window.WizardI18n && typeof window.WizardI18n.getLocale === 'function'
        ? window.WizardI18n.getLocale()
        : 'de';
    var themeModus =
      window.WizardI18n && typeof window.WizardI18n.themeModusSegment === 'function'
        ? window.WizardI18n.themeModusSegment()
        : 'hell';
    var variant = variantFileSegment(state.avatarVariant);
    var file =
      'chat_auswahl_icon_' + themeModus + 'modus_' + typePrefix + '_' + variant + '.json';
    return './assets/i18n/' + locale + '/' + file;
  }

  function getLottieEl() {
    return document.getElementById('summaryChatLottie');
  }

  function getNoneTextEl() {
    return document.getElementById('summaryAvatarNoneText');
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

  function setVisible(showLottie, showNoneText) {
    var lottieEl = getLottieEl();
    var noneEl = getNoneTextEl();
    if (lottieEl) {
      lottieEl.classList.toggle('hidden', !showLottie);
      lottieEl.setAttribute('aria-hidden', showLottie ? 'false' : 'true');
    }
    if (noneEl) {
      noneEl.classList.toggle('hidden', !showNoneText);
    }
  }

  function mount(state) {
    destroy();
    if (!state || state.avatarType === 'none' || !state.avatarVariant) {
      setVisible(false, state && state.avatarType === 'none');
      return;
    }

    var el = getLottieEl();
    if (!el) return;
    var url = resolveSummaryChatAnimationUrl(state);
    if (!url) {
      setVisible(false, false);
      return;
    }

    setVisible(true, false);

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
