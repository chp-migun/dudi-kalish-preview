/* Email field: domain suggestions after "@". Works on every <input data-email> on the page, also on fields
   created later. One shared file for all pages (user rule: every email field uses it). */
(() => {
  // ---------------- email field: domain suggestions after "@" ----------------
  // every <input data-email> on every page (also fields created later)
  const EMAIL_DOMAINS = ["gmail.com", "walla.co.il", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com", "live.com", "012.net.il"];
  let sug = null, sugFor = null, sugIdx = -1;
  const closeSug = () => { if (sug) sug.remove(); sug = null; sugFor = null; sugIdx = -1; };
  const pickSug = (li) => {
    const inp = sugFor; if (!inp || !li) return;
    inp.value = inp.value.split("@")[0] + "@" + li.dataset.domain;
    inp.dispatchEvent(new Event("change", { bubbles: true }));
    closeSug(); inp.focus();
  };
  const markSug = () => { if (!sug) return; [...sug.children].forEach((li, i) => li.setAttribute("aria-selected", i === sugIdx ? "true" : "false")); if (sugIdx >= 0) sugFor.setAttribute("aria-activedescendant", sug.children[sugIdx].id); };
  const openSug = (inp) => {
    const v = inp.value, at = v.indexOf("@");
    const user = at > 0 ? v.slice(0, at) : "", typed = at > 0 ? v.slice(at + 1).toLowerCase() : "";
    const list = user ? EMAIL_DOMAINS.filter(d => d.startsWith(typed) && d !== typed) : [];
    if (!list.length || v.indexOf("@", at + 1) > -1) { closeSug(); return; }
    if (!sug || sugFor !== inp) {
      closeSug();
      sug = document.createElement("ul"); sug.className = "email-suggest"; sug.setAttribute("role", "listbox"); sug.dir = "ltr";
      sug.id = (inp.id || "email") + "-suggest"; inp.setAttribute("aria-controls", sug.id); inp.setAttribute("aria-expanded", "true");
      sug.addEventListener("mousedown", (e) => { e.preventDefault(); pickSug(e.target.closest("li")); });
      (inp.closest(".field") || inp.parentElement).appendChild(sug); sugFor = inp;
    }
    sug.innerHTML = list.map((d, i) => `<li role="option" id="${sug.id}-${i}" data-domain="${d}">${user.replace(/[<>&"]/g, "")}@<b>${d}</b></li>`).join("");
    sugIdx = -1; markSug();
  };
  document.addEventListener("input", (e) => { if (e.target.matches && e.target.matches("input[data-email]")) openSug(e.target); });
  document.addEventListener("keydown", (e) => {
    if (!sug || e.target !== sugFor) return;
    const n = sug.children.length;
    if (e.key === "ArrowDown") { e.preventDefault(); sugIdx = (sugIdx + 1) % n; markSug(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sugIdx = (sugIdx - 1 + n) % n; markSug(); }
    else if (e.key === "Enter" && sugIdx >= 0) { e.preventDefault(); pickSug(sug.children[sugIdx]); }
    else if (e.key === "Escape") { e.preventDefault(); closeSug(); }
  });
  document.addEventListener("focusout", (e) => { if (e.target === sugFor) setTimeout(closeSug, 120); });
})();
