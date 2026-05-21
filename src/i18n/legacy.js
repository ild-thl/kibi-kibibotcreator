;(function () {
  /** Alte deutsche Anzeigewerte → stabile Option-Keys (slug-kompatibel mit Wheel-Assets). */
  var LEGACY_BY_FIELD = {
    usage_context: {
      'Lernraum': 'lernraum',
      'Lernveranstaltung': 'lernveranstaltung',
      'TH-Weit': 'th-weit'
    },
    help_context: {
      Lernen: 'lernen',
      Planen: 'planen',
      Schreiben: 'schreiben'
    },
    role: {
      Experte: 'experte',
      Kollege: 'kollege',
      Mentor: 'mentor',
      Tutor: 'tutor',
      Lehrer: 'lehrer',
      Buddy: 'buddy',
      Coach: 'coach'
    },
    personality_greeting: {
      Duzen: 'duzen',
      Siezen: 'siezen'
    },
    personality_humor: {
      Humorvoll: 'humorvoll',
      Ernst: 'ernst'
    },
    personality_answer: {
      'Kurz & knapp': 'kurz-knapp',
      Ausführlich: 'ausführlich'
    },
    personality_tone: {
      Locker: 'locker',
      Professionell: 'professionell'
    },
    personality_style: {
      Persönlich: 'persönlich',
      Sachlich: 'sachlich'
    },
    interaction_workflow: {
      'Schritt für Schritt erklären': 'schritt-für-schritt-erklären',
      'Zuerst fragen stellen und dann antworten': 'zuerst-fragen-stellen-und-dann-antworten',
      'Direkt Vorschläge machen': 'direkt-vorschläge-machen'
    },
    interaction_examples: {
      'Häufig Beispiele nutzen': 'häufig-beispiele-nutzen',
      'Gelegentlich Beispiele nutzen': 'gelegentlich-beispiele-nutzen',
      'Keine Beispiele nutzen': 'keine-beispiele-nutzen'
    },
    knowledge: {
      Studiengang: 'studiengang',
      Modulplan: 'modulplan',
      Lernfortschritt: 'lernfortschritt'
    },
    knowledge_source: {
      'Allgemeines Wissen': 'allgemeines-wissen',
      Studiengangswissen: 'studiengangswissen'
    },
    decision_mode: {
      'Trifft Entscheidungen': 'trifft-entscheidungen',
      'Gibt Empfehlungen': 'gibt-empfehlungen',
      'Trifft keine Entscheidungen': 'trifft-keine-entscheidungen'
    },
    feedback: {
      'Fehler freundlich erklären': 'fehler-freundlich-erklären',
      'Unsicherheit offen zeigen': 'unsicherheit-offen-zeigen',
      'Mit Übungen helfen': 'mit-übungen-helfen'
    },
    privacy: {
      'Auf andere Systeme zugreifen': 'auf-andere-systeme-zugreifen',
      'Sich an Gespräche erinnern': 'sich-an-gespräche-erinnern',
      'Feedback an Lehrende weitergeben': 'feedback-an-lehrende-weitergeben',
      'Keine Daten speichern': 'keine-daten-speichern'
    }
  };

  function toKey(field, value) {
    if (value == null || value === '') return value;
    var map = LEGACY_BY_FIELD[field];
    if (map && map[value]) return map[value];
    return value;
  }

  window.WizardI18nLegacy = {
    LEGACY_BY_FIELD: LEGACY_BY_FIELD,
    toKey: toKey
  };
})();
