/* מצב קל למחשבים חלשים (user 19/11: "במחשבים חלשים דף הבית זז לאט בגלל ההנפשה").
   Loaded in <head>, before the first paint. Turns on `html.lite` when the machine cannot keep up:
   - straight away on very small machines (1-2 cores or up to 2GB) and for visitors who were measured slow before
   - otherwise by measuring: if, while the visitor scrolls, frames keep arriving slower than ~25 a second
   The page turning itself stays. Lite drops what costs the most to draw: live blur, film grain, the drifting
   points of light, soft edge masks and the pointer tilt, and builds each page from fewer strips.
   Styles: the "lite" block in style.css. intro.js / sparkles.js listen for the "dk:lite" event.
   To check by hand: add ?lite=1 (force on) or ?lite=0 (force off and forget) to the address. */
(() => {
  const root = document.documentElement, KEY = "dk_lite", DAY = 864e5;
  const store = { get() { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } },
                  set(v) { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e) {} } };
  const api = window.DK_LITE = { on: false };
  const turnOn = (remember) => {
    if (api.on) return;
    api.on = true; root.classList.add("lite");
    if (remember) store.set(Date.now());
    document.dispatchEvent(new CustomEvent("dk:lite"));
  };

  const q = new URLSearchParams(location.search).get("lite");
  if (q === "0") { store.set(0); return; }
  if (q === "1") { turnOn(false); return; }
  const small = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.deviceMemory && navigator.deviceMemory <= 2);
  if (small || Date.now() - store.get() < 30 * DAY) { turnOn(false); return; }   /* a slow verdict is trusted for a month, then measured again */

  /* measure only frames drawn while the page is being scrolled, and not during the first moments of loading */
  let lastScroll = 0, prev = 0, slow = 0, seen = 0, raf = 0;
  const t0 = performance.now();
  const frame = (now) => {
    raf = 0;
    if (api.on) return;
    if (now - lastScroll > 180) { prev = 0; return; }            /* scrolling stopped: stop counting */
    if (prev && now - t0 > 2500 && !document.hidden) {
      const d = now - prev;
      if (d < 400) { seen++; if (d > 40) slow++; }                 /* a pause longer than that is a hiccup, not the frame rate */
      if (seen >= 45) { if (slow / seen > .5) { turnOn(true); return; } seen = slow = 0; }
    }
    prev = now; raf = requestAnimationFrame(frame);
  };
  addEventListener("scroll", () => { lastScroll = performance.now(); if (!raf && !api.on) raf = requestAnimationFrame(frame); }, { passive: true });
})();
