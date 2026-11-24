// text that is edited in the admin is always printed as text, never as markup
var esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/* עמוד מוצר — אלבום (עם בחירת מחיר) או פלייבק */
document.addEventListener("chrome:ready", async () => {
  const products = await loadJSON("products");
  const id = new URLSearchParams(location.search).get("id");
  const p = products.items.find(x => x.id === id) || products.items[0];
  document.title = p.type === "album" ? `${SITE.album.title}, האלבום החדש | ${SITE.artist}` : `${p.title} | ${SITE.artist}`;
  // search engines: describe the album (name, artist, songs, and the price once the shop is open)
  if (p.type === "album") {
    const home = "https://dudikalish.com/", url = `${home}product.html?id=${p.id}`;
    const ld = {
      "@context": "https://schema.org", "@type": "MusicAlbum", "@id": url + "#album", url,
      name: SITE.album.title, image: home + "assets/img/album-share.jpg", inLanguage: "he",
      byArtist: { "@type": "MusicGroup", "@id": home + "#dudi", name: SITE.artist, url: home },
      numTracks: SITE.album.tracks.length,
      track: SITE.album.tracks.map((t, i) => ({ "@type": "MusicRecording", position: i + 1, name: t })),
    };
    if (SITE.album.year) ld.datePublished = String(SITE.album.year);
    if (FLAGS.showPrices !== false && p.price) ld.offers = { "@type": "Offer", url, price: String(priceOf(p)), priceCurrency: "ILS", availability: p.preorder ? "https://schema.org/PreOrder" : "https://schema.org/InStock" };
    const tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify(ld);
    document.head.appendChild(tag);
  }
  const root = $("#product");
  const lic = products.playbackLicense;
  const desc = p.type === "album"
    ? (p.description || []).map(t => `<p>${esc(t)}</p>`).join("")
    : `<p>${lic.title}</p><ul>${lic.items.map(i => `<li>${i}</li>`).join("")}</ul><p><b>שימו לב:</b> ${lic.note}</p>`;
  const noPrices = FLAGS.showPrices === false;
  const options = noPrices ? "" : (p.options ? `<div class="options" role="radiogroup" aria-label="בחירת מחיר">${p.options.map((o, i) => `<label><input type="radio" name="opt" value="${esc(o.id)}" ${i === 0 ? "checked" : ""}><span>${esc(o.label)} · ${priceHTML(p, o.price)}</span></label>`).join("")}</div>` : "");
  // a single price sits on the buy line, next to the quantity
  const onePrice = !noPrices && !p.options ? `<div class="price buy-price">${priceHTML(p)}</div>` : "";
  const pre = !noPrices && p.preorder === true;   /* paid now, the file is mailed when the product is released */
  const buy = noPrices
    ? `<div class="buy-row"><a class="btn btn-red btn-lg" href="#contact">המכירה נפתחת בקרוב, הצטרפו לעדכונים</a></div>`
    : `<div class="buy-row">
        ${onePrice}
        <div class="qty-box"><button type="button" id="q-dec" aria-label="פחות">${UI.minus}</button><input id="qty" type="number" min="1" max="20" value="1" aria-label="כמות"><button type="button" id="q-inc" aria-label="יותר">${UI.plus}</button></div>
        <button class="btn btn-red btn-lg" id="add">${ICON("cart")} ${pre ? "הזמנה מוקדמת" : "הוספה לסל"}</button>
      </div>${saleNote(p) ? `<div class="sale-note">${saleNote(p)}</div>` : ""}`;
  const albumTracks = p.type === "album" ? `<ol class="tracks" style="margin-top:6px">${SITE.album.tracks.map((t, i) => `<li><b>${String(i + 1).padStart(2, "0")}</b>${t}</li>`).join("")}</ol>` : "";
  // album trailer: one YouTube id in site.json (album.trailer), opens in the site's video lightbox
  const trailer = p.type === "album" && SITE.album.trailer ? `<div class="vcard trailer" role="button" tabindex="0" aria-label="צפייה בתקציר האלבום"><div class="frame"><img src="${ytThumb(SITE.album.trailer)}" alt="" loading="lazy"><div class="play">${UI.play}</div><div class="cap">תקציר האלבום</div></div></div>` : "";
  root.innerHTML = `
    <div class="gallery"><img src="${esc(p.image)}" alt="${esc(p.title)}"></div>
    <div class="info">
      <div class="eyebrow">${p.type === "album" ? "האלבום החדש" : "פלייבק"}</div>
      <h1 class="brush">${esc(p.type === "album" ? p.title.replace(/^\s*אלבום\s*:\s*/, "") : p.title)}</h1>
      <div class="desc">${desc}</div>
      ${trailer}
      ${albumTracks}
      ${options}
      ${buy}
      ${pre ? `<div class="digital">${PREORDER_NOTE}</div>` : p.digital && !noPrices ? `<div class="digital">קובץ להורדה דיגיטלית</div>` : ""}
    </div>`;
  const tr = root.querySelector(".trailer");
  if (tr) { tr.onclick = () => playVideo(SITE.album.trailer); tr.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); playVideo(SITE.album.trailer); } }; }
  if (noPrices) { const related = products.items.filter(x => x.id !== p.id).slice(0, 4); $("#related").hidden = !related.length; $("#related-grid").innerHTML = related.map(productCard).join(""); return; }
  const qty = $("#qty");
  $("#q-dec").onclick = () => qty.value = Math.max(1, +qty.value - 1);
  $("#q-inc").onclick = () => qty.value = Math.min(20, +qty.value + 1);
  $("#add").onclick = () => {
    const opt = p.options ? p.options.find(o => o.id === root.querySelector('input[name="opt"]:checked').value) : null;
    Cart.add({ id: p.id, title: p.title, image: p.image, price: priceOf(p, opt ? opt.price : p.price), list: Number(opt ? opt.price : p.price), qty: +qty.value, option: opt?.id, optionLabel: opt ? `${opt.label} · ${fmt(priceOf(p, opt.price))}` : "", ...(p.preorder === true ? { preorder: true } : {}) });
  };
  const related = products.items.filter(x => x.id !== p.id).slice(0, 4);
  $("#related").hidden = !related.length; $("#related-grid").innerHTML = related.map(productCard).join("");
  wireProductCards($("#related-grid"), products);
});
