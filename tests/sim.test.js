// تست فیزیک (بدون مرورگر): npm test
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'www', 'sim.js'), 'utf8');
const L = new Function(src + ';return {newState,stepWorld,stepBox,tryLaunch,PX,A0,GY,EMIN,EMAX,BOX,plankY};')();
let fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
const rng = seed => { let x = seed; return () => (x = (x * 16807) % 2147483647) / 2147483647; };

// بازی طبیعی: جعبه را به الاکلنگ هل بده، از رویش بپر، روی سر بالا فرود بیا
function play(seed, boxTarget) {
  Math.random = rng(seed); const S = L.newState(); let ph = 0, tj = 0;
  for (let i = 0; i < 60 * 30; i++) {
    const inp = {};
    if (ph === 0) { inp.right = true; if (S.box.st === 'ground' && S.box.x >= boxTarget) ph = 1; }
    else if (ph === 1) { inp.right = true; inp.jump = true; ph = 2; tj = S.t; }
    else inp.right = true, inp.jump = S.t - tj < .6;
    L.stepWorld(S, 1 / 60, inp);
    for (const e of S.ev) { if (e.t === 'hit') return 'hit'; if (e.t === 'miss') return 'miss'; }
  }
  return 'none';
}
for (const bx of [250, 258, 266, 274]) ok(play(1, bx) === 'hit', `بازی طبیعی با جعبه در x=${bx} به دشمن می‌خورد`);
ok(play(1, 300) === 'none', 'جعبه‌ای که از الاکلنگ رد شده، پرتاب نمی‌شود');

// جعبه آزاد است: روی زمین جلو و عقب می‌رود
(function () {
  Math.random = rng(3); const S = L.newState(); const x0 = S.box.x;
  for (let i = 0; i < 60; i++) L.stepWorld(S, 1 / 60, { right: true });
  const x1 = S.box.x; for (let i = 0; i < 400; i++) L.stepWorld(S, 1 / 60, { left: true });
  ok(x1 > x0, 'هل دادن جعبه به راست'); ok(S.hero.x < x1, 'قهرمان برگشت');
})();

function shot(imp, ex) {   // پرتاب مستقیم: جعبه روی بازوی چپ الاکلنگ، فرود روی انتهای بازوی راست
  const S = L.newState(); S.box = { st: 'ground', x: 280, y: L.plankY(L.A0, 280), vx: 0, vy: 0, rot: 0, rb: 0, t: 0, spin: 0 };
  S.enemy.x = ex; S.hero.x = L.PX + 55; L.tryLaunch(S, imp, S.hero.x, L.GY - 60);
  if (S.box.st !== 'flying') return 'nolaunch';
  for (let i = 0; i < 6000; i++) { S.ev.length = 0; L.stepBox(S, 1 / 240); if (S.ev.some(e => e.t === 'hit')) return 'hit'; if (S.box.st !== 'flying') return 'miss'; }
  return 'miss';
}
let all = true; for (let ex = L.EMIN; ex <= L.EMAX; ex += 6) if (shot(285, ex) !== 'hit') all = false;
ok(all, 'فرود قوی در همهٔ جاهای دشمن می‌زند');
ok(shot(150, 575) === 'nolaunch', 'فرود خیلی ضعیف جعبه را پرتاب نمی‌کند');
let weak = 0; for (let ex = L.EMIN; ex <= L.EMAX; ex += 6) if (shot(200, ex) === 'hit') weak++;
ok(weak === 0, 'فرود ضعیف کوتاه می‌آید');
process.exit(fail ? 1 : 0);
