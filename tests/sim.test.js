// تست فیزیک الاکلنگ و پرتاب (بدون مرورگر): npm test
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'www', 'sim.js'), 'utf8');
const L = new Function(src + ';return {newState,stepWorld,stepBox,tryLaunch,PX,A0,GY,EMIN,EMAX,BOX,plankY};')();
let fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
const rng = seed => { let x = seed; return () => (x = (x * 16807) % 2147483647) / 2147483647; };

function play(seed, mode) {            // هل دادن جعبه، رفتن روی الاکلنگ، پریدن روی سر بالا
  Math.random = rng(seed); const S = L.newState(); let ph = 0, tj = 0, hit = false;
  for (let i = 0; i < 60 * 40 && !hit; i++) {
    const inp = {}, h = S.hero;
    if (ph === 0) { inp.right = true; if (S.box.st === 'placed') ph = 1; }
    else if (ph === 1) { inp.right = true; if (h.x >= L.PX + (mode === 'end' ? 60 : 50) && h.on) ph = mode === 'end' ? 2 : 3; }
    else if (ph === 2) { inp.jump = true; ph = 4; tj = S.t; }
    else if (ph === 4) inp.jump = S.t - tj < .5;
    else if (ph === 3) { inp.right = h.x < L.PX + 110; if (h.x >= L.PX + 110 && h.on) ph = 6; }
    else if (ph === 6) { inp.left = true; if (h.x <= L.PX + 88) { ph = 7; tj = S.t; } }
    else if (ph === 7) { inp.left = S.t - tj < .35; inp.jump = S.t - tj < .35; }
    L.stepWorld(S, 1 / 60, inp); if (S.ev.some(e => e.t === 'hit')) hit = true;
  }
  return hit;
}
for (const m of ['end', 'ground']) for (const sd of [1, 7, 42]) ok(play(sd, m), `بازی کامل (${m}, seed ${sd}) به دشمن می‌خورد`);

function shot(imp, rh, ex) {            // پرتاب مستقیم با قدرت فرود و فاصلهٔ فرود مشخص
  const S = L.newState(); S.box = { st: 'placed', x: 277, y: L.GY - 40, rb: (L.PX - 277) / Math.cos(L.A0), vx: 0, vy: 0, rot: 0, t: 0, spin: 0 };
  S.enemy.x = ex; S.enemy.pause = 99; L.tryLaunch(S, imp, L.PX + rh * Math.cos(L.A0), L.GY - 60);
  if (S.box.st !== 'flying') return 'nolaunch';
  for (let i = 0; i < 6000; i++) { S.ev.length = 0; L.stepBox(S, 1 / 240); if (S.ev.some(e => e.t === 'hit')) return 'hit'; if (S.box.st !== 'flying') return 'miss'; }
  return 'miss';
}
let all = true; for (let ex = L.EMIN; ex <= L.EMAX; ex += 6) for (const rh of [40, 55, 70]) if (shot(285, rh, ex) !== 'hit') all = false;
ok(all, 'فرود قوی روی سر الاکلنگ در همهٔ جاهای دشمن می‌زند');
ok(shot(150, 55, 575) === 'nolaunch', 'فرود خیلی ضعیف جعبه را پرتاب نمی‌کند');
let weak = 0; for (let ex = L.EMIN; ex <= L.EMAX; ex += 6) if (shot(200, 55, ex) === 'hit') weak++;
ok(weak === 0, 'فرود ضعیف کوتاه می‌آید و نمی‌خورد');
process.exit(fail ? 1 : 0);
