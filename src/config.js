// Zentrale Konfiguration für den Profil-Assistenten.
// Passe hier die Ziel-URL an, die nach Abschluss der Avatar-Erstellung aufgerufen werden soll.

window.APP_CONFIG = {
  // Basis-URL, an die die Profildaten als Query-Parameter gesendet werden.
  // Beispiel: 'https://deine-ziel-url.de/api'
  apiBaseUrl: 'https://deine-ziel-url.de/api',

  // Aktiviert den Testmodus global, wenn true:
  // - alle Validierungen werden übersprungen
  // - du kannst direkt zu beliebigen Schritten springen (z. B. Schritt 7)
  // Kann zusätzlich per URL-Parameter ?test=1 ein- oder ausgeschaltet werden.
  enableTestMode: true
};

