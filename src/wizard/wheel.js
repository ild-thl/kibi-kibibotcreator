;(function () {
  var BASE = './assets/wizard-wheel/';
  var VIEWBOX = 625;
  var START_COORD = { x: 313.6, y: 86.1 };
  var STEP_COORDS = {
    1: { x: 459.5, y: 140.3 },
    2: { x: 535.6, y: 273.7 },
    3: { x: 508.4, y: 425.4 },
    4: { x: 391.6, y: 524.4 },
    5: { x: 237.5, y: 525.6 },
    6: { x: 118.5, y: 425.6 },
    7: { x: 91.2, y: 272.7 },
    8: { x: 170.9, y: 137.6 }
  };

  function asPercent(v) {
    return ((v / VIEWBOX) * 100) + '%';
  }

  function ensureWheelHotspots() {
    document.querySelectorAll('.wizard-wheel').forEach(function (wheel) {
      var startBtn = wheel.querySelector('.wizard-wheel-start');
      if (startBtn) {
        startBtn.setAttribute('data-step', '0');
        startBtn.style.left = asPercent(START_COORD.x);
        startBtn.style.top = asPercent(START_COORD.y);
      }
      for (var step = 1; step <= 8; step++) {
        if (wheel.querySelector('.wizard-wheel-jump[data-step="' + step + '"]')) continue;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'wizard-wheel-jump wizard-wheel-jump--' + step;
        btn.setAttribute('data-step', String(step));
        btn.setAttribute('aria-label', 'Schritt ' + step);
        btn.style.left = asPercent(STEP_COORDS[step].x);
        btn.style.top = asPercent(STEP_COORDS[step].y);
        wheel.appendChild(btn);
      }
    });
  }

  /** Aufeinanderfolgend vollständig abgeschlossene Schritte 1…8 (für Fortschrittsgrafik antw_*). */
  function consecutiveCompletedSteps(state) {
    if (!window.WizardValidation || !window.WizardValidation.isStepValid) return 0;
    var n = 0;
    for (var s = 1; s <= 8; s++) {
      if (window.WizardValidation.isStepValid(state, s)) n = s;
      else break;
    }
    return n;
  }

  function progressAssetUrl(state) {
    var n = consecutiveCompletedSteps(state);
    if (n <= 0) return BASE + 'alle_antw_off.svg';
    return BASE + 'antw_' + n + '.svg';
  }

  function stepOverlayAssetUrl(state) {
    var cs = state.currentStep;
    if (cs === 0) return BASE + 'start.svg';
    if (cs === 9) {
      var eightOk = window.WizardValidation && window.WizardValidation.isStepValid(state, 8);
      return BASE + (eightOk ? 'schritt_8_2.svg' : 'schritt_8_1.svg');
    }
    if (cs >= 1 && cs <= 8) {
      var ok = window.WizardValidation && window.WizardValidation.isStepValid(state, cs);
      var suffix = ok ? '2' : '1';
      return BASE + 'schritt_' + cs + '_' + suffix + '.svg';
    }
    return BASE + 'start.svg';
  }

  /** Aktualisiert Fortschritts- und Schritt-Overlay in allen Wheel-Instanzen (jeder Section eine Kopie). */
  function syncNameForValidation(state) {
    if (state.currentStep !== 3) return;
    var input = document.getElementById('inputName');
    if (input) state.name = String(input.value || '').trim();
  }

  function updateWizardWheel(state) {
    if (!state) return;
    ensureWheelHotspots();
    syncNameForValidation(state);
    var prog = progressAssetUrl(state);
    var step = stepOverlayAssetUrl(state);
    document.querySelectorAll('.wizard-wheel-progress').forEach(function (img) {
      if (img.getAttribute('src') !== prog) img.setAttribute('src', prog);
    });
    document.querySelectorAll('.wizard-wheel-step').forEach(function (img) {
      if (img.getAttribute('src') !== step) img.setAttribute('src', step);
    });
    document.querySelectorAll('.wizard-wheel-jump').forEach(function (btn) {
      var n = Number(btn.getAttribute('data-step') || '0');
      var allowed =
        window.WizardValidation && typeof window.WizardValidation.isWheelJumpAllowed === 'function'
          ? window.WizardValidation.isWheelJumpAllowed(state, n)
          : true;
      btn.classList.toggle('wizard-wheel-hotspot--blocked', !allowed);
      if (!allowed) {
        btn.setAttribute('tabindex', '-1');
        btn.setAttribute('aria-disabled', 'true');
        if (document.activeElement === btn) btn.blur();
      } else {
        btn.removeAttribute('tabindex');
        btn.removeAttribute('aria-disabled');
      }
    });
  }

  function setWheelDebug(on) {
    document.body.classList.toggle('wizard-wheel-debug', !!on);
  }

  function isWheelDebugEnabled() {
    return document.body.classList.contains('wizard-wheel-debug');
  }

  /** ?wheelDebug=1 in der URL oder Alt+Shift+D zum Umschalten (Trefferzonen sichtbar). */
  function applyWheelDebugFromUrlAndBindToggle() {
    try {
      var p = new URLSearchParams(window.location.search);
      if (p.get('wheelDebug') === '1' || p.get('wheeldebug') === '1') {
        setWheelDebug(true);
      }
    } catch (e) {}
    document.addEventListener('keydown', function (e) {
      if (e.altKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setWheelDebug(!isWheelDebugEnabled());
      }
    });
  }

  applyWheelDebugFromUrlAndBindToggle();

  window.WizardWheel = {
    updateWizardWheel: updateWizardWheel,
    setWheelDebug: setWheelDebug,
    isWheelDebugEnabled: isWheelDebugEnabled
  };
})();
