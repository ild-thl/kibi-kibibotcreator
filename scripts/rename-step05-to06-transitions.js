/**
 * 06_{sources}_{knowledge}_{decision}.json
 * → transitions/from-step-05-sel-knowledge-…__knowledge_source-…__decision-…-to-step-06.json
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'assets', 'wheel-animations', 'step-06');
const destDir = path.join(__dirname, '..', 'assets', 'wheel-animations', 'transitions');

const DECISIONS = [
  ['trifft_keine_entscheidung', 'trifft-keine-entscheidungen'],
  ['trifft_entscheidungen', 'trifft-entscheidungen'],
  ['gibt_empfehlungen', 'gibt-empfehlungen']
];
const SOURCES = [
  ['allgemeines wissen', 'allgemeines-wissen'],
  ['allgemeinwissen', 'allgemeines-wissen'],
  ['studiengangswissen', 'studiengangswissen']
];
const KNOWLEDGE = [
  ['lernfortschritt', 'lernfortschritt'],
  ['modulplan', 'modulplan'],
  ['studiengang', 'studiengang']
];

function parse(body) {
  let rest = body;
  let decision = null;
  for (const [key, slug] of DECISIONS) {
    if (rest === key) {
      decision = slug;
      rest = '';
      break;
    }
    if (rest.endsWith('_' + key)) {
      decision = slug;
      rest = rest.slice(0, -(key.length + 1));
      break;
    }
  }
  if (!decision) throw new Error('no decision in ' + body);

  const sources = [];
  let changed = true;
  while (changed && rest) {
    changed = false;
    for (const [key, slug] of SOURCES) {
      if (rest === key) {
        sources.push(slug);
        rest = '';
        changed = true;
        break;
      }
      if (rest.startsWith(key + '_')) {
        sources.push(slug);
        rest = rest.slice(key.length + 1);
        changed = true;
        break;
      }
    }
  }

  const knowledge = [];
  changed = true;
  while (changed && rest) {
    changed = false;
    const ordered = KNOWLEDGE.slice().sort(function (a, b) {
      return b[0].length - a[0].length;
    });
    for (const [key, slug] of ordered) {
      if (rest === key) {
        knowledge.push(slug);
        rest = '';
        changed = true;
        break;
      }
      if (rest.startsWith(key + '_')) {
        knowledge.push(slug);
        rest = rest.slice(key.length + 1);
        changed = true;
        break;
      }
    }
  }

  if (rest) throw new Error('unparsed rest=[' + rest + '] in ' + body);
  if (!sources.length) throw new Error('no sources in ' + body);
  if (!knowledge.length) throw new Error('no knowledge in ' + body);
  return { decision: decision, sources: sources, knowledge: knowledge };
}

function destName(p) {
  const parts = [
    'knowledge-' + p.knowledge.slice().sort().join('-and-'),
    'knowledge_source-' + p.sources.slice().sort().join('-and-'),
    'decision-' + p.decision
  ];
  return 'from-step-05-sel-' + parts.join('__') + '-to-step-06.json';
}

const files = fs.readdirSync(srcDir).filter(function (f) {
  return f.startsWith('06_') && f.endsWith('.json');
});

let renamed = 0;
let skipped = 0;
const seen = {};
for (const file of files) {
  const body = file.slice(3, -5);
  const p = parse(body);
  const dest = destName(p);
  const from = path.join(srcDir, file);
  const to = path.join(destDir, dest);
  if (seen[dest] || fs.existsSync(to)) {
    console.warn('Duplikat übersprungen (Ziel existiert):', file, '->', dest);
    fs.unlinkSync(from);
    skipped++;
    continue;
  }
  seen[dest] = true;
  fs.renameSync(from, to);
  console.log(file + ' -> ' + dest);
  renamed++;
}

console.log('Fertig: umbenannt', renamed, '| Duplikate entfernt', skipped);
const leftover = fs.readdirSync(srcDir).filter(function (f) {
  return f.endsWith('.json');
});
if (leftover.length) console.warn('Leftover:', leftover);
console.log(
  'from-step-05 Dateien:',
  fs.readdirSync(destDir).filter(function (f) {
    return f.startsWith('from-step-05-') && f.endsWith('.json');
  }).length
);
