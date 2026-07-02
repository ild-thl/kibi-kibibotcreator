/**
 * Einmaliges Skript: 03_{rolle}.svg → sel-role-{rolle}.svg
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'assets', 'wheel-animations', 'step-03');

const ROLES = ['experte', 'kollege', 'mentor', 'tutor', 'lehrer', 'buddy', 'coach'];

const plan = ROLES.map((role) => ({
  from: `03_${role}.svg`,
  to: `sel-role-${role}.svg`,
}));

for (const { from, to } of plan) {
  const src = path.join(DIR, from);
  const dest = path.join(DIR, to);
  if (!fs.existsSync(src)) {
    if (fs.existsSync(dest)) {
      console.log('Bereits umbenannt:', to);
      continue;
    }
    throw new Error('Quelle fehlt: ' + from);
  }
  if (fs.existsSync(dest)) {
    throw new Error('Ziel existiert bereits: ' + to);
  }
  fs.renameSync(src, dest);
  console.log(from, '→', to);
}

console.log('Fertig:', plan.length, 'Dateien');
