
const IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

if (IS_TOUCH) {
  document.body.classList.add('touch-device');
  document.body.style.cursor = 'auto';
  document.getElementById('cur').style.display = 'none';
} else {
  document.body.style.cursor = 'none';
}


const bgC     = document.getElementById('pixel-bg');
const bgX     = bgC.getContext('2d');
const CELL    = 24;
const DENSITY = IS_TOUCH ? 0.04 : 0.065;
let pxCells   = [];

function initBg() {
  bgC.width  = window.innerWidth;
  bgC.height = window.innerHeight;
  pxCells    = [];

  const cols    = Math.ceil(bgC.width / CELL);
  const rows    = Math.ceil(bgC.height / CELL);
  const palette = ['#7fff5f', '#c8ff80', '#ff9933', '#a8d8ff'];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() < DENSITY) {
        pxCells.push({
          x:     c * CELL,
          y:     r * CELL,
          life:  Math.random(),
          speed: 0.003 + Math.random() * 0.006,
          color: palette[Math.floor(Math.random() * palette.length)],
          sz:    Math.random() < 0.5 ? 2 : 4
        });
      }
    }
  }
}

function animBg() {
  bgX.clearRect(0, 0, bgC.width, bgC.height);
  for (const c of pxCells) {
    c.life = (c.life + c.speed) % 1;
    bgX.globalAlpha = Math.sin(c.life * Math.PI) * 0.3;
    bgX.fillStyle   = c.color;
    bgX.fillRect(c.x, c.y, c.sz, c.sz);
  }
  bgX.globalAlpha = 1;
  requestAnimationFrame(animBg);
}

initBg();
window.addEventListener('resize', initBg);
animBg();



const GC = document.getElementById('glow-canvas');
const gx = GC.getContext('2d');

function resizeGlow() {
  GC.width  = window.innerWidth;
  GC.height = window.innerHeight;
}

resizeGlow();
window.addEventListener('resize', resizeGlow);

function drawGlow(x, y, r1, r2, alpha) {
  gx.clearRect(0, 0, GC.width, GC.height);


  const grad = gx.createRadialGradient(x, y, 0, x, y, r2);
  grad.addColorStop(0,   `rgba(127,255,95,${0.13 * alpha})`);
  grad.addColorStop(0.3, `rgba(127,255,95,${0.07 * alpha})`);
  grad.addColorStop(0.7, `rgba(200,255,128,${0.025 * alpha})`);
  grad.addColorStop(1,    'rgba(0,0,0,0)');
  gx.fillStyle = grad;
  gx.fillRect(0, 0, GC.width, GC.height);

  
  const hot = gx.createRadialGradient(x, y, 0, x, y, r1 * 0.45);
  hot.addColorStop(0,   `rgba(180,255,130,${0.18 * alpha})`);
  hot.addColorStop(0.5, `rgba(127,255,95,${0.07 * alpha})`);
  hot.addColorStop(1,    'rgba(0,0,0,0)');
  gx.fillStyle = hot;
  gx.fillRect(0, 0, GC.width, GC.height);

 
  const GRID = 32;
  const gxS  = Math.max(0,         Math.floor((x - r1) / GRID) * GRID);
  const gyS  = Math.max(0,         Math.floor((y - r1) / GRID) * GRID);
  const gxE  = Math.min(GC.width,  Math.ceil((x + r1) / GRID) * GRID);
  const gyE  = Math.min(GC.height, Math.ceil((y + r1) / GRID) * GRID);

  for (let gi = gxS; gi <= gxE; gi += GRID) {
    for (let gj = gyS; gj <= gyE; gj += GRID) {
      const dist = Math.hypot(gi - x, gj - y);
      if (dist > r1) continue;
      const intensity    = Math.pow(1 - dist / r1, 2.2) * alpha;
      gx.globalAlpha     = intensity * 0.6;
      gx.fillStyle       = dist < r1 * 0.3 ? '#c8ff80' : '#7fff5f';
      gx.shadowColor     = '#7fff5f';
      gx.shadowBlur      = 4;
      gx.fillRect(gi - 1, gj - 1, 2, 2);
    }
  }
  gx.shadowBlur  = 0;
  gx.globalAlpha = 1;
}


