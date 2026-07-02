;(function () {
  var SWIPE_MIN_DISTANCE = 48;
  var SWIPE_DIRECTION_RATIO = 1.25;

  var touchStartX = 0;
  var touchStartY = 0;
  var tracking = false;
  var bound = false;
  var ctx = null;

  function isMobileLayout() {
    return window.matchMedia('(max-width: 520px)').matches;
  }

  function isModalOpen() {
    var validation = document.getElementById('validationModal');
    var settings = document.getElementById('settingsModal');
    return (
      (validation && !validation.classList.contains('hidden')) ||
      (settings && !settings.classList.contains('hidden'))
    );
  }

  function isInteractiveSwipeTarget(target) {
    if (!target || !target.closest) return false;
    return !!target.closest(
      [
        'input',
        'textarea',
        'select',
        'button',
        'a',
        'label',
        '[contenteditable="true"]',
        '.settings-modal',
        '.modal-overlay',
        '.settings-card',
        '.modal-card',
        '.wizard-wheel',
        '.wizard-wheel-jump',
        '.avatar-variant-picker',
        '.avatar-variant-opt',
        '#wizardNavBar',
        '#btnSettings'
      ].join(', ')
    );
  }

  function canSwipeNavigate() {
    if (!ctx || !isMobileLayout()) return false;
    if (isModalOpen()) return false;
    if (ctx.state.currentStep === 0) return false;
    return (
      document.body.classList.contains('wizard-nav-visible') ||
      document.body.classList.contains('wizard-on-step8-bridge')
    );
  }

  function canSwipeForward() {
    if (!ctx) return false;
    if (document.body.classList.contains('wizard-on-step8-bridge')) return false;

    if (ctx.state.currentStep === ctx.totalSteps) {
      var pageCount =
        window.WizardSummaryMobile && window.WizardSummaryMobile.SUMMARY_PAGE_COUNT
          ? window.WizardSummaryMobile.SUMMARY_PAGE_COUNT
          : 3;
      if ((ctx.state.summaryPage || 1) >= pageCount) return false;
    }

    return true;
  }

  function canSwipeBack() {
    if (!ctx) return false;
    if (document.body.classList.contains('wizard-on-step8-bridge')) return true;
    return ctx.state.currentStep > 0;
  }

  function onTouchStart(e) {
    if (!canSwipeNavigate()) return;
    if (e.touches.length !== 1) return;
    if (isInteractiveSwipeTarget(e.target)) return;

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    tracking = true;
  }

  function onTouchEnd(e) {
    if (!tracking) return;
    tracking = false;
    if (!canSwipeNavigate()) return;

    var touch = e.changedTouches && e.changedTouches[0];
    if (!touch) return;

    var deltaX = touch.clientX - touchStartX;
    var deltaY = touch.clientY - touchStartY;
    var absX = Math.abs(deltaX);
    var absY = Math.abs(deltaY);

    if (absX < SWIPE_MIN_DISTANCE) return;
    if (absX < absY * SWIPE_DIRECTION_RATIO) return;

    if (deltaX < 0) {
      if (!canSwipeForward()) return;
      if (typeof ctx.onNext === 'function') ctx.onNext();
      return;
    }

    if (!canSwipeBack()) return;
    if (typeof ctx.onBack === 'function') ctx.onBack();
  }

  function onTouchCancel() {
    tracking = false;
  }

  function bind(options) {
    ctx = options || null;
    if (bound) return;

    var root = document.getElementById('wizardContent') || document.body;
    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchend', onTouchEnd, { passive: true });
    root.addEventListener('touchcancel', onTouchCancel, { passive: true });
    bound = true;
  }

  window.WizardSwipeNavigation = {
    bind: bind
  };
})();
