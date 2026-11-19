/**
 * Einmaliges Skript: 04_{rolle}_{workflow}[_morph_{ziel}].json
 * → sel-role-{rolle}__workflow-{slug}.json
 * → sel-from-role-{rolle}__workflow-{from}-to-role-{rolle}__workflow-{to}.json
 *
 * Slugs entsprechen slugify() der data-option-Werte in index.html.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'assets', 'wheel-animations', 'step-04');

const ROLES = ['experte', 'tutor', 'coach', 'kollege', 'lehrer', 'mentor', 'buddy'];

/** Statische Endzustände (Dateiname → Option-Slug). */
const WORKFLOW_STATIC = {
  direkt_vorschlaege_machen: 'direkt-vorschläge-machen',
  schritt_fuer_schritt_erklaeren: 'schritt-für-schritt-erklären',
  zuerst_fragen_stellen_dann_antworten: 'zuerst-fragen-stellen-und-dann-antworten'
};

/** Morph-Kurzformen in den Quelldateien → Option-Slug. */
const WORKFLOW_MORPH = {
  direkt_vorschlaege_machen: 'direkt-vorschläge-machen',
  schritt_fuer_schritt: 'schritt-für-schritt-erklären',
  zuerst_fragen_dann_antworten: 'zuerst-fragen-stellen-und-dann-antworten'
};

function staticName(role, workflowSlug) {
  return 'sel-role-' + role + '__workflow-' + workflowSlug + '.json';
}

function morphName(role, fromSlug, toSlug) {
  return (
    'sel-from-role-' +
    role +
    '__workflow-' +
    fromSlug +
    '-to-role-' +
    role +
    '__workflow-' +
    toSlug +
    '.json'
  );
}

const plan = [];
const seenFrom = {};

for (const role of ROLES) {
  for (const [key, slug] of Object.entries(WORKFLOW_STATIC)) {
    const from = '04_' + role + '_' + key + '.json';
    plan.push({ from, to: staticName(role, slug) });
  }

  const morphKeys = Object.keys(WORKFLOW_MORPH);
  for (const fromKey of morphKeys) {
    for (const toKey of morphKeys) {
      if (fromKey === toKey) continue;
      const from = '04_' + role + '_' + fromKey + '_morph_' + toKey + '.json';
      plan.push({
        from,
        to: morphName(role, WORKFLOW_MORPH[fromKey], WORKFLOW_MORPH[toKey])
      });
    }
  }
}

let renamed = 0;
let skipped = 0;
for (const { from, to } of plan) {
  if (seenFrom[from]) continue;
  seenFrom[from] = true;
  const src = path.join(DIR, from);
  const dest = path.join(DIR, to);
  if (!fs.existsSync(src)) {
    if (fs.existsSync(dest)) {
      console.log('Bereits umbenannt:', to);
      skipped++;
      continue;
    }
    console.warn('Quelle fehlt (übersprungen):', from);
    skipped++;
    continue;
  }
  if (fs.existsSync(dest)) {
    throw new Error('Ziel existiert bereits: ' + to);
  }
  fs.renameSync(src, dest);
  console.log(from, '→', to);
  renamed++;
}

const leftovers = fs
  .readdirSync(DIR)
  .filter((f) => f.startsWith('04_') && f.endsWith('.json'));
if (leftovers.length) {
  console.warn('\nNicht umbenannt (manuell prüfen):');
  leftovers.forEach((f) => console.warn(' -', f));
}

console.log('\nFertig: umbenannt', renamed, '| übersprungen', skipped);
