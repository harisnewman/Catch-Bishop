/* ===== SIM: فیزیک خالص، بدون وابستگی به رندر ===== */
const GY=300, PX=335, HP=42, ARM_L=90, ARM_R=70, A0=28*Math.PI/180, A1=26*Math.PI/180;
const BX0=512, ROOF=76, G=900, SPEED=150, JUMP=440, BOX=28, KB=3.5, EMIN=548, EMAX=606, HH=50;
const plankY=(a,x)=>(GY-HP)-(x-PX)*Math.tan(a);
const plankL=a=>PX-ARM_L*Math.cos(a), plankR=a=>PX+ARM_R*Math.cos(a);
function newState(){return{t:0,ev:[],done:false,pushing:false,active:false,dead:false,
  hero:{x:60,y:GY,vx:0,vy:0,on:true,face:1,buf:0,coy:0,jPrev:false},
  box:{st:'ground',x:175,y:GY,vx:0,vy:0,rot:0,rb:0,t:0,spin:0},   // ground/falling: y=پایین جعبه؛ flying/roof: y=مرکز
  plank:{a:A0,target:A0,rate:0,armed:true},
  enemy:{x:575,dir:-1,alive:true},resetT:-1,ropes:[],throwT:3,tellT:-1};}
function plankSurf(S,x){const a=S.plank.a;return(x>=plankL(a)-2&&x<=plankR(a)+2)?plankY(a,x):GY+999;}
function boxSurf(S,x){return Math.min(GY,plankSurf(S,x));}
function suppY(S,x){return Math.min(boxSurf(S,x-12),boxSurf(S,x),boxSurf(S,x+12));}   // لبهٔ جلویی جعبه روی شیب می‌نشیند
function surf(S,x){let s=boxSurf(S,x);const b=S.box;if(b.st==='ground'&&Math.abs(x-b.x)<BOX/2+4&&b.y-BOX<s)s=b.y-BOX;return s;}
function onPlank(S){const b=S.box;return b.st==='ground'&&b.y<GY-1&&plankSurf(S,b.x)<GY+500;}
function underBlocked(S,nb,y){return y>=GY-1&&nb+BOX/2>PX+22&&nb-BOX/2<plankR(S.plank.a)+2;}   // جعبهٔ روی زمین نباید زیر الاکلنگ برود
function tryLaunch(S,imp,x,s){
  const b=S.box,a=S.plank.a;
  if(!(S.plank.armed&&imp>180&&x>PX+4&&s<GY-3&&onPlank(S)&&b.x<PX-8))return;
  const rh=Math.min(ARM_R,Math.max(40,(x-PX)/Math.cos(a))),rb=Math.max(34,(PX-b.x)/Math.cos(a));
  const vh=Math.min(imp,285)*(imp<230?Math.pow(imp/230,2):1),vperp=vh*Math.cos(a),MH=1.6,MB=1,E=.4;
  const w=(1+E)*MH*vperp*rh/(MH*rh*rh+MB*rb*rb),vb=KB*w*rb,ang=Math.PI/2-A1;
  b.y=plankY(a,b.x)-BOX/2-2;b.st='flying';b.vx=vb*Math.cos(ang);b.vy=-vb*Math.sin(ang);b.spin=-4;b.t=0;
  S.plank.target=-A1;S.plank.rate=(A0+A1)/.14;S.plank.armed=false;
  S.hero.vy=-200;S.hero.on=false;S.ev.push({t:'launch',vb,rh,rb,imp});}
function moveBox(S,nb){const b=S.box,s=suppY(S,nb);
  if(nb>BX0-BOX/2-2||nb<BOX/2+2||s<b.y-14||underBlocked(S,nb,b.y))return false;
  b.x=nb;if(s>b.y+6){b.st='falling';b.vy=0;}else b.y=s;return true;}
function stepHero(S,dt,inp){
  const h=S.hero,b=S.box,ev=S.ev;if(S.dead)return;
  const dir=(inp.right?1:0)-(inp.left?1:0);h.vx=dir*SPEED;if(dir)h.face=dir;S.pushing=false;
  if(inp.jump&&!h.jPrev)h.buf=.15;else h.buf=Math.max(0,h.buf-dt);h.jPrev=!!inp.jump;
  h.coy=h.on?.12:Math.max(0,h.coy-dt);
  if(h.buf>0&&h.coy>0){h.vy=-JUMP;h.on=false;h.buf=0;h.coy=0;ev.push({t:'jump'});}
  let nx=Math.max(14,Math.min(BX0-14,h.x+h.vx*dt));
  const bt=b.y-BOX;
  if(b.st==='ground'&&h.y>bt+4&&Math.abs(nx-b.x)<11+BOX/2){
    if(dir&&((dir>0&&h.x<b.x)||(dir<0&&h.x>b.x))){
      if(moveBox(S,b.x+(nx-h.x))){b.vx=dir*SPEED;nx=b.x-Math.sign(dir)*(11+BOX/2);S.pushing=true;}else nx=h.x;
    }else nx=h.x;}
  if(h.on){const s=surf(S,nx);if(s<h.y-14&&nx!==h.x)nx=h.x;
    const s2=surf(S,nx);if(s2>h.y+8)h.on=false;else h.y=s2;}
  if(!h.on){
    if(!inp.jump&&h.vy<-220)h.vy=-220;h.vy+=G*dt;const ny=h.y+h.vy*dt;
    if(b.st==='ground'&&ny>b.y-BOX+6&&Math.abs(nx-b.x)<11+BOX/2&&Math.abs(h.x-b.x)>=11+BOX/2-1)nx=h.x;
    const s=surf(S,nx);
    if(h.vy>=0&&ny>=s&&h.y<=s+14){h.y=s;const imp=h.vy;h.vy=0;h.on=true;ev.push({t:'land',imp,onPlank:s<GY-3});tryLaunch(S,imp,nx,s);}
    else h.y=ny;}
  h.x=nx;}
