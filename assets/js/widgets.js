/* 網站上會動的小工具（2026-11-15，使用者：做一些獨立的小工具截圖或真實的小工具放在網站上 —— 小工具簡單，代碼出去也無所謂）。
   抽屜裡的系統錶（App 的 aquarium/status.swift drawTri ＋ flask.swift，照同一個畫法寫一份網頁版）：
     外圈   電量（瀏覽器給得到就用真的 —— navigator.getBattery，Chrome 系才有；沒有就 82%）
     內圈   左半 CPU、右半 GPU，從下面缺口的兩端往頂上夾（網頁拿不到 —— 照拉桿模擬）
     中間   一扇圓窗，窗外是水：能耗越高水越紅、泡泡飄得越快；很燙的時候缺口裡出現「!」
   拉桿＝能耗（模擬）。沒有第三方、不存任何東西。看不到（捲走、分頁在背景）就不畫；系統設了「減少動態」就只畫一張靜止的。 */
(function () {
  var boxes = document.querySelectorAll('[data-porthole]');
  if (!boxes.length) return;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var battery = 82, charging = false;
  if (navigator.getBattery) {
    navigator.getBattery().then(function (b) {
      function up() { battery = Math.round(b.level * 100); charging = !!b.charging; }
      up(); b.addEventListener('levelchange', up); b.addEventListener('chargingchange', up);
    }).catch(function () {});
  }

  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function waterRGB(h, top) {
    var cold = [0.16, 0.52, 0.98], warm = [0.62, 0.32, 0.95], hot = [1.0, 0.32, 0.18];
    var c = h < 0.5 ? lerp(cold, warm, h / 0.5) : lerp(warm, hot, (h - 0.5) / 0.5);
    var s = 0.55 + 0.45 * top;
    return [c[0] * s, c[1] * s, c[2] * s];
  }
  function rgba(c, a) { return 'rgba(' + Math.round(c[0] * 255) + ',' + Math.round(c[1] * 255) + ',' + Math.round(c[2] * 255) + ',' + a + ')'; }
  var COOL = [0.42, 0.86, 0.94], CPU = [0.98, 0.78, 0.36], GPU = [0.74, 0.58, 1.0], HOT = [1, 0.42, 0.42];

  boxes.forEach(function (box) {
    var cv = box.querySelector('canvas'), range = box.querySelector('input[type=range]');
    var ctx = cv.getContext('2d');
    var heat = range ? +range.value / 100 : 0.3, shown = heat;
    var bubbles = [], acc = 0, t = 0, last = 0, raf = 0, seeded = false, visible = true;
    var cpu = 20, gpu = 15;

    function size() {
      var r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1;
      cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
    }
    function W() { return cv.getBoundingClientRect().width; }
    function spawn(R, y) {
      var z = 0.35 + Math.random() * 0.65;
      var r = (0.6 + 1.6 * z * z) * (0.8 + Math.random() * 0.45) * (R / 20);
      bubbles.push({ x: (Math.random() * 2 - 1) * R, y: y == null ? -r - Math.random() * 3 : y, r: r, z: z,
                     ph: Math.random() * 6.28, sp: 0.8 + Math.random() * 0.4 });
      if (bubbles.length > 90) bubbles.splice(0, bubbles.length - 90);
      bubbles.sort(function (a, b) { return a.z - b.z; });
    }
    function arc(c, r, a0, sweep, cw, v, base, col, lw) {
      var s = a0 * Math.PI / 180, e = (cw ? a0 - sweep : a0 + sweep) * Math.PI / 180;
      ctx.lineCap = 'round'; ctx.lineWidth = lw;
      ctx.strokeStyle = rgba(base, 0.13);
      ctx.beginPath(); ctx.arc(c.x, c.y, r, -s, -e, cw ? false : true); ctx.stroke();
      var f = Math.max(0, Math.min(1, v / 100));
      var end = (cw ? a0 - sweep * f : a0 + sweep * f) * Math.PI / 180;
      if (f > 0.004) {
        ctx.shadowColor = rgba(col, 0.85); ctx.shadowBlur = 6;
        ctx.strokeStyle = rgba(col, 1);
        ctx.beginPath(); ctx.arc(c.x, c.y, r, -s, -end, cw ? false : true); ctx.stroke();
        ctx.shadowBlur = 0;
      }
      var px = c.x + Math.cos(end) * r, py = c.y - Math.sin(end) * r;
      ctx.fillStyle = 'rgba(15,15,15,0.9)'; ctx.beginPath(); ctx.arc(px, py, 3.9, 0, 6.29); ctx.fill();
      ctx.fillStyle = rgba(col, 1); ctx.beginPath(); ctx.arc(px, py, 2.9, 0, 6.29); ctx.fill();
    }

    function draw() {
      var w = W(), c = { x: w / 2, y: w / 2 - 4 };
      ctx.clearRect(0, 0, w, w);
      var rr = w * 0.42, ri = rr - w * 0.075, R = rr - w * 0.13;
      var h = shown, g = Math.max(0, (h - 0.5) / 0.5);
      var hotB = battery <= 15 && !charging;
      arc(c, rr, 225, 270, true, battery, COOL, hotB ? HOT : COOL, w * 0.035);
      arc(c, ri, 225, 135, true, cpu, CPU, cpu >= 80 ? HOT : CPU, w * 0.035);
      arc(c, ri, -45, 135, false, gpu, GPU, gpu >= 80 ? HOT : GPU, w * 0.035);
      // 窗外的紅暈
      if (g > 0.01) {
        ctx.save(); ctx.shadowColor = 'rgba(255,90,50,' + (0.85 * g) + ')'; ctx.shadowBlur = 8 + 10 * g;
        ctx.fillStyle = rgba(waterRGB(h, 0.5), 1); ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, 6.29); ctx.fill(); ctx.restore();
      }
      ctx.save();
      ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, 6.29); ctx.clip();
      var gr = ctx.createLinearGradient(0, c.y - R, 0, c.y + R);
      gr.addColorStop(0, rgba(waterRGB(h, 1), 0.92)); gr.addColorStop(1, rgba(waterRGB(h, 0), 0.92));
      ctx.fillStyle = gr; ctx.fillRect(c.x - R, c.y - R, 2 * R, 2 * R);
      if (g > 0.01) {
        var rg = ctx.createRadialGradient(c.x, c.y + R * 0.9, 0, c.x, c.y + R * 0.9, R * 1.3);
        rg.addColorStop(0, 'rgba(255,158,77,' + (0.7 * g) + ')'); rg.addColorStop(1, 'rgba(255,158,77,0)');
        ctx.fillStyle = rg; ctx.fillRect(c.x - R, c.y - R, 2 * R, 2 * R);
      }
      // 一道斜斜掃過的光
      var sw = (t * (0.08 + 0.35 * h)) % 1, bx = c.x - R * 1.6 + R * 3.2 * sw;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath(); ctx.moveTo(bx - R * 0.15, c.y + R); ctx.lineTo(bx + R * 0.25, c.y + R);
      ctx.lineTo(bx + R * 0.75, c.y - R); ctx.lineTo(bx + R * 0.45, c.y - R); ctx.closePath(); ctx.fill();
      // 泡泡
      var bc = [1, 1 - 0.25 * g, 1 - 0.55 * g], speed = 0.25 + 2.15 * h * h;
      for (var i = 0; i < bubbles.length; i++) {
        var b = bubbles[i], a = 0.25 + 0.65 * b.z;
        var st = 1 + Math.min(0.4, speed * 0.12 * b.z), rw = b.r / Math.sqrt(st), rh = b.r * Math.sqrt(st);
        var x = c.x + b.x + Math.sin(b.ph) * (0.5 + 0.9 * b.z), y = c.y + R - b.y;
        ctx.beginPath(); ctx.ellipse(x, y, rw, rh, 0, 0, 6.29);
        ctx.fillStyle = rgba(bc, (0.10 + 0.22 * g) * a); ctx.fill();
        ctx.lineWidth = 0.6 + 0.5 * b.z; ctx.strokeStyle = rgba(bc, 0.85 * a); ctx.stroke();
        if (b.r > 1.8) {
          ctx.fillStyle = 'rgba(255,255,255,' + (0.8 * a) + ')';
          ctx.beginPath(); ctx.arc(x - rw * 0.45, y - rh * 0.4, b.r * 0.19, 0, 6.29); ctx.fill();
        }
      }
      // 窗玻璃的反光
      ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = Math.max(1, R * 0.09); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(c.x, c.y, R * 0.8, -160 * Math.PI / 180, -115 * Math.PI / 180); ctx.stroke();
      ctx.restore();
      ctx.lineWidth = 1;
      ctx.strokeStyle = g > 0.01 ? 'rgba(255,140,102,' + (0.25 + 0.35 * g) + ')' : 'rgba(255,255,255,0.16)';
      ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, 6.29); ctx.stroke();
      if (charging) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '600 ' + Math.round(w * 0.06) + 'px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('\u26a1', c.x, c.y + w * 0.02);
      }
      // 缺口裡：很燙、電量低、CPU／GPU 滿 → 「!」；平常寫三個數字
      var gapY = c.y + rr * 0.86;
      ctx.textAlign = 'center';
      if (hotB || h >= 0.8 || cpu >= 90 || gpu >= 90) {
        var ac = hotB ? HOT : (h >= 0.8 ? [1, 0.45, 0.25] : CPU);
        ctx.save(); ctx.shadowColor = rgba(ac, 0.8); ctx.shadowBlur = 6;
        ctx.fillStyle = rgba(ac, 1); ctx.font = '700 ' + Math.round(w * 0.085) + 'px system-ui';
        ctx.fillText('!', c.x, gapY + w * 0.05); ctx.restore();
      } else {
        ctx.font = '600 ' + Math.round(w * 0.045) + 'px system-ui';
        var parts = [[String(battery), COOL], [String(Math.round(cpu)), CPU], [String(Math.round(gpu)), GPU]];
        var tw = 0, sp = w * 0.02;
        parts.forEach(function (p) { tw += ctx.measureText(p[0]).width; });
        tw += sp * 2;
        var x0 = c.x - tw / 2;
        ctx.textAlign = 'left';
        parts.forEach(function (p) { ctx.fillStyle = rgba(p[1], 0.9); ctx.fillText(p[0], x0, gapY + w * 0.03); x0 += ctx.measureText(p[0]).width + sp; });
      }
    }

    function tick(ts) {
      raf = 0;
      var dt = last ? Math.min(0.1, (ts - last) / 1000) : 0.016;
      last = ts; t += dt;
      shown += (heat - shown) * Math.min(1, dt * 2.5);
      // CPU／GPU：照能耗模擬，加一點晃動
      cpu += ((12 + 70 * shown + Math.sin(t * 1.3) * 6) - cpu) * Math.min(1, dt * 2);
      gpu += ((8 + 88 * shown + Math.sin(t * 0.9 + 1) * 5) - gpu) * Math.min(1, dt * 2);
      var w = W(), R = w * 0.42 - w * 0.13;
      if (!seeded) { seeded = true; for (var k = 0; k < 4 + 8 * shown; k++) spawn(R, Math.random() * 2 * R); }
      acc += dt * (2 + 24 * shown);
      while (acc >= 1) { acc -= 1; spawn(R); }
      var v = R * (0.25 + 2.15 * shown * shown);
      for (var i = 0; i < bubbles.length; i++) {
        var b = bubbles[i]; b.y += v * b.sp * (0.45 + 0.55 * b.z) * dt; b.ph += dt * (3 + 5 * b.z);
      }
      bubbles = bubbles.filter(function (b) { return b.y - b.r <= 2 * R + 2; });
      draw();
      if (visible && !document.hidden && !still) raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(tick); } }

    size();
    if (range) range.addEventListener('input', function () { heat = +range.value / 100; if (still) { shown = heat; cpu = 12 + 70 * heat; gpu = 8 + 88 * heat; draw(); } else kick(); });
    window.addEventListener('resize', function () { size(); draw(); });
    document.addEventListener('visibilitychange', kick);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; kick(); }).observe(box);
    }
    if (still) { cpu = 12 + 70 * heat; gpu = 8 + 88 * heat; seeded = true; var R0 = W() * 0.29; for (var k = 0; k < 10; k++) spawn(R0, Math.random() * 2 * R0); draw(); }
    else kick();
  });
})();
