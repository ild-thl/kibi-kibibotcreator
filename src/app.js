(function () {
  /** Leeres Bild statt avatar-placeholder.png (Wheel / Fallbacks). */
  const TRANSPARENT_IMG =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";

  const TOTAL_STEPS = 9; // 1–8 Fragen + 9 = Zusammenfassung (Startseite ist Schritt 0)
  const state = {
    id: '',
    testMode: false,
    // Schritt 1
    usage_context: '',           // Für was soll Dein Avatar eingesetzt werden?
    help_context: [],           // Wobei soll Dir der Avatar helfen? (Mehrfachauswahl)
    // Schritt 2
    role: '',                    // Rolle des Avatars
    name: '',                    // Name des Avatars (frei oder Vorschlag)
    nameManual: false,           // Freitext nur bei "Eigene Angabe"
    // Schritt 3 – Persönlichkeit & Ton
    personality_greeting: '',    // Anrede: Duzen / Siezen
    personality_humor: '',       // Humor: Humorvoll / ernst
    personality_answer: '',      // Antwortstil: Kurz & knapp / Ausführlich
    personality_tone: '',        // Ton: Locker / Professionell
    personality_style: '',       // Stil: Persönlich / Sachlich
    // Schritt 4
    interaction_workflow: '',     // Einfachauswahl: wie arbeitet der Avatar?
    interaction_examples: '',     // Einfachauswahl: nutzt der Avatar Beispiele?
    // Schritt 5
    knowledge: [],               // Mehrfachauswahl (Studiengang, Modulplan, Lernfortschritt)
    knowledge_source: [],        // Mehrfachauswahl (Allgemeines Wissen, Studiengangswissen)
    decision_mode: '',           // Einfachauswahl (Entscheidungsverhalten)
    // Schritt 6
    feedback: [],                // Mehrfachauswahl: Reaktion bei Fehlern/Problemen
    // Schritt 7 – Avatar-Optik (null = noch nichts gewählt)
    avatarType: 'human',
    avatarSkinColor: null,
    avatarTop: null,
    avatarHairColor: null,
    avatarFacialHair: null,
    avatarMouth: null,
    avatarClothing: null,
    // Schritt 8 – Datenschutz
    privacy: [],                 // Mehrfachauswahl Datenschutzoptionen
    // Avatar wurde aktiv erzeugt (Nutzerinteraktion)
    avatarInitialized: false,
    currentStep: 0
  };

  function clearAvatarLottie() {
    if (window.WizardAvatar && window.WizardAvatar.clearAvatarLottie) {
      window.WizardAvatar.clearAvatarLottie();
      return;
    }
    document.querySelectorAll('.avatar-lottie-root').forEach(function (el) { el.remove(); });
    document.querySelectorAll('.wheel-center-lottie').forEach(function (el) { el.remove(); });
    document.querySelectorAll('.wizard-wheel-avatar img').forEach(function (img) { img.style.display = 'block'; });
  }

  function updateNameInputState() {
    var input = document.getElementById('inputName');
    if (!input) return;
    input.disabled = !state.nameManual;
  }

  function getFirstIncompleteStep() {
    if (window.WizardNavigation && window.WizardNavigation.getFirstIncompleteStep) {
      return window.WizardNavigation.getFirstIncompleteStep(state, TOTAL_STEPS, {
        isCurrentStepValid: isCurrentStepValid
      });
    }
    return TOTAL_STEPS;
  }

  function readUrlParams() {
    const params = new URLSearchParams(window.location.search);
    state.id = params.get('id') || '';
    // Testmodus:
    // - Nur aktiv, wenn in der URL ?test=1 gesetzt ist
    // - UND window.APP_CONFIG.enableTestMode === true
    // In allen anderen Fällen ist testMode false.
    state.testMode = false;
    if (
      window.APP_CONFIG &&
      window.APP_CONFIG.enableTestMode === true &&
      params.get('test') === '1'
    ) {
      state.testMode = true;
    }
  }

  function buildAvatarUrl() {
    if (window.WizardAvatar && window.WizardAvatar.buildAvatarUrl) {
      return window.WizardAvatar.buildAvatarUrl(state);
    }
    return TRANSPARENT_IMG;
  }

  function renderAvatarStep() {
    if (window.WizardAvatar && window.WizardAvatar.renderAvatarStep) {
      window.WizardAvatar.renderAvatarStep(state, {
        onAvatarChanged: function () { updateAvatarPreview(); },
        notifyWheelSelection: function (s, meta) {
          if (window.WizardWheelCenter && window.WizardWheelCenter.notifySelection) {
            window.WizardWheelCenter.notifySelection(s, meta);
          }
        }
      });
    }
  }

  function updateWizardWheelGraphics() {
    if (window.WizardWheel && window.WizardWheel.updateWizardWheel) {
      window.WizardWheel.updateWizardWheel(state);
    }
  }

  function updateAvatarPreview() {
    if (window.WizardAvatar && window.WizardAvatar.updateAvatarPreview) {
      window.WizardAvatar.updateAvatarPreview(state, buildAvatarUrl());
    }
    updateWizardWheelGraphics();
  }

  function syncWheelCenterAnimation() {
    if (window.WizardWheelCenter && window.WizardWheelCenter.notifyUiUpdate) {
      window.WizardWheelCenter.notifyUiUpdate(state);
    }
  }

  function isWizardComplete() {
    const input = document.getElementById('inputName');
    if (input) state.name = input.value.trim();
    if (window.WizardValidation && window.WizardValidation.isWizardComplete) {
      return window.WizardValidation.isWizardComplete(state);
    }
    return false;
  }

  function updateSettingsActions() {
    const exportBtn = document.getElementById('settingsExport');
    if (!exportBtn) return;
    const canExport = isWizardComplete();
    exportBtn.disabled = !canExport;
    exportBtn.title = canExport ? 'Wizard-Daten exportieren' : 'Export erst möglich, wenn alle Schritte abgeschlossen sind';
  }

  function buildExportPayload() {
    if (window.WizardSerializer && window.WizardSerializer.buildExportPayload) {
      return window.WizardSerializer.buildExportPayload(state, buildAvatarUrl());
    }
    return {};
  }

  function exportWizardData() {
    if (!isWizardComplete()) return;
    const payload = buildExportPayload();
    if (window.WizardUiUtils && window.WizardUiUtils.downloadJson) {
      window.WizardUiUtils.downloadJson('avatar-export', payload);
      return;
    }
    const content = JSON.stringify(payload, null, 2);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'avatar-export-' + ts + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function updateUI() {
    if (window.WizardNavigation && window.WizardNavigation.updateUI) {
      window.WizardNavigation.updateUI(state, TOTAL_STEPS, {
        updateSettingsActions: updateSettingsActions,
        renderAvatarStep: renderAvatarStep,
        syncWheelCenterAnimation: syncWheelCenterAnimation
      });
    }
  }

  function bindCardSelects() {
    if (window.WizardSelection && window.WizardSelection.bindCardSelects) {
      window.WizardSelection.bindCardSelects(state, {
        renderAvatarStep: renderAvatarStep,
        updateAvatarPreview: updateAvatarPreview,
        updateNameInputState: updateNameInputState,
        updateWizardWheel: updateWizardWheelGraphics,
        onWheelSelection: function (s, meta) {
          if (window.WizardWheelCenter && window.WizardWheelCenter.notifySelection) {
            window.WizardWheelCenter.notifySelection(s, meta);
          }
        }
      });
    }
  }

  function restoreSelections() {
    if (window.WizardSelection && window.WizardSelection.restoreSelections) {
      window.WizardSelection.restoreSelections(state, {
        updateNameInputState: updateNameInputState
      });
    }
  }

  function isCurrentStepValid() {
    if (state.currentStep === 3) {
      const input = document.getElementById('inputName');
      if (input) state.name = input.value.trim();
    }
    if (window.WizardValidation && window.WizardValidation.isStepValid) {
      return window.WizardValidation.isStepValid(state, state.currentStep);
    }
    return false;
  }

  function showValidationMessage(message) {
    var msg = message || 'Bitte triff zuerst eine Auswahl bzw. gib einen Wert ein, bevor du fortfährst.';
    if (window.WizardUiUtils) {
      window.WizardUiUtils.setTextById('validationMessage', msg);
      window.WizardUiUtils.showById('validationModal');
      return;
    }
    var overlay = document.getElementById('validationModal');
    var text = document.getElementById('validationMessage');
    if (!overlay || !text) return;
    text.textContent = msg;
    overlay.classList.remove('hidden');
  }

  function hideValidationMessage() {
    if (window.WizardUiUtils && window.WizardUiUtils.hideById) {
      window.WizardUiUtils.hideById('validationModal');
      return;
    }
    var overlay = document.getElementById('validationModal');
    if (!overlay) return;
    overlay.classList.add('hidden');
  }

  function goToStep(targetStep) {
    if (window.WizardNavigation && window.WizardNavigation.goToStep) {
      window.WizardNavigation.goToStep(state, targetStep, TOTAL_STEPS, {
        isCurrentStepValid: isCurrentStepValid,
        showValidationMessage: showValidationMessage,
        updateUI: updateUI,
        restoreSelections: restoreSelections,
        renderAvatarStep: renderAvatarStep,
        updateSummary: updateSummary
      });
    }
  }

  function next() {
    if (window.WizardNavigation && window.WizardNavigation.next) {
      window.WizardNavigation.next(state, TOTAL_STEPS, {
        isCurrentStepValid: isCurrentStepValid,
        showValidationMessage: showValidationMessage,
        updateUI: updateUI,
        restoreSelections: restoreSelections,
        updateSummary: updateSummary
      });
    }
  }

  function back() {
    if (window.WizardNavigation && window.WizardNavigation.back) {
      window.WizardNavigation.back(state, {
        updateUI: updateUI,
        restoreSelections: restoreSelections,
        renderAvatarStep: renderAvatarStep
      });
    }
  }

  function updateSummary() {
    var vm = window.WizardSerializer && window.WizardSerializer.buildSummaryViewModel
      ? window.WizardSerializer.buildSummaryViewModel(state)
      : null;
    if (!vm) return;
    document.getElementById('summaryUsage').textContent = vm.usage;
    document.getElementById('summaryHelp').textContent = vm.help;
    document.getElementById('summaryRole').textContent = vm.role;
    document.getElementById('summaryName').textContent = vm.name;
    document.getElementById('summaryPersonality').textContent = vm.personality;
    document.getElementById('summaryInteraction').textContent = vm.interaction;
    document.getElementById('summaryKnowledge').textContent = vm.knowledge;
    document.getElementById('summaryFeedback').textContent = vm.feedback;
    document.getElementById('summaryPrivacy').textContent = vm.privacy;
    const sumImg = document.getElementById('summaryAvatar');
    if (sumImg) sumImg.src = buildAvatarUrl();
  }

  function save() {
    const input = document.getElementById('inputName');
    if (input) state.name = input.value.trim();
    const base = (window.APP_CONFIG && window.APP_CONFIG.apiBaseUrl) || 'https://deine-ziel-url.de/api';
    const params = window.WizardSerializer && window.WizardSerializer.buildSaveParams
      ? window.WizardSerializer.buildSaveParams(state, buildAvatarUrl())
      : new URLSearchParams();
    window.location.href = base + '?' + params.toString();
  }

  function resetAvatar() {
    // Kompletten Wizard-Zustand zurücksetzen
    state.usage_context = '';
    state.help_context = [];
    state.role = '';
    state.name = '';
    state.nameManual = false;
    state.personality_greeting = '';
    state.personality_humor = '';
    state.personality_answer = '';
    state.personality_tone = '';
    state.personality_style = '';
    state.interaction_workflow = '';
    state.interaction_examples = '';
    state.knowledge = [];
    state.knowledge_source = [];
    state.decision_mode = '';
    state.feedback = [];
    state.privacy = [];

    // Avatar-Grundzustand wiederherstellen
    state.avatarType = 'human';
    state.avatarSkinColor = null;
    state.avatarTop = null;
    state.avatarHairColor = null;
    state.avatarFacialHair = null;
    state.avatarMouth = null;
    state.avatarClothing = null;
    state.avatarInitialized = false;
    state.currentStep = 0;

    if (window.WizardWheelCenter && window.WizardWheelCenter.resetNavigationTracking) {
      window.WizardWheelCenter.resetNavigationTracking();
    }
    if (window.WizardWheelCenter && window.WizardWheelCenter.clearLottieLayers) {
      window.WizardWheelCenter.clearLottieLayers();
    }

    // UI-Selektionen leeren
    document.querySelectorAll('.card-select.selected, .avatar-opt.selected').forEach(function (el) {
      el.classList.remove('selected');
    });

    hideValidationMessage();

    // Avatar-Vorschauen zurück auf Platzhalter
    const main = document.getElementById('avatarPreview');
    if (main) main.src = TRANSPARENT_IMG;
    document.querySelectorAll('.wizard-wheel-avatar img').forEach(function (img) {
      img.src = TRANSPARENT_IMG;
    });
    const sumImg = document.getElementById('summaryAvatar');
    if (sumImg) sumImg.src = TRANSPARENT_IMG;

    updateUI();
    restoreSelections();
    if (window.WizardWheelCenter && typeof window.WizardWheelCenter.ensureStartStepLoop === 'function') {
      window.WizardWheelCenter.ensureStartStepLoop(state);
    }
  }

  function showSettingsModal() {
    updateSettingsActions();
    if (window.WizardUiUtils && window.WizardUiUtils.showById) {
      window.WizardUiUtils.showById('settingsModal');
      return;
    }
    var modal = document.getElementById('settingsModal');
    if (!modal) return;
    modal.classList.remove('hidden');
  }

  function hideSettingsModal() {
    if (window.WizardUiUtils && window.WizardUiUtils.hideById) {
      window.WizardUiUtils.hideById('settingsModal');
      return;
    }
    var modal = document.getElementById('settingsModal');
    if (!modal) return;
    modal.classList.add('hidden');
  }

  function init() {
    readUrlParams();
    if (window.NameSuggestions && window.NameSuggestions.applyRandomNameSuggestions) {
      window.NameSuggestions.applyRandomNameSuggestions('#step3');
    }
    updateUI();
    restoreSelections();
    if (window.WizardWheelCenter && typeof window.WizardWheelCenter.refreshWheelCenterForState === 'function') {
      window.WizardWheelCenter.refreshWheelCenterForState(state);
    }
    bindCardSelects();

    if (window.WizardWheelCenter && typeof window.WizardWheelCenter.prefetchWheelAnimationData === 'function') {
      window.WizardWheelCenter.prefetchWheelAnimationData();
    }
    if (window.WizardWheelCenter && typeof window.WizardWheelCenter.ensureStartStepLoop === 'function') {
      window.WizardWheelCenter.ensureStartStepLoop(state);
    }

    var wizardContent = document.getElementById('wizardContent');
    if (wizardContent) {
      wizardContent.addEventListener('click', function (e) {
        var hotspot = e.target.closest('.wizard-wheel-start, .wizard-wheel-jump');
        if (!hotspot) return;
        e.preventDefault();
        var stepNum = Number(hotspot.getAttribute('data-step') || '0');
        if (stepNum === 0) {
          if (state.currentStep === 0) goToStep(getFirstIncompleteStep());
          else goToStep(0);
        } else {
          goToStep(stepNum);
        }
      });
    }

    const nextBtn = document.getElementById('btnNext');
    const backBtn = document.getElementById('btnBack');
    const saveBtn = document.getElementById('btnSave');
    const settingsBtn = document.getElementById('btnSettings');
    const settingsExport = document.getElementById('settingsExport');
    const settingsResetAvatar = document.getElementById('settingsResetAvatar');
    const settingsCancel = document.getElementById('settingsCancel');
    const settingsModal = document.getElementById('settingsModal');
    const inputName = document.getElementById('inputName');
    const validationOk = document.getElementById('validationOk');
    const validationModal = document.getElementById('validationModal');

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (backBtn) backBtn.addEventListener('click', back);
    if (saveBtn) saveBtn.addEventListener('click', save);
    if (settingsBtn) settingsBtn.addEventListener('click', showSettingsModal);
    if (settingsExport) {
      settingsExport.addEventListener('click', function () {
        exportWizardData();
        hideSettingsModal();
      });
    }
    if (settingsResetAvatar) {
      settingsResetAvatar.addEventListener('click', function () {
        resetAvatar();
        hideSettingsModal();
      });
    }
    if (settingsCancel) settingsCancel.addEventListener('click', hideSettingsModal);
    if (settingsModal) {
      settingsModal.addEventListener('click', function (e) {
        if (e.target === settingsModal || e.target.classList.contains('settings-backdrop')) {
          hideSettingsModal();
        }
      });
    }
    if (inputName) {
      updateNameInputState();
      inputName.addEventListener('input', function () {
        if (this.disabled) return;
        state.name = this.value.trim();
        updateWizardWheelGraphics();
      });
      inputName.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); next(); }
      });
    }

    if (validationOk) {
      validationOk.addEventListener('click', hideValidationMessage);
    }
    if (validationModal) {
      validationModal.addEventListener('click', function (e) {
        if (e.target === validationModal) hideValidationMessage();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        hideValidationMessage();
        hideSettingsModal();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