function missBox(S){S.box.st='gone';S.resetT=.9;S.ev.push({t:'miss'});}
function stepBox(S,dt){
  const b=S.box,e=S.enemy;
  if(b.st==='ground'){
    if(!S.pushing&&Math.abs(b.vx)>1){
      if(moveBox(S,b.x+b.vx*dt))b.vx-=Math.sign(b.vx)*Math.min(Math.abs(b.vx),500*dt);else b.vx=0;}
    else if(!S.pushing)b.vx=0;}
  else if(b.st==='flying'){b.t+=dt;const n=4,d=dt/n;
    for(let i=0;i<n&&b.st==='flying';i++){
      b.vy+=G*d;b.x+=b.vx*d;b.y+=b.vy*d;b.rot+=b.spin*d;
      if(e.alive&&Math.abs(b.x-e.x)<BOX/2+22&&Math.abs(b.y-(ROOF-30))<BOX/2+34){b.st='gone';e.alive=false;S.ev.push({t:'hit',x:e.x,y:ROOF-30});S.done=true;return;}
      if(b.x+BOX/2>BX0&&b.y>ROOF+14&&b.vx>0){b.x=BX0-BOX/2;b.vx*=-.25;S.ev.push({t:'wall'});}
      if(b.x>BX0-BOX/2&&b.vy>0&&b.y+BOX/2>=ROOF&&b.y<ROOF+10){b.y=ROOF-BOX/2;b.st='roof';S.ev.push({t:'roof'});S.roofT=.5;}
      if(b.y+BOX/2>=GY){b.y=GY-BOX/2;missBox(S);S.ev.push({t:'thud'});}
      else if(b.x>700||b.x<-60)missBox(S);}}
  else if(b.st==='roof'){S.roofT-=dt;if(S.roofT<=0)missBox(S);}
  else if(b.st==='falling'){b.vy+=G*dt;b.y+=b.vy*dt;const s=suppY(S,b.x);
    if(b.y>=s){if(b.vy>140)S.ev.push({t:'thud'});b.y=s;b.vy=0;b.vx*=.3;b.st='ground';
      const h=S.hero;if(Math.abs(h.x-b.x)<11+BOX/2&&h.y>b.y-BOX)h.x=b.x-(11+BOX/2+1);}}}
function throwRope(S){
  const e=S.enemy,h=S.hero,T=1.15,y0=ROOF-22,tx=Math.max(20,Math.min(BX0-30,h.x+(h.vx||0)*.25));
  S.ropes.push({x:e.x,y:y0,vx:(tx-e.x)/T,vy:(GY-4-y0-.5*G*T*T)/T,trail:[]});S.ev.push({t:'throw'});}
function stepRopes(S,dt){
  const h=S.hero;
  for(let i=S.ropes.length-1;i>=0;i--){const r=S.ropes[i];
    r.vy+=G*dt;r.x+=r.vx*dt;r.y+=r.vy*dt;r.trail.push([r.x,r.y]);if(r.trail.length>9)r.trail.shift();
    if(!S.dead&&Math.abs(r.x-h.x)<17&&r.y>h.y-HH&&r.y<h.y+6){S.dead=true;S.ev.push({t:'death',x:h.x,y:h.y});S.ropes.splice(i,1);continue;}
    if(r.y>=GY-2){S.ev.push({t:'ropeland',x:r.x});S.ropes.splice(i,1);}}}
function stepWorld(S,dt,inp){
  S.t+=dt;S.ev.length=0;
  stepHero(S,dt,inp);stepBox(S,dt);stepRopes(S,dt);
  const p=S.plank;if(p.a!==p.target){const d=p.target-p.a,st=p.rate*dt;p.a=Math.abs(d)<=st?p.target:p.a+Math.sign(d)*st;}
  if(S.resetT>=0){S.resetT-=dt;if(S.resetT<0){S.resetT=-1;p.target=A0;p.rate=1.3;p.armed=true;
    S.box={st:'falling',x:90+Math.random()*80,y:-40,vx:0,vy:0,rot:0,rb:0,t:0,spin:0};S.ev.push({t:'newbox'});}}
  const e=S.enemy;
  if(e.alive){
    if(S.tellT>=0){S.tellT-=dt;if(S.tellT<0){throwRope(S);S.throwT=3+Math.random()*2;}}   // هنگام آماده شدن برای پرتاب می‌ایستد
    else{e.x+=e.dir*26*dt;if(e.x<EMIN){e.x=EMIN;e.dir=1;}if(e.x>EMAX){e.x=EMAX;e.dir=-1;}
      if(S.active&&!S.dead){S.throwT-=dt;if(S.throwT<=0){S.tellT=.5;S.ev.push({t:'tell'});}}}}}
