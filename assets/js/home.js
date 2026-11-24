// text that is edited in the admin is always printed as text, never as markup
var esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/* דף הבית — ממלא את המדורים מתוך קבצי התוכן */
document.addEventListener("chrome:ready", async (e) => {
  if (!$("#album-tracks")) return;       // this file is also loaded on shop/product pages for productCard()
  const site = e.detail;
  const [songs, products, shows] = await Promise.all([loadJSON("songs"), loadJSON("products"), loadJSON("shows")]);

  // --- hero ---
  $("#rail-music").innerHTML = ["youtube", "spotify", "apple-music"].map(k => `<a href="${site.social[k]}" target="_blank" rel="noopener" aria-label="${k}">${ICON(k)}</a>`).join("");
  $("#rail-contact").innerHTML = ["mail", "instagram", "whatsapp"].filter(k => site.social[k]).map(k => `<a href="${site.social[k]}" target="_blank" rel="noopener" aria-label="${k}">${ICON(k)}</a>`).join("");
  const introAlbum = $("#intro-album span");
  if (introAlbum && FLAGS.showPrices !== false) introAlbum.textContent = "לרכישת האלבום";

  // --- album ---
  const album = products.items.find(p => p.id === site.album.id);
  $("#album-title").textContent = site.album.title;
  $("#album-tracks").innerHTML = site.album.tracks.map((t, i) => `<li><b>${String(i + 1).padStart(2, "0")}</b>${t}</li>`).join("");
  $("#album-view").innerHTML = UI.eye;
  if (FLAGS.showPrices === false) {
    $("#album-add").textContent = "לעמוד האלבום"; $("#album-add").onclick = () => location.href = "product.html?id=" + album.id;
    $("#album-view").hidden = true;
  } else {
    $("#album-add").insertAdjacentHTML("afterbegin", ICON("cart"));
    $("#album-add").onclick = () => {
      const opt = album.options?.[0];
      const pre = album.preorder === true ? { preorder: true } : {};
      if (!opt) { Cart.add({ id: album.id, title: album.title, image: album.image, price: priceOf(album), list: Number(album.price), ...pre }); return; }
      Cart.add({ id: album.id, title: album.title, image: album.image, price: priceOf(album, opt.price), list: Number(opt.price), option: opt.id, optionLabel: `${opt.label} · ${fmt(priceOf(album, opt.price))}`, ...pre });
    };
  }
  if (FLAGS.showShows === false) $("#shows").hidden = true;

  // --- listen: fan of covers (placeholders in the album's colours with the word "עטיפה" until the real covers arrive, user 08/11) ---
  const fanItems = songs.items.filter(s => s.featured && s.youtube).slice(0, 10);
  const fan = $("#fan");
  let active = 0;
  /* phones (user 19/11: the covers took seconds to show): only the front card asks for the large picture. The cards
     behind it start with a light one, and each gets its large picture when it is about to come to the front */
  /* 23/11: computers too — the ten large pictures came to about 1.9MB on the first visit, for cards that mostly sit
     dimmed behind the front one; each still gets its large picture as it comes forward */
  const LIGHT = true;
  const sharpen = (i) => {
    const im = fan.querySelector(`.card[data-i="${i}"] img[data-light]`);
    if (!im) return;
    im.removeAttribute("data-light");
    const big = new Image();
    big.onload = () => { if (big.naturalWidth < 200) return; im.onerror = im.onload = null; im.style.transform = ""; im.src = big.src; };
    big.src = `https://i.ytimg.com/vi/${fanItems[i].youtube}/maxresdefault.jpg`;
  };
  fan.innerHTML = fanItems.map((s, i) => `
    <div class="card" data-i="${i}" data-yt="${esc(s.youtube)}" role="button" tabindex="0" aria-label="${esc(s.title)}">
      <div class="ph" style="--h:${i * 37}deg"><img src="${LIGHT && i ? `https://i.ytimg.com/vi_webp/${s.youtube}/sddefault.webp" data-light style="transform:scale(1.34)` : `https://i.ytimg.com/vi/${s.youtube}/maxresdefault.jpg`}" fetchpriority="${i ? "low" : "high"}" alt="" loading="lazy" decoding="async" onload="if(this.naturalWidth<200)this.onerror()" onerror="this.onerror=this.onload=null;this.style.transform='scale(1.34)';this.src='https://i.ytimg.com/vi/${s.youtube}/hqdefault.jpg'"></div>
      <div class="cap">${esc(s.title)}</div>
      <div class="play">${UI.play}</div>
    </div>`).join("");
  const layout = () => {
    const n = fanItems.length;
    $$(".card", fan).forEach((c, i) => {
      const d = ((i - active) % n + n) % n;           // distance ahead of the active card
      const spread = Math.min(d, 5);
      const angle = spread * 7;                        // fan opens toward the page edge, away from the text column
      c.style.transform = `rotate(calc(${spread} * var(--fan-step, 7deg))) translateY(${spread * 2}px)`;
      c.style.zIndex = n - d;
      c.style.opacity = d > 5 ? 0 : 1;
      c.style.filter = d ? `brightness(${1 - spread * .08})` : "none";
      c.style.pointerEvents = d ? "none" : "auto";
    });
  };
  layout();
  /* switching cards: no flying card (user 23/11); the stack resettles with a soft slide (CSS transition), no flying card, no scroll-driven advance (owner 23/11: he wants motion when songs change) */
  const step = (dir) => {
    if (!fanItems.length) return;
    active = (active + dir + fanItems.length) % fanItems.length;
    sharpen(active); sharpen((active + 1) % fanItems.length);
    layout();
  };
  $("#fan-prev").innerHTML = UI.chevR; $("#fan-next").innerHTML = UI.chevL;
  $("#fan-prev").onclick = () => step(-1); $("#fan-next").onclick = () => step(1);
  fan.addEventListener("click", (ev) => { const c = ev.target.closest(".card"); if (!c) return; const s = fanItems[+c.dataset.i]; if (s.youtube) playVideo(s.youtube); else step(1); });
  fan.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); fan.querySelector(`.card[data-i="${active}"]`).click(); } });
  // platforms
  $("#platforms").innerHTML = Object.entries(site.album.listen).filter(([k]) => ICON(k)).map(([k, u]) => `<a href="${u}" target="_blank" rel="noopener" aria-label="${k}">${ICON(k)}</a>`).join("");

  // --- shop (latest 4 playbacks) ---
  const playbacks = products.items.filter(p => p.type === "playback");
  const latest = (playbacks.length ? playbacks : products.items).slice(0, 4);
  $("#shop-grid").innerHTML = latest.map(p => productCard(p)).join("");
  wireProductCards($("#shop-grid"), products);

  // --- shows ---
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = shows.items.filter(s => !s.date || s.date >= today);
  $("#shows-list").innerHTML = upcoming.length ? upcoming.map(s => `
    <article class="show">
      <div class="bg" style="background-image:url('${s.image || "assets/img/scene-piano.webp"}')"></div>
      <div class="date">${String(s.hebrewDate || "").split("|")[1] ? s.hebrewDate.split("|")[1].trim() : (s.hebrewDate || "")}<small>${String(s.hebrewDate || "").split("|")[1] ? s.hebrewDate.split("|")[0].trim() : ""}</small></div>
      <div><h3>${s.title}</h3><p>${[s.venue, s.city].filter(Boolean).join(" · ")}</p></div>
      ${s.tickets ? `<a class="btn btn-red" href="${s.tickets}" target="_blank" rel="noopener">לרכישת כרטיסים</a>` : ""}
    </article>`).join("") : `<div class="shows-empty">הופעות חדשות יתפרסמו כאן בקרוב. להזמנת דודי לאירוע, <a href="#" data-open-contact style="color:var(--teal-light);text-decoration:underline;text-underline-offset:3px">צרו קשר</a>.</div>`;
  $$("[data-open-contact]", $("#shows-list")).forEach(b => b.onclick = (ev) => { ev.preventDefault(); openOverlay("contact-overlay"); });

  // --- about ---
  const ABOUT_MORE = '<p class="about-more"><a href="about.html">לסיפור המלא</a></p>';
  $("#about-text-r").innerHTML = `<p>${site.about[0]}</p>`;
  $("#about-text-l").innerHTML = site.about.slice(1).map(p => `<p>${p}</p>`).join("") + ABOUT_MORE;
  /* wide screens: the about text appears at the very end, beside the written name and Dudi stepping out
     (fades in with the end buttons, CSS reads --intro-end). The row in the scroll is hidden there, and the
     "#about" anchor moves to the finale so the menu link lands on that ending. Phones keep the row. */
  const stage = $("#ia-stage"), finale = $("#ia-finale"), aboutRow = $("#about");
  /* runs only when the screen really changed size; the phone's address bar hiding while scrolling is not that (17/11) */
  const onSized = (fn) => { let w = innerWidth, h = stage ? stage.clientHeight : 0; addEventListener("resize", () => { const nh = stage ? stage.clientHeight : 0; if (innerWidth === w && nh === h) return; w = innerWidth; h = nh; fn(); }); };
  /* built always; the stylesheet shows it (and hides the row) only on wide screens, so a window that is widened or
     narrowed after loading still gets the right one (user 08/11: the about showed in the scroll instead of beside Dudi) */
  if (stage && finale && aboutRow) {
    const end = document.createElement("div");
    end.className = "ia-about-end";
    /* one text in two columns: the right column runs to the bottom, the rest flows into the left one, and the
       two end buttons sit in the empty part under it (style.css) */
    end.innerHTML = `<div class="txt">${site.about.map(p => `<p>${p}</p>`).join("")}${ABOUT_MORE}</div>`;
    stage.insertBefore(end, $("#ia-cta"));
    aboutRow.classList.add("moved-to-end");
    /* the ending's text is drawn over the whole animation and only fades in at its end: its link takes presses
       (and the keyboard) only while the text is really showing */
    const moreA = end.querySelector(".about-more a");
    const syncMore = () => { const on = +getComputedStyle(end).opacity > .6; moreA.style.pointerEvents = on ? "auto" : ""; moreA.tabIndex = on ? 0 : -1; };
    /* measured with the rest of the page's animation (assets/js/frame.js, 23/11) */
    if (window.DK_FRAME) DK_FRAME.add({ read: () => +getComputedStyle(end).opacity > .6, write: (on) => { if (moreA.tabIndex !== (on ? 0 : -1)) { moreA.style.pointerEvents = on ? "auto" : ""; moreA.tabIndex = on ? 0 : -1; } } });
    else { addEventListener("scroll", syncMore, { passive: true }); addEventListener("resize", syncMore); }
    syncMore();
    /* the scrolling ending stretch lies over the text, so a press on the link's place is passed on to the link */
    const onMore = (ev) => { if (moreA.tabIndex !== 0) return false; const r = moreA.getBoundingClientRect(); return ev.clientX >= r.left - 6 && ev.clientX <= r.right + 6 && ev.clientY >= r.top - 8 && ev.clientY <= r.bottom + 8; };
    finale.addEventListener("click", (ev) => { if (onMore(ev)) location.href = moreA.href; });
    finale.addEventListener("mousemove", (ev) => { finale.style.cursor = onMore(ev) ? "pointer" : ""; });
    const anchor = document.createElement("span"); anchor.className = "ia-about-anchor"; anchor.setAttribute("aria-hidden", "true");
    finale.appendChild(anchor);
    /* the "#about" link lands on the ending on wide screens and on the row in the scroll on narrow ones */
    const wideMQ = matchMedia("(min-width:1100px)");
    const mode = () => {
      const wide = wideMQ.matches;
      aboutRow.id = wide ? "about-row" : "about"; anchor.id = wide ? "about" : "about-end";
      document.documentElement.classList.toggle("about-at-end", wide);
    };
    mode(); wideMQ.addEventListener("change", () => { mode(); requestAnimationFrame(placeBtns); });
    /* phones (user 08/11): Dudi steps out of the album to the centre first, with nothing over him; only then the
       about card rides up over him, and the end buttons come after it. The card sits inside the ending stretch,
       whose length is set here to fit it; intro.js reads the card's place to time the ending around it */
    const phoneMQ = matchMedia("(max-width:759px)"), rowHome = aboutRow.parentElement, rowNext = aboutRow.nextSibling;
    const phone = () => {
      if (phoneMQ.matches) { if (aboutRow.parentElement !== finale) finale.insertBefore(aboutRow, finale.firstChild); }
      else if (aboutRow.parentElement === finale) rowHome.insertBefore(aboutRow, rowNext);
      document.documentElement.classList.toggle("about-beside-dudi", phoneMQ.matches);
      sizeFinale();
    };
    const sizeFinale = () => {
      if (!phoneMQ.matches) { finale.style.height = ""; return; }
      const vh = stage.clientHeight || innerHeight, top = Math.round(vh * 2.4);   /* 0.9 screen for the shop box to leave, then 1.5 for him to step out */
      aboutRow.style.top = top + "px";
      finale.style.height = (top + aboutRow.offsetHeight + Math.round(vh * 1.2)) + "px";
    };
    onSized(sizeFinale);
    if (document.fonts) document.fonts.ready.then(sizeFinale);
    phone(); phoneMQ.addEventListener("change", phone);
    if (location.hash === "#about") requestAnimationFrame(() => document.getElementById("about").scrollIntoView());
    /* the two end buttons sit right under the text of the left column, in its empty part (user 08/11) */
    /* user 10/11: on short or narrow wide screens the text overflowed into a third column cut off at the side;
       shrink the type until it fits the two columns, and if even that is too small let the columns balance */
    const fitAbout = () => {
      const t = end.querySelector(".txt"); if (!t) return;
      t.style.fontSize = ""; t.classList.remove("free");
      if (!wideMQ.matches) return;
      const over = () => t.scrollWidth > t.clientWidth + 2 || t.scrollHeight > t.clientHeight + 2;
      let fs = parseFloat(getComputedStyle(t).fontSize);
      while (over() && fs > 12) { fs -= .5; t.style.fontSize = fs + "px"; }
      if (over()) t.classList.add("free");
    };
    const placeBtns = () => {
      fitAbout();
      const ps = end.querySelectorAll(".txt p"), lastP = ps[ps.length - 1], cta = $("#ia-cta");
      if (!lastP || !cta) return;
      const sr = stage.getBoundingClientRect(), top = lastP.getBoundingClientRect().bottom - sr.top + 30;
      const fits = top + cta.offsetHeight < stage.clientHeight * .92;
      document.documentElement.style.setProperty("--about-btn-top", fits ? top + "px" : "auto");
      document.documentElement.style.setProperty("--about-btn-bottom", fits ? "auto" : "8%");
    };
    placeBtns(); onSized(placeBtns);
    if (document.fonts) document.fonts.ready.then(placeBtns);
  }

  /* clicking the album glides down to where its first page has just opened (timeline .16: the first of 9 flips
     runs .05 to .155; same scroll mapping as the animation's readScroll) */
  const book = $("#ia-book"), track = $("#ia-track"), zone = $("#ia-herozone");
  if (book && track && finale) {
    const firstPageY = () => {
      const top = track.getBoundingClientRect().top + scrollY;
      const total = Math.max(1, track.offsetHeight - stage.offsetHeight - ((document.getElementById("ia-return") || {}).offsetHeight || 0));
      const fh = Math.min(finale.offsetHeight, total), a = total - fh, h0 = zone ? Math.min(zone.offsetHeight, a) : 0;
      return top + h0 + (a - h0) * (.165 / .75);
    };
    /* user 08/11: the first click stops where the album box stands beside the grown album, the next one goes on to
       the shop box; each stop puts that box in the middle of the screen */
    const centreOf = (sel) => {
      const el = $(sel); if (!el || !el.offsetHeight) return null;
      const r = el.getBoundingClientRect();
      return Math.round(scrollY + r.top + r.height / 2 - innerHeight / 2);
    };
    book.addEventListener("click", () => {
      const top = track.getBoundingClientRect().top + scrollY, grown = top + (zone ? zone.offsetHeight : 0);
      const stops = [Math.max(grown, centreOf("#album .ia-side") ?? firstPageY()), centreOf("#shop .ia-side")].filter((v) => v != null);
      const next = stops.find((y) => scrollY < y - 40);
      if (next != null) { if (window.lenis) window.lenis.scrollTo(next, { duration: 1.4 }); else scrollTo({ top: next, behavior: "smooth" }); }
    });
  }

  revealAll();
});

/* כרטיס מוצר (משותף לדף הבית ולחנות) */
window.productCard = (p) => {
  const price = p.options ? `${fmt(priceOf(p, p.options[0].price))} - ${fmt(priceOf(p, p.options[p.options.length - 1].price))}` : priceHTML(p);
  const tag = p.type === "album" ? "אלבום" : "פלייבק";
  const foot = (window.FLAGS && FLAGS.showPrices === false)
    ? `<div class="foot"><span class="price" style="font-family:var(--f-body);font-size:13px;color:var(--ink-dim)">בקרוב</span><a class="icon-btn teal" href="product.html?id=${p.id}" aria-label="לפרטים">${UI.eye}</a></div>`
    : `<div class="foot"><span class="price">${price}</span><button class="icon-btn teal" data-add aria-label="הוספה לסל">${ICON("cart")}</button></div>`;
  return `
    <article class="pcard" data-id="${p.id}">
      <a class="thumb" href="product.html?id=${p.id}"><img src="${esc(p.image)}"${coverSet(p.image)} alt="${esc(p.title)}" loading="lazy" decoding="async"><span class="tag">${tag}</span></a>
      <h3><a href="product.html?id=${p.id}">${esc(p.title)}</a></h3>
      ${foot}
    </article>`;
};
window.wireProductCards = (root, products) => {
  $$("[data-add]", root).forEach(b => b.onclick = () => {
    const p = products.items.find(x => x.id === b.closest(".pcard").dataset.id);
    if (p.options) { location.href = `product.html?id=${p.id}`; return; }
    Cart.add({ id: p.id, title: p.title, image: p.image, price: priceOf(p), list: Number(p.price), ...(p.preorder === true ? { preorder: true } : {}) });
  });
};
