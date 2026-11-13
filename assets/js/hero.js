/* 主視覺：視差與眨眼（2026-11-13）。沒有第三方、不存任何東西（隱私頁的承諾）。
   圖層是 build.py 的 hero_art：背景、她、眨眼兩張（半閉、全閉），同一個取景疊在一起。
   - 滑鼠（電腦）：她跟背景往滑鼠的反方向挪，她挪得多、背景挪得少。
   - 捲動（電腦、手機）：背景跟得慢、她跟得快 —— 看起來背景比較遠。
   - 眨眼：半閉 → 閉 → 半閉，2.5–7 秒一次；分頁看不到的時候不眨。
   系統設了「減少動態」就整個不動（只剩靜止的圖）。 */
(function () {
  var art = document.querySelector('.hero-art[data-parallax]');
  if (!art || !window.requestAnimationFrame) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var bg = art.querySelector('.layer-bg'), ch = art.querySelector('.layer-char');
  var hero = art.parentElement;
  var S = 1.06;                       // 放大一點，挪的時候邊緣不會露出來
  var mx = 0, my = 0, x = 0, y = 0, raf = 0;
  function apply() {
    raf = 0;
    x += (mx - x) * 0.07;
    y += (my - y) * 0.07;
    var h = hero.offsetHeight || 1;
    var s = Math.max(0, Math.min(1, (window.scrollY || window.pageYOffset || 0) / h));
    bg.style.transform = 'translate3d(' + (-x * 10).toFixed(2) + 'px,' + (s * h * 0.35 - y * 8).toFixed(2) + 'px,0) scale(' + S + ')';
    ch.style.transform = 'translate3d(' + (-x * 30).toFixed(2) + 'px,' + (s * h * 0.12 - y * 18).toFixed(2) + 'px,0) scale(' + S + ')';
    if (Math.abs(mx - x) > 0.002 || Math.abs(my - y) > 0.002) raf = window.requestAnimationFrame(apply);
  }
  function kick() { if (!raf) raf = window.requestAnimationFrame(apply); }
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
    kick();
  }, { passive: true });
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  kick();

  var b1 = art.querySelector('.blink.b1'), b2 = art.querySelector('.blink.b2');
  if (!b1 || !b2) return;
  function show(a, b) { b1.style.opacity = a; b2.style.opacity = b; }
  function blink() {
    if (!document.hidden) {
      show(1, 0);
      setTimeout(function () { show(0, 1); }, 50);
      setTimeout(function () { show(1, 0); }, 140);
      setTimeout(function () { show(0, 0); }, 200);
    }
    setTimeout(blink, 2500 + Math.random() * 4500);
  }
  setTimeout(blink, 2000);
})();

/* 場景的點點（2026-11-13）：一個季節、一個室內、一個室外。點點或手機左右滑換一張。不自動輪播。 */
(function () {
  var box = document.querySelector('[data-scenes]');
  if (!box) return;
  var slides = box.querySelectorAll('.slide'), dots = box.querySelectorAll('.scene-dots button'), cur = 0;
  function go(i) {
    cur = (i + slides.length) % slides.length;
    for (var k = 0; k < slides.length; k++) {
      slides[k].classList.toggle('is-on', k === cur);
      if (dots[k]) dots[k].setAttribute('aria-selected', k === cur ? 'true' : 'false');
    }
  }
  for (var k = 0; k < dots.length; k++) (function (i) { dots[i].addEventListener('click', function () { go(i); }); })(k);
  var x0 = null;
  box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (x0 == null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });
})();
