/**
 * 07_{privacy}[_und_{privacy}…].svg
 * → sel-privacy-{slug}[-and-{slug}…].svg (alphabetisch sortiert)
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'assets', 'wheel-animations', 'step-07');

const TOKEN_TO_SLUG = {
  auf_andere_systeme_zugreifen: 'auf-andere-systeme-zugreifen',
  feedback_an_lehrende_weitergeben: 'feedback-an-lehrende-weitergeben',
  keine_daten_speichern: 'keine-daten-speichern',
  sich_an_gespraeche_erinnern: 'sich-an-gespräche-erinnern',
  sich_an_Gespraeche_erinnern: 'sich-an-gespräche-erinnern'
};

function parse(body) {
  const parts = body.split('_und_');
  const slugs = [];
  for (const part of parts) {
    if (!TOKEN_TO_SLUG[part]) throw new Error('unknown token: ' + part + ' in ' + body);
    slugs.push(TOKEN_TO_SLUG[part]);
  }
  return slugs;
}

function destName(slugs) {
  const unique = [];
  const seen = {};
  for (const s of slugs) {
    if (seen[s]) continue;
    seen[s] = true;
    unique.push(s);
  }
  return 'sel-privacy-' + unique.slice().sort().join('-and-') + '.svg';
}

let renamed = 0;
const seenDest = {};
for (const file of fs.readdirSync(DIR).filter(function (f) {
  return f.startsWith('07_') && f.endsWith('.svg');
})) {
  const body = file.slice(3, -4);
  const slugs = parse(body);
  const dest = destName(slugs);
  if (seenDest[dest]) throw new Error('dup ' + dest + ' from ' + file);
  seenDest[dest] = true;
  const from = path.join(DIR, file);
  const to = path.join(DIR, dest);
  if (fs.existsSync(to)) throw new Error('exists ' + dest);
  fs.renameSync(from, to);
  console.log(file + ' -> ' + dest);
  renamed++;
}

console.log('Fertig:', renamed);
console.log(
  'leftover 07_:',
  fs.readdirSync(DIR).filter(function (f) {
    return f.startsWith('07_');
  })
);
console.log(
  'sel-privacy:',
  fs.readdirSync(DIR).filter(function (f) {
    return f.startsWith('sel-privacy-');
  })
);
