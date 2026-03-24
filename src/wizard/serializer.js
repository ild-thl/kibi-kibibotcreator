;(function () {
  function buildExportPayload(state, avatarUrl) {
    return {
      exportedAt: new Date().toISOString(),
      usage_context: state.usage_context,
      help_context: state.help_context,
      role: state.role,
      name: state.name,
      avatar_url: avatarUrl,
      avatar_type: state.avatarType || 'human',
      avatar_skin_color: state.avatarSkinColor,
      avatar_top: state.avatarTop,
      avatar_headwear: state.avatarHeadwear,
      avatar_hair_color: state.avatarHairColor,
      avatar_facial_hair: state.avatarFacialHair,
      avatar_mouth: state.avatarMouth,
      avatar_clothing: state.avatarClothing,
      avatar_accessories: state.avatarAccessories,
      personality_greeting: state.personality_greeting || '',
      personality_humor: state.personality_humor || '',
      personality_answer: state.personality_answer || '',
      personality_tone: state.personality_tone || '',
      personality_style: state.personality_style || '',
      interaction_workflow: state.interaction_workflow || '',
      interaction_examples: state.interaction_examples || '',
      interaction_style: [state.interaction_workflow, state.interaction_examples].filter(Boolean),
      knowledge: Array.isArray(state.knowledge) ? state.knowledge.slice() : [],
      knowledge_source: Array.isArray(state.knowledge_source) ? state.knowledge_source.slice() : [],
      decision_mode: state.decision_mode || '',
      feedback: Array.isArray(state.feedback) ? state.feedback.slice() : [],
      privacy: Array.isArray(state.privacy) ? state.privacy.slice() : []
    };
  }

  function buildSaveParams(state, avatarUrl) {
    var params = new URLSearchParams();
    if (state.id) params.set('id', state.id);
    params.set('usage_context', state.usage_context);
    params.set('help_context', Array.isArray(state.help_context) ? state.help_context.join(',') : state.help_context);
    params.set('role', state.role);
    params.set('name', state.name);
    params.set('avatar_url', avatarUrl);
    params.set('avatar_type', state.avatarType || 'human');
    params.set('avatar_skin_color', state.avatarSkinColor);
    params.set('avatar_top', state.avatarTop);
    params.set('avatar_headwear', state.avatarHeadwear);
    params.set('avatar_hair_color', state.avatarHairColor);
    params.set('avatar_facial_hair', state.avatarFacialHair);
    params.set('avatar_mouth', state.avatarMouth);
    params.set('avatar_clothing', state.avatarClothing);
    params.set('avatar_accessories', state.avatarAccessories);
    params.set('personality_greeting', state.personality_greeting || '');
    params.set('personality_humor', state.personality_humor || '');
    params.set('personality_answer', state.personality_answer || '');
    params.set('personality_tone', state.personality_tone || '');
    params.set('personality_style', state.personality_style || '');
    params.set('interaction_workflow', state.interaction_workflow || '');
    params.set('interaction_examples', state.interaction_examples || '');
    params.set('interaction_style', [state.interaction_workflow, state.interaction_examples].filter(Boolean).join(','));
    params.set('knowledge', Array.isArray(state.knowledge) ? state.knowledge.join(',') : '');
    params.set('knowledge_source', Array.isArray(state.knowledge_source) ? state.knowledge_source.join(',') : '');
    params.set('decision_mode', state.decision_mode || '');
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
