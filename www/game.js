/* ============ صدا (WebAudio، بدون فایل) ============ */
const AC = {ctx:null, mute:false, out:null, nb:null};
function ac(){
  if(!AC.ctx){ try{
    const c = new (window.AudioContext||window.webkitAudioContext)(); AC.ctx = c; AC.out = c.createGain(); AC.out.gain.value = .9; AC.out.connect(c.destination);
    const n = c.createBuffer(1,c.sampleRate,c.sampleRate), d = n.getChannelData(0); for(let i=0;i<d.length;i++) d[i] = Math.random()*2-1; AC.nb = n;
  }catch(e){} }
  if(AC.ctx && AC.ctx.state === 'suspended') AC.ctx.resume(); return AC.ctx;
}
function tone(f,d,type='square',v=.07,slide=0,t0=0,vib=0){
  const c = ac(); if(!c || AC.mute) return; const t = c.currentTime+t0, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f,t); if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+d);
  if(vib){ const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 6; lg.gain.value = vib; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t+d); }
  g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+d); o.connect(g); g.connect(AC.out); o.start(t); o.stop(t+d);
}
function noise(d,v=.1,f0=2000,f1=0,type='lowpass',t0=0){
  const c = ac(); if(!c || AC.mute) return; const t = c.currentTime+t0, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
  s.buffer = AC.nb; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(f0,t); if(f1) fl.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+d);
  g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+d); s.connect(fl); fl.connect(g); g.connect(AC.out); s.start(t); s.stop(t+d);
}
const SFX = {
  jump:()=>tone(280,.2,'square',.05,420), land:()=>{tone(110,.1,'triangle',.12,-50); noise(.08,.05,500)}, step:()=>noise(.04,.035,900),
  scrape:()=>noise(.12,.05,380,0,'bandpass'),
  launch:()=>{tone(160,.32,'sine',.16,620,0,25); noise(.5,.09,400,3500,'bandpass',.05)},
  hit:()=>{noise(.12,.18,6000,0,'highpass'); noise(.9,.3,2600,70); tone(90,.7,'sine',.35,-60)},
  ghost:()=>tone(260,1.8,'sine',.09,520,.1,18), thud:()=>{tone(90,.15,'triangle',.18,-40); noise(.1,.08,300)},
  miss:()=>[392,330,262].forEach((f,i)=>tone(f,.28,'triangle',.1,-20,i*.2)), newbox:()=>noise(.5,.06,3000,300,'bandpass'),
  win:()=>[523,659,784,1047,1319].forEach((f,i)=>tone(f,.28,'triangle',.12,0,i*.12)), wall:()=>tone(140,.1,'square',.06,-40),
  chirp:()=>{tone(3400,.07,'sine',.018,700); tone(3900,.08,'sine',.018,-600,.09)}, start:()=>[392,523].forEach((f,i)=>tone(f,.16,'triangle',.1,0,i*.1)),
  tell:()=>tone(300,.3,'sine',.05,120), throw:()=>noise(.35,.07,500,2500,'bandpass'), ropeland:()=>{noise(.08,.07,700); tone(120,.1,'triangle',.08,-40)},
  death:()=>{[330,262,208,165].forEach((f,i)=>tone(f,.3,'triangle',.11,-25,i*.18)); noise(.4,.08,2000,200)}
};
let mus = null;
function startMusic(){   // موسیقی = فایل اذان (www/adhan.mp3)؛ اگر فایل نباشد ساکت می‌ماند
  if(mus) return; mus = 'loading';
  fetch('adhan.mp3').then(r => { if(!r.ok) throw 0; return r.arrayBuffer(); })
    .then(b => new Promise((res,rej) => ac().decodeAudioData(b,res,rej)))
    .then(buf => { const c = ac(), src = c.createBufferSource(), g = c.createGain(); src.buffer = buf; src.loop = true; g.gain.value = AC.mute ? 0 : .6; src.connect(g); g.connect(AC.out); src.start(); AC.mg = g; mus = 'file'; })
    .catch(() => { mus = 'none'; });
}
function toggleMute(){ AC.mute = !AC.mute; if(AC.mg) AC.mg.gain.value = AC.mute ? 0 : .6; document.getElementById('mute').textContent = AC.mute ? '🔇' : '🔊'; }

