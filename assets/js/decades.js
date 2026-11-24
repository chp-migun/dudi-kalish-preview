/* פרק בסיפור של דף הבית: "שלושה עשורים של יצירה" (23/11, אבן 11; שונה 24/11 לבקשת חיים).
   ציר זמן אופקי של כל האלבומים, מ-2000 ועד "קול דודי".
   24/11: גלילה רגילה למטה ממשיכה בדף ולא עוברת על הדיסקים (קודם הדף נעצר והיה צריך לגלול הרבה כדי להמשיך).
   על הדיסקים עוברים לרוחב: גלילה הצידה (לוח מגע, או Shift עם גלגלת), גרירה בעכבר, החצים, מקשי החיצים, או החלקה בטלפון.
   - האלבום שבמרכז גדל, והשכנים קטנים ודוהים; שנה ענקית ברקע מתחלפת לפי האלבום שבמרכז; פס התקדמות מתמלא.
   - לחיצה על עטיפה מנגנת את כל האלבום בנגן הקבוע; לחיצה נוספת עוצרת. האלבום שמתנגן מסומן "מתנגן".
   - "פחות תנועה": בלי הגדלה והקטנה, רק השורה עצמה.
   התוכן מנתוני האלבומים בממשק הניהול; אלבום בלי שנה לא נכנס לציר (אין לו מקום בזמן). */
