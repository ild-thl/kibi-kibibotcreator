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
  const avatarFrisurByGender = {
    'männlich': [
      { label: 'Kurz flach', value: 'shortFlat' }, { label: 'Kurz rund', value: 'shortRound' },
      { label: 'Kurz gewellt', value: 'shortWaved' }, { label: 'Kurz lockig', value: 'shortCurly' },
      { label: 'Seitenscheitel', value: 'theCaesarAndSidePart' }, { label: 'Caesar', value: 'theCaesar' },
      { label: 'Seiten', value: 'sides' }, { label: 'Mullet', value: 'shaggyMullet' },
      { label: 'Shaggy', value: 'shaggy' }, { label: 'Dreads', value: 'dreads01' },
      { label: 'Dreads 2', value: 'dreads02' }, { label: 'Seiten abrasiert', value: 'shavedSides' },
      { label: 'Großes Haar', value: 'bigHair' }, { label: 'Frizzy', value: 'frizzle' }
    ],
    'weiblich': [
      { label: 'Lang gerade', value: 'straight01' }, { label: 'Lang gerade (variiert)', value: 'straight02' },
      { label: 'Lang & Strähnen', value: 'straightAndStrand' }, { label: 'Lang lockig', value: 'curly' },
      { label: 'Lang, aber nicht zu lang', value: 'longButNotTooLong' }, { label: 'Bob', value: 'bob' },
      { label: 'Dutt', value: 'bun' }, { label: 'Mia Wallace', value: 'miaWallace' },
      { label: 'Afro', value: 'fro' }, { label: 'Afro mit Band', value: 'froBand' },
      { label: 'Frida', value: 'frida' }, { label: 'Curvy', value: 'curvy' },
      { label: 'Frizzy', value: 'frizzle' }, { label: 'Dreads', value: 'dreads01' },
      { label: 'Seiten abrasiert', value: 'shavedSides' }, { label: 'Großes Haar', value: 'bigHair' }
    ],
    'divers': [
      { label: 'Kurz flach', value: 'shortFlat' }, { label: 'Kurz rund', value: 'shortRound' },
      { label: 'Kurz gewellt', value: 'shortWaved' }, { label: 'Kurz lockig', value: 'shortCurly' },
      { label: 'Lang gerade', value: 'straight01' }, { label: 'Lang lockig', value: 'curly' },
      { label: 'Bob', value: 'bob' }, { label: 'Dutt', value: 'bun' },
      { label: 'Shaggy', value: 'shaggy' }, { label: 'Dreads', value: 'dreads01' },
      { label: 'Afro', value: 'fro' }, { label: 'Großes Haar', value: 'bigHair' }
    ],
    'kein Geschlecht': [
      { label: 'Kurz flach', value: 'shortFlat' }, { label: 'Kurz rund', value: 'shortRound' },
      { label: 'Lang gerade', value: 'straight01' }, { label: 'Bob', value: 'bob' },
      { label: 'Dutt', value: 'bun' }, { label: 'Shaggy', value: 'shaggy' }
    ]
  };
  const avatarHeadwearOpts = [
    { label: 'Keine', value: '' }, { label: 'Wollmütze', value: 'winterHat03' },
    { label: 'Hijab', value: 'hijab' }, { label: 'Turban', value: 'turban' }
  ];
  const avatarHairColors = [
    { label: 'Schwarz', value: '2c1b18' }, { label: 'Braun', value: 'b58143' },
    { label: 'Blond', value: 'ecdcbf' }, { label: 'Auburn', value: 'a55728' },
    { label: 'Grau', value: '4a312c' }
  ];
  const avatarFacialHairOpts = [
    { label: 'Kein Bart', value: '' }, { label: 'Leichter Bart', value: 'beardLight' },
    { label: 'Vollbart mittel', value: 'beardMedium' }, { label: 'Vollbart majestätisch', value: 'beardMajestic' },
    { label: 'Schnurrbart elegant', value: 'moustacheFancy' }, { label: 'Schnurrbart kräftig', value: 'moustacheMagnum' }
  ];
  const avatarClothingOpts = [
    { label: 'Blazer & Hemd', value: 'blazerAndShirt' }, { label: 'Blazer & Pullover', value: 'blazerAndSweater' },
    { label: 'Kragen & Pullover', value: 'collarAndSweater' }, { label: 'Hoodie', value: 'hoodie' },
    { label: 'T-Shirt runder Ausschnitt', value: 'shirtCrewNeck' }, { label: 'T-Shirt V-Ausschnitt', value: 'shirtVNeck' },
    { label: 'T-Shirt Scoop-Ausschnitt', value: 'shirtScoopNeck' }, { label: 'T-Shirt mit Grafik', value: 'graphicShirt' },
    { label: 'Overall', value: 'overall' }
  ];
  const avatarAccessoriesOpts = [
    { label: 'Keine', value: '' }, { label: 'Brille', value: 'prescription01' },
    { label: 'Sonnebrille', value: 'sunglasses' }, { label: 'Rund', value: 'round' },
    { label: 'Wayfarer', value: 'wayfarers' }, { label: 'Augenklappe', value: 'eyepatch' }
  ];

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

  function buildAvatarUrl(state) {
    const avatarType = state.avatarType || 'human';
    const humorMood = state.personality_humor === 'Ernst' ? 'serious' : 'happy';
    if (avatarType !== 'human') {
      var localTypes = ['monster', 'cat', 'dog', 'fox', 'panda', 'owl'];
      if (localTypes.indexOf(avatarType) >= 0) return './assets/avatar-types/' + avatarType + '-' + humorMood + '.svg';
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
      return './assets/avatar-types/monster-' + humorMood + '.svg';
    }
    const topValue = state.avatarHeadwear || state.avatarTop || 'shortFlat';
    const seed = (state.name || state.id || 'avatar') + topValue + state.avatarHairColor + state.avatarSkinColor;
    const p = new URLSearchParams({
      seed: seed, top: topValue, eyes: 'default', eyebrows: 'default',
      hairColor: state.avatarHairColor || 'b58143',
      skinColor: state.avatarSkinColor || 'edb98a',
      mouth: state.avatarMouth || 'smile',
      clothing: state.avatarClothing || 'shirtCrewNeck'
    });
    if (state.avatarAccessories) { p.set('accessories', state.avatarAccessories); p.set('accessoriesProbability', '100'); }
    else p.set('accessoriesProbability', '0');
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
      return '<button type="button" class="avatar-opt card-select px-3 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium transition-all" data-kind="' + dataKind + '" data-value="' + (o.value || '') + '">' + o.label + '</button>';
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
        if (kind === 'headwear') state.avatarHeadwear = selectedVal;
        if (kind === 'hair') state.avatarHairColor = selectedVal;
        if (kind === 'facialHair') state.avatarFacialHair = selectedVal;
        if (kind === 'clothing') state.avatarClothing = selectedVal;
        if (kind === 'acc') state.avatarAccessories = selectedVal;
        state.avatarInitialized = true;
        if (typeof onChanged === 'function') onChanged();
        if (typeof notifyWheel === 'function') {
          notifyWheel(state, { field: stateKey, value: selectedVal, isMulti: false, added: true });
        }
      });
    });
  }

  function renderAvatarStep(state, deps) {
    if (!state.avatarType) state.avatarType = 'human';
    const g = state.gender || 'divers';
    const frisurOpts = avatarFrisurByGender[g] || avatarFrisurByGender.divers;
    const validTops = frisurOpts.map(function (o) { return o.value; });
    if (state.avatarInitialized && state.avatarTop && !validTops.includes(state.avatarTop) && frisurOpts[0]) {
      state.avatarTop = frisurOpts[0].value;
    }
    if (!state.avatarMouth) {
      if (state.personality_humor === 'Humorvoll') state.avatarMouth = 'smile';
      else if (state.personality_humor === 'Ernst') state.avatarMouth = 'serious';
    }
    var showHumanOptions = state.avatarType === 'human';
    document.querySelectorAll('.avatar-human-only').forEach(function (el) { el.classList.toggle('hidden', !showHumanOptions); });
    renderAvatarOption('avatarSkinColor', avatarSkinColors, state, 'avatarSkinColor', 'skin', deps);
    renderAvatarOption('avatarFrisur', frisurOpts, state, 'avatarTop', 'top', deps);
    renderAvatarOption('avatarHeadwear', avatarHeadwearOpts, state, 'avatarHeadwear', 'headwear', deps);
    renderAvatarOption('avatarHairColor', avatarHairColors, state, 'avatarHairColor', 'hair', deps);
    renderAvatarOption('avatarFacialHair', avatarFacialHairOpts, state, 'avatarFacialHair', 'facialHair', deps);
    renderAvatarOption('avatarClothing', avatarClothingOpts, state, 'avatarClothing', 'clothing', deps);
    renderAvatarOption('avatarAccessories', avatarAccessoriesOpts, state, 'avatarAccessories', 'acc', deps);
  }

  function updateAvatarPreview(state, avatarUrl) {
    if (!state.avatarInitialized) return;
    clearAvatarLottie();
    const url = avatarUrl || buildAvatarUrl(state);
    const main = document.getElementById('avatarPreview');
    if (main) {
      main.onerror = function () { this.onerror = null; this.src = TRANSPARENT_IMG; };
      main.src = url;
    }
    document.querySelectorAll('.wizard-wheel-avatar img').forEach(function (img) {
      img.onerror = function () { this.onerror = null; this.src = TRANSPARENT_IMG; };
      img.src = url;
    });
  }

  window.WizardAvatar = {
    buildAvatarUrl: buildAvatarUrl,
    renderAvatarStep: renderAvatarStep,
    updateAvatarPreview: updateAvatarPreview,
    clearAvatarLottie: clearAvatarLottie
  };
})();
