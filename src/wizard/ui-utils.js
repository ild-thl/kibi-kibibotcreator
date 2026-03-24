;(function () {
  function showById(id) {
    var el = document.getElementById(id);
    if (!el) return false;
    el.classList.remove('hidden');
    return true;
  }

  function hideById(id) {
    var el = document.getElementById(id);
    if (!el) return false;
    el.classList.add('hidden');
    return true;
  }

  function setTextById(id, text) {
    var el = document.getElementById(id);
    if (!el) return false;
    el.textContent = text;
    return true;
  }

  function downloadJson(filenamePrefix, payload) {
    var content = JSON.stringify(payload, null, 2);
    var blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var ts = new Date().toISOString().replace(/[:.]/g, '-');
    var a = document.createElement('a');
    a.href = url;
    a.download = (filenamePrefix || 'export') + '-' + ts + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  window.WizardUiUtils = {
    showById: showById,
    hideById: hideById,
    setTextById: setTextById,
    downloadJson: downloadJson
  };
})();
