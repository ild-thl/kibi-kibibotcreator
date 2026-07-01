;(function () {
  var PRIVACY_NONE_KEY = 'keine-daten-speichern';

  function escAttr(value) {
    if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(String(value));
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function readOption(btn) {
    if (!btn) return '';
    if (btn.dataset.option != null && btn.dataset.option !== '') return btn.dataset.option;
    if (btn.dataset.value != null && btn.dataset.value !== '') return btn.dataset.value;
    return '';
  }

  /** Schritt-2: Button-Texte je nach Anrede (Duzen/Siezen), data-option bleibt unverändert. */
  function syncStep2GreetingLabels(state) {
    if (!state || !window.WizardI18n || typeof window.WizardI18n.optionLabel !== 'function') return;
    var greeting = state.personality_greeting || '';
    document.querySelectorAll('#step2 .card-select[data-field][data-option]').forEach(function (btn) {
      var field = btn.dataset.field;
      var option = readOption(btn);
      if (!field || !option) return;
      btn.textContent = window.WizardI18n.optionLabel(field, option, greeting);
    });
  }

  function cardSelector(field, optionKey) {
    var esc = escAttr(optionKey);
    return (
      '.card-select[data-field="' + field + '"][data-option="' + esc + '"],' +
      '.card-select[data-field="' + field + '"][data-value="' + esc + '"]'
    );
  }

  function bindCardSelects(state, deps) {
    var renderAvatarStep = deps && deps.renderAvatarStep;
    var updateAvatarPreview = deps && deps.updateAvatarPreview;
    var updateNameInputState = deps && deps.updateNameInputState;
    var updateWizardWheel = deps && deps.updateWizardWheel;
    var syncNextButtonMuted = deps && deps.syncNextButtonMuted;
    var onWheelSelection = deps && deps.onWheelSelection;

    document.querySelectorAll('.card-select').forEach(function (btn) {
      if (btn.classList.contains('avatar-opt')) return;
      if (btn.dataset.selectBound === 'true') return;
      btn.dataset.selectBound = 'true';
      btn.addEventListener('click', function () {
        const field = this.dataset.field;
        const isMulti = this.dataset.multi === 'true';
        if (!field) return;

        var optionValue = readOption(this);
        var previousValue = isMulti ? null : state[field];
        var previousValues = isMulti && Array.isArray(state[field]) ? state[field].slice() : null;
        var wasInList = isMulti && Array.isArray(state[field]) && state[field].indexOf(optionValue) >= 0;

        if (isMulti) {
          this.classList.toggle('selected');
          const value = optionValue;
          if (!Array.isArray(state[field])) state[field] = [];
          const idx = state[field].indexOf(value);
          if (idx >= 0) state[field].splice(idx, 1);
          else state[field].push(value);

          if (field === 'privacy') {
            if (value === PRIVACY_NONE_KEY && this.classList.contains('selected')) {
              state.privacy = [PRIVACY_NONE_KEY];
              document.querySelectorAll('.card-select[data-field="privacy"]').forEach(function (b) {
                b.classList.toggle('selected', readOption(b) === PRIVACY_NONE_KEY);
              });
            } else if (value !== PRIVACY_NONE_KEY && this.classList.contains('selected')) {
              state.privacy = state.privacy.filter(function (v) { return v !== PRIVACY_NONE_KEY; });
              var noneBtn = document.querySelector(cardSelector('privacy', PRIVACY_NONE_KEY));
              if (noneBtn) noneBtn.classList.remove('selected');
            }
          }
        } else {
          const allForField = document.querySelectorAll('.card-select[data-field="' + field + '"]');
          allForField.forEach(function (b) { b.classList.remove('selected'); });
          this.classList.add('selected');
          state[field] = optionValue;

          if (field === 'personality_greeting') {
            syncStep2GreetingLabels(state);
          }

          if (field === 'avatarType') {
            if (previousValue !== optionValue) {
              state.avatarVariant = null;
            }
            state.avatarInitialized = true;
            if (state.currentStep === 8 && typeof renderAvatarStep === 'function') {
              renderAvatarStep();
            }
            if (typeof updateAvatarPreview === 'function') updateAvatarPreview();
          }

          if (field === 'nameChoice') {
            const suggestion = this.dataset.suggestion || '';
            const input = document.getElementById('inputName');
            if (input) {
              state.nameManual = !suggestion;
              input.value = suggestion;
              state.name = suggestion;
              if (typeof updateNameInputState === 'function') updateNameInputState();
              if (!suggestion) input.focus();
            }
          }
        }

        var added = !isMulti || (this.classList.contains('selected') && !wasInList);
        if (typeof onWheelSelection === 'function') {
          onWheelSelection(state, {
            field: field,
            value: optionValue,
            isMulti: isMulti,
            added: added,
            previousValue: previousValue,
            previousValues: previousValues
          });
        }

        if (typeof updateWizardWheel === 'function') updateWizardWheel();
        if (typeof syncNextButtonMuted === 'function') syncNextButtonMuted();
      });
    });
  }

  function selectCard(field, value) {
    if (!field || value == null || value === '') return;
    var el = document.querySelector(cardSelector(field, value));
    if (el) el.classList.add('selected');
  }

  function restoreSelections(state, deps) {
    var updateNameInputState = deps && deps.updateNameInputState;

    document.querySelectorAll('.card-select.selected').forEach(function (el) {
      if (!el.classList.contains('avatar-opt')) el.classList.remove('selected');
    });

    if (state.usage_context) selectCard('usage_context', state.usage_context);
    if (Array.isArray(state.help_context)) {
      state.help_context.forEach(function (val) {
        selectCard('help_context', val);
      });
    } else if (state.help_context) {
      selectCard('help_context', state.help_context);
    }

    const inputName = document.getElementById('inputName');
    if (inputName) inputName.value = state.name;
    if (typeof updateNameInputState === 'function') updateNameInputState();
    if (state.role) selectCard('role', state.role);
    document.querySelectorAll('.card-select[data-field="avatarType"]').forEach(function (b) {
      b.classList.remove('selected');
    });
    if (state.avatarType) selectCard('avatarType', state.avatarType);
    if (state.personality_greeting) selectCard('personality_greeting', state.personality_greeting);
    if (state.personality_humor) selectCard('personality_humor', state.personality_humor);
    if (state.personality_answer) selectCard('personality_answer', state.personality_answer);
    if (state.personality_tone) selectCard('personality_tone', state.personality_tone);
    if (state.personality_style) selectCard('personality_style', state.personality_style);
    if (state.interaction_workflow) selectCard('interaction_workflow', state.interaction_workflow);
    if (state.interaction_examples) selectCard('interaction_examples', state.interaction_examples);
    if (Array.isArray(state.knowledge)) {
      state.knowledge.forEach(function (val) {
        selectCard('knowledge', val);
      });
    }
    if (Array.isArray(state.knowledge_source)) {
      state.knowledge_source.forEach(function (val) {
        selectCard('knowledge_source', val);
      });
    }
    if (state.decision_mode) selectCard('decision_mode', state.decision_mode);
    if (Array.isArray(state.feedback)) {
      state.feedback.forEach(function (val) {
        selectCard('feedback', val);
      });
    }
    if (Array.isArray(state.privacy)) {
      state.privacy.forEach(function (val) {
        selectCard('privacy', val);
      });
    }
    syncStep2GreetingLabels(state);
  }

  window.WizardSelection = {
    bindCardSelects: bindCardSelects,
    restoreSelections: restoreSelections,
    syncStep2GreetingLabels: syncStep2GreetingLabels,
    readOption: readOption
  };
})();
