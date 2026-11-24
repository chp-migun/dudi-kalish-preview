/* עמוד חנות (מחדש 23/11, שדרוג "פי 10", אבן 7)
   היה: כרטיס קטן אחד בתוך דף ריק. עכשיו: המוצר המודגש (האלבום בהזמנה מוקדמת, או הראשון ברשימה) מוצג בגדול —
   עטיפה, מחיר השקה, תיאור, רשימת השירים, הוספה לסל ותקציר שמתנגן בנגן הקבוע — כך שאפשר לקנות בלי לעבור דף.
   שאר המוצרים (כשיהיו) ברשת מתחתיו, עם סינון כשיש יותר מסוג אחד. הכל מנתוני ממשק הניהול, בלי טקסט ממוצא. */
document.addEventListener("chrome:ready", async () => {
  const products = await loadJSON("products");
  const site = window.SITE || {};
  const grid = $("#shop-grid"), filters = $("#filters"), spot = $("#shop-spot"), more = $("#shop-more");
  const items = products.items.filter(p => !p.hidden);
  const lead = items.find(p => p.type === "album" && p.preorder) || items.find(p => p.type === "album") || items[0];
  const rest = items.filter(p => p !== lead);
  const prices = !(window.FLAGS && FLAGS.showPrices === false);

  /* ---- the featured product, large ---- */
  if (lead) {
    const isAlbum = lead.type === "album", album = isAlbum && site.album && site.album.id === lead.id ? site.album : null;
    const name = album && album.title ? album.title : String(lead.title).replace(/^\s*אלבום\s*:\s*/, "");
    const tracks = album && Array.isArray(album.tracks) ? album.tracks : [];
    const now = priceOf(lead), list = Number(lead.price), note = saleNote(lead);
    const eyebrow = [isAlbum ? "האלבום החדש" : "", lead.preorder ? "הזמנה מוקדמת" : ""].filter(Boolean).join(" · ");
    spot.innerHTML = `
      <div class="sp-art">
        <span class="sp-vinyl" aria-hidden="true"></span>
        <a class="sp-cover" href="product.html?id=${esc(lead.id)}"><img src="${esc(lead.image)}" alt="${esc(lead.title)}" fetchpriority="high" decoding="async"></a>
      </div>
      <div class="sp-info">
        ${eyebrow ? `<div class="sp-eyebrow">${esc(eyebrow)}</div>` : ""}
        <h2 class="sp-title">${esc(name)}</h2>
        ${(lead.description || []).map(t => `<p class="sp-desc">${esc(t)}</p>`).join("")}
        ${prices ? `
        <div class="sp-buy">
          <div class="sp-price"><b>${fmt(now)}</b>${now < list ? `<s>${fmt(list)}</s>` : ""}${note ? `<span class="sp-sale">${esc(note)}</span>` : ""}</div>
          <div class="sp-actions">
            <button type="button" class="btn btn-red btn-lg" id="sp-add">${ICON("cart")}<span>${lead.preorder ? "להזמנה מוקדמת" : "הוספה לסל"}</span></button>
            ${album && album.trailer ? `<button type="button" class="btn btn-line btn-lg" id="sp-trailer">${UI.play}<span>תקציר</span></button>` : ""}
          </div>
          ${lead.preorder && window.PREORDER_NOTE ? `<p class="sp-note">${UI.download || ""}<span>${esc(PREORDER_NOTE)}</span></p>` : ""}
        </div>` : `<div class="sp-buy"><span class="sp-soon">בקרוב</span></div>`}
        ${tracks.length ? `
        <div class="sp-tracks">
          <div class="sp-th">${tracks.length} שירים באלבום</div>
          <ol>${tracks.map((t, i) => `<li><b>${String(i + 1).padStart(2, "0")}</b><span>${esc(t)}</span></li>`).join("")}</ol>
        </div>` : ""}
        <a class="sp-more" href="product.html?id=${esc(lead.id)}">לעמוד ${isAlbum ? "האלבום" : "המוצר"} המלא ←</a>
      </div>`;
    spot.hidden = false;
    const add = $("#sp-add");
    if (add) add.onclick = () => {
      if (lead.options) { location.href = `product.html?id=${lead.id}`; return; }
      Cart.add({ id: lead.id, title: lead.title, image: lead.image, price: priceOf(lead), list: Number(lead.price), ...(lead.preorder === true ? { preorder: true } : {}) });
    };
    const tr = $("#sp-trailer");
    if (tr) tr.onclick = () => playVideo(album.trailer);
  }

  /* ---- everything else, in a grid ---- */
  let current = "all";
  const cats = products.categories.filter(c => c.id === "all" || rest.some(p => p.type === c.id));
  filters.hidden = cats.length < 3;
  filters.innerHTML = cats.map(c => `<button type="button" data-cat="${c.id}" aria-pressed="${c.id === current}">${c.label}</button>`).join("");
  filters.onclick = (e) => { const b = e.target.closest("button"); if (!b) return; current = b.dataset.cat; $$("button", filters).forEach(x => x.setAttribute("aria-pressed", x === b)); render(); };
  const render = () => {
    const list = rest.filter(p => current === "all" || p.type === current);
    grid.innerHTML = list.map(p => productCard(p).replace('class="pcard"', 'class="pcard reveal"')).join("");
    wireProductCards(grid, products); revealAll();
  };
  more.hidden = !rest.length;
  render();
});