/* ============ رسم اشیای ساده با بوم ============ */
const OUT = '#2a1630';
function mkcv(w,h){ const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.lineJoin = x.lineCap = 'round'; return [c,x]; }
function addTex(sc,key,c){ if(sc.textures.exists(key)) sc.textures.remove(key); sc.textures.addCanvas(key,c); }
function makeTex(sc){
  let [c,x] = mkcv(144,144); x.lineWidth = 10; x.strokeStyle = OUT; x.fillStyle = '#d49a54'; x.beginPath(); x.moveTo(20,8); x.arcTo(136,8,136,136,12); x.arcTo(136,136,8,136,12); x.arcTo(8,136,8,8,12); x.arcTo(8,8,136,8,12); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = '#b87a38'; [40,72,104].forEach(y => x.fillRect(16,y,112,6)); x.strokeStyle = '#8a5424'; x.lineWidth = 8; x.beginPath(); x.moveTo(20,20); x.lineTo(124,124); x.moveTo(124,20); x.lineTo(20,124); x.stroke(); addTex(sc,'box',c);
  [['dotW','#ffffff'],['dotC','#fff4e0'],['dotY','#ffe14d'],['dotO','#ff9b2f'],['dotR','#ff5a2a'],['dotK','#3a3a44'],['dotG','#8a8a99']].forEach(([k,col]) => { const [cc,xx] = mkcv(8,8); xx.fillStyle = col; xx.beginPath(); xx.arc(4,4,4,0,7); xx.fill(); addTex(sc,k,cc); });
  [['bL','◀'],['bR','▶'],['bJ','▲']].forEach(([k,t]) => { const [cc,xx] = mkcv(144,144); xx.lineWidth = 9; xx.strokeStyle = OUT; xx.fillStyle = '#fff4e0'; xx.beginPath(); xx.arc(72,72,62,0,7); xx.fill(); xx.stroke(); xx.fillStyle = OUT; xx.font = '52px sans-serif'; xx.textAlign = 'center'; xx.textBaseline = 'middle'; xx.fillText(t,72,76); addTex(sc,k,cc); });
  [[170,70],[210,80],[150,62]].forEach(([w,h],i) => { const [cc,xx] = mkcv(w*2,h*2); xx.scale(2,2); xx.fillStyle = '#fff';
    xx.beginPath(); xx.ellipse(w*.3,h*.62,w*.22,h*.3,0,0,7); xx.ellipse(w*.5,h*.45,w*.24,h*.38,0,0,7); xx.ellipse(w*.7,h*.6,w*.22,h*.3,0,0,7); xx.rect(w*.12,h*.6,w*.76,h*.3); xx.fill();
    xx.fillStyle = 'rgba(150,190,235,.35)'; xx.fillRect(w*.12,h*.78,w*.76,h*.12); addTex(sc,'cloud'+i,cc); });
  const [sk,sx] = mkcv(4,360); const g = sx.createLinearGradient(0,0,0,300); g.addColorStop(0,'#3d9be9'); g.addColorStop(1,'#bfe7ff'); sx.fillStyle = g; sx.fillRect(0,0,4,360); addTex(sc,'sky',sk);
  const [bm,bx] = mkcv(320,140); bx.font = '900 96px Impact, "Arial Black", sans-serif'; bx.textAlign = 'center'; bx.textBaseline = 'middle'; bx.lineWidth = 16; bx.strokeStyle = '#7a1d0c'; bx.strokeText('BOOM!',160,72); bx.fillStyle = '#ffd23f'; bx.fillText('BOOM!',160,72); addTex(sc,'boomtxt',bm);
}

