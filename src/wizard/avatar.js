;(function () {
  var TRANSPARENT_IMG =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";

  var AVATAR_TYPE_PREFIX = {
    human: 'mensch',
    robot: 'roboter',
    owl: 'eule'
  };

  var AVATAR_VARIANTS = ['orange', 'blau', 'schwarz', 'schwarz_weiss'];

  var avatarLottieInstances = [];

  /** Dateiname für Roboter-Orange (_hg hat Tippfehler „organge“ im Asset-Ordner). */
  function variantFileSegment(type, variant, highContrast) {
    if (highContrast && type === 'robot' && variant === 'orange') return 'organge';
    return variant;
  }

  function buildAvatarAssetPath(state, highContrast) {
    if (!state || !state.avatarType || isNoAvatarType(state) || !state.avatarVariant) {
      return TRANSPARENT_IMG;
    }
    var prefix = AVATAR_TYPE_PREFIX[state.avatarType];
    if (!prefix) return TRANSPARENT_IMG;
    var segment = variantFileSegment(state.avatarType, state.avatarVariant, highContrast);
    var suffix = highContrast ? '_hg' : '';
    return './assets/avatar-types/' + prefix + '_' + segment + suffix + '.svg';
  }

  function clearAvatarLottie() {
    avatarLottieInstances.forEach(function (inst) { try { inst.destroy(); } catch (e) {} });
    avatarLottieInstances = [];
    document.querySelectorAll('.avatar-lottie-root').forEach(function (el) { el.remove(); });
    if (window.WizardWheelCenter && typeof window.WizardWheelCenter.clearLottieLayers === 'function') {
      window.WizardWheelCenter.clearLottieLayers();
    }
    document.querySelectorAll('.wizard-wheel-avatar img').forEach(function (img) { img.style.display = 'block'; });
  }

  function isNoAvatarType(state) {
    return !!(state && state.avatarType === 'none');
  }

  function hideAvatarImages() {
    var main = document.getElementById('avatarPreview');
    document.querySelectorAll('.wizard-wheel-avatar img').forEach(function (img) {
      img.onerror = null;
      img.removeAttribute('data-avatar-type');
      img.src = TRANSPARENT_IMG;
      img.style.display = 'none';
    });
    if (main) main.style.display = 'none';
    var sumImg = document.getElementById('summaryAvatar');
    if (sumImg) {
      sumImg.src = TRANSPARENT_IMG;
      sumImg.style.display = 'none';
    }
  }

  function variantLabel(variant) {
    if (window.WizardI18n && window.WizardI18n.t) {
      return window.WizardI18n.t('avatar.variant.' + variant);
    }
    return variant;
  }

  function buildAvatarUrl(state) {
    return buildAvatarAssetPath(state, false);
  }

  function buildAvatarThumbUrl(state) {
    return buildAvatarAssetPath(state, true);
  }

  function isVariantValid(state) {
    return !!(
      state &&
      state.avatarType &&
      !isNoAvatarType(state) &&
      state.avatarVariant &&
      AVATAR_VARIANTS.indexOf(state.avatarVariant) >= 0
    );
  }

  function renderVariantPicker(state, deps) {
    var section = document.getElementById('avatarVariantSection');
    var picker = document.getElementById('avatarVariantPicker');
    if (!section || !picker) return;

    var show = state.avatarType && !isNoAvatarType(state);
    section.classList.toggle('hidden', !show);
    if (!show) {
      picker.innerHTML = '';
      return;
    }

    if (state.avatarVariant && AVATAR_VARIANTS.indexOf(state.avatarVariant) < 0) {
      state.avatarVariant = null;
    }

    var onChanged = deps && deps.onAvatarChanged;
    var notifyWheel = deps && deps.notifyWheelSelection;

    picker.innerHTML = AVATAR_VARIANTS.map(function (variant) {
      var thumb = buildAvatarAssetPath({ avatarType: state.avatarType, avatarVariant: variant }, true);
      var label = variantLabel(variant);
      var selected = state.avatarVariant === variant ? ' selected' : '';
      return (
        '<button type="button" class="avatar-variant-opt' + selected + '" data-value="' + variant + '" ' +
        'role="radio" aria-checked="' + (selected ? 'true' : 'false') + '" aria-label="' + label + '">' +
        '<img src="' + thumb + '" alt="" width="69" height="69" decoding="async" />' +
        '</button>'
      );
    }).join('');

    picker.querySelectorAll('.avatar-variant-opt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = this.dataset.value || '';
        if (!value) return;
        picker.querySelectorAll('.avatar-variant-opt').forEach(function (el) {
          el.classList.remove('selected');
          el.setAttribute('aria-checked', 'false');
        });
        this.classList.add('selected');
        this.setAttribute('aria-checked', 'true');
        state.avatarVariant = value;
        state.avatarInitialized = true;
        if (typeof onChanged === 'function') onChanged();
        if (typeof notifyWheel === 'function') {
          notifyWheel(state, { field: 'avatarVariant', value: value, isMulti: false, added: true });
        }
      });
    });
  }

  function renderAvatarStep(state, deps) {
    var allowedAvatarTypes = { human: true, robot: true, owl: true, none: true };
    if (state.avatarType && !allowedAvatarTypes[state.avatarType]) {
      state.avatarType = null;
      state.avatarVariant = null;
    }
    if (isNoAvatarType(state)) {
      state.avatarVariant = null;
    }
    renderVariantPicker(state, deps);
  }

  function updateAvatarPreview(state, avatarUrl) {
    if (!state.avatarInitialized) return;
    clearAvatarLottie();
    if (isNoAvatarType(state)) {
      hideAvatarImages();
      return;
    }
    if (!isVariantValid(state)) {
      hideAvatarImages();
      return;
    }

    const url = avatarUrl || buildAvatarUrl(state);
    var avatarType = state.avatarType || '';
    const main = document.getElementById('avatarPreview');
    if (main) {
      main.style.display = '';
      main.onerror = function () { this.onerror = null; this.src = TRANSPARENT_IMG; };
      main.setAttribute('data-avatar-type', avatarType);
      main.src = url;
    }
    document.querySelectorAll('.wizard-wheel-avatar img').forEach(function (img) {
      img.style.display = 'block';
      img.onerror = function () { this.onerror = null; this.src = TRANSPARENT_IMG; };
      img.setAttribute('data-avatar-type', avatarType);
      img.src = url;
    });
    var sumImg = document.getElementById('summaryAvatar');
    if (sumImg) {
      sumImg.style.display = '';
      sumImg.src = url;
    }
  }

  window.WizardAvatar = {
    buildAvatarUrl: buildAvatarUrl,
    buildAvatarThumbUrl: buildAvatarThumbUrl,
    renderAvatarStep: renderAvatarStep,
    updateAvatarPreview: updateAvatarPreview,
    clearAvatarLottie: clearAvatarLottie,
    isNoAvatarType: isNoAvatarType,
    hideAvatarImages: hideAvatarImages,
    AVATAR_VARIANTS: AVATAR_VARIANTS
  };
})();
