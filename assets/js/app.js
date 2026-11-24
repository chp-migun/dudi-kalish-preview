/* newsletter signup, shared by the footer form and the newsletter page */
window.dkSubscribe = async (data) => {
  try {
    const r = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, consent: true }) });
    return r.ok && (await r.json()).ok === true;
  } catch { return false; }
};
/* test and preview addresses (anything on netlify.app) are kept out of search engines; only dudikalish.com is indexed */
if (/(^|.)netlify.app$/.test(location.hostname)) document.head.insertAdjacentHTML("beforeend", '<meta name="robots" content="noindex, nofollow">');
/* visit counter: one anonymous ping per page, no cookies (counted only on the live site) */
(() => {
  try {
    if (!/(^|\.)(dudikalish\.(com|co\.il)|netlify\.app)$/.test(location.hostname)) return;
    const q = new URLSearchParams(location.search);
    let ext = true; try { ext = !document.referrer || new URL(document.referrer).hostname !== location.hostname; } catch {}
    const data = JSON.stringify({ p: location.pathname, r: ext ? document.referrer : "", u: q.get("utm_source") || "", n: ext ? 1 : 0 });
    if (!(navigator.sendBeacon && navigator.sendBeacon("/api/hit", new Blob([data], { type: "text/plain" })))) fetch("/api/hit", { method: "POST", body: data, keepalive: true }).catch(() => {});
  } catch {}
})();
/* =====================================================================
   דודי קאליש, קוד משותף לכל העמודים
   הידר, תפריט-פופאפ, סל קניות (localStorage), יצירת קשר, ניוזלטר, לייטבוקס, אייקונים
   ===================================================================== */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  /* An open window (menu, cart, video, song list, payment) locks the page behind it. Every window asks for that
     on the body; here the lock is also put on the page root, where the browser really obeys it (the root has its
     own sideways clipping, so a lock on the body alone left the page scrolling). The scrollbar's place is kept,
     so nothing jumps sideways. */
  const lockPage = () => {
    const on = document.body.style.overflow === "hidden", r = document.documentElement.style;
    r.overflowY = on ? "hidden" : ""; r.scrollbarGutter = on && innerWidth > document.documentElement.clientWidth ? "stable" : (on ? r.scrollbarGutter : "");
  };
  new MutationObserver(lockPage).observe(document.body, { attributes: true, attributeFilter: ["style"] });
  /* Back to the top: a round button floats in the corner once the page has been scrolled down a screen */
  document.head.insertAdjacentHTML("beforeend", `<style>
    .to-top{position:fixed;z-index:80;inset-inline-end:19px;bottom:calc(20px + env(safe-area-inset-bottom,0px));width:48px;height:48px;border-radius:50%;display:grid;place-items:center;padding:0;cursor:pointer;
      background:rgba(23,48,46,.82);border:1px solid var(--line);color:var(--ink);backdrop-filter:blur(8px);box-shadow:0 12px 28px -12px rgba(0,0,0,.8);
      opacity:0;visibility:hidden;transform:translateY(12px);transition:opacity .3s,transform .3s,visibility 0s .3s,border-color .2s}
    /* the 'shown' state has its own name: the plain word 'show' is also the concerts card's class, whose three columns pushed the arrow off centre on wide screens */
    .to-top.is-up{opacity:1;visibility:visible;transform:none;transition:opacity .3s,transform .3s,border-color .2s}
    .to-top:hover{border-color:var(--teal-light)}
    .to-top svg{width:22px;height:22px}
    @media (prefers-reduced-motion:reduce){.to-top{transition:none}}
  </style>`);
  const toTop = document.createElement("button");
  toTop.type = "button"; toTop.className = "to-top"; toTop.setAttribute("aria-label", "חזרה לראש העמוד"); toTop.title = "חזרה לראש העמוד";
  toTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7M12 19V5"/></svg>';   // lucide arrow-up
  toTop.onclick = () => { if (window.lenis) window.lenis.scrollTo(0, { duration: 1.1 }); else scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); };
  /* never on the home page (user 16/11). 23/11: and there it no longer watches the scroll either — it read the window
     height on every scroll step, which made the browser lay out the home page again mid-frame */
  if (!document.getElementById("intro")) {
    document.body.appendChild(toTop);
    let vh = innerHeight, up = null;
    addEventListener("resize", () => { vh = innerHeight; }, { passive: true });
    const topSeen = () => { const on = scrollY > Math.max(500, vh * .8); if (on !== up) { up = on; toTop.classList.toggle("is-up", on); } };
    addEventListener("scroll", topSeen, { passive: true }); topSeen();
  }
  document.head.insertAdjacentHTML("beforeend", "<style>.overlay,.drawer,.lightbox,.overlay ol,.drawer .items{overscroll-behavior:contain}</style>");

  const BASE = (document.currentScript && document.currentScript.dataset.base) || "";
  const ICON = (name, cls = "") => {
    const s = (window.ICONS && window.ICONS[name]) || "";
    return cls ? s.replace("<svg", `<svg class="${cls}"`) : s;
  };
  // small UI glyphs not taken from the reference site (lucide-style, inline)
  const UI = {
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"><path d="M8.6 6.1v11.8c0 .9 1 1.4 1.7.9L19 12.9c.6-.4.6-1.3 0-1.8l-8.7-5.9c-.7-.5-1.7 0-1.7.9z"/></svg>',
    /* soft-cornered outline triangle for the trailer button; points left = the reading direction of the page (rtl) */
    playSoft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M15.4 6.1v11.8c0 .9-1 1.4-1.7.9L5 12.9c-.6-.4-.6-1.3 0-1.8l8.7-5.9c.7-.5 1.7 0 1.7.9z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="m8 12.5 2.5 2.5L16 9.5"/></svg>',
    chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>',
    chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    arrowL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 16v-4M12 8h.01"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>'
  };
  window.UI = UI; window.ICON = ICON;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const fmt = (n) => `${Number(n).toLocaleString("he-IL")} ₪`;
  window.fmt = fmt; window.el = el; window.$ = $; window.$$ = $$;
  /* launch price: a product marked "הזמנה מוקדמת" in the admin is sold at the launch discount (settings), rounded down
     to whole shekels. Display only: the server works the price out again by the same rule (netlify/lib/catalog.mjs) */
  const launchPct = () => { const n = Number(window.SITE?.launchDiscount?.percent); return n > 0 && n <= 90 ? n : 0; };
  const onLaunch = (p) => p?.preorder === true && launchPct() > 0;
  const priceOf = (p, list = p.price) => onLaunch(p) ? Math.max(1, Math.floor(Number(list) * (100 - launchPct()) / 100)) : Number(list);
  window.priceOf = priceOf;
  window.priceHTML = (p, list = p.price) => { const now = priceOf(p, list); return now < Number(list) ? `${fmt(now)} <s>${fmt(list)}</s>` : fmt(now); };
  window.saleNote = (p) => onLaunch(p) ? `מחיר השקה · ${launchPct()}% הנחה` : "";
  window.PREORDER_NOTE = "הזמנה מוקדמת · הקישור לאלבום יישלח אליכם למייל בימים הקרובים, לפני כולם";

  const cache = {};
  /* Moving between pages must feel instant: the site's data is kept in the browser, so the next page is built
     from the saved copy at once while a fresh copy is fetched in the background for the page after it.
     The cart page always waits for the fresh copy (prices there must be current), and so does a first visit. */
  const KEEP = "dk_data_", KEEP_MS = 6 * 3600e3;
  const byYear = (a, b) => (Number(b.year) || 0) - (Number(a.year) || 0);
  const fetchJSON = async (name) => {
    const r = await fetch(`${BASE}data/${name}.json`, { cache: "no-cache" });
    if (!r.ok) throw new Error("data " + r.status);   // an error answer is never kept as the site's data
    const data = await r.json();
    try { localStorage.setItem(KEEP + name, JSON.stringify({ t: Date.now(), data })); } catch {}
    return data;
  };
  window.loadJSON = (name) => cache[name] || (cache[name] = (async () => {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEEP + name) || "null"); } catch {}
    const age = saved?.data ? Date.now() - saved.t : Infinity;
    let data;
    if (age < KEEP_MS && !/cart\.html$/.test(location.pathname)) { data = saved.data; if (age > 20e3) fetchJSON(name).catch(() => {}); }
    else data = await fetchJSON(name);
    // every list of music (songs, clips, albums, singles) shows newest first, oldest at the bottom (user 09/11)
    ["items", "singles"].forEach(k => { const l = data[k]; if (Array.isArray(l) && l.some(x => x && x.year)) l.sort(byYear); });
    return data;
  })().catch((e) => { delete cache[name]; throw e; }));
  /* the page a visitor is about to open starts loading when the pointer or finger reaches its link */
  const warmed = new Set();
  const warm = (e) => {
    const a = e.target.closest?.("a[href]"); if (!a || a.target === "_blank") return;
    let u; try { u = new URL(a.href, location.href); } catch { return; }
    if (u.origin !== location.origin || u.pathname === location.pathname || warmed.has(u.pathname + u.search) || !/\.html$|\/$/.test(u.pathname)) return;
    warmed.add(u.pathname + u.search);
    const l = document.createElement("link"); l.rel = "prefetch"; l.href = u.pathname + u.search; document.head.appendChild(l);
  };
  document.addEventListener("pointerover", warm, { passive: true });
  document.addEventListener("touchstart", warm, { passive: true });

  // ---------------- cart ----------------
  const CART_KEY = "dk_cart_v1", NOTE_KEY = "dk_cart_note";
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-note-x]")) return;
    try { localStorage.removeItem(NOTE_KEY); } catch {}
    $$(".cart-note").forEach(n => n.remove());
  });
  // the server charges at most 20 of a line, whole numbers only; the cart shows the same
  const clampQty = (q) => Math.min(20, Math.max(1, Math.floor(Number(q)) || 1));
  const Cart = {
    read() { try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; } },
    write(items) { try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch {} ; Cart.render(); },
    /* a product that is already in the cart is not doubled when it is added again (user 20/11): the larger of the two
       quantities stays. quiet: no flying picture and no drawer, for a button that goes straight to the cart page */
    add(item, { quiet = false } = {}) {
      const items = Cart.read();
      const key = item.id + (item.option ? ":" + item.option : "");
      if (!(Number(item.list) > Number(item.price))) delete item.list;   // the full price, kept only beside a launch price
      const ex = items.find(i => i.key === key);
      if (ex && item.list) ex.list = item.list;
      if (ex) ex.qty = clampQty(Math.max(ex.qty, item.qty || 1)); else items.push({ key, ...item, qty: clampQty(item.qty || 1) });
      Cart.write(items); if (!quiet) Cart.fly(item).then(Cart.open);
    },
    // the product's picture jumps from the tapped button into the cart icon (or to its corner of the screen when the
    // icon has scrolled away), then the cart opens
    fly(item) {
      return new Promise((done) => {
        const to = document.querySelector("#open-cart"), from = Cart.lastTap, r = to?.getBoundingClientRect();
        if (!item.image || !from || Date.now() - from.t > 1500 || !r?.width
          || matchMedia("(prefers-reduced-motion: reduce)").matches || !document.body.animate) return done();
        const el = new Image(); el.src = item.image; el.alt = "";
        el.style.cssText = `position:fixed;left:${from.x}px;top:${from.y}px;width:84px;height:84px;border-radius:12px;object-fit:cover;z-index:9999;pointer-events:none;box-shadow:0 10px 30px rgba(0,0,0,.5);will-change:transform`;
        document.body.appendChild(el);
        const dx = r.left + r.width / 2 - from.x, dy = Math.max(30, Math.min(innerHeight - 30, r.top + r.height / 2)) - from.y, lift = Math.min(140, 60 + Math.abs(dx) * .15);
        const at = (x, y, sc, turn) => `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${turn}deg) scale(${sc})`;
        const end = () => { el.remove(); if (r.bottom > 0) to.animate([{ transform: "scale(1)" }, { transform: "scale(1.3)" }, { transform: "scale(1)" }], { duration: 280, easing: "ease-out" }); done(); };
        const an = el.animate([
          { transform: at(0, 0, .4, 0), opacity: 0 },
          { transform: at(0, -lift * .5, 1, 60), opacity: 1, offset: .18 },
          { transform: at(dx * .5, Math.min(0, dy * .5) - lift, .9, 400), opacity: 1, offset: .6 },
          { transform: at(dx, dy, .15, 720), opacity: .8 },
        ], { duration: 1000, easing: "cubic-bezier(.35,0,.3,1)" });
        an.onfinish = end; an.oncancel = end;
      });
    },
    setQty(key, qty) { const items = Cart.read().map(i => i.key === key ? { ...i, qty: clampQty(qty) } : i); Cart.write(items); },
    remove(key) { Cart.write(Cart.read().filter(i => i.key !== key)); },
    clear() { try { localStorage.removeItem(NOTE_KEY); } catch {} Cart.write([]); },
    total() { return Cart.read().reduce((s, i) => s + i.price * i.qty, 0); },
    // the sum at full prices, crossed out beside the sum to pay while a launch price is in the cart (user 20/11)
    wasHTML() { const full = Cart.read().reduce((s, i) => s + (Number(i.list) > Number(i.price) ? Number(i.list) : i.price) * i.qty, 0); return full > Cart.total() ? ` <s>${fmt(full)}</s>` : ""; },
    count() { return Cart.read().reduce((s, i) => s + i.qty, 0); },
    // a saved cart can outlive a catalog change: reprice each line from the current catalog,
    // move a line to the single price when its product dropped its options, and drop what no longer exists
    async sync() {
      const items = Cart.read();
      if (!items.length) return;
      const cat = await window.loadJSON("products");
      if (!Array.isArray(cat?.items) || !cat.items.length) return; // a broken catalog must never empty the cart
      const byId = new Map(cat.items.map(p => [p.id, p]));
      const out = [], gone = [];
      for (const i of items) {
        const p = byId.get(i.id);
        if (!p) { gone.push(i.title); continue; }
        let line;
        if (Array.isArray(p.options) && p.options.length) {
          const o = p.options.find(o => o.id === i.option);
          if (!o) { gone.push(p.title); continue; }
          line = { ...i, key: `${p.id}:${o.id}`, price: priceOf(p, o.price), list: Number(o.price), optionLabel: `${o.label} · ${fmt(priceOf(p, o.price))}` };
        } else {
          line = { ...i, key: p.id, price: priceOf(p), list: Number(p.price), optionLabel: "" };
          delete line.option;
        }
        if (!(line.price > 0)) { gone.push(p.title); continue; }
        if (!(line.list > line.price)) delete line.list;   /* the full price is kept only while a launch price is on: the cart shows it crossed out */
        line.title = p.title; line.image = p.image; line.qty = clampQty(line.qty);
        if (p.preorder === true) line.preorder = true; else delete line.preorder;   /* the cart says which lines are sent later */
        const ex = out.find(x => x.key === line.key);
        if (ex) ex.qty = clampQty(ex.qty + line.qty); else out.push(line);
      }
      // the buyer is told what left the cart; the notice stays until they close it
      if (gone.length) {
        const names = [...new Set([...Cart.note(), ...gone.map(t => String(t || "").replace(/\s*:\s*/, ": ").trim()).filter(Boolean)])];
        try { localStorage.setItem(NOTE_KEY, JSON.stringify(names)); } catch {}
      }
      if (JSON.stringify(out) !== JSON.stringify(items)) Cart.write(out);
    },
    note() { try { const n = JSON.parse(localStorage.getItem(NOTE_KEY) || "[]"); return Array.isArray(n) ? n : []; } catch { return []; } },
    noteHTML() {
      const n = Cart.note();
      if (!n.length) return "";
      const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
      const text = n.length === 1
        ? `${esc(n[0])} כבר לא זמין באתר, ולכן הוסר מהסל.`
        : `המוצרים האלה כבר לא זמינים באתר, ולכן הוסרו מהסל: ${n.map(esc).join(", ")}.`;
      return `<div class="cart-note" role="status">${UI.info}<span>${text}</span><button type="button" class="icon-btn" data-note-x aria-label="סגירת ההודעה">${UI.x}</button></div>`;
    },
    open() {
      const d = $("#cart-drawer"); if (!d) return;
      const was = d.dataset.open === "true";
      d.dataset.open = "true"; $("#cart-overlay").dataset.open = "true";
      // rows slide in one after another when the cart opens
      if (!was) $$("#cart-items .item").forEach((row, n) => Cart.anim(row, [{ opacity: 0, transform: "translateX(-28px)" }, { opacity: 1, transform: "none" }], { duration: 420, delay: 120 + n * 70, easing: "cubic-bezier(.2,.7,.2,1)", fill: "backwards" }));
    },
    // small motion helper: nothing moves for visitors who asked for less motion
    anim(node, frames, opts) { if (!node?.animate || matchMedia("(prefers-reduced-motion: reduce)").matches) return null; return node.animate(frames, opts); },
    close() { const d = $("#cart-drawer"); if (d) { d.dataset.open = "false"; $("#cart-overlay").dataset.open = "false"; } },
    render() {
      const items = Cart.read();
      $$("[data-cart-count]").forEach(b => { b.textContent = Cart.count(); b.hidden = Cart.count() === 0; });
      const list = $("#cart-items"); if (!list) return;
      list.style.overflowX = "hidden"; // rows slide sideways when they enter or leave: never a sideways scrollbar
      const before = Cart.shown, open =$("#cart-drawer")?.dataset.open === "true";
      Cart.shown = Object.fromEntries(items.map(i => [i.key, i.qty]));
      list.innerHTML = Cart.noteHTML();
      if (!items.length) { list.insertAdjacentHTML("beforeend", `<div class="empty">לא נמצאו מוצרים בעגלת הקניות.</div>`); }
      items.forEach(i => {
        list.appendChild(el(`
          <div class="item">
            <img src="${BASE}${i.image}" alt="">
            <div><b>${i.title}</b>${i.optionLabel ? `<small>${i.optionLabel}</small>` : ""}
              <div class="qty"><button aria-label="פחות" data-dec>${UI.minus}</button><span>${i.qty}</span><button aria-label="יותר" data-inc>${UI.plus}</button><small style="margin-inline-start:8px">${fmt(i.price * i.qty)}${Number(i.list) > Number(i.price) ? ` <s>${fmt(Number(i.list) * i.qty)}</s>` : ""}</small></div>
            </div>
            <button class="icon-btn remove" aria-label="הסרה" data-rm>${UI.trash}</button>
          </div>`));
        const row = list.lastElementChild;
        row.querySelector("[data-dec]").onclick = () => Cart.setQty(i.key, i.qty - 1);
        row.querySelector("[data-inc]").onclick = () => Cart.setQty(i.key, i.qty + 1);
        // removing: the row slides away and the list closes up, then the cart is redrawn
        row.querySelector("[data-rm]").onclick = () => {
          const h = row.offsetHeight, a = Cart.anim(row, [{ opacity: 1, transform: "none", height: h + "px", marginBottom: "0px" }, { opacity: 0, transform: "translateX(-40px)", height: h + "px", marginBottom: "0px", offset: .55 }, { opacity: 0, transform: "translateX(-40px)", height: "0px", marginBottom: "-12px", paddingBlock: "0px", borderWidth: "0px" }], { duration: 380, easing: "ease-in-out" });
          if (!a) return Cart.remove(i.key);
          row.style.overflow = "hidden"; a.onfinish = a.oncancel = () => Cart.remove(i.key);
        };
        if (before && open) {
          // a product that just joined pops in; a changed quantity gives the number and the sum a small bounce
          if (!(i.key in before)) Cart.anim(row, [{ opacity: 0, transform: "scale(.92) translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 380, easing: "cubic-bezier(.2,.8,.2,1)" });
          else if (before[i.key] !== i.qty) [row.querySelector(".qty span"), row.querySelector(".qty small")].forEach(n => Cart.anim(n, [{ transform: "scale(1.45)", color: "#fff" }, { transform: "scale(1)" }], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" }));
        }
      });
      const t = $("#cart-total");
      if (t) { const txt = fmt(Cart.total()); if (before && open && t.dataset.sum !== txt) Cart.anim(t, [{ transform: "scale(1.2)" }, { transform: "scale(1)" }], { duration: 320, easing: "ease-out" }); t.dataset.sum = txt; t.innerHTML = txt + Cart.wasHTML(); }
      $$("[data-cart-disabled]").forEach(b => b.toggleAttribute("disabled", !items.length));
    }
  };
  window.Cart = Cart;
  // where the visitor last tapped, so the jump to the cart starts from that button (keyboard: the button's centre)
  document.addEventListener("click", (e) => { const b = e.target.closest?.("button,a"), r = b?.getBoundingClientRect(); Cart.lastTap = { x: e.clientX || (r ? r.left + r.width / 2 : 0), y: e.clientY || (r ? r.top + r.height / 2 : 0), t: Date.now() }; }, true);

  // ---------------- chrome (header / footer / popups) ----------------
  async function mountChrome() {
    const site = await window.loadJSON("site");
    window.SITE = site;
    const F = site.flags || {}; window.FLAGS = F;
    /* test mode (user 10/11): opening any page with ?test=1 turns the store on in this browser only (prices, add to
       cart, cart, checkout form), ?test=0 or the badge turns it off. Every other visitor sees the site as set in the admin */
    const TEST = (() => { try {
      const q = new URLSearchParams(location.search).get("test");
      /* the public domain never enters test mode, also not by a link with ?test=1 */
      if (/(^|\.)dudikalish\.(com|co\.il)$/.test(location.hostname)) return false;
      if (q === "1") localStorage.setItem("dk-test", "1");
      if (q === "0") localStorage.setItem("dk-test", "0");
      /* on the inner link and the local preview it is on by default (user 10/11); never on the public domain */
      const inner = /^inside-dk27--/.test(location.hostname) || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
      const v = localStorage.getItem("dk-test");
      return v === "1" || inner;   /* always on there: it was too easy to switch off by mistake (user 10/11) */
    } catch { return false; } })();
    window.TEST_MODE = TEST;
    if (TEST) F.showPrices = true;
    document.documentElement.classList.toggle("no-prices", F.showPrices === false);
    document.documentElement.classList.toggle("no-shows", F.showShows === false);
    const page = location.pathname.split("/").pop() || "index.html";
    const isHome = page === "index.html";
    const navHTML = site.nav.filter(n => !n.requires || F[n.requires] !== false).map(n => `<a href="${BASE}${n.href}" ${n.href.split("#")[0] === page && !n.href.includes("#") ? 'aria-current="page"' : ""}>${n.label}</a>`).join("");
    const socialsHTML = (keys) => keys.filter(k => site.social[k]).map(k => `<a href="${site.social[k]}" target="_blank" rel="noopener" aria-label="${k}">${ICON(k)}</a>`).join("");

    // header
    const header = el(`
      <header class="site-header ${isHome ? "" : "inner"}">
        <button class="icon-btn" id="open-menu" aria-label="תפריט" aria-expanded="false"><span class="mb" aria-hidden="true"><i></i><i></i></span></button>
        <a class="logo" href="${BASE}index.html" aria-label="${site.artist}">${site.artist.replace(/^(\S+)/, '<span class="l1">$1</span>')}</a>
        <div class="hdr-left">
          <button class="icon-btn" id="open-search" aria-label="חיפוש באתר" title="חיפוש"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button>
          ${F.showPrices === false ? `<a class="icon-btn shop-link" href="${BASE}shop.html" aria-label="חנות" title="חנות">${ICON("cart")}</a>` : ""}
          <span class="cart-wrap" ${F.showPrices === false ? "hidden" : ""}><button class="icon-btn" id="open-cart" aria-label="סל קניות">${ICON("cart")}</button><span class="cart-count" data-cart-count hidden>0</span></span>
        </div>
      </header>`);
    document.body.prepend(header);
    if (TEST) {
      const badge = el(`<button type="button" class="test-badge" aria-label="מצב בדיקה: החנות פתוחה בדפדפן הזה" title="מצב בדיקה"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>בדיקה</button>`);
      document.body.appendChild(badge);
    }
    const intro = document.getElementById("intro");
    /* home: no solid bar at all (user 08/11: "it appears suddenly, remove it"). Instead, as soon as the ending starts
       scrolling away, the side icons fade out so nothing slides up behind the shop/menu buttons */
    const onScroll = () => {
      if (intro && intro.offsetHeight) document.documentElement.classList.toggle("intro-leaving", intro.getBoundingClientRect().bottom <= innerHeight + 2);
      else header.classList.toggle("solid", window.scrollY > 40);
      /* the search button shows only on the home page, and only at its very top (user 17/11) */
      header.classList.toggle("search-on", !!(intro && intro.offsetHeight) && window.scrollY < 40);
    };
    /* home (23/11): measured with the rest of the page's animation in one go (assets/js/frame.js), not in its own
       scroll handler, where it made the browser lay out the page once more for every scroll step */
    if (window.DK_FRAME && intro) {
      DK_FRAME.add({ read: () => ({ on: !!intro.offsetHeight, leave: intro.getBoundingClientRect().bottom <= innerHeight + 2, y: window.scrollY }),
        write: (m) => { if (m.on) document.documentElement.classList.toggle("intro-leaving", m.leave); else header.classList.toggle("solid", m.y > 40);
                        header.classList.toggle("search-on", m.on && m.y < 40); } });
      onScroll(); addEventListener("load", onScroll);
    } else { onScroll(); addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); addEventListener("load", onScroll); }

    // footer
    const footer = el(`
      <footer class="site-footer" id="contact">
        <div class="bg"></div>
        <div class="wrap">
          <div class="newsletter">
            <div>
              <h2 class="brush">ניוזלטר</h2>
              <p>הצטרפו למועדון החברים לקבלת עדכונים והנחות בלעדיות</p>
            </div>
            <form class="form" id="newsletter-form" novalidate>
              <div class="field"><label class="sr" for="nl-email">אימייל</label><input id="nl-email" type="text" inputmode="email" autocapitalize="off" spellcheck="false" data-email dir="ltr" pattern="[^ @]+@[^ @]+[.][^ @]{2,}" name="email" placeholder="אימייל" required autocomplete="email"></div>
              <div class="field"><label class="sr" for="nl-phone">טלפון</label><input id="nl-phone" type="tel" name="phone" placeholder="טלפון (לא חובה)" autocomplete="tel"></div>
              <div class="field"><label class="sr" for="nl-name">שם פרטי</label><input id="nl-name" type="text" name="name" placeholder="שם פרטי (לא חובה)" autocomplete="given-name"></div>
              <label class="check"><input type="checkbox" name="consent" required> מאשר/ת להתעדכן לפי <a href="${BASE}${site.legal.terms}#privacy">מדיניות הפרטיות</a></label>
              <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
              <div class="form-msg" aria-live="polite"></div>
              <button class="btn btn-teal" type="submit">להצטרפות</button>
            </form>
          </div>
          <div class="footer-bar">
            <div>
              <nav class="footer-nav" aria-label="תפריט תחתון">${navHTML}</nav>
              <div class="footer-meta" style="margin-top:14px">
                <a class="terms" href="${BASE}${site.legal.terms}">תקנון האתר</a>
                <div class="socials">${socialsHTML(["youtube", "spotify", "apple-music", "mail", "instagram", "whatsapp"])}</div>
              </div>
            </div>
            <button class="btn btn-ghost" id="open-contact" type="button">יצירת קשר</button>
          </div>
        </div>
        <div class="credits"><span class="copy">© ${new Date().getFullYear()} כל הזכויות שמורות ל${site.artist}</span><span class="sep" aria-hidden="true">·</span><span>${site.credits.label}</span><a href="#" role="button" aria-label="פנייה ל${site.credits.name}"><img src="assets/img/sogno-logo.svg?v=4" alt="" width="95" height="28"></a></div>
      </footer>`);
    document.body.appendChild(footer);
    /* the developer's name (user 17/11): a press opens a small form, and the form is mailed to him by the site's
       server. His address appears nowhere in the page */
    const dev = footer.querySelector(".credits a");
    if (dev) dev.addEventListener("click", (e) => { e.preventDefault(); openOverlay("dev-overlay"); });

    // popups
    document.body.appendChild(el(`
      <div class="overlay" id="menu-overlay" data-open="false">
        <div class="popup menu" role="dialog" aria-modal="true" aria-label="תפריט">
          <button class="icon-btn close" data-close aria-label="סגירה">${UI.x}</button>
          <nav>${navHTML}</nav>
          <div class="socials">${socialsHTML(["youtube", "spotify", "apple-music", "mail", "instagram", "whatsapp"])}</div>
        </div>
      </div>`));
    document.body.appendChild(el(`
      <div class="overlay" id="contact-overlay" data-open="false">
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="contact-title">
          <button class="icon-btn close" data-close aria-label="סגירה">${UI.x}</button>
          <h2 class="brush" id="contact-title">יצירת קשר</h2>
          <form class="form" id="contact-form" novalidate>
            <div class="grid grid-3" style="gap:10px">
              <div class="field"><label class="sr" for="c-name">שם</label><input id="c-name" name="name" placeholder="שם" required></div>
              <div class="field"><label class="sr" for="c-phone">טלפון</label><input id="c-phone" name="phone" type="tel" placeholder="טלפון" required></div>
              <div class="field"><label class="sr" for="c-email">אימייל</label><input id="c-email" name="email" type="text" inputmode="email" autocapitalize="off" spellcheck="false" data-email dir="ltr" pattern="[^ @]+@[^ @]+[.][^ @]{2,}" placeholder="אימייל" required></div>
            </div>
            <div class="field"><label class="sr" for="c-msg">הודעה</label><textarea id="c-msg" name="message" placeholder="הודעה" required></textarea></div>
            <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
            <div class="form-msg" aria-live="polite"></div>
            <button class="btn btn-teal" type="submit">שליחה</button>
          </form>
        </div>
      </div>`));
    document.body.appendChild(el(`
      <div class="overlay" id="dev-overlay" data-open="false">
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="dev-title">
          <button class="icon-btn close" data-close aria-label="סגירה">${UI.x}</button>
          <h2 id="dev-title"><img src="assets/img/sogno-logo.svg?v=4" alt="sogno. It works" width="140" height="41"></h2>
          <p class="dev-lead">מעוניינים גם באתר? פנו אלינו</p>
          <form class="form" id="dev-form" novalidate>
            <div class="grid grid-3" style="gap:10px">
              <div class="field"><label class="sr" for="d-name">שם</label><input id="d-name" name="name" placeholder="שם" required></div>
              <div class="field"><label class="sr" for="d-phone">טלפון</label><input id="d-phone" name="phone" type="tel" placeholder="טלפון" required></div>
              <div class="field"><label class="sr" for="d-email">אימייל</label><input id="d-email" name="email" type="text" inputmode="email" autocapitalize="off" spellcheck="false" data-email dir="ltr" pattern="[^ @]+@[^ @]+[.][^ @]{2,}" placeholder="אימייל" required></div>
            </div>
            <div class="field"><label class="sr" for="d-msg">הודעה</label><textarea id="d-msg" name="message" placeholder="הודעה" required></textarea></div>
            <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
            <div class="form-msg" aria-live="polite"></div>
            <button class="btn btn-teal" type="submit">שליחה</button>
          </form>
        </div>
      </div>`));
    document.body.appendChild(el(`
      <div class="overlay" id="success-overlay" data-open="false">
        <div class="popup success" role="dialog" aria-modal="true">
          <button class="icon-btn close" data-close aria-label="סגירה">${UI.x}</button>
          ${UI.check}
          <h2 class="brush" id="success-title">נרשמת בהצלחה</h2>
          <p id="success-text">עדכונים טובים בדרך.</p>
        </div>
      </div>`));
    document.body.appendChild(el(`<div class="overlay" id="cart-overlay" data-open="false" style="place-items:stretch"></div>`));
    document.body.appendChild(el(`
      <aside class="drawer" id="cart-drawer" data-open="false" aria-label="סל קניות">
        <header><h3>סל קניות</h3><button class="icon-btn" data-close-cart aria-label="סגירה">${UI.x}</button></header>
        <div class="items" id="cart-items"></div>
        <footer>
          <div class="total"><span>סכום ביניים</span><span id="cart-total">0 ₪</span></div>
          <a class="btn btn-line" href="${BASE}shop.html">מעבר לחנות</a>
          <a class="btn btn-red" href="${BASE}cart.html#checkout" data-cart-disabled>תשלום</a>
        </footer>
      </aside>`));
    document.body.appendChild(el(`
      <div class="lightbox" id="lightbox" data-open="false">
        <button class="icon-btn close" data-close-lb aria-label="סגירה">${UI.x}</button>
        <div class="frame" id="lightbox-frame"></div>
      </div>`));

    // wiring
    const openOverlay = (id) => { $(`#${id}`).dataset.open = "true"; document.body.style.overflow = "hidden"; if (id === "menu-overlay") { document.documentElement.classList.add("menu-open"); $("#open-menu").setAttribute("aria-expanded", "true"); } };
    const closeAll = () => { document.documentElement.classList.remove("menu-open"); const mbtn = $("#open-menu"); if (mbtn) mbtn.setAttribute("aria-expanded", "false"); $$(".overlay,.lightbox").forEach(o => o.dataset.open = "false"); Cart.close(); $("#lightbox-frame").innerHTML = ""; document.body.style.overflow = ""; };
    window.openOverlay = openOverlay; window.closeAll = closeAll;
    /* phones (user 17/11): while a window is open the page behind it must not move. A drag scrolls only a list inside
       the window that really has more to show; anywhere else, and past the list's own ends, it does nothing */
    let touchY = 0;
    document.addEventListener("touchstart", (e) => { touchY = e.touches[0].clientY; }, { passive: true });
    document.addEventListener("touchmove", (e) => {
      if (document.body.style.overflow !== "hidden" || e.touches.length > 1 || e.target.type === "range") return;
      const dy = e.touches[0].clientY - touchY;
      for (let n = e.target; n && n.nodeType === 1 && n !== document.body; n = n.parentElement) {
        if (n.scrollHeight > n.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(n).overflowY)) {
          if ((dy > 0 && n.scrollTop <= 0) || (dy < 0 && n.scrollTop + n.clientHeight >= n.scrollHeight - 1)) break;
          return;
        }
      }
      if (e.cancelable) e.preventDefault();
    }, { passive: false });
    /* the menu icon itself turns into an X and closes the menu again (user 09/11) */
    $("#open-menu").onclick = () => document.documentElement.classList.contains("menu-open") ? closeAll() : openOverlay("menu-overlay");
    $("#open-cart").onclick = () => { Cart.open(); document.body.style.overflow = "hidden"; };
    /* search: its code is fetched the first time the button is pressed, so pages stay light (user 16/11) */
    $("#open-search").onclick = (e) => {
      const b = e.currentTarget;
      if (window.dkSearch) return window.dkSearch(b);
      if (b.dataset.loading) return;
      b.dataset.loading = "1"; b.setAttribute("aria-busy", "true");
      const s = document.createElement("script");
      s.src = `${BASE}assets/js/search.js?v=1124b`;
      s.onload = () => { delete b.dataset.loading; b.removeAttribute("aria-busy"); window.dkSearch(b); };
      s.onerror = () => { delete b.dataset.loading; b.removeAttribute("aria-busy"); s.remove(); };
      document.head.appendChild(s);
    };
    if ($("#open-contact")) $("#open-contact").onclick = () => openOverlay("contact-overlay");
    $$("[data-open-contact]").forEach(b => b.onclick = () => openOverlay("contact-overlay"));
    /* "יצירת קשר" in the menu and in the footer opens the contact form on the page the visitor is on (user 18/11) */
    $$('a[href$="#contact"]').forEach(a => a.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); closeAll(); openOverlay("contact-overlay"); const f = $("#c-name"); if (f) setTimeout(() => f.focus(), 60); }));
    $$("[data-close],[data-close-cart],[data-close-lb]").forEach(b => b.onclick = closeAll);
    $$(".overlay,.lightbox").forEach(o => o.addEventListener("click", e => { if (e.target === o) closeAll(); }));
    addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });
    $("#menu-overlay nav").addEventListener("click", closeAll);

    /* newsletter: sends the signup to the mailing list (Smoove) through the site's server (user 09/11) */
    const nlf = $("#newsletter-form");
    nlf.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = nlf.querySelector(".form-msg"), btn = nlf.querySelector("button[type=submit]");
      if (!nlf.checkValidity()) { msg.textContent = "נא למלא את שדות החובה ולאשר את התנאים."; nlf.reportValidity(); return; }
      const d = Object.fromEntries(new FormData(nlf));
      btn.disabled = true; btn.setAttribute("aria-busy", "true"); msg.textContent = "";
      const ok = await window.dkSubscribe({ email: d.email, name: d.name, phone: d.phone, website: d.website, source: "אתר" });
      btn.disabled = false; btn.removeAttribute("aria-busy");
      if (!ok) { msg.textContent = "ההרשמה לא הצליחה, נסו שוב בעוד רגע."; return; }
      nlf.reset();
      closeAll(); $("#success-title").classList.remove("plain"); $("#success-title").textContent = "נרשמת בהצלחה"; $("#success-text").textContent = "עדכונים טובים בדרך."; openOverlay("success-overlay");
    });
    /* contact: saved for the admin, who also gets a mail alert (user 09/11) */
    /* the developer's small form goes the same way, marked so the server mails it to him and not to the site's owner */
    [[$("#contact-form"), null, "נא למלא את שדות החובה."], [$("#dev-form"), "dev", "נא למלא את שדות החובה."]].forEach(([cf, to, need]) => cf.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = cf.querySelector(".form-msg"), btn = cf.querySelector("button[type=submit]");
      if (!cf.checkValidity()) { msg.textContent = need; cf.reportValidity(); return; }
      const d = Object.fromEntries(new FormData(cf));
      if (to) d.to = to;
      btn.disabled = true; btn.setAttribute("aria-busy", "true"); msg.textContent = "";
      let ok = false;
      try { const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }); ok = r.ok && (await r.json()).ok === true; } catch {}
      btn.disabled = false; btn.removeAttribute("aria-busy");
      if (!ok) { msg.textContent = "ההודעה לא נשלחה, נסו שוב בעוד רגע."; return; }
      cf.reset();
      closeAll(); $("#success-title").classList.toggle("plain", to === "dev"); $("#success-title").textContent = "ההודעה נשלחה"; $("#success-text").textContent = "נחזור אליך בהקדם."; openOverlay("success-overlay");
    }));

    // a slow catalog never holds the page: after 3s the page goes on with the cart as saved
    try { await Promise.race([Cart.sync(), new Promise(r => setTimeout(r, 3000))]); } catch {}
    Cart.render();
    window.loadJSON("products").then(launchPopup).catch(() => {});
    /* the page's own scripts (music, albums, product…) come after this one and wait for this signal: it is sent only
       once they have all loaded, now that the top bar itself is built earlier (23/11) */
    const ready = () => document.dispatchEvent(new CustomEvent("chrome:ready", { detail: site }));
    if (document.readyState === "loading") await new Promise((r) => document.addEventListener("DOMContentLoaded", r, { once: true }));
    ready();
  }

  // ---------------- launch popup ----------------
  /* A window in the middle of the screen with the album cover and the launch price, once per visit. Shown only while
     the shop is open, the album is in pre-order with a launch discount, and the switch in the admin settings is on.
     Never on the cart, the thanks page or the album's own page, and never over something the visitor opened. */
  function launchPopup(products) {
    const site = window.SITE, promo = site.launchDiscount || {}, page = location.pathname.split("/").pop() || "index.html";
    const album = (products.items || []).find(x => x.id === site.album?.id);
    let seen = false; try { seen = sessionStorage.getItem("dk_promo_seen") === "1"; } catch {}
    if (!promo.banner || window.FLAGS.showPrices === false || !album || !saleNote(album)) return;
    if (["cart.html", "thanks.html"].includes(page) || (page === "product.html" && (new URLSearchParams(location.search).get("id") || album.id) === album.id)) return;
    /* once the window was closed, a small label stays in the corner on every page and leads to the album (user 20/11).
       In test mode it sits above the test badge, which holds the same corner */
    const chip = () => {
      if ($(".promo-chip")) return;
      /* a button (user 20/11): one press puts the album in the cart and opens the cart page. On a phone it is short,
         so it does not cover the bottom of the page. An album sold in several versions goes to its page to choose */
      const direct = !(album.options || []).length;
      const c = el(`<a class="promo-chip${$(".test-badge") ? " above" : ""}" href="${BASE}${direct ? "cart.html" : `product.html?id=${album.id}`}" aria-label="${launchPct()}% הנחה בהזמנה מוקדמת, לסל הקניות">${ICON("cart")}<b>${launchPct()}%</b><span> בהזמנה מוקדמת</span></a>`);
      if (direct) c.addEventListener("click", () => Cart.add({ id: album.id, title: album.title, image: album.image, price: priceOf(album), list: Number(album.price), ...(album.preorder === true ? { preorder: true } : {}) }, { quiet: true }));
      document.body.appendChild(c);
    };
    if (seen) { chip(); return; }
    const trailer = site.album.trailer || "";
    const pop = el(`<div class="overlay promo-overlay" id="promo-overlay" data-open="false">
      <div class="popup promo" role="dialog" aria-modal="true" aria-labelledby="promo-title">
        <button class="icon-btn close" type="button" aria-label="סגירה">${UI.x}</button>
        <div class="promo-art"><span class="vinyl"></span><img src="${BASE}${site.album.cover600 || site.album.cover}" alt="עטיפת האלבום ${site.album.title}"><span class="badge"><b>${launchPct()}%</b>הנחה</span></div>
        <div class="promo-copy">
          <div class="eyebrow">האלבום החדש בהזמנה מוקדמת</div>
          <h2 class="brush" id="promo-title">${site.album.title}</h2>
          <p>מזמינים עכשיו ב-${launchPct()}% הנחה</p>
          <div class="price">${priceHTML(album)}</div>
          <div class="promo-actions">
            <a class="btn btn-red btn-lg" href="${BASE}product.html?id=${album.id}">להזמנה מוקדמת</a>
            ${trailer ? `<button class="btn btn-trailer" type="button" id="promo-trailer"><span class="t">צפייה בתקציר</span><span class="ic">${UI.playSoft}</span></button>` : ""}
          </div>
        </div>
      </div></div>`);
    document.body.append(pop);
    const close = () => { pop.dataset.open = "false"; document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); chip(); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    pop.querySelector(".close").onclick = close;
    pop.addEventListener("click", (e) => { if (e.target === pop) close(); });
    if (trailer) pop.querySelector("#promo-trailer").onclick = () => { close(); window.playVideo(trailer); };
    setTimeout(() => {
      if (document.querySelector('.overlay[data-open="true"],.lightbox[data-open="true"],.drawer[data-open="true"]')) return;
      pop.dataset.open = "true"; document.body.style.overflow = "hidden"; document.addEventListener("keydown", onKey);
      pop.querySelector(".close").focus({ preventScroll: true });
      try { sessionStorage.setItem("dk_promo_seen", "1"); } catch {}
    }, page === "index.html" ? 3500 : 1500);
  }

  // ---------------- lightbox ----------------
  window.playVideo = (youtubeId) => {
    if (!youtubeId) return;
    /* 23/11: on pages that have the fixed player (assets/js/player.js) songs play there and keep playing while the
       visitor scrolls; this window remains only for pages without it */
    if (window.DK_PLAYER) { window.DK_PLAYER.play(youtubeId); return; }
    $("#lightbox-frame").innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1" title="נגן וידאו" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    $("#lightbox").dataset.open = "true"; document.body.style.overflow = "hidden";
  };
  /* album covers in lists (user 19/11): phones get the small copy kept beside each cover, wide sharp screens the full
     one. A cover that has no small copy (one uploaded in the admin) is shown as it is, and so is a cover in a wide
     frame (the highlighted album). */
  window.coverSet = (src, wide) => {
    if (wide) return "";
    const m = /^assets\/img\/(?:albums\/([\w-]+)|(album-cover))\.webp$/.exec(src || "");
    return m ? ` srcset="assets/img/albums/s/${m[1] || m[2]}.webp 360w, ${src} 700w" sizes="(max-width:600px) 120px, (max-width:980px) 45vw, 280px"` : "";
  };
  window.ytThumb = (id, fallback) => id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : fallback;

  // ---------------- reveal on scroll ----------------
  const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px 120px 0px" });
  window.revealAll = () => {
    $$(".reveal:not(.in)").forEach(n => io.observe(n));
    // safety net: nothing stays hidden if the observer never fires (print, old browsers, automated capture)
    setTimeout(() => $$(".reveal:not(.in)").forEach(n => { const r = n.getBoundingClientRect(); if (r.top < innerHeight * 1.2) n.classList.add("in"); }), 1200);
  };

  /* 23/11: the top bar and the footer are built right away, before the page is first drawn, instead of after the
     whole page has loaded. This script sits after the page's content, so everything it needs is already there, and the
     site's data is usually kept in the browser from the page before. Until now every new page showed for a moment
     without its top bar, and the smooth page change (style.css) started from a page with no bar */
  /* phones (23/11): the floating buttons (accessibility, 10%) step aside while the visitor scrolls down to read, and
     come back on a small scroll up, at the top and at the bottom of the page (style.css, "כפתורים צפים בטלפון").
     Only the scroll position is read here — the page height is kept from the last resize — so the smooth scrolling
     never has to lay the page out again for it */
  (() => {
    const mq = matchMedia("(max-width:759px)"), root = document.documentElement;
    let lastY = window.scrollY, hidden = false, raf = 0, maxY = Infinity;
    const keepMax = () => { maxY = root.scrollHeight - innerHeight; };
    if (window.ResizeObserver) new ResizeObserver(keepMax).observe(document.body); addEventListener("resize", keepMax); addEventListener("load", keepMax);
    const set = (h) => { if (h !== hidden) { hidden = h; root.classList.toggle("fab-hide", h); } };
    const check = () => {
      raf = 0;
      const y = window.scrollY, d = y - lastY;
      if (!mq.matches || y < 80 || y > maxY - 60) { set(false); lastY = y; return; }
      if (d > 8) { set(true); lastY = y; }
      else if (d < -8) { set(false); lastY = y; }
    };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(check); }, { passive: true });
  })();

  let mounted = false;
  const mount = () => { if (mounted) return; mounted = true; mountChrome().then(() => window.revealAll()); };
  if (document.querySelector("main, #intro")) mount();
  document.addEventListener("DOMContentLoaded", mount);
})();
