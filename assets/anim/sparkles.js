/* נקודות אור ברקע דף הבית — עומק ותחושת יוקרה.
   Three depth bands: far pin-points (slow, dim), mid sparks (twinkle), near bokeh (large, soft, faster).
   Scroll and (on desktop) the mouse move each band by its depth → parallax, so the field reads as 3D.
   Lives behind the album inside the pinned stage; sleeps when the home intro is off screen. */
(() => {
  const cv = document.getElementById("ia-sparks");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const stage = document.getElementById("ia-stage");
  const track = document.getElementById("ia-track");
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = matchMedia("(pointer: fine)").matches;

  const LITE = () => !!(window.DK_LITE && window.DK_LITE.on);   /* weak machine (lite.js): the canvas is hidden and nothing is drawn */
  let W = 0, H = 0, dpr = 1, pts = [], live = true, raf = 0, last = 0;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  /* soft round sprites, pre-rendered once */
  const sprite = (inner, mid, outer) => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, inner); gr.addColorStop(.22, mid); gr.addColorStop(1, outer);
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c;
  };
  const SPARK = sprite("rgba(255,255,255,1)", "rgba(214,232,231,.55)", "rgba(172,196,195,0)");
  const WARM  = sprite("rgba(255,250,240,1)", "rgba(236,222,196,.45)", "rgba(220,200,170,0)");
  const BOKEH = sprite("rgba(200,222,221,.55)", "rgba(172,196,195,.32)", "rgba(124,156,155,0)");

  function seed() {
    const area = W * H, mobile = W < 760;
    const n = Math.round(Math.min(mobile ? 36 : 80, area / (mobile ? 9000 : 16000)));   /* lighter (user 08/11) */
    pts = [];
    for (let i = 0; i < n; i++) {
      const r = Math.random();
      const band = r < .55 ? 0 : r < .9 ? 1 : 2;            // far · mid · near
      const z = band === 0 ? .15 + Math.random() * .25 : band === 1 ? .45 + Math.random() * .3 : .85 + Math.random() * .15;
      pts.push({
        band, z,
        x: Math.random(), y: Math.random(),
        vy: (.004 + Math.random() * .01) * z,                // rise per second (fraction of height)
        sway: Math.random() * Math.PI * 2, swayHz: .05 + Math.random() * .12, swayAmp: (4 + Math.random() * 10) * z,
        tw: Math.random() * Math.PI * 2, twHz: .25 + Math.random() * .9,
        size: band === 2 ? 9 + Math.random() * 16 : band === 1 ? 1.4 + Math.random() * 1.8 : .6 + Math.random() * .9,
        a: band === 2 ? .05 + Math.random() * .08 : band === 1 ? .45 + Math.random() * .45 : .25 + Math.random() * .35,
        warm: band === 1 && Math.random() < .18
      });
    }
  }

  function size() {
    dpr = 1;   /* soft dots need no retina sharpness; a quarter of the pixels to draw */
    /* the phone's address bar hiding fires resize with nothing changed here: the dots are not thrown again (17/11) */
    if (cv.width && stage.clientWidth === W && stage.clientHeight === H) return;
    W = stage.clientWidth; H = stage.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + "px"; cv.style.height = H + "px";
    if (LITE()) { cv.width = cv.height = 1; return; }
    seed(); draw(performance.now(), 0);
  }

  function draw(now, dt) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    const t = now / 1000;
    const scroll = window.scrollY || 0;
    mouse.x += (mouse.tx - mouse.x) * .04; mouse.y += (mouse.ty - mouse.y) * .04;
    for (const p of pts) {
      if (!RM) {
        p.y -= p.vy * dt;
        if (p.y < -.05) { p.y = 1.05; p.x = Math.random(); }
      }
      /* parallax: nearer points travel further with scroll and pointer */
      let y = (p.y * H - scroll * p.z * .12) % (H * 1.1);
      if (y < -H * .05) y += H * 1.1;
      const x = p.x * W + Math.sin(p.sway + t * p.swayHz * 6.283) * p.swayAmp + mouse.x * 28 * p.z;
      const yy = y + mouse.y * 16 * p.z;
      const tw = p.band === 2 ? 1 : .55 + .45 * Math.sin(p.tw + t * p.twHz * 6.283);
      const al = p.a * (RM ? .8 : tw);
      if (al <= .01) continue;
      const s = p.band === 2 ? p.size : p.size * 4;           // sprite glow is wider than the core
      ctx.globalAlpha = al;
      ctx.drawImage(p.band === 2 ? BOKEH : p.warm ? WARM : SPARK, x - s, yy - s, s * 2, s * 2);
    }
    ctx.globalAlpha = 1;
  }

  function loop(now) {
    if (LITE()) { raf = 0; return; }
    if (last && now - last < 31) { raf = live && !RM ? requestAnimationFrame(loop) : 0; return; }   /* 30 frames a second is plenty for drifting dots */
    const dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now;
    draw(now, dt);
    raf = live && !RM ? requestAnimationFrame(loop) : 0;
  }
  const wake = () => { if (!raf && live && !RM && !LITE()) { last = 0; raf = requestAnimationFrame(loop); } };

  /* only run while the home intro is on screen and the tab is visible */
  new IntersectionObserver(([e]) => { live = e.isIntersecting && !document.hidden; live ? wake() : 0; }).observe(track);
  document.addEventListener("visibilitychange", () => { live = !document.hidden; live ? wake() : 0; });
  if (FINE && !RM) addEventListener("pointermove", (e) => { mouse.tx = (e.clientX / innerWidth - .5) * 2; mouse.ty = (e.clientY / innerHeight - .5) * 2; }, { passive: true });
  if (RM) addEventListener("scroll", () => { if (!LITE()) draw(performance.now(), 0); }, { passive: true });
  document.addEventListener("dk:lite", size);
  addEventListener("resize", size);
  size(); wake();
})();
