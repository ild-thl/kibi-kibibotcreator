;(function () {
  function buildExportPayload(state, avatarUrl) {
    return {
      exportedAt: new Date().toISOString(),
      usagecontext: state.usage_context,
      helpcontext: state.help_context,
      role: state.role,
      name: state.name,
      avatarurl: avatarUrl,
      avatartype: state.avatarType || 'human',
      avatarskincolor: state.avatarSkinColor,
      avatartop: state.avatarTop,
      avatarhaircolor: state.avatarHairColor,
      avatarfacialhair: state.avatarFacialHair,
      avatarmouth: state.avatarMouth,
      avatarclothing: state.avatarClothing,
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
    params.set('usagecontext', state.usage_context);
    params.set('helpcontext', Array.isArray(state.help_context) ? state.help_context.join(',') : state.help_context);
    params.set('role', state.role);
    params.set('name', state.name);
    params.set('avatarurl', avatarUrl);
    params.set('avatartype', state.avatarType || 'human');
    params.set('avatarskincolor', state.avatarSkinColor);
    params.set('avatartop', state.avatarTop);
    params.set('avatarhaircolor', state.avatarHairColor);
    params.set('avatarfacialhair', state.avatarFacialHair);
    params.set('avatarmouth', state.avatarMouth);
    params.set('avatarclothing', state.avatarClothing);
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
    var personalityParts = [];
    if (state.personality_greeting) personalityParts.push('Anrede: ' + state.personality_greeting);
    if (state.personality_humor) personalityParts.push('Humor: ' + state.personality_humor);
    if (state.personality_answer) personalityParts.push('Antwortstil: ' + state.personality_answer);
    if (state.personality_tone) personalityParts.push('Ton: ' + state.personality_tone);
    if (state.personality_style) personalityParts.push('Stil: ' + state.personality_style);

    var interactionParts = [];
    if (state.interaction_workflow) interactionParts.push('Arbeit: ' + state.interaction_workflow);
    if (state.interaction_examples) interactionParts.push('Beispiele: ' + state.interaction_examples);

    var knowledgeParts = [];
    if (Array.isArray(state.knowledge) && state.knowledge.length) {
      knowledgeParts.push('Über dich: ' + state.knowledge.join(', '));
    }
    if (Array.isArray(state.knowledge_source) && state.knowledge_source.length) {
      knowledgeParts.push('Wissensbasis: ' + state.knowledge_source.join(', '));
    }
    if (state.decision_mode) {
      knowledgeParts.push('Entscheidungen: ' + state.decision_mode);
    }

    return {
      usage: state.usage_context || '–',
      help: Array.isArray(state.help_context) ? (state.help_context.length ? state.help_context.join(', ') : '–') : (state.help_context || '–'),
      role: state.role || '–',
      name: state.name || '–',
      personality: personalityParts.length ? personalityParts.join(' | ') : '–',
      interaction: interactionParts.length ? interactionParts.join(' | ') : '–',
      knowledge: knowledgeParts.length ? knowledgeParts.join(' | ') : '–',
      feedback: Array.isArray(state.feedback) && state.feedback.length ? state.feedback.join(', ') : '–',
      privacy: Array.isArray(state.privacy) && state.privacy.length ? state.privacy.join(', ') : '–'
    };
  }

  window.WizardSerializer = {
    buildExportPayload: buildExportPayload,
    buildSaveParams: buildSaveParams,
    buildSummaryViewModel: buildSummaryViewModel
  };
})();
