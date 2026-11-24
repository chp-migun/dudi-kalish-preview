/* נגן קבוע (23/11, שדרוג "פי 10", אבן 2).
   עד עכשיו כל לחיצה על שיר פתחה חלון יוטיוב שכיסה את הדף, וסגירתו עצרה את המוזיקה.
   כאן: כרטיס נגן קבוע בפינה שממשיך לנגן בזמן הגלילה, עם הבא/הקודם, תור השירים של הדף, פס התקדמות וגרירה.
   - תור: השירים שמוצגים בדף לפי הסדר (כרטיסי המוזיקה, רשימת שירי האלבום, מניפת דף הבית); שיר שלא מופיע בדף — לבד.
   - תנאי יוטיוב: הסרטון חייב להישאר גלוי בזמן ניגון (לפחות 200 על 200). לכן "מזער" עוצר את השיר ומשאיר כפתור
     "המשך להאזין" בלבד — אין ניגון נסתר.
   - מעבר דף: המקום בשיר נשמר; בדף הבא הנגן ממשיך מאותה שנייה (אם הדפדפן חוסם ניגון אוטומטי — לחיצה אחת).
   כל כפתורי הניגון באתר עוברים דרך window.playVideo (app.js), שמפנה לכאן.
   window.DK_PLAYER = { play(id, list), next(), prev(), close(), now(), toggle() }
   - list (לא חובה): תור מפורש, למשל כל שירי אלבום אחד ("נגן את האלבום"), במקום השירים שמוצגים בדף.
   - בכל שינוי (שיר, ניגון/השהיה, סגירה) נשלח לדף האירוע "dkp:now" עם { id, playing, q }, כדי שהדף יסמן מה מתנגן. */
