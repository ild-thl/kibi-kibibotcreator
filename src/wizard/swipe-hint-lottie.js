;(function () {
  var SWIPE_HINT_URL = './assets/general-animations/swipe_hand_ani.json';
  var SHOW_DURATION_MS = 3000;
  var FADE_DURATION_MS = 500;
  var instance = null;
  var fadeTimeout = null;
  var hideTimeout = null;
  var dismissedForSession = false;

  function isMobileLayout() {
    return window.matchMedia('(max-width: 520px)').matches;
  }

  function getHintRoot() {
    return document.querySelector('#step1 .step1-swipe-hint');
  }

  function getContainer() {
    return document.querySelector('#step1 .step1-swipe-hint-lottie');
  }

  function isStep1Visible() {
    var step1 = document.getElementById('step1');
    return !!(step1 && !step1.classList.contains('hidden'));
  }

  function clearTimers() {
    if (fadeTimeout) {
      clearTimeout(fadeTimeout);
      fadeTimeout = null;
    }
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }

  function resetHintVisualState() {
    var root = getHintRoot();
    if (!root) return;
    root.classList.remove('step1-swipe-hint--fade-out', 'step1-swipe-hint--dismissed');
  }

  function applyDismissedVisualState() {
    var root = getHintRoot();
    if (!root) return;
    root.classList.add('step1-swipe-hint--fade-out', 'step1-swipe-hint--dismissed');
  }

  function destroyLottie() {
    if (instance && typeof instance.destroy === 'function') {
      try {
        instance.destroy();
      } catch (e) {}
    }
    instance = null;
    var el = getContainer();
    if (el) el.innerHTML = '';
  }

  function finalizeDismiss() {
    clearTimers();
    destroyLottie();
    applyDismissedVisualState();
    dismissedForSession = true;
  }

  function cleanupActiveHint() {
    var root = getHintRoot();
    if (root && root.classList.contains('step1-swipe-hint--fade-out')) {
      finalizeDismiss();
      return;
    }
    clearTimers();
    destroyLottie();
    if (!dismissedForSession) {
      resetHintVisualState();
    }
  }

  function destroy() {
    cleanupActiveHint();
  }

  function dismissHint() {
    var root = getHintRoot();
    if (root) {
      root.classList.add('step1-swipe-hint--fade-out');
    }
    hideTimeout = setTimeout(function () {
      hideTimeout = null;
      finalizeDismiss();
    }, FADE_DURATION_MS);
  }

  function scheduleFadeOut() {
    clearTimers();
    fadeTimeout = setTimeout(function () {
      fadeTimeout = null;
      dismissHint();
    }, SHOW_DURATION_MS);
  }

  function mount() {
    if (!isMobileLayout() || !isStep1Visible() || dismissedForSession) {
      return;
    }
    if (!window.lottie || typeof window.lottie.loadAnimation !== 'function') return;

    var el = getContainer();
    if (!el) return;

    resetHintVisualState();
    destroyLottie();
    instance = window.lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: SWIPE_HINT_URL
    });
    scheduleFadeOut();
  }

  function refresh() {
    if (!isMobileLayout() || !isStep1Visible()) {
      cleanupActiveHint();
      return;
    }
    if (dismissedForSession) {
      applyDismissedVisualState();
      return;
    }
    if (instance) return;
    mount();
  }

  window.WizardSwipeHintLottie = {
    mount: mount,
    refresh: refresh,
    destroy: destroy
  };
})();
