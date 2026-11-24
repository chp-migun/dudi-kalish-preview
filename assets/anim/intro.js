/* first built by build_intro.py from design/anim; since 09/11 maintained by hand here (the generator is out of date and refuses to overwrite) */
(()=>{
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = id => document.getElementById(id);
/* conductor's podium he steps onto at the end (user 09/11): drawn once, behind him; feet land on its top at y=210 of 305 */
const POD_FEET=221/305;   /* the top's front and back edges are the album red (user 09/11) */   /* feet toward the front edge of the top (user 09/11) */ let podBottom=0;
const podium=(()=>{ const d=document.createElement('div'); d.className='podium'; d.id='ia-podium'; d.setAttribute('aria-hidden','true');
  d.innerHTML='<svg viewBox="0 0 300 305" preserveAspectRatio="none"><defs>'
   +'<linearGradient id="pdF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d2a28"/><stop offset="1" stop-color="#0a1211"/></linearGradient>'
   +'<linearGradient id="pdT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3d3b"/><stop offset="1" stop-color="#1a2624"/></linearGradient>'
   +'<radialGradient id="pdS"><stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>'
   +'<ellipse cx="150" cy="298" rx="165" ry="9" fill="url(#pdS)"/>'
   +'<g fill="none" stroke="rgb(172 196 195 / .5)" stroke-linecap="round"><path d="M44 196V40M256 196V40M150 186V22" stroke-width="5"/><path d="M34 44Q150 4 266 44" stroke-width="8"/></g>'
   +'<path d="M22 190H278L300 226H0Z" fill="url(#pdT)"/><path d="M22 190H278" stroke="#A83020" stroke-width="2.5"/>'
   +'<path d="M0 226H300V296H0Z" fill="url(#pdF)"/><path d="M0 226H300" stroke="#A83020" stroke-width="3"/>'
   +'<path d="M18 238H282" stroke="rgb(172 196 195 / .12)" stroke-width="1.5"/></svg>';
  return d; })();
const stage=$('ia-stage'), track=$('ia-track'), book=$('ia-book'), floor=$('ia-floor'), dudi=$('ia-dudi'), halo=$('ia-halo'), nameEl=$('ia-name'), cue=$('ia-cue');
if(dudi&&dudi.parentNode) dudi.parentNode.insertBefore(podium,dudi);
/* the back cover (user 10/11): after Dudi steps back into the album the back cover swings closed over him and the
   album's track list (the booklet's back cover, page 12) lifts off it onto the screen */
const BACK_TRACKS=["קול דודי","אדון עולם","היום תאמצנו","איך האב דיר ליב","ארוממך","כסא רחמים","ושם נשיר","בעלזא","שמך מעולם","קדוש","חי חי","דאנס","בכל","פתיחים"];
const BC_K=0.034;   /* the list's type size on the back cover, as a fraction of the page */
const listHTML=BACK_TRACKS.map((t,i)=>`<li><b>${String(i+1).padStart(2,'0')}</b><span>${t}</span></li>`).join('');
const backList=document.createElement('ol'); backList.className='ia-backlist bl'; backList.setAttribute('aria-hidden','true'); backList.innerHTML=listHTML;
const backItems=[...backList.children];
if(stage) stage.appendChild(backList);
const numsEl=$('ia-nums'), numA=$('ia-numA'), numB=$('ia-numB'), cta=$('ia-cta'), sndBtn=$('ia-snd');
const wavesEl=$('ia-waves'), beamEl=$('ia-beam'), dudiNewEl=$('ia-dudiNew'), dudiImgEl=$('ia-dudiImg'), n1El=$('ia-n1'), n2El=$('ia-n2');
/* write a style only when its value really changed (23/11). Every write, even of the same value, made the browser
   re-style the element; the scene wrote most of its values on every frame whether they moved or not.
   Only for values nothing else on the page writes (renderReturn writes its own ones directly). */
const S=(el,p,v)=>{ v=String(v); const c=el.__s||(el.__s={}); if(c[p]!==v){ c[p]=v; el.style[p]=v; } };
const SV=(el,k,v)=>{ v=String(v); const c=el.__s||(el.__s={}); if(c[k]!==v){ c[k]=v; el.style.setProperty(k,v); } };
const FINE = matchMedia('(pointer: fine)').matches;
const LITE = () => !!(window.DK_LITE && window.DK_LITE.on);   /* weak machine (assets/anim/lite.js) */
/* write a root variable only when it really changes: every write re-styles the whole page */
/* these four values change while the page scrolls. Writing them on <html> made the browser re-style the whole page
   (about 1400 elements) on every step, the biggest cost on slow machines (measured 23/11); each is written only on the few
   elements that read it, which look the same and re-style only themselves */
const VAR_TARGETS={'--intro-name':'#intro .ia-hero-name,#intro .ia-hero-en,#intro .ia-about-end','--intro-about':'#intro .ia-about-end','--intro-end':'#ia-hero,#intro .hero-rail','--dock':'.site-header,#intro .ia-hero-name,#intro .ia-hero-en'};
/* the element lists are kept, not searched for on every frame (23/11); looked up again once a second, since the top bar
   and the about text are built after this script runs */
const varEls={}, varAt={};
const rootVar=(k,v)=>{ const now=performance.now();
  if(!varEls[k] || now-varAt[k]>1000){ varEls[k]=document.querySelectorAll(VAR_TARGETS[k]); varAt[k]=now; }
  varEls[k].forEach(el=>{ if(el.style.getPropertyValue(k)!==v) el.style.setProperty(k,v); }); };
window.DK_SETVAR=rootVar;

/* track numbers revealed by each leaf (the spread it uncovers), read right-to-left as in the booklet */
const SONGS = [[], ['01','02'], ['03','04'], ['05'], ['06','07'], ['08'], ['09','10'], ['11','12'], ['13','14']];

/* ---- page turn sound: a soft paper turn built sample by sample (no audio file) ----
   whoosh of air + a few quiet paper crinkles + a soft landing, panned across as the page travels.
   Every turn is rendered fresh from its own random seed, so no two turns sound the same. */
function makeTurn(sr, seed, heavy){
  let x=seed>>>0; const rnd=()=>{ x=(x+0x6D2B79F5)>>>0; let t=x; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; };
  const R_=(a,b)=>a+(b-a)*rnd();
  /* this turn's character */
  const dur=(heavy?0.78:0.62)*R_(0.82,1.2), N=Math.floor(dur*sr);
  const peakAt=R_(0.3,0.5), tail=R_(0.16,0.28);
  const hiCut=R_(2800,4200), loCut=R_(380,700);          /* soft, papery band — no hiss */
  const flutterHz=R_(9,18), flutterDepth=R_(0.25,0.5);
  const crinkleRate=R_(30,110), crinkleLevel=R_(0.12,0.28), crinkleTone=R_(1800,2800);
  const flapLevel=R_(0.5,1.1)*(heavy?1.3:1), flapAt=R_(0.74,0.86);
  const panFrom=R_(-0.45,-0.2), panTo=R_(0.2,0.45);
  const level=(heavy?0.14:0.11)*R_(0.85,1.1);              /* quiet by design */

  const L=new Float32Array(N), Rr=new Float32Array(N);
  const k=fc=>1-Math.exp(-2*Math.PI*fc/sr);
  const env=t=> t<peakAt ? Math.pow(Math.sin(Math.PI/2*t/peakAt),2) : Math.exp(-(t-peakAt)/tail);
  const fStep=Math.max(1,Math.floor(sr/flutterHz)); let fa=1, fb=1;
  let a1=0,a2=0,b1=0,b2=0, lpC=0, lpF=0, crkLen=0, crkAmp=0, crkTot=1;
  const kHi=k(hiCut), kLo=k(loCut), kC=k(crinkleTone), kF=k(220);
  const fA=Math.floor(N*flapAt), fLen=Math.floor(sr*0.06);
  for(let i=0;i<N;i++){
    const t=i/N, e=env(t);
    if(i%fStep===0){ fa=fb; fb=1-flutterDepth*rnd(); }
    const fp=(i%fStep)/fStep, fl=fa+(fb-fa)*(0.5-0.5*Math.cos(Math.PI*fp));
    const w=rnd()*2-1;
    /* two-pole low/high for a rounder band */
    a1+=kHi*(w-a1); a2+=kHi*(a1-a2); b1+=kLo*(w-b1); b2+=kLo*(b1-b2);
    const swish=(a2-b2)*e*fl;
    if(crkLen<=0 && rnd()<crinkleRate*e/sr){ crkTot=crkLen=Math.floor(sr*R_(0.002,0.007)); crkAmp=R_(0.3,1)*e; }
    let c=0;
    if(crkLen>0){ const wc=rnd()*2-1; lpC+=kC*(wc-lpC); const ph=1-crkLen/crkTot; c=lpC*crkAmp*Math.sin(Math.PI*ph); crkLen--; }   /* rounded, not clicky */
    let f=0;
    if(i>=fA && i<fA+fLen){ const ft=(i-fA)/fLen; lpF+=kF*((rnd()*2-1)-lpF); f=lpF*Math.sin(Math.PI*Math.min(1,ft*6))*Math.exp(-ft*4); }
    const s=swish + c*crinkleLevel*3 + f*flapLevel*3;
    const pan=panFrom+(panTo-panFrom)*t, ang=(pan+1)*Math.PI/4;
    L[i]=s*Math.cos(ang); Rr[i]=s*Math.sin(ang);
  }
  const fade=Math.floor(sr*0.01); let pk=1e-9;
  for(let i=0;i<N;i++){ const g=Math.min(1,i/fade,(N-1-i)/fade); L[i]*=g; Rr[i]*=g; pk=Math.max(pk,Math.abs(L[i]),Math.abs(Rr[i])); }
  const norm=level/pk; for(let i=0;i<N;i++){ L[i]*=norm; Rr[i]*=norm; }
  return [L,Rr];
}

const sound = (()=>{
  let ctx=null, wanted=true, unlocked=false, last=0;
  function init(){ return; if(ctx) return; const AC=window.AudioContext||window.webkitAudioContext; if(AC) ctx=new AC(); }
  function unlock(){ init(); if(!ctx) return; ctx.resume().then(()=>{ unlocked=true; paint(); }).catch(()=>{}); }
  function paint(){ const on=wanted&&unlocked; sndBtn.setAttribute('aria-pressed',on); sndBtn.setAttribute('aria-label', on?'השתקת צליל הדפדוף':'הפעלת צליל הדפדוף'); }
  function rustle(heavy){
    if(!ctx||!wanted||!unlocked||RM) return;
    const now=ctx.currentTime; if(now-last<0.09) return; last=now;
    const [l,r]=makeTurn(ctx.sampleRate,(Math.random()*4294967295)>>>0,heavy);   /* a new page every time */
    const b=ctx.createBuffer(2,l.length,ctx.sampleRate); b.getChannelData(0).set(l); b.getChannelData(1).set(r);
    const src=ctx.createBufferSource(); src.buffer=b; src.connect(ctx.destination); src.start();
  }
  ['pointerdown','keydown','touchend'].forEach(e=>addEventListener(e,ev=>{ if(ev.target!==sndBtn && !sndBtn.contains(ev.target)) unlock(); },{passive:true}));
  sndBtn.addEventListener('click',()=>{ if(!unlocked){ wanted=true; unlock(); } else { wanted=!wanted; paint(); if(wanted) rustle(false); } });
  paint();
  return {rustle};
})();



/* ---- the portrait follows the pointer a touch, once he is out ---- */
const par={x:0,y:0,tx:0,ty:0,w:0,raf:0};
function parTick(){
  par.x+=(par.tx-par.x)*0.08; par.y+=(par.ty-par.y)*0.08;
  const k=par.w;
  dudi.style.translate=`${(par.x*16*k).toFixed(2)}px ${(par.y*9*k).toFixed(2)}px`;
  halo.style.translate=`calc(-50% + ${(par.x*30*k).toFixed(2)}px) calc(-50% + ${(par.y*18*k).toFixed(2)}px)`;
  nameEl.style.marginLeft=`${(-par.x*7*k).toFixed(2)}px`; nameEl.style.marginBottom=`${(par.y*4*k).toFixed(2)}px`;
  par.raf = (Math.abs(par.tx-par.x)>.001||Math.abs(par.ty-par.y)>.001) ? requestAnimationFrame(parTick) : 0;
}
if(FINE && !RM) stage.addEventListener('pointermove',e=>{
  if(LITE()) return;
  par.tx=(e.clientX/VW-.5)*2; par.ty=(e.clientY/VH-.5)*2;
  if(!par.raf) par.raf=requestAnimationFrame(parTick);
});
/* the album itself leans toward the pointer */
let vRaf=0; const vt={x:0,y:0};
function viewTick(){
  view.x+=(vt.x-view.x)*0.07; view.y+=(vt.y-view.y)*0.07;
  if(cur<.76) render(cur,true);
  vRaf=(Math.abs(vt.x-view.x)>.002||Math.abs(vt.y-view.y)>.002)?requestAnimationFrame(viewTick):0;
}
if(FINE && !RM) stage.addEventListener('pointermove',e=>{
  if(LITE()) return;
  vt.x=(e.clientX/VW-.5)*2; vt.y=(e.clientY/VH-.5)*2;
  if(!vRaf) vRaf=requestAnimationFrame(viewTick);
});

/* ---- album content: RTL booklet; each leaf = [front (left page), back (right page of next spread)] ---- */
const N = 9;
const leafImgs = [];
for(let k=0;k<N;k++){
  const front = k===0 ? 'cover' : `p${String(k+1).padStart(2,'0')}L`;
  const back  = `p${String(k+2).padStart(2,'0')}R`;
  leafImgs.push([front,back]);
}
const BASE = 'p10L';
/* Dudi's place on spread 13–14 (fractions of the 2-page spread, measured on the 3544×1772 master) */
const DUDI = {x:1212/3544, y:121/1772, w:1205/3544, h:1651/1772};
/* Dudi's raised hand inside the cut-out (fractions of the cut-out box) */
/* the full-length photo is the same shot as the album page: same top-left corner, 1.3606× the page cut-out's pixels */
const FULL = {w:1004*1.3606/1205, h:2000*1.3606/1651};
/* landmarks in the full-length photo (fractions of its box) */
const HAND = {x:0.0455, top:0.1405}, HAT_L = 0.478, COAT_L = 0.27;
let NSEG, SEGW, JW;   /* many thin strips → a smooth round curl; half as many on a weak machine */
const setSegs=n=>{ NSEG=n; SEGW=Array(n).fill(1/n); JW=n*(n-1)/2; };
setSegs(LITE()?6:12);
const OVL = 4;   /* px of overlap between strips */

let P=0, dir='assets/anim/img/', stepped=false;
const leaves=[], guts=[]; let gutsG=-1, bcList=null, blF=0, baseEl, gutL, gutR, blk, castL, castR, ground, shadL, shadR;
const LT=()=>Math.max(1.6,P*0.006);   /* thickness of one leaf (user 10/11: a little body, like a quality booklet) */
const view={x:0,y:0};                     /* pointer, for tilting the album in 3D */

/* the pictures are kept by the browser for a month (netlify.toml): a new picture needs a new tag here */
const VQ='?v=1123';
function pickDir(){
  const dpr = Math.min(window.devicePixelRatio||1, 3);
  return (P*dpr > 1150) ? 'assets/anim/img/' : 'assets/anim/img/m/';
}

function makeFace(cls, img, offPx){
  const f=document.createElement('div'); f.className='face '+cls;
  f.style.backgroundImage=`url(${dir}${img}.webp${VQ})`;
  f.dataset.img=img; f.dataset.off=offPx;
  f.appendChild(document.createElement('i'));
  return f;
}

function build(){
  book.textContent='';
  leaves.length=0; guts.length=0; gutsG=-1;
  book.style.width=(2*P)+'px'; book.style.height=P+'px';
  book.style.marginLeft=(-P)+'px'; book.style.marginTop=(-P/2)+'px';

  /* the floor and the album's shadow on it */
  ground=document.createElement('div'); ground.className='ground'; book.appendChild(ground);
  const gW=11*P, gH=11*P;
  ground.style.cssText=`width:${gW}px;height:${gH}px;left:${P-gW/2}px;top:${P/2-gH/2}px;transform:translateZ(-2px)`;
  book.style.setProperty('--ring', (P*0.17).toFixed(1)+'px');
  shadL=document.createElement('div'); shadL.className='cshadow'; book.appendChild(shadL);
  shadR=document.createElement('div'); shadR.className='cshadow'; book.appendChild(shadR);
  /* the album's soft shadow (23/11): a ready-made soft edge (box-shadow, drawn once) instead of a live blur filter, which
     the graphics card recomputed on every frame as the album turned; the same size and softness */
  const bl=P*0.045, sh=`box-shadow:0 0 ${(2*bl).toFixed(1)}px ${bl.toFixed(1)}px rgb(0 0 0 / .62)`;
  shadL.style.cssText=`left:${(-P*0.03+bl).toFixed(1)}px;top:${(P*0.02+bl).toFixed(1)}px;width:${(P*1.03-2*bl).toFixed(1)}px;height:${(P*1.03-2*bl).toFixed(1)}px;${sh};transform:translateZ(-1px)`;
  shadR.style.cssText=`left:${(P+bl).toFixed(1)}px;top:${(P*0.02+bl).toFixed(1)}px;width:${(P*1.03-2*bl).toFixed(1)}px;height:${(P*1.03-2*bl).toFixed(1)}px;${sh};transform:translateZ(-1px)`;
  /* page blocks (front edge + outer side on each half) and the cast shadows */
  const mk=(cls)=>{ const d=document.createElement('div'); d.className=cls; book.appendChild(d); return d; };
  blk={fL:mk('blk front'), fR:mk('blk front'), sL:mk('blk side l'), sR:mk('blk side r'), sp:mk('blk side l')};   /* sp: fills the step at the spine between the two stacks, so no gap opens there (user 10/11) */
  book.style.setProperty('--lt', LT()+'px');
  castL=mk('cast'); castR=mk('cast');
  for(const c of [castL,castR]){ c.style.width=P+'px'; c.style.height=P+'px'; }
  castR.style.left=P+'px';

  /* static left base: page 14 */
  baseEl=document.createElement('div'); baseEl.className='base';
  baseEl.style.width=P+'px'; baseEl.style.height=P+'px';
  const bf=makeFace('front',BASE,0); bf.style.backgroundSize=`${P}px ${P}px`;
  gutL=document.createElement('div'); gutL.className='gutter l'; bf.appendChild(gutL);
  baseEl.appendChild(bf);
  /* the outside of the last page is the back cover; it is only seen when it swings closed at the very end */
  const bc=document.createElement('div'); bc.className='face back bc';
  bcList=document.createElement('ol'); bcList.className='bl'; bcList.innerHTML=backList.innerHTML; bc.appendChild(bcList);
  baseEl.appendChild(bc); book.appendChild(baseEl);

  for(let k=0;k<N;k++){
    const leaf=document.createElement('div'); leaf.className='leaf';
    leaf.style.width=P+'px'; leaf.style.height=P+'px';
    /* nested hinge: seg0 at the spine, children hang to its left */
    let parent=leaf, right=0; const segs=[]; const faces=[];
    let consumed=0;
    SEGW.forEach((w,i)=>{
      const s=document.createElement('div'); s.className='seg';
      const wpx=w*P;
      s.style.width=(wpx+(i?OVL:0))+'px';   /* each strip tucks under its neighbour so no seam can open */
      if(i===0){ s.style.left=(P-wpx)+'px'; }
      else { s.style.left=(-wpx)+'px'; }
      const offFront = P - consumed - wpx;          /* x of this slice on the left page */
      const ff=makeFace('front',leafImgs[k][0],offFront);
      ff.style.backgroundSize=`${P}px ${P}px`; ff.style.backgroundPosition=`${-offFront}px 0`;
      const offBack = consumed - (i?OVL:0);          /* same slice seen from behind lands mirrored on the right page (overlap sits on the spine side) */
      const bb=makeFace('back',leafImgs[k][1],offBack);
      bb.style.backgroundSize=`${P}px ${P}px`; bb.style.backgroundPosition=`${-offBack}px 0`;
      if(k===N-1 && i===0){ gutR=document.createElement('div'); gutR.className='gutter r'; gutR.style.width=(0.09*P/wpx*100)+'%'; bb.appendChild(gutR); }
      /* every page dips into the binding at the spine, so the spread reads as one bound booklet (user 10/11) */
      if(i===0){ const mkG=(face,c)=>{ const d=document.createElement('div'); d.className='gutter '+c; d.style.width=(0.09*P/wpx*100)+'%'; face.appendChild(d); guts.push(d); };
        if(k>0) mkG(ff,'l'); if(k<N-1) mkG(bb,'r'); }
      s.appendChild(ff); s.appendChild(bb);
      parent.appendChild(s); parent=s; consumed+=wpx;
      segs.push(s); faces.push(ff,bb);
    });
    book.appendChild(leaf);
    leaves.push({el:leaf,segs,faces,shF:faces.filter((_,j)=>j%2===0).map(f=>f.firstChild),shB:faces.filter((_,j)=>j%2===1).map(f=>f.firstChild)});
  }
  gutL.style.width='9%';
}

let warm=null;
function warmClean(){
  if(warm) return; warm=document.createElement('div'); warm.setAttribute('aria-hidden','true');
  warm.style.cssText='position:absolute;left:0;top:0;width:2px;height:2px;opacity:.001;pointer-events:none;overflow:hidden';
  ['p10L-clean','p10R-clean'].forEach(n=>{ const d=document.createElement('div'); d.style.cssText=`width:2px;height:2px;background:url(${dir}${n}.webp${VQ}) 0 0/2px 2px`; warm.appendChild(d); });
  stage.appendChild(warm);
}
function swapClean(on){
  const sfx = on ? '-clean' : '';
  book.querySelectorAll('.face').forEach(f=>{
    if(f.dataset.img==='p10L'||f.dataset.img==='p10R') f.style.backgroundImage=`url(${dir}${f.dataset.img}${sfx}.webp${VQ})`;
  });
}

/* ---- sizing ---- */
let VW=0,VH=0, dudiTarget=null, mobile=false, nameW=0, ctaW=0;
function layout(){
  VW=stage.clientWidth; VH=stage.clientHeight;
  mobile = VW < 760;
  const newP = Math.round(mobile ? Math.min(VW*0.46, VH*0.5) : Math.min(VW*0.40, VH*0.66));
  const changed = newP!==P; P=newP;
  const d=pickDir(); const dirChanged=d!==dir; dir=d;
  if(changed||dirChanged||!leaves.length){ build(); if(stepped) swapClean(true); }
  /* portrait */
  dudi.style.width=(DUDI.w*2*P*FULL.w)+'px'; dudi.style.height=(DUDI.h*P*FULL.h)+'px';
  $('ia-dudiImg').style.width=(100/FULL.w)+'%'; $('ia-dudiImg').style.height=(100/FULL.h)+'%';
  const nameSize = mobile ? Math.min(VW*0.13, VH*0.07) : Math.min(VW*0.065, VH*0.11);
  nameEl.style.fontSize=nameSize+'px';
  nameW=nameEl.offsetWidth;
  nameEl.style.top='auto'; nameEl.style.right='auto'; nameEl.style.textAlign='center';
  /* track numbers live in the band above the album */
  const band=(VH-P*1.03)/2;
  const numSize=Math.max(40, Math.min(band*0.78, mobile? VW*0.2 : VH*0.15));
  numsEl.style.fontSize=numSize+'px'; numsEl.style.top=Math.max(12,(band-numSize)/2 - numSize*0.05)+'px';
  document.getElementById('intro').style.setProperty('--ia-book', Math.round(2*P*1.03)+'px'); ctaW=cta.offsetWidth;
  floor.style.width=(2.3*P)+'px'; floor.style.height=(0.34*P)+'px';
  floor.style.marginLeft=(-1.15*P)+'px'; floor.style.marginTop=(0.42*P)+'px';
  /* the track list on the screen: as large as fits, measured once so each line can grow out of its place on the cover */
  blF=Math.max(15, Math.min(VH*0.034, VW*(mobile?0.058:0.03), 32));
  backList.style.fontSize=blF.toFixed(2)+'px';
  /* the cover's own list is set at the same readable size and shrunk as one piece: browsers do not draw 5px type
     reliably (user 10/11, phone: the list came out tiny and jumbled) */
  if(bcList){ bcList.style.fontSize=blF.toFixed(2)+'px'; bcList.style.transform=`translate(-50%,-50%) scale(${(P*BC_K/blF).toFixed(4)})`; }
  const bw=backList.offsetWidth, bh=backList.offsetHeight;
  backItems.forEach(li=>{ li.style.transformOrigin=`${(bw/2-li.offsetLeft).toFixed(1)}px ${(bh/2-li.offsetTop).toFixed(1)}px`; });
  for(const k in varEls) delete varEls[k];
  readMetrics(); render(cur,true);
}

/* ---- easing ---- */
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const seg=(p,a,b)=>clamp((p-a)/(b-a));
const io=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const outQ=t=>1-Math.pow(1-t,4);
const mix=(a,b,t)=>a+(b-a)*t;

/* timeline (fraction of the scroll track) */
const T={tilt:[0,.09], flips:[.05,.70], settle:[.68,.75], exit:[.75,.90], name:[.83,.97]};
const FLIP_LEN=.105;
let flipLen=FLIP_LEN;   /* narrow screens: shorter turns, so there is a resting moment between pages (measureBlocks) */

/* past the end (1 → 2) the scene runs back (user 10/11): the podium and the about text go, Dudi glides back and steps
   into the page, then the back cover swings closed, the album turns to face you and its track list lifts off onto the
   screen; further on the list fades away */
let retQ=0, inBook=false, retThick=0;
function render(p,force){
  retQ = p>1 ? Math.min(1,p-1) : 0;
  inBook = retQ>=.335;
  retThick = retQ>0 ? LT()*io(seg(retQ,.36,.44)) : 0;   /* the pages get their body back before the cover closes */
  renderMain(retQ>0 ? 1-.25*io(seg(retQ,0,.34)) : p, force);
  renderReturn(retQ);
}
function renderReturn(q){
  if(!leaves.length) return;
  const lift=seg(q,.68,.84);
  if(bcList){ bcList.style.visibility = lift>0 ? 'hidden' : ''; if(lift<=0) bcList.parentNode.style.opacity=''; }
  backList.style.visibility = lift>0 ? 'visible' : 'hidden';
  if(q<.36) return;
  const sw=io(seg(q,.40,.56));                 /* the back cover swings over */
  const cen=io(seg(q,.50,.64));                /* the closed album slides to the middle */
  const pres=io(seg(q,.54,.68));               /* and grows a little to show its back */
  const back=io(seg(q,.36,.44));               /* it steps back a little first, so the cover never swings up under the top bar (user 10/11) */
  const scP=clamp(Math.min(VW*(mobile?.84:.6), VH*.7)/P, 1.03, 1.7);
  const sc=mix(mix(1.03,mobile?.96:.8,back),scP,pres);
  const rx=RM?0:Math.sin(Math.PI*seg(q,.38,.66))*11, ry=RM?0:-Math.sin(Math.PI*seg(q,.42,.68))*12;   /* it leans back and turns as it closes */
  const dropY=Math.sin(Math.PI*sw)*VH*(mobile?.03:.1);   /* and dips while the cover stands up toward you */
  book.style.transform=`translate3d(${(-P/2*sc*cen).toFixed(2)}px,${dropY.toFixed(1)}px,0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
  /* the cover stays fastened to the spine and comes to rest right on top of the page stack: no gap (user 10/11) */
  const lt=retThick, HR=N*lt, zc=HR+lt*.6*sw;   /* the last page lies level with the page stack (renderMain), so both halves meet at the spine */
  baseEl.style.transform=`translateZ(${zc.toFixed(2)}px) rotateY(${(sw*180).toFixed(2)}deg)`;
  /* once it is shut only the back cover is drawn: the pages under it would show through it at this tiny depth */
  if(sw>=.98) leaves.forEach(L=>{ if(L.vis!==false){ L.vis=false; L.el.style.visibility='hidden'; } });
  /* fade the cover itself, not the album: fading the album flattens it and the pages would paint over the cover */
  const fo=1-io(seg(lift,.15,.75));
  shadR.style.opacity=(.7*sw*fo).toFixed(3);
  /* page edges: the left one leaves with the cover; once shut, the spine edge shows the booklet's body */
  const H=HR+lt, bo=fo.toFixed(3);
  const lb=(1-clamp(sw*2)).toFixed(3), hl=HR;   /* the body under the last page, gone once the cover lifts off it */
  blk.fL.style.cssText=`left:0;top:${P}px;width:${P}px;height:${hl.toFixed(2)}px;transform:rotateX(90deg);opacity:${lb}`;
  /* the spine binds the cover to the page stack the whole way over, so it never looks loose (user 10/11) */
  blk.sL.style.cssText=`left:0;top:0;width:${hl.toFixed(2)}px;height:${P}px;transform:rotateY(-90deg);opacity:${lb}`;
  blk.sp.style.cssText=`left:${P}px;top:0;width:${Math.max(H,zc+lt).toFixed(2)}px;height:${P}px;transform:rotateY(-90deg);opacity:${bo}`;
  /* the closing cover throws its shadow on the page under it, darkest as it comes down, so the opening reads as one booklet */
  if(sw>0 && sw<1){ const bb=180-sw*180, w=(Math.cos(bb*Math.PI/180)*85+12).toFixed(1);
    const al=bb<90 ? .14+.46*clamp((90-bb)/90) : .42*Math.sin(bb*Math.PI/180)+.08;
    castR.style.transform=`translateZ(${(HR+0.6).toFixed(2)}px)`;   /* above the top page, under the cover */
    castR.style.background=`linear-gradient(to right, rgb(0 0 0 / ${al.toFixed(3)}), rgb(0 0 0 / ${(al*.35).toFixed(3)}) ${w}%, rgb(0 0 0 / 0) 100%)`;
    castR.style.opacity=Math.min(1,sw*4).toFixed(3); }
  else castR.style.opacity='0';
  blk.fR.style.height=H.toFixed(2)+'px'; blk.sR.style.width=H.toFixed(2)+'px'; blk.sR.style.left=(2*P-H).toFixed(2)+'px';
  blk.fR.style.opacity=bo; blk.sR.style.opacity=bo;
  if(bcList) bcList.parentNode.style.opacity=fo.toFixed(3);
  if(lift<=0) return;
  /* each line leaves the cover in turn and grows to its place on the screen; later the lines rise and fade */
  const r=P*BC_K*scP/blF, out=seg(q,.90,1);
  /* where the cover really is on screen (perspective shifts it a little off the middle), so each line starts on it */
  let dx=0, dy=0;
  if(lift<1 && bcList){ const a=bcList.parentNode.getBoundingClientRect(), s=stage.getBoundingClientRect();
    dx=(a.left+a.right)/2-(s.left+s.width/2); dy=(a.top+a.bottom)/2-(s.top+s.height/2); }
  backItems.forEach((li,i)=>{
    const t=RM ? io(lift) : io(seg(lift,i*.035,i*.035+.5)), o=RM ? out : seg(out,i*.025,i*.025+.65);
    li.style.transform=`translate(${(dx*(1-t)).toFixed(1)}px,${(dy*(1-t)-o*22).toFixed(1)}px) scale(${mix(r,1,t).toFixed(4)})`;
    li.style.opacity=(1-o).toFixed(3);
    li.style.setProperty('--lt', t.toFixed(3));
  });
}
function renderMain(p,force){
  if(!leaves.length) return;
  const tTilt=io(seg(p,...T.tilt)), tSet=io(seg(p,...T.settle)), tExit=seg(p,...T.exit), eExit=io(tExit);

  /* flip progress per leaf */
  const span=T.flips[1]-T.flips[0]-flipLen, fs=[];
  const raw=[];
  for(let k=0;k<N;k++){ const s=T.flips[0]+k*span/(N-1); raw.push(seg(p,s,s+flipLen)); fs.push(io(raw[k])); }

  /* a rustle each time a page starts to lift, in either direction */
  if(prevRaw){ for(let k=0;k<N;k++){ const a=prevRaw[k], b=raw[k];
    if((a<.1&&b>=.1)||(a>.9&&b<=.9)) void(k===0); } }
  prevRaw=raw;

  /* the track numbers of the spread being uncovered drift up above the album */
  let best=-1, wBest=0;
  for(let k=1;k<N;k++){ const w=Math.sin(Math.PI*clamp((raw[k]-.35)/.65)); if(w>wBest){wBest=w;best=k;} }
  if(best>0){
    const ns=SONGS[best]; if(numA.textContent!==ns[0]){ numA.textContent=ns[0]; numB.textContent=ns[1]||''; numB.hidden=!ns[1]; }
    const t=clamp((raw[best]-.35)/.65);
    S(numsEl,'opacity',(Math.pow(wBest,1.2)*0.62).toFixed(3));
    S(numsEl,'transform',`translateY(${((1-t)*18-t*10).toFixed(1)}px)`);
  } else S(numsEl,'opacity','0');

  /* book pose */
  /* a real viewing angle: the album leans back and swings slowly through the turns, then lies flat to hand over the portrait */
  const flipT=seg(p,T.flips[0],T.flips[1]), live=1-tSet;
  const rx = mix(mix(32,19,tTilt),0,tSet) + view.y*-5*live;
  const ry = (mix(-6,6,io(flipT))*tTilt)*live + view.x*7*live;
  const rz = mix(-7,0,tTilt);
  const tx = (P/2)*(1-fs[0]);                       /* closed book sits on the left of the spine → centre it */
  const sc = mix(mix(.8,.88,tTilt),1.03,tSet) * mix(1,.94,eExit);   /* a little smaller while it stands in 3D, so a lifting page never leaves the frame */
  const ty = mix(-.04*P,0,tTilt) + (mobile ? 0 : VH*.145*tTilt*live);   /* computers (user 17/11): the album sits a little lower while its pages turn, so a lifting page stays clear of the top bar; it is back in the centre by the time it lies flat */
  book.style.transform=`translate3d(${tx}px,${ty}px,0) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`;
  const lt=Math.max(LT()*live, retThick);   /* thickness collapses as the spread lies flat for the portrait */

  let topL=-1, topR=-1; for(let k=0;k<N;k++){ if(fs[k]===0 && topL<0) topL=k; if(fs[k]===1) topR=k; }
  /* both halves meet level at the spine (user 10/11): the thinner stack is raised to the thicker one, smoothly as pages travel */
  const HLc=(1+fs.reduce((a,f)=>a+1-f,0))*lt, HRc=fs.reduce((a,f)=>a+f,0)*lt, Hm=Math.max(HLc,HRc);
  const offL=(Hm-HLc), offR=(Hm-HRc)*clamp(lt>0?HRc/lt:0);
  for(let k=0;k<N;k++){
    const f=fs[k], L=leaves[k];
    const vis=(f>0&&f<1)||k===topL||k===topR; if(L.vis!==vis){ L.vis=vis; L.el.style.visibility=vis?'':'hidden'; }
    const ang=f*180, curl=Math.min(Math.sin(Math.PI*f)*62, 179.4-ang);     /* total roundness, peaks mid-turn */
    /* each leaf rests at its true height in the stack it lies on, and travels between the two */
    const zL=(N-k+1)*lt, zR=(k+1)*lt;
    const z = mix(zL+offL,zR+offR,f) + 0.3;
    /* bound at the spine (user 10/11): the part by the binding lags behind and the sheet bends out of it, instead of
       the whole page standing up like a loose card */
    const lag=Math.sin(Math.PI*f)*26, hinge=ang-lag;
    L.el.style.transform=`translateZ(${z.toFixed(2)}px) rotateY(${hinge.toFixed(3)}deg)`; if(L.f===f) continue; L.f=f;
    /* angle of each strip → shade; blended across joints so the curve reads as one continuous surface */
    let a=hinge; const A=[], SH=[];
    for(let i=0;i<NSEG;i++){
      const r = i ? (curl*i + lag*(NSEG-i))/JW : 0;      /* the curl grows toward the free edge, the lag is taken up near the binding */
      if(i) L.segs[i].style.transform=`rotateY(${r}deg)`;
      a+=r; A.push(a);
      /* shade as the strip turns edge-on, plus a soft sheen where it catches the light */
      if(f===0||f===1){ SH.push(0); continue; }
      const sh=Math.pow(Math.abs(Math.sin(a*Math.PI/180)),1.3)*0.58;
      const sheen = a<90 ? Math.exp(-Math.pow((a-32)/15,2))*0.34 : Math.exp(-Math.pow((a-150)/15,2))*0.26;
      SH.push(sh-sheen);
    }
    for(let i=0;i<NSEG;i++){
      const inner=(SH[i]+(i?SH[i-1]:SH[i]))/2, outer=(SH[i]+(i<NSEG-1?SH[i+1]:SH[i]))/2;
      const front=A[i]<90;
      const sF=L.shF[i].style, sB=L.shB[i].style;
      const col=v=> v>=0 ? `rgb(8 16 15 / ${v.toFixed(3)})` : `rgb(255 255 255 / ${(-v).toFixed(3)})`;
      if(front){ if(sF.opacity!=='1') sF.opacity=1; sF.background=`linear-gradient(to left, ${col(inner)}, ${col(outer)})`; if(sB.opacity!=='0') sB.opacity=0; }
      else { if(sB.opacity!=='1') sB.opacity=1; sB.background=`linear-gradient(to right, ${col(inner)}, ${col(outer)})`; if(sF.opacity!=='0') sF.opacity=0; }
    }
  }

  /* page blocks: left holds the base + every leaf still lying there, right every leaf that has landed */
  const onL=fs.filter(f=>f<=.002).length, onR=fs.filter(f=>f>=.998).length;
  const HL=HLc+offL, HR=HRc+offR;
  baseEl.style.transform=`translateZ(${(lt+offL).toFixed(2)}px)`;
  const bs=(e,css)=>{ if(e._css!==css){ e._css=css; e.style.cssText=css; } };
  bs(blk.fL,`left:0;top:${P}px;width:${P}px;height:${HL}px;transform:rotateX(90deg)`);
  bs(blk.fR,`left:${P}px;top:${P}px;width:${P}px;height:${HR}px;transform:rotateX(90deg);opacity:${HR>.01?1:0}`);
  bs(blk.sL,`left:0;top:0;width:${HL}px;height:${P}px;transform:rotateY(-90deg)`);
  bs(blk.sR,`left:${2*P-HR}px;top:0;width:${HR}px;height:${P}px;transform:rotateY(90deg);opacity:${HR>.01?1:0}`);
  { const lo=Math.min(HL,HR), d=Math.abs(HL-HR); bs(blk.sp,`left:${P}px;top:0;width:${d.toFixed(2)}px;height:${P}px;transform:translateZ(${lo.toFixed(2)}px) rotateY(-90deg);opacity:${d>.2?1:0}`); }
  /* no cast shadow from the turning page (user 10/11, phone: it jumped while scrolling); the page keeps its own shading */
  castL.style.opacity=0; castR.style.opacity=0;
  /* the floor belongs to the 3D scene; it lets go as the spread turns to face you */
  S(ground,'opacity',(live*tTilt*0.9+0.1*live).toFixed(3));
  S(shadL,'opacity',(0.85*live).toFixed(3));
  shadR.style.opacity=(0.85*live*clamp(fs[0]*1.6)).toFixed(3);   /* also written by renderReturn: always written */
  S(wavesEl,'opacity',(0.07*eExit).toFixed(3));
  S(beamEl,'opacity',(1-eExit*0.6).toFixed(3));
  /* the spread joins into one picture before the portrait lifts */
  const g = 1-tSet; S(gutL,'opacity',g); if(gutR) S(gutR,'opacity',g);
  if(g!==gutsG){ gutsG=g; const go=(g*.8).toFixed(3); for(const e of guts) e.style.opacity=go; }

  /* album fades away, portrait lifts out */
  const fade = 1-clamp(tExit/0.6);
  S(book,'opacity',fade.toFixed(3));
  S(book,'filter','none');
  S(floor,'opacity','0');
  S(floor,'transform',`translateX(${tx*0.6}px) scale(${mix(.6,1,tTilt)})`);

  /* portrait geometry (book is flat & centred from settle onward) */
  const bookW=2*P*1.03, bookH=P*1.03;
  const bx = VW/2 - bookW/2, by = VH/2 - bookH/2;
  const sx = bx + DUDI.x*bookW, sy = by + DUDI.y*bookH, sw=DUDI.w*bookW, sh=DUDI.h*bookH;
  const baseW=DUDI.w*2*P, baseH=DUDI.h*P;          /* album cut-out at book scale */
  const fw=baseW*FULL.w, fh=baseH*FULL.h;            /* full-length box at the same scale */
  /* where he ends up: standing full length, feet just above the floor of the screen */
  let th2, tcx, footY;
  if(mobile){ th2=VH*0.48; tcx=VW*0.5; footY=VH*0.74; }   /* raised so the two buttons fit under the podium (user 09/11) */   /* the podium (305 units tall) adds .19 of his height under his feet */   /* phones: smaller, in the centre; the about card rides over him afterwards (user 08/11) */
  else { const sw=io(seg(p,.855,.945)); const hh=M.hdrH; th2=Math.min(VH*0.76,(VH*0.98-hh-26)/1.18); tcx=VW*mix(0.56,0.73,sw); footY=VH*0.98-th2*0.18;   /* his hat stays clear of the top bar (user 09/11) */ }   /* user 08/11: he simply glides to the right, no bounce or hop */
  const s0=sw/baseW, s1=th2/fh;
  const x1=tcx-fw*s1*0.68, y1=footY-fh*s1;   /* his feet (not the photo box, which includes the raised arm) stand at the podium's centre (user 09/11) */
  const s=mix(s0,s1,eExit), x=mix(sx,x1,eExit), y=mix(sy,y1,eExit);
  S(dudi,'transform',`translate3d(${x}px,${y}px,0) scale(${s})`);
  { const W=th2*0.62, H=W*305/300; S(podium,'width',W+'px'); S(podium,'height',H+'px');
    S(podium,'transform',`translate3d(${(tcx-W/2).toFixed(1)}px,${(footY-H*POD_FEET).toFixed(1)}px,0)`);
    podBottom=footY+H*(1-POD_FEET);
    const pe=outQ(seg(p, mobile ? .955 : .972, .997));   /* rises together with the buttons (user 09/11) */ S(podium,'opacity',pe.toFixed(3)); S(podium,'translate',`0 ${((1-pe)*VH*.04).toFixed(1)}px`); }
  /* the legs grow out of the page edge as he lifts; the album's tint gives way to the full photo */
  const c0=1/FULL.h, grow=io(seg(tExit,.04,.8));
  SV(dudi,'--cut', (mix(c0,1.06,grow)*100).toFixed(2)+'%');
  SV(dudi,'--soft', (Math.sin(Math.PI*grow)*7).toFixed(2)+'%');
  S(dudiNewEl,'opacity',io(seg(tExit,0,.4)).toFixed(3));
  S(dudiImgEl,'opacity',(1-io(seg(tExit,.3,.65))).toFixed(3));
  /* no flash at the hand-over (user 08/11): the cut-out stays composited (invisibly) the whole time so its picture is
     ready, it shows a moment before the page under it is swapped for the empty one, and only then the swap happens */
  const out = !inBook && p>=T.settle[1]-0.004;   /* once he is back in the page, the page carries him again */
  S(dudi,'opacity', !inBook && p>=T.settle[1]-0.014 ? '1' : '0.001');
  if(out!==stepped){ stepped=out; swapClean(out); }
  SV(dudi,'--rim', eExit.toFixed(3));
  S(halo,'opacity',(io(seg(p,.78,.95))*0.9).toFixed(3));
  S(halo,'left', tcx+'px');

  /* name sits above the raised hand, clear of the hat, inside the gutter */
  const handX=x1+HAND.x*fw*s1, handTop=y1+HAND.top*fh*s1, hatL=x1+HAT_L*fw*s1;
  const half=nameW/2+16;
  let nL=Math.min(VW-half,Math.max(half,Math.min(handX,hatL-24-nameW/2)))+'px', nB=(VH-handTop+VH*0.03)+'px';
  if(mobile){ nL=(VW/2)+'px'; nB=(VH-y1+VH*0.035)+'px'; }   /* phones: above his head, clear of the about text on the left */
  if(!mobile){
    /* it sits between the top bar and the about text; on short screens it gets a little smaller so its tall letters
       never go under the bar (user 09/11) */
    /* measured before anything on the page was changed this frame (readMetrics), so the browser need not lay the page out again */
    const hb=M.hdrH;
    const txt=M.abTop!==null ? M.abTop-12 : VH*0.25, bot=Math.min(VH*0.25, txt);
    const nh=M.nameH*1.25, room=bot-(hb+20), k=Math.max(.55, Math.min(1, room/nh));
    nL=(VW*0.29)+'px'; nB=(VH-bot)+'px';
    S(nameEl,'transformOrigin','50% 100%'); S(nameEl,'scale',k.toFixed(3));
  } else { S(nameEl,'transformOrigin',''); S(nameEl,'scale',''); }
  /* each value is written once, and only when it changed (23/11): the name was being re-styled ~30 times a frame */
  S(nameEl,'left',nL); S(nameEl,'bottom',nB);

  /* name: brush reveal, right-to-left like the hand writes it */
  const n=mobile ? seg(p,...T.name) : seg(p,.925,.985);
  const a1=outQ(n), a2=a1;
  SV(n1El,'--m', (a1*100)+'%'); SV(n1El,'--v', a1);
  SV(n2El,'--m', (a2*100)+'%'); SV(n2El,'--v', a2);
  /* on the way back the about text leaves with the name, but the big opening name must not come back */
  rootVar('--intro-name', retQ>0 ? '1' : ((a1+a2)/2).toFixed(3));
  rootVar('--intro-about', retQ>0 ? a1.toFixed(3) : '1');
  S(nameEl,'translate','-50% 0');

  /* the scroll hint: once it has faded out it is taken off the page, so its little animation stops altogether (23/11) */
  const cueO = p<.02 ? .75 : Math.max(0,.75-(p-.02)*20);
  S(cue,'opacity',String(cueO)); S(cue,'display', cueO>0 ? '' : 'none');


  /* buttons arrive once the name is written */
  const c=outQ(seg(p, mobile ? .955 : .972, .997));
  S(cta,'opacity',c.toFixed(3)); S(cta,'transform',`translateY(${((1-c)*16).toFixed(1)}px)`);
  if(cta.classList.contains('live')!==(c>.6)) cta.classList.toggle('live', c>.6);
  rootVar('--intro-end', retQ>0 ? '1' : c.toFixed(3));   /* the side icons stay */
  if(mobile){ S(cta,'left',(VW/2)+'px'); S(cta,'bottom','auto'); S(cta,'top',(podBottom+14).toFixed(0)+'px'); }   /* right under the podium (user 09/11) */
  else {
    const h2=(ctaW||360)/2+16;
    const coatL=x1+COAT_L*fw*s1-24;   /* keep the buttons in the clear space left of the coat */
    S(cta,'left',Math.max(h2,coatL-(ctaW||360)/2)+'px'); S(cta,'top','auto'); S(cta,'bottom',(VH*0.12)+'px');
  }
  par.w=eExit*eExit;
}

/* ---- scroll with gentle inertia ---- */
let target=0, cur=0, raf=0, prevRaw=null;
/* 24/11 (חיים: "כשיש חלונית שעולה על רשימת השירים בדיסק — שלא יתהפך דף"):
   במסכים צרים (טלפון, מחשב נייד צר) תיבות התוכן עוברות מעל האלבום. עכשיו הדפים מתהפכים רק בקטעי הגלילה שבהם
   אף תיבה לא מכסה את האלבום; כשתיבה מעליו — האלבום עומד. במסך רחב התיבות בצד והאלבום בצד השני, ולכן אין שינוי.
   blocks = קטעי גלילה (במרחק מראש המסלול) שבהם תיבה מכסה את האלבום; נמדד מחדש כשהתוכן משנה גודל. */
let blocks=[], blocksDirty=true;
if(window.ResizeObserver){ const ro=new ResizeObserver(()=>{ blocksDirty=true; }); const ct=document.querySelector('#ia-track .ia-content'); if(ct) ro.observe(ct); ro.observe(track); }
addEventListener('resize',()=>{ blocksDirty=true; });
function measureBlocks(){
  blocksDirty=false; blocks=[];
  if(stage.clientWidth>=1100 || book.offsetParent!==stage) return;
  /* where the album sits on the screen while its pages turn: its own box, before any movement is applied */
  const pad=36, bTop=book.offsetTop-pad, bBot=book.offsetTop+book.offsetHeight+pad;
  const tTop=track.getBoundingClientRect().top;
  for(const box of document.querySelectorAll('#ia-track .ia-content .ia-row .ia-side')){
    if(!box.offsetHeight || box.closest('#ia-finale')) continue;
    const r=box.getBoundingClientRect(), T=r.top-tTop;   /* the box's place along the track */
    blocks.push([T-bBot, T+r.height-bTop]);               /* the stretch of scrolling during which it is over the album */
  }
  blocks.sort((a,b)=>a[0]-b[0]);
  const m=[]; for(const b of blocks){ const l=m[m.length-1]; if(l && b[0]<=l[1]) l[1]=Math.max(l[1],b[1]); else m.push(b.slice()); }
  blocks=m;
  flipLen=blocks.length ? .062 : FLIP_LEN;
}
/* 24/11 (חיים: "במעבר הדפדוף לשיר 1 הוא נשאר תקוע באמצע"): הדפים מתהפכים בחפיפה — דף מתחיל לפני שהקודם נחת —
   ולכן כל עצירה מתחת לתיבה השאירה דף באמצע הדרך. עכשיו, כשיש תיבות מעל האלבום (מסך צר), כל דף מתהפך מהר יותר
   כך שיש רגע מנוחה בין דף לדף, וההיפוכים מחולקים בין הקטעים הגלויים: כל היפוך מתחיל ונגמר באותו קטע גלוי,
   והאלבום עוצר תמיד כשכל הדפים שוכבים. במסך רחב — כמו קודם.
   flipMap: איפה הסצנה (p) בנקודת גלילה y, בין y0 ל-y1, מ-p0 עד .75 (סוף ההיפוכים). */
function flipMap(y,y0,y1,p0){
  const lin=()=>p0+clamp((y-y0)/Math.max(1,y1-y0))*(.75-p0);
  if(!blocks.length) return lin();
  /* the uncovered stretches between y0 and y1 */
  const gaps=[]; let cur=y0;
  for(const [s,e] of blocks){ if(s>cur) gaps.push([cur,Math.min(s,y1)]); cur=Math.max(cur,e); if(cur>=y1) break; }
  if(cur<y1) gaps.push([cur,y1]);
  const g=gaps.filter(([a,b])=>b-a>1), F=g.reduce((t,[a,b])=>t+b-a,0);
  if(F<(y1-y0)*.1) return lin();   /* almost always covered: turn as before rather than in a rush */
  /* resting points: where one page has landed and the next has not lifted yet */
  const span=T.flips[1]-T.flips[0]-flipLen, R=[p0];
  for(let k=0;k<N;k++){ const s=T.flips[0]+k*span/(N-1); if(s>p0+1e-4) R.push(s); }
  R.push(.75);
  const M=R.length-1;
  /* whole turns for every uncovered stretch, as many as its length allows */
  const want=g.map(([a,b])=>M*(b-a)/F), n=want.map(Math.floor);
  let left=M-n.reduce((t,v)=>t+v,0);
  want.map((v,i)=>[v-Math.floor(v),i]).sort((a,b)=>b[0]-a[0]).forEach(([,i])=>{ if(left>0){ n[i]++; left--; } });
  let c=0;
  for(let j=0;j<g.length;j++){
    const [a,b]=g[j];
    if(y<a) return R[c];                      /* under a box, or before the first open stretch: resting */
    if(y<=b){
      const idx=c+clamp((y-a)/(b-a))*n[j], i0=Math.min(M-1,Math.floor(idx));
      return n[j] ? R[i0]+(R[i0+1]-R[i0])*clamp(idx-i0) : R[c];
    }
    c+=n[j];
  }
  return R[M];
}
function readScroll(){
  if(blocksDirty) measureBlocks();
  const r=track.getBoundingClientRect();
  /* the last stretch (#ia-return) runs the scene back and hands over the track list: timeline 1 → 2 */
  const rt=$('ia-return'), R=rt ? rt.offsetHeight : 0;
  const total=Math.max(1, track.offsetHeight - stage.offsetHeight - R);
  if(R && -r.top>total){ target=1+clamp((-r.top-total)/R); return; }
  const y=clamp(-r.top, 0, total);
  const fin=document.getElementById('ia-finale');
  const fh=fin ? Math.min(fin.offsetHeight, total) : total*.25, a=total-fh;
  const hz=document.getElementById('ia-herozone'), h0=hz ? Math.min(hz.offsetHeight, a) : 0;   /* opening stretch: photo + album growing, pages stay closed */
  if(mobile && h0>0){
    /* phones (user 08/11): the cover opens at the end of the opening stretch, so the album is already open
       before the track list rides in; the remaining pages turn over the rest of the content as before */
    const op=T.flips[0]+flipLen, h1=h0*.3, h2=h0*.85;
    if(y<=a){ target = y<=h1 ? 0 : y<=h0 ? io(Math.min(1,(y-h1)/(h2-h1)))*op : (a>h0 ? flipMap(y,h0,a,op) : .75); return; }
    /* the ending: he steps out and the name is written, then it holds while the about card passes over him,
       and the end buttons arrive once the card has gone by (home.js places the card and sizes this stretch) */
    const ab=document.querySelector('#ia-finale > #about'), D=VH*.9, off=y-a-D;   /* he steps out only once the shop box has left the screen (user 08/11) */
    if(off<0){ target=.75; return; }
    if(ab && ab.offsetHeight){
      const T0=ab.offsetTop - D - VH*.1, T1=ab.offsetTop - D + ab.offsetHeight + VH*.6;
      target = off<=T0 ? .75 + (off/Math.max(1,T0))*.2 : off<=T1 ? .95 : .95 + Math.min(1,(off-T1)/Math.max(1,fh-D-T1))*.05;
    } else target = .75 + Math.min(1,off/Math.max(1,fh*.7))*.25;
    return;
  }
  target = y<=h0 ? 0 : y<=a ? (a>h0 ? flipMap(y,h0,a,0) : .75) : .75 + Math.min(1,(y-a)/Math.max(1,fh*.7))*.25;
}
/* sizes the scene reads while it draws, measured up front (23/11): reading them after the scene had moved made the
   browser lay the whole page out again in the middle of every frame */
const M={hdrH:80, abTop:null, nameH:0};
let hdrEl=null;
function readMetrics(){
  if(!hdrEl || !hdrEl.isConnected) hdrEl=document.querySelector('.site-header');
  M.hdrH=(hdrEl && hdrEl.offsetHeight)||80;
  const ab=document.querySelector('#about .ia-side');
  M.abTop=ab ? ab.getBoundingClientRect().top : null;
  M.nameH=nameEl.offsetHeight;
}
/* the scene follows the scroll directly (23/11). It used to add its own glide on top of the smooth scrolling, so on a
   computer the album trailed the page twice over and kept drifting after the wheel stopped; on phones the scroll
   already glides by itself. The page-wide frame loop (assets/js/frame.js) runs it in step with the scrolling. */
function onScroll(){ readScroll(); readMetrics(); cur=target; render(cur); }
/* 23/11 (פרק "שלושה עשורים" אחרי הסצנה): כשהסצנה כולה כבר מעל המסך, היא ציירה את עצמה בכל פריים בלי שאיש רואה
   (נמדד: כ-7 אלפיות לפריים במחשב חלש). עכשיו מציירים פעם אחת במצב הסופי ואז נחים, עד שהיא חוזרת למסך. */
let drawn=NaN, sceneOff=false;
const frameJob={
  read(){ readScroll(); sceneOff=track.getBoundingClientRect().bottom<0; if(!(sceneOff&&target===drawn)) readMetrics(); },
  write(){ if(sceneOff&&target===drawn) return; cur=target; render(cur); drawn=cur; }
};

/* ---- preload, then reveal ---- */
function preload(){
  warmClean();
  P = 1; layout();
  const names=new Set([BASE,'p10L-clean','p10R-clean']); leafImgs.forEach(([a,b])=>{names.add(a);names.add(b)});
  const list=[...names].map(n=>dir+n+'.webp'+VQ);
  const first=[dir+'cover.webp'+VQ];
  /* resolve on load; decode is a bonus, never something to wait on forever */
  const load=src=>new Promise(res=>{const i=new Image(); i.onload=i.onerror=()=>{ if(i.decode) i.decode().catch(()=>{}); res(); }; i.src=src;});
  const dd=matchMedia('(max-width:759px)').matches?'assets/anim/img/m/':'assets/anim/img/';
  $('ia-dudiImg').src=dd+'dudi.webp'+VQ; $('ia-dudiNew').src=dd+'dudi-full.webp?v=2';
  let shown=false; const show=()=>{ if(shown) return; shown=true; const l=$('ia-loading'); if(!l) return; l.style.opacity=0; setTimeout(()=>l.remove(),700); };
  Promise.all(first.map(load)).then(show); setTimeout(show,5000);
  list.forEach(load); load(dd+'dudi.webp'+VQ); load(dd+'dudi-full.webp?v=2');
}

/* a machine found to be slow while scrolling: rebuild the pages from fewer strips and let go of the pointer tilt */
document.addEventListener('dk:lite',()=>{
  view.x=view.y=vt.x=vt.y=0; par.tx=par.ty=0; if(!par.raf) par.raf=requestAnimationFrame(parTick);
  if(NSEG!==6 && leaves.length){ setSegs(6); build(); if(stepped) swapClean(true); render(cur,true); }
});
if(window.DK_FRAME) DK_FRAME.add(frameJob); else addEventListener('scroll',onScroll,{passive:true});
/* the phone's address bar hiding fires resize with the scene's size unchanged: the scene then just follows the scroll, with no snap (17/11) */
addEventListener('resize',()=>{ if(stage.clientWidth===VW&&stage.clientHeight===VH){ if(!window.DK_FRAME) onScroll(); return; } layout(); readScroll(); render(cur=target,true); });
addEventListener('load',()=>{ for(const k in varEls) delete varEls[k]; readScroll(); readMetrics(); render(cur=target,true); });
/* the track list is measured with the real fonts once they arrive, so the lines leave the cover from the right spot */
if(document.fonts) document.fonts.ready.then(()=>{ layout(); render(cur,true); });
/* the track names follow the site data (admin), the booklet's list is the fallback */
fetch('data/site.json').then(r=>r.json()).then(d=>{ const t=d&&d.album&&d.album.tracks; if(!Array.isArray(t)||!t.length) return;
  const html=t.map((n,i)=>`<li><b>${String(i+1).padStart(2,'0')}</b><span></span></li>`).join('');
  for(const ol of [backList,bcList]){ if(!ol) continue; ol.innerHTML=html; [...ol.querySelectorAll('span')].forEach((s,i)=>{ s.textContent=t[i]; }); }
  backItems.length=0; backItems.push(...backList.children); BACK_TRACKS.length=0; BACK_TRACKS.push(...t);
  layout(); render(cur,true); }).catch(()=>{});
preload();
readScroll(); readMetrics(); cur=target; render(cur,true);
/* read-only view for checks: where the scene is (0..2) and the stretches in which a box covers the album */
window.DK_SCENE={ get p(){ return target; }, get blocks(){ return blocks.map(b=>b.slice()); }, get flip(){ return { len:flipLen, from:T.flips[0], to:T.flips[1], n:N }; } };
})();
