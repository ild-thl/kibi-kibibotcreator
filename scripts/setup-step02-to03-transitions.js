/**
 * Schritt 2 → 3: 10 Übergangs-Lotties + Hardlinks pro canonicalSelBase.
 * Zuordnung laut zuteilung_uebergaenge_zu_grafiken_schritt02.pdf
 */
const fs = require('fs');
const path = require('path');

const TRANS = path.join(__dirname, '..', 'assets', 'wheel-animations', 'transitions');

const SEG = {
  duzen: 'greeting-duzen',
  siezen: 'greeting-siezen',
  humorvoll: 'humor-humorvoll',
  ernst: 'humor-ernst',
  kurzknapp: 'answer-kurz-knapp',
  ausfuehrlich: 'answer-ausführlich',
  locker: 'tone-locker',
  professionell: 'tone-professionell',
  persoenlich: 'style-persönlich',
  sachlich: 'style-sachlich',
};

const ORDER = ['humorvoll', 'ernst', 'kurzknapp', 'ausfuehrlich', 'locker', 'professionell', 'persoenlich', 'sachlich'];

/** 03_…-Master → Liste der zugehörigen 02_…-Quell-SVGs (ohne Locale). */
const BUNDLE_SOURCES = {
  '03_duzen_uebergang.json': ['02_duzen_de.svg'],
  '03_siezen_uebergang.json': ['02_siezen_de.svg'],
  '03_duzen_humorvoll_ernst.json': ['02_duzen_de_humorvoll.svg', '02_duzen_de_ernst.svg'],
  '03_siezen_humorvoll_ernst.json': ['02_siezen_de_humorvoll.svg', '02_siezen_de_ernst.svg'],
  '03_humorvoll_ernst_kurzknapp.json': [
    '02_duzen_de_ernst_kurzknapp.svg',
    '02_duzen_de_ernst_kurzknapp_professionell.svg',
    '02_duzen_de_ernst_kurzknapp_locker.svg',
    '02_duzen_de_humorvoll_kurzknapp.svg',
    '02_duzen_de_humorvoll_kurzknapp_professionell.svg',
    '02_duzen_de_humorvoll_kurzknapp_locker.svg',
    '02_siezen_de_ernst_kurzknapp.svg',
    '02_siezen_de_ernst_kurzknapp_professionell.svg',
    '02_siezen_de_ernst_kurzknapp_locker.svg',
    '02_siezen_de_humorvoll_kurzknapp.svg',
    '02_siezen_de_humorvoll_kurzknapp_professionell.svg',
    '02_siezen_de_humorvoll_kurzknapp_locker.svg',
  ],
  '03_humorvoll_ernst_ausfuehrlich.json': [
    '02_duzen_de_ernst_ausfuehrlich.svg',
    '02_duzen_de_ernst_ausfuehrlich_professionell.svg',
    '02_duzen_de_ernst_ausfuehrlich_locker.svg',
    '02_duzen_de_humorvoll_ausfuehrlich.svg',
    '02_duzen_de_humorvoll_ausfuehrlich_professionell.svg',
    '02_duzen_de_humorvoll_ausfuehrlich_locker.svg',
    '02_siezen_de_ernst_ausfuehrlich.svg',
    '02_siezen_de_ernst_ausfuehrlich_professionell.svg',
    '02_siezen_de_ernst_ausfuehrlich_locker.svg',
    '02_siezen_de_humorvoll_ausfuehrlich.svg',
    '02_siezen_de_humorvoll_ausfuehrlich_professionell.svg',
    '02_siezen_de_humorvoll_ausfuehrlich_locker.svg',
  ],
  '03_ausfuehrlich_persoenlich.json': [
    '02_duzen_de_ernst_ausfuehrlich_locker_persoenlich.svg',
    '02_duzen_de_ernst_ausfuehrlich_professionell_persoenlich.svg',
    '02_duzen_de_humorvoll_ausfuehrlich_locker_persoenlich.svg',
    '02_duzen_de_humorvoll_ausfuehrlich_professionell_persoenlich.svg',
    '02_siezen_de_ernst_ausfuehrlich_locker_persoenlich.svg',
    '02_siezen_de_ernst_ausfuehrlich_professionell_persoenlich.svg',
    '02_siezen_de_humorvoll_ausfuehrlich_locker_persoenlich.svg',
    '02_siezen_de_humorvoll_ausfuehrlich_professionell_persoenlich.svg',
  ],
  '03_ausfuehrlich_sachlich.json': [
    '02_duzen_de_ernst_ausfuehrlich_locker_sachlich.svg',
    '02_duzen_de_ernst_ausfuehrlich_professionell_sachlich.svg',
    '02_duzen_de_humorvoll_ausfuehrlich_locker_sachlich.svg',
    '02_duzen_de_humorvoll_ausfuehrlich_professionell_sachlich.svg',
    '02_siezen_de_ernst_ausfuehrlich_locker_sachlich.svg',
    '02_siezen_de_ernst_ausfuehrlich_professionell_sachlich.svg',
    '02_siezen_de_humorvoll_ausfuehrlich_locker_sachlich.svg',
    '02_siezen_de_humorvoll_ausfuehrlich_professionell_sachlich.svg',
  ],
  '03_kurzknapp_persoenlich.json': [
    '02_duzen_de_ernst_kurzknapp_locker_persoenlich.svg',
    '02_duzen_de_ernst_kurzknapp_professionell_persoenlich.svg',
    '02_duzen_de_humorvoll_kurzknapp_locker_persoenlich.svg',
    '02_duzen_de_humorvoll_kurzknapp_professionell_persoenlich.svg',
    '02_siezen_de_ernst_kurzknapp_locker_persoenlich.svg',
    '02_siezen_de_ernst_kurzknapp_professionell_persoenlich.svg',
    '02_siezen_de_humorvoll_kurzknapp_locker_persoenlich.svg',
    '02_siezen_de_humorvoll_kurzknapp_professionell_persoenlich.svg',
  ],
  '03_kurzknapp_sachlich.json': [
    '02_duzen_de_ernst_kurzknapp_locker_sachlich.svg',
    '02_duzen_de_ernst_kurzknapp_professionell_sachlich.svg',
    '02_duzen_de_humorvoll_kurzknapp_locker_sachlich.svg',
    '02_duzen_de_humorvoll_kurzknapp_professionell_sachlich.svg',
    '02_siezen_de_ernst_kurzknapp_locker_sachlich.svg',
    '02_siezen_de_ernst_kurzknapp_professionell_sachlich.svg',
    '02_siezen_de_humorvoll_kurzknapp_locker_sachlich.svg',
    '02_siezen_de_humorvoll_kurzknapp_professionell_sachlich.svg',
  ],
};