/* ============ اسکلت (تکه‌ها) ============ */
function buildRig(sc,key,H){
  const R = RIGS[key], nodes = {};
  const mk = nm => { const p = R.parts[nm], c = sc.add.container(p.pos[0],p.pos[1]); c.add(sc.add.image(0,0,key+'_'+nm).setOrigin(p.pv[0]/p.w,p.pv[1]/p.h)); p.ch.forEach(ch => c.add(mk(ch))); nodes[nm] = c; return c; };
  const lower = R.lower.map(mk), upper = R.upper.map(mk), up = sc.add.container(0,0,upper), inner = sc.add.container(0,0,[...lower,up]), outer = sc.add.container(0,0,[inner]);
  const cb = (nm,off) => { const q = R.parts[nm], y = off+q.pos[1]; let m = y+(q.h-q.pv[1]); q.ch.forEach(c2 => { m = Math.max(m,cb(c2,y)); }); return m; };
  const bottom = Math.max(...R.lower.map(n0 => cb(n0,0))), top = Math.min(...R.upper.map(n0 => R.parts[n0].pos[1]-R.parts[n0].pv[1]));
  inner.y = -bottom; outer.setScale(H/(bottom-top));
  return {outer,inner,up,n:nodes,cur:{}};
}
function ease(r,T){ const q = r.cur; for(const k in T){ if(q[k] === undefined) q[k] = T[k]; q[k] += (T[k]-q[k])*.3; } return q; }
function animK(r,t,st,vy){
  const ph = t*(st==='push'?.011:.014), s = Math.sin(ph); let T;
  if(st === 'walk') T = {lean:.06+s*.035,legL:.28*s,legR:-.28*s,by:-Math.abs(s)*1.8};
  else if(st === 'push') T = {lean:.16,legL:.2*s,legR:-.2*s,by:-Math.abs(s)*1.0};
  else if(st === 'air') T = vy < 0 ? {lean:.05,legL:.3,legR:-.18,by:0} : {lean:.02,legL:.12,legR:-.12,by:0};
  else { const b = Math.sin(t*.004); T = {lean:0,legL:0,legR:0,by:b*.8}; }
  const q = ease(r,T); r.n.legL.rotation = q.legL; r.n.legR.rotation = q.legR; r.up.rotation = q.lean; r.up.y = q.by;
}
function animE(r,t,tell){
  const ph = t*.010, s = Math.sin(ph);
  const T = tell ? {lean:-.12,legL:0,legR:0,by:0} : {lean:.02+s*.02,legL:.25*s,legR:-.25*s,by:-Math.abs(s)*1.2};
  const q = ease(r,T); r.n.legL.rotation = q.legL; r.n.legR.rotation = q.legR; r.up.rotation = q.lean; r.up.y = q.by;   // دست‌ها ثابت‌اند
}

/* ============ بازی ============ */
let game, sc, S, started = false, L = false, R = false, J = false, acc = 0, cursors, keys, won = false, T;
const IMG = {};
function loadArt(){ return Promise.all(Object.entries(ART).map(([k,src]) => new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.onerror = r; i.src = src; }))); }