(() => {
  if (window.DK_PLAYER) return;
  const KEY = "dk_player", FRESH = 30 * 60e3;
  const doc = document, root = doc.documentElement;
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- look ---------- */
  doc.head.insertAdjacentHTML("beforeend", `<style id="dkp-css">
  .dkp{position:fixed;z-index:70;inset-inline-end:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));font-family:var(--f-body,system-ui,sans-serif);color:var(--ink,#F2F7F7);direction:rtl}
  .dkp[data-state="hidden"],.dkp [hidden]{display:none!important}
  .dkp-card{width:360px;border-radius:18px;overflow:hidden;background:rgb(12 23 22 / .94);border:1px solid rgb(172 196 195 / .2);
    box-shadow:0 18px 50px rgb(2 8 8 / .55),0 2px 0 rgb(255 255 255 / .04) inset;transform-origin:100% 100%}
  .dkp[data-state="open"] .dkp-card{animation:dkp-in .42s cubic-bezier(.2,.8,.2,1)}
  @keyframes dkp-in{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}
  .dkp[data-state="mini"] .dkp-card{display:none}
  .dkp-video{position:relative;aspect-ratio:16/9;min-height:200px;background:#000}
  .dkp-video iframe,.dkp-video>div{position:absolute;inset:0;width:100%;height:100%;border:0}
  .dkp-msg{position:absolute;inset:0;display:grid;place-content:center;gap:10px;text-align:center;padding:20px;background:rgb(8 16 15 / .92);font-size:15px;line-height:1.5}
  .dkp-msg a{color:var(--teal-light,#ACC4C3);text-decoration:underline;text-underline-offset:3px}
  .dkp-msg[hidden]{display:none}
  .dkp-prog{position:relative;height:16px;margin:4px 14px 0;cursor:pointer;touch-action:none;outline:none}
  .dkp-prog::before,.dkp-prog i{content:"";position:absolute;inset-inline:0;top:7px;height:3px;border-radius:3px;background:rgb(172 196 195 / .22)}
  .dkp-prog i{background:var(--red,#A83020);transform-origin:100% 50%;transform:scaleX(0);will-change:transform}
  .dkp-prog b{position:absolute;top:3px;width:11px;height:11px;margin-inline-start:-5.5px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgb(0 0 0 / .5);
    inset-inline-start:0;opacity:0;transition:opacity .2s}
  .dkp-prog:hover b,.dkp-prog:focus-visible b,.dkp-prog.drag b{opacity:1}
  .dkp-prog:focus-visible::before{box-shadow:0 0 0 2px var(--teal-light,#ACC4C3)}
  .dkp-time{display:flex;justify-content:space-between;margin:0 14px;font-size:12px;color:var(--ink-dim,#8FA8A6);font-variant-numeric:tabular-nums;direction:ltr}
  .dkp-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px;padding:6px 12px 12px 8px}
  .dkp-info{min-width:0;padding-inline-start:4px}
  .dkp-t{display:block;font-size:16px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dkp-s{display:block;font-size:13px;color:var(--ink-soft,#C3D3D1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dkp-ctl{display:flex;align-items:center;gap:2px}
  .dkp button{all:unset;box-sizing:border-box;display:inline-grid;place-items:center;width:40px;height:40px;border-radius:50%;cursor:pointer;color:var(--ink,#F2F7F7);
    transition:background .2s,transform .15s,color .2s;-webkit-tap-highlight-color:transparent}
  .dkp button:hover{background:rgb(172 196 195 / .12)}
  .dkp button:active{transform:scale(.92)}
  .dkp button:focus-visible{box-shadow:0 0 0 2px var(--teal-light,#ACC4C3)}
  .dkp button[disabled]{opacity:.35;pointer-events:none}
  .dkp svg{width:20px;height:20px}
  .dkp .dkp-mirror svg{transform:scaleX(-1)}
  .dkp .dkp-play{width:46px;height:46px;background:var(--red,#A83020);color:#fff;margin:0 4px}
  .dkp .dkp-play:hover{background:var(--red-deep,#8E2618)}
  .dkp .dkp-play svg{width:22px;height:22px}
  .dkp .dkp-play .i-pause,.dkp[data-playing="1"] .dkp-play .i-play{display:none}
  .dkp[data-playing="1"] .dkp-play .i-pause{display:block}
  .dkp-tools{display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgb(172 196 195 / .12);padding:2px 6px}
  .dkp-tools button{width:36px;height:36px;color:var(--ink-soft,#C3D3D1)}
  .dkp-tools button[aria-expanded="true"]{color:#fff;background:rgb(172 196 195 / .14)}
  .dkp-count{font-size:12px;color:var(--ink-dim,#8FA8A6);padding:0 6px}
  .dkp-q{list-style:none;margin:0;padding:4px 6px 8px;max-height:min(260px,34vh);overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;border-top:1px solid rgb(172 196 195 / .12);
    scrollbar-width:thin;scrollbar-color:rgb(172 196 195 / .35) transparent}
  .dkp-q::-webkit-scrollbar{width:6px}.dkp-q::-webkit-scrollbar-thumb{background:rgb(172 196 195 / .35);border-radius:3px}
  /* the accessibility button sits on the same side: it moves up to the middle of the free space above the player */
  html.dkp-on .a11y-btn{top:calc((100vh - var(--dkp-h,0px) - 16px) / 2)}
  .dkp-q[hidden]{display:none}
  /* sharing a song (23/11, אבן 10): WhatsApp and copy-the-link; phones use the phone's own share sheet instead */
  .dkp-sbox{display:flex;flex-wrap:wrap;gap:8px;padding:10px 12px 12px;border-top:1px solid rgb(172 196 195 / .12)}
  .dkp-sbox a,.dkp .dkp-sbox button{all:unset;box-sizing:border-box;display:inline-flex;align-items:center;gap:8px;width:auto;height:40px;padding:0 16px;border-radius:999px;
    border:1px solid rgb(172 196 195 / .28);font-size:14px;color:var(--ink,#F2F7F7);cursor:pointer;transition:background .2s,border-color .2s}
  .dkp-sbox a:hover,.dkp .dkp-sbox button:hover{background:rgb(172 196 195 / .12);border-color:rgb(172 196 195 / .5)}
  .dkp-sbox a:focus-visible,.dkp .dkp-sbox button:focus-visible{box-shadow:0 0 0 2px var(--teal-light,#ACC4C3)}
  .dkp-sbox svg{width:18px;height:18px}
  .dkp-sbox .dkp-wa svg{color:#25D366}
  .dkp .dkp-sbox .dkp-copy[data-done]{border-color:var(--teal-light,#ACC4C3);color:var(--teal-light,#ACC4C3)}
  .dkp-q button{display:grid;grid-template-columns:26px minmax(0,1fr);gap:8px;align-items:center;width:100%;height:auto;min-height:44px;padding:6px 8px;border-radius:10px;text-align:start}
  .dkp-q .n{font-size:12px;color:var(--ink-dim,#8FA8A6);font-variant-numeric:tabular-nums;text-align:center}
  .dkp-q .tt{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dkp-q .tt small{display:block;font-size:12px;color:var(--ink-dim,#8FA8A6)}
  .dkp-q [aria-current="true"]{background:rgb(168 48 32 / .22)}
  .dkp-q [aria-current="true"] .n{color:#fff}
  .dkp-eq{display:inline-flex;gap:2px;align-items:flex-end;height:12px}
  .dkp-eq i{width:3px;background:currentColor;border-radius:1px;height:40%;animation:dkp-eq .9s ease-in-out infinite}
  .dkp-eq i:nth-child(2){animation-delay:-.3s}.dkp-eq i:nth-child(3){animation-delay:-.6s}
  .dkp[data-playing="0"] .dkp-eq i{animation-play-state:paused}
  @keyframes dkp-eq{0%,100%{height:30%}50%{height:100%}}
  .dkp .dkp-chip{width:auto;height:48px;padding:0 18px 0 14px;gap:10px;display:inline-flex;border-radius:999px;background:rgb(12 23 22 / .94);
    border:1px solid rgb(172 196 195 / .25);box-shadow:0 10px 30px rgb(2 8 8 / .5);font-size:14px;max-width:min(320px,calc(100vw - 32px))}
  .dkp .dkp-chip:hover{background:rgb(23 48 46 / .96)}
  .dkp-chip .ic{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--red,#A83020);color:#fff;flex:none}
  .dkp-chip .ic svg{width:16px;height:16px}
  .dkp-chip span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dkp-chip[hidden]{display:none}
  /* the song that is playing, wherever it is shown on the page */
  [data-dkp-now]{outline:2px solid var(--red,#A83020);outline-offset:3px}
  @media (max-width:600px){
    .dkp{inset-inline:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px))}
    .dkp-card{width:auto}
    /* phones: a lower card — the time and full screen are on the video itself */
    .dkp-time,.dkp .dkp-full{display:none}
    .dkp-prog{margin-top:6px}
    .dkp-row{padding-bottom:8px}
    .dkp[data-state="mini"]{inset-inline-start:auto}
    html.dkp-on .promo-chip,html.dkp-on .test-badge{bottom:calc(var(--dkp-h,0px) + 24px + env(safe-area-inset-bottom,0px))}
  }
  html.dkp-on .to-top{bottom:calc(var(--dkp-h,0px) + 28px + env(safe-area-inset-bottom,0px))}
  @media (prefers-reduced-motion:reduce){.dkp[data-state="open"] .dkp-card{animation:none}.dkp-eq i{animation:none;height:70%}}
  </style>`);

  const I = {
    play: '<svg class="i-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/></svg>',
    pause: '<svg class="i-pause" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4.5" width="4.2" height="15" rx="1.2"/><rect x="13.8" y="4.5" width="4.2" height="15" rx="1.2"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 5.6v12.8a1 1 0 0 0 1.55.83l9.2-6.4a1 1 0 0 0 0-1.66l-9.2-6.4A1 1 0 0 0 5 5.6Z"/><rect x="17" y="5" width="2.4" height="14" rx="1.2"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 5.6v12.8a1 1 0 0 1-1.55.83l-9.2-6.4a1 1 0 0 1 0-1.66l9.2-6.4A1 1 0 0 1 19 5.6Z"/><rect x="4.6" y="5" width="2.4" height="14" rx="1.2"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15V6M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 12H3M16 6H3M12 18H3"/></svg>',
    full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    mini: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'
  };

  const el = doc.createElement("section");
  el.className = "dkp"; el.dataset.state = "hidden"; el.dataset.playing = "0";
  el.setAttribute("role", "region"); el.setAttribute("aria-label", "נגן המוזיקה");
  el.innerHTML = `
    <div class="dkp-card">
      <div class="dkp-video"><div id="dkp-yt"></div><div class="dkp-msg" hidden></div></div>
      <div class="dkp-prog" role="slider" tabindex="0" aria-label="מיקום בשיר" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0"><i></i><b></b></div>
      <div class="dkp-time"><span class="dkp-cur">0:00</span><span class="dkp-dur">0:00</span></div>
      <div class="dkp-row">
        <div class="dkp-info" aria-live="polite"><b class="dkp-t"></b><span class="dkp-s"></span></div>
        <div class="dkp-ctl">
          <button type="button" class="dkp-prev" aria-label="השיר הקודם">${I.prev}</button>
          <button type="button" class="dkp-play" aria-label="ניגון">${I.play}${I.pause}</button>
          <button type="button" class="dkp-next" aria-label="השיר הבא">${I.next}</button>
        </div>
      </div>
      <div class="dkp-tools">
        <div style="display:flex;align-items:center">
          <button type="button" class="dkp-qbtn" aria-label="רשימת השירים" aria-expanded="false" title="רשימת השירים">${I.list}</button>
          <span class="dkp-count"></span>
        </div>
        <div style="display:flex">
          <button type="button" class="dkp-share" aria-label="שיתוף השיר" aria-expanded="false" title="שיתוף">${I.share}</button>
          <button type="button" class="dkp-full" aria-label="מסך מלא" title="מסך מלא">${I.full}</button>
          <button type="button" class="dkp-min" aria-label="מזעור (השיר נעצר)" title="מזעור">${I.mini}</button>
          <button type="button" class="dkp-close" aria-label="סגירת הנגן" title="סגירה">${I.x}</button>
        </div>
      </div>
      <ol class="dkp-q" hidden data-lenis-prevent></ol>
      <div class="dkp-sbox" hidden><a class="dkp-wa" target="_blank" rel="noopener">${(window.ICONS && ICONS.whatsapp) || ""}<span>וואטסאפ</span></a><button type="button" class="dkp-copy">${I.link}<span>העתקת קישור</span></button></div>
    </div>
    <button type="button" class="dkp-chip" hidden><span class="ic">${I.play}</span><span></span></button>`;
  /* in RTL the "next" arrow points left, like the page reads */
  el.querySelector(".dkp-next").classList.add("dkp-mirror"); el.querySelector(".dkp-prev").classList.add("dkp-mirror");
  const $ = (s) => el.querySelector(s);
  const card = $(".dkp-card"), msg = $(".dkp-msg"), prog = $(".dkp-prog"), fill = prog.querySelector("i"), knob = prog.querySelector("b");
  const tCur = $(".dkp-cur"), tDur = $(".dkp-dur"), tTitle = $(".dkp-t"), tSub = $(".dkp-s"), qList = $(".dkp-q"), qBtn = $(".dkp-qbtn"), count = $(".dkp-count");
  const chip = $(".dkp-chip"), chipTxt = chip.lastElementChild, bPlay = $(".dkp-play"), bPrev = $(".dkp-prev"), bNext = $(".dkp-next");

  /* ---------- song names ---------- */
  const meta = new Map();
  let featured = [], allSongs = [];
  const dataReady = Promise.all(["data/songs.json", "data/albums.json", "data/site.json"].map((u) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null)))
    .then(([songs, albums, site]) => {
      if (albums && albums.items) for (const a of albums.items) for (const v of a.videos || []) if (v.youtube && !meta.has(v.youtube))
        meta.set(v.youtube, { title: v.title, sub: [a.title, a.year].filter(Boolean).join(" · ") });
      if (songs && songs.items) {
        for (const s of songs.items) if (s.youtube) meta.set(s.youtube, { title: s.title, sub: s.with ? "דודי קאליש · " + s.with : "דודי קאליש" });
        allSongs = songs.items.filter((s) => s.youtube).map((s) => s.youtube);
        featured = songs.items.filter((s) => s.featured && s.youtube).slice(0, 10).map((s) => s.youtube);
      }
      if (site && site.album && site.album.trailer) meta.set(site.album.trailer, { title: "תקציר האלבום", sub: site.album.title || "" });
      if (cur()) paintInfo();
    });
  /* a song not in the data files (a single, for one) takes its name from the page that shows it (data-title) */
  const nameOf = (id) => {
    if (meta.has(id)) return meta.get(id);
    const n = id && doc.querySelector(`[data-yt="${CSS.escape(id)}"][data-title]`);
    if (n) { const m = { title: n.dataset.title, sub: n.dataset.sub || "" }; meta.set(id, m); return m; }
    return { title: "דודי קאליש", sub: "" };
  };

  /* ---------- the queue ---------- */
  let Q = [], idx = 0;
  const cur = () => Q[idx];
  /* the songs the page shows, in the order it shows them; a song that is not among them plays on its own */
  function queueFor(id) {
    const seen = new Set(), list = [];
    for (const n of doc.querySelectorAll("[data-yt]")) { const y = n.dataset.yt; if (!y || seen.has(y) || n.closest(".dkp")) continue; seen.add(y); list.push(y); }
    if (list.includes(id)) return list;
    if (featured.includes(id)) return featured.slice();
    if (allSongs.includes(id)) return allSongs.slice();
    return [id];
  }

  /* ---------- YouTube ---------- */
  let api = null, player = null, ready = false, playing = false, pendingStart = 0;
  const loadAPI = () => api || (api = new Promise((res) => {
    if (window.YT && YT.Player) return res(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) try { prev(); } catch (e) {} res(window.YT); };
    const s = doc.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; s.async = true; doc.head.appendChild(s);
  }));
  function load(id, start, autoplay) {
    msg.hidden = true;
    return loadAPI().then((YT) => {
      if (player && ready) { autoplay ? player.loadVideoById({ videoId: id, startSeconds: start || 0 }) : player.cueVideoById({ videoId: id, startSeconds: start || 0 }); return; }
      if (player) { pendingStart = start || 0; return; }
      pendingStart = start || 0;
      player = new YT.Player("dkp-yt", {
        host: "https://www.youtube-nocookie.com", videoId: id,
        playerVars: { autoplay: autoplay ? 1 : 0, start: Math.floor(start || 0), playsinline: 1, rel: 0, modestbranding: 1, origin: location.origin },
        events: {
          onReady: () => { ready = true; player.getIframe().title = "נגן וידאו";
            if (cur() !== id) load(cur(), 0, true); },
          onStateChange: (e) => onState(e.data),
          onError: (e) => onError(e.data)
        }
      });
    });
  }
  function onState(s) {
    /* -1 not started · 0 ended · 1 playing · 2 paused · 3 loading · 5 ready */
    if (s === 1) setPlaying(true);
    else if (s === 2 || s === 0 || s === 5) setPlaying(false);
    if (s === 0) { if (idx < Q.length - 1) go(idx + 1, true); else save(); }
  }
  function onError(code) {
    const id = cur();
    msg.innerHTML = `<div>${code === 101 || code === 150 ? "בעל הסרטון לא מאפשר לנגן אותו כאן." : "הסרטון הזה לא זמין כרגע."}</div><a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">לצפייה ביוטיוב</a>`;
    msg.hidden = false; setPlaying(false);
    if (idx < Q.length - 1) setTimeout(() => { if (cur() === id) go(idx + 1, true); }, 2600);
  }

  /* ---------- state on screen ---------- */
  let tick = 0;
  function setPlaying(on) {
    playing = on; el.dataset.playing = on ? "1" : "0";
    bPlay.setAttribute("aria-label", on ? "השהיה" : "ניגון");
    clearInterval(tick); if (on) tick = setInterval(paintTime, 250);
    paintTime(); markPage(); save();
  }
  const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  let dragging = false;
  function paintTime() {
    if (!player || !ready || dragging || !player.getDuration) return;
    const d = player.getDuration() || 0, t = player.getCurrentTime() || 0, f = d ? Math.min(1, t / d) : 0;
    fill.style.transform = `scaleX(${f.toFixed(4)})`; knob.style.insetInlineStart = (f * 100).toFixed(2) + "%";
    tCur.textContent = fmt(t); tDur.textContent = fmt(d);
    prog.setAttribute("aria-valuemax", Math.floor(d)); prog.setAttribute("aria-valuenow", Math.floor(t)); prog.setAttribute("aria-valuetext", `${fmt(t)} מתוך ${fmt(d)}`);
  }
  function paintInfo() {
    const m = nameOf(cur());
    tTitle.textContent = m.title; tSub.textContent = m.sub; chipTxt.textContent = "המשך להאזין: " + m.title;
    bPrev.disabled = idx <= 0 && Q.length <= 1; bNext.disabled = idx >= Q.length - 1;
    count.textContent = Q.length > 1 ? `${idx + 1} מתוך ${Q.length}` : "";
    qBtn.hidden = Q.length <= 1;
    if (!qList.hidden) paintQueue();
    if (!sBox.hidden) fillShare();   // the next song plays while the share box is open: the link follows it
    if ("mediaSession" in navigator) try { navigator.mediaSession.metadata = new MediaMetadata({ title: m.title, artist: m.sub || "דודי קאליש", artwork: [{ src: `https://i.ytimg.com/vi/${cur()}/hqdefault.jpg`, sizes: "480x360", type: "image/jpeg" }] }); } catch (e) {}
  }
  function paintQueue() {
    qList.innerHTML = Q.map((y, i) => { const m = nameOf(y); return `<li><button type="button" data-i="${i}" ${i === idx ? 'aria-current="true"' : ""}><span class="n">${i === idx ? '<span class="dkp-eq" aria-hidden="true"><i></i><i></i><i></i></span>' : i + 1}</span><span class="tt">${esc(m.title)}${m.sub ? `<small>${esc(m.sub)}</small>` : ""}</span></button></li>`; }).join("");
    const c = qList.querySelector('[aria-current="true"]'); if (c) c.scrollIntoView({ block: "nearest" });
  }
  const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  /* the song that plays is outlined wherever the page shows it (music cards, album list, home fan) */
  function markPage() {
    for (const n of doc.querySelectorAll("[data-dkp-now]")) n.removeAttribute("data-dkp-now");
    const id = el.dataset.state === "open" ? cur() : null;
    if (id) for (const n of doc.querySelectorAll(`[data-yt="${CSS.escape(id)}"]`)) if (!n.closest(".dkp")) n.setAttribute("data-dkp-now", playing ? "play" : "pause");
    /* the page hears about it too (the albums page lights the card of the album that plays); sent only when something changed */
    const sig = (cur() || "") + "|" + el.dataset.state + "|" + playing + "|" + Q.length;
    if (sig !== lastSig) { lastSig = sig; try { window.dispatchEvent(new CustomEvent("dkp:now", { detail: now() })); } catch (e) {} }
  }
  let lastSig = "";
  /* a minimised player still counts (its song is paused, one press brings it back); a closed one does not */
  const now = () => ({ id: el.dataset.state !== "hidden" ? cur() || null : null, playing: !!playing && el.dataset.state === "open", q: Q.slice() });
  let moQ = 0;
  /* the page redraws its lists (a music filter, an album's song list): outline the playing song again. Changes inside
     the player itself (the clock ticking) are ignored */
  new MutationObserver((ms) => { if (!cur() || moQ || ms.every((m) => el.contains(m.target))) return; moQ = setTimeout(() => { moQ = 0; markPage(); }, 200); }).observe(doc.body, { childList: true, subtree: true });

  function setState(s) {
    el.dataset.state = s; chip.hidden = s !== "mini";
    root.classList.toggle("dkp-on", s !== "hidden");
    measure(); markPage();
  }
  const measure = () => root.style.setProperty("--dkp-h", (el.dataset.state === "open" ? card.offsetHeight : el.dataset.state === "mini" ? 48 : 0) + "px");
  if (window.ResizeObserver) new ResizeObserver(measure).observe(card);

  /* ---------- actions ---------- */
  function go(i, autoplay) {
    idx = Math.max(0, Math.min(Q.length - 1, i));
    setState("open"); paintInfo(); markPage();
    fill.style.transform = "scaleX(0)"; tCur.textContent = "0:00"; tDur.textContent = "0:00";
    load(cur(), 0, autoplay !== false);
    save();
  }
  function play(id, list) {
    if (!id) return;
    const given = Array.isArray(list) && list.includes(id) ? list.filter((y, i) => y && list.indexOf(y) === i) : null;
    const sameQ = !given || (given.length === Q.length && given.every((y, i) => y === Q[i]));
    if (id === cur() && sameQ && el.dataset.state !== "hidden" && player && ready) { setState("open"); player.playVideo(); return; }
    Q = given || queueFor(id); idx = Math.max(0, Q.indexOf(id));
    go(idx, true);
  }
  function toggle() {
    if (!player || !ready) { load(cur(), pendingStart, true); return; }
    playing ? player.pauseVideo() : player.playVideo();
  }
  function prevSong() {
    if (player && ready && player.getCurrentTime() > 4) { player.seekTo(0, true); return; }
    if (idx > 0) go(idx - 1, true); else if (player && ready) player.seekTo(0, true);
  }
  function close() {
    if (player && ready) try { player.stopVideo(); } catch (e) {}
    setPlaying(false); setState("hidden");
    try { sessionStorage.removeItem(KEY); } catch (e) {}
  }
  function minimize() { if (player && ready) try { player.pauseVideo(); } catch (e) {} setPlaying(false); setState("mini"); save(); }

  bPlay.onclick = toggle; bPrev.onclick = prevSong; bNext.onclick = () => go(idx + 1, true);
  $(".dkp-close").onclick = close; $(".dkp-min").onclick = minimize;
  chip.onclick = () => { setState("open"); if (player && ready) player.playVideo(); else load(cur(), pendingStart, true); };
  $(".dkp-full").onclick = () => { const f = player && ready ? player.getIframe() : $(".dkp-video"); const rq = f.requestFullscreen || f.webkitRequestFullscreen; if (rq) rq.call(f); };
  qBtn.onclick = () => { const open = qList.hidden; if (open) closeShare(); qList.hidden = !open; qBtn.setAttribute("aria-expanded", open ? "true" : "false"); if (open) paintQueue(); measure(); };

  /* ---------- sharing a song ----------
     the link opens the same page with ?play=<song>; whoever opens it finds the player ready on that song */
  const sBtn = $(".dkp-share"), sBox = $(".dkp-sbox"), sWa = $(".dkp-wa"), sCopy = $(".dkp-copy");
  const shareURL = (id) => { const u = new URL(location.href); u.search = ""; u.hash = ""; u.pathname = u.pathname.replace(/index\.html$/, ""); u.searchParams.set("play", id); return u.href; };
  const shareText = (id) => nameOf(id).title + " · דודי קאליש";
  function fillShare() {
    const id = cur(); if (!id) return;
    sWa.href = "https://wa.me/?text=" + encodeURIComponent(shareText(id) + "\n" + shareURL(id));
    sCopy.removeAttribute("data-done"); sCopy.lastElementChild.textContent = "העתקת קישור";
  }
  function closeShare() { if (sBox.hidden) return; sBox.hidden = true; sBtn.setAttribute("aria-expanded", "false"); measure(); }
  sBtn.onclick = () => {
    const id = cur(); if (!id) return;
    /* phones: the phone's own share sheet (WhatsApp, messages, anything installed) */
    if (navigator.share && matchMedia("(pointer:coarse)").matches) { navigator.share({ title: shareText(id), text: shareText(id), url: shareURL(id) }).catch(() => {}); return; }
    if (!sBox.hidden) { closeShare(); return; }
    if (!qList.hidden) { qList.hidden = true; qBtn.setAttribute("aria-expanded", "false"); }
    fillShare(); sBox.hidden = false; sBtn.setAttribute("aria-expanded", "true"); measure();
  };
  sCopy.onclick = () => {
    const url = shareURL(cur());
    const done = () => { sCopy.setAttribute("data-done", ""); sCopy.lastElementChild.textContent = "הקישור הועתק"; };
    const old = () => { const t = doc.createElement("textarea"); t.value = url; t.style.cssText = "position:fixed;opacity:0"; doc.body.appendChild(t); t.select(); try { doc.execCommand("copy"); done(); } catch (e) {} t.remove(); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, old); else old();
  };
  doc.addEventListener("keydown", (e) => { if (e.key === "Escape" && !sBox.hidden) { closeShare(); sBtn.focus(); } });
  qList.onclick = (e) => { const b = e.target.closest("[data-i]"); if (b) go(+b.dataset.i, true); };

  /* seeking: drag along the bar (it fills from the right, like the page reads) or use the arrow keys */
  const fracAt = (x) => { const r = prog.getBoundingClientRect(); return Math.min(1, Math.max(0, (r.right - x) / r.width)); };
  const showFrac = (f) => { fill.style.transform = `scaleX(${f.toFixed(4)})`; knob.style.insetInlineStart = (f * 100).toFixed(2) + "%"; if (player && ready) tCur.textContent = fmt(f * player.getDuration()); };
  prog.addEventListener("pointerdown", (e) => {
    if (!player || !ready) return;
    dragging = true; prog.classList.add("drag"); prog.setPointerCapture(e.pointerId); showFrac(fracAt(e.clientX));
    const mv = (ev) => showFrac(fracAt(ev.clientX));
    const up = (ev) => { prog.removeEventListener("pointermove", mv); prog.removeEventListener("pointerup", up); prog.removeEventListener("pointercancel", up);
      dragging = false; prog.classList.remove("drag"); player.seekTo(fracAt(ev.clientX) * player.getDuration(), true); paintTime(); save(); };
    prog.addEventListener("pointermove", mv); prog.addEventListener("pointerup", up); prog.addEventListener("pointercancel", up);
  });
  prog.addEventListener("keydown", (e) => {
    if (!player || !ready) return;
    const step = { ArrowLeft: 5, ArrowRight: -5, ArrowUp: 5, ArrowDown: -5, PageUp: 30, PageDown: -30 }[e.key];
    if (e.key === "Home") { e.preventDefault(); player.seekTo(0, true); }
    else if (e.key === "End") { e.preventDefault(); player.seekTo(player.getDuration() - 1, true); }
    else if (step) { e.preventDefault(); player.seekTo(Math.max(0, player.getCurrentTime() + step), true); }
    setTimeout(paintTime, 60);
  });
  if ("mediaSession" in navigator) try {
    navigator.mediaSession.setActionHandler("nexttrack", () => go(idx + 1, true));
    navigator.mediaSession.setActionHandler("previoustrack", prevSong);
  } catch (e) {}

  /* ---------- across pages: remember the song and the second ---------- */
  function save() {
    if (!cur() || el.dataset.state === "hidden") return;
    let t = pendingStart; try { if (player && ready) t = player.getCurrentTime() || t; } catch (e) {}
    /* the names go along, so a song named only on the page it came from (a single) keeps its name on the next page */
    const names = {}; for (const id of Q) { const m = meta.get(id); if (m) names[id] = m; }
    try { sessionStorage.setItem(KEY, JSON.stringify({ q: Q, i: idx, t, playing, state: el.dataset.state, at: Date.now(), names })); } catch (e) {}
  }
  setInterval(() => { if (playing) save(); }, 3000);
  addEventListener("pagehide", save);
  function restore() {
    let s = null; try { s = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) {}
    if (!s || !Array.isArray(s.q) || !s.q.length || Date.now() - s.at > FRESH) return;
    Q = s.q; idx = Math.min(s.i || 0, Q.length - 1); pendingStart = s.t || 0;
    if (s.names) for (const id in s.names) if (!meta.has(id)) meta.set(id, s.names[id]);
    dataReady.then(paintInfo); paintInfo(); tCur.textContent = fmt(pendingStart);
    if (s.playing && s.state === "open") {
      /* it was playing: carry on from the same second. A browser that blocks sound until the visitor touches the page
         leaves it ready and paused, one press on play away */
      setState("open"); load(cur(), pendingStart, true);
    } else setState("mini");
  }

  doc.body.appendChild(el);
  /* pause/resume from a button on the page (an album card); the video is shown again first, as YouTube requires */
  const toggleFromPage = () => { if (!cur()) return; if (el.dataset.state !== "open") setState("open"); toggle(); };
  window.DK_PLAYER = { play, next: () => go(idx + 1, true), prev: prevSong, close, now, toggle: toggleFromPage };
  /* opened from a shared link (?play=<song>): the player opens on that song. It tries to play at once; a browser that
     blocks sound until the visitor touches the page leaves it ready, one press away. The address is cleaned, so a
     reload or the back button does not start it again. The queue becomes the page's songs once they are known. */
  function fromLink() {
    let id = null; try { id = new URLSearchParams(location.search).get("play"); } catch (e) {}
    if (!id || !/^[\w-]{11}$/.test(id)) return false;
    try { const u = new URL(location.href); u.searchParams.delete("play"); history.replaceState(history.state, "", u.pathname + u.search + u.hash); } catch (e) {}
    Q = [id]; idx = 0; setState("open"); paintInfo(); load(id, 0, true); save();
    /* the queue is rebuilt while it is still the one made here (the visitor has not picked another song meanwhile) */
    let mine = Q;
    const widen = () => { if (Q !== mine || cur() !== id) return; const q = queueFor(id); if (q.length > Q.length) { Q = mine = q; idx = q.indexOf(id); paintInfo(); save(); } };
    dataReady.then(() => { paintInfo(); widen(); });
    doc.addEventListener("chrome:ready", () => setTimeout(widen, 600), { once: true });   // the page's own lists are built by then
    return true;
  }
  if (!fromLink()) restore();
})();