if (!IS_TOUCH) {
  const CC = document.getElementById('cur');
  const cx = CC.getContext('2d');

  function resizeCursor() {
    CC.width  = window.innerWidth;
    CC.height = window.innerHeight;
  }
  resizeCursor();
  window.addEventListener('resize', resizeCursor);

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let theta = 0;
  let hov   = false;

  const TRAIL = [];
  const MAX_T = 32;
  const PAL   = ['#7fff5f', '#c8ff80', '#ff9933', '#a8d8ff'];

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    document.getElementById('coords').textContent =
      `X:${String(Math.round(mx)).padStart(3, '0')} Y:${String(Math.round(my)).padStart(3, '0')}`;
    TRAIL.push({ x: mx, y: my, life: 1, color: PAL[Math.floor(TRAIL.length * 0.13) % PAL.length] });
    if (TRAIL.length > MAX_T) TRAIL.shift();
    
    const el = document.elementFromPoint(mx, my);
    hov = !!(el && el.closest('button, input, a'));
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function drawDNA(ctx, x, y, r, angle, hover) {
    const N      = 8;
    const spread = hover ? r * 1.5 : r;

    for (let i = 0; i < N; i++) {
      const a  = angle + (i / N) * Math.PI * 2;
      const ax = Math.cos(a) * spread;
      const ay = Math.sin(a) * (spread * 0.38);
      const bx = Math.cos(a + Math.PI) * spread;
      const by = Math.sin(a + Math.PI) * (spread * 0.38);

      
      if (i % 2 === 0) {
        ctx.strokeStyle = 'rgba(127,255,95,0.18)';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(Math.round(x + ax), Math.round(y + ay));
        ctx.lineTo(Math.round(x + bx), Math.round(y + by));
        ctx.stroke();
      }

      ctx.fillStyle  = i % 3 === 0 ? '#7fff5f' : i % 3 === 1 ? '#c8ff80' : '#a8d8ff';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur  = 5;
      ctx.fillRect(Math.round(x + ax) - 2, Math.round(y + ay) - 2, 4, 4);

     
      ctx.fillStyle  = i % 3 === 0 ? '#ff9933' : i % 3 === 1 ? '#a8d8ff' : '#c8ff80';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur  = 5;
      ctx.fillRect(Math.round(x + bx) - 2, Math.round(y + by) - 2, 4, 4);
      ctx.shadowBlur = 0;
    }
  }

  function animCursor() {
    cx.clearRect(0, 0, CC.width, CC.height);
    theta += hov ? 0.09 : 0.045;
    rx = lerp(rx, mx, 0.22);
    ry = lerp(ry, my, 0.22);

    for (let i = 0; i < TRAIL.length; i++) {
      const t   = TRAIL[i];
      t.life   -= 0.04;
      if (t.life <= 0) continue;
      const ratio    = i / TRAIL.length;
      cx.globalAlpha = t.life * ratio * 0.65;
      cx.fillStyle   = t.color;
      const s        = Math.max(2, ratio * 9);
      cx.fillRect(Math.round(t.x - s / 2), Math.round(t.y - s / 2), Math.ceil(s), Math.ceil(s));
    }
    cx.globalAlpha = 1;

    
    drawGlow(mx, my, hov ? 200 : 140, hov ? 340 : 240, 1);

    drawDNA(cx, rx, ry, hov ? 32 : 24, theta, hov);

   
    cx.save();
    cx.translate(rx, ry);
    cx.strokeStyle = 'rgba(200,255,128,0.12)';
    cx.lineWidth   = 1;
    cx.setLineDash([4, 8]);
    cx.beginPath();
    cx.arc(0, 0, hov ? 44 : 34, 0, Math.PI * 2);
    cx.stroke();
    cx.setLineDash([]);
    cx.restore();

   
    const dx = Math.round(mx);
    const dy = Math.round(my);
    cx.fillStyle  = '#fff';
    cx.shadowColor = '#7fff5f';
    cx.shadowBlur  = 12;
    cx.fillRect(dx - 2, dy - 2, 4, 4);
    cx.shadowBlur  = 0;

    
    cx.fillStyle = 'rgba(127,255,95,0.55)';
    cx.fillRect(dx - 10, dy,      6, 1);
    cx.fillRect(dx + 5,  dy,      6, 1);
    cx.fillRect(dx,      dy - 10, 1, 6);
    cx.fillRect(dx,      dy + 5,  1, 6);

    requestAnimationFrame(animCursor);
  }

  animCursor();
}



