/* Accessibility button (user 18/11): a small button on the side of every page opens a panel where the visitor can
   enlarge the text, raise the contrast, underline links, switch to a plain font and stop motion. The choices are kept
   in this browser. The file also adds the "skip to content" link. It loads first on every page, so the choices
   apply before anything is drawn. */
(() => {
  const KEY = "dk-a11y";
  let st = {};
  try { st = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch {} };
  const root = document.documentElement;
  const apply = () => {
    root.classList.toggle("a11y-contrast", !!st.contrast);
    root.classList.toggle("a11y-links", !!st.links);
    root.classList.toggle("a11y-font", !!st.font);
    root.classList.toggle("a11y-still", !!st.still);
    if (document.body) document.body.style.zoom = st.text ? String(1 + st.text * 0.1) : "";
  };
  /* "stop motion": the site's own scripts ask the browser whether the visitor prefers less motion. With this choice
     on, they get "yes", exactly as if it had been set in the device's settings */
  if (st.still && window.matchMedia) {
    const mm = window.matchMedia.bind(window);
    window.matchMedia = (q) => {
      const r = mm(q);
      if (!/prefers-reduced-motion\s*:\s*reduce/.test(q)) return r;
      return { matches: true, media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } };
    };
  }
  apply();

  const css = `
  .a11y-skip{position:fixed;z-index:200;top:8px;inset-inline-start:8px;padding:12px 20px;border-radius:999px;background:#fff;color:#0C1716;font-weight:600;transform:translateY(-200%)}
  .a11y-skip:focus{transform:none;outline:3px solid #A83020;outline-offset:2px}
  .a11y-btn{position:fixed;z-index:85;inset-inline-end:0;top:50%;transform:translateY(-50%);width:44px;height:48px;display:grid;place-items:center;padding:0;border:0;cursor:pointer;
    border-radius:0 12px 12px 0;background:#1C3634;color:#fff;box-shadow:0 6px 20px rgba(0,0,0,.45)}
  .a11y-btn svg{width:26px;height:26px}
  .a11y-btn:focus-visible,.a11y-panel button:focus-visible,.a11y-panel a:focus-visible{outline:3px solid #fff;outline-offset:2px}
  .a11y-panel{position:fixed;z-index:120;inset-inline-end:12px;top:50%;transform:translateY(-50%);width:min(300px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;
    padding:18px;border-radius:16px;background:#12211F;color:#fff;border:1px solid rgba(255,255,255,.35);box-shadow:0 30px 70px rgba(0,0,0,.6);font-family:Arial,sans-serif;font-size:16px;line-height:1.4;direction:rtl}
  .a11y-panel[hidden]{display:none}
  .a11y-panel h2{font:700 20px Arial,sans-serif;color:#fff;margin:0 0 14px;padding-inline-end:44px}
  .a11y-panel .a11y-x{position:absolute;top:10px;inset-inline-end:10px;width:44px;height:44px;display:grid;place-items:center;border-radius:50%;color:#fff}
  .a11y-panel .a11y-x svg{width:22px;height:22px}
  .a11y-panel .a11y-opt{display:flex;align-items:center;gap:12px;width:100%;min-height:48px;padding:8px 14px;margin-bottom:8px;border-radius:12px;border:1px solid rgba(255,255,255,.4);
    background:transparent;color:#fff;font:400 16px Arial,sans-serif;text-align:start;cursor:pointer}
  .a11y-panel .a11y-opt svg{width:22px;height:22px;flex:none}
  .a11y-panel .a11y-opt[aria-pressed="true"]{background:#fff;color:#0C1716;border-color:#fff;font-weight:700}
  .a11y-panel .a11y-row{display:flex;gap:8px;margin-bottom:8px}
  .a11y-panel .a11y-row .a11y-opt{margin:0;justify-content:center}
  .a11y-panel a{display:block;margin-top:12px;color:#fff;text-decoration:underline;text-align:center;min-height:44px;line-height:44px}
  html.a11y-contrast{--ink:#fff;--ink-soft:#fff;--ink-dim:#E8F0EF;--teal:#C9E0DF;--teal-light:#E3F1F0;--red:#FFA08F;--line:rgba(255,255,255,.7);--card:rgba(255,255,255,.08);--card-strong:rgba(255,255,255,.14)}
  html.a11y-contrast body{background:#000!important;background-image:none!important}
  html.a11y-contrast .btn-red{background:#8E2618!important;color:#fff!important;border:2px solid #fff!important}
  html.a11y-contrast ::placeholder{color:#D5E2E1!important;opacity:1}
  html.a11y-contrast :focus-visible{outline:3px solid #FFE14D!important;outline-offset:3px}
  html.a11y-links a:not(.btn):not(.logo):not(.a11y-skip){text-decoration:underline!important;text-underline-offset:3px}
  html.a11y-font body,html.a11y-font body *:not(svg):not(svg *){font-family:Arial,"Segoe UI",sans-serif!important;letter-spacing:0!important}
  html.a11y-still *,html.a11y-still *::before,html.a11y-still *::after{animation-duration:.001s!important;animation-iteration-count:1!important;transition-duration:.001s!important;scroll-behavior:auto!important}
  @media print{.a11y-btn,.a11y-panel,.a11y-skip{display:none}}`;

  const I = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICON = {
    person: I('<circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5c4.5 1.4 9.5 1.4 14 0"/><path d="M12 9.5V14"/><path d="m8.5 21 3.5-7 3.5 7"/>'),
    x: I('<path d="M6 6l12 12M18 6 6 18"/>'),
    plus: I('<path d="M4 18 9 6l5 12M5.8 14h6.4"/><path d="M19 8v6M16 11h6"/>'),
    minus: I('<path d="M4 18 9 6l5 12M5.8 14h6.4"/><path d="M16 11h6"/>'),
    contrast: I('<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M12 7h6.7M12 12h9M12 17h6.7"/>'),
    link: I('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    font: I('<path d="M5 20 12 4l7 16M7.6 14h8.8"/>'),
    pause: I('<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>'),
    reset: I('<path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v5h5"/>'),
  };

  const build = () => {
    apply();
    document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);
    // skip link: the first stop for a keyboard, straight to the page's content
    const target = document.querySelector("main") || document.querySelector("section") || document.body;
    if (!target.id) target.id = "main-content";
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    const skip = document.createElement("a");
    skip.className = "a11y-skip"; skip.href = "#" + target.id; skip.textContent = "דילוג לתוכן";
    skip.addEventListener("click", (e) => { e.preventDefault(); target.focus({ preventScroll: true }); target.scrollIntoView(); });
    document.body.prepend(skip);

    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "a11y-btn"; btn.setAttribute("aria-label", "אפשרויות נגישות"); btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "a11y-panel");
    btn.innerHTML = ICON.person;
    const panel = document.createElement("div");
    panel.className = "a11y-panel"; panel.id = "a11y-panel"; panel.hidden = true;
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "true"); panel.setAttribute("aria-labelledby", "a11y-title");
    panel.innerHTML = `
      <button type="button" class="a11y-x" aria-label="סגירה">${ICON.x}</button>
      <h2 id="a11y-title">נגישות</h2>
      <div class="a11y-row">
        <button type="button" class="a11y-opt" data-text="1" aria-label="הגדלת הטקסט">${ICON.plus}</button>
        <button type="button" class="a11y-opt" data-text="-1" aria-label="הקטנת הטקסט">${ICON.minus}</button>
      </div>
      <button type="button" class="a11y-opt" data-k="contrast" aria-pressed="false">${ICON.contrast}<span>ניגודיות גבוהה</span></button>
      <button type="button" class="a11y-opt" data-k="links" aria-pressed="false">${ICON.link}<span>הדגשת קישורים</span></button>
      <button type="button" class="a11y-opt" data-k="font" aria-pressed="false">${ICON.font}<span>גופן קריא</span></button>
      <button type="button" class="a11y-opt" data-k="still" aria-pressed="false">${ICON.pause}<span>עצירת אנימציות</span></button>
      <button type="button" class="a11y-opt" data-reset>${ICON.reset}<span>איפוס</span></button>
      <a href="terms.html#accessibility">הצהרת נגישות</a>`;
    document.body.append(btn, panel);

    const paint = () => {
      panel.querySelectorAll("[data-k]").forEach(b => b.setAttribute("aria-pressed", st[b.dataset.k] ? "true" : "false"));
      panel.querySelector('[data-text="1"]').disabled = (st.text || 0) >= 3;
      panel.querySelector('[data-text="-1"]').disabled = (st.text || 0) <= 0;
    };
    const open = () => { paint(); panel.hidden = false; btn.setAttribute("aria-expanded", "true"); panel.querySelector(".a11y-x").focus(); };
    const close = (back = true) => { if (panel.hidden) return; panel.hidden = true; btn.setAttribute("aria-expanded", "false"); if (back) btn.focus(); };
    btn.addEventListener("click", () => (panel.hidden ? open() : close()));
    panel.querySelector(".a11y-x").addEventListener("click", () => close());
    document.addEventListener("keydown", (e) => {
      if (panel.hidden) return;
      if (e.key === "Escape") { e.stopPropagation(); close(); return; }
      if (e.key !== "Tab") return;
      // the keyboard stays inside the panel while it is open
      const f = [...panel.querySelectorAll("button:not(:disabled),a[href]")], first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }, true);
    document.addEventListener("pointerdown", (e) => { if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) close(false); });
    panel.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.text) st.text = Math.min(3, Math.max(0, (st.text || 0) + Number(b.dataset.text)));
      else if (b.dataset.k) {
        st[b.dataset.k] = !st[b.dataset.k];
        // motion is set up when a page loads, so this one takes effect by loading the page again
        if (b.dataset.k === "still") { save(); location.reload(); return; }
      }
      else if (b.hasAttribute("data-reset")) { const was = st.still; st = {}; save(); if (was) { location.reload(); return; } }
      else return;
      save(); apply(); paint();
      dispatchEvent(new Event("resize"));
    });
  };
  if (document.body) build(); else document.addEventListener("DOMContentLoaded", build);
})();
