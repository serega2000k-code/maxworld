const fs = require('fs');
const path = require('path');
const source = path.join(__dirname, '..', 'node_modules', 'three', 'build', 'three.min.js');
const target = path.join(__dirname, '..', 'public', 'engine', 'three.min.js');
if (!fs.existsSync(source)) {
  console.error('Three.js dependency is missing. Run npm install first.');
  process.exit(1);
}
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.copyFileSync(source, target);
console.log('Offline 3D engine prepared:', target);
