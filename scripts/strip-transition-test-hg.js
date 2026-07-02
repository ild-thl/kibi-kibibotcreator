const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'assets', 'wheel-animations', 'transitions');
const files = fs.readdirSync(dir).filter(function (f) {
  return f.indexOf('to-step-') === 0 && f.slice(-5) === '.json';
});

for (var i = 0; i < files.length; i++) {
  var file = files[i];
  var p = path.join(dir, file);
  var data = JSON.parse(fs.readFileSync(p, 'utf8'));
  var before = (data.layers || []).length;
  data.layers = (data.layers || []).filter(function (l) {
    return l.nm !== 'Test Hg Konturen';
  });
  if (data.layers.length < before) {
    fs.writeFileSync(p, JSON.stringify(data));
    console.log('removed Test Hg from', file);
  }
}