function _create(){
  sc = this; S = newState(); won = false; acc = 0; T = {};
  Object.keys(IMG).forEach(k => { if(!this.textures.exists(k)) this.textures.addImage(k,IMG[k]); });
  makeTex(this);
  this.cameras.main.setZoom(2).centerOn(320,180);
  this.input.addPointer(2); cursors = this.input.keyboard.createCursorKeys();
  keys = this.input.keyboard.addKeys('W,A,D,SPACE');

  this.add.image(0,0,'sky').setOrigin(0).setDisplaySize(640,360).setDepth(0);
  // ابرها
  T.clouds = [[60,45,0,.9,7],[250,110,1,1.1,5],[430,60,2,.8,10],[560,150,0,.7,6],[130,170,2,.6,8]].map(([x,y,v,s,sp]) => ({im:this.add.image(x,y,'cloud'+v).setScale(s).setDepth(1).setAlpha(.96),x,y,s,sp}));
  // زمین
  const g = this.add.graphics().setDepth(2);
  g.fillStyle(0x8a5a3c).fillRect(0,GY,640,60); g.fillStyle(0x70472d).fillRect(0,GY+26,640,34);
  g.fillStyle(0x7fcf5e).fillRect(0,GY-2,640,12); g.fillStyle(0x5eaa44); for(let x=0;x<640;x+=14) g.fillTriangle(x,GY+10,x+7,GY+10,x+3,GY+17);
  g.lineStyle(3,0x2a1630).lineBetween(0,GY-2,640,GY-2);
  // ساختمان
  T.bld = this.add.image(640,GY+6,'bld').setOrigin(1,1).setScale(235/420).setDepth(3);
  // الاکلنگ
  const fg = this.add.graphics().setDepth(4); fg.fillStyle(0x8e8fa6).fillTriangle(PX-26,GY,PX+26,GY,PX,GY-HP+4); fg.lineStyle(3,0x2a1630).strokeTriangle(PX-26,GY,PX+26,GY,PX,GY-HP+4);
  T.plank = this.add.container(PX,GY-HP).setDepth(5); const pg = this.add.graphics();
  pg.fillStyle(0xc98b4a).fillRoundedRect(-ARM_L,0,ARM_L+ARM_R,10,3); pg.lineStyle(3,0x2a1630).strokeRoundedRect(-ARM_L,0,ARM_L+ARM_R,10,3);
  pg.fillStyle(0xa86f35); [-60,-20,20,50].forEach(x => pg.fillRect(x,3,12,2)); T.plank.add(pg);
  // دشمن و قهرمان
  T.enemy = buildRig(this,'F',58); T.enemy.outer.setDepth(6);
  T.hero = buildRig(this,'K',56); T.hero.outer.setDepth(8);
  T.box = this.add.image(0,0,'box').setScale(28/144).setDepth(7);
  T.ropeG = this.add.graphics().setDepth(13);
  T.kghost = this.add.image(0,0,'ghost').setScale(64/240).setDepth(9).setVisible(false);
  T.ghost = this.add.image(0,0,'ghost').setScale(64/240).setDepth(9).setVisible(false);
  T.dust = this.add.particles(0,0,'dotC',{lifespan:400,speed:{min:20,max:70},angle:{min:200,max:340},scale:{start:.9,end:0},alpha:{start:.8,end:0},emitting:false}).setDepth(9);
  T.booms = ['dotY','dotO','dotR','dotW','dotK'].map(k => this.add.particles(0,0,k,{lifespan:{min:500,max:1100},speed:{min:80,max:340},angle:{min:0,max:360},gravityY:260,scale:{start:2,end:0},emitting:false}).setDepth(12));
  T.smoke = this.add.particles(0,0,'dotG',{lifespan:1200,speed:{min:10,max:50},angle:{min:240,max:300},scale:{start:3,end:7},alpha:{start:.45,end:0},emitting:false}).setDepth(11);
  // پرنده
  const bd = this.add.container(0,0).setDepth(4); const bg = this.add.graphics(); bg.fillStyle(0x2a1630).fillEllipse(0,0,9,6).fillTriangle(-4,0,-9,-2,-9,2).fillCircle(4,-2,2.5); bg.fillStyle(0xffb020).fillTriangle(6,-2,9,-1,6,0);
  const wing = this.add.graphics().lineStyle(2,0x2a1630).lineBetween(0,0,0,-7).lineBetween(0,0,-3,-6); bd.add([bg,wing]);
  T.bird = {c:bd,wing,st:'perch',cl:T.clouds[1],off:10,tm:3,u:0,D:1,p0:[0,0],w:[0,0],dir:1};
  // دکمه‌ها
  const btn = (x,k,set) => { const b = this.add.image(x,331,k).setDepth(20).setAlpha(.9).setScale(.74).setInteractive();
    b.on('pointerdown',() => { set(true); b.setScale(.66); }); const up = () => { set(false); b.setScale(.74); }; b.on('pointerup',up); b.on('pointerout',up); b.on('pointerupoutside',up); };
  btn(44,'bL',v => L = v); btn(108,'bR',v => R = v); btn(596,'bJ',v => J = v);
  T.stepT = 0;
}
function dust(x,y,n=6){ T.dust.emitParticleAt(x,y,n); }

