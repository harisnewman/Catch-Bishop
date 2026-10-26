// بازی را روی حالت افقی قفل می‌کند (AndroidManifest.xml). چند بار اجرا هم امن است.
const fs = require('fs'), path = require('path');
const f = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (!fs.existsSync(f)) { console.log('پوشهٔ android هنوز ساخته نشده؛ رد شد.'); process.exit(0); }
let s = fs.readFileSync(f, 'utf8');
if (s.includes('android:screenOrientation')) { console.log('manifest قبلاً اصلاح شده بود.'); process.exit(0); }
s = s.replace('<activity', '<activity\n            android:screenOrientation="sensorLandscape"');
fs.writeFileSync(f, s); console.log('AndroidManifest: افقی (sensorLandscape) شد.');
