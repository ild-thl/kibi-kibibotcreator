;(function () {
  var TRANSPARENT_IMG =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";

  const DICEBEAR = 'https://api.dicebear.com/9.x/avataaars/svg';

  const avatarSkinColors = [
    { labelKey: 'avatar.skin.light', value: 'edb98a' },
    { labelKey: 'avatar.skin.medium', value: 'd08b5b' },
    { labelKey: 'avatar.skin.dark', value: '614335' }
  ];
  /** UI: Kurz / Lang / Lockig → Dicebear Avataaars `top`: Kurz flach, Lang gerade, Afro. */
  const avatarFrisurOpts = [
    { labelKey: 'avatar.hairStyle.short', value: 'shortFlat' },
    { labelKey: 'avatar.hairStyle.long', value: 'straight01' },
    { labelKey: 'avatar.hairStyle.curly', value: 'fro' }
  ];
  const avatarHairColors = [
    { labelKey: 'avatar.hairColor.black', value: '2c1b18' },
    { labelKey: 'avatar.hairColor.brown', value: 'b58143' },
    { labelKey: 'avatar.hairColor.blond', value: 'ecdcbf' }
  ];
  /** UI: Kein Bart / Vollbart / Schnurrbart → Dicebear: keins, beardLight (Leichter Bart), moustacheFancy (Schnurrbart elegant). */
  const avatarFacialHairOpts = [
    { labelKey: 'avatar.beard.none', value: '' },
    { labelKey: 'avatar.beard.full', value: 'beardLight' },
    { labelKey: 'avatar.beard.mustache', value: 'moustacheFancy' }
  ];

  function optionLabel(labelKey, fallback) {
    if (window.WizardI18n && window.WizardI18n.t && labelKey) {
      return window.WizardI18n.t(labelKey);
    }
    return fallback || '';
  }
  /** Mensch: Kleidung folgt Schritt 2 „Ton“ (nicht mehr wählbar in Schritt 8). */
  const HUMAN_CLOTHING_LOCKER = 'shirtCrewNeck';
  const HUMAN_CLOTHING_PROFESSIONELL = 'collarAndSweater';

  var avatarLottieInstances = [];

  function clearAvatarLottie() {
    avatarLottieInstances.forEach(function (inst) { try { inst.destroy(); } catch (e) {} });
    avatarLottieInstances = [];
    document.querySelectorAll('.avatar-lottie-root').forEach(function (el) { el.remove(); });
    if (window.WizardWheelCenter && typeof window.WizardWheelCenter.clearLottieLayers === 'function') {
      window.WizardWheelCenter.clearLottieLayers();
    }
    document.querySelectorAll('.wizard-wheel-avatar img').forEach(function (img) { img.style.display = 'block'; });
  }

  /** Setzt `state.avatarClothing` für Mensch aus Schritt 2 (Ton). */
  function syncHumanClothingFromTone(state) {
    if (!state || state.avatarType !== 'human') return null;
    var v = HUMAN_CLOTHING_LOCKER;
    if (state.personality_tone === 'professionell') v = HUMAN_CLOTHING_PROFESSIONELL;
    else if (state.personality_tone === 'locker') v = HUMAN_CLOTHING_LOCKER;
    state.avatarClothing = v;
    return v;
  }

  function buildAvatarUrl(state) {
    if (!state || !state.avatarType) return TRANSPARENT_IMG;
    const avatarType = state.avatarType;
    const humorMood = state.personality_humor === 'ernst' ? 'serious' : 'happy';
    if (avatarType !== 'human') {
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
      return './assets/avatar-types/owl-' + humorMood + '.svg';
    }
    const topValue = state.avatarTop || 'shortFlat';
    const seed = (state.name || state.id || 'avatar') + topValue + state.avatarHairColor + state.avatarSkinColor;
    const p = new URLSearchParams({
      seed: seed, top: topValue, eyes: 'default', eyebrows: 'default',
      hairColor: state.avatarHairColor || 'b58143',
      skinColor: state.avatarSkinColor || 'edb98a',
      mouth: state.avatarMouth || 'smile',
      clothing: syncHumanClothingFromTone(state) || HUMAN_CLOTHING_LOCKER
    });
    p.set('accessoriesProbability', '0');
    if (state.avatarFacialHair) {
      p.set('facialHair', state.avatarFacialHair);
      p.set('facialHairProbability', '100');
      p.set('facialHairColor', state.avatarHairColor || 'b58143');
    } else p.set('facialHairProbability', '0');
    return DICEBEAR + '?' + p.toString();
  }

  function renderAvatarOption(containerId, options, state, stateKey, dataKind, deps) {
    var onChanged = deps && deps.onAvatarChanged;
    var notifyWheel = deps && deps.notifyWheelSelection;
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = options.map(function (o) {
      var label = optionLabel(o.labelKey, o.label || '');
      return '<button type="button" class="avatar-opt card-select px-6 py-3 rounded-2xl border-2 border-gray-200 bg-white text-left transition-all" data-kind="' + dataKind + '" data-value="' + (o.value || '') + '">' + label + '</button>';
    }).join('');
    container.querySelectorAll('.avatar-opt').forEach(function (b) {
      var val = b.dataset.value || '';
      var current = state[stateKey];
      if (current !== null && current !== undefined && val === String(current)) b.classList.add('selected');
      b.addEventListener('click', function () {
        const kind = this.dataset.kind, selectedVal = this.dataset.value || '';
        const wrap = this.closest('div');
        wrap.querySelectorAll('.avatar-opt').forEach(function (x) { x.classList.remove('selected'); });
        this.classList.add('selected');
        if (kind === 'skin') state.avatarSkinColor = selectedVal;
        if (kind === 'top') state.avatarTop = selectedVal;
        if (kind === 'hair') state.avatarHairColor = selectedVal;
        if (kind === 'facialHair') state.avatarFacialHair = selectedVal;
        state.avatarInitialized = true;
        if (typeof onChanged === 'function') onChanged();
        if (typeof notifyWheel === 'function') {
          notifyWheel(state, { field: stateKey, value: selectedVal, isMulti: false, added: true });
        }
      });
    });
  }

  function renderAvatarStep(state, deps) {
    var allowedAvatarTypes = { human: true, robot: true, owl: true };
    if (state.avatarType && !allowedAvatarTypes[state.avatarType]) {
      state.avatarType = null;
    }
    if (state.avatarType === 'human') syncHumanClothingFromTone(state);
    const frisurOpts = avatarFrisurOpts;
    const validTops = frisurOpts.map(function (o) { return o.value; });
    if (state.avatarInitialized && state.avatarTop && !validTops.includes(state.avatarTop) && frisurOpts[0]) {
      state.avatarTop = frisurOpts[0].value;
    }
    var validFacialVals = avatarFacialHairOpts.map(function (o) {
      return o.value;
    });
    var fh = state.avatarFacialHair;
    if (state.avatarInitialized && fh !== '' && fh != null && !validFacialVals.includes(fh)) {
      state.avatarFacialHair = '';
    }
    var validHairVals = avatarHairColors.map(function (o) {
      return o.value;
    });
    if (state.avatarInitialized && state.avatarHairColor != null && !validHairVals.includes(state.avatarHairColor) && avatarHairColors[0]) {
      state.avatarHairColor = avatarHairColors[0].value;
    }
    var validSkinVals = avatarSkinColors.map(function (o) {
      return o.value;
    });
    if (state.avatarInitialized && state.avatarSkinColor != null && !validSkinVals.includes(state.avatarSkinColor) && avatarSkinColors[0]) {
      state.avatarSkinColor = avatarSkinColors[0].value;
    }
    if (!state.avatarMouth) {
      if (state.personality_humor === 'humorvoll') state.avatarMouth = 'smile';
      else if (state.personality_humor === 'ernst') state.avatarMouth = 'serious';
    }
    var showHumanOptions = state.avatarType === 'human';
    document.querySelectorAll('.avatar-human-only').forEach(function (el) { el.classList.toggle('hidden', !showHumanOptions); });
    renderAvatarOption('avatarSkinColor', avatarSkinColors, state, 'avatarSkinColor', 'skin', deps);
    renderAvatarOption('avatarFrisur', frisurOpts, state, 'avatarTop', 'top', deps);
    renderAvatarOption('avatarHairColor', avatarHairColors, state, 'avatarHairColor', 'hair', deps);
    renderAvatarOption('avatarFacialHair', avatarFacialHairOpts, state, 'avatarFacialHair', 'facialHair', deps);
  }

  function updateAvatarPreview(state, avatarUrl) {
    if (!state.avatarInitialized) return;
    clearAvatarLottie();
    const url = avatarUrl || buildAvatarUrl(state);
    var avatarType = state.avatarType || '';
    const main = document.getElementById('avatarPreview');
    if (main) {
      main.onerror = function () { this.onerror = null; this.src = TRANSPARENT_IMG; };
      main.setAttribute('data-avatar-type', avatarType);
      main.src = url;
    }
    document.querySelectorAll('.wizard-wheel-avatar img').forEach(function (img) {
      img.onerror = function () { this.onerror = null; this.src = TRANSPARENT_IMG; };
      img.setAttribute('data-avatar-type', avatarType);
      img.src = url;
    });
  }

  window.WizardAvatar = {
    buildAvatarUrl: buildAvatarUrl,
    renderAvatarStep: renderAvatarStep,
    updateAvatarPreview: updateAvatarPreview,
    clearAvatarLottie: clearAvatarLottie,
    syncHumanClothingFromTone: syncHumanClothingFromTone
  };
})();
