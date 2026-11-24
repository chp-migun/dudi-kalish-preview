/* לולאת ציור אחת לכל הדף (שדרוג גלילה 23/11).
   עד עכשיו כל אנימציה בדף הבית האזינה לגלילה בעצמה וציירה בתור משלה: האלבום, תמונת הפתיח, סרגל הראש,
   טקסט האודות. כל אחת מדדה את הדף אחרי שהקודמת כבר שינתה אותו, והדפדפן נאלץ לחשב את הפריסה מחדש כמה
   פעמים בכל פריים (נמדד: 2,182 חישובים בגלילה אחת). בנוסף הן ציירו פריים אחד אחרי הגלילה החלקה, ולכן רעדו.
   כאן כולן נרשמות לתור אחד: קודם כל המדידות של כולן, אחר כך כל השינויים — חישוב פריסה אחד לכל פריים.
   כשיש גלילה חלקה (Lenis, flow.js) היא מפעילה את התור באותו רגע שהיא מזיזה את הדף, כך שהכל זז יחד.
   job = { read(): מחזיר מדידות, write(m): משנה את הדף לפי המדידות }. */
(() => {
  const jobs = [];
  let raf = 0, lastY = -1, forced = true;
  function flush() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    lastY = window.scrollY; forced = false;
    const n = jobs.length, st = new Array(n);
    for (let i = 0; i < n; i++) { try { st[i] = jobs[i].read ? jobs[i].read() : undefined; } catch (e) { console.error(e); } }
    for (let i = 0; i < n; i++) { try { if (jobs[i].write) jobs[i].write(st[i]); } catch (e) { console.error(e); } }
  }
  /* גלילה רגילה (טלפון, או כשאין גלילה חלקה): פריים אחד לכל שינוי. אם הגלילה החלקה כבר ציירה את המקום הזה, מדלגים */
  const tick = () => { raf = 0; if (forced || window.scrollY !== lastY) flush(); };
  const req = (force) => { if (force) forced = true; if (!raf) raf = requestAnimationFrame(tick); };
  addEventListener("scroll", () => req(false), { passive: true });
  addEventListener("resize", () => req(true));
  if (window.visualViewport) { visualViewport.addEventListener("resize", () => req(true)); visualViewport.addEventListener("scroll", () => req(true)); }
  window.DK_FRAME = { add(job) { jobs.push(job); req(true); return job; }, flush, req: () => req(true) };
})();
