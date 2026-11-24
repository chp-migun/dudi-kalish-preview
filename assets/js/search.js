/* Site search (user 16/11): one window that looks through everything on the site: songs and clips, albums and the
   songs inside them, singles, what is on sale, and the pages themselves.
   "Smart" here means forgiving, the way people actually type Hebrew and Yiddish names:
     - final letters, quotes, geresh and niqqud never matter;
     - full / missing spelling (with or without ו and י) finds the same thing;
     - one wrong, missing or extra letter in a longer word still matches;
     - every word typed has to be found, in any order; a match in the title outranks a match in the small line.
   Loaded by app.js the first time the search button is pressed. Nothing is sent anywhere: it all runs in the browser. */
(() => {
  const FINALS = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };
  const norm = (s) => String(s ?? "").toLowerCase()
    .replace(/[֑-ׇ]/g, "")                 // niqqud and cantillation
    .replace(/['"`׳״‘’“”]/g, "")   // quotes, geresh, gershayim
    .replace(/[ךםןףץ]/g, (c) => FINALS[c])
    .replace(/װ/g, "וו").replace(/ױ/g, "וי").replace(/ײ/g, "יי")   // Yiddish double letters typed as one sign
    .replace(/[^0-9a-zא-ת]+/g, " ").trim();
  // the word without ו / י, so "אדון" and "אדן", "שוין" and "שין" meet
  const bare = (w) => (w.length > 2 ? w.replace(/[וי]/g, "") || w : w);
  // is b within one edit (one wrong, extra or missing letter) of a?
  const near = (a, b) => {
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0, j = 0, miss = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++miss > 1) return false;
      if (a.length > b.length) i++; else if (a.length < b.length) j++; else { i++; j++; }
    }
    return miss + (a.length - i) + (b.length - j) <= 1;
  };

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ytId = (u) => { const m = /(?:v=|youtu\.be\/|embed\/)([\w-]{11})/.exec(String(u || "")); return m ? m[1] : (/^[\w-]{11}$/.test(String(u || "")) ? u : ""); };
  const ICONS = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    play: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"><path d="M8.6 6.1v11.8c0 .9 1 1.4 1.7.9L19 12.9c.6-.4.6-1.3 0-1.8l-8.7-5.9c-.7-.5-1.7 0-1.7.9z"/></svg>',
    disc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="7.5" width="17" height="14" rx="3"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/></svg>',
    page: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  };

  // ---------- what can be found ----------
  let index = null;
  async function build() {
    const [songs, albums, products] = await Promise.all(["songs", "albums", "products"].map((n) => window.loadJSON(n).catch(() => ({}))));
    const site = window.SITE || {}, out = [], seen = new Set();
    const add = (e) => {
      if (!e.title) return;
      if (e.yt) { if (seen.has(e.yt)) return; seen.add(e.yt); }
      const nt = norm(e.title), ns = norm(e.sub);
      out.push({ ...e, nt, ns, words: nt.split(" ").filter(Boolean), bares: nt.split(" ").filter(Boolean).map(bare), bs: ns.split(" ").map(bare).join(" ") });
    };
    const thumb = (id) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

    // on sale (hidden products never reach the browser)
    (products.items || []).filter((p) => !p.hidden).forEach((p) => add({ kind: "bag", weight: 8, title: String(p.title).replace(/\s*:\s*/, ": "), img: p.image, href: `product.html?id=${encodeURIComponent(p.id)}` }));
    // the new album's own songs lead to the album
    const al = site.album;
    if (al?.tracks && al.id) al.tracks.forEach((t) => add({ kind: "disc", weight: 3, title: t, sub: al.title, img: al.cover600 || al.cover, href: `product.html?id=${encodeURIComponent(al.id)}` }));
    // songs and clips
    (songs.items || []).forEach((s) => { const id = ytId(s.youtube); add({ kind: "play", weight: 5, title: s.title, sub: s.with, year: s.year, yt: id, img: id ? thumb(id) : s.cover, href: id ? "" : "music.html" }); });
    // singles
    (albums.singles || []).forEach((s) => { const id = ytId(s.links?.youtube); add({ kind: "play", weight: 4, title: s.title, sub: s.with, year: s.year, yt: id, img: s.cover, href: id ? "" : "singles.html" }); });
    // albums, then the songs inside them
    (albums.items || []).forEach((a) => add({ kind: "disc", weight: 6, title: a.title, sub: [a.role, a.with].filter(Boolean).join(" · "), year: a.year, img: a.cover, href: `albums.html#a-${encodeURIComponent(a.id)}` }));
    (albums.items || []).forEach((a) => (a.videos || []).forEach((v) => { const id = ytId(v.youtube); if (id) add({ kind: "play", weight: 2, title: v.title, sub: a.title, year: a.year, yt: id, img: a.cover || thumb(id) }); }));
    // the pages themselves
    const F = window.FLAGS || {};
    (site.nav || []).filter((n) => !n.requires || F[n.requires] !== false).forEach((n) => add({ kind: "page", weight: 1, title: n.label, href: n.href }));
    if (site.legal?.terms) add({ kind: "page", weight: 1, title: "תקנון האתר", href: site.legal.terms });
    return out;
  }

  // ---------- how well an entry answers what was typed ----------
  function score(e, q, tokens) {
    let total = 0;
    for (const tk of tokens) {
      const tb = bare(tk);
      let best = 0;
      for (let i = 0; i < e.words.length; i++) {
        const w = e.words[i], wb = e.bares[i];
        if (w === tk) best = Math.max(best, 60);
        else if (w.startsWith(tk)) best = Math.max(best, 46);
        else if (w.includes(tk) && tk.length > 1) best = Math.max(best, 30);
        else if (wb === tb && tb.length > 1) best = Math.max(best, 28);
        else if (wb.startsWith(tb) && tb.length > 1) best = Math.max(best, 22);
        else if (tk.length >= 4 && (near(w, tk) || (tb.length >= 4 && near(wb, tb)))) best = Math.max(best, 14);
        else if (tk.length >= 5 && w.length > tk.length && near(w.slice(0, tk.length), tk)) best = Math.max(best, 10);
      }
      if (!best && tk.length > 1) {
        if (e.ns.includes(tk)) best = 12;
        else if (tb.length > 1 && e.bs.includes(tb)) best = 8;
        else if (e.year && String(e.year) === tk) best = 6;
      }
      if (!best) return 0;          // every word typed must be found
      total += best;
    }
    if (e.nt === q) total += 50; else if (e.nt.startsWith(q)) total += 25;
    return total + (e.weight || 0);
  }
  function find(text) {
    const q = norm(text);
    if (!q) return [];
    const tokens = q.split(" ");
    const hits = index.map((e) => ({ e, s: score(e, q, tokens) })).filter((x) => x.s > 0);
    // loose guesses are shown only when nothing better was found
    const top = Math.max(0, ...hits.map((x) => x.s));
    return hits.filter((x) => x.s >= top * 0.45)
      .sort((a, b) => b.s - a.s || (b.e.year || 0) - (a.e.year || 0) || a.e.title.length - b.e.title.length)
      .slice(0, 12).map((x) => x.e);
  }

  // ---------- the window ----------
  document.head.insertAdjacentHTML("beforeend", `<style>
    #search-overlay{place-items:start center;padding-top:clamp(16px,9vh,96px)}
    .search-pop{width:min(620px,100%);margin-top:var(--vvt,0px);max-height:calc(var(--vvh,100svh) - clamp(32px,18vh,192px));display:flex;flex-direction:column;padding:18px}
    .search-pop .close{top:25px}   /* level with the middle of the search field */
    .search-pop .bar{display:flex;align-items:center;gap:10px;margin-inline-start:48px;padding:4px 14px;border:1px solid var(--line);border-radius:var(--pill);background:rgba(12,23,22,.5);transition:border-color .2s}
    .search-pop .bar:focus-within{border-color:var(--teal-light)}
    .search-pop .bar svg{width:22px;height:22px;flex:none;color:var(--teal-light)}
    .search-pop input{flex:1;min-width:0;height:48px;border:0;outline:0;background:none;color:var(--ink);font:inherit;font-size:19px;font-weight:400}
    .search-pop input::placeholder{color:var(--ink-dim)}
    .search-pop input::-webkit-search-cancel-button{display:none}
    .search-pop ul{list-style:none;margin:12px 0 0;padding:0;overflow:auto;display:grid;gap:2px;overscroll-behavior:contain}
    .search-pop ul:empty{display:none}
    .search-pop li button{width:100%;min-height:60px;display:flex;align-items:center;gap:14px;padding:8px 10px;border:0;border-radius:var(--radius-sm);background:none;color:var(--ink-soft);font:inherit;text-align:start;cursor:pointer;transition:background .15s,color .15s}
    .search-pop li button[aria-selected="true"],.search-pop li button:hover{background:rgba(172,196,195,.1);color:var(--ink)}
    .search-pop .pic{flex:none;width:46px;height:46px;border-radius:8px;overflow:hidden;background:var(--bg-3);display:grid;place-items:center;color:var(--teal-light)}
    .search-pop .pic img{width:100%;height:100%;object-fit:cover}
    .search-pop .pic svg{width:20px;height:20px}
    .search-pop .txt{flex:1;min-width:0;display:grid;line-height:1.35}
    .search-pop .txt b{font-weight:500;font-size:17px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .search-pop .txt span{font-size:14px;color:var(--ink-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .search-pop .kind{flex:none;width:18px;height:18px;color:var(--red)}
    .search-pop .none{margin:18px 0 6px;text-align:center;color:var(--ink-dim)}
    @media (max-width:560px){#search-overlay{padding:10px;padding-top:10px}.search-pop{max-height:calc(var(--vvh,100svh) - 20px);padding:12px}.search-pop .close{top:19px;inset-inline-start:10px}.search-pop input{font-size:17px}}
  </style>`);
  document.body.insertAdjacentHTML("beforeend", `
    <div class="overlay" id="search-overlay" data-open="false">
      <div class="popup search-pop" role="dialog" aria-modal="true" aria-label="חיפוש באתר">
        <button class="icon-btn close" type="button" aria-label="סגירה">${window.UI.x}</button>
        <label class="bar">${ICONS.search}<input type="search" id="search-input" placeholder="חיפוש" aria-label="חיפוש באתר" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" role="combobox" aria-expanded="false" aria-controls="search-results"></label>
        <ul id="search-results" role="listbox" aria-label="תוצאות"></ul>
        <p class="none" id="search-none" role="status" hidden>לא נמצאו תוצאות</p>
      </div>
    </div>`);
  const ov = document.getElementById("search-overlay"), input = document.getElementById("search-input"),
    list = document.getElementById("search-results"), none = document.getElementById("search-none");
  let shown = [], active = -1, opener = null;

  const mark = () => {
    [...list.querySelectorAll("button")].forEach((b, i) => { b.setAttribute("aria-selected", i === active); });
    /* the chosen line is brought into view inside the list only: the page itself is never moved */
    const b = list.querySelector('button[aria-selected="true"]');
    if (b) { const lr = list.getBoundingClientRect(), br = b.getBoundingClientRect(); if (br.top < lr.top) list.scrollTop -= lr.top - br.top; else if (br.bottom > lr.bottom) list.scrollTop += br.bottom - lr.bottom; }
    input.setAttribute("aria-activedescendant", active >= 0 ? `sr-${active}` : "");
  };
  const draw = () => {
    const text = input.value;
    shown = index && text.trim() ? find(text) : [];
    active = shown.length ? 0 : -1;
    list.innerHTML = shown.map((e, i) => `<li role="presentation"><button type="button" role="option" tabindex="-1" id="sr-${i}" data-i="${i}">
        <span class="pic">${e.img ? `<img src="${esc(e.img)}" alt="" loading="lazy">` : ICONS[e.kind]}</span>
        <span class="txt"><b>${esc(e.title)}</b>${e.sub ? `<span>${esc(e.sub)}</span>` : ""}</span>
        <span class="kind">${ICONS[e.kind]}</span>
      </button></li>`).join("");
    none.hidden = !(index && text.trim() && !shown.length);
    input.setAttribute("aria-expanded", shown.length > 0);
    mark();
  };
  const go = (e) => {
    if (!e) return;
    opener = null;
    if (e.yt) { window.closeAll(); window.playVideo(e.yt); return; }
    const u = new URL(e.href, location.href);
    window.closeAll();
    if (u.pathname === location.pathname && u.search === location.search && u.hash) {
      let t = null; try { t = document.getElementById(decodeURIComponent(u.hash.slice(1))); } catch {}
      history.pushState(null, "", u.hash);
      if (t) { if (window.lenis) window.lenis.scrollTo(t, { offset: -90 }); else t.scrollIntoView({ behavior: "smooth", block: "start" }); window.dispatchEvent(new Event("hashchange")); return; }
    }
    location.href = e.href;
  };

  input.addEventListener("input", draw);
  input.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") { ev.preventDefault(); if (shown.length) { active = (active + (ev.key === "ArrowDown" ? 1 : -1) + shown.length) % shown.length; mark(); } }
    else if (ev.key === "Enter") { ev.preventDefault(); go(shown[active]); }
  });
  list.addEventListener("click", (ev) => { const b = ev.target.closest("button[data-i]"); if (b) go(shown[+b.dataset.i]); });
  ov.querySelector(".close").onclick = () => window.closeAll();
  ov.addEventListener("click", (ev) => { if (ev.target === ov) window.closeAll(); });
  // when the window closes, the keyboard goes back to the search button
  new MutationObserver(() => { if (ov.dataset.open === "false" && opener) { const o = opener; opener = null; if (document.getElementById("lightbox")?.dataset.open !== "true") o.focus(); } })
    .observe(ov, { attributes: true, attributeFilter: ["data-open"] });

  /* phones (user 17/11): the window stays in the part of the screen the keyboard leaves free, so it stands still
     and only the results move inside it */
  const vv = window.visualViewport;
  const fit = () => {
    if (!vv || ov.dataset.open !== "true") return;
    /* the dark layer itself keeps the whole screen (a see-through keyboard would show the bare page under a
       shorter one, user 22/11); only the window is placed and sized by the free part */
    ov.style.setProperty("--vvt", vv.offsetTop + "px");
    ov.style.setProperty("--vvh", vv.height + "px");
  };
  if (vv) { vv.addEventListener("resize", fit); vv.addEventListener("scroll", fit); }

  window.dkSearch = async (from) => {
    opener = from || null;
    window.closeAll();
    opener = from || null;
    window.openOverlay("search-overlay"); fit();
    input.value = ""; draw();
    setTimeout(() => input.focus(), 60);
    // a list that failed to load is not kept: the next time the window opens it is fetched again
    if (!index) { try { const built = await build(); index = built.length > 12 ? built : null; } catch { index = null; } draw(); }
  };
})();