function onEv(e){
  const h = S.hero;
  if(e.t === 'jump'){ SFX.jump(); dust(h.x,h.y); }
  else if(e.t === 'land'){ if(e.imp > 220){ SFX.land(); dust(h.x,h.y,7); } }
  else if(e.t === 'launch'){ SFX.launch(); sc.cameras.main.shake(140,.007); sc.tweens.add({targets:T.plank,scaleY:1.15,duration:70,yoyo:true}); }
  else if(e.t === 'hit') boom(e.x,e.y);
  else if(e.t === 'miss'){ SFX.miss(); }
  else if(e.t === 'thud'){ SFX.thud(); dust(S.box.x,GY,5); }
  else if(e.t === 'newbox') SFX.newbox();
  else if(e.t === 'tell') SFX.tell();
  else if(e.t === 'throw') SFX.throw();
  else if(e.t === 'ropeland'){ SFX.ropeland(); dust(e.x,GY,4); }
  else if(e.t === 'death') onDeath(e.x,e.y);
  else if(e.t === 'wall') SFX.wall();
}
function boom(x,y){
  SFX.hit(); sc.cameras.main.shake(380,.02);
  const f = sc.add.circle(x,y,18,0xffffff,1).setDepth(13); sc.tweens.add({targets:f,scale:6,alpha:0,duration:320,onComplete:() => f.destroy()});
  const r = sc.add.circle(x,y,12).setStrokeStyle(5,0xffd23f).setDepth(13); sc.tweens.add({targets:r,scale:9,alpha:0,duration:520,onComplete:() => r.destroy()});
  T.booms.forEach(p => p.emitParticleAt(x,y,14)); T.smoke.emitParticleAt(x,y,14);
  const tx = sc.add.image(x,y-30,'boomtxt').setDepth(14).setScale(.08).setAngle(-8);
  sc.tweens.add({targets:tx,scale:.34,duration:220,ease:'Back.easeOut'}); sc.tweens.add({targets:tx,alpha:0,y:y-70,delay:700,duration:500,onComplete:() => tx.destroy()});
  T.enemy.outer.setVisible(false);
  sc.time.delayedCall(260,() => ghostFly(x,y));
}
function ghostFly(x,y){
  SFX.ghost(); const gh = T.ghost.setVisible(true).setPosition(x,y).setAlpha(0).setScale(.1); T.gx = x; T.gy = y; T.gt = 0;
  sc.tweens.add({targets:gh,alpha:1,scale:64/240,duration:350,ease:'Back.easeOut'});
  T.gAct = true; sc.time.delayedCall(3600,() => { if(!won){ won = true; SFX.win(); showWin(); } });
}
function onDeath(x,y){
  SFX.death(); sc.cameras.main.shake(200,.01); T.smoke.emitParticleAt(x,y-20,10); T.hero.outer.setVisible(false);
  const g = T.kghost.setVisible(true).setPosition(x,y-30).setAlpha(0).setScale(.1); T.kx = x; T.ky = y-30; T.kt = 0; T.kAct = true;
  sc.tweens.add({targets:g,alpha:1,scale:64/240,duration:350,ease:'Back.easeOut'});
  sc.time.delayedCall(2800,() => toStart());
}
function showWin(){ show(`<div class="sub">LEVEL 1 COMPLETE 🎉</div><p class="tag">👻</p><button class="big" onclick="toStart()">↻ PLAY AGAIN</button>`); }

