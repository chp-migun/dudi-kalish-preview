/* עמוד סל קניות + תשלום: השרת פותח דף תשלום של קארדקום, והוא מוצג בחלון בתוך האתר */
document.addEventListener("chrome:ready", () => {
  if (window.top !== window.self) return; // Cardcom sent us back inside the payment window: the page reloads on top (inline script)
  const panel = $("#cart-panel");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // a line sold at the launch price shows the full price crossed out beside it (user 20/11)
  const was = (i, n = 1) => Number(i.list) > Number(i.price) ? ` <s>${fmt(Number(i.list) * n)}</s>` : "";
  const render = () => {
    const items = Cart.read();
    if (!items.length) { panel.innerHTML = `${Cart.noteHTML()}<div class="empty-state">הסל ריק.<br><a class="btn btn-line" href="shop.html" style="margin-top:18px">לחנות</a></div>`; }
    else {
      panel.innerHTML = `${Cart.noteHTML()}<table class="cart-table"><thead><tr><th></th><th>מוצר</th><th>מחיר</th><th>כמות</th><th>סכום</th><th></th></tr></thead><tbody>
        ${items.map(i => `<tr data-key="${esc(i.key)}">
          <td><img src="${esc(i.image)}" alt=""></td>
          <td><b style="font-weight:500;color:var(--ink)">${esc(i.title)}</b>${i.optionLabel ? `<br><small style="color:var(--ink-dim)">${esc(i.optionLabel)}</small>` : ""}${i.preorder ? `<br><small style="color:var(--teal-light)">הזמנה מוקדמת</small>` : ""}</td>
          <td><span class="price">${fmt(i.price)}${was(i)}</span></td>
          <td><div class="qty-box" style="transform:scale(.9)"><button data-dec aria-label="פחות">${UI.minus}</button><input type="number" min="1" max="20" value="${esc(i.qty)}" aria-label="כמות"><button data-inc aria-label="יותר">${UI.plus}</button></div></td>
          <td><span class="price">${fmt(i.price * i.qty)}${was(i, i.qty)}</span></td>
          <td><button class="icon-btn" data-rm aria-label="הסרה">${UI.trash}</button></td>
        </tr>`).join("")}</tbody></table>`;
      $$("tr[data-key]", panel).forEach(tr => {
        const k = tr.dataset.key, it = items.find(i => i.key === k);
        tr.querySelector("[data-dec]").onclick = () => { Cart.setQty(k, it.qty - 1); render(); };
        tr.querySelector("[data-inc]").onclick = () => { Cart.setQty(k, it.qty + 1); render(); };
        tr.querySelector("input").onchange = (e) => { Cart.setQty(k, +e.target.value || 1); render(); };
        tr.querySelector("[data-rm]").onclick = () => { Cart.remove(k); render(); };
      });
    }
    $("#sum-sub").innerHTML = fmt(Cart.total()) + Cart.wasHTML(); $("#sum-total").innerHTML = fmt(Cart.total()) + Cart.wasHTML();
    // what the buyer gets and when, in the words under the pay button
    const note = $(".pay-note"), pre = items.filter(i => i.preorder), sure = "התשלום מתבצע בדף מאובטח של קארדקום. ";
    if (note) note.textContent = sure + (!pre.length ? "הקבצים נשלחים למייל מיד לאחר אישור התשלום." : pre.length === items.length ? "זו הזמנה מוקדמת: הקישור לאלבום יישלח אליכם למייל בימים הקרובים, לפני כולם." : "האלבום בהזמנה מוקדמת: הקישור לאלבום יישלח אליכם למייל בימים הקרובים, לפני כולם. שאר הקבצים נשלחים מיד לאחר אישור התשלום.");
    Cart.render();
  };
  render();

  const form = $("#checkout-form"), msg = form.querySelector(".form-msg");
  // while the payment page is being prepared the button shows a spinner instead of its label (no extra line of text)
  const payBtn = form.querySelector("button[type=submit]"), payLabel = payBtn.innerHTML;
  const busy = (on) => {
    payBtn.disabled = on; payBtn.toggleAttribute("aria-busy", on);
    if (on) { payBtn.setAttribute("aria-label", "פותחים את דף התשלום המאובטח"); payBtn.style.opacity = "1"; payBtn.innerHTML = '<span aria-hidden="true" style="display:block;width:24px;height:24px;margin:0 auto;border-radius:50%;border:3px solid rgba(255,255,255,.35);border-top-color:#fff;animation:spin .8s linear infinite"></span>'; }
    else { payBtn.removeAttribute("aria-label"); payBtn.style.opacity = ""; payBtn.innerHTML = payLabel; }
  };
  const back = new URLSearchParams(location.search).get("payment");
  if (back === "failed") msg.textContent = "התשלום לא אושר. אפשר לנסות שוב או בכרטיס אחר.";
  if (back === "cancelled") msg.textContent = "התשלום בוטל. הסל שמור.";

  // asks the server whether a payment window that was closed (or a tab that was shut) actually got paid
  const pendingLp = () => { try { const p = JSON.parse(localStorage.getItem("dk_pending_payment") || "null"); return p && Date.now() - p.at < 2 * 3600e3 ? p.lp : ""; } catch { return ""; } };
  const goIfPaid = async (lp) => {
    if (!lp) return false;
    try {
      const d = await (await fetch(`/api/order-status?lp=${encodeURIComponent(lp)}`, { cache: "no-store" })).json();
      if (d.status === "paid" || d.status === "review") { location.href = `thanks.html?lowprofilecode=${encodeURIComponent(lp)}`; return true; }
    } catch {}
    return false;
  };
  if (!back) goIfPaid(pendingLp());
  let closedAt = 0;   // when the payment window was last closed by the buyer

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, btn = f.querySelector('button[type="submit"]');
    if (!Cart.read().length) { msg.textContent = "הסל ריק."; return; }
    if (!f.checkValidity()) { msg.textContent = "נא למלא את שדות החובה ולאשר את התנאים."; f.reportValidity(); return; }
    const fd = Object.fromEntries(new FormData(f));
    const payload = {
      customer: { fname: fd.fname, lname: fd.lname, phone: fd.phone, email: fd.email, terms: !!fd.terms, newsletter: !!fd.newsletter },
      items: Cart.read().map(i => ({ id: i.id, option: i.option || "", qty: i.qty })),
    };
    busy(true); msg.textContent = "";
    // an earlier payment window of this visit may have gone through after it was closed: never a second charge
    // a window closed seconds ago may still turn into a payment (the bank answered, the page had not moved on yet):
    // it is given a short while before another payment page opens
    const wait = 20000 - (Date.now() - closedAt);
    if (pendingLp() && wait > 0) { msg.textContent = "בודקים את מצב התשלום…"; await new Promise(r => setTimeout(r, wait)); msg.textContent = ""; }
    if (await goIfPaid(pendingLp())) return;
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.url) throw new Error(d.message || "לא הצלחנו לפתוח את דף התשלום. נסו שוב בעוד רגע.");
      try { localStorage.setItem("dk_pending_payment", JSON.stringify({ lp: d.lowProfileId, order: d.orderId, at: Date.now() })); } catch {}
      openPay(d.url);
    } catch (err) {
      msg.textContent = err.message && /[א-ת]/.test(err.message) ? err.message : "לא הצלחנו לפתוח את דף התשלום. נסו שוב בעוד רגע.";
      busy(false);
    }
  });

  // Cardcom's payment page in a window over the cart; card details stay on Cardcom's page.
  // After paying, Cardcom loads thanks.html inside the window and that page moves itself to the top.
  function openPay(url) {
    const box = document.createElement("div");
    box.className = "overlay pay-overlay"; box.dataset.open = "false";
    box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "תשלום מאובטח");
    box.innerHTML = `<div class="popup pay-popup"><button class="icon-btn close" type="button" aria-label="סגירה">${UI.x}</button><iframe title="תשלום מאובטח" allow="payment"></iframe></div>`;
    box.querySelector("iframe").src = url;
    document.body.appendChild(box);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => { box.dataset.open = "true"; box.querySelector(".close").focus(); });
    // the rest of the page can't be reached with Tab while the window is open
    const behind = [...document.body.children].filter(el => el !== box && !el.inert);
    behind.forEach(el => { el.inert = true; });
    // safety net: if Cardcom charged but its window does not move on by itself, this page notices the payment
    // and goes to the thanks page on its own
    let watching = true;
    (async () => {
      await new Promise(r => setTimeout(r, 8000));
      while (watching && box.isConnected) {
        if (await goIfPaid(pendingLp())) return;
        await new Promise(r => setTimeout(r, 4000));
      }
    })();
    const close = async () => {
      watching = false;
      document.removeEventListener("keydown", onKey);
      box.dataset.open = "false"; document.body.style.overflow = prevOverflow;
      behind.forEach(el => { el.inert = false; });
      setTimeout(() => box.remove(), 300);
      const btn = form.querySelector('button[type="submit"]');
      // closed after Cardcom already charged (or during 3D Secure): never tell the buyer it was cancelled
      msg.textContent = "בודקים את מצב התשלום…";
      const lp = pendingLp();
      closedAt = Date.now();
      if (await goIfPaid(lp)) return;
      busy(false);
      msg.textContent = "התשלום בוטל. הסל שמור.";
      btn.focus();
      // the card check (3D Secure) may still finish after the window was closed: the payment stays remembered and
      // is looked at a few more times, and again on the next visit to the cart and before another payment opens
      for (let i = 0; i < 6 && lp && pendingLp() === lp; i++) {
        await new Promise(r => setTimeout(r, 10000));
        if (pendingLp() === lp && await goIfPaid(lp)) return;
      }
    };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    box.querySelector(".close").onclick = close;
    msg.textContent = "";
  }
});
