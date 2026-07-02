;(function () {
  var TRANSPARENT_SVG =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";

  function wheelBase() {
    if (window.WizardTheme && typeof window.WizardTheme.wheelBaseUrl === 'function') {
      return window.WizardTheme.wheelBaseUrl();
    }
    return './assets/wizard-wheel/light/';
  }
  var VIEWBOX = 625;
  /**
   * Mittelpunkte der 8 Schritt-Kreise (r≈59.9) aus `alle_antw_off.svg` / `antw_*.svg`,
   * im Uhrzeigersinn ab „oben“ (Schritt 1 oben → … → Schritt 8 oben-links).
   */
  var STEP_COORDS = {
    1: { x: 399.7, y: 95.8 },
    2: { x: 528.5, y: 227.2 },
    3: { x: 524.3, y: 401.1 },
    4: { x: 399.7, y: 525.8 },
    5: { x: 223.2, y: 524.3 },
    6: { x: 95.5, y: 400 },
    7: { x: 95.2, y: 228 },
    8: { x: 222.7, y: 96.3 }
  };

  function asPercent(v) {
    return ((v / VIEWBOX) * 100) + '%';
  }

  function ensureWheelHotspots() {
    document.querySelectorAll('.wizard-wheel').forEach(function (wheel) {
      wheel.querySelectorAll('.wizard-wheel-start').forEach(function (el) {
        el.remove();
      });
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

  /** Aktueller Wizard-Schritt (1–8) für die Fortschrittsgrafik antw_*. */
  function activeWheelProgressStep(state) {
    if (!state) return 0;
    var cur = Number(state.currentStep) || 0;
    if (cur <= 0) return 0;
    if (cur > 8) return 8;
    return cur;
  }

  function progressAssetUrl(state) {
    var n = activeWheelProgressStep(state);
    if (n <= 0) return wheelBase() + 'alle_antw_off.svg';
    return wheelBase() + 'antw_' + n + '.svg';
  }

  function stepOverlayAssetUrl(state) {
    /* Kein schritt_x_x Overlay mehr: Step-Layer bleibt transparent. */
    return TRANSPARENT_SVG;
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
    if (window.WizardTheme && typeof window.WizardTheme.syncWheelStaticLayers === 'function') {
      window.WizardTheme.syncWheelStaticLayers();
    }
    var prog = progressAssetUrl(state);
    var step = stepOverlayAssetUrl(state);
    document.querySelectorAll('.wizard-wheel-progress').forEach(function (img) {
      if (img.getAttribute('src') !== prog) img.setAttribute('src', prog);
    });
    document.querySelectorAll('.wizard-wheel-step').forEach(function (img) {
      if (img.getAttribute('src') !== step) img.setAttribute('src', step);
    });
    document.querySelectorAll('.wizard-wheel-jump[data-step]').forEach(function (btn) {
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
