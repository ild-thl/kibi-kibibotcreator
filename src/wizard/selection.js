;(function () {
  function bindCardSelects(state, deps) {
    var renderAvatarStep = deps && deps.renderAvatarStep;
    var updateAvatarPreview = deps && deps.updateAvatarPreview;
    var updateNameInputState = deps && deps.updateNameInputState;
    var updateWizardWheel = deps && deps.updateWizardWheel;
    var onWheelSelection = deps && deps.onWheelSelection;

    document.querySelectorAll('.card-select').forEach(function (btn) {
      if (btn.classList.contains('avatar-opt')) return;
      btn.addEventListener('click', function () {
        const field = this.dataset.field;
        const isMulti = this.dataset.multi === 'true';
        if (!field) return;

        var wasInList = isMulti && Array.isArray(state[field]) && state[field].indexOf(this.dataset.value) >= 0;

        if (isMulti) {
          this.classList.toggle('selected');
          const value = this.dataset.value;
          if (!Array.isArray(state[field])) state[field] = [];
          const idx = state[field].indexOf(value);
          if (idx >= 0) state[field].splice(idx, 1);
          else state[field].push(value);

          if (field === 'privacy') {
            var noneValue = 'Keine Daten speichern';
            if (value === noneValue && this.classList.contains('selected')) {
              state.privacy = [noneValue];
              document.querySelectorAll('.card-select[data-field="privacy"]').forEach(function (b) {
                b.classList.toggle('selected', b.dataset.value === noneValue);
              });
            } else if (value !== noneValue && this.classList.contains('selected')) {
              state.privacy = state.privacy.filter(function (v) { return v !== noneValue; });
              var noneBtn = document.querySelector('.card-select[data-field="privacy"][data-value="' + noneValue + '"]');
              if (noneBtn) noneBtn.classList.remove('selected');
            }
          }
        } else {
          const allForField = document.querySelectorAll('.card-select[data-field="' + field + '"]');
          allForField.forEach(function (b) { b.classList.remove('selected'); });
          this.classList.add('selected');
          const value = this.dataset.value;
          state[field] = value;

          if (field === 'personality_humor') {
            if (value === 'Humorvoll') state.avatarMouth = 'smile';
            else if (value === 'Ernst') state.avatarMouth = 'serious';
            else state.avatarMouth = null;
            if (state.avatarInitialized && typeof updateAvatarPreview === 'function') {
              updateAvatarPreview();
            }
          }

          if (field === 'personality_tone') {
            if (window.WizardAvatar && typeof window.WizardAvatar.syncHumanClothingFromTone === 'function') {
              window.WizardAvatar.syncHumanClothingFromTone(state);
            }
            if (state.avatarInitialized && typeof updateAvatarPreview === 'function') {
              updateAvatarPreview();
            }
          }

          if (field === 'avatarType') {
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
            value: this.dataset.value,
            isMulti: isMulti,
            added: added
          });
        }

        if (typeof updateWizardWheel === 'function') updateWizardWheel();
      });
    });
  }

  function restoreSelections(state, deps) {
    var updateNameInputState = deps && deps.updateNameInputState;

    if (state.usage_context) {
      document.querySelector('.card-select[data-field="usage_context"][data-value="' + state.usage_context + '"]')?.classList.add('selected');
    }
    if (Array.isArray(state.help_context)) {
      state.help_context.forEach(function (val) {
        document.querySelector('.card-select[data-field="help_context"][data-value="' + val + '"]')?.classList.add('selected');
      });
    } else if (state.help_context) {
      document.querySelector('.card-select[data-field="help_context"][data-value="' + state.help_context + '"]')?.classList.add('selected');
    }

    const inputName = document.getElementById('inputName');
    if (inputName) inputName.value = state.name;
    if (typeof updateNameInputState === 'function') updateNameInputState();
    if (state.role) {
      document.querySelector('.card-select[data-field="role"][data-value="' + state.role + '"]')?.classList.add('selected');
    }
    if (state.avatarType) {
      document.querySelector('.card-select[data-field="avatarType"][data-value="' + state.avatarType + '"]')?.classList.add('selected');
    }
    if (state.personality_greeting) {
      document.querySelector('.card-select[data-field="personality_greeting"][data-value="' + state.personality_greeting + '"]')?.classList.add('selected');
    }
    if (state.personality_humor) {
      document.querySelector('.card-select[data-field="personality_humor"][data-value="' + state.personality_humor + '"]')?.classList.add('selected');
    }
    if (state.personality_answer) {
      document.querySelector('.card-select[data-field="personality_answer"][data-value="' + state.personality_answer + '"]')?.classList.add('selected');
    }
    if (state.personality_tone) {
      document.querySelector('.card-select[data-field="personality_tone"][data-value="' + state.personality_tone + '"]')?.classList.add('selected');
    }
    if (state.personality_style) {
      document.querySelector('.card-select[data-field="personality_style"][data-value="' + state.personality_style + '"]')?.classList.add('selected');
    }
    if (state.interaction_workflow) {
      document.querySelector('.card-select[data-field="interaction_workflow"][data-value="' + state.interaction_workflow + '"]')?.classList.add('selected');
    }
    if (state.interaction_examples) {
      document.querySelector('.card-select[data-field="interaction_examples"][data-value="' + state.interaction_examples + '"]')?.classList.add('selected');
    }
    if (Array.isArray(state.knowledge)) {
      state.knowledge.forEach(function (val) {
        document.querySelector('.card-select[data-field="knowledge"][data-value="' + val + '"]')?.classList.add('selected');
      });
    }
    if (Array.isArray(state.knowledge_source)) {
      state.knowledge_source.forEach(function (val) {
        document.querySelector('.card-select[data-field="knowledge_source"][data-value="' + val + '"]')?.classList.add('selected');
      });
    }
    if (state.decision_mode) {
      document.querySelector('.card-select[data-field="decision_mode"][data-value="' + state.decision_mode + '"]')?.classList.add('selected');
    }
    if (Array.isArray(state.feedback)) {
      state.feedback.forEach(function (val) {
        document.querySelector('.card-select[data-field="feedback"][data-value="' + val + '"]')?.classList.add('selected');
      });
    }
    if (Array.isArray(state.privacy)) {
      state.privacy.forEach(function (val) {
        document.querySelector('.card-select[data-field="privacy"][data-value="' + val + '"]')?.classList.add('selected');
      });
    }
  }

  window.WizardSelection = {
    bindCardSelects: bindCardSelects,
    restoreSelections: restoreSelections
  };
})();