function parse02SvgToCanonBase(oldSvgName) {
  const m = /^02_(.+)\.svg$/i.exec(oldSvgName);
  if (!m) throw new Error('Ungültiger Name: ' + oldSvgName);
  const tokens = m[1].split('_');
  if (tokens.length < 2) throw new Error('Zu kurz: ' + oldSvgName);
  const greeting = tokens[0];
  const locale = tokens[1];
  if (!SEG[greeting] || (locale !== 'de' && locale !== 'en')) throw new Error('Greeting/Locale: ' + oldSvgName);
  const rest = tokens.slice(2);
  const ordered = [];
  for (const key of ORDER) {
    if (rest.includes(key)) ordered.push(key);
  }
  if (ordered.length !== rest.length) {
    throw new Error('Unbekannte Segmente in ' + oldSvgName + ': ' + rest.join(','));
  }
  const parts = [SEG[greeting]];
  for (const p of ordered) parts.push(SEG[p]);
  return parts.join('__');
}

function transitionFileName(canonBase) {
  return 'from-step-02-sel-' + canonBase + '-to-step-03.json';
}

function bundleMasterName(old03Name) {
  return 'bundle-step02-to03-' + old03Name.replace(/^03_/, '').replace(/\.json$/, '') + '.json';
}

function removeExistingStep02To03Links() {
  const prefix = 'from-step-02-sel-';
  const suffix = '-to-step-03.json';
  for (const f of fs.readdirSync(TRANS)) {
    if (f.startsWith(prefix) && f.endsWith(suffix)) {
      try {
        fs.unlinkSync(path.join(TRANS, f));
      } catch (e) {}
    }
  }
  for (const f of fs.readdirSync(TRANS)) {
    if (f.startsWith('bundle-step02-to03-') && f.endsWith('.json')) {
      // keep masters, removed below if re-run from 03_
    }
  }
}

function linkOrCopy(target, linkPath) {
  if (fs.existsSync(linkPath)) {
    try {
      const st = fs.lstatSync(linkPath);
      if (st.isSymbolicLink() || st.nlink > 1) {
        fs.unlinkSync(linkPath);
      } else if (path.resolve(linkPath) === path.resolve(target)) {
        return;
      } else {
        fs.unlinkSync(linkPath);
      }
    } catch (e) {
      fs.unlinkSync(linkPath);
    }
  }
  try {
    fs.linkSync(target, linkPath);
  } catch (e) {
    fs.copyFileSync(target, linkPath);
  }
}

removeExistingStep02To03Links();

const canonToBundle = {};
let linkCount = 0;

for (const [old03, sources] of Object.entries(BUNDLE_SOURCES)) {
  const oldPath = path.join(TRANS, old03);
  const masterName = bundleMasterName(old03);
  const masterPath = path.join(TRANS, masterName);

  if (fs.existsSync(oldPath)) {
    if (fs.existsSync(masterPath)) fs.unlinkSync(masterPath);
    fs.renameSync(oldPath, masterPath);
    console.log('Master:', old03, '→', masterName);
  } else if (!fs.existsSync(masterPath)) {
    throw new Error('Fehlt Master und Quelle: ' + old03);
  }

  for (const src of sources) {
    const canon = parse02SvgToCanonBase(src);
    if (canonToBundle[canon] && canonToBundle[canon] !== masterName) {
      throw new Error('Kollision ' + canon + ': ' + canonToBundle[canon] + ' vs ' + masterName);
    }
    canonToBundle[canon] = masterName;
    const linkName = transitionFileName(canon);
    const linkPath = path.join(TRANS, linkName);
    linkOrCopy(masterPath, linkPath);
    linkCount++;
  }
}

console.log('Hardlinks/Kopien erstellt:', linkCount);
console.log('Eindeutige Kombinationen:', Object.keys(canonToBundle).length);
