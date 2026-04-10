;(function () {
  var BASE = './assets/wheel-animations/';

  /** Kurz-Schlüssel für Dateinamen (lesbar, stabil). */
  var FIELD_SEGMENT = {
    usage_context: 'usage',
    help_context: 'help',
    personality_greeting: 'greeting',
    personality_humor: 'humor',
    personality_answer: 'answer',
    personality_tone: 'tone',
    personality_style: 'style',
    interaction_workflow: 'workflow',
    interaction_examples: 'examples',
    knowledge: 'knowledge',
    knowledge_source: 'knowledge_source',
    decision_mode: 'decision',
    feedback: 'feedback',
    privacy: 'privacy',
    nameChoice: 'name_choice',
    role: 'role',
    avatarType: 'avatar_type',
    avatarSkinColor: 'skin',
    avatarTop: 'hair_top',
    avatarHeadwear: 'headwear',
    avatarHairColor: 'hair_color',
    avatarFacialHair: 'facial_hair',
    avatarMouth: 'mouth',
    avatarClothing: 'clothing',
    avatarAccessories: 'accessories'
  };

  /**
   * Felder pro Wizard-Schritt (state.currentStep), die für Animations-Dateinamen relevant sind.
   * Reihenfolge egal: Kombinationen werden alphabetisch nach Segment sortiert.
   */
  var STEP_FIELDS = {
    1: ['usage_context', 'help_context'],
    2: ['personality_greeting', 'personality_humor', 'personality_answer', 'personality_tone', 'personality_style'],
    3: ['role', 'nameChoice'],
    4: ['interaction_workflow', 'interaction_examples'],
    5: ['knowledge', 'knowledge_source', 'decision_mode'],
    6: ['feedback'],
    7: ['privacy'],
    8: [
      'avatarType',
      'avatarSkinColor',
      'avatarHairColor',
      'avatarTop',
      'avatarHeadwear',
      'avatarFacialHair',
      'avatarClothing',
      'avatarAccessories',
      'avatarMouth'
    ]
  };

  var instances = [];
  var previousUiStep = null;
  /** URL → JSON, damit Übergänge ohne erneuten Netzwerk-Roundtrip starten. */
  var animationDataCache = {};
  /** Schrittnummer → geklontes SVG (letzter sichtbarer Wheel-Zustand), weil reveal() Lotties auf anderen Steps aus dem DOM entfernt. */
  var lastWheelSvgByStep = {};

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function slugify(raw) {
    if (raw == null || raw === '') return 'none';
    var t = String(raw).trim();
    t = t.replace(/&amp;/g, 'and');
    t = t.replace(/&/g, 'and');
    t = t.toLowerCase();
    t = t.replace(/[^a-z0-9äöüß]+/g, '-');
    t = t.replace(/^-+|-+$/g, '');
    return t || 'none';
  }

  function fieldSeg(f) {
    return FIELD_SEGMENT[f] || String(f).replace(/_/g, '-');
  }

  function valueSlugFromState(state, field) {
    var v = state[field];
    if (v == null || v === '') return null;
    if (Array.isArray(v)) {
      if (!v.length) return null;
      return v.slice().sort().map(slugify).join('-and-');
    }
    return slugify(v);
  }

  function destroyInstance(inst) {
    if (!inst) return;
    try {
      inst.destroy();
    } catch (e) {}
  }

  function clearLottieLayers() {
    instances.forEach(destroyInstance);
    instances = [];
    document.querySelectorAll('.wheel-center-lottie').forEach(function (el) {
      el.remove();
    });
    document.querySelectorAll('.wheel-center-hold-frame').forEach(function (el) {
      el.remove();
    });
    lastWheelSvgByStep = {};
  }

  function getActiveWheelAvatar() {
    var section = document.querySelector('.wizard-step:not(.hidden)');
    if (!section) return null;
    return section.querySelector('.wizard-wheel-avatar');
  }

  function shouldSkipWheelAnimations(state) {
    if (!state) return true;
    if (state.currentStep === 9) return true;
    if (state.currentStep === 8 && state.avatarInitialized) return true;
    return false;
  }

  function isFileProtocol() {
    return window.location && window.location.protocol === 'file:';
  }

  function cacheAnimationFromInstance(url, anim) {
    if (!url || !anim) return;
    try {
      if (anim.animationData) animationDataCache[url] = anim.animationData;
    } catch (e) {}
  }

  function loadWheelLottie(root, url, loop, autoplay) {
    if (autoplay === undefined || autoplay === null) autoplay = true;
    var data = animationDataCache[url];
    if (data) {
      return window.lottie.loadAnimation({
        container: root,
        renderer: 'svg',
        loop: loop,
        autoplay: autoplay,
        animationData: data
      });
    }
    return window.lottie.loadAnimation({
      container: root,
      renderer: 'svg',
      loop: loop,
      autoplay: autoplay,
      path: url
    });
  }

  /**
   * Übergangs-JSONs (to-step / from-step) wiederholen zuerst die „Vorlage von Start“-Phase (Lottie-Layer ip 0, op 3).
   * Ohne Skip wirkt jeder Sprung wie ein erneuter Start von Schritt 0.
   */
  function transitionIntroSkipFrames(url) {
    if (!url || typeof url !== 'string') return 0;
    if (url.indexOf(BASE + 'transitions/') !== 0) return 0;
    if (url.indexOf('on-load.json') !== -1) return 0;
    return 3;
  }

  /** Lädt bekannte Transition-JSONs im Hintergrund (erster Sprung wirkt sofort). */
  function prefetchWheelAnimationData() {
    if (!window.fetch) return;
    var urls = [
      BASE + 'transitions/on-load.json',
      BASE + 'transitions/from-step-00-to-step-01.json',
      BASE + 'transitions/to-step-01.json',
      BASE + 'transitions/to-step-02.json',
      BASE + 'transitions/to-step-03.json',
      BASE + 'transitions/to-step-04.json',
      BASE + 'transitions/to-step-05.json',
      BASE + 'transitions/to-step-06.json',
      BASE + 'transitions/to-step-07.json',
      BASE + 'transitions/to-step-08.json'
    ];
    urls.forEach(function (url) {
      if (animationDataCache[url]) return;
      fetch(url)
        .then(function (r) {
          return r.ok ? r.json() : null;
        })
        .then(function (j) {
          if (j) animationDataCache[url] = j;
        })
        .catch(function () {});
    });
  }

  function removeHoldFramesFromWrap(wrap) {
    if (!wrap) return;
    wrap.querySelectorAll('.wheel-center-hold-frame').forEach(function (el) {
      el.remove();
    });
  }

  function stepIndexFromSectionId(id) {
    var m = /^step(\d+)$/.exec(id || '');
    return m ? parseInt(m[1], 10) : null;
  }

  /** Merkt sich pro Schritt das aktuelle Wheel-SVG, bevor andere Lottie-Layer entfernt werden. */
  function snapshotWheelLottiesToMemory(excludeRootEl) {
    document.querySelectorAll('.wheel-center-lottie').forEach(function (el) {
      if (el === excludeRootEl) return;
      if (el.classList.contains('wheel-center-lottie--pending')) return;
      var section = el.closest('.wizard-step');
      if (!section || !section.id) return;
      var sn = stepIndexFromSectionId(section.id);
      if (sn == null) return;
      var svg = el.querySelector('svg');
      if (svg) lastWheelSvgByStep[sn] = svg.cloneNode(true);
    });
  }

  function rememberWheelSvgForStep(stepNum, anim) {
    if (stepNum == null || !anim) return;
    try {
      var w = anim.wrapper;
      var svg = w && w.querySelector('svg');
      if (svg) lastWheelSvgByStep[stepNum] = svg.cloneNode(true);
    } catch (e) {}
  }

  /** Zeigt bis zur neuen Lottie den letzten Zustand vom **vorherigen** Schritt (Live-DOM oder Snapshot). */
  function injectHoldFrame(wrap, holdFromStep, targetStep) {
    if (!wrap) return;
    removeHoldFramesFromWrap(wrap);
    if (holdFromStep == null || holdFromStep === targetStep) return;
    var svg = null;
    var prev = document.getElementById('step' + holdFromStep);
    if (prev) {
      var live = prev.querySelector('.wizard-wheel-avatar .wheel-center-lottie svg');
      if (live) svg = live;
    }
    if (!svg && lastWheelSvgByStep[holdFromStep]) {
      svg = lastWheelSvgByStep[holdFromStep];
    }
    if (!svg) return;
    var holder = document.createElement('div');
    holder.className = 'wheel-center-hold-frame';
    holder.setAttribute('aria-hidden', 'true');
    holder.appendChild(svg.cloneNode(true));
    var im = wrap.querySelector('img');
    if (im) im.style.display = 'none';
    wrap.appendChild(holder);
  }

  function animWrapperEl(inst) {
    try {
      return inst && inst.wrapper ? inst.wrapper : null;
    } catch (e) {
      return null;
    }
  }

  /** Noch nicht sichtbare Ladevorgänge in dieser Wheel-Box abbrechen (Doppelklick / schnelle Sprünge). */
  function abortPendingInWrap(wrap) {
    if (!wrap) return;
    var pending = wrap.querySelectorAll('.wheel-center-lottie--pending');
    for (var pi = 0; pi < pending.length; pi++) {
      var el = pending[pi];
      for (var j = instances.length - 1; j >= 0; j--) {
        if (animWrapperEl(instances[j]) === el) {
          destroyInstance(instances[j]);
          instances.splice(j, 1);
        }
      }
      el.remove();
    }
  }

  function playCandidateUrls(state, urls, holdFromStep) {
    if (!urls || !urls.length) return;
    if (shouldSkipWheelAnimations(state)) return;
    if (!window.lottie || typeof window.lottie.loadAnimation !== 'function') return;
    if (isFileProtocol()) return;
    var wrap = getActiveWheelAvatar();
    if (!wrap) return;
    abortPendingInWrap(wrap);
    injectHoldFrame(wrap, holdFromStep, state.currentStep);
    tryPlayIndex(state, urls, 0, wrap);
  }

  function tryPlayIndex(state, urls, index, wrap) {
    if (index >= urls.length) {
      if (wrap) {
        removeHoldFramesFromWrap(wrap);
        var imgEnd = wrap.querySelector('img');
        if (imgEnd) imgEnd.style.display = 'block';
      }
      return;
    }
    var img = wrap.querySelector('img');
    var root = document.createElement('div');
    root.className = 'wheel-center-lottie wheel-center-lottie--pending';
    root.style.opacity = '0';
    root.style.pointerEvents = 'none';
    wrap.appendChild(root);
    var url = urls[index];
    var introSkipFrames = transitionIntroSkipFrames(url);
    var anim;
    var settled = false;
    var loadTimer;

    function onClipComplete() {
      rememberWheelSvgForStep(state.currentStep, anim);
    }

    function tearDownAttempt() {
      try {
        destroyInstance(anim);
      } catch (e) {}
      instances = instances.filter(function (x) {
        return x !== anim;
      });
      if (root && root.parentNode) root.remove();
    }

    function advance() {
      if (settled) return;
      settled = true;
      if (loadTimer) clearTimeout(loadTimer);
      try {
        anim.removeEventListener('DOMLoaded', reveal);
        anim.removeEventListener('complete', onClipComplete);
        anim.removeEventListener('data_failed', advance);
        anim.removeEventListener('config_error', advance);
        anim.removeEventListener('error', advance);
      } catch (e) {}
      tearDownAttempt();
      tryPlayIndex(state, urls, index + 1, wrap);
    }

    function reveal() {
      if (settled) return;
      settled = true;
      if (loadTimer) clearTimeout(loadTimer);
      try {
        anim.removeEventListener('DOMLoaded', reveal);
        anim.removeEventListener('data_failed', advance);
        anim.removeEventListener('config_error', advance);
        anim.removeEventListener('error', advance);
      } catch (e) {}

      if (!anim || !root.parentNode) return;

      snapshotWheelLottiesToMemory(root);
      cacheAnimationFromInstance(url, anim);
      removeHoldFramesFromWrap(root.parentNode);

      instances.forEach(function (inst) {
        if (inst !== anim) destroyInstance(inst);
      });
      instances = [anim];

      document.querySelectorAll('.wheel-center-lottie').forEach(function (el) {
        if (el !== root) el.remove();
      });

      root.classList.remove('wheel-center-lottie--pending');
      root.style.opacity = '';
      root.style.pointerEvents = '';
      if (img) img.style.display = 'none';
      if (introSkipFrames > 0) {
        try {
          var tf = anim.totalFrames;
          var skip = introSkipFrames;
          if (tf > 0 && skip >= tf) skip = Math.max(0, tf - 1);
          anim.goToAndStop(skip, true);
          anim.play();
        } catch (eSkip) {}
      }
      rememberWheelSvgForStep(state.currentStep, anim);
    }

    try {
      anim = loadWheelLottie(root, url, false, introSkipFrames <= 0);
    } catch (e) {
      root.remove();
      tryPlayIndex(state, urls, index + 1, wrap);
      return;
    }
    instances.push(anim);
    try {
      anim.addEventListener('DOMLoaded', reveal);
      anim.addEventListener('complete', onClipComplete);
      anim.addEventListener('data_failed', advance);
      anim.addEventListener('config_error', advance);
      anim.addEventListener('error', advance);
    } catch (e) {}
    try {
      if (anim && anim.isLoaded === true) reveal();
    } catch (e2) {}
    loadTimer = setTimeout(function () {
      if (settled) return;
      try {
        if (anim && anim.isLoaded === false) advance();
      } catch (err) {
        advance();
      }
    }, 900);
  }

  function transitionCandidates(fromStep, toStep) {
    var specific = BASE + 'transitions/from-step-' + pad2(fromStep) + '-to-step-' + pad2(toStep) + '.json';
    var generic = BASE + 'transitions/to-step-' + pad2(toStep) + '.json';
    var avatar = './assets/avatar-animations/step' + toStep + '.json';
    /* Nur 0→1 hat aktuell eine eigene Datei; sonst zuerst to-step sparen (kein 404 auf fehlendes from-…). */
    if (fromStep === 0 && toStep === 1) {
      return [specific, generic, avatar];
    }
    return [generic, specific, avatar];
  }

  function selectionCandidates(step, state, meta) {
    if (meta.isMulti && meta.added === false) return [];
    var fields = STEP_FIELDS[step];
    if (!fields || fields.indexOf(meta.field) < 0) return [];

    var prefix = BASE + 'step-' + pad2(step) + '/';
    var f = meta.field;
    var vSlug = slugify(meta.value);
    var fs = fieldSeg(f);

    var others = fields.filter(function (of) {
      return of !== f && valueSlugFromState(state, of) != null;
    });
    others.sort();

    var out = [];
    if (others.length) {
      var combo = others
        .map(function (of) {
          return fieldSeg(of) + '-' + valueSlugFromState(state, of);
        })
        .join('__');
      out.push(prefix + 'sel-' + fs + '-' + vSlug + '__' + combo + '.json');
    }
    for (var i = 0; i < others.length; i++) {
      var of = others[i];
      out.push(
        prefix + 'sel-' + fs + '-' + vSlug + '__' + fieldSeg(of) + '-' + valueSlugFromState(state, of) + '.json'
      );
    }
    out.push(prefix + 'sel-' + fs + '-' + vSlug + '.json');
    return out;
  }

  function notifyUiUpdate(state) {
    if (!state) return;
    var cur = state.currentStep;
    if (previousUiStep === null) {
      previousUiStep = cur;
      return;
    }
    if (previousUiStep === cur) return;
    var from = previousUiStep;
    previousUiStep = cur;
    if (cur === 0) {
      clearLottieLayers();
      ensureStartStepLoop(state);
      return;
    }
    if (shouldSkipWheelAnimations(state)) return;
    playCandidateUrls(state, transitionCandidates(from, cur), from);
  }

  function notifySelection(state, meta) {
    if (!state || !meta) return;
    if (state.currentStep === 0) return;
    if (shouldSkipWheelAnimations(state)) return;
    var urls = selectionCandidates(state.currentStep, state, meta);
    playCandidateUrls(state, urls, state.currentStep);
  }

  function resetNavigationTracking() {
    previousUiStep = null;
  }

  /**
   * Schritt 0: Endlosschleife im Wheel-Zentrum (on-load.json).
   * Läuft erneut, sobald der Nutzer wieder auf die Startseite wechselt.
   */
  function ensureStartStepLoop(state) {
    if (!state || state.currentStep !== 0) return;
    if (!window.lottie || typeof window.lottie.loadAnimation !== 'function') return;
    if (isFileProtocol()) return;
    var wrap = getActiveWheelAvatar();
    if (!wrap) return;
    if (wrap.querySelector('.wheel-center-lottie--start')) return;

    var img = wrap.querySelector('img');
    if (img) img.style.display = 'none';
    var root = document.createElement('div');
    root.className = 'wheel-center-lottie wheel-center-lottie--start';
    wrap.appendChild(root);

    var url = BASE + 'transitions/on-load.json';
    var anim;
    try {
      anim = loadWheelLottie(root, url, true);
    } catch (e) {
      root.remove();
      if (img) img.style.display = 'block';
      return;
    }
    instances.push(anim);
    var cacheIt = function () {
      cacheAnimationFromInstance(url, anim);
    };
    try {
      anim.addEventListener('DOMLoaded', cacheIt);
    } catch (e) {}
    try {
      if (anim.isLoaded === true) cacheIt();
    } catch (e2) {}

    var fail = function () {
      try {
        anim.destroy();
      } catch (err) {}
      instances = instances.filter(function (x) {
        return x !== anim;
      });
      root.remove();
      if (img) img.style.display = 'block';
    };

    try {
      anim.addEventListener('data_failed', fail);
      anim.addEventListener('config_error', fail);
      anim.addEventListener('error', fail);
    } catch (e) {}
    setTimeout(function () {
      try {
        if (anim && anim.isLoaded === false) fail();
      } catch (err) {
        fail();
      }
    }, 900);
  }

  window.WizardWheelCenter = {
    notifyUiUpdate: notifyUiUpdate,
    notifySelection: notifySelection,
    resetNavigationTracking: resetNavigationTracking,
    ensureStartStepLoop: ensureStartStepLoop,
    /** @deprecated Alias – nutze ensureStartStepLoop */
    playPageLoadIntro: ensureStartStepLoop,
    clearLottieLayers: clearLottieLayers,
    prefetchWheelAnimationData: prefetchWheelAnimationData,
    slugify: slugify,
    fieldSeg: fieldSeg
  };
})();
