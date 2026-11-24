/* Site-wide motion: loaded in <head> on every page (so the page-enter fade starts with the first paint).
   Tags blocks, headings and groups (also content rendered later from the data files) and plays them in
   as they scroll into view; adds page-leave fade, pointer light/tilt on cards, the menu stagger and a
   thin reading line on inner pages. Styles live in assets/css/motion.css. Off for reduced-motion users. */
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const root = document.documentElement;
  root.classList.add("mo-on");

  /* page enter (user 08/11, "the screen jumps before it opens"): the page stays hidden while the header, footer and
     the content from the data files are being built, and fades in once, already in its final shape */
  root.classList.add("mo-wait");
  /* user 09/11 ("the screen doesn't appear at once"): whatever is on the first screen shows as is, no play-in;
     only what lies further down still arrives as you scroll to it */
  const release = () => {
    if (!root.classList.contains("mo-wait")) return;
    const vh = innerHeight;
    document.querySelectorAll(".mo:not(.mo-in), .mo-h:not(.mo-in), .mo-k:not(.mo-in)").forEach((n) => {
      if (n.getBoundingClientRect().top < vh) { n.classList.add("mo-in", "mo-now"); io.unobserve(n); }
    });
    root.classList.remove("mo-wait");
  };
  setTimeout(release, 700);   /* never keep the page hidden for long, whatever happens */
  document.addEventListener("DOMContentLoaded", () => { if (!document.querySelector('script[src*="assets/js/app.js"]')) release(); });   /* pages built without the shared header */
  document.addEventListener("chrome:ready", () => {
    /* the page's own content (cards, lists) arrives right after the header; wait for it to settle, at most 450ms */
    const main = document.querySelector("main") || document.body;
    const done = () => { mo.disconnect(); clearTimeout(t); clearTimeout(cap); requestAnimationFrame(release); };
    let t = setTimeout(done, 40);
    const cap = setTimeout(done, 180);
    const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(done, 30); });
    mo.observe(main, { childList: true, subtree: true });
  });

  /* never touch the home album animation, the header, overlays or the cart drawer */
  const SKIP = "#ia-stage, .site-header, .overlay, .lightbox, .drawer, .email-suggest";
  const HEAD = "main h1, main .brush, .ia-content .brush, .site-footer .brush";
  const GROUP = ".grid, .tracks, .singles, .platforms, .filters, .socials, .footer-nav, #shows-list, .nl-socials";
  const BLOCK = "main p, main .eyebrow, main .section-head, main .product, main .panel, main .hero-actions, main form, main .smart > img, main .smart > a, main .nl-box, main .nl-name, main .empty-state, .site-footer .newsletter, .site-footer .footer-bar, .site-footer .credits, .ia-content p, #about-text-l > *";

  /* items of a group are watched one by one; those that come into view together are numbered in reading
     order so they arrive one after another (a long grid keeps playing as you scroll, not all at once) */
  const io = new IntersectionObserver((es) => {
    const kids = [];
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      if (e.target.classList.contains("mo-k")) kids.push(e); else e.target.classList.add("mo-in");
    });
    kids.sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top) || (b.boundingClientRect.left - a.boundingClientRect.left))
      .forEach((e, i) => { e.target.style.setProperty("--i", Math.min(i, 12)); e.target.classList.add("mo-in"); });
  }, { rootMargin: "0px 0px -6% 0px", threshold: .08 });

  const skip = (n) => n.closest(SKIP);
  const inGroup = (n) => { const p = n.parentElement; return p && p.classList.contains("mo-g"); };

  function indexKids(g) { [...g.children].forEach((c) => { if (!c.classList.contains("mo-k")) { c.classList.add("mo-k"); io.observe(c); } }); }

  function tag(scope) {
    const q = (sel) => (scope.matches && scope.matches(sel) ? [scope] : []).concat([...scope.querySelectorAll(sel)]);
    q(GROUP).forEach((g) => { if (skip(g)) return; g.classList.add("mo-g"); indexKids(g); });
    q(HEAD).forEach((h) => { if (skip(h) || h.classList.contains("mo-h") || inGroup(h)) return; h.classList.add("mo-h"); io.observe(h); });
    q(BLOCK).forEach((b) => {
      if (skip(b) || b.classList.contains("mo") || b.classList.contains("mo-h") || inGroup(b)) return;
      if (b.parentElement && b.parentElement.closest(".mo, .mo-h")) return;   /* already moving with its parent */
      b.classList.add("mo"); io.observe(b);
    });
  }

  /* little staggers between siblings that arrive together (title, then text, then buttons) */
  function stagger() {
    document.querySelectorAll(".mo, .mo-h").forEach((n) => {
      if (n.style.getPropertyValue("--d")) return;
      let k = 0, s = n.previousElementSibling;
      while (s && k < 4) { if (s.matches(".mo, .mo-h, .mo-g")) k++; s = s.previousElementSibling; }
      if (k) n.style.setProperty("--d", k * 110 + "ms");
    });
  }

  let pending = false;
  const refresh = (nodes) => {
    nodes.forEach((n) => { if (n.nodeType === 1 && !skip(n)) tag(n); });
    if (!pending) { pending = true; requestAnimationFrame(() => { pending = false; stagger(); document.querySelectorAll(".mo-g").forEach(indexKids); }); }
  };

  function start() {
    tag(document.body); stagger();
    new MutationObserver((ms) => refresh(ms.flatMap((m) => [...m.addedNodes]))).observe(document.body, { childList: true, subtree: true });
    pointerFx(); menuFx(); leaveFx(); progressFx();
  }

  /* cards: light follows the pointer and the card tilts a little toward it */
  function pointerFx() {
    if (!matchMedia("(pointer: fine)").matches) return;
    document.addEventListener("pointermove", (e) => {
      const c = e.target.closest && e.target.closest(".pcard, .vcard, .acard, .panel");
      if (!c) return;
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty("--mx", (x * 100).toFixed(1) + "%"); c.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      if (!c.classList.contains("panel")) { c.style.setProperty("--ry", ((x - .5) * 6).toFixed(2) + "deg"); c.style.setProperty("--rx", ((.5 - y) * 6).toFixed(2) + "deg"); }
    }, { passive: true });
  }

  /* menu: number the links so they arrive one by one each time it opens */
  function menuFx() {
    const set = () => document.querySelectorAll("#menu-overlay nav a, #menu-overlay .socials a").forEach((a, i) => a.style.setProperty("--i", i));
    set(); setTimeout(set, 800);
  }

  /* leaving: fade out before going to another page of the site */
  function leaveFx() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      /* no fade-out delay before leaving (user 09/11): the next page opens at once */
    });
    addEventListener("pageshow", () => root.classList.remove("mo-leave"));
  }

  /* inner pages: thin red line at the top that fills as you read */
  function progressFx() {
    if (document.getElementById("intro")) return;
    const bar = document.createElement("div"); bar.className = "mo-progress"; bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    let raf = 0;
    const paint = () => { raf = 0; const max = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${max > 40 ? Math.min(1, scrollY / max) : 0})`; };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
    addEventListener("resize", paint); paint();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
