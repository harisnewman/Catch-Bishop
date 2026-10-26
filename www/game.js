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
function mumble(){   // غرغر نامفهوم: چند هجای بم با فرمنت‌های تصادفی
  const c = ac(); if(!c || AC.mute) return; const n = 5+Math.floor(Math.random()*5); let t = c.currentTime+.02;
  for(let i=0;i<n;i++){
    const d = .11+Math.random()*.13, f0 = 80+Math.random()*30, o = c.createOscillator(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(f0,t); o.frequency.linearRampToValueAtTime(f0*(.82+Math.random()*.36),t+d);
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.5,t+.025); g.gain.linearRampToValueAtTime(0,t+d);
    [[300+Math.random()*450,6],[900+Math.random()*900,8]].forEach(([f,q]) => { const b = c.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = q; o.connect(b); b.connect(g); });
    g.connect(AC.out); o.start(t); o.stop(t+d+.02); t += d+.03+Math.random()*.06;
  }
}
const SFX = {
  jump:()=>tone(280,.2,'square',.05,420), land:()=>{tone(110,.1,'triangle',.12,-50); noise(.08,.05,500)}, step:()=>noise(.04,.035,900),
  scrape:()=>noise(.12,.05,380,0,'bandpass'), place:()=>{tone(180,.12,'triangle',.12,-60); noise(.06,.06,700)},
  launch:()=>{tone(160,.32,'sine',.16,620,0,25); noise(.5,.09,400,3500,'bandpass',.05)},
  hit:()=>{noise(.12,.18,6000,0,'highpass'); noise(.9,.3,2600,70); tone(90,.7,'sine',.35,-60)},
  ghost:()=>tone(260,1.8,'sine',.09,520,.1,18), thud:()=>{tone(90,.15,'triangle',.18,-40); noise(.1,.08,300)},
  miss:()=>[392,330,262].forEach((f,i)=>tone(f,.28,'triangle',.1,-20,i*.2)), newbox:()=>noise(.5,.06,3000,300,'bandpass'),
  win:()=>[523,659,784,1047,1319].forEach((f,i)=>tone(f,.28,'triangle',.12,0,i*.12)), wall:()=>tone(140,.1,'square',.06,-40),
  chirp:()=>{tone(3400,.07,'sine',.018,700); tone(3900,.08,'sine',.018,-600,.09)}, start:()=>[392,523].forEach((f,i)=>tone(f,.16,'triangle',.1,0,i*.1))
};
let mus = null;
function startMusic(){
  if(mus) return; const seq = [262,330,392,330,294,392,440,392,262,330,392,523,440,392,330,294]; let n = 0;
  mus = setInterval(() => { if(document.hidden) return; const f = seq[n++%seq.length]; tone(f,.4,'triangle',.022); if(n%4===1) tone(f/2,.9,'sine',.035); },340);
}
function toggleMute(){ AC.mute = !AC.mute; document.getElementById('mute').textContent = AC.mute ? '🔇' : '🔊'; }

