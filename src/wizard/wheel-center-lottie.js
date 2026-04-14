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
    avatarHairColor: 'hair_color',
    avatarFacialHair: 'facial_hair',
    avatarMouth: 'mouth',
    avatarClothing: 'clothing'
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
      'avatarFacialHair',
      'avatarClothing',
      'avatarMouth'
    ]
  };

  var instances = [];
  var previousUiStep = null;
  /** URL → JSON, damit Übergänge ohne erneuten Netzwerk-Roundtrip starten. */
  var animationDataCache = {};
  /** URL → true/false (existiert / fehlt), um wiederholte Fallback-Timeouts zu vermeiden. */
  var mediaAvailabilityCache = {};
  /** Schrittnummer → geklontes SVG (letzter sichtbarer Wheel-Zustand), weil reveal() Lotties auf anderen Steps aus dem DOM entfernt. */
  var lastWheelSvgByStep = {};
  /** Letzte erfolgreich angezeigte Wheel-Media (für kontextabhängige Step-Transitions). */
  var lastResolvedWheelMedia = null;
  var wheelAnimDebugEnabled = false;

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function initWheelAnimDebugFromUrl() {
    try {
      var p = new URLSearchParams(window.location.search);
      wheelAnimDebugEnabled = p.get('wheelAnimDebug') === '1' || p.get('wheelanimdebug') === '1';
    } catch (e) {
      wheelAnimDebugEnabled = false;
    }
  }

  function wheelAnimDebug(eventName, payload) {
    if (!wheelAnimDebugEnabled || !window.console || typeof window.console.info !== 'function') return;
    var data = payload || {};
    data.event = eventName;
    try {
      window.console.info('[wheel-anim-debug]', data);
    } catch (e) {}
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

  function permute(arr) {
    var out = [];
    function rec(rest, acc) {
      if (!rest.length) {
        out.push(acc);
        return;
      }
      for (var i = 0; i < rest.length; i++) {
        var next = rest.slice();
        var pick = next.splice(i, 1)[0];
        rec(next, acc.concat([pick]));
      }
    }
    rec(arr, []);
    return out;
  }

  /**
   * Varianten für Mehrfachauswahl-Slugs:
   * - Klickreihenfolge
   * - alphabetisch sortiert
   * - zusätzliche Permutationen (bis 4 Werte, damit die Kandidatenliste begrenzt bleibt)
   */
  function multiSlugVariantsFromArray(values) {
    if (!Array.isArray(values) || !values.length) return [];
    var raw = values.map(slugify);
    var ordered = raw.join('-and-');
    var sorted = raw.slice().sort().join('-and-');
    var seen = {};
    var out = [];
    function push(v) {
      if (!v || seen[v]) return;
      seen[v] = true;
      out.push(v);
    }
    push(ordered);
    push(sorted);
    if (raw.length > 1 && raw.length <= 4) {
      var perms = permute(raw);
      for (var i = 0; i < perms.length; i++) push(perms[i].join('-and-'));
    }
    return out;
  }

  function valueSlugVariantsFromState(state, field) {
    var v = state[field];
    if (v == null || v === '') return [];
    if (Array.isArray(v)) {
      if (!v.length) return [];
      return multiSlugVariantsFromArray(v);
    }
    return [slugify(v)];
  }

  function canonicalSelBaseVariants(state, step) {
    var fields = STEP_FIELDS[step];
    if (!fields || !state) return [];
    var combos = [''];
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      var variants = valueSlugVariantsFromState(state, f);
      if (!variants.length) continue;
      var seg = fieldSeg(f) + '-';
      var next = [];
      for (var c = 0; c < combos.length; c++) {
        for (var v = 0; v < variants.length; v++) {
          next.push(combos[c] ? combos[c] + '__' + seg + variants[v] : seg + variants[v]);
        }
      }
      combos = next;
      /* Sicherheitsbremse gegen zu viele Varianten in Schritten mit vielen Multi-Werten. */
      if (combos.length > 64) combos = combos.slice(0, 64);
    }
    var seen = {};
    return combos.filter(function (b) {
      if (!b || seen[b]) return false;
      seen[b] = true;
      return true;
    });
  }

  /** Mehrfach-help: Slug in Klick-/Array-Reihenfolge, falls von der sortierten Variante abweichend. */
  function helpContextMultiInsertSlug(state) {
    var hc = state.help_context;
    if (!Array.isArray(hc) || hc.length < 2) return null;
    var sorted = hc.slice().sort().map(slugify).join('-and-');
    var ordered = hc.map(slugify).join('-and-');
    return sorted !== ordered ? ordered : null;
  }

  /**
   * Einheitlicher `sel-…`-Mittelteil: Felder in STEP_FIELDS-Reihenfolge, nur gesetzte Werte, mit `__`.
   * Entspricht z. B. `usage-lernraum__help-lernen` (unabhängig davon, welches Feld zuletzt geklickt wurde).
   */
  function canonicalSelBase(state, step) {
    var fields = STEP_FIELDS[step];
    if (!fields || !state) return null;
    var parts = [];
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      var vs = valueSlugFromState(state, f);
      if (vs != null) parts.push(fieldSeg(f) + '-' + vs);
    }
    return parts.length ? parts.join('__') : null;
  }

  /**
   * Schritt 1: gleicher kanonischer Name wie `canonicalSelBase`, aber `help_context`-Teil in
   * Array-Reihenfolge (Klickreihenfolge), nicht alphabetisch. Ermöglicht Assets wie
   * `sel-usage-…__help-schreiben-and-planen.json` neben `…-planen-and-schreiben…`.
   */
  function canonicalSelBaseHelpInsertionVariant(state, step) {
    var base = canonicalSelBase(state, step);
    if (!base || step !== 1 || !state) return null;
    var hi = helpContextMultiInsertSlug(state);
    if (!hi) return null;
    var sortedSeg = 'help-' + valueSlugFromState(state, 'help_context');
    var orderedSeg = 'help-' + hi;
    if (base.indexOf(sortedSeg) === -1) return null;
    return base.replace(sortedSeg, orderedSeg);
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
    lastResolvedWheelMedia = null;
  }

  function getActiveWheelAvatar() {
    var section = document.querySelector('.wizard-step:not(.hidden)');
    if (!section) return null;
    return section.querySelector('.wizard-wheel-avatar');
  }

  /** Schritt 8 wirklich ausgefüllt (ohne testMode-Shortcuts), für dauerhaftes Avatar-Bild im Wheel. */
  function isStepEightComplete(state) {
    if (!state || state.testMode) return false;
    return !!(
      window.WizardValidation &&
      typeof window.WizardValidation.isStepValid === 'function' &&
      window.WizardValidation.isStepValid(state, 8)
    );
  }

  function applyWheelCenterAvatarImage(state) {
    var url = '';
    var avatarType = state && state.avatarType ? state.avatarType : 'human';
    try {
      if (window.WizardAvatar && typeof window.WizardAvatar.buildAvatarUrl === 'function') {
        url = window.WizardAvatar.buildAvatarUrl(state);
      }
    } catch (e) {}
    document.querySelectorAll('.wizard-wheel-avatar img').forEach(function (img) {
      if (url) img.src = url;
      img.setAttribute('data-avatar-type', avatarType);
      img.style.display = 'block';
    });
  }

  function shouldSkipWheelAnimations(state) {
    if (!state) return true;
    if (state.currentStep === 9) return true;
    return false;
  }

  function isFileProtocol() {
    return window.location && window.location.protocol === 'file:';
  }

  /** Minimale Absicherung eingebetteter SVG-Texte (lokale Assets). */
  function sanitizeSvgText(text) {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  }

  /**
   * Vor jeder *.json-URL wird dieselbe Basis-URL mit *.svg eingefügt (wenn noch nicht in der Liste).
   * Liegt eine passende SVG-Datei vor, wird sie statt der Lottie-Animation angezeigt.
   */
  function expandWheelMediaCandidates(urls) {
    if (!urls || !urls.length) return urls;
    var out = [];
    var seen = {};
    function push(u) {
      if (!u || seen[u]) return;
      seen[u] = true;
      out.push(u);
    }
    for (var i = 0; i < urls.length; i++) {
      var u = urls[i];
      if (typeof u === 'string' && u.length > 5 && u.slice(-5).toLowerCase() === '.json') {
        var isTransitionLike = u.indexOf('/sel-from-') !== -1 || u.indexOf('/transitions/') !== -1;
        if (isTransitionLike) {
          /* Bei Übergängen bevorzugen wir die Animation, SVG bleibt Fallback. */
          push(u);
          push(u.slice(0, -5) + '.svg');
          continue;
        }
        push(u.slice(0, -5) + '.svg');
      }
      push(u);
    }
    return out;
  }

  function rememberWheelSvgFromRoot(stepNum, rootEl) {
    if (stepNum == null || !rootEl) return;
    var svg = rootEl.querySelector('svg');
    if (svg) lastWheelSvgByStep[stepNum] = svg.cloneNode(true);
  }

  function mediaBaseName(url) {
    if (!url || typeof url !== 'string') return '';
    var clean = url.split('?')[0].split('#')[0];
    var slash = clean.lastIndexOf('/');
    var file = slash >= 0 ? clean.slice(slash + 1) : clean;
    var dot = file.lastIndexOf('.');
    return dot > 0 ? file.slice(0, dot) : file;
  }

  function rememberResolvedWheelMedia(stepNum, url) {
    var base = mediaBaseName(url);
    if (stepNum == null || !base) return;
    lastResolvedWheelMedia = { step: stepNum, base: base, url: url };
  }

  function isKnownMissingMedia(url) {
    return mediaAvailabilityCache[url] === false;
  }

  function markMediaAvailable(url) {
    if (!url) return;
    mediaAvailabilityCache[url] = true;
  }

  function markMediaMissing(url) {
    if (!url) return;
    mediaAvailabilityCache[url] = false;
  }

  function cloneStepState(state, step) {
    var fields = STEP_FIELDS[step];
    var out = {};
    if (!fields || !state) return out;
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      var v = state[f];
      out[f] = Array.isArray(v) ? v.slice() : v;
    }
    return out;
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

  function candidateLoadTimeoutMs(url) {
    if (!url || typeof url !== 'string') return 900;
    /* Selections wechseln oft schnell; fehlende Varianten sollen den Fallback nicht lange blockieren. */
    if (url.indexOf(BASE + 'step-') === 0) {
      if (url.indexOf('/sel-from-') !== -1) return 320;
      return 140;
    }
    if (url.indexOf(BASE + 'transitions/') === 0) return 450;
    return 900;
  }

  function prioritizeKnownAvailable(urls) {
    if (!Array.isArray(urls) || urls.length < 2) return urls;
    var transitionLike = false;
    for (var ti = 0; ti < urls.length; ti++) {
      var tu = urls[ti];
      if (typeof tu === 'string' && tu.indexOf('/transitions/') !== -1) {
        transitionLike = true;
        break;
      }
    }
    var orderedJson = [];
    var orderedOther = [];
    var missingJson = [];
    var missingOther = [];
    for (var i = 0; i < urls.length; i++) {
      var u = urls[i];
      var isJson = typeof u === 'string' && u.toLowerCase().slice(-5) === '.json';
      var isMissing = mediaAvailabilityCache[u] === false;
      if (isMissing) {
        if (isJson) missingJson.push(u);
        else missingOther.push(u);
      } else if (isJson && transitionLike) {
        orderedJson.push(u);
      } else {
        orderedOther.push(u);
      }
    }
    /* Bei Step-Transitions: zuerst Animationen (JSON), dann SVG-Fallbacks. */
    if (transitionLike) return orderedJson.concat(missingJson, orderedOther, missingOther);
    /* Sonst: bekannte Fehlkandidaten ans Ende, Reihenfolge beibehalten. */
    return orderedOther.concat(orderedJson, missingOther, missingJson);
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

  /**
   * Statische SVG-Grafik aus dem Kandidaten-Array (fetch + Inline-SVG im Wheel-Zentrum).
   */
  function tryPlaySvgAtIndex(state, urls, index, wrap) {
    var url = urls[index];
    if (isKnownMissingMedia(url)) {
      wheelAnimDebug('skip_known_missing', { type: 'svg', url: url, index: index });
      tryPlayIndex(state, urls, index + 1, wrap);
      return;
    }
    var img = wrap.querySelector('img');
    var root = document.createElement('div');
    root.className = 'wheel-center-lottie wheel-center-lottie--pending wheel-center-lottie--static';
    root.style.opacity = '0';
    root.style.pointerEvents = 'none';
    wrap.appendChild(root);
    var settled = false;
    var loadTimer;

    function fail() {
      if (settled) return;
      settled = true;
      if (loadTimer) clearTimeout(loadTimer);
      if (root.parentNode) root.remove();
      wheelAnimDebug('candidate_failed', { type: 'svg', url: url, index: index });
      tryPlayIndex(state, urls, index + 1, wrap);
    }

    function revealStatic() {
      if (settled) return;
      var svg = root.querySelector('svg');
      if (!svg) {
        fail();
        return;
      }
      settled = true;
      if (loadTimer) clearTimeout(loadTimer);
      try {
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      } catch (eA) {}
      snapshotWheelLottiesToMemory(root);
      removeHoldFramesFromWrap(root.parentNode);
      instances.forEach(destroyInstance);
      instances = [];
      document.querySelectorAll('.wheel-center-lottie').forEach(function (el) {
        if (el !== root) el.remove();
      });
      root.classList.remove('wheel-center-lottie--pending');
      root.style.opacity = '';
      root.style.pointerEvents = '';
      if (img) img.style.display = 'none';
      rememberWheelSvgFromRoot(state.currentStep, root);
      rememberResolvedWheelMedia(state.currentStep, url);
      wheelAnimDebug('candidate_loaded', { type: 'svg', url: url, index: index });
    }

    if (!window.fetch) {
      fail();
      return;
    }
    fetch(url)
      .then(function (r) {
        if (!r.ok) {
          markMediaMissing(url);
          wheelAnimDebug('fetch_not_ok', { type: 'svg', url: url, status: r.status, index: index });
          throw new Error('svg');
        }
        return r.text();
      })
      .then(function (text) {
        if (settled) return;
        root.innerHTML = sanitizeSvgText(text);
        if (settled) return;
        markMediaAvailable(url);
        revealStatic();
      })
      .catch(function () {
        if (mediaAvailabilityCache[url] == null) markMediaMissing(url);
        fail();
      });
    loadTimer = setTimeout(function () {
      if (!settled) {
        wheelAnimDebug('candidate_timeout', { type: 'svg', url: url, index: index, timeoutMs: candidateLoadTimeoutMs(url) });
        fail();
      }
    }, candidateLoadTimeoutMs(url));
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
    if (isFileProtocol()) return;
    urls = expandWheelMediaCandidates(urls);
    urls = prioritizeKnownAvailable(urls);
    if (!urls.length) return;
    wheelAnimDebug('candidate_list', {
      step: state && state.currentStep,
      holdFromStep: holdFromStep,
      total: urls.length,
      urls: urls
    });
    var hasJson = false;
    var hasSvg = false;
    for (var hi = 0; hi < urls.length; hi++) {
      var hu = urls[hi];
      if (typeof hu !== 'string') continue;
      var hul = hu.toLowerCase();
      if (hul.slice(-5) === '.json') hasJson = true;
      if (hul.slice(-4) === '.svg') hasSvg = true;
    }
    if (hasJson && (!window.lottie || typeof window.lottie.loadAnimation !== 'function')) return;
    if (hasSvg && !window.fetch) {
      urls = urls.filter(function (u) {
        return !(typeof u === 'string' && u.toLowerCase().slice(-4) === '.svg');
      });
    }
    if (!urls.length) return;
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
    var url = urls[index];
    if (isKnownMissingMedia(url)) {
      wheelAnimDebug('skip_known_missing', { type: 'json_or_other', url: url, index: index });
      tryPlayIndex(state, urls, index + 1, wrap);
      return;
    }
    wheelAnimDebug('candidate_try', { url: url, index: index, step: state && state.currentStep });
    if (typeof url === 'string' && url.toLowerCase().slice(-4) === '.svg') {
      tryPlaySvgAtIndex(state, urls, index, wrap);
      return;
    }
    if (!window.lottie || typeof window.lottie.loadAnimation !== 'function') {
      tryPlayIndex(state, urls, index + 1, wrap);
      return;
    }
    var img = wrap.querySelector('img');
    var root = document.createElement('div');
    root.className = 'wheel-center-lottie wheel-center-lottie--pending';
    root.style.opacity = '0';
    root.style.pointerEvents = 'none';
    wrap.appendChild(root);
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
      markMediaMissing(url);
      wheelAnimDebug('candidate_failed', { type: 'json', url: url, index: index });
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
      markMediaAvailable(url);
      wheelAnimDebug('candidate_loaded', { type: 'json', url: url, index: index });
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
      rememberResolvedWheelMedia(state.currentStep, url);
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
        if (anim && anim.isLoaded === false) {
          wheelAnimDebug('candidate_timeout', { type: 'json', url: url, index: index, timeoutMs: candidateLoadTimeoutMs(url) });
          advance();
        }
      } catch (err) {
        wheelAnimDebug('candidate_timeout_error', { type: 'json', url: url, index: index });
        advance();
      }
    }, candidateLoadTimeoutMs(url));
  }

  function transitionCandidates(fromStep, toStep) {
    var specific = BASE + 'transitions/from-step-' + pad2(fromStep) + '-to-step-' + pad2(toStep) + '.json';
    var generic = BASE + 'transitions/to-step-' + pad2(toStep) + '.json';
    var contextual = [];
    if (fromStep !== 0 && lastResolvedWheelMedia && lastResolvedWheelMedia.step === fromStep && lastResolvedWheelMedia.base) {
      contextual.push(
        BASE +
          'transitions/from-step-' +
          pad2(fromStep) +
          '-' +
          lastResolvedWheelMedia.base +
          '-to-step-' +
          pad2(toStep) +
          '.json'
      );
      contextual.push(BASE + 'transitions/from-' + lastResolvedWheelMedia.base + '-to-step-' + pad2(toStep) + '.json');
    }
    /* Nur 0→1 hat aktuell eine eigene Datei; sonst zuerst to-step sparen (kein 404 auf fehlendes from-…). */
    if (fromStep === 0 && toStep === 1) {
      return contextual.concat([specific, generic]);
    }
    return contextual.concat([specific, generic]);
  }

  function selectionCandidates(step, state, meta) {
    if (meta.isMulti && meta.added === false) return [];
    var fields = STEP_FIELDS[step];
    if (!fields || fields.indexOf(meta.field) < 0) return [];

    var prefix = BASE + 'step-' + pad2(step) + '/';
    var f = meta.field;
    var vSlug = slugify(meta.value);
    var fs = fieldSeg(f);

    var seen = {};
    var out = [];
    function push(u) {
      if (!u || seen[u]) return;
      seen[u] = true;
      out.push(u);
    }

    if (meta && Object.prototype.hasOwnProperty.call(meta, 'previousValue')) {
      var prevState = cloneStepState(state, step);
      prevState[f] = meta.previousValue;
      var prevBase = canonicalSelBase(prevState, step);
      var nextBase = canonicalSelBase(state, step);
      if (prevBase && nextBase && prevBase !== nextBase) {
        push(prefix + 'sel-from-' + prevBase + '-to-' + nextBase + '.json');
      }
      var prevIns = canonicalSelBaseHelpInsertionVariant(prevState, step);
      var nextIns = canonicalSelBaseHelpInsertionVariant(state, step);
      if (prevIns && nextIns && prevIns !== nextIns) {
        push(prefix + 'sel-from-' + prevIns + '-to-' + nextIns + '.json');
      }
      var prevSlug = meta.previousValue == null || meta.previousValue === '' ? null : slugify(meta.previousValue);
      if (prevSlug && prevSlug !== vSlug) {
        push(prefix + 'sel-from-' + fs + '-' + prevSlug + '-to-' + fs + '-' + vSlug + '.json');
      }
    }

    var canonVariants = canonicalSelBaseVariants(state, step);
    for (var cv = 0; cv < canonVariants.length; cv++) {
      push(prefix + 'sel-' + canonVariants[cv] + '.json');
    }
    /* Legacy-Helfer für Schritt 1 beibehalten (falls Dateinamen außerhalb der allgemeinen Variantenlogik vorliegen). */
    var canonHelpOrder = canonicalSelBaseHelpInsertionVariant(state, step);
    if (canonHelpOrder) push(prefix + 'sel-' + canonHelpOrder + '.json');
    var canonBase = canonicalSelBase(state, step);
    if (canonBase) push(prefix + 'sel-' + canonBase + '.json');
    if (step === 1 && f === 'help_context') {
      var hiSoloFirst = helpContextMultiInsertSlug(state);
      if (hiSoloFirst) push(prefix + 'sel-help-' + hiSoloFirst + '.json');
    }

    var others = fields.filter(function (of) {
      return of !== f && valueSlugFromState(state, of) != null;
    });
    others.sort();

    if (others.length) {
      var hiSel = step === 1 ? helpContextMultiInsertSlug(state) : null;
      var combo = others
        .map(function (of) {
          return fieldSeg(of) + '-' + valueSlugFromState(state, of);
        })
        .join('__');
      if (hiSel && others.indexOf('help_context') >= 0) {
        var comboIns = others
          .map(function (of) {
            return of === 'help_context' ? 'help-' + hiSel : fieldSeg(of) + '-' + valueSlugFromState(state, of);
          })
          .join('__');
        push(prefix + 'sel-' + fs + '-' + vSlug + '__' + comboIns + '.json');
      }
      push(prefix + 'sel-' + fs + '-' + vSlug + '__' + combo + '.json');
      if (hiSel && f === 'help_context') {
        push(prefix + 'sel-help-' + hiSel + '__' + combo + '.json');
      }
    }
    for (var i = 0; i < others.length; i++) {
      var of = others[i];
      var hiPair = step === 1 && of === 'help_context' ? helpContextMultiInsertSlug(state) : null;
      if (hiPair) {
        push(prefix + 'sel-' + fs + '-' + vSlug + '__help-' + hiPair + '.json');
      }
      push(
        prefix + 'sel-' + fs + '-' + vSlug + '__' + fieldSeg(of) + '-' + valueSlugFromState(state, of) + '.json'
      );
    }
    push(prefix + 'sel-' + fs + '-' + vSlug + '.json');
    if (step === 1 && f === 'help_context') {
      var hiSolo = helpContextMultiInsertSlug(state);
      if (hiSolo) {
        var hsFull = valueSlugFromState(state, 'help_context');
        if (hiSolo !== hsFull) push(prefix + 'sel-help-' + hiSolo + '.json');
      }
    }
    return out;
  }

  /**
   * Alle sinnvollen sel-*.json-Kandidaten für den Schritt aus dem aktuellen State
   * (z. B. wenn der Nutzer später wieder auf den Schritt springt – passend zur Auswahl).
   */
  function restoreStepWheelCandidates(step, state) {
    var fields = STEP_FIELDS[step];
    if (!fields || !fields.length || !state) return [];

    var setFields = fields.filter(function (f) {
      return valueSlugFromState(state, f) != null;
    });
    if (!setFields.length) return [];

    var seen = {};
    var out = [];

    function pushUnique(u) {
      if (!u || seen[u]) return;
      seen[u] = true;
      out.push(u);
    }

    var prefix0 = BASE + 'step-' + pad2(step) + '/';
    var canonVariants = canonicalSelBaseVariants(state, step);
    for (var cv = 0; cv < canonVariants.length; cv++) {
      pushUnique(prefix0 + 'sel-' + canonVariants[cv] + '.json');
    }
    var canonBase = canonicalSelBase(state, step);
    var canonHelpIns = canonicalSelBaseHelpInsertionVariant(state, step);
    if (canonHelpIns) pushUnique(prefix0 + 'sel-' + canonHelpIns + '.json');
    if (canonBase) pushUnique(prefix0 + 'sel-' + canonBase + '.json');
    if (step === 1) {
      var hiTop = helpContextMultiInsertSlug(state);
      if (hiTop) pushUnique(prefix0 + 'sel-help-' + hiTop + '.json');
    }

    for (var pi = 0; pi < setFields.length; pi++) {
      var f = setFields[pi];
      var prefix = BASE + 'step-' + pad2(step) + '/';
      var vSlug = valueSlugFromState(state, f);
      var fs = fieldSeg(f);
      var others = fields.filter(function (of) {
        return of !== f && valueSlugFromState(state, of) != null;
      });
      others.sort();

      if (others.length) {
        var hiR = step === 1 ? helpContextMultiInsertSlug(state) : null;
        var combo = others
          .map(function (of) {
            return fieldSeg(of) + '-' + valueSlugFromState(state, of);
          })
          .join('__');
        if (hiR && others.indexOf('help_context') >= 0) {
          var comboInsR = others
            .map(function (of) {
              return of === 'help_context' ? 'help-' + hiR : fieldSeg(of) + '-' + valueSlugFromState(state, of);
            })
            .join('__');
          pushUnique(prefix + 'sel-' + fs + '-' + vSlug + '__' + comboInsR + '.json');
        }
        pushUnique(prefix + 'sel-' + fs + '-' + vSlug + '__' + combo + '.json');
        if (hiR && f === 'help_context') {
          pushUnique(prefix + 'sel-help-' + hiR + '__' + combo + '.json');
        }
      }
      for (var j = 0; j < others.length; j++) {
        var of = others[j];
        var hiPr = step === 1 && of === 'help_context' ? helpContextMultiInsertSlug(state) : null;
        if (hiPr) {
          pushUnique(prefix + 'sel-' + fs + '-' + vSlug + '__help-' + hiPr + '.json');
        }
        pushUnique(
          prefix + 'sel-' + fs + '-' + vSlug + '__' + fieldSeg(of) + '-' + valueSlugFromState(state, of) + '.json'
        );
      }
      pushUnique(prefix + 'sel-' + fs + '-' + vSlug + '.json');
      if (step === 1 && f === 'help_context') {
        var hiSo = helpContextMultiInsertSlug(state);
        if (hiSo) {
          var hsF = valueSlugFromState(state, 'help_context');
          if (hiSo !== hsF) pushUnique(prefix + 'sel-help-' + hiSo + '.json');
        }
      }
    }
    return out;
  }

  function notifyUiUpdate(state) {
    if (!state) return;
    var cur = state.currentStep;
    if (previousUiStep === null) {
      previousUiStep = cur;
      if (cur === 8) {
        clearLottieLayers();
        if (isStepEightComplete(state)) {
          applyWheelCenterAvatarImage(state);
        } else {
          document.querySelectorAll('.wizard-wheel-avatar img').forEach(function (img) {
            img.style.display = 'block';
          });
        }
      } else if (isStepEightComplete(state)) {
        clearLottieLayers();
        applyWheelCenterAvatarImage(state);
      }
      return;
    }
    if (previousUiStep === cur) return;
    var from = previousUiStep;
    previousUiStep = cur;
    if (cur === 0) {
      clearLottieLayers();
      if (isStepEightComplete(state)) {
        applyWheelCenterAvatarImage(state);
      } else {
        ensureStartStepLoop(state);
      }
      return;
    }
    if (cur === 8) {
      clearLottieLayers();
      if (isStepEightComplete(state)) {
        applyWheelCenterAvatarImage(state);
      } else {
        document.querySelectorAll('.wizard-wheel-avatar img').forEach(function (img) {
          img.style.display = 'block';
        });
      }
      return;
    }
    if (isStepEightComplete(state)) {
      clearLottieLayers();
      applyWheelCenterAvatarImage(state);
      return;
    }
    if (shouldSkipWheelAnimations(state)) return;
    var restoreUrls = restoreStepWheelCandidates(cur, state);
    var transUrls = transitionCandidates(from, cur);
    var urls = restoreUrls.length ? restoreUrls.concat(transUrls) : transUrls;
    playCandidateUrls(state, urls, from);
  }

  function notifySelection(state, meta) {
    if (!state || !meta) return;
    if (state.currentStep === 0) return;
    if (state.currentStep === 8) {
      clearLottieLayers();
      if (isStepEightComplete(state)) {
        applyWheelCenterAvatarImage(state);
      } else {
        document.querySelectorAll('.wizard-wheel-avatar img').forEach(function (img) {
          img.style.display = 'block';
        });
      }
      return;
    }
    if (isStepEightComplete(state)) {
      clearLottieLayers();
      applyWheelCenterAvatarImage(state);
      return;
    }
    if (shouldSkipWheelAnimations(state)) return;
    /* Bei Abwahl: meta.value ist das entfernte Item — selectionCandidates wäre falsch und liefert ohnehin []. */
    var urls =
      meta.isMulti && meta.added === false
        ? restoreStepWheelCandidates(state.currentStep, state)
        : selectionCandidates(state.currentStep, state, meta);
    playCandidateUrls(state, urls, state.currentStep);
  }

  function resetNavigationTracking() {
    previousUiStep = null;
  }

  /**
   * Schritt 0: statische Grafik (on-load.svg) oder Endlosschleife (on-load.json).
   * Läuft erneut, sobald der Nutzer wieder auf die Startseite wechselt.
   */
  function ensureStartStepLoop(state) {
    if (!state || state.currentStep !== 0) return;
    if (isStepEightComplete(state)) return;
    if (isFileProtocol()) return;
    var wrap = getActiveWheelAvatar();
    if (!wrap) return;
    if (wrap.querySelector('.wheel-center-lottie--start')) return;

    var img = wrap.querySelector('img');
    var svgUrl = BASE + 'transitions/on-load.svg';
    var jsonUrl = BASE + 'transitions/on-load.json';

    function mountStartJson() {
      if (wrap.querySelector('.wheel-center-lottie--start')) return;
      if (!window.lottie || typeof window.lottie.loadAnimation !== 'function') {
        if (img) img.style.display = 'block';
        return;
      }
      if (img) img.style.display = 'none';
      var root = document.createElement('div');
      root.className = 'wheel-center-lottie wheel-center-lottie--start';
      wrap.appendChild(root);
      var anim;
      try {
        anim = loadWheelLottie(root, jsonUrl, true);
      } catch (e) {
        root.remove();
        if (img) img.style.display = 'block';
        return;
      }
      instances.push(anim);
      var cacheIt = function () {
        cacheAnimationFromInstance(jsonUrl, anim);
        rememberResolvedWheelMedia(0, jsonUrl);
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

    if (window.fetch) {
      fetch(svgUrl)
        .then(function (r) {
          return r.ok ? r.text() : Promise.reject();
        })
        .then(function (text) {
          if (wrap.querySelector('.wheel-center-lottie--start')) return;
          if (img) img.style.display = 'none';
          var root = document.createElement('div');
          root.className = 'wheel-center-lottie wheel-center-lottie--start wheel-center-lottie--static';
          root.innerHTML = sanitizeSvgText(text);
          var svg = root.querySelector('svg');
          if (!svg) {
            root.remove();
            if (img) img.style.display = 'block';
            mountStartJson();
            return;
          }
          try {
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          } catch (eA) {}
          wrap.appendChild(root);
          rememberWheelSvgFromRoot(0, root);
          rememberResolvedWheelMedia(0, svgUrl);
        })
        .catch(function () {
          mountStartJson();
        });
      return;
    }
    mountStartJson();
  }

  function refreshWheelCenterForState(state) {
    if (!state) return;
    if (isStepEightComplete(state)) {
      clearLottieLayers();
      applyWheelCenterAvatarImage(state);
    }
  }

  initWheelAnimDebugFromUrl();

  window.WizardWheelCenter = {
    notifyUiUpdate: notifyUiUpdate,
    notifySelection: notifySelection,
    resetNavigationTracking: resetNavigationTracking,
    refreshWheelCenterForState: refreshWheelCenterForState,
    ensureStartStepLoop: ensureStartStepLoop,
    /** @deprecated Alias – nutze ensureStartStepLoop */
    playPageLoadIntro: ensureStartStepLoop,
    clearLottieLayers: clearLottieLayers,
    prefetchWheelAnimationData: prefetchWheelAnimationData,
    slugify: slugify,
    fieldSeg: fieldSeg
  };
})();
