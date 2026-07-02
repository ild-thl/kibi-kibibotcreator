;(function () {
  function label(field, key, state) {
    if (window.WizardI18n) {
      if (
        state &&
        window.WizardI18n.optionLabelForState &&
        (field === 'personality_humor' || field === 'personality_tone' || field === 'personality_style')
      ) {
        return window.WizardI18n.optionLabelForState(field, key, state);
      }
      if (window.WizardI18n.optionLabel) {
        return window.WizardI18n.optionLabel(field, key);
      }
    }
    return key || '';
  }

  function labelsJoined(field, keys) {
    if (!Array.isArray(keys) || !keys.length) return '';
    return keys.map(function (k) {
      return label(field, k);
    }).join(', ');
  }

  function empty() {
    return window.WizardI18n && window.WizardI18n.t
      ? window.WizardI18n.t('summary.empty')
      : '–';
  }

  function buildExportPayload(state, avatarUrl) {
    return {
      exportedAt: new Date().toISOString(),
      locale: window.WizardI18n ? window.WizardI18n.getLocale() : 'de',
      theme: window.WizardTheme ? window.WizardTheme.getTheme() : 'light',
      usagecontext: state.usage_context,
      helpcontext: state.help_context,
      role: state.role,
      name: state.name,
      avatarurl: avatarUrl,
      avatartype: state.avatarType || '',
      avatarvariant: state.avatarVariant || '',
      personalitygreeting: state.personality_greeting || '',
      personalityhumor: state.personality_humor || '',
      personalityanswer: state.personality_answer || '',
      personalitytone: state.personality_tone || '',
      personalitystyle: state.personality_style || '',
      interactionworkflow: state.interaction_workflow || '',
      interactionexamples: state.interaction_examples || '',
      interactionstyle: [state.interaction_workflow, state.interaction_examples].filter(Boolean),
      knowledge: Array.isArray(state.knowledge) ? state.knowledge.slice() : [],
      knowledgesource: Array.isArray(state.knowledge_source) ? state.knowledge_source.slice() : [],
      decisionmode: state.decision_mode || '',
      feedback: Array.isArray(state.feedback) ? state.feedback.slice() : [],
      privacy: Array.isArray(state.privacy) ? state.privacy.slice() : []
    };
  }

  function buildSaveParams(state, avatarUrl) {
    var params = new URLSearchParams();
    params.set('newtest', 'Y');
    if (state.id) params.set('id', state.id);
    if (window.WizardI18n) params.set('lang', window.WizardI18n.getLocale());
    if (window.WizardTheme) params.set('theme', window.WizardTheme.getTheme());
    params.set('usagecontext', state.usage_context);
    params.set('helpcontext', Array.isArray(state.help_context) ? state.help_context.join(',') : state.help_context);
    params.set('role', state.role);
    params.set('name', state.name);
    params.set('avatarurl', avatarUrl);
    params.set('avatartype', state.avatarType || '');
    params.set('avatarvariant', state.avatarVariant || '');
    params.set('personalitygreeting', state.personality_greeting || '');
    params.set('personalityhumor', state.personality_humor || '');
    params.set('personalityanswer', state.personality_answer || '');
    params.set('personalitytone', state.personality_tone || '');
    params.set('personalitystyle', state.personality_style || '');
    params.set('interactionworkflow', state.interaction_workflow || '');
    params.set('interactionexamples', state.interaction_examples || '');
    params.set('interactionstyle', [state.interaction_workflow, state.interaction_examples].filter(Boolean).join(','));
    params.set('knowledge', Array.isArray(state.knowledge) ? state.knowledge.join(',') : '');
    params.set('knowledgesource', Array.isArray(state.knowledge_source) ? state.knowledge_source.join(',') : '');
    params.set('decisionmode', state.decision_mode || '');
    params.set('feedback', Array.isArray(state.feedback) ? state.feedback.join(',') : '');
    params.set('privacy', Array.isArray(state.privacy) ? state.privacy.join(',') : '');
    return params;
  }

  function buildSummaryViewModel(state) {
    var t = window.WizardI18n && window.WizardI18n.t ? window.WizardI18n.t.bind(window.WizardI18n) : function (k, v) { return k; };

    var personalityParts = [];
    if (state.personality_greeting) {
      personalityParts.push(t('summary.personalityGreeting', { value: label('personality_greeting', state.personality_greeting) }));
    }
    if (state.personality_humor) {
      personalityParts.push(t('summary.personalityHumor', { value: label('personality_humor', state.personality_humor, state) }));
    }
    if (state.personality_answer) {
      personalityParts.push(t('summary.personalityAnswer', { value: label('personality_answer', state.personality_answer, state) }));
    }
    if (state.personality_tone) {
      personalityParts.push(t('summary.personalityTone', { value: label('personality_tone', state.personality_tone, state) }));
    }
    if (state.personality_style) {
      personalityParts.push(t('summary.personalityStyle', { value: label('personality_style', state.personality_style, state) }));
    }

    var interactionParts = [];
    if (state.interaction_workflow) {
      interactionParts.push(t('summary.interactionWorkflow', { value: label('interaction_workflow', state.interaction_workflow) }));
    }
    if (state.interaction_examples) {
      interactionParts.push(t('summary.interactionExamples', { value: label('interaction_examples', state.interaction_examples) }));
    }

    var knowledgeParts = [];
    if (Array.isArray(state.knowledge) && state.knowledge.length) {
      knowledgeParts.push(t('summary.knowledgeAbout', { value: labelsJoined('knowledge', state.knowledge) }));
    }
    if (Array.isArray(state.knowledge_source) && state.knowledge_source.length) {
      knowledgeParts.push(t('summary.knowledgeSource', { value: labelsJoined('knowledge_source', state.knowledge_source) }));
    }
    if (state.decision_mode) {
      knowledgeParts.push(t('summary.decision', { value: label('decision_mode', state.decision_mode) }));
    }

    return {
      usage: state.usage_context ? label('usage_context', state.usage_context) : empty(),
      help: Array.isArray(state.help_context)
        ? (state.help_context.length ? labelsJoined('help_context', state.help_context) : empty())
        : (state.help_context ? label('help_context', state.help_context) : empty()),
      role: state.role ? label('role', state.role) : empty(),
      name: state.name || empty(),
      personality: personalityParts.length ? personalityParts.join(' | ') : empty(),
      interaction: interactionParts.length ? interactionParts.join(' | ') : empty(),
      knowledge: knowledgeParts.length ? knowledgeParts.join(' | ') : empty(),
      feedback: Array.isArray(state.feedback) && state.feedback.length ? labelsJoined('feedback', state.feedback) : empty(),
      privacy: Array.isArray(state.privacy) && state.privacy.length ? labelsJoined('privacy', state.privacy) : empty()
    };
  }

  function buildSummaryMobilePages(state) {
    var tFn = window.WizardI18n && window.WizardI18n.t ? window.WizardI18n.t.bind(window.WizardI18n) : function (k) { return k; };

    function pushLabel(list, field, key) {
      if (!key) return;
      list.push(label(field, key, state));
    }

    function pushLabels(list, field, keys) {
      if (!Array.isArray(keys)) return;
      keys.forEach(function (key) {
        pushLabel(list, field, key);
      });
    }

    var usagePurposeItems = [];
    pushLabel(usagePurposeItems, 'usage_context', state.usage_context);
    pushLabels(usagePurposeItems, 'help_context', state.help_context);

    var personalityItems = [];
    pushLabel(personalityItems, 'personality_greeting', state.personality_greeting);
    pushLabel(personalityItems, 'personality_humor', state.personality_humor);
    pushLabel(personalityItems, 'personality_answer', state.personality_answer);
    pushLabel(personalityItems, 'personality_tone', state.personality_tone);
    pushLabel(personalityItems, 'personality_style', state.personality_style);

    var roleNameItems = [];
    pushLabel(roleNameItems, 'role', state.role);
    if (state.name) roleNameItems.push(state.name);

    var interactionItems = [];
    pushLabel(interactionItems, 'interaction_workflow', state.interaction_workflow);
    pushLabel(interactionItems, 'interaction_examples', state.interaction_examples);

    var knowledgeItems = [];
    pushLabels(knowledgeItems, 'knowledge', state.knowledge);
    pushLabels(knowledgeItems, 'knowledge_source', state.knowledge_source);
    pushLabel(knowledgeItems, 'decision_mode', state.decision_mode);

    var feedbackItems = [];
    pushLabels(feedbackItems, 'feedback', state.feedback);

    var privacyItems = [];
    pushLabels(privacyItems, 'privacy', state.privacy);

    var visualItems = [];
    if (state.avatarType) {
      if (state.avatarType === 'none') {
        visualItems.push(tFn('avatar.type.none'));
      } else {
        visualItems.push(tFn('avatar.type.' + state.avatarType));
        if (state.avatarVariant) {
          visualItems.push(tFn('avatar.variant.' + state.avatarVariant));
        }
      }
    }

    function section(icon, titleKey, items) {
      return {
        icon: icon,
        title: tFn(titleKey),
        items: items.length ? items : [empty()]
      };
    }

    return [
      {
        sections: [
          section('einsatz-zweck', 'summary.mobile.usagePurpose', usagePurposeItems),
          section('personality', 'summary.mobile.personalityTone', personalityItems)
        ]
      },
      {
        sections: [
          section('role-name', 'summary.mobile.roleName', roleNameItems),
          section('interaction', 'summary.mobile.interaction', interactionItems),
          section('knowledge', 'summary.mobile.knowledge', knowledgeItems)
        ]
      },
      {
        sections: [
          section('feedback', 'summary.mobile.feedback', feedbackItems),
          section('privacy', 'summary.mobile.privacy', privacyItems),
          section('visual', 'summary.mobile.visualDesign', visualItems)
        ]
      }
    ];
  }

  window.WizardSerializer = {
    buildExportPayload: buildExportPayload,
    buildSaveParams: buildSaveParams,
    buildSummaryViewModel: buildSummaryViewModel,
    buildSummaryMobilePages: buildSummaryMobilePages
  };
})();