/* ============ رسم اشیای ساده با بوم ============ */
const OUT = '#2a1630';
function mkcv(w,h){ const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.lineJoin = x.lineCap = 'round'; return [c,x]; }
function addTex(sc,key,c){ if(sc.textures.exists(key)) sc.textures.remove(key); sc.textures.addCanvas(key,c); }
function makeTex(sc){
  let [c,x] = mkcv(72,72); x.lineWidth = 5; x.strokeStyle = OUT; x.fillStyle = '#d49a54'; x.beginPath(); x.roundRect(4,4,64,64,6); x.fill(); x.stroke();
  x.fillStyle = '#b87a38'; [20,36,52].forEach(y => x.fillRect(8,y,56,3)); x.strokeStyle = '#8a5424'; x.lineWidth = 4; x.beginPath(); x.moveTo(10,10); x.lineTo(62,62); x.moveTo(62,10); x.lineTo(10,62); x.stroke(); addTex(sc,'box',c);
  [c,x] = mkcv(8,8); x.fillStyle = '#fff'; x.beginPath(); x.arc(4,4,4,0,7); x.fill(); addTex(sc,'dot',c);
  [['bL','◀'],['bR','▶'],['bJ','▲']].forEach(([k,t]) => { const [cc,xx] = mkcv(72,72); xx.lineWidth = 5; xx.strokeStyle = OUT; xx.fillStyle = '#fff4e0'; xx.beginPath(); xx.arc(36,36,31,0,7); xx.fill(); xx.stroke(); xx.fillStyle = OUT; xx.font = '26px sans-serif'; xx.textAlign = 'center'; xx.textBaseline = 'middle'; xx.fillText(t,36,38); addTex(sc,k,cc); });
  [[170,70],[210,80],[150,62]].forEach(([w,h],i) => { const [cc,xx] = mkcv(w,h); xx.fillStyle = '#fff';
    xx.beginPath(); xx.ellipse(w*.3,h*.62,w*.22,h*.3,0,0,7); xx.ellipse(w*.5,h*.45,w*.24,h*.38,0,0,7); xx.ellipse(w*.7,h*.6,w*.22,h*.3,0,0,7); xx.rect(w*.12,h*.6,w*.76,h*.3); xx.fill();
    xx.fillStyle = 'rgba(150,190,235,.35)'; xx.fillRect(w*.12,h*.78,w*.76,h*.12); addTex(sc,'cloud'+i,cc); });
  const [sk,sx] = mkcv(4,360); const g = sx.createLinearGradient(0,0,0,300); g.addColorStop(0,'#3d9be9'); g.addColorStop(1,'#bfe7ff'); sx.fillStyle = g; sx.fillRect(0,0,4,360); addTex(sc,'sky',sk);
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
  const ph = t*(st==='push'?.011:.014), s = Math.sin(ph), c = Math.cos(ph); let T;
  if(st === 'walk') T = {lean:.07+s*.03,head:Math.sin(ph*2)*.03,legL:.45*s,legR:-.45*s,bootL:Math.max(0,c)*.5,bootR:Math.max(0,-c)*.5,cape:.28+s*.06,by:-Math.abs(s)*2.4};
  else if(st === 'push') T = {lean:.2,head:.05,legL:.35*s,legR:-.35*s,bootL:.1,bootR:.1,cape:.4,by:-Math.abs(s)*1.5};
  else if(st === 'air') T = vy < 0 ? {lean:.05,head:0,legL:.55,legR:-.3,bootL:.5,bootR:.3,cape:-.15,by:0} : {lean:.02,head:0,legL:.25,legR:-.25,bootL:.1,bootR:.1,cape:-.3,by:0};
  else { const b = Math.sin(t*.004); T = {lean:0,head:b*.02,legL:0,legR:0,bootL:0,bootR:0,cape:b*.04,by:b*.8}; }
  const q = ease(r,T), n = r.n;
  n.legL.rotation = q.legL; n.legR.rotation = q.legR; n.bootL.rotation = q.bootL; n.bootR.rotation = q.bootR; n.head.rotation = q.head; n.cape.rotation = q.cape; r.up.rotation = q.lean; r.up.y = q.by;
}
function animE(r,t,st){
  const ph = t*.010, s = Math.sin(ph); let T;
  if(st === 'talk'){ const j = Math.sin(t*.05), g = Math.sin(t*.03); T = {lean:-.03,head:j*.09,legL:0,legR:0,bootL:0,bootR:0,armL:.55+g*.25,armR:-.55-Math.sin(t*.03+1)*.25,foreL:-.3,foreR:.3,by:Math.abs(j)*-1.6}; }
  else T = {lean:.03,head:Math.sin(ph*2)*.02,legL:.32*s,legR:-.32*s,bootL:.15,bootR:.15,armL:-.35*s+.05,armR:-.35*s-.05,foreL:0,foreR:0,by:-Math.abs(s)*1.4};
  const q = ease(r,T), n = r.n;
  ['legL','legR','bootL','bootR','armL','armR','foreL','foreR','head'].forEach(k => n[k].rotation = q[k]); r.up.rotation = q.lean; r.up.y = q.by;
}

/* ============ بازی ============ */
const FONT = 'Vazirmatn, Tahoma, sans-serif';
let game, sc, S, started = false, L = false, R = false, J = false, acc = 0, cursors, keys, won = false, T;
const IMG = {};
function loadArt(){ return Promise.all(Object.entries(ART).map(([k,src]) => new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.onerror = r; i.src = src; }))); }

