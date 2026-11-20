/**
 * 07_{feedback}[_{feedback}…].json
 * → transitions/from-step-06-sel-feedback-…-to-step-07.json
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'assets', 'wheel-animations', 'step-07');
const destDir = path.join(__dirname, '..', 'assets', 'wheel-animations', 'transitions');

const TOKEN_TO_SLUG = {
  fehler_freundlich_erklaeren: 'fehler-freundlich-erklären',
  unsicherheit_offen_zeigen: 'unsicherheit-offen-zeigen',
  mit_uebungen_helfen: 'mit-übungen-helfen'
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
  if (!slugs.length) throw new Error('no feedback in ' + body);
  return slugs;
}

function destName(slugs) {
  return (
    'from-step-06-sel-feedback-' +
    slugs.slice().sort().join('-and-') +
    '-to-step-07.json'
  );
}

let renamed = 0;
const seen = {};
for (const file of fs.readdirSync(srcDir).filter(function (f) {
  return f.startsWith('07_') && f.endsWith('.json');
})) {
  const body = file.slice(3, -5);
  const slugs = parse(body);
  const dest = destName(slugs);
  if (seen[dest]) throw new Error('dup ' + dest + ' from ' + file);
  seen[dest] = true;
  const from = path.join(srcDir, file);
  const to = path.join(destDir, dest);
  if (fs.existsSync(to)) throw new Error('exists ' + dest);
  fs.renameSync(from, to);
  console.log(file + ' -> ' + dest);
  renamed++;
}

console.log('Fertig:', renamed);
console.log(
  'leftover step-07 json:',
  fs.readdirSync(srcDir).filter(function (f) {
    return f.endsWith('.json');
  })
);
