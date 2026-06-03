;(function () {
  var instance = null;

  function getContainer() {
    return document.querySelector('#step0 .step0-welcome-lottie');
  }

  function destroy() {
    if (instance && typeof instance.destroy === 'function') {
      try {
        instance.destroy();
      } catch (e) {}
    }
    instance = null;
    var el = getContainer();
    if (el) el.innerHTML = '';
  }

  function mount() {
    if (!window.lottie || typeof window.lottie.loadAnimation !== 'function') return;
    var el = getContainer();
    if (!el) return;
    var url =
      window.WizardI18n && typeof window.WizardI18n.assetUrl === 'function'
        ? window.WizardI18n.assetUrl('startWelcome')
        : '';
    if (!url) return;
    destroy();
    instance = window.lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: url
    });
  }

  function refresh() {
    destroy();
    mount();
  }

  var resizeTimer;
  function onResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (!document.querySelector('#step0:not(.hidden)')) return;
      refresh();
    }, 150);
  }

  window.addEventListener('resize', onResize);

  window.WizardWelcomeLottie = {
    mount: mount,
    refresh: refresh,
    destroy: destroy
  };
})();
