// پروژهٔ اندروید را در صورت نبودن می‌سازد، سپس فایل‌های www را همگام می‌کند.
// چند بار اجرا هم امن است (روی کامپیوتر خودت و روی GitHub Actions).
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const run = cmd => execSync(cmd, { stdio: 'inherit', cwd: root });
run('node scripts/copy-phaser.js');
if (!fs.existsSync(path.join(root, 'android'))) run('npx cap add android');
else console.log('پوشهٔ android از قبل هست؛ فقط همگام‌سازی می‌شود.');
run('node scripts/patch-android.js');
run('npx cap sync android');
