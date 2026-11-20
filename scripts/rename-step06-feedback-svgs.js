/**
 * 06_{feedback}[_und_{feedback}…].svg
 * → sel-feedback-{slug}[-and-{slug}…].svg (alphabetisch sortiert)
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'assets', 'wheel-animations', 'step-06');

const TOKEN_TO_SLUG = {
  fehler_freundlich_erklaeren: 'fehler-freundlich-erklären',
  unsicherheit_offen_zeigen: 'unsicherheit-offen-zeigen',
  mit_uebungen_helfen: 'mit-übungen-helfen'
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
  return 'sel-feedback-' + slugs.slice().sort().join('-and-') + '.svg';
}

let renamed = 0;
for (const file of fs.readdirSync(DIR).filter(function (f) {
  return f.startsWith('06_') && f.endsWith('.svg');
})) {
  const body = file.slice(3, -4);
  const slugs = parse(body);
  const dest = destName(slugs);
  const from = path.join(DIR, file);
  const to = path.join(DIR, dest);
  if (fs.existsSync(to)) throw new Error('exists ' + dest);
  fs.renameSync(from, to);
  console.log(file + ' -> ' + dest);
  renamed++;
}

console.log('Fertig:', renamed);
console.log(
  'leftover 06_:',
  fs.readdirSync(DIR).filter(function (f) {
    return f.startsWith('06_');
  })
);
console.log(
  'sel-feedback:',
  fs.readdirSync(DIR).filter(function (f) {
    return f.startsWith('sel-feedback-');
  })
);
