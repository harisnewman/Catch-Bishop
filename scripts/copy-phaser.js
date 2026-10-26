// Phaser را از node_modules داخل www کپی می‌کند (برنامه باید بدون اینترنت هم اجرا شود)
const fs = require('fs'), path = require('path');
const src = path.join(__dirname, '..', 'node_modules', 'phaser', 'dist', 'phaser.min.js');
const dst = path.join(__dirname, '..', 'www', 'phaser.min.js');
if (!fs.existsSync(src)) { console.error('phaser پیدا نشد. اول «npm install» را اجرا کن.'); process.exit(1); }
fs.copyFileSync(src, dst); console.log('phaser.min.js copied to www/');
