;(function () {
  var TRANSPARENT_IMG =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";

  const DICEBEAR = 'https://api.dicebear.com/9.x/avataaars/svg';

  const avatarSkinColors = [
    { label: 'Sehr hell', value: 'ffdbb4' },
    { label: 'Hell', value: 'edb98a' },
    { label: 'Mittel', value: 'd08b5b' },
    { label: 'Gebräunt', value: 'ae5d29' },
    { label: 'Dunkel', value: '614335' },
    { label: 'Warm', value: 'fd9841' }
  ];
  /** UI: Kurz / Lang / Lockig → Dicebear Avataaars `top`: Kurz flach, Lang gerade, Afro. */
  const avatarFrisurOpts = [
    { label: 'Kurz', value: 'shortFlat' },
    { label: 'Lang', value: 'straight01' },
    { label: 'Lockig', value: 'fro' }
  ];
  const avatarHairColors = [
    { label: 'Schwarz', value: '2c1b18' }, { label: 'Braun', value: 'b58143' },
    { label: 'Blond', value: 'ecdcbf' }, { label: 'Auburn', value: 'a55728' },
    { label: 'Grau', value: '4a312c' }
  ];
  /** UI: Kein Bart / Vollbart / Schnurrbart → Dicebear: keins, beardLight (Leichter Bart), moustacheFancy (Schnurrbart elegant). */
  const avatarFacialHairOpts = [
    { label: 'Kein Bart', value: '' },
    { label: 'Vollbart', value: 'beardLight' },
    { label: 'Schnurrbart', value: 'moustacheFancy' }
  ];
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
    if (state.personality_tone === 'Professionell') v = HUMAN_CLOTHING_PROFESSIONELL;
    else if (state.personality_tone === 'Locker') v = HUMAN_CLOTHING_LOCKER;
    state.avatarClothing = v;
    return v;
  }

  function buildAvatarUrl(state) {
    const avatarType = state.avatarType || 'human';
    const humorMood = state.personality_humor === 'Ernst' ? 'serious' : 'happy';
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
      return '<button type="button" class="avatar-opt card-select px-6 py-3 rounded-2xl border-2 border-gray-200 bg-white text-left transition-all" data-kind="' + dataKind + '" data-value="' + (o.value || '') + '">' + o.label + '</button>';
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
      state.avatarType = 'human';
    }
    if (!state.avatarType) state.avatarType = 'human';
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
    if (!state.avatarMouth) {
      if (state.personality_humor === 'Humorvoll') state.avatarMouth = 'smile';
      else if (state.personality_humor === 'Ernst') state.avatarMouth = 'serious';
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
    var avatarType = state.avatarType || 'human';
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
