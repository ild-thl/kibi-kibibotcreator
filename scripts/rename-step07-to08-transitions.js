/**
 * transitions/08_{privacy}[_{privacy}…].json
 * → from-step-07-sel-privacy-…-to-step-08.json
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'assets', 'wheel-animations', 'transitions');

const TOKEN_TO_SLUG = {
  auf_andere_systeme_zugreifen: 'auf-andere-systeme-zugreifen',
  feedback_an_lehrende_weitergeben: 'feedback-an-lehrende-weitergeben',
  keine_daten_speichern: 'keine-daten-speichern',
  sich_an_gespraeche_erinnern: 'sich-an-gespräche-erinnern'
};
const TOKENS = Object.keys(TOKEN_TO_SLUG).sort(function (a, b) {
  return b.length - a.length;
});

function parse(body) {
  let rest = body;
  const slugs = [];
  while (rest) {
    let matched = false;
    for (const token of TOKENS) {
      if (rest === token) {
        slugs.push(TOKEN_TO_SLUG[token]);
        rest = '';
        matched = true;
        break;
      }
      if (rest.startsWith(token + '_')) {
        slugs.push(TOKEN_TO_SLUG[token]);
        rest = rest.slice(token.length + 1);
        matched = true;
        break;
      }
    }
    if (!matched) throw new Error('unparsed rest=[' + rest + '] in ' + body);
  }
  if (!slugs.length) throw new Error('no privacy in ' + body);
  return slugs;
}

function destName(slugs) {
  return (
    'from-step-07-sel-privacy-' +
    slugs.slice().sort().join('-and-') +
    '-to-step-08.json'
  );
}

let renamed = 0;
const seen = {};
for (const file of fs.readdirSync(DIR).filter(function (f) {
  return f.startsWith('08_') && f.endsWith('.json');
})) {
  const body = file.slice(3, -5);
  const slugs = parse(body);
  const dest = destName(slugs);
  if (seen[dest]) throw new Error('dup ' + dest + ' from ' + file);
  seen[dest] = true;
  const from = path.join(DIR, file);
  const to = path.join(DIR, dest);
  if (fs.existsSync(to)) throw new Error('exists ' + dest);
  fs.renameSync(from, to);
  console.log(file + ' -> ' + dest);
  renamed++;
}

console.log('Fertig:', renamed);
console.log(
  'leftover 08_:',
  fs.readdirSync(DIR).filter(function (f) {
    return f.startsWith('08_');
  })
);
