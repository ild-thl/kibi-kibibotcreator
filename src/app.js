(function () {
  const TOTAL_STEPS = 9; // 1–8 Fragen + 9 = Zusammenfassung (Startseite ist Schritt 0)
  const state = {
    id: '',
    testMode: false,
    // Schritt 1
    usage_context: '',           // Für was soll Dein Avatar eingesetzt werden?
    help_context: '',            // Wobei soll Dir der Avatar helfen?
    // Schritt 2
    role: '',                    // Rolle des Avatars
    name: '',                    // Name des Avatars (frei oder Vorschlag)
    // Schritt 3 – Persönlichkeit & Ton
    personality_greeting: '',    // Anrede: Duzen / Siezen
    personality_humor: '',       // Humor: Humorvoll / ernst
    personality_answer: '',      // Antwortstil: Kurz & knapp / Ausführlich
    personality_tone: '',        // Ton: Locker / Professionell
    personality_style: '',       // Stil: Persönlich / Sachlich
    // Schritt 4
    interaction_style: [],       // Mehrfachauswahl (Schritt-für-Schritt, Direkt, ...)
    // Schritt 5
    knowledge: [],               // Mehrfachauswahl (kennt Studiengang, Modulplan, ...)
    // Schritt 6
    feedback: '',                // Reaktion bei Fehlern/Problemen
    // Schritt 7 – Avatar-Optik (null = noch nichts gewählt)
    avatarType: 'human',
    avatarSkinColor: null,
    avatarTop: null,
    avatarHeadwear: null,
    avatarHairColor: null,
    avatarFacialHair: null,
    avatarMouth: null,
    avatarClothing: null,
    avatarAccessories: null,
    // Schritt 8 – Datenschutz
    privacy: [],                 // Mehrfachauswahl Datenschutzoptionen
    // Avatar wurde aktiv erzeugt (Nutzerinteraktion)
    avatarInitialized: false,
    currentStep: 0
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
    { label: 'Wollmütze', value: 'winterHat03' },
    { label: 'Hijab', value: 'hijab' },
    { label: 'Turban', value: 'turban' }
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

  function getFirstIncompleteStep() {
    var originalStep = state.currentStep;
    // Prüfe nur die inhaltlichen Schritte 1–8
    for (var s = 1; s <= 8; s++) {
      state.currentStep = s;
      if (!isCurrentStepValid()) {
        state.currentStep = originalStep;
        return s;
      }
    }
    // Wenn alle Schritte gültig sind, zur Zusammenfassung
    state.currentStep = originalStep;
    return TOTAL_STEPS;
  }

  function buildAvatarUrl() {
    const avatarType = state.avatarType || 'human';
    const humorMood = state.personality_humor === 'Ernst' ? 'serious' : 'happy';

    if (avatarType !== 'human') {
      // Variante 1: Tiere/Monster als lokale Assets mit 2 Stimmungen pro Typ
      // Erwartete Dateien (Beispiele):
      // ./assets/avatar-types/cat-happy.svg
      // ./assets/avatar-types/cat-serious.svg
      var localTypes = ['monster', 'cat', 'dog', 'fox', 'panda', 'owl'];
      if (localTypes.indexOf(avatarType) >= 0) {
        return './assets/avatar-types/' + avatarType + '-' + humorMood + '.svg';
      }

      // Roboter bleibt über DiceBear, mit fixen Parametern.
      if (avatarType === 'robot') {
        const seed = (state.name || state.id || 'avatar') + '-robot';
        const pRobot = new URLSearchParams({ seed: seed });
        pRobot.append('baseColor', 'ffb300');
        pRobot.append('eyes', 'roundFrame02');
        pRobot.append('face', 'square01');
        pRobot.append('mouth', 'smile02');
        pRobot.append('sides', 'squareAssymetric');
        return 'https://api.dicebear.com/9.x/bottts/svg?' + pRobot.toString();
      }

      // Sicherheits-Fallback
      return './assets/avatar-types/monster-' + humorMood + '.svg';
    }

    const topValue = state.avatarHeadwear || state.avatarTop || 'shortFlat';
    const seed = (state.name || state.id || 'avatar') + topValue + state.avatarHairColor + state.avatarSkinColor;
    const p = new URLSearchParams({
      seed: seed,
      top: topValue,
      // Keep gaze consistent across variants
      eyes: 'default',
      eyebrows: 'default',
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
      var current = state[stateKey];
      // Nur markieren, wenn bereits explizit ein (ggf. auch leerer) Wert gesetzt wurde.
      // Anfangszustand: current === null -> nichts vorselektiert.
      if (current !== null && current !== undefined && val === String(current)) {
        b.classList.add('selected');
      }
      b.addEventListener('click', onAvatarOptClick);
    });
  }

  function renderAvatarStep() {
    if (!state.avatarType) state.avatarType = 'human';
    const g = state.gender || 'divers';
    const frisurOpts = avatarFrisurByGender[g] || avatarFrisurByGender['divers'];
    const validTops = frisurOpts.map(function (o) { return o.value; });
    // Nur anpassen, wenn der Nutzer bereits eine Frisur gewählt hat und sie
    // nach einem Gender-Wechsel nicht mehr gültig ist.
    if (state.avatarInitialized && state.avatarTop && !validTops.includes(state.avatarTop) && frisurOpts[0]) {
      state.avatarTop = frisurOpts[0].value;
    }

    // Gesichtsausdruck automatisch aus Schritt 3 (Humor) ableiten
    if (!state.avatarMouth) {
      if (state.personality_humor === 'Humorvoll') {
        state.avatarMouth = 'smile';      // Lächelnd
      } else if (state.personality_humor === 'Ernst') {
        state.avatarMouth = 'serious';    // Ernst
      }
    }

    // Nicht-menschliche Avatare: Detailoptionen ausblenden
    var showHumanOptions = state.avatarType === 'human';
    document.querySelectorAll('.avatar-human-only').forEach(function (el) {
      el.classList.toggle('hidden', !showHumanOptions);
    });

    renderAvatarOption('avatarSkinColor', avatarSkinColors, 'avatarSkinColor', 'skin');
    renderAvatarOption('avatarFrisur', frisurOpts, 'avatarTop', 'top');
    renderAvatarOption('avatarHeadwear', avatarHeadwearOpts, 'avatarHeadwear', 'headwear');
    renderAvatarOption('avatarHairColor', avatarHairColors, 'avatarHairColor', 'hair');
    renderAvatarOption('avatarFacialHair', avatarFacialHairOpts, 'avatarFacialHair', 'facialHair');
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
    if (main) {
      main.onerror = function () {
        this.onerror = null;
        this.src = './assets/avatar-placeholder.png';
      };
      main.src = url;
    }
    document.querySelectorAll('.wizard-wheel-avatar img').forEach(function (img) {
      img.onerror = function () {
        this.onerror = null;
        this.src = './assets/avatar-placeholder.png';
      };
      img.src = url;
    });
  }

  function updateUI() {
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
    if (totalLabel) totalLabel.textContent = TOTAL_STEPS;

    var progress = document.getElementById('progressBar');
    if (progress) {
      var ratio = state.currentStep === 0 ? 0 : (state.currentStep / TOTAL_STEPS);
      progress.style.width = (ratio * 100) + '%';
    }

    var backBtnEl = document.getElementById('btnBack');
    var nextBtnEl = document.getElementById('btnNext');
    if (backBtnEl) backBtnEl.classList.toggle('hidden', state.currentStep === 0);
    if (nextBtnEl) nextBtnEl.classList.toggle('hidden', state.currentStep === 0 || state.currentStep === TOTAL_STEPS);
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

          // Wenn Humor (Schritt 3) geändert wird, Gesichtsausdruck synchronisieren
          if (field === 'personality_humor') {
            if (value === 'Humorvoll') {
              state.avatarMouth = 'smile';
            } else if (value === 'Ernst') {
              state.avatarMouth = 'serious';
            } else {
              state.avatarMouth = null;
            }
            if (state.avatarInitialized) {
              updateAvatarPreview();
            }
          }

          if (field === 'avatarType') {
            state.avatarInitialized = true;
            if (state.currentStep === 7) {
              renderAvatarStep();
            }
            updateAvatarPreview();
          }

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
    // Schritt 7: Avatar-Typ
    if (state.avatarType) {
      document.querySelector('.card-select[data-field="avatarType"][data-value="' + state.avatarType + '"]')?.classList.add('selected');
    }
    // Schritt 3 – Persönlichkeit & Ton
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
    // Testmodus: alle Schritte immer als gültig behandeln
    if (state.testMode) {
      return true;
    }

    // Startseite benötigt keine Eingabe
    if (state.currentStep === 0) {
      return true;
    }
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
    // Schritt 3: Persönlichkeit & Ton – alle 5 Kategorien müssen gewählt sein
    if (state.currentStep === 3) {
      return !!(
        state.personality_greeting &&
        state.personality_humor &&
        state.personality_answer &&
        state.personality_tone &&
        state.personality_style
      );
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
    // Schritt 7: Avatar – nur gültig, wenn alle Bereiche gewählt wurden
    if (state.currentStep === 7) {
      if (state.avatarType !== 'human') {
        return !!state.avatarType;
      }
      return !!(
        state.avatarSkinColor !== null &&
        state.avatarTop !== null &&
        state.avatarHeadwear !== null &&
        state.avatarHairColor !== null &&
        state.avatarFacialHair !== null &&
        state.avatarMouth !== null &&
        state.avatarClothing !== null &&
        state.avatarAccessories !== null
      );
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
    if (targetStep < 0 || targetStep > TOTAL_STEPS) return;
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
    if (state.currentStep > 0) {
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
    var personalityParts = [];
    if (state.personality_greeting) personalityParts.push('Anrede: ' + state.personality_greeting);
    if (state.personality_humor) personalityParts.push('Humor: ' + state.personality_humor);
    if (state.personality_answer) personalityParts.push('Antwortstil: ' + state.personality_answer);
    if (state.personality_tone) personalityParts.push('Ton: ' + state.personality_tone);
    if (state.personality_style) personalityParts.push('Stil: ' + state.personality_style);
    document.getElementById('summaryPersonality').textContent =
      personalityParts.length ? personalityParts.join(' | ') : '–';
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
        var stepAttr = this.getAttribute('data-step');
        var stepNum = Number(stepAttr);
        if (stepNum === 0) {
          // Wenn der Start-Kreis gerade aktiv ist: zum ersten offenen Schritt springen,
          // sonst einfach auf die Startseite (Schritt 0) zurück.
          if (this.classList.contains('wizard-wheel-node--active')) {
            var target = getFirstIncompleteStep();
            goToStep(target);
          } else {
            goToStep(0);
          }
        } else {
          goToStep(stepNum);
        }
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