if (IS_TOUCH) {
  const tapRipples = [];


  const burstStyle = document.createElement('style');
  burstStyle.textContent = `
    @keyframes pixelBurst {
      0%   { transform: translate(-50%,-50%) translate(0,0) scale(1); opacity: 1; }
      100% { transform: translate(-50%,-50%) translate(var(--tx),var(--ty)) scale(0); opacity: 0; }
    }
  `;
  document.head.appendChild(burstStyle);

  function spawnRipple(x, y) {
    const PAL = ['#7fff5f', '#c8ff80', '#ff9933', '#a8d8ff'];

 
    const ring  = document.createElement('div');
    const size  = 180 + Math.random() * 80;
    ring.className = 'tap-ripple';
    ring.style.cssText = `
      left: ${x}px; top: ${y}px;
      width: ${size}px; height: ${size}px;
      border: 1.5px solid ${PAL[Math.floor(Math.random() * PAL.length)]};
      box-shadow: 0 0 12px ${PAL[0]}, inset 0 0 8px rgba(127,255,95,0.08);
    `;
    document.body.appendChild(ring);

    const ring2  = document.createElement('div');
    const size2  = size * 0.55;
    ring2.className = 'tap-ripple';
    ring2.style.cssText = `
      left: ${x}px; top: ${y}px;
      width: ${size2}px; height: ${size2}px;
      border: 1px solid ${PAL[1]};
      animation-delay: 0.08s;
      box-shadow: 0 0 8px ${PAL[1]};
    `;
    document.body.appendChild(ring2);

    
    const flash = document.createElement('div');
    flash.className = 'tap-flash';
    flash.style.cssText = `
      left: ${x}px; top: ${y}px;
      width: 60px; height: 60px;
      background: radial-gradient(circle, rgba(127,255,95,0.35) 0%, rgba(127,255,95,0.1) 50%, transparent 100%);
    `;
    document.body.appendChild(flash);

  
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const dist  = 40 + Math.random() * 40;
      const tx    = Math.cos(angle) * dist;
      const ty    = Math.sin(angle) * dist;
      const col   = PAL[i % PAL.length];
      const px    = document.createElement('div');
      px.style.cssText = `
        position: fixed; width: 4px; height: 4px;
        background: ${col}; pointer-events: none; z-index: 9998;
        left: ${x}px; top: ${y}px;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 4px ${col};
        animation: pixelBurst 0.6s ease-out forwards;
        --tx: ${tx}px; --ty: ${ty}px;
        image-rendering: pixelated;
      `;
      document.body.appendChild(px);
      setTimeout(() => px.remove(), 700);
    }

   
    tapRipples.push({ x, y, life: 1 });

    
    setTimeout(() => { ring.remove(); ring2.remove(); flash.remove(); }, 950);
  }

  document.addEventListener('touchstart', e => {
    for (const t of e.changedTouches) spawnRipple(t.clientX, t.clientY);
  }, { passive: true });

  function animTapGlow() {
    gx.clearRect(0, 0, GC.width, GC.height);
    for (let i = tapRipples.length - 1; i >= 0; i--) {
      const r  = tapRipples[i];
      r.life  -= 0.022;
      if (r.life <= 0) { tapRipples.splice(i, 1); continue; }
      const ease   = Math.sin(r.life * Math.PI);
      const radius = (1 - r.life) * 200 + 60;
      drawGlow(r.x, r.y, radius * 0.6, radius, ease * r.life);
    }
    requestAnimationFrame(animTapGlow);
  }
  animTapGlow();
}



function tick() {
  document.getElementById('clock').textContent =
    new Date().toLocaleTimeString('en-GB', { hour12: false });
}
tick();
setInterval(tick, 1000);



const tabFrames = ['ERR: user_left', '> reconnecting_', '[ signal lost ]', '> awaiting input_'];
let tabIdx   = 0;
let tabTimer = null;

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    tabTimer = setInterval(() => {
      document.title = tabFrames[tabIdx++ % tabFrames.length];
    }, 650);
  } else {
    clearInterval(tabTimer);
    tabIdx         = 0;
    document.title = 'Graft Studios';
  }
});



function handleSubmit(e) {
  e.preventDefault();
  document.getElementById('nform').style.display       = 'none';
  document.getElementById('successMsg').style.display  = 'block';
}
