;(function () {
  function getFirstIncompleteStep(state, totalSteps, deps) {
    var originalStep = state.currentStep;
    var isCurrentStepValid = deps && deps.isCurrentStepValid;
    if (typeof isCurrentStepValid !== 'function') return totalSteps;

    for (var s = 1; s <= 8; s++) {
      state.currentStep = s;
      if (!isCurrentStepValid()) {
        state.currentStep = originalStep;
        return s;
      }
    }
    state.currentStep = originalStep;
    return totalSteps;
  }

  function updateUI(state, totalSteps, deps) {
    document.querySelectorAll('.wizard-step').forEach(function (el) {
      var id = el.id || '';
      var n = 0;
      if (id.indexOf('step') === 0) {
        n = parseInt(id.replace('step', ''), 10) || 0;
      }
      el.classList.toggle('hidden', n !== state.currentStep);
    });

    var currentLabel = document.getElementById('currentStep');
    var totalLabel = document.getElementById('totalSteps');
    if (currentLabel) {
      currentLabel.textContent = state.currentStep === 0
        ? (window.WizardI18n && window.WizardI18n.t ? window.WizardI18n.t('nav.stepStart') : 'Start')
        : String(state.currentStep);
    }
    if (totalLabel) totalLabel.textContent = totalSteps;

    var progress = document.getElementById('progressBar');
    if (progress) {
      var ratio = state.currentStep === 0 ? 0 : (state.currentStep / totalSteps);
      progress.style.width = (ratio * 100) + '%';
    }

    var navBarEl = document.getElementById('wizardNavBar');
    var startSpacerEl = document.getElementById('btnStartSpacer');
    var startBtnEl = document.getElementById('btnStart');
    var startBtnInlineEl = document.getElementById('btnStartInline');
    var backBtnEl = document.getElementById('btnBack');
    var nextBtnEl = document.getElementById('btnNext');
    var saveBtnEl = document.getElementById('btnSave');
    var settingsBtnEl = document.getElementById('btnSettings');
    var mobileStep0Start = state.currentStep === 0 && window.matchMedia('(max-width: 520px)').matches;
    var navInFlow = state.currentStep > 0 && !mobileStep0Start;
    if (navBarEl) {
      navBarEl.classList.toggle('hidden', mobileStep0Start);
      navBarEl.classList.toggle('wizard-nav-in-flow', navInFlow);
      navBarEl.classList.toggle('fixed', !navInFlow && !mobileStep0Start);
      navBarEl.classList.toggle('bottom-0', !navInFlow && !mobileStep0Start);
      navBarEl.classList.toggle('left-0', !navInFlow && !mobileStep0Start);
      navBarEl.classList.toggle('right-0', !navInFlow && !mobileStep0Start);
    }
    document.body.classList.toggle('wizard-on-step0', state.currentStep === 0);
    document.body.classList.toggle('wizard-nav-visible', navInFlow);

    var stepGapEl = document.getElementById('wizardNavStepGap');
    var stepIndicatorEl = document.getElementById('wizardStepIndicator');
    var showMobileNavGap = navInFlow && mobileStep0Start === false && window.matchMedia('(max-width: 520px)').matches;
    var showStepIndicator = showMobileNavGap && state.currentStep >= 1 && state.currentStep <= 8;
    if (stepGapEl) {
      stepGapEl.classList.toggle('hidden', !showMobileNavGap);
      stepGapEl.setAttribute('aria-hidden', showStepIndicator ? 'false' : 'true');
    }
    if (stepIndicatorEl) {
      if (showStepIndicator) {
        stepIndicatorEl.textContent = window.WizardI18n && window.WizardI18n.t
          ? window.WizardI18n.t('nav.stepOf', { current: state.currentStep, total: 8 })
          : 'Schritt ' + state.currentStep + ' von 8';
      } else {
        stepIndicatorEl.textContent = '';
      }
    }

    if (startSpacerEl) startSpacerEl.classList.toggle('hidden', state.currentStep !== 0 || mobileStep0Start);
    if (startBtnEl) startBtnEl.classList.toggle('hidden', state.currentStep !== 0 || mobileStep0Start);
    if (startBtnInlineEl) startBtnInlineEl.classList.toggle('hidden', state.currentStep !== 0 || !mobileStep0Start);
    if (backBtnEl) backBtnEl.classList.toggle('hidden', state.currentStep === 0);
    if (nextBtnEl) nextBtnEl.classList.toggle('hidden', state.currentStep === 0 || state.currentStep === totalSteps);
    if (nextBtnEl) {
      if (window.WizardI18n && window.WizardI18n.t) {
        nextBtnEl.textContent = state.currentStep === (totalSteps - 1)
          ? window.WizardI18n.t('nav.summary')
          : window.WizardI18n.t('nav.next');
      } else {
        nextBtnEl.textContent = state.currentStep === (totalSteps - 1) ? 'Zusammenfassung' : 'Weiter';
      }
    }
    if (saveBtnEl) saveBtnEl.classList.toggle('hidden', state.currentStep !== totalSteps);
    if (settingsBtnEl) settingsBtnEl.classList.remove('hidden');

    if (deps && typeof deps.updateSettingsActions === 'function') deps.updateSettingsActions();
    var wizardContent = document.getElementById('wizardContent');
    if (wizardContent) wizardContent.classList.add('step-enter');
    if (state.currentStep === 8 && deps && typeof deps.renderAvatarStep === 'function') deps.renderAvatarStep();
    if (deps && typeof deps.syncWheelCenterAnimation === 'function') deps.syncWheelCenterAnimation();
    if (window.WizardWheel && typeof window.WizardWheel.updateWizardWheel === 'function') {
      window.WizardWheel.updateWizardWheel(state);
    }
  }

  function goToStep(state, targetStep, totalSteps, deps) {
    targetStep = Number(targetStep);
    if (targetStep < 0 || targetStep > totalSteps) return;
    if (targetStep === state.currentStep) return;

    if (targetStep < state.currentStep) {
      state.currentStep = targetStep;
      if (deps && typeof deps.updateUI === 'function') deps.updateUI();
      if (deps && typeof deps.restoreSelections === 'function') deps.restoreSelections();
      if (state.currentStep === 8 && deps && typeof deps.renderAvatarStep === 'function') deps.renderAvatarStep();
      if (state.currentStep === totalSteps && deps && typeof deps.updateSummary === 'function') deps.updateSummary();
      return;
    }

    while (state.currentStep < targetStep) {
      if (!(deps && typeof deps.isCurrentStepValid === 'function' && deps.isCurrentStepValid())) {
        if (deps && typeof deps.showValidationMessage === 'function') {
          deps.showValidationMessage(
            window.WizardI18n && window.WizardI18n.t
              ? window.WizardI18n.t('validation.jump')
              : 'Bitte triff zuerst eine Auswahl bzw. gib einen Wert ein, bevor du zu diesem Schritt springst.'
          );
        }
        break;
      }
      state.currentStep++;
      if (deps && typeof deps.updateUI === 'function') deps.updateUI();
      if (deps && typeof deps.restoreSelections === 'function') deps.restoreSelections();
      if (state.currentStep === 8 && deps && typeof deps.renderAvatarStep === 'function') deps.renderAvatarStep();
      if (state.currentStep === totalSteps && deps && typeof deps.updateSummary === 'function') deps.updateSummary();
    }
  }

  function next(state, totalSteps, deps) {
    if (!(deps && typeof deps.isCurrentStepValid === 'function' && deps.isCurrentStepValid())) {
      if (deps && typeof deps.showValidationMessage === 'function') {
        deps.showValidationMessage(
          window.WizardI18n && window.WizardI18n.t
            ? window.WizardI18n.t('validation.default')
            : 'Bitte triff zuerst eine Auswahl bzw. gib einen Wert ein, bevor du fortfährst.'
        );
      }
      return;
    }
    var input = document.getElementById('inputName');
    if (state.currentStep === 2 && input) state.name = input.value.trim();
    if (state.currentStep < totalSteps) {
      state.currentStep++;
      if (deps && typeof deps.updateUI === 'function') deps.updateUI();
      if (deps && typeof deps.restoreSelections === 'function') deps.restoreSelections();
      if (state.currentStep === totalSteps && deps && typeof deps.updateSummary === 'function') deps.updateSummary();
    }
  }

  function back(state, deps) {
    if (state.currentStep > 0) {
      state.currentStep--;
      if (deps && typeof deps.updateUI === 'function') deps.updateUI();
      if (deps && typeof deps.restoreSelections === 'function') deps.restoreSelections();
      if (state.currentStep === 8 && deps && typeof deps.renderAvatarStep === 'function') deps.renderAvatarStep();
    }
  }

  window.WizardNavigation = {
    getFirstIncompleteStep: getFirstIncompleteStep,
    updateUI: updateUI,
    goToStep: goToStep,
    next: next,
    back: back
  };
})();