function _update(t,dt){
  const sec = dt/1000;
  // ورودی و شبیه‌سازی
  const k = keys, inp = started && !won ? {left:L||cursors.left.isDown||k.A.isDown, right:R||cursors.right.isDown||k.D.isDown, jump:J||cursors.up.isDown||k.W.isDown||k.SPACE.isDown} : {};
  S.active = started && !won;
  acc += Math.min(sec,.05);
  while(acc >= 1/120){ stepWorld(S,1/120,inp); S.ev.forEach(onEv); acc -= 1/120; }
  const h = S.hero, e = S.enemy, b = S.box, p = S.plank;
  // قهرمان
  const mv = (inp.left || inp.right) && h.on;
  const st = !h.on ? 'air' : (S.pushing ? 'push' : (mv ? 'walk' : 'idle'));
  T.hero.outer.setPosition(h.x,h.y); T.hero.inner.scaleX = h.face; animK(T.hero,t,st,h.vy);
  if(mv){ T.stepT += dt; if(T.stepT > 240){ T.stepT = 0; if(S.pushing) SFX.scrape(); else SFX.step(); } }
  // الاکلنگ و جعبه
  T.plank.rotation = -p.a;
  if(b.st === 'gone') T.box.setVisible(false);
  else {
    T.box.setVisible(true);
    if(b.st === 'ground'){
      if(b.y < GY-1 && plankSurf(S,b.x) < GY+500) T.box.setPosition(b.x-Math.sin(p.a)*14,plankY(p.a,b.x)-Math.cos(p.a)*14).setRotation(-p.a);
      else T.box.setPosition(b.x,b.y-14).setRotation(0);
    }
    else if(b.st === 'falling'){ T.box.setPosition(b.x,b.y-14).setRotation(0); }
    else T.box.setPosition(b.x,b.y).setRotation(b.rot);
  }
  // دشمن
  if(e.alive){
    T.enemy.outer.setPosition(e.x,ROOF+2); T.enemy.inner.scaleX = e.dir; animE(T.enemy,t,S.tellT >= 0);
  }
  // روح
  if(T.gAct){ T.gt += sec; const u = T.gt/3.4; T.ghost.setPosition(T.gx-u*u*260+Math.sin(T.gt*4)*14,T.gy-u*210-Math.sin(T.gt*2)*4).setRotation(Math.sin(T.gt*4)*.12);
    if(u > .7) T.ghost.setAlpha(Math.max(0,1-(u-.7)/.3)); }
  // کاوهٔ روح‌شده
  if(T.kAct){ T.kt += sec; T.kghost.setPosition(T.kx+Math.sin(T.kt*4)*10,T.ky-T.kt*55).setRotation(Math.sin(T.kt*4)*.12); }
  // طناب‌ها
  const rg = T.ropeG.clear();
  S.ropes.forEach(r => {
    const path = () => { rg.beginPath(); r.trail.forEach((q,i) => i ? rg.lineTo(q[0],q[1]) : rg.moveTo(q[0],q[1])); rg.lineTo(r.x,r.y); rg.strokePath(); };
    rg.lineStyle(5,0x2a1630); path(); rg.lineStyle(3,0xc9a063); path();
    rg.lineStyle(5,0x2a1630); rg.strokeCircle(r.x,r.y+6,7); rg.lineStyle(3,0xc9a063); rg.strokeCircle(r.x,r.y+6,7);
  });
  // ابرها
  T.clouds.forEach(c => { c.x += c.sp*sec; if(c.x > 740) c.x = -110; c.im.setPosition(c.x,c.y); });
  birdUpdate(sec,t);
}
function birdUpdate(sec,t){
  const B = T.bird, c = B.c;
  const land = cl => [cl.x+B.off*cl.s, cl.y-24*cl.s];
  if(B.st === 'perch'){ const [x,y] = land(B.cl); c.setPosition(x,y+Math.sin(t*.003)*.4); B.wing.setRotation(0); B.tm -= sec;
    if(B.tm <= 0){ B.st = 'out'; B.u = 0; B.D = 2.8; B.p0 = [c.x,c.y]; B.w = [60+Math.random()*480,12+Math.random()*100]; B.dir = B.w[0] > c.x ? 1 : -1; SFX.chirp(); } }
  else {
    B.u += sec/B.D; const u = Math.min(1,B.u); let tx,ty;
    if(B.st === 'out'){ const q = u*u*(3-2*u); tx = B.p0[0]+(B.w[0]-B.p0[0])*q+Math.sin(u*9)*6; ty = B.p0[1]+(B.w[1]-B.p0[1])*q-Math.sin(u*Math.PI)*34+Math.sin(u*13)*3;
      if(u >= 1){ B.st = 'ret'; B.u = 0; B.D = 3.2; B.p0 = [c.x,c.y]; do{ B.cl = T.clouds[Math.floor(Math.random()*T.clouds.length)]; }while(B.cl === T.bird.last); B.last = B.cl; B.off = Math.random()*30-15; } }
    else { const [lx,ly] = land(B.cl), q = 1-(1-u)*(1-u); tx = B.p0[0]+(lx-B.p0[0])*q+Math.sin(u*7)*(1-u)*14; ty = B.p0[1]+(ly-B.p0[1])*q-Math.sin(u*Math.PI)*26*(1-u);
      if(u >= 1){ B.st = 'perch'; B.tm = 4+Math.random()*4; SFX.chirp(); } }
    B.dir = tx > c.x+.01 ? 1 : (tx < c.x-.01 ? -1 : B.dir); c.setPosition(tx,ty); B.wing.setRotation(Math.sin(t*.045)*.9);
  }
  c.scaleX = B.dir;
}

/* ============ نمایش خطا روی صفحه ============ */
function showErr(m){ const e = document.getElementById('err'); e.hidden = false; e.textContent = (e.textContent+'\n'+m).slice(-700); }
window.addEventListener('error',ev => showErr('خطا: '+ev.message));
function create(){ try{ _create.call(this); }catch(er){ showErr('create: '+er.message+' | '+String(er.stack).split('\n').slice(1,3).join(' ')); } }
let _ue = 0;
function update(t,dt){ try{ _update.call(this,t,dt); }catch(er){ if(_ue++ < 3) showErr('update: '+er.message+' | '+String(er.stack).split('\n').slice(1,3).join(' ')); } }

/* ============ رابط ============ */
const ov = document.getElementById('ov');
function show(html,bare){ ov.innerHTML = `<div class="card${bare?' bare':''}">${html}</div>`; ov.hidden = false; L = R = J = false; }
const START_HTML = `<button class="big" onclick="startGame()">▶ START</button>`;
function startGame(){ ac(); startMusic(); SFX.start(); ov.hidden = true; started = true; }
function toStart(){ started = false; won = false; show(START_HTML,true); game.scene.getScene('main').scene.restart(); }
function boot(){
  game = new Phaser.Game({type:Phaser.CANVAS,parent:'g',width:1280,height:720,backgroundColor:'#7cc4f5',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:{key:'main',create,update}});
  show(START_HTML,true);
}
loadArt().then(boot,boot);
