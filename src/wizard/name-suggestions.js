;(function () {
  const NAME_SUGGESTIONS_MALE = ['Leo', 'Milan', 'Emil', 'Noel', 'Fynn', 'Timo', 'Nico', 'Luca'];
  const NAME_SUGGESTIONS_FEMALE = ['Ava', 'Nora', 'Lina', 'Elin', 'Tara', 'Yara', 'Kira', 'Mila', 'Jule', 'Aria'];
  const NAME_SUGGESTIONS_NEUTRAL = ['Mika', 'Sami', 'Jona', 'Rian', 'Mara', 'Ida'];

  function pickRandomName(list) {
    if (!Array.isArray(list) || !list.length) return '';
    return list[Math.floor(Math.random() * list.length)];
  }

  function applyRandomNameSuggestions(stepSelector) {
    var selector = stepSelector || '#step3';
    var suggestionButtons = Array.from(
      document.querySelectorAll(selector + ' .card-select[data-field="nameChoice"][data-suggestion]:not([data-suggestion=""])')
    ).filter(function (btn) {
      return !btn.hasAttribute('data-fixed-name');
    });
    if (!suggestionButtons.length) return;

    var names = [
      pickRandomName(NAME_SUGGESTIONS_MALE),
      pickRandomName(NAME_SUGGESTIONS_FEMALE),
      pickRandomName(NAME_SUGGESTIONS_NEUTRAL)
    ];

    suggestionButtons.forEach(function (btn, idx) {
      var name = names[idx] || '';
      btn.dataset.suggestion = name;
      btn.textContent = name;
    });

    document.querySelectorAll(selector + ' .card-select[data-field="nameChoice"][data-fixed-name]').forEach(function (btn) {
      var s = btn.dataset.suggestion || '';
      if (s) btn.textContent = s;
    });
  }

  window.NameSuggestions = {
    applyRandomNameSuggestions: applyRandomNameSuggestions
  };
})();
