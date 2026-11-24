/* פתיח דף הבית: תמונת דודי מהעטיפה למעלה, האלבום בקטן מתחתיה.
   While the visitor scrolls through the first stretch (#ia-herozone) the photo fades up and away and the
   album grows from small (under the photo) to full size in the centre; only then the page-turning starts.
   Uses the CSS `scale` / `translate` properties so it composes with the animation's own transform.
   23/11 (smooth scrolling): split in two — read() measures everything first, write() then changes the page. It used to
   measure in between its own changes, which made the browser lay the page out again several times a frame. It runs in
   the page-wide frame loop (assets/js/frame.js), in step with the scrolling and the album. */
(() => {
  const track = document.getElementById("ia-track"), zone = document.getElementById("ia-herozone");
  const hero = document.getElementById("ia-hero"), book = document.getElementById("ia-book"), floor = document.getElementById("ia-floor");
  const stage = document.getElementById("ia-stage");
  const vign = stage && stage.querySelector(".vign");   /* its round shading would draw an arc over the light photo */
  const nm = document.getElementById("ia-hero-name");    /* the big name under the photo: rises into the top bar and turns white */
  const en = document.getElementById("ia-hero-en");      /* DUDI KALISH under it: rides up with it and sits under it in the bar */
  if (!track || !zone || !hero || !book) return;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const io = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const mix = (a, b, t) => a + (b - a) * t;
  const G = [[0, 140, 170, 169], [.48, 136, 167, 166], [.63, 72, 102, 101], [.78, 30, 52, 51], [.92, 14, 26, 25], [1, 12, 23, 22]];
  let hdr = null, ret = null, fin = null;
  const pic = hero.firstElementChild;

  /* ---- 1. measure (nothing on the page has changed yet this frame) ---- */
  /* 23/11: once the whole scene is above the screen, one last paint in its final state, then rest until it comes back
     (it measured and painted every frame for nobody — about 6 ms a frame on a slow machine) */
  let restOff = false;
  function read() {
    if (track.getBoundingClientRect().bottom < 0) { if (restOff) return { skip: true }; restOff = true; }
    else if (restOff) {
      /* back on screen: the album scene repaints in this same frame, so measure once more on the next one */
      restOff = false; requestAnimationFrame(() => window.DK_FRAME && DK_FRAME.req());
    }
    if (!hdr || !hdr.isConnected) hdr = document.querySelector(".site-header");
    if (!ret) ret = document.getElementById("ia-return");
    if (!fin) fin = document.getElementById("ia-finale");
    const VH = stage.clientHeight, VW = stage.clientWidth, mobile = VW < 760;
    const stTop = stage.getBoundingClientRect().top;
    const y = Math.max(0, -track.getBoundingClientRect().top);
    const zh = zone.offsetHeight;
    const hraw = hdr ? hdr.offsetHeight : 0, hh = hraw || 80;
    const m = { VH, VW, mobile, y, zh, hh, hraw, stTop, wide: null, nm: null };
    if (VW >= 1100) {
      const col = document.querySelector("#intro .ia-row:not(.moved-to-end) .ia-side.l");
      const rows = [...document.querySelectorAll("#intro .ia-row")].filter((r) => r.offsetHeight > 0);
      const last = rows.length ? rows[rows.length - 1].querySelector(".ia-side") : null;
      m.wide = { cr: col ? col.getBoundingClientRect() : null, need: book.offsetWidth * 1.04,
        total: Math.max(1, track.offsetHeight - stage.offsetHeight - ((ret || {}).offsetHeight || 0)), finH: fin ? fin.offsetHeight : null,
        lb: last ? last.getBoundingClientRect().bottom : -1 };
    }
    if (nm) {
      const n = { fs: parseFloat(getComputedStyle(nm).fontSize) || 100, off: (hdr ? hdr.getBoundingClientRect().top : 0) - stTop,
        cy: nm.offsetTop + nm.offsetHeight / 2, logo: null, lfs: null, en: null };
      const lgo = !mobile && document.querySelector(".site-header .logo");
      if (lgo) { const rg = document.createRange(); rg.selectNodeContents(lgo); const q = [...rg.getClientRects()].filter((r) => r.height > 0);
        if (q.length) { n.logo = (Math.min(...q.map((r) => r.top)) + Math.max(...q.map((r) => r.bottom))) / 2 - stTop; n.lfs = parseFloat(getComputedStyle(lgo).fontSize) || null; } }
      if (en) {
        const lg = document.querySelector(".site-header .logo"), lr = lg && lg.getBoundingClientRect();
        n.en = { fs: parseFloat(getComputedStyle(en).fontSize) || 16, cy: en.offsetTop + en.offsetHeight / 2, w: en.offsetWidth,
          lr: lr ? { bottom: lr.bottom, width: lr.width, height: lr.height } : null };
      }
      m.nm = n;
    }
    return m;
  }

  /* ---- 2. change the page ---- */
  function write(m) {
    if (m.skip) return;
    const { VH, VW, mobile, y, zh, hh, stTop } = m;
    const t = clamp(y / Math.max(1, zh));
    const e = io(t);
    /* start: small, on the left side of the photo; it then travels to the centre and grows to full size */
    const s0 = mobile ? .7 : .36, dx0 = -VW * (mobile ? .26 : .3), dy0 = VH * (mobile ? .04 : -.1);
    /* wide screens (user 08/11): while the content boxes scroll by on the left, the album stands on the right,
       sized to the free space; it comes back to the centre as the pages settle, before Dudi steps out */
    let s1 = 1, x1 = 0;
    if (m.wide) {
      const { cr, need, total, finH, lb } = m.wide;
      /* the free side is whichever side the boxes are not on (they can sit on the left or the right) */
      const mg = VW * .03;
      const onLeft = cr && (cr.left + cr.right) / 2 < VW / 2;
      const from = cr ? (onLeft ? cr.right : 0) : 0, to = cr ? (onLeft ? VW : cr.left) : VW;
      const avail = to - from - 2 * mg;   /* room for its tilt, so no page edge leaves the screen */
      if (cr && need) { s1 = Math.min(1, avail / need); x1 = from + mg + avail / 2 - VW / 2; }
      const fh = finH !== null ? Math.min(finH, total) : total * .25, a = total - fh, h0 = Math.min(zh, a);
      const p = y <= h0 ? 0 : y <= a ? (y - h0) / Math.max(1, a - h0) * .75 : .75;
      /* it grows back only once the last box (the shop) has scrolled away (user 08/11); the empty stretch after it
         (style.css) gives it room, and by the time the pages settle it is in the centre whatever happens */
      const back = Math.max(io(clamp((VH * .3 - lb) / (VH * .3 - hh))), io(clamp((p - .71) / .04)));
      s1 = mix(s1, 1, back); x1 = mix(x1, 0, back);
    }
    const s = mix(s0, s1, e).toFixed(4), dx = mix(dx0, x1, e).toFixed(1), dy = mix(dy0, 0, e).toFixed(1);
    book.style.scale = s; book.style.translate = `${dx}px ${dy}px`;
    if (floor) { floor.style.scale = s; floor.style.translate = `${dx}px ${dy}px`; }
    /* the photo drifts up and fades as the album takes over */
    const f = clamp(t * 1.5);
    /* user 09/11: only the photo leaves; its light backdrop stays at the top for the rest of the album scene */
    if (pic) { pic.style.opacity = (1 - f).toFixed(3); pic.style.transform = `translateY(${(-f * 10).toFixed(2)}vh) scale(${(1 + f * .06).toFixed(4)})`; pic.style.visibility = f >= 1 ? "hidden" : "visible"; }
    if (vign) vign.style.opacity = "0";
    /* the top bar takes the colour of the backdrop right under it, so it darkens gradually as the scene scrolls away (user 09/11) */
    const fr = ((hdr ? m.hraw * 1.3 : 100) - stTop) / Math.max(1, VH);
    let col = G[G.length - 1].slice(1);
    for (let i = 1; i < G.length; i++) if (fr <= G[i][0]) { const a0 = G[i - 1], a1 = G[i], u = clamp((fr - a0[0]) / (a1[0] - a0[0])); col = [1, 2, 3].map((j) => Math.round(mix(a0[j], a1[j], u))); break; }
    /* at the ending the backdrop turns solid dark (style.css), and the bar follows it (user 18/11) */
    const end = clamp(parseFloat(hero.style.getPropertyValue("--intro-end")) || 0);
    col = col.map((v, j) => Math.round(mix(v, G[G.length - 1][j + 1], end)));
    if (hdr) hdr.style.setProperty("--hb", `rgb(${col.join(" ")})`);
    document.documentElement.classList.toggle("hdr-on-photo", fr < .6 && end < .5);   /* header icons: red on the photo, turquoise on dark */

    /* the name travels up into the middle of the top bar, shrinks to logo size and stays album red (it lands on the
       light top bar of the album scene, user 09/11); it stays there while the content scrolls and gives way when the
       name is written again at the end */
    const n = m.nm;
    if (n) {
      const k = io(clamp(t * 1.25));
      /* measured on screen: iPhone Safari can draw the top bar lower than the album area while its toolbar moves,
         so the target is the bar's real place relative to the stage, not an assumed 0 (user 08/11, iPhone) */
      let tgt = n.off + hh / 2 - 8, lfs = mobile ? 28 : 36;
      if (n.logo !== null) { tgt = n.logo; lfs = n.lfs || lfs; }
      const ty = mix(0, tgt - n.cy, k), sc = mix(1, lfs / n.fs, k);
      nm.style.transform = `translateY(${ty.toFixed(1)}px) scale(${sc.toFixed(4)})`;
      nm.style.color = "rgb(168,48,32)";
      nm.style.textShadow = k > .5 ? "none" : "";
      /* phones: as it arrives, the name in the top bar (and its dark band) takes over from it (style.css) */
      const dk = clamp((k - .985) / .015).toFixed(3);
      (window.DK_SETVAR ? window.DK_SETVAR("--dock", dk) : document.documentElement.style.setProperty("--dock", dk));   /* every time: the top bar may be built after this first runs, and it must still get the value */
      if (n.en) {
        const E = n.en, lr = E.lr;
        /* phones: it lands exactly on the spaced English line of the top bar, which then takes over (user 08/11) */
        const ety = mix(0, (lr && lr.height ? lr.bottom - 5 - stTop : n.off + hh / 2 + (mobile ? 17 : 20)) - E.cy, k);
        const esc = mix(1, lr && lr.width && E.w ? lr.width / E.w : (mobile ? 8 : 9.5) / E.fs, k);
        en.style.transform = `translateY(${ety.toFixed(1)}px) scale(${esc.toFixed(4)})`;
      }
      /* it gives way to the name written at the end: opacity follows --intro-name in CSS (build_intro.py) */
    }
  }

  if (window.DK_FRAME) { write(read()); DK_FRAME.add({ read, write }); }
  else {
    let raf = 0;
    const paint = () => { raf = 0; write(read()); };
    const req = () => { if (!raf) raf = requestAnimationFrame(paint); };
    addEventListener("scroll", req, { passive: true });
    addEventListener("resize", req);
    if (window.visualViewport) { visualViewport.addEventListener("resize", req); visualViewport.addEventListener("scroll", req); }
    paint();
  }
})();
