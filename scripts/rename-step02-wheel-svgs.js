/**
 * Einmaliges Skript: 02_*_de|en_*.svg → sel-….{de|en}.svg (Variante A)
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'assets', 'wheel-animations', 'step-02');

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

function buildSelName(parts, locale) {
  const greeting = parts[0];
  const segments = [SEG[greeting]];
  for (let i = 1; i < parts.length; i++) {
    const p = parts[i];
    if (SEG[p]) segments.push(SEG[p]);
  }
  return 'sel-' + segments.join('__') + '.' + locale + '.svg';
}

function parseOldName(file) {
  const m = /^02_(.+)\.svg$/i.exec(file);
  if (!m) return null;
  const tokens = m[1].split('_');
  if (tokens.length < 2) return null;
  const greeting = tokens[0];
  const locale = tokens[1];
  if (!SEG[greeting] || (locale !== 'de' && locale !== 'en')) return null;
  const rest = tokens.slice(2);
  const ordered = [];
  for (const key of ORDER) {
    if (rest.includes(key)) ordered.push(key);
  }
  if (ordered.length !== rest.length) {
    const unknown = rest.filter((r) => !ORDER.includes(r));
    throw new Error(file + ': unbekannte Segmente ' + unknown.join(', '));
  }
  return { greeting, locale, ordered, newName: buildSelName([greeting].concat(ordered), locale) };
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.svg') && f.startsWith('02_'));
const plan = [];
const seen = {};

for (const file of files) {
  const parsed = parseOldName(file);
  if (!parsed) {
    console.warn('Übersprungen:', file);
    continue;
  }
  if (seen[parsed.newName]) {
    throw new Error('Kollision: ' + file + ' und ' + seen[parsed.newName] + ' → ' + parsed.newName);
  }
  seen[parsed.newName] = file;
  plan.push({ from: file, to: parsed.newName });
}

plan.sort((a, b) => a.to.localeCompare(b.to));
console.log('Umbenennen:', plan.length, 'Dateien');

for (const { from, to } of plan) {
  const src = path.join(DIR, from);
  const dest = path.join(DIR, to);
  if (fs.existsSync(dest)) {
    throw new Error('Ziel existiert bereits: ' + to);
  }
  fs.renameSync(src, dest);
}

console.log('Fertig. Beispiele:');
plan.slice(0, 5).forEach(({ from, to }) => console.log(' ', from, '→', to));
