(function () {
  const TOTAL_STEPS = 9;
  const state = {
    id: '',
    // Schritt 1
    usage_context: '',           // Für was soll Dein Avatar eingesetzt werden?
    help_context: '',            // Wobei soll Dir der Avatar helfen?
    // Schritt 2
    role: '',                    // Rolle des Avatars
    name: '',                    // Name des Avatars (frei oder Vorschlag)
    // Schritt 3
    personality: [],             // Mehrfachauswahl (Duzen, Siezen, locker, ...)
    // Schritt 4
    interaction_style: [],       // Mehrfachauswahl (Schritt-für-Schritt, Direkt, ...)
    // Schritt 5
    knowledge: [],               // Mehrfachauswahl (kennt Studiengang, Modulplan, ...)
    // Schritt 6
    feedback: '',                // Reaktion bei Fehlern/Problemen
    // Schritt 7 – Avatar-Optik
    avatarSkinColor: '',
    avatarTop: '',
    avatarHeadwear: '',
    avatarHairColor: '',
    avatarFacialHair: '',
    avatarMouth: '',
    avatarClothing: '',
    avatarAccessories: '',
    // Schritt 8 – Datenschutz
    privacy: [],                 // Mehrfachauswahl Datenschutzoptionen
    // Avatar wurde aktiv erzeugt (Nutzerinteraktion)
    avatarInitialized: false,
    currentStep: 1
  };

  // Avatar-Optionen (DiceBear 9.x avataaars – Schema-konforme Werte)
  const avatarSkinColors = [
    { label: 'Sehr hell', value: 'ffdbb4' },
    { label: 'Hell', value: 'edb98a' },
    { label: 'Mittel', value: 'd08b5b' },
    { label: 'Gebräunt', value: 'ae5d29' },
    { label: 'Dunkel', value: '614335' },
    { label: 'Warm', value: 'fd9841' }
  ];
  const avatarFrisurByGender = {
    'männlich': [
      { label: 'Kurz flach', value: 'shortFlat' },
      { label: 'Kurz rund', value: 'shortRound' },
      { label: 'Kurz gewellt', value: 'shortWaved' },
      { label: 'Kurz lockig', value: 'shortCurly' },
      { label: 'Seitenscheitel', value: 'theCaesarAndSidePart' },
      { label: 'Caesar', value: 'theCaesar' },
      { label: 'Seiten', value: 'sides' },
      { label: 'Mullet', value: 'shaggyMullet' },
      { label: 'Shaggy', value: 'shaggy' },
      { label: 'Dreads', value: 'dreads01' },
      { label: 'Dreads 2', value: 'dreads02' },
      { label: 'Seiten abrasiert', value: 'shavedSides' },
      { label: 'Großes Haar', value: 'bigHair' },
      { label: 'Frizzy', value: 'frizzle' }
    ],
    'weiblich': [
      { label: 'Lang gerade', value: 'straight01' },
      { label: 'Lang gerade (variiert)', value: 'straight02' },
      { label: 'Lang & Strähnen', value: 'straightAndStrand' },
      { label: 'Lang lockig', value: 'curly' },
      { label: 'Lang, aber nicht zu lang', value: 'longButNotTooLong' },
      { label: 'Bob', value: 'bob' },
      { label: 'Dutt', value: 'bun' },
      { label: 'Mia Wallace', value: 'miaWallace' },
      { label: 'Afro', value: 'fro' },
      { label: 'Afro mit Band', value: 'froBand' },
      { label: 'Frida', value: 'frida' },
      { label: 'Curvy', value: 'curvy' },
      { label: 'Frizzy', value: 'frizzle' },
      { label: 'Dreads', value: 'dreads01' },
      { label: 'Seiten abrasiert', value: 'shavedSides' },
      { label: 'Großes Haar', value: 'bigHair' }
    ],
    'divers': [
      { label: 'Kurz flach', value: 'shortFlat' },
      { label: 'Kurz rund', value: 'shortRound' },
      { label: 'Kurz gewellt', value: 'shortWaved' },
      { label: 'Kurz lockig', value: 'shortCurly' },
      { label: 'Lang gerade', value: 'straight01' },
      { label: 'Lang lockig', value: 'curly' },
      { label: 'Bob', value: 'bob' },
      { label: 'Dutt', value: 'bun' },
      { label: 'Shaggy', value: 'shaggy' },
      { label: 'Dreads', value: 'dreads01' },
      { label: 'Afro', value: 'fro' },
      { label: 'Großes Haar', value: 'bigHair' }
    ],
    'kein Geschlecht': [
      { label: 'Kurz flach', value: 'shortFlat' },
      { label: 'Kurz rund', value: 'shortRound' },
      { label: 'Lang gerade', value: 'straight01' },
      { label: 'Bob', value: 'bob' },
      { label: 'Dutt', value: 'bun' },
      { label: 'Shaggy', value: 'shaggy' }
    ]
  };
  const avatarHeadwearOpts = [
    { label: 'Keine', value: '' },
    { label: 'Hut', value: 'hat' },
    { label: 'Hijab', value: 'hijab' },
    { label: 'Turban', value: 'turban' },
    { label: 'Wintermütze', value: 'winterHat1' },
    { label: 'Wintermütze 2', value: 'winterHat02' },
    { label: 'Wintermütze 3', value: 'winterHat03' },
    { label: 'Wintermütze 4', value: 'winterHat04' }
  ];
  const avatarHairColors = [
    { label: 'Schwarz', value: '2c1b18' },
    { label: 'Braun', value: 'b58143' },
    { label: 'Blond', value: 'ecdcbf' },
    { label: 'Auburn', value: 'a55728' },
    { label: 'Grau', value: '4a312c' }
  ];
  const avatarFacialHairOpts = [
    { label: 'Kein Bart', value: '' },
    { label: 'Leichter Bart', value: 'beardLight' },
    { label: 'Vollbart mittel', value: 'beardMedium' },
    { label: 'Vollbart majestätisch', value: 'beardMajestic' },
    { label: 'Schnurrbart elegant', value: 'moustacheFancy' },
    { label: 'Schnurrbart kräftig', value: 'moustacheMagnum' }
  ];
  const avatarMouthOpts = [
    { label: 'Lächelnd', value: 'smile' },
    { label: 'Neutral', value: 'default' },
    { label: 'Ernst', value: 'serious' },
    { label: 'Fröhlich', value: 'twinkle' },
    { label: 'Nachdenklich', value: 'concerned' },
    { label: 'Überrascht', value: 'disbelief' }
  ];
  const avatarClothingOpts = [
    { label: 'Blazer & Hemd', value: 'blazerAndShirt' },
    { label: 'Blazer & Pullover', value: 'blazerAndSweater' },
    { label: 'Kragen & Pullover', value: 'collarAndSweater' },
    { label: 'Hoodie', value: 'hoodie' },
    { label: 'T-Shirt runder Ausschnitt', value: 'shirtCrewNeck' },
    { label: 'T-Shirt V-Ausschnitt', value: 'shirtVNeck' },
    { label: 'T-Shirt Scoop-Ausschnitt', value: 'shirtScoopNeck' },
    { label: 'T-Shirt mit Grafik', value: 'graphicShirt' },
    { label: 'Overall', value: 'overall' }
  ];
  const avatarAccessoriesOpts = [
    { label: 'Keine', value: '' },
    { label: 'Brille', value: 'prescription01' },
    { label: 'Sonnebrille', value: 'sunglasses' },
    { label: 'Rund', value: 'round' },
    { label: 'Wayfarer', value: 'wayfarers' },
    { label: 'Augenklappe', value: 'eyepatch' }
  ];

  const DICEBEAR = 'https://api.dicebear.com/9.x/avataaars/svg';

  function readUrlParams() {
    const params = new URLSearchParams(window.location.search);
    state.id = params.get('id') || '';
  }

  function buildAvatarUrl() {
    const topValue = state.avatarHeadwear || state.avatarTop || 'shortFlat';
    const seed = (state.name || state.id || 'avatar') + topValue + state.avatarHairColor + state.avatarSkinColor;
    const p = new URLSearchParams({
      seed: seed,
      top: topValue,
      hairColor: state.avatarHairColor || 'b58143',
      skinColor: state.avatarSkinColor || 'edb98a',
      mouth: state.avatarMouth || 'smile',
      clothing: state.avatarClothing || 'shirtCrewNeck'
    });
    if (state.avatarAccessories) {
      p.set('accessories', state.avatarAccessories);
      p.set('accessoriesProbability', '100');
    } else {
      p.set('accessoriesProbability', '0');
    }
    if (state.avatarFacialHair) {
      p.set('facialHair', state.avatarFacialHair);
      p.set('facialHairProbability', '100');
      p.set('facialHairColor', state.avatarHairColor || 'b58143');
    } else {
      p.set('facialHairProbability', '0');
    }
    return DICEBEAR + '?' + p.toString();
  }

  function renderAvatarOption(containerId, options, stateKey, dataKind) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = options.map(function (o) {
      return '<button type="button" class="avatar-opt card-select px-3 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium transition-all" data-kind="' + dataKind + '" data-value="' + (o.value || '') + '">' + o.label + '</button>';
    }).join('');
    container.querySelectorAll('.avatar-opt').forEach(function (b) {
      var val = b.dataset.value || '';
      if (val === (state[stateKey] || '')) b.classList.add('selected');
      b.addEventListener('click', onAvatarOptClick);
    });
  }

  function renderAvatarStep() {
    const g = state.gender || 'divers';
    const frisurOpts = avatarFrisurByGender[g] || avatarFrisurByGender['divers'];
    const validTops = frisurOpts.map(function (o) { return o.value; });
    if (!validTops.includes(state.avatarTop) && frisurOpts[0]) state.avatarTop = frisurOpts[0].value;
    if (!state.avatarTop && frisurOpts[0]) state.avatarTop = frisurOpts[0].value;
    if (!state.avatarHairColor) state.avatarHairColor = 'b58143';
    if (!state.avatarSkinColor) state.avatarSkinColor = 'edb98a';
    if (!state.avatarMouth) state.avatarMouth = 'smile';
    if (!state.avatarClothing) state.avatarClothing = 'shirtCrewNeck';
    if (state.avatarAccessories === undefined) state.avatarAccessories = '';
    if (state.avatarFacialHair === undefined) state.avatarFacialHair = '';
    if (state.avatarHeadwear === undefined) state.avatarHeadwear = '';

    renderAvatarOption('avatarSkinColor', avatarSkinColors, 'avatarSkinColor', 'skin');
    renderAvatarOption('avatarFrisur', frisurOpts, 'avatarTop', 'top');
    renderAvatarOption('avatarHeadwear', avatarHeadwearOpts, 'avatarHeadwear', 'headwear');
    renderAvatarOption('avatarHairColor', avatarHairColors, 'avatarHairColor', 'hair');
    renderAvatarOption('avatarFacialHair', avatarFacialHairOpts, 'avatarFacialHair', 'facialHair');
    renderAvatarOption('avatarMouth', avatarMouthOpts, 'avatarMouth', 'mouth');
    renderAvatarOption('avatarClothing', avatarClothingOpts, 'avatarClothing', 'clothing');
    renderAvatarOption('avatarAccessories', avatarAccessoriesOpts, 'avatarAccessories', 'acc');
  }

  function onAvatarOptClick() {
    const kind = this.dataset.kind, val = this.dataset.value || '';
    const container = this.closest('div');
    container.querySelectorAll('.avatar-opt').forEach(function (b) { b.classList.remove('selected'); });
    this.classList.add('selected');
    if (kind === 'skin') state.avatarSkinColor = val;
    if (kind === 'top') state.avatarTop = val;
    if (kind === 'headwear') state.avatarHeadwear = val;
    if (kind === 'hair') state.avatarHairColor = val;
    if (kind === 'facialHair') state.avatarFacialHair = val;
    if (kind === 'mouth') state.avatarMouth = val;
    if (kind === 'clothing') state.avatarClothing = val;
    if (kind === 'acc') state.avatarAccessories = val;
    state.avatarInitialized = true;
    updateAvatarPreview();
  }

  function updateAvatarPreview() {
    if (!state.avatarInitialized) return;
    const url = buildAvatarUrl();
    const main = document.getElementById('avatarPreview');
    if (main) main.src = url;
    document.querySelectorAll('.wizard-wheel-avatar img').forEach(function (img) {
      img.src = url;
    });
  }

  function updateUI() {
    document.querySelectorAll('.wizard-step').forEach(function (el, i) {
      el.classList.toggle('hidden', i + 1 !== state.currentStep);
    });
    document.getElementById('currentStep').textContent = state.currentStep;
    document.getElementById('totalSteps').textContent = TOTAL_STEPS;
    document.getElementById('progressBar').style.width = (state.currentStep / TOTAL_STEPS * 100) + '%';
    document.getElementById('btnBack').classList.toggle('hidden', state.currentStep <= 1);
    document.getElementById('btnNext').classList.toggle('hidden', state.currentStep === TOTAL_STEPS);
    document.getElementById('wizardContent').classList.add('step-enter');
    // Avatar-Schritt ist jetzt Schritt 7
    if (state.currentStep === 7) renderAvatarStep();
  }

  function bindCardSelects() {
    document.querySelectorAll('.card-select').forEach(function (btn) {
      if (btn.classList.contains('avatar-opt')) return;
      btn.addEventListener('click', function () {
        const field = this.dataset.field;
        const isMulti = this.dataset.multi === 'true';
        if (!field) return;

        if (isMulti) {
          // Mehrfachauswahl: nur toggeln
          this.classList.toggle('selected');
          const value = this.dataset.value;
          if (!Array.isArray(state[field])) state[field] = [];
          const idx = state[field].indexOf(value);
          if (idx >= 0) {
            state[field].splice(idx, 1);
          } else {
            state[field].push(value);
          }
        } else {
          // Einzelauswahl: innerhalb desselben Feldes nur einen aktiv lassen
          const allForField = document.querySelectorAll('.card-select[data-field="' + field + '"]');
          allForField.forEach(function (b) { b.classList.remove('selected'); });
          this.classList.add('selected');
          const value = this.dataset.value;
          state[field] = value;

          // Spezielle Behandlung für Namensvorschläge
          if (field === 'nameChoice') {
            const suggestion = this.dataset.suggestion || '';
            const input = document.getElementById('inputName');
            if (input) {
              input.value = suggestion;
              state.name = suggestion;
              if (!suggestion) {
                input.focus();
              }
            }
          }
        }
      });
    });
  }

  function restoreSelections() {
    // Schritt 1
    if (state.usage_context) {
      document.querySelector('.card-select[data-field="usage_context"][data-value="' + state.usage_context + '"]')?.classList.add('selected');
    }
    if (state.help_context) {
      document.querySelector('.card-select[data-field="help_context"][data-value="' + state.help_context + '"]')?.classList.add('selected');
    }
    // Schritt 2
    const inputName = document.getElementById('inputName');
    if (inputName) inputName.value = state.name;
    if (state.role) {
      document.querySelector('.card-select[data-field="role"][data-value="' + state.role + '"]')?.classList.add('selected');
    }
    // Schritt 3
    if (Array.isArray(state.personality)) {
      state.personality.forEach(function (val) {
        document.querySelector('.card-select[data-field="personality"][data-value="' + val + '"]')?.classList.add('selected');
      });
    }
    // Schritt 4
    if (Array.isArray(state.interaction_style)) {
      state.interaction_style.forEach(function (val) {
        document.querySelector('.card-select[data-field="interaction_style"][data-value="' + val + '"]')?.classList.add('selected');
      });
    }
    // Schritt 5
    if (Array.isArray(state.knowledge)) {
      state.knowledge.forEach(function (val) {
        document.querySelector('.card-select[data-field="knowledge"][data-value="' + val + '"]')?.classList.add('selected');
      });
    }
    // Schritt 6
    if (state.feedback) {
      document.querySelector('.card-select[data-field="feedback"][data-value="' + state.feedback + '"]')?.classList.add('selected');
    }
    // Schritt 8
    if (Array.isArray(state.privacy)) {
      state.privacy.forEach(function (val) {
        document.querySelector('.card-select[data-field="privacy"][data-value="' + val + '"]')?.classList.add('selected');
      });
    }
  }

  function isCurrentStepValid() {
    // Schritt 1: Einsatz & Zweck
    if (state.currentStep === 1) {
      return !!state.usage_context && !!state.help_context;
    }
    // Schritt 2: Rolle & Name
    if (state.currentStep === 2) {
      const input = document.getElementById('inputName');
      if (input) {
        state.name = input.value.trim();
      }
      return !!state.role && !!state.name;
    }
    // Schritt 3: Persönlichkeit & Ton (Mehrfachauswahl)
    if (state.currentStep === 3) {
      return Array.isArray(state.personality) && state.personality.length > 0;
    }
    // Schritt 4: Arbeitsweise & Interaktion (Mehrfachauswahl)
    if (state.currentStep === 4) {
      return Array.isArray(state.interaction_style) && state.interaction_style.length > 0;
    }
    // Schritt 5: Wissen & Kompetenz (Mehrfachauswahl)
    if (state.currentStep === 5) {
      return Array.isArray(state.knowledge) && state.knowledge.length > 0;
    }
    // Schritt 6: Lernen & Feedback
    if (state.currentStep === 6) {
      return !!state.feedback;
    }
    // Schritt 7: Avatar – Standardwerte werden automatisch gesetzt, daher immer gültig
    if (state.currentStep === 7) {
      return true;
    }
    // Schritt 8: Datenschutz (Mehrfachauswahl)
    if (state.currentStep === 8) {
      return Array.isArray(state.privacy) && state.privacy.length > 0;
    }
    return true;
  }

  function showValidationMessage(message) {
    var overlay = document.getElementById('validationModal');
    var text = document.getElementById('validationMessage');
    if (!overlay || !text) return;
    text.textContent = message || 'Bitte triff zuerst eine Auswahl bzw. gib einen Wert ein, bevor du fortfährst.';
    overlay.classList.remove('hidden');
  }

  function hideValidationMessage() {
    var overlay = document.getElementById('validationModal');
    if (!overlay) return;
    overlay.classList.add('hidden');
  }

  function goToStep(targetStep) {
    targetStep = Number(targetStep);
    if (!targetStep || targetStep < 1 || targetStep > TOTAL_STEPS) return;
    if (targetStep === state.currentStep) return;

    // Rückwärts immer erlaubt
    if (targetStep < state.currentStep) {
      state.currentStep = targetStep;
      updateUI();
      restoreSelections();
      if (state.currentStep === 7) renderAvatarStep();
      if (state.currentStep === TOTAL_STEPS) updateSummary();
      return;
    }

    // Vorwärts: Schritt für Schritt mit Validierung
    while (state.currentStep < targetStep) {
      if (!isCurrentStepValid()) {
        showValidationMessage('Bitte triff zuerst eine Auswahl bzw. gib einen Wert ein, bevor du zu diesem Schritt springst.');
        break;
      }
      state.currentStep++;
      updateUI();
      restoreSelections();
      if (state.currentStep === 7) renderAvatarStep();
      if (state.currentStep === TOTAL_STEPS) updateSummary();
    }
  }

  function next() {
    // Validierung: ohne Auswahl/Eingabe kein Weiterklicken
    if (!isCurrentStepValid()) {
      showValidationMessage('Bitte triff zuerst eine Auswahl bzw. gib einen Wert ein, bevor du fortfährst.');
      return;
    }
    const input = document.getElementById('inputName');
    if (state.currentStep === 2 && input) state.name = input.value.trim();
    if (state.currentStep < TOTAL_STEPS) {
      state.currentStep++;
      updateUI();
      restoreSelections();
      if (state.currentStep === TOTAL_STEPS) updateSummary();
    }
  }

  function back() {
    if (state.currentStep > 1) {
      state.currentStep--;
      updateUI();
      restoreSelections();
      if (state.currentStep === 7) renderAvatarStep();
    }
  }

  function updateSummary() {
    document.getElementById('summaryUsage').textContent = state.usage_context || '–';
    document.getElementById('summaryHelp').textContent = state.help_context || '–';
    document.getElementById('summaryRole').textContent = state.role || '–';
    document.getElementById('summaryName').textContent = state.name || '–';
    document.getElementById('summaryPersonality').textContent =
      Array.isArray(state.personality) && state.personality.length ? state.personality.join(', ') : '–';
    document.getElementById('summaryInteraction').textContent =
      Array.isArray(state.interaction_style) && state.interaction_style.length ? state.interaction_style.join(', ') : '–';
    document.getElementById('summaryKnowledge').textContent =
      Array.isArray(state.knowledge) && state.knowledge.length ? state.knowledge.join(', ') : '–';
    document.getElementById('summaryFeedback').textContent = state.feedback || '–';
    document.getElementById('summaryPrivacy').textContent =
      Array.isArray(state.privacy) && state.privacy.length ? state.privacy.join(', ') : '–';
    const sumImg = document.getElementById('summaryAvatar');
    if (sumImg) sumImg.src = buildAvatarUrl();
  }

  function save() {
    const input = document.getElementById('inputName');
    if (input) state.name = input.value.trim();
    const base = (window.APP_CONFIG && window.APP_CONFIG.apiBaseUrl) || 'https://deine-ziel-url.de/api';
    const params = new URLSearchParams();
    if (state.id) params.set('id', state.id);
    params.set('usage_context', state.usage_context);
    params.set('help_context', state.help_context);
    params.set('role', state.role);
    params.set('name', state.name);
    params.set('avatar_url', buildAvatarUrl());
    params.set('avatar_skin_color', state.avatarSkinColor);
    params.set('avatar_top', state.avatarTop);
    params.set('avatar_headwear', state.avatarHeadwear);
    params.set('avatar_hair_color', state.avatarHairColor);
    params.set('avatar_facial_hair', state.avatarFacialHair);
    params.set('avatar_mouth', state.avatarMouth);
    params.set('avatar_clothing', state.avatarClothing);
    params.set('avatar_accessories', state.avatarAccessories);
    params.set('personality', Array.isArray(state.personality) ? state.personality.join(',') : '');
    params.set('interaction_style', Array.isArray(state.interaction_style) ? state.interaction_style.join(',') : '');
    params.set('knowledge', Array.isArray(state.knowledge) ? state.knowledge.join(',') : '');
    params.set('feedback', state.feedback);
    params.set('privacy', Array.isArray(state.privacy) ? state.privacy.join(',') : '');
    window.location.href = base + '?' + params.toString();
  }

  function init() {
    readUrlParams();
    updateUI();
    restoreSelections();
    bindCardSelects();

    const nextBtn = document.getElementById('btnNext');
    const backBtn = document.getElementById('btnBack');
    const saveBtn = document.getElementById('btnSave');
    const inputName = document.getElementById('inputName');
    const validationOk = document.getElementById('validationOk');
    const validationModal = document.getElementById('validationModal');

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (backBtn) backBtn.addEventListener('click', back);
    if (saveBtn) saveBtn.addEventListener('click', save);
    document.querySelectorAll('.wizard-wheel-node[data-step]').forEach(function (node) {
      node.style.cursor = 'pointer';
      node.addEventListener('click', function () {
        var step = this.getAttribute('data-step');
        goToStep(step);
      });
    });
    if (inputName) {
      inputName.addEventListener('input', function () { state.name = this.value.trim(); });
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
      if (e.key === 'Escape') hideValidationMessage();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

