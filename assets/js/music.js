// text that is edited in the admin is always printed as text, never as markup
var esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/* עמוד מוזיקה (מחדש 23/11, שדרוג "פי 10", אבן 5)
   1. סינון לפי סוג (מהנתונים, כמו קודם) + חיפוש לפי שם שיר או אמן.
   2. "השיר החדש" בגדול: התמונה הרחבה, השם בכתב המכחול וכפתור האזנה.
   3. "נבחרים": השירים המסומנים כנבחרים, בשורה שגוללים הצידה.
   4. כל השירים מחולקים לפי שנים, עם שם השיר על כל כרטיס (קודם השם הופיע רק בתוך תמונת יוטיוב).
   בסינון או בחיפוש מוצגות רק התוצאות. כל כרטיס מנגן בנגן הקבוע (assets/js/player.js) דרך playVideo. */
document.addEventListener("chrome:ready", async () => {
  const songs = await loadJSON("songs");
  const filters = $("#filters"), years = $("#music-years"), feature = $("#music-feature"), picks = $("#music-picks"), track = $("#picks-track");
  const q = $("#music-q"), result = $("#music-result"), empty = $("#music-empty");
  const params = new URLSearchParams(location.search);
  let current = params.get("cat") || "all", query = params.get("q") || "";
  if (!songs.categories.some(c => c.id === current)) current = "all";
  q.value = query;

  const names = (s) => ["דודי קאליש", ...String(s.with || "").split(" · ")].filter(Boolean);
  const card = (s, withYear) => `
      <article class="vcard reveal" data-yt="${esc(s.youtube)}" role="button" tabindex="0" aria-label="האזנה: ${esc(s.title)}">
        <div class="frame"><img src="${ytThumb(s.youtube, s.cover)}" alt="" loading="lazy" decoding="async"><div class="play">${UI.play}</div></div>
        <h3 class="vt">${esc(s.title)}</h3>
        <div class="meta"><span class="who"><span>${names(s).map(n => `<i>${esc(n)}</i>`).join("")}</span></span>${withYear ? `<b>${esc(s.year || "")}</b>` : ""}</div>
      </article>`;

  /* ---- the newest song, large ---- */
  const top = songs.items[0];
  if (top) {
    const hq = `https://i.ytimg.com/vi/${esc(top.youtube)}/hqdefault.jpg`;
    feature.innerHTML = `
      <div class="mf-media" data-yt="${esc(top.youtube)}" role="button" tabindex="0" aria-label="האזנה: ${esc(top.title)}">
        <img src="https://i.ytimg.com/vi/${esc(top.youtube)}/maxresdefault.jpg" alt="" fetchpriority="high" decoding="async"
          onload="if(this.naturalWidth<200){this.onload=null;this.src='${hq}'}" onerror="this.onerror=null;this.src='${hq}'">
        <span class="mf-play" aria-hidden="true">${UI.play}</span>
      </div>
      <div class="mf-text">
        <div class="mf-eyebrow">השיר החדש · ${esc(top.year || "")}</div>
        <h2 class="mf-title">${esc(top.title)}</h2>
        <p class="mf-with">${names(top).map(esc).join(" · ")}</p>
        <div class="mf-actions">
          <button type="button" class="btn btn-red btn-lg" data-play="${esc(top.youtube)}">${UI.play}<span>האזנה</span></button>
          <a class="btn btn-line btn-lg" href="https://www.youtube.com/watch?v=${esc(top.youtube)}" target="_blank" rel="noopener">ביוטיוב</a>
        </div>
      </div>`;
  }

  /* ---- picks: a row that scrolls sideways ---- */
  const featured = songs.items.filter(s => s.featured && s.youtube);
  track.innerHTML = featured.map(s => card(s, true)).join("");
  picks.hidden = !featured.length;
  /* one card per press, our own glide: the browser's smooth scrolling fought the cards' snapping (the first press barely
     moved, "back" did nothing), so snapping is let go for the glide and returns when it lands */
  let glide = 0;
  const step = (dir) => {
    const w = ((track.firstElementChild || {}).offsetWidth || 300) + 18, max = track.scrollWidth - track.clientWidth;
    const from = track.scrollLeft, rtl = getComputedStyle(track).direction === "rtl";
    const lo = rtl ? -max : 0, hi = rtl ? 0 : max;
    const to = Math.min(hi, Math.max(lo, from + dir * w));
    cancelAnimationFrame(glide);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { track.scrollLeft = to; return; }
    track.style.scrollSnapType = "none";
    const t0 = performance.now(), D = 460, ease = (t) => 1 - Math.pow(1 - t, 3);
    const f = (now) => { const k = Math.min(1, (now - t0) / D); track.scrollLeft = from + (to - from) * ease(k);
      if (k < 1) glide = requestAnimationFrame(f); else { track.style.scrollSnapType = ""; navState(); } };
    glide = requestAnimationFrame(f);
  };
  /* right-to-left: "next" moves the row toward the left */
  $("#picks-next").onclick = () => step(-1); $("#picks-prev").onclick = () => step(1);
  const navState = () => {
    const max = track.scrollWidth - track.clientWidth, x = Math.abs(track.scrollLeft);
    $("#picks-prev").disabled = x < 4; $("#picks-next").disabled = x > max - 4;
  };
  track.addEventListener("scroll", navState, { passive: true }); addEventListener("resize", navState); navState();

  /* ---- filters + search ---- */
  filters.innerHTML = songs.categories.map(c => `<button type="button" data-cat="${c.id}" aria-pressed="${c.id === current}">${c.label}</button>`).join("");
  const norm = (s) => String(s || "").toLowerCase().replace(/[֑-ׇ"'׳״.·,\-]/g, "").replace(/\s+/g, " ").trim();
  const keepURL = () => { const u = new URLSearchParams(); if (current !== "all") u.set("cat", current); if (query) u.set("q", query); history.replaceState(null, "", "music.html" + (u.toString() ? "?" + u : "")); };

  const render = () => {
    const nq = norm(query);
    const list = songs.items.filter(s => (current === "all" || (s.cats || []).includes(current)) && (!nq || norm(s.title + " " + s.with).includes(nq)));
    const browsing = current === "all" && !nq;   /* the full page: newest song and picks on top */
    feature.hidden = !browsing || !top; picks.hidden = !browsing || !featured.length;
    const groups = [];
    for (const s of list) { const g = groups[groups.length - 1]; if (g && g.year === s.year) g.items.push(s); else groups.push({ year: s.year, items: [s] }); }
    years.innerHTML = groups.map(g => `
      <section class="myear reveal" aria-label="${esc(g.year || "")}">
        <div class="myear-head"><h2 class="yr">${esc(g.year || "")}</h2><span class="n">${g.items.length === 1 ? "שיר אחד" : g.items.length + " שירים"}</span></div>
        <div class="grid grid-3">${g.items.map(s => card(s, false)).join("")}</div>
      </section>`).join("");
    result.hidden = browsing;
    result.textContent = list.length ? (list.length === 1 ? "נמצא שיר אחד" : `נמצאו ${list.length} שירים`) : "";
    empty.hidden = list.length > 0;
    empty.textContent = nq ? `לא נמצאו שירים עבור «${query}». נסו שם אחר, או חלק ממנו.` : "אין עדיין סרטונים בקטגוריה הזו.";
    revealAll();
  };
  filters.onclick = (e) => { const b = e.target.closest("button"); if (!b) return; current = b.dataset.cat; $$("button", filters).forEach(x => x.setAttribute("aria-pressed", x === b)); render(); keepURL(); };
  let t = 0;
  q.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { query = q.value.trim(); render(); keepURL(); }, 140); });
  q.addEventListener("keydown", (e) => { if (e.key === "Escape" && q.value) { e.preventDefault(); q.value = ""; query = ""; render(); keepURL(); } });

  /* ---- playing: any card, the large picture or the button ---- */
  const main = $("main");
  main.addEventListener("click", (e) => { const b = e.target.closest("[data-play]") || e.target.closest(".vcard[data-yt], .mf-media[data-yt]"); if (!b) return; playVideo(b.dataset.play || b.dataset.yt); });
  main.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".vcard[data-yt], .mf-media[data-yt]")) { e.preventDefault(); e.target.click(); } });
  render();
});