(() => {
  const sec = document.getElementById("decades");
  if (!sec) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* the dial's digits: a clean modern face, only for this chapter (same font service as the rest of the site) */
  document.head.insertAdjacentHTML("beforeend", '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&display=swap">');
  document.head.insertAdjacentHTML("beforeend", `<style>
  #decades{position:relative;background:var(--bg);isolation:isolate;overflow:hidden;padding:clamp(70px,10vh,120px) 0 clamp(50px,7vh,80px);
    --cw:clamp(150px,17vw,240px);--gap:clamp(18px,2.2vw,32px)}
  #decades [hidden]{display:none!important}
  .dc-head{text-align:center;padding:0 16px;position:relative;z-index:2}
  .dc-head .eyebrow{text-align:center;color:var(--teal-light);direction:ltr}
  .dc-head h2{font-size:clamp(44px,6.4vw,92px);margin:.08em 0 .1em}
  .dc-head p{color:var(--ink-soft);font-size:clamp(15px,1.25vw,18px);line-height:1.6;max-width:52ch;margin:0 auto;text-wrap:balance}
  .dc-year{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;z-index:0;font-family:"Space Grotesk",var(--f-num);font-weight:600;font-size:clamp(150px,30vw,460px);line-height:1;
    color:transparent;-webkit-text-stroke:1.5px rgb(172 196 195 / .16);letter-spacing:-.02em;direction:ltr;user-select:none;translate:0 8%}
  .dc-wrap{position:relative;z-index:1;margin-top:clamp(18px,3vh,36px)}
  /* the row slides by itself (24/11, "very light and smooth"): only a sideways shift of the whole row, eased like the
     page's own smooth scrolling. Up-and-down scrolling and swiping pass straight through to the page (pan-y). */
  .dc-stage{overflow:hidden;padding:34px calc(50% - var(--cw) / 2) 18px;cursor:grab;outline:none;touch-action:pan-y;user-select:none;-webkit-user-select:none}
  .dc-stage.drag{cursor:grabbing}
  .dc-stage:focus-visible{box-shadow:inset 0 0 0 1px rgb(172 196 195 / .35);border-radius:14px}
  .dc-rail{display:flex;gap:var(--gap);margin:0;padding:0;list-style:none;width:max-content;will-change:transform}
  .dc-rail li{flex:none}
  .dc-card{all:unset;box-sizing:border-box;display:block;width:var(--cw);cursor:pointer;text-align:center;transform-origin:50% 60%;will-change:transform,opacity}
  .dc-stage.drag .dc-card{cursor:grabbing}
  .dc-art{position:relative;display:block;aspect-ratio:1;border-radius:10px;overflow:hidden;background:var(--bg-3);
    box-shadow:0 26px 60px -22px rgb(2 8 8 / .9),0 0 0 1px rgb(255 255 255 / .06)}
  .dc-art img{width:100%;height:100%;object-fit:cover;display:block;-webkit-user-drag:none;pointer-events:none}
  .dc-play{position:absolute;inset-inline-end:10px;bottom:10px;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:var(--red);color:#fff;
    box-shadow:0 10px 24px -8px rgb(0 0 0 / .8);opacity:0;transform:scale(.85);transition:opacity .25s,transform .3s cubic-bezier(.2,.8,.2,1)}
  .dc-play svg{width:20px;height:20px;translate:2px 0}
  .dc-card.is-mid .dc-play,.dc-card:hover .dc-play,.dc-card:focus-visible .dc-play{opacity:1;transform:none}
  .dc-card:focus-visible .dc-art{outline:2px solid var(--teal-light);outline-offset:4px}
  .dc-y{display:block;margin-top:14px;font-family:var(--f-num);font-size:20px;color:var(--teal);line-height:1}
  .dc-t{display:block;margin-top:6px;font-size:16px;font-weight:500;color:var(--ink);line-height:1.3;text-wrap:balance}
  .dc-r{display:block;margin-top:3px;font-size:13.5px;color:var(--ink-dim);line-height:1.4}
  .dc-card.is-new .dc-art{box-shadow:0 30px 70px -20px rgb(168 48 32 / .55),0 0 0 2px var(--red)}
  .dc-card.is-new .dc-y{color:var(--red)}
  .dc-eq{position:absolute;top:8px;inset-inline-start:8px;display:none;align-items:center;gap:7px;padding:5px 10px;border-radius:999px;background:rgb(8 14 14 / .82);color:#fff;font-size:12.5px}
  .dc-eq .dkp-eq{color:var(--red)}
  .dc-card.is-on .dc-eq{display:inline-flex}
  .dc-card.is-on:not(.is-playing) .dc-eq .dkp-eq i{animation-play-state:paused}
  /* the arrows, on both sides of the row */
  .dc-nav{position:absolute;z-index:3;top:calc(34px + var(--cw) / 2);translate:0 -50%;width:54px;height:54px;border-radius:50%;display:grid;place-items:center;padding:0;
    border:1px solid rgb(172 196 195 / .3);background:rgb(12 23 22 / .82);color:var(--ink);cursor:pointer;transition:background .2s,border-color .2s,opacity .25s}
  .dc-nav:hover{background:rgb(23 48 46 / .95);border-color:var(--teal-light)}
  .dc-nav:active{scale:.94}
  .dc-nav[disabled]{opacity:0;pointer-events:none}
  .dc-nav svg{width:22px;height:22px}
  .dc-prev{inset-inline-start:clamp(12px,3vw,48px)}
  .dc-next{inset-inline-end:clamp(12px,3vw,48px)}
  /* the years track (24/11, Chaim): a fixed 2000–2026 line, and on it one round disc wearing the cover of the album in
     the middle. Only the disc travels along the line, placed by year; it spins while the row moves and stops with it.
     The year rides above it; on the newest album ("קול דודי") it gets a red ring. */
  #decades{--d:76px}
  .dc-track{position:relative;z-index:2;width:min(820px,calc(100% - 72px));height:150px;margin:20px auto 0;direction:rtl;font-family:"Space Grotesk",var(--f-body),sans-serif}
  .dc-base{position:absolute;inset-inline:0;top:106px;height:2px;border-radius:2px;background:rgb(172 196 195 / .2)}
  .dc-prog{position:absolute;inset:0;border-radius:2px;background:linear-gradient(270deg,rgb(168 48 32 / .3),#e0553a);transform-origin:100% 50%;transform:scaleX(0);
    will-change:transform;box-shadow:0 0 10px rgb(224 85 58 / .45)}
  /* 24/11: no hairlines any more — only a small dot where albums came out, and the round years. As the disc comes near,
     the dot swells and glows and the year pops up and turns red (--k: 0 far … 1 under the disc, set while it moves) */
  /* the glow of a dot and the red copy of a year are drawn once; coming near only fades them in and enlarges them,
     which costs the screen nothing (a colour or shadow that changes every frame would be repainted every frame) */
  .dc-tk{position:absolute;top:1px;width:0;height:0}
  .dc-dot{position:absolute;left:-3px;top:-3px;width:6px;height:6px;border-radius:50%;background:rgb(172 196 195 / .55)}
  .dc-glow{position:absolute;left:-6px;top:-6px;width:12px;height:12px;border-radius:50%;background:#ff7a5c;
    box-shadow:0 0 14px 3px rgb(255 106 77 / .9);opacity:0;transform:scale(.5)}
  .dc-tk em{position:absolute;top:12px;left:0;translate:-50% 0;display:grid;font-style:normal;font-size:11.5px;font-weight:500;letter-spacing:.12em;
    white-space:nowrap}
  .dc-tk em span{grid-area:1 / 1}
  .dc-l0{color:var(--ink-dim)}
  .dc-l1{color:#ff8a70;text-shadow:0 0 12px rgb(255 90 60 / .75);opacity:0}
  /* a ring that spreads out of the disc each time it reaches the next album */
  .dc-ring{position:absolute;inset:0;border-radius:50%;border:2px solid rgb(255 106 77 / .85);pointer-events:none;box-shadow:0 0 14px rgb(255 106 77 / .5)}
  .dc-pin{position:absolute;top:107px;right:0;width:0;height:0;will-change:transform}
  /* the shadow and the red ring sit on the disc itself, outside the round cut below */
  .dc-disc{position:absolute;left:calc(var(--d) / -2);top:calc(var(--d) / -2);width:var(--d);height:var(--d);border-radius:50%;
    box-shadow:0 14px 34px -8px rgb(0 0 0 / .85),0 0 0 1px rgb(255 255 255 / .14);transition:box-shadow .3s,scale .55s cubic-bezier(.2,.8,.2,1)}
  /* 24/11: the picture sometimes showed square — while it fades and the disc turns, the browser can skip a rounded
     "overflow" cut of the box around it. So each picture (and each layer on it) is rounded by itself, which is never
     skipped and costs nothing while turning (a clip-path did the same but was heavy to redraw every frame) */
  .dc-spin{position:absolute;inset:0;border-radius:50%;background:#141a19;will-change:transform}
  /* the cover is the background of a round layer: the round cut is the disc's own edge, so a smaller cover (the newest
     album) still shows whole inside it, and the cut never turns square while fading and turning */
  .dc-face{position:absolute;inset:0;border-radius:50%;background:#141a19 center / 100% 100% no-repeat;
    transition:opacity .35s,background-size .55s cubic-bezier(.2,.8,.2,1)}
  .dc-spin::before,.dc-spin::after{transition:opacity .4s}
  /* the newest album (24/11, Chaim: a disc like the others, only bigger): the cover sits a little smaller inside the
     disc, leaving a thin dark rim like a real disc's edge, so the name in its lower corner is not cut by the circle */
  /* the newest album has a picture made for the disc (assets/img/albums/disc-kol-dudi.webp): the cover without its white
     frame, its own colours carried out to the edge, and the name placed inside the circle — no square, nothing cut */
  /* fine grooves over the picture, and the hole in the middle */
  .dc-spin::before{content:"";position:absolute;inset:0;z-index:1;border-radius:50%;
    background:repeating-radial-gradient(circle,transparent 0 2px,rgb(0 0 0 / .1) 2px 3px)}
  .dc-spin::after{content:"";position:absolute;z-index:2;left:50%;top:50%;width:18%;height:18%;translate:-50% -50%;border-radius:50%;background:var(--bg);
    box-shadow:0 0 0 3px rgb(255 255 255 / .28),0 0 0 4px rgb(0 0 0 / .35)}
  /* the shine stays put while the disc turns under it, like light on a real disc */
  .dc-shine{position:absolute;inset:0;border-radius:50%;pointer-events:none;
    background:conic-gradient(from 210deg,transparent 0 9%,rgb(255 255 255 / .26) 15%,transparent 23% 57%,rgb(255 255 255 / .16) 63%,transparent 71%)}
  /* on the newest album the disc stands upright (the turning stops, see below) and grows a little */
  .dc-disc.is-new{scale:1.65;box-shadow:0 0 0 3px var(--red),0 0 24px rgb(224 85 58 / .65),0 14px 34px -8px rgb(0 0 0 / .85)}
  .dc-tag{position:absolute;bottom:calc(100% + 9px);left:50%;translate:-50% 0;font-size:15px;font-weight:600;letter-spacing:.06em;line-height:1;color:#fff;
    white-space:nowrap;text-shadow:0 0 14px rgb(224 85 58 / .6)}
  .dc-disc.is-new .dc-tag{color:#ff8a70}
  @media (max-width:759px){#decades{--d:58px}.dc-track{width:calc(100% - 116px);height:132px}.dc-base,.dc-pin{top:96px}.dc-tk em{font-size:10px;letter-spacing:.04em}}
  /* the mouse (computers only): a soft red light follows it behind the albums, the huge year drifts the other way, and
     the cover under the pointer leans towards it with a shine that follows */
  .dc-spot{position:absolute;z-index:0;left:0;top:0;width:680px;height:680px;margin:-340px 0 0 -340px;border-radius:50%;pointer-events:none;opacity:0;
    background:radial-gradient(closest-side,rgb(224 85 58 / .17),rgb(224 85 58 / .06) 55%,transparent);transition:opacity .6s;will-change:transform}
  #decades.mouse-on .dc-spot{opacity:1}
  .dc-year{will-change:transform;transition:transform .9s cubic-bezier(.2,.8,.2,1)}
  .dc-art{transition:transform .55s cubic-bezier(.2,.8,.2,1)}
  .dc-card.tilt .dc-art{transition:transform .1s linear}
  .dc-art::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0;transition:opacity .35s;
    background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgb(255 255 255 / .3),transparent 52%)}
  .dc-card.tilt .dc-art::after{opacity:1}
  .dc-play,.dc-eq{z-index:2}
  .dc-hint{text-align:center;margin-top:14px;font-size:13px;letter-spacing:.16em;color:var(--teal-light);opacity:.85;transition:opacity .4s}
  .dc-hint.gone{opacity:0}
  @media (max-width:759px){
    #decades{--cw:clamp(150px,56vw,250px);--gap:18px}
    .dc-head p{font-size:14.5px}
    .dc-y{margin-top:10px;font-size:17px}.dc-t{font-size:15px}.dc-r{font-size:12.5px}
    .dc-play{width:40px;height:40px;opacity:1;transform:none}
    .dc-nav{width:44px;height:44px}
    .dc-nav svg{width:18px;height:18px}
    .dc-stage{cursor:auto}
  }
  @media (hover:none){.dc-nav{display:none}}
  </style>`);

  const PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/></svg>';
  /* in a right-to-left page "back" (older) points right and "on" (newer) points left */
  const ARR_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
  const ARR_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const touch = matchMedia("(hover:none)").matches;

  document.addEventListener("chrome:ready", async () => {
    let all; try { all = await loadJSON("albums"); } catch (e) { return; }
    /* oldest first; the newest album (highlighted in the admin) closes the line */
    const list = all.items.filter((a) => Number(a.year)).sort((a, b) => (!!a.highlight - !!b.highlight) || (a.year - b.year));
    if (list.length < 3) return;
    const first = list[0].year, last = list[list.length - 1].year;
    const ids = (a) => (a.videos || []).filter((v) => /^[\w-]{11}$/.test(v.youtube)).map((v) => v.youtube);
    /* the picture on the round disc: albums whose cover has a frame or a name in a corner get one made for the disc */
    const DISC_ART = { "kol-dudi": "assets/img/albums/disc-kol-dudi.webp" };
    const faceOf = (a) => DISC_ART[a.id] || a.cover;
    /* pictures already fetched for the disc are kept (and decoded), so showing one again is instant */
    const got = new Map();
    const whenLoaded = (url, fn) => {
      let e = got.get(url);
      if (!e) {
        const im = new Image(); e = { im, ok: false, wait: [] }; got.set(url, e);
        im.onload = im.onerror = () => { e.ok = true; (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(() => { e.wait.splice(0).forEach((f) => f()); }); };
        im.src = url;
      }
      if (e.ok && !e.wait.length) fn(); else e.wait.push(fn);
    };
    const perYear = {}; list.forEach((a) => { perYear[a.year] = (perYear[a.year] || 0) + 1; });

    sec.innerHTML = `
      <div class="dc-spot" aria-hidden="true"></div>
      <div class="dc-year" aria-hidden="true">${first}</div>
      <div class="dc-head">
        <div class="eyebrow">${first} — ${last}</div>
        <h2 class="brush">שלושה עשורים של יצירה</h2>
        <p>לאורך שלושה עשורים חתום דודי על עשרות אלבומים, כמעבד, כמפיק וכזמר.</p>
      </div>
      <div class="dc-wrap">
        <div class="dc-stage" tabindex="0" role="group" aria-label="ציר האלבומים לפי שנים. גלילה הצידה או מקשי החיצים עוברים בין האלבומים">
          <ol class="dc-rail">${list.map((a, i) => `
          <li><button type="button" class="dc-card${a.highlight ? " is-new" : ""}" data-i="${i}" aria-label="${esc(a.title)}, ${esc(a.year)}${ids(a).length ? ", ניגון האלבום" : ""}">
            <span class="dc-art"><img src="${esc(a.cover)}" alt="" width="240" height="240" loading="lazy" decoding="async" draggable="false">
              ${ids(a).length ? `<span class="dc-play" aria-hidden="true">${PLAY}</span>` : ""}
              <span class="dc-eq" aria-hidden="true"><span class="dkp-eq"><i></i><i></i><i></i></span><span class="dc-eq-t">מתנגן</span></span></span>
            <span class="dc-y">${a.highlight ? "האלבום החדש · " : ""}${esc(a.year)}</span>
            <span class="dc-t">${esc(a.title)}</span>
            <span class="dc-r">${esc([a.role, a.with ? "עם " + a.with : ""].filter(Boolean).join(" · "))}</span>
          </button></li>`).join("")}</ol>
        </div>
        <button type="button" class="dc-nav dc-prev" aria-label="אלבום קודם (מוקדם יותר)">${ARR_R}</button>
        <button type="button" class="dc-nav dc-next" aria-label="אלבום הבא (מאוחר יותר)">${ARR_L}</button>
      </div>
      <div class="dc-track" aria-hidden="true">
        <div class="dc-base"><i class="dc-prog"></i>${
          /* a hairline for every year (brighter where albums came out), the round years written under the line */
          Array.from({ length: last - first + 1 }, (_, k) => first + k).map((y) => {
            const lab = y === first || y === last || (y % 5 === 0 && y - first > 2 && last - y > 2);   // no round year squeezed next to an end
            if (!lab && !perYear[y]) return "";
            return `<b class="dc-tk" data-y="${y}" style="right:${((y - first) / Math.max(1, last - first) * 100).toFixed(3)}%">${
              perYear[y] ? '<i class="dc-dot"></i><i class="dc-glow"></i>' : ""}${lab ? `<em><span class="dc-l0">${y}</span><span class="dc-l1">${y}</span></em>` : ""}</b>`;
          }).join("")
        }</div>
        <div class="dc-pin"><div class="dc-disc${list[0].highlight ? " is-new" : ""}"><span class="dc-tag">${first}</span>
          <span class="dc-spin"><span class="dc-face" style="background-image:url(&quot;${esc(faceOf(list[0]))}&quot;)"></span><span class="dc-face" style="opacity:0"></span></span>
          <span class="dc-shine"></span></div></div>
      </div>
      <div class="dc-hint" aria-hidden="true">${touch ? "החליקו הצידה למסע בזמן" : "גללו הצידה, גררו או השתמשו בחצים"}</div>`;

    const stage = sec.querySelector(".dc-stage"), lis = [...sec.querySelectorAll(".dc-rail li")], cards = lis.map((l) => l.firstElementChild);
    const yearEl = sec.querySelector(".dc-year"), hint = sec.querySelector(".dc-hint");
    const base = sec.querySelector(".dc-base"), prog = sec.querySelector(".dc-prog"), pin = sec.querySelector(".dc-pin");
    const disc = pin.firstElementChild, tag = disc.querySelector(".dc-tag"), spin = disc.querySelector(".dc-spin");
    const discImgs = [...spin.querySelectorAll(".dc-face")];
    let baseW = base.offsetWidth, front = 0, discM = 0, angle = 0, lastX = 0, upright = !!list[0].highlight;
    const marks = [...base.querySelectorAll(".dc-tk")].map((el) => ({ y: +el.dataset.y, k: "", glow: el.querySelector(".dc-glow"), em: el.querySelector("em"), lit: el.querySelector(".dc-l1") }));
    let onMove = null;   // set by the mouse effects below: the row started moving
    const bPrev = sec.querySelector(".dc-prev"), bNext = sec.querySelector(".dc-next");

    /* the covers sit far out to the side, where the browser's "load when visible" would wait too long: all of them
       start loading once the chapter is a screen away */
    const imgs = [...sec.querySelectorAll(".dc-art img")];
    const loadAll = () => { imgs.forEach((im) => { im.loading = "eager"; }); Object.values(DISC_ART).forEach((u) => whenLoaded(u, () => {})); };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { loadAll(); io.disconnect(); } }, { rootMargin: "150% 0px" });
      io.observe(sec);
    } else loadAll();

    /* ---- moving along the line (24/11: our own glide, light and smooth, with momentum) ----
       x = how far along the line, in pixels (0 = the first album in the middle). The row is shifted sideways by x —
       a pure move of an image the screen already has, so it runs smoothly even on a slow machine; nothing on the
       page is measured while it moves (the distance between albums is measured once, and again on resize). */
    let step = 1, maxX = 0, x = 0, goal = 0, raf = 0, drag = null, moved = false, lastInput = 0, mid = 0, restT = 0;
    const EASE = reduce ? 1 : 0.1;   // how much of the remaining distance each frame covers: soft, like the page
    const measure = () => {
      const a = lis[0].getBoundingClientRect(), b = lis[1].getBoundingClientRect();
      step = Math.abs(b.left - a.left) || 1; maxX = step * (lis.length - 1);
      x = Math.min(x, maxX); goal = Math.min(goal, maxX);
    };
    const clampX = (v) => Math.max(0, Math.min(maxX, v));
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const aim = (v) => { goal = clampX(v); lastInput = performance.now(); kick(); };
    const goTo = (i) => aim(Math.max(0, Math.min(lis.length - 1, i)) * step);
    function tick() {
      raf = 0;
      if (!drag) {
        const d = goal - x;
        x = Math.abs(d) < 0.3 ? goal : x + d * EASE;
      }
      paint();
      if (drag || x !== goal) { kick(); return; }
      /* once the movement has died down, it comes to rest gently on the nearest album */
      clearTimeout(restT);
      restT = setTimeout(() => {
        if (drag || x !== goal) return;
        const near = clampX(Math.round(x / step) * step);
        if (Math.abs(near - x) > 0.5) { goal = near; kick(); }
      }, 140);
    }

    bPrev.onclick = () => goTo(Math.round(goal / step) - 1);
    bNext.onclick = () => goTo(Math.round(goal / step) + 1);
    stage.addEventListener("keydown", (e) => {
      /* right-to-left: the right arrow goes back in time, the left arrow forward */
      const k = { ArrowRight: -1, ArrowLeft: 1 }[e.key];
      if (k) { e.preventDefault(); goTo(Math.round(goal / step) + k); return; }
      if (e.key === "Home" || e.key === "End") { e.preventDefault(); goTo(e.key === "Home" ? 0 : lis.length - 1); }
    });

    /* the wheel: a sideways gesture (touchpad, or Shift with the wheel) glides along the line; up-and-down goes on to
       the page and its smooth scrolling, so the page never stops here */
    stage.addEventListener("wheel", (e) => {
      const side = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!side && !e.shiftKey) return;
      e.preventDefault(); e.stopPropagation();   // no back-swipe of the browser, and the page stays where it is
      const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? stage.clientWidth : 1;
      const dv = (side ? -e.deltaX : e.deltaY) * unit;   // swipe left / Shift+wheel down = on to later years
      if ((dv > 0 && goal >= maxX) || (dv < 0 && goal <= 0)) return;
      aim(goal + dv * 1.15);
    }, { passive: false });

    /* dragging (mouse) and swiping (finger): the row follows the hand, then runs on with the speed it was let go at.
       A mostly up-and-down swipe is left to the page (touch-action: pan-y). */
    stage.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      moved = false;
      drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x0: x, lx: e.clientX, lt: performance.now(), v: 0, live: false };
    });
    stage.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!drag.live) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) { if (Math.abs(dy) > 10) drag = null; return; }
        drag.live = true; moved = true; stage.classList.add("drag");
        try { stage.setPointerCapture(e.pointerId); } catch (er) {}
        drag.sx = e.clientX; drag.x0 = x; drag.lx = e.clientX; drag.lt = performance.now();
      }
      const now = performance.now(), dt = Math.max(1, now - drag.lt);
      drag.v = drag.v * 0.6 + ((e.clientX - drag.lx) / dt) * 0.4;   // smoothed speed, px per ms
      drag.lx = e.clientX; drag.lt = now;
      /* past the ends it gives a little, like a rubber band */
      let nx = drag.x0 + (e.clientX - drag.sx);
      if (nx < 0) nx = nx * 0.3; else if (nx > maxX) nx = maxX + (nx - maxX) * 0.3;
      x = goal = nx; lastInput = now; kick();
    });
    const release = (e) => {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      const was = drag.live, v = performance.now() - drag.lt > 80 ? 0 : drag.v;
      drag = null; stage.classList.remove("drag");
      if (was) { aim(x + v * 380); setTimeout(() => { moved = false; }, 0); }   // momentum: the faster the flick, the further it runs
    };
    stage.addEventListener("pointerup", release); stage.addEventListener("pointercancel", release);
    /* a finger is held by the cover it touched first; handing it over to the row fires "lost" on the cover — only the
       row's own loss ends the swipe */
    stage.addEventListener("lostpointercapture", (e) => { if (e.target === stage) release(e); });

    /* clicks: the album plays as one queue (not when the press ended a drag); a side album first comes to the middle;
       an album without songs opens its card on the albums page */
    stage.addEventListener("click", (e) => {
      const b = e.target.closest(".dc-card"); if (!b) return;
      if (moved) { e.preventDefault(); e.stopPropagation(); return; }
      const i = +b.dataset.i;
      if (i !== mid) { goTo(i); return; }
      const a = list[i], q = ids(a), P = window.DK_PLAYER;
      if (!q.length) { location.href = "albums.html#a-" + encodeURIComponent(a.id); return; }
      const s = P && P.now && P.now();
      if (s && s.id && q.includes(s.id) && P.toggle) P.toggle();
      else if (P) P.play(q[0], q); else playVideo(q[0]);
    }, true);
    /* the browser scrolls a hidden-overflow box by itself to show a focused album (Tab key); the row is moved only by
       the glide above, so that scrolling is undone at once */
    stage.addEventListener("scroll", () => { if (stage.scrollLeft !== 0) stage.scrollLeft = 0; });
    /* keyboard focus on a side album brings it to the middle */
    stage.addEventListener("focusin", (e) => { const b = e.target.closest(".dc-card"); if (b && !drag && e.target.matches(":focus-visible")) goTo(+b.dataset.i); });

    const paintNow = (st) => cards.forEach((c, i) => {
      const on = !!(st && st.id && ids(list[i]).includes(st.id)), pl = on && st.playing;
      c.classList.toggle("is-on", on); c.classList.toggle("is-playing", pl);
      c.querySelector(".dc-eq-t").textContent = pl ? "מתנגן" : "בהשהיה";
    });
    addEventListener("dkp:now", (e) => paintNow(e.detail));
    if (window.DK_PLAYER && DK_PLAYER.now) paintNow(DK_PLAYER.now());

    /* ---- drawing one frame: the row's shift, sizes of the albums near the middle, year, progress ---- */
    const rail = sec.querySelector(".dc-rail");
    const st = cards.map(() => ({ t: "", o: "" }));
    let lastYear = first, lastMid = -1, lastFill = "", lastRail = "", touched = false;
    function paint() {
      const r = `translate3d(${x.toFixed(2)}px,0,0)`;   // right to left: later albums come in from the left
      if (r !== lastRail) { rail.style.transform = r; lastRail = r; }
      const f = Math.max(0, Math.min(lis.length - 1, x / step));
      const m = Math.round(f);
      for (let i = Math.max(0, m - 6); i <= Math.min(cards.length - 1, m + 6); i++) {
        const d = Math.abs(i - f), k = Math.min(d, 2.5);
        const t = reduce ? "none" : `translateY(${(k * k * 7).toFixed(1)}px) scale(${(1 - Math.min(d, 2) * 0.13).toFixed(3)})`;
        const o = reduce ? "1" : (1 - Math.min(d, 3) * 0.24).toFixed(2);
        if (st[i].t !== t) { cards[i].style.transform = t; st[i].t = t; }
        if (st[i].o !== o) { cards[i].style.opacity = o; st[i].o = o; }
      }
      mid = m;
      if (m !== lastMid) {
        if (cards[lastMid]) cards[lastMid].classList.remove("is-mid");
        cards[m].classList.add("is-mid"); lastMid = m;
        const y = list[m].year; if (y !== lastYear) { yearEl.textContent = y; lastYear = y; }
        bPrev.disabled = m === 0; bNext.disabled = m === lis.length - 1;
      }
      /* the disc on the years line: between two albums it travels between their years */
      const lo = Math.floor(f), hi = Math.min(lis.length - 1, lo + 1);
      const yF = +list[lo].year + (list[hi].year - list[lo].year) * (f - lo);
      const pos = Math.max(0, Math.min(1, (yF - first) / Math.max(1, last - first)));
      const pt = `translate3d(${(-pos * baseW).toFixed(1)}px,0,0)`;   // from 2000 on the right towards the left
      if (pt !== lastFill) { pin.style.transform = pt; prog.style.transform = `scaleX(${pos.toFixed(4)})`; lastFill = pt; }
      /* it turns with the row's movement, so it spins while moving and stands still when the row stops —
         except on the newest album, where it stays upright */
      if (!reduce && x !== lastX && !upright) { angle += (x - lastX) * 0.5; spin.style.transform = `rotate(${angle.toFixed(1)}deg)`; }
      if (x !== lastX && onMove) onMove();
      lastX = x;
      /* the dots and round years near the disc light up as it comes close (within about two years) */
      for (const mk of marks) {
        const k = Math.max(0, 1 - Math.abs(yF - mk.y) / 2.2), ks = k.toFixed(2);
        if (ks === mk.k) continue;
        mk.k = ks;
        if (mk.glow) { mk.glow.style.opacity = ks; mk.glow.style.transform = `scale(${(0.5 + k * 0.9).toFixed(3)})`; }
        if (mk.em) { mk.em.style.transform = `translateY(${(k * 3).toFixed(1)}px) scale(${(1 + k * 0.35).toFixed(3)})`; mk.lit.style.opacity = ks; }
      }
      /* the cover on the disc changes to the album in the middle (a soft cross-fade) */
      if (m !== discM) {
        discM = m;
        /* 24/11 ("sometimes the disc at 2026 is empty"): the next picture fades in only once it has fully arrived; until
           then the previous one stays on the disc. If the row moved on meanwhile, the late picture is skipped. */
        const want = m, url = faceOf(list[m]);
        whenLoaded(url, () => {
          if (discM !== want) return;
          const nx = discImgs[1 - front];
          nx.style.backgroundImage = `url(${JSON.stringify(url)})`; nx.style.opacity = "1"; discImgs[front].style.opacity = "0"; front = 1 - front;
        });
        tag.textContent = list[m].year;
        upright = !!list[m].highlight;
        disc.classList.toggle("is-new", upright);
        if (!reduce) {
          if (upright) {
            /* the newest album: the disc turns back to straight (the nearest full turn) and grows (CSS) */
            angle = Math.round(angle / 360) * 360;
            spin.style.transition = "transform .7s cubic-bezier(.2,.8,.2,1)"; spin.style.transform = `rotate(${angle}deg)`;
          } else spin.style.transition = "";
          /* a ring spreads out of the disc as it reaches the album */
          const ring = document.createElement("i"); ring.className = "dc-ring"; disc.appendChild(ring);
          const an = ring.animate([{ transform: "scale(1)", opacity: 0.9 }, { transform: "scale(2.4)", opacity: 0 }], { duration: 800, easing: "cubic-bezier(.2,.8,.2,1)" });
          an.onfinish = an.oncancel = () => ring.remove();
        }
      }
      if (!touched && x > step * 0.3) { touched = true; hint.classList.add("gone"); }
    }
    /* albums far from the middle start small and faded, so nothing jumps when they slide in */
    if (!reduce) cards.forEach((c, i) => { if (i > 6) { c.style.transform = st[i].t = "translateY(44px) scale(0.74)"; c.style.opacity = st[i].o = "0.28"; } });
    measure(); paint();
    addEventListener("resize", () => { measure(); baseW = base.offsetWidth; lastFill = ""; x = goal = clampX(Math.round(goal / step) * step); kick(); });

    /* ---- the mouse (computers only, and not for "less motion") ----
       a soft red light follows the pointer behind the albums, the huge year drifts gently the other way (depth), and the
       cover under the pointer leans towards it with a shine where the pointer is. All of it is moves and fades only. */
    if (!reduce && matchMedia("(hover:hover) and (pointer:fine)").matches) {
      const spot = sec.querySelector(".dc-spot");
      let mx = 0, my = 0, mraf = 0, tl = null, tiltOn = null;
      const untilt = (c) => { c.classList.remove("tilt"); const a = c.querySelector(".dc-art"); a.style.transform = ""; };
      const mouseFrame = () => {
        mraf = 0;
        spot.style.transform = `translate3d(${mx.toFixed(0)}px,${my.toFixed(0)}px,0)`;
        const w = sec.clientWidth || 1, h = sec.clientHeight || 1;
        yearEl.style.transform = `translate3d(${((mx / w - 0.5) * -40).toFixed(1)}px,${((my / h - 0.5) * -24).toFixed(1)}px,0)`;
        if (tl) {
          tl.c.classList.add("tilt");
          tl.a.style.transform = `perspective(800px) rotateX(${((0.5 - tl.py) * 16).toFixed(2)}deg) rotateY(${((tl.px - 0.5) * 18).toFixed(2)}deg)`;
          tl.a.style.setProperty("--mx", (tl.px * 100).toFixed(1) + "%"); tl.a.style.setProperty("--my", (tl.py * 100).toFixed(1) + "%");
        }
      };
      sec.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        const r = sec.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
        sec.classList.add("mouse-on");
        const c = drag ? null : e.target.closest(".dc-card");
        if (tiltOn && tiltOn !== c) untilt(tiltOn);
        tiltOn = c;
        if (c) { const a = c.querySelector(".dc-art"), ar = a.getBoundingClientRect(); tl = { c, a, px: (e.clientX - ar.left) / ar.width, py: (e.clientY - ar.top) / ar.height }; } else tl = null;
        if (!mraf) mraf = requestAnimationFrame(mouseFrame);
      });
      sec.addEventListener("pointerleave", () => { sec.classList.remove("mouse-on"); if (tiltOn) untilt(tiltOn); tiltOn = tl = null; yearEl.style.transform = ""; });
      /* while the row slides the cover straightens up (a leaning cover that also slides and shrinks costs a lot to draw);
         the next move of the mouse leans it again */
      onMove = () => { if (tiltOn) { untilt(tiltOn); tiltOn = tl = null; } };
    }
  });
})();