function _create(){
  sc = this; S = newState(); won = false; acc = 0; T = {};
  Object.keys(IMG).forEach(k => { if(!this.textures.exists(k)) this.textures.addImage(k,IMG[k]); });
  makeTex(this);
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
  T.box = this.add.image(0,0,'box').setScale(.5).setDepth(7);
  T.ghost = this.add.image(0,0,'ghost').setScale(64/240).setDepth(9).setVisible(false);
  T.dust = this.add.particles(0,0,'dot',{lifespan:400,speed:{min:20,max:70},angle:{min:200,max:340},scale:{start:.9,end:0},alpha:{start:.8,end:0},tint:0xfff4e0,emitting:false}).setDepth(9);
  T.boom = this.add.particles(0,0,'dot',{lifespan:{min:500,max:1100},speed:{min:80,max:340},angle:{min:0,max:360},gravityY:260,scale:{start:2,end:0},tint:[0xffe14d,0xff9b2f,0xff5a2a,0x333333,0xffffff],emitting:false}).setDepth(12);
  T.smoke = this.add.particles(0,0,'dot',{lifespan:1200,speed:{min:10,max:50},angle:{min:240,max:300},scale:{start:3,end:7},alpha:{start:.45,end:0},tint:0x666677,emitting:false}).setDepth(11);
  T.puff = this.add.particles(0,0,'dot',{lifespan:700,speed:{min:15,max:40},angle:{min:230,max:310},scale:{start:1.3,end:.2},alpha:{start:.8,end:0},tint:0xffffff,emitting:false}).setDepth(10);
  // پرنده
  const bd = this.add.container(0,0).setDepth(4); const bg = this.add.graphics(); bg.fillStyle(0x2a1630).fillEllipse(0,0,9,6).fillTriangle(-4,0,-9,-2,-9,2).fillCircle(4,-2,2.5); bg.fillStyle(0xffb020).fillTriangle(6,-2,9,-1,6,0);
  const wing = this.add.graphics().lineStyle(2,0x2a1630).lineBetween(0,0,0,-7).lineBetween(0,0,-3,-6); bd.add([bg,wing]);
  T.bird = {c:bd,wing,st:'perch',cl:T.clouds[1],off:10,tm:3,u:0,D:1,p0:[0,0],w:[0,0],dir:1};
  // دکمه‌ها
  const btn = (x,k,set) => { const b = this.add.image(x,331,k).setDepth(20).setAlpha(.9).setScale(.74).setInteractive();
    b.on('pointerdown',() => { set(true); b.setScale(.66); }); const up = () => { set(false); b.setScale(.74); }; b.on('pointerup',up); b.on('pointerout',up); b.on('pointerupoutside',up); };
  btn(44,'bL',v => L = v); btn(108,'bR',v => R = v); btn(596,'bJ',v => J = v);
  T.hint = this.add.text(320,22,'جعبه را روی سر پایین الاکلنگ هل بده، بعد روی سر بالایی بپر!',{fontFamily:FONT,fontSize:'14px',color:'#2a1630',backgroundColor:'#fff4e0',padding:{x:12,y:6}}).setOrigin(.5).setDepth(20).setAlpha(0);
  T.toast = this.add.text(320,60,'',{fontFamily:FONT,fontSize:'15px',color:'#fff',backgroundColor:'#2a1630',padding:{x:12,y:5}}).setOrigin(.5).setDepth(20).setAlpha(0);
  T.mt = 0; T.eT = 0; T.stepT = 0; T.scrT = 0; T.wonT = -1;
  if(started) showHint();
}
function showHint(){ sc.tweens.add({targets:T.hint,alpha:1,duration:300}); sc.time.delayedCall(9000,() => sc.tweens.add({targets:T.hint,alpha:0,duration:600})); }
function toast(msg){ T.toast.setText(msg).setAlpha(1); sc.tweens.killTweensOf(T.toast); sc.tweens.add({targets:T.toast,alpha:0,delay:1800,duration:500}); }
function dust(x,y,n=6){ T.dust.emitParticleAt(x,y,n); }

function onEv(e){
  const h = S.hero;
  if(e.t === 'jump'){ SFX.jump(); dust(h.x,h.y); }
  else if(e.t === 'land'){ if(e.imp > 220){ SFX.land(); dust(h.x,h.y,7); } }
  else if(e.t === 'place') SFX.place();
  else if(e.t === 'launch'){ SFX.launch(); sc.cameras.main.shake(140,.007); sc.tweens.add({targets:T.plank,scaleY:1.15,duration:70,yoyo:true}); }
  else if(e.t === 'hit') boom(e.x,e.y);
  else if(e.t === 'miss'){ SFX.miss(); toast('نخورد! یک جعبهٔ دیگر می‌افتد'); }
  else if(e.t === 'thud'){ SFX.thud(); dust(S.box.x,GY,5); }
  else if(e.t === 'newbox') SFX.newbox();
  else if(e.t === 'wall') SFX.wall();
  else if(e.t === 'grumble' && started) mumble();
}
function boom(x,y){
  SFX.hit(); sc.cameras.main.shake(380,.02);
  const f = sc.add.circle(x,y,18,0xffffff,1).setDepth(13); sc.tweens.add({targets:f,scale:6,alpha:0,duration:320,onComplete:() => f.destroy()});
  const r = sc.add.circle(x,y,12).setStrokeStyle(5,0xffd23f).setDepth(13); sc.tweens.add({targets:r,scale:9,alpha:0,duration:520,onComplete:() => r.destroy()});
  T.boom.emitParticleAt(x,y,70); T.smoke.emitParticleAt(x,y,14);
  const tx = sc.add.text(x,y-30,'بووم!',{fontFamily:'Lalezar, Vazirmatn, sans-serif',fontSize:'40px',color:'#ffd23f',stroke:'#7a1d0c',strokeThickness:7}).setOrigin(.5).setDepth(14).setScale(.2).setAngle(-8);
  sc.tweens.add({targets:tx,scale:1.2,duration:220,ease:'Back.easeOut'}); sc.tweens.add({targets:tx,alpha:0,y:y-70,delay:700,duration:500,onComplete:() => tx.destroy()});
  T.enemy.outer.setVisible(false);
  sc.time.delayedCall(260,() => ghostFly(x,y));
}
function ghostFly(x,y){
  SFX.ghost(); const gh = T.ghost.setVisible(true).setPosition(x,y).setAlpha(0).setScale(.1); T.gx = x; T.gy = y; T.gt = 0;
  sc.tweens.add({targets:gh,alpha:1,scale:64/240,duration:350,ease:'Back.easeOut'});
  T.gAct = true; sc.time.delayedCall(3600,() => { if(!won){ won = true; SFX.win(); showWin(); } });
}
function showWin(){ show(`<div class="sub" style="font-size:36px">مرحلهٔ اول کامل شد! 🎉</div><p class="tag">روح اسقف پرواز کرد و رفت 👻</p><button class="big" onclick="again()">دوباره بازی کن</button>`); }

