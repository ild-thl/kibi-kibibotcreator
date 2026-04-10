;(function () {
  function isAvatarStepValid(state) {
    if (state.avatarType !== 'human') {
      return !!state.avatarType;
    }
    return !!(
      state.avatarSkinColor !== null &&
      state.avatarTop !== null &&
      state.avatarHairColor !== null &&
      state.avatarFacialHair !== null &&
      state.avatarMouth !== null &&
      state.avatarClothing !== null
    );
  }

  function isStepValid(state, stepNum) {
    if (!state) return false;
    if (state.testMode) return true;
    if (stepNum === 0) return true;

    if (stepNum === 1) {
      var okHelp = Array.isArray(state.help_context) ? state.help_context.length > 0 : !!state.help_context;
      return !!state.usage_context && okHelp;
    }
    if (stepNum === 2) {
      return !!(
        state.personality_greeting &&
        state.personality_humor &&
        state.personality_answer &&
        state.personality_tone &&
        state.personality_style
      );
    }
    if (stepNum === 3) {
      return !!state.role && !!state.name;
    }
    if (stepNum === 4) {
      return !!state.interaction_workflow && !!state.interaction_examples;
    }
    if (stepNum === 5) {
      return !!(
        Array.isArray(state.knowledge) && state.knowledge.length > 0 &&
        Array.isArray(state.knowledge_source) && state.knowledge_source.length > 0 &&
        state.decision_mode
      );
    }
    if (stepNum === 6) {
      return Array.isArray(state.feedback) && state.feedback.length > 0;
    }
    if (stepNum === 7) {
      return Array.isArray(state.privacy) && state.privacy.length > 0;
    }
    if (stepNum === 8) {
      return isAvatarStepValid(state);
    }
    return true;
  }

  function isWizardComplete(state) {
    for (var s = 1; s <= 8; s++) {
      if (!isStepValid(state, s)) return false;
    }
    return true;
  }

  window.WizardValidation = {
    isStepValid: isStepValid,
    isWizardComplete: isWizardComplete
  };
})();
