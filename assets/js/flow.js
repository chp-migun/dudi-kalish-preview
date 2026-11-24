/* Scroll feel (user 10/11, from the GSAP / Lenis / React Bits video):
   1. smooth, weighted scrolling on desktop (Lenis), kept in step with GSAP's clock;
   2. photos drift a little slower than the page as it scrolls by (GSAP ScrollTrigger, scrubbed);
   3. section titles are written in letter by letter, blurred to sharp (React Bits "split / blur text" idea),
      played by motion.js's .mo-in like before; whatever is on the first screen still shows as is;
   4. buttons lean toward the pointer (React Bits "magnet" idea), desktop only.
   The home album animation (#ia-stage) is never touched. Off for reduced-motion users. */
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const fine = matchMedia("(pointer: fine)").matches;
  const G = window.gsap, ST = window.ScrollTrigger;
  if (G && ST) { G.registerPlugin(ST); ST.config({ ignoreMobileResize: true }); }   /* the address bar hiding on phones does not re-measure the page */

  /* ---- 1. smooth scrolling ---- */
  let lenis = null;
  if (window.Lenis && fine) {
    /* 23/11: a touch quicker to answer the wheel (it was .07: the page kept sliding long after the hand stopped), still
       with the same soft landing */
    lenis = new Lenis({ lerp: .1, wheelMultiplier: 1, smoothWheel: true, syncTouch: false,
      prevent: (n) => !!(n && n.closest && n.closest(".overlay, .drawer, .lightbox, .email-suggest, [data-lenis-prevent]")) });
    window.lenis = lenis;
    if (G) { G.ticker.add((t) => lenis.raf(t * 1000)); G.ticker.lagSmoothing(0); }
    else { const loop = (t) => { lenis.raf(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
    /* the page's animation (album, photo, top bar) is drawn in the very same moment the page moves, not one frame
       later, so the pinned scene and the scrolling content never slip apart (assets/js/frame.js) */
    lenis.on("scroll", () => { if (window.DK_FRAME) DK_FRAME.flush(); if (ST) ST.update(); });
    /* menu, cart and video windows lock the page: pause the smoothing while they are open */
    const sync = () => (document.body.style.overflow === "hidden" ? lenis.stop() : lenis.start());
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["style"] });
    /* links to a spot on the same page glide there */
    document.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest('a[href*="#"]');
      if (!a || e.defaultPrevented) return;
      const u = new URL(a.href, location.href);
      if (u.pathname !== location.pathname || !u.hash) return;
      const t = document.getElementById(decodeURIComponent(u.hash.slice(1)));
      if (!t) return;
      e.preventDefault(); history.pushState(null, "", u.hash);
      lenis.scrollTo(t, { offset: -80, duration: 1.2 });
    });
  }

  const skip = (n) => n.closest("#ia-stage, .site-header, .overlay, .lightbox, .drawer");

  /* ---- 2. photos drift as the page scrolls ---- */
  const DRIFT = ".about-img img, .art img, main .smart > img, .nl-hero img, .product .media img, .product-media img";
  function drift(root) {
    let made = 0;
    if (!ST) return made;
    root.querySelectorAll(DRIFT).forEach((img) => {
      if (img.dataset.fxDrift || skip(img)) return;
      img.dataset.fxDrift = "1"; made++;
      img.style.scale = "1.12";
      ST.create({ trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: .6,
        onUpdate: (s) => { img.style.translate = `0 ${((s.progress - .5) * -10).toFixed(2)}%`; } });
    });
    return made;
  }

  /* ---- 3. titles written in letter by letter ---- */
  function split(h) {
    const text = h.textContent.replace(/\s+/g, " ").trim();
    if (!text || h.children.length || h.dataset.fxText === text) return;
    h.dataset.fxText = text;
    h.setAttribute("aria-label", text);
    let i = 0;
    h.innerHTML = text.split(" ").map((w) =>
      `<span class="fx-w" aria-hidden="true">${[...w].map((c) => `<span class="fx-c" style="--ci:${i++}">${c.replace(/[<&]/g, (m) => (m === "<" ? "&lt;" : "&amp;"))}</span>`).join("")}</span>`
    ).join(" ");
    h.classList.add("fx-split");
  }
  const TITLES = "main .brush, .ia-content .brush, .site-footer .brush";
  function titles(root) {
    root.querySelectorAll(TITLES).forEach((h) => { if (!skip(h) && !h.classList.contains("fx-split")) split(h); });
  }

  /* ---- 4. magnetic buttons ---- */
  function magnet() {
    if (!fine) return;
    let cur = null;
    const reset = (b) => { b.style.setProperty("--fx-x", "0px"); b.style.setProperty("--fx-y", "0px"); };
    document.addEventListener("pointermove", (e) => {
      const b = e.target.closest && e.target.closest(".btn, .icon-btn, #ia-cta a");
      if (cur && cur !== b) { reset(cur); cur = null; }
      if (!b) return;
      cur = b;
      const r = b.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      b.style.setProperty("--fx-x", (dx * 10).toFixed(1) + "px");
      b.style.setProperty("--fx-y", (dy * 8).toFixed(1) + "px");
    }, { passive: true });
    document.addEventListener("pointerleave", () => { if (cur) { reset(cur); cur = null; } });
  }

  /* content from the data files arrives later: pick it up as it lands */
  let queued = false;
  /* the page is re-measured only when a new drifting photo really arrived. Re-measuring on every change in the page
     ran many times a second while scrolling (the measuring itself changes the page), and on iPhones each run yanks
     the scroll: the screen jumped (user 17/11) */
  const scan = () => { queued = false; titles(document); if (drift(document) && ST) ST.refresh(); };
  function start() {
    titles(document); drift(document); magnet();
    new MutationObserver(() => { if (!queued) { queued = true; setTimeout(scan, 120); } })
      .observe(document.body, { childList: true, subtree: true, characterData: true });
    addEventListener("load", () => ST && ST.refresh());
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