function _update(t,dt){
  const sec = dt/1000;
  // ورودی و شبیه‌سازی
  const k = keys, inp = started && !won ? {left:L||cursors.left.isDown||k.A.isDown, right:R||cursors.right.isDown||k.D.isDown, jump:J||cursors.up.isDown||k.W.isDown||k.SPACE.isDown} : {};
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
    if(b.st === 'ground'){ T.box.setPosition(b.x,GY-18).setRotation(0); }
    else if(b.st === 'placed'){ T.box.setPosition(b.x-Math.sin(p.a)*18,plankY(p.a,b.x)-Math.cos(p.a)*18).setRotation(-p.a); }
    else if(b.st === 'falling'){ T.box.setPosition(b.x,b.y-18).setRotation(0); }
    else T.box.setPosition(b.x,b.y).setRotation(b.rot);
  }
  // دشمن
  if(e.alive){
    const talk = e.pause > 0; T.enemy.outer.setPosition(e.x,ROOF+2); T.enemy.inner.scaleX = e.dir; animE(T.enemy,t,talk ? 'talk' : 'walk');
    if(talk){ T.eT -= dt; if(T.eT <= 0){ T.eT = 420; const sy = ['#@%!','غرررر','هوم!؟','&%$#','بلبل!؟'][Math.floor(Math.random()*5)];
        const tx = sc.add.text(e.x+(Math.random()*30-10),ROOF-62,sy,{fontFamily:FONT,fontSize:'13px',color:'#c0191b',stroke:'#fff',strokeThickness:4}).setOrigin(.5).setDepth(14);
        sc.tweens.add({targets:tx,y:tx.y-24,alpha:0,duration:900,onComplete:() => tx.destroy()}); T.puff.emitParticleAt(e.x-18,ROOF-36,2); T.puff.emitParticleAt(e.x+18,ROOF-36,2);
        const an = sc.add.text(e.x+20,ROOF-56,'💢',{fontSize:'16px'}).setOrigin(.5).setDepth(14); sc.tweens.add({targets:an,scale:1.5,alpha:0,duration:600,onComplete:() => an.destroy()}); } }
  }
  // روح
  if(T.gAct){ T.gt += sec; const u = T.gt/3.4; T.ghost.setPosition(T.gx-u*u*260+Math.sin(T.gt*4)*14,T.gy-u*210-Math.sin(T.gt*2)*4).setRotation(Math.sin(T.gt*4)*.12);
    if(u > .7) T.ghost.setAlpha(Math.max(0,1-(u-.7)/.3)); }
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
function show(html){ ov.innerHTML = `<div class="card">${html}</div>`; ov.hidden = false; L = R = J = false; }
function startGame(){ ac(); startMusic(); SFX.start(); ov.hidden = true; started = true; showHint(); }
function again(){ ov.hidden = true; started = true; game.scene.getScene('main').scene.restart(); }
function boot(){
  game = new Phaser.Game({type:Phaser.AUTO,parent:'g',width:640,height:360,backgroundColor:'#7cc4f5',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:{key:'main',create,update}});
  show(`<button class="big" onclick="startGame()">شروع</button>`);
}
Promise.all([loadArt(),Promise.race([document.fonts.load('16px Vazirmatn'),document.fonts.load('40px Lalezar'),new Promise(r => setTimeout(r,1500))])]).then(boot,boot);
