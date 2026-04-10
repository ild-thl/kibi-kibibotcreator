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
    if (currentLabel) currentLabel.textContent = state.currentStep === 0 ? 'Start' : String(state.currentStep);
    if (totalLabel) totalLabel.textContent = totalSteps;

    var progress = document.getElementById('progressBar');
    if (progress) {
      var ratio = state.currentStep === 0 ? 0 : (state.currentStep / totalSteps);
      progress.style.width = (ratio * 100) + '%';
    }

    var navBarEl = document.getElementById('wizardNavBar');
    var backBtnEl = document.getElementById('btnBack');
    var nextBtnEl = document.getElementById('btnNext');
    var saveBtnEl = document.getElementById('btnSave');
    var settingsBtnEl = document.getElementById('btnSettings');
    if (navBarEl) navBarEl.classList.toggle('hidden', state.currentStep === 0);
    if (backBtnEl) backBtnEl.classList.toggle('hidden', state.currentStep === 0);
    if (nextBtnEl) nextBtnEl.classList.toggle('hidden', state.currentStep === 0 || state.currentStep === totalSteps);
    if (nextBtnEl) nextBtnEl.textContent = state.currentStep === (totalSteps - 1) ? 'Zusammenfassung' : 'Weiter';
    if (saveBtnEl) saveBtnEl.classList.toggle('hidden', state.currentStep !== totalSteps);
    if (settingsBtnEl) settingsBtnEl.classList.toggle('hidden', state.currentStep === 0);

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
          deps.showValidationMessage('Bitte triff zuerst eine Auswahl bzw. gib einen Wert ein, bevor du zu diesem Schritt springst.');
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
        deps.showValidationMessage('Bitte triff zuerst eine Auswahl bzw. gib einen Wert ein, bevor du fortfährst.');
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
