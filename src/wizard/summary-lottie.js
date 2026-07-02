;(function () {
  var TYPE_PREFIX = {
    human: 'mensch',
    robot: 'roboter',
    owl: 'eule'
  };

  var instance = null;
  var activeContainerId = '';

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

  function getLottieEl(containerId) {
    return document.getElementById(containerId || 'summaryChatLottie');
  }

  function isBridgeVisible() {
    var step8 = document.getElementById('step8');
    var bridge = document.querySelector('#step8 .step8-mobile-bridge');
    return !!(step8 && !step8.classList.contains('hidden') && bridge && !bridge.classList.contains('hidden'));
  }

  function resolveActiveContainerId() {
    if (document.querySelector('#step9:not(.hidden)')) {
      return 'summaryChatLottie';
    }
    if (isBridgeVisible()) {
      return 'step8BridgeLottie';
    }
    return '';
  }

  function destroy() {
    if (instance && typeof instance.destroy === 'function') {
      try {
        instance.destroy();
      } catch (e) {}
    }
    instance = null;
    activeContainerId = '';
    ['summaryChatLottie', 'step8BridgeLottie'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.innerHTML = '';
    });
  }

  function setVisible(containerId, showLottie) {
    var lottieEl = getLottieEl(containerId);
    if (lottieEl) {
      lottieEl.classList.toggle('hidden', !showLottie);
      lottieEl.setAttribute('aria-hidden', showLottie ? 'false' : 'true');
    }
  }

  function mount(state, containerId) {
    var targetId = containerId || resolveActiveContainerId();
    if (!targetId) {
      destroy();
      return;
    }

    if (activeContainerId && activeContainerId !== targetId) {
      var previousEl = getLottieEl(activeContainerId);
      if (previousEl) previousEl.innerHTML = '';
    }

    var el = getLottieEl(targetId);
    if (!el) return;
    var url = resolveSummaryChatAnimationUrl(state);
    if (!url) {
      setVisible(targetId, false);
      return;
    }

    if (instance && activeContainerId === targetId) {
      destroy();
    }

    setVisible(targetId, true);
    activeContainerId = targetId;

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
    var containerId = resolveActiveContainerId();
    if (!containerId) {
      destroy();
      return;
    }
    mount(state, containerId);
  }

  window.WizardSummaryLottie = {
    resolveSummaryChatAnimationUrl: resolveSummaryChatAnimationUrl,
    mount: mount,
    refresh: refresh,
    destroy: destroy
  };
})();
