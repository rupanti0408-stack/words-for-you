/**
 * app.js — Words for You
 */

(function () {
  'use strict';

  // ─── DOM References ───────────────────────────────────────────────────
  const themeToggle    = document.getElementById('themeToggle');
  const themeIcon      = themeToggle.querySelector('.theme-icon');
  const themeLabel     = document.getElementById('themeLabel');
  const generateBtn    = document.getElementById('generateBtn');
  const resetBtn       = document.getElementById('resetSliders');
  const copyBtn        = document.getElementById('copyBtn');
  const downloadBtn    = document.getElementById('downloadBtn');
  const newLetterBtn   = document.getElementById('newLetterBtn');

  const recipientInput = document.getElementById('recipient');
  const situationInput = document.getElementById('situation');
  const styleSelect    = document.getElementById('letterStyle');
  const senderInput    = document.getElementById('senderName');
  const emotionBtns    = document.querySelectorAll('.emotion-btn');
  const emotionAura    = document.getElementById('emotionAura');
  const auraLabel      = document.getElementById('auraLabel');

  const letterSection  = document.getElementById('letterSection');
  const letterBg       = document.getElementById('letterBg');
  const envelopeFlap   = document.getElementById('envelopeFlap');
  const letterPaper    = document.getElementById('letterPaper');
  const letterActions  = document.getElementById('letterActions');
  const letterDate     = document.getElementById('letterDate');
  const letterGreeting = document.getElementById('letterGreeting');
  const letterBody     = document.getElementById('letterBody');
  const letterClosing  = document.getElementById('letterClosing');
  const letterSignature= document.getElementById('letterSignature');

  const sliderKeys = ['warmth','vulnerability','sadness','hope','intensity','anger','forgiveness','nostalgia'];
  const sliderDefaults = { warmth:60, vulnerability:40, sadness:30, hope:70, intensity:50, anger:30, forgiveness:50, nostalgia:40 };

  let selectedEmotions = [];   // ordered array, max 3
  let currentLetter    = null;
  let sliders          = { ...sliderDefaults };

  // ─── Theme ────────────────────────────────────────────────────────────
  function initTheme() {
    const saved = localStorage.getItem('wfy-theme') || 'light';
    applyTheme(saved);
  }

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    themeIcon.textContent  = t === 'dark' ? '☀️' : '🌙';
    themeLabel.textContent = t === 'dark' ? 'Light' : 'Dark';
  }

  themeToggle.addEventListener('click', () => {
    const curr = document.documentElement.getAttribute('data-theme');
    const next = curr === 'dark' ? 'light' : 'dark';
    localStorage.setItem('wfy-theme', next);
    applyTheme(next);
    // Shift particle color
    updateParticleColor();
  });

  // ─── Emotion Buttons — multi-select up to 3 ─────────────────────────
  emotionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const em  = btn.getAttribute('data-emotion');
      const idx = selectedEmotions.indexOf(em);

      if (idx > -1) {
        // Deselect
        selectedEmotions.splice(idx, 1);
        btn.classList.remove('active');
      } else {
        if (selectedEmotions.length >= 3) {
          shakeElement(btn);
          showToast('You can pick up to 3 emotions 💭');
          return;
        }
        selectedEmotions.push(em);
        btn.classList.add('active');
      }

      updateEmotionBadges();
      updateParticleColor();
    });
  });

  function updateEmotionBadges() {
    emotionBtns.forEach(btn => {
      const em  = btn.getAttribute('data-emotion');
      const idx = selectedEmotions.indexOf(em);
      if (idx > -1) {
        btn.setAttribute('data-order', idx + 1);
      } else {
        btn.removeAttribute('data-order');
      }
    });
  }

  // ─── Sliders ──────────────────────────────────────────────────────────
  sliderKeys.forEach(key => {
    const input = document.getElementById('slider-' + key);
    const valEl = document.getElementById('val-' + key);
    if (!input || !valEl) return;

    // Set initial filled track
    updateSliderTrack(input);

    input.addEventListener('input', () => {
      const val = parseInt(input.value, 10);
      sliders[key] = val;
      valEl.textContent = val;
      updateSliderTrack(input);
      updateAura();
    });
  });

  function updateSliderTrack(input) {
    const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
    input.style.setProperty('--val', pct + '%');
  }

  function updateAura() {
    const label  = LetterEngine.getAuraLabel(sliders);
    const colors = LetterEngine.getAuraColors(sliders);
    auraLabel.textContent = label;
    emotionAura.style.background  = `radial-gradient(circle at 38% 38%, ${colors.outer}, ${colors.inner})`;
    emotionAura.style.boxShadow   = `0 0 40px ${colors.glow}, 0 0 15px ${colors.glow}`;
  }

  resetBtn.addEventListener('click', () => {
    sliders = { ...sliderDefaults };
    sliderKeys.forEach(key => {
      const input = document.getElementById('slider-' + key);
      const valEl = document.getElementById('val-' + key);
      if (input) { input.value = sliderDefaults[key]; updateSliderTrack(input); }
      if (valEl)  valEl.textContent = sliderDefaults[key];
    });
    updateAura();
  });

  // ─── Generate ─────────────────────────────────────────────────────────
  generateBtn.addEventListener('click', () => {
    if (selectedEmotions.length === 0) {
      shakeElement(document.getElementById('emotionGrid'));
      showToast('Please choose at least one emotion first 💭');
      return;
    }

    generateBtn.disabled = true;
    generateBtn.classList.add('loading');

    setTimeout(() => {
      const result = LetterEngine.generate({
        emotions:   selectedEmotions,
        recipient:  recipientInput.value.trim(),
        situation:  situationInput.value.trim(),
        style:      styleSelect.value,
        senderName: senderInput.value.trim(),
        sliders,
      });

      currentLetter = result;
      displayLetter(result, selectedEmotions[0]);

      generateBtn.disabled = false;
      generateBtn.classList.remove('loading');
    }, 650);
  });

  function displayLetter(letter, dominantEmotion) {
    letterBg.className = 'letter-bg bg-' + dominantEmotion;

    letterDate.textContent      = letter.date;
    letterGreeting.textContent  = letter.greeting;
    letterBody.textContent      = letter.body;
    letterClosing.textContent   = letter.closing;
    letterSignature.textContent = letter.signature;

    // Reset states
    envelopeFlap.classList.remove('open');
    letterPaper.classList.remove('revealed');
    letterActions.classList.remove('visible');

    letterSection.classList.add('visible');

    setTimeout(() => {
      letterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);

    setTimeout(() => { envelopeFlap.classList.add('open'); }, 750);
    setTimeout(() => { letterPaper.classList.add('revealed'); }, 1500);
    setTimeout(() => { letterActions.classList.add('visible'); }, 2400);
  }

  // ─── Copy ─────────────────────────────────────────────────────────────
  copyBtn.addEventListener('click', () => {
    if (!currentLetter) return;
    const text = [currentLetter.date,'',currentLetter.greeting,'',currentLetter.body,'',currentLetter.closing,currentLetter.signature].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      showToast('Letter copied to clipboard ✨');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Letter copied ✨');
    });
  });

  // ─── New Letter ───────────────────────────────────────────────────────
  newLetterBtn.addEventListener('click', () => {
    letterSection.classList.remove('visible');
    letterPaper.classList.remove('revealed');
    envelopeFlap.classList.remove('open');
    letterActions.classList.remove('visible');
    currentLetter = null;
    document.querySelector('.main-layout').scrollIntoView({ behavior: 'smooth', block: 'start' });
    recipientInput.value = '';
    situationInput.value = '';
    senderInput.value    = '';
    emotionBtns.forEach(b => {
      b.classList.remove('active');
      b.removeAttribute('data-order');
    });
    selectedEmotions = [];
    updateParticleColor();
  });

  // ─── Shake helper ─────────────────────────────────────────────────────
  function shakeElement(el) {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'shake 0.4s ease';
    el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
  }

  // ─── Toast ────────────────────────────────────────────────────────────
  function showToast(msg) {
    const ex = document.querySelector('.toast');
    if (ex) ex.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    toast.style.cssText = `
      position:fixed; bottom:2rem; left:50%;
      transform:translateX(-50%) translateY(20px);
      background:var(--surface); border:1.5px solid var(--border);
      color:var(--text); padding:0.75rem 1.6rem;
      border-radius:50px; font-family:'Lato',sans-serif; font-size:0.9rem;
      box-shadow:0 4px 24px var(--shadow-deep); z-index:9999;
      opacity:0; transition:all 0.3s ease; backdrop-filter:blur(12px);
      -webkit-backdrop-filter:blur(12px);
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    }));
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ─── Inject keyframes ─────────────────────────────────────────────────
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes shake {
      0%,100%{ transform:translateX(0); }
      20%{ transform:translateX(-6px); }
      40%{ transform:translateX(6px); }
      60%{ transform:translateX(-4px); }
      80%{ transform:translateX(4px); }
    }
  `;
  document.head.appendChild(styleEl);

  // ─── Download as Image ───────────────────────────────────────────────
  const dlOverlay = document.getElementById('dlOverlay');
  const dlPhrase  = document.getElementById('dlPhrase');

  const DL_PHRASES = [
    'may your words reach the right person',
    'folding your feelings into the page…',
    'sealing this with quiet sincerity…',
    'sending warmth across the distance…',
    'wrapping your heart in ink and paper…',
    'every word you wrote matters…',
    'this letter carries more than words…',
    'the right words always find their way…',
  ];

  // Emotion → background gradient stops for the downloaded image
  const DL_BG_COLORS = {
    love:        ['#fde8ee', '#ffd0dc'],
    grief:       ['#dce8f5', '#c8d8ee'],
    apology:     ['#ecddf5', '#ddc8f0'],
    gratitude:   ['#fdf0d0', '#f5e0a8'],
    longing:     ['#d0eef8', '#b8e0f2'],
    hope:        ['#d8f0d8', '#c0e8c0'],
    anger:       ['#fce0d5', '#f5c8b8'],
    anxiety:     ['#e0ddf5', '#ccc8ee'],
    pride:       ['#fdf0c0', '#f5e098'],
    forgiveness: ['#d5f0e8', '#b8e8d8'],
  };

  const DL_BG_DARK = {
    love:        ['#3a0e1a', '#2a0812'],
    grief:       ['#0e1a32', '#081228'],
    apology:     ['#200a32', '#180628'],
    gratitude:   ['#281800', '#1e1200'],
    longing:     ['#081830', '#041025'],
    hope:        ['#081a0a', '#041205'],
    anger:       ['#300800', '#220400'],
    anxiety:     ['#0e0e28', '#080820'],
    pride:       ['#201400', '#180e00'],
    forgiveness: ['#081e12', '#04140c'],
  };

  function showDownloadOverlay() {
    let pi = 0;
    dlPhrase.textContent = DL_PHRASES[pi];
    dlOverlay.classList.add('active');
    dlOverlay.removeAttribute('aria-hidden');
    // Cycle phrases every 1.8s
    return setInterval(() => {
      dlPhrase.style.opacity = '0';
      setTimeout(() => {
        pi = (pi + 1) % DL_PHRASES.length;
        dlPhrase.textContent = DL_PHRASES[pi];
        dlPhrase.style.transition = 'opacity 0.5s ease';
        dlPhrase.style.opacity = '1';
      }, 350);
    }, 1800);
  }

  function hideDownloadOverlay(intervalId) {
    clearInterval(intervalId);
    dlOverlay.classList.remove('active');
    dlOverlay.setAttribute('aria-hidden', 'true');
  }

  downloadBtn.addEventListener('click', () => {
    if (!currentLetter) return;
    const phraseInterval = showDownloadOverlay();
    // Give the overlay a moment to render before the heavy canvas work
    setTimeout(() => {
      try {
        drawLetterImage(currentLetter, selectedEmotions[0] || 'hope');
      } finally {
        setTimeout(() => hideDownloadOverlay(phraseInterval), 600);
      }
    }, 400);
  });

  function drawLetterImage(letter, emotion) {
    const isDark   = document.documentElement.getAttribute('data-theme') === 'dark';

    // Landscape frame: fixed width, height grows to fit the letter so nothing
    // is ever cropped, no matter how long the generated letter turns out to be.
    const W  = 1400;
    const cx = document.createElement('canvas');
    cx.width  = W;
    cx.height = 10; // placeholder — only used to get a context for text measurement
    const c   = cx.getContext('2d');

    // ── Layout constants ─────────────────────────────────────────────
    const TOP_MARGIN    = 70;
    const PAPER_ENV_GAP = 50;
    const BOTTOM_MARGIN = 110; // room for the envelope + footer text below

    const PAP_W   = 980;
    const PAP_PAD = 60;
    const PAP_X   = (W - PAP_W) / 2;

    const FONT_BODY = 24;
    const LINE_H    = FONT_BODY * 1.85;

    // Measure body lines using the wide (landscape) paper width
    c.font = `500 ${FONT_BODY}px "Dancing Script", cursive`;
    const bodyLines   = wrapText(c, letter.body, PAP_W - PAP_PAD * 2);
    const PAP_H_INNER = 60 + LINE_H * 1.5        // date + greeting
                      + LINE_H * bodyLines.length // body
                      + LINE_H * 2.5;             // closing + signature
    const PAP_H = PAP_H_INNER + PAP_PAD * 2;
    const PAP_Y = TOP_MARGIN;

    // Envelope sits below the paper, scaled for the landscape layout
    const ENV_W  = 460;
    const ENV_H  = 260;
    const ENV_X  = (W - ENV_W) / 2;
    const ENV_Y  = PAP_Y + PAP_H + PAPER_ENV_GAP;
    const FLAP_H = 130;

    // Total height grows with content — the letter is never cropped,
    // even if it runs long.
    const H = ENV_Y + ENV_H + BOTTOM_MARGIN;
    cx.height = H; // resizing clears the canvas, but we haven't drawn yet

    // ── Background gradient ──────────────────────────────────────────
    const bgStops  = isDark
      ? (DL_BG_DARK[emotion]  || DL_BG_DARK.hope)
      : (DL_BG_COLORS[emotion] || DL_BG_COLORS.hope);

    const bgGrad = c.createLinearGradient(0, 0, W * 0.6, H);
    bgGrad.addColorStop(0, bgStops[0]);
    bgGrad.addColorStop(1, bgStops[1]);
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, W, H);

    // Soft radial vignette
    const vig = c.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, Math.max(W, H)*0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.08)');
    c.fillStyle = vig;
    c.fillRect(0, 0, W, H);

    // Grain texture — scaled to the actual canvas area
    const grainCount = Math.round((W * H) / 220);
    for (let i = 0; i < grainCount; i++) {
      const gx = Math.random() * W;
      const gy = Math.random() * H;
      const ga = Math.random() * (isDark ? 0.06 : 0.03);
      c.fillStyle = `rgba(128,128,128,${ga})`;
      c.fillRect(gx, gy, 1, 1);
    }

    // ── Envelope ──────────────────────────────────────────────────────
    const envGrad = c.createLinearGradient(ENV_X, ENV_Y, ENV_X + ENV_W, ENV_Y + ENV_H);
    envGrad.addColorStop(0, isDark ? '#2a3c1e' : '#dde8c8');
    envGrad.addColorStop(1, isDark ? '#162410' : '#aec090');
    roundRect(c, ENV_X, ENV_Y, ENV_W, ENV_H, 6);
    c.fillStyle = envGrad;
    c.fill();
    c.strokeStyle = isDark ? 'rgba(100,160,80,0.3)' : 'rgba(80,130,60,0.25)';
    c.lineWidth = 1.5;
    c.stroke();

    // Envelope fold lines (left & right triangles)
    c.save();
    c.beginPath();
    c.moveTo(ENV_X, ENV_Y);
    c.lineTo(ENV_X + ENV_W / 2, ENV_Y + ENV_H * 0.55);
    c.lineTo(ENV_X + ENV_W, ENV_Y);
    c.strokeStyle = isDark ? 'rgba(100,160,80,0.18)' : 'rgba(80,130,60,0.18)';
    c.lineWidth = 1;
    c.stroke();

    c.beginPath();
    c.moveTo(ENV_X, ENV_Y + ENV_H);
    c.lineTo(ENV_X + ENV_W / 2, ENV_Y + ENV_H * 0.55);
    c.lineTo(ENV_X + ENV_W, ENV_Y + ENV_H);
    c.stroke();
    c.restore();

    // Open flap (rotated back — showing inside)
    c.save();
    c.translate(ENV_X + ENV_W / 2, ENV_Y);
    c.beginPath();
    c.moveTo(-ENV_W / 2, 0);
    c.lineTo(0, -FLAP_H);
    c.lineTo(ENV_W / 2, 0);
    c.closePath();
    const flapGrad = c.createLinearGradient(0, -FLAP_H, 0, 0);
    flapGrad.addColorStop(0, isDark ? '#1a2e14' : '#c8d8a8');
    flapGrad.addColorStop(1, isDark ? '#243820' : '#dde8c8');
    c.fillStyle = flapGrad;
    c.fill();
    c.strokeStyle = isDark ? 'rgba(100,160,80,0.2)' : 'rgba(80,130,60,0.2)';
    c.lineWidth = 1;
    c.stroke();

    // Wax seal on flap
    const sealR = 22;
    c.beginPath();
    c.arc(0, -FLAP_H * 0.45, sealR, 0, Math.PI * 2);
    const sealGrad = c.createRadialGradient(-4, -FLAP_H*0.45 - 4, 2, 0, -FLAP_H*0.45, sealR);
    sealGrad.addColorStop(0, isDark ? '#b0c870' : '#a8b86a');
    sealGrad.addColorStop(1, isDark ? '#607840' : '#7a9050');
    c.fillStyle = sealGrad;
    c.fill();
    c.font = `${sealR * 1.0}px serif`;
    c.fillStyle = isDark ? 'rgba(200,230,150,0.9)' : 'rgba(255,255,255,0.85)';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('✦', 0, -FLAP_H * 0.45);
    c.restore();

    // ── Letter paper ──────────────────────────────────────────────────
    // Paper shadow
    c.save();
    c.shadowColor  = 'rgba(0,0,0,0.3)';
    c.shadowBlur   = 40;
    c.shadowOffsetY = 15;
    roundRect(c, PAP_X, PAP_Y, PAP_W, PAP_H, 4);
    c.fillStyle = isDark ? '#141e12' : '#f9fbf5';
    c.fill();
    c.restore();

    // Paper border
    c.save();
    roundRect(c, PAP_X, PAP_Y, PAP_W, PAP_H, 4);
    c.strokeStyle = isDark ? 'rgba(100,160,80,0.15)' : 'rgba(80,150,60,0.12)';
    c.lineWidth = 1;
    c.stroke();
    c.restore();

    // Horizontal ruled lines
    const lineColor = isDark ? 'rgba(80,130,60,0.12)' : 'rgba(80,150,60,0.1)';
    const lineStart = PAP_Y + PAP_PAD + 36;
    for (let ly = lineStart; ly < PAP_Y + PAP_H - 20; ly += 31) {
      c.beginPath();
      c.moveTo(PAP_X + 16, ly);
      c.lineTo(PAP_X + PAP_W - 16, ly);
      c.strokeStyle = lineColor;
      c.lineWidth = 0.8;
      c.stroke();
    }

    // Red margin line
    c.beginPath();
    c.moveTo(PAP_X + 58, PAP_Y);
    c.lineTo(PAP_X + 58, PAP_Y + PAP_H);
    c.strokeStyle = isDark ? 'rgba(200,80,70,0.1)' : 'rgba(220,80,70,0.1)';
    c.lineWidth = 1;
    c.stroke();

    // Watermark
    c.save();
    c.globalAlpha = 0.035;
    c.font = `160px 'Playfair Display', serif`;
    c.fillStyle = isDark ? '#88bb78' : '#7a9e6e';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('✦', W / 2, PAP_Y + PAP_H / 2);
    c.restore();

    // Page-curl shadow bottom-right
    c.save();
    const curlGrad = c.createRadialGradient(
      PAP_X + PAP_W, PAP_Y + PAP_H, 0,
      PAP_X + PAP_W, PAP_Y + PAP_H, 55
    );
    curlGrad.addColorStop(0, 'rgba(0,0,0,0.18)');
    curlGrad.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = curlGrad;
    c.fillRect(PAP_X + PAP_W - 55, PAP_Y + PAP_H - 55, 55, 55);
    c.restore();

    // ── Letter text ─────────────────────────────────────────────────
    const accentCol  = isDark ? '#88bb78' : '#7a9e6e';
    const textCol    = isDark ? '#daebd2' : '#252e20';
    const mutedCol   = isDark ? '#5a7852' : '#8a9985';
    const secondCol  = isDark ? '#96b88a' : '#546050';

    let ty = PAP_Y + PAP_PAD;

    // Date
    c.font = `300 14px "Josefin Sans", sans-serif`;
    c.fillStyle = mutedCol;
    c.textAlign = 'right';
    c.textBaseline = 'top';
    c.fillText(letter.date.toUpperCase(), PAP_X + PAP_W - PAP_PAD, ty);
    ty += 36;

    // Greeting
    c.font = `600 28px "Cormorant Garamond", serif`;
    c.fillStyle = textCol;
    c.textAlign = 'left';
    c.fillText(letter.greeting, PAP_X + PAP_PAD, ty);
    ty += LINE_H * 1.4;

    // Body
    c.font = `500 ${FONT_BODY}px "Dancing Script", cursive`;
    c.fillStyle = textCol;
    bodyLines.forEach(line => {
      c.fillText(line, PAP_X + PAP_PAD, ty);
      ty += LINE_H;
    });
    ty += LINE_H * 0.5;

    // Closing
    c.font = `italic 400 20px "Cormorant Garamond", serif`;
    c.fillStyle = secondCol;
    c.fillText(letter.closing, PAP_X + PAP_PAD, ty);
    ty += LINE_H * 1.1;

    // Signature
    c.font = `700 34px "Dancing Script", cursive`;
    c.fillStyle = accentCol;
    c.fillText(letter.signature, PAP_X + PAP_PAD, ty);

    // Signature underline
    const sigW = c.measureText(letter.signature).width;
    const sigGrad = c.createLinearGradient(PAP_X + PAP_PAD, 0, PAP_X + PAP_PAD + sigW, 0);
    sigGrad.addColorStop(0, accentCol);
    sigGrad.addColorStop(1, 'transparent');
    c.beginPath();
    c.moveTo(PAP_X + PAP_PAD, ty + 38);
    c.lineTo(PAP_X + PAP_PAD + sigW, ty + 38);
    c.strokeStyle = sigGrad;
    c.lineWidth = 1.5;
    c.stroke();

    // ── Branding footer ─────────────────────────────────────────────
    c.font = `300 13px "Josefin Sans", sans-serif`;
    c.fillStyle = isDark ? 'rgba(136,187,120,0.35)' : 'rgba(80,130,60,0.3)';
    c.textAlign = 'center';
    c.textBaseline = 'bottom';
    c.fillText('WORDS FOR YOU  ✦  when you know what you feel', W / 2, H - 28);

    // ── Download ─────────────────────────────────────────────────────
    const link    = document.createElement('a');
    link.download = 'words-for-you.png';
    link.href     = cx.toDataURL('image/png');
    link.click();
  }

  // ── Helpers ─────────────────────────────────────────────────────────
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function wrapText(ctx, text, maxWidth) {
    const paragraphs = text.split('\n');
    const lines = [];
    paragraphs.forEach(para => {
      if (!para.trim()) { lines.push(''); return; }
      const words = para.split(' ');
      let line = '';
      words.forEach(word => {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      });
      if (line) lines.push(line);
    });
    return lines;
  }

  // ─── Leaf Canvas ──────────────────────────────────────────────────────
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');
  let leaves   = [];
  let leafColor = { r:110, g:145, b:85 };

  // Emotion → leaf tint
  const EMOTION_COLORS = {
    love:[232,116,138], grief:[112,144,184], apology:[155,114,176],
    gratitude:[192,144,64], longing:[90,154,170], hope:[106,170,112],
    anger:[200,88,64], anxiety:[120,120,168], pride:[184,144,48],
    forgiveness:[104,168,136],
  };

  function updateParticleColor() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (selectedEmotions.length === 0) {
      leafColor = dark ? { r:100, g:155, b:80 } : { r:110, g:145, b:85 };
      return;
    }
    // Blend all selected emotion colors equally
    let r = 0, g = 0, b = 0;
    selectedEmotions.forEach(em => {
      const col = EMOTION_COLORS[em] || [110, 145, 85];
      r += col[0]; g += col[1]; b += col[2];
    });
    const n = selectedEmotions.length;
    leafColor = { r: Math.round(r/n), g: Math.round(g/n), b: Math.round(b/n) };
  }

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /* ── Leaf shape library ─────────────────────────────────────────────
     Each shape is a function(ctx, size) that draws a unit leaf centred
     at (0,0). We have 5 distinct dry-leaf silhouettes.
  ─────────────────────────────────────────────────────────────────── */
  const LEAF_SHAPES = [

    // 1 — Classic oval leaf with pointed tip
    function(ctx, s) {
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo( s * 0.6, -s * 0.5,  s * 0.7,  s * 0.4,  0,  s);
      ctx.bezierCurveTo(-s * 0.7,  s * 0.4, -s * 0.6, -s * 0.5,  0, -s);
      ctx.closePath();
      // mid-rib
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.05, 0, 0, s);
    },

    // 2 — Oak-style lobed leaf
    function(ctx, s) {
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo( s * 0.2, -s * 0.7,  s * 0.55, -s * 0.5,  s * 0.45, -s * 0.2);
      ctx.bezierCurveTo( s * 0.7, -s * 0.3,  s * 0.65,  s * 0.0,  s * 0.4,   s * 0.1);
      ctx.bezierCurveTo( s * 0.65, s * 0.1,  s * 0.55,  s * 0.5,  s * 0.25,  s * 0.5);
      ctx.bezierCurveTo( s * 0.3,  s * 0.7,  s * 0.1,   s * 0.85, 0,         s);
      ctx.bezierCurveTo(-s * 0.1,  s * 0.85,-s * 0.3,   s * 0.7, -s * 0.25,  s * 0.5);
      ctx.bezierCurveTo(-s * 0.55, s * 0.5, -s * 0.65,  s * 0.1, -s * 0.4,   s * 0.1);
      ctx.bezierCurveTo(-s * 0.65, s * 0.0, -s * 0.7,  -s * 0.3, -s * 0.45, -s * 0.2);
      ctx.bezierCurveTo(-s * 0.55,-s * 0.5, -s * 0.2,  -s * 0.7,  0,         -s);
      ctx.closePath();
    },

    // 3 — Maple-style 5-pointed leaf (simplified)
    function(ctx, s) {
      const pts = [
        [0, -s],
        [s*0.25, -s*0.5], [s*0.7, -s*0.45],
        [s*0.45, -s*0.05], [s*0.65, s*0.45],
        [s*0.1, s*0.25],   [0, s],
        [-s*0.1, s*0.25],  [-s*0.65, s*0.45],
        [-s*0.45,-s*0.05], [-s*0.7, -s*0.45],
        [-s*0.25,-s*0.5],
      ];
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i-1], curr = pts[i];
        const mx = (prev[0]+curr[0])/2, my = (prev[1]+curr[1])/2;
        ctx.quadraticCurveTo(prev[0], prev[1], mx, my);
      }
      ctx.closePath();
    },

    // 4 — Long thin willow leaf
    function(ctx, s) {
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo( s*0.25, -s*0.4,  s*0.3,  s*0.4,  0,  s);
      ctx.bezierCurveTo(-s*0.3,   s*0.4, -s*0.25, -s*0.4,  0, -s);
      ctx.closePath();
    },

    // 5 — Round autumn leaf with notch
    function(ctx, s) {
      ctx.beginPath();
      ctx.moveTo(0, -s*0.1);
      ctx.bezierCurveTo(-s*0.15, -s*0.5,  -s*0.7, -s*0.6,  -s*0.65, -s*0.1);
      ctx.bezierCurveTo(-s*0.8,   s*0.15, -s*0.5,  s*0.7,   0,        s*0.75);
      ctx.bezierCurveTo( s*0.5,   s*0.7,   s*0.8,  s*0.15,  s*0.65, -s*0.1);
      ctx.bezierCurveTo( s*0.7,  -s*0.6,   s*0.15,-s*0.5,   0,       -s*0.1);
      ctx.closePath();
      // stem
      ctx.moveTo(0, -s*0.1);
      ctx.lineTo(0, -s);
    },
  ];

  function createLeaf() {
    const shapeIndex = Math.floor(Math.random() * LEAF_SHAPES.length);
    const size       = 8 + Math.random() * 14;          // leaf half-size px
    const startSide  = Math.random();                    // which edge to spawn from
    let x, y;
    if (startSide < 0.7) {
      // mostly from top
      x = Math.random() * canvas.width;
      y = -size * 2;
    } else if (startSide < 0.85) {
      // left edge
      x = -size * 2;
      y = Math.random() * canvas.height * 0.6;
    } else {
      // right edge
      x = canvas.width + size * 2;
      y = Math.random() * canvas.height * 0.6;
    }
    return {
      x, y, size,
      shapeIndex,
      // gentle rightward wind + gravity-like slow fall
      vx:  0.3 + Math.random() * 0.7,
      vy:  0.5 + Math.random() * 0.9,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.035,   // tumble speed
      sway: Math.random() * Math.PI * 2,          // horizontal sway phase
      swaySpeed: 0.012 + Math.random() * 0.018,
      swayAmt: 0.4 + Math.random() * 0.6,         // sway amplitude
      // 3-D tilt simulation: scale Y between 0.3 and 1 to mimic flip
      tiltPhase: Math.random() * Math.PI * 2,
      tiltSpeed: 0.018 + Math.random() * 0.025,
      alpha: 0.18 + Math.random() * 0.14,
      // each leaf gets a slightly varied tint
      tintShift: (Math.random() - 0.5) * 30,
    };
  }

  function initLeaves() {
    // scatter initial leaves across the whole screen so it's not empty on load
    leaves = Array.from({ length: 15 }, () => {
      const l = createLeaf();
      // random starting position anywhere on screen
      l.x = Math.random() * canvas.width;
      l.y = Math.random() * canvas.height;
      return l;
    });
  }

  function drawLeaf(leaf) {
    const { r, g, b } = leafColor;
    // Slight per-leaf colour variation (warmer/cooler)
    const rr = Math.min(255, Math.max(0, r + leaf.tintShift));
    const gg = Math.min(255, Math.max(0, g + leaf.tintShift * 0.4));
    const bb = Math.min(255, Math.max(0, b - leaf.tintShift * 0.2));

    // 3-D tilt: compress Y to simulate the leaf rotating in 3-D
    const tiltY = Math.abs(Math.cos(leaf.tiltPhase));  // 0 → 1

    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.rot);
    ctx.scale(1, 0.3 + tiltY * 0.7);   // squish vertically when edge-on
    ctx.globalAlpha = leaf.alpha * (0.3 + tiltY * 0.35);

    const shape = LEAF_SHAPES[leaf.shapeIndex];

    // Main leaf fill
    ctx.fillStyle = `rgba(${Math.round(rr)},${Math.round(gg)},${Math.round(bb)},1)`;
    shape(ctx, leaf.size);
    ctx.fill();

    // Slightly darker stroke for definition
    ctx.strokeStyle = `rgba(${Math.round(rr*0.6)},${Math.round(gg*0.55)},${Math.round(bb*0.45)},0.6)`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Vein / rib — lighter line
    ctx.strokeStyle = `rgba(${Math.min(255,Math.round(rr*1.3))},${Math.min(255,Math.round(gg*1.2))},${Math.min(255,Math.round(bb*1.1))},0.35)`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(0, -leaf.size);
    ctx.quadraticCurveTo(leaf.size * 0.06, 0, 0, leaf.size);
    ctx.stroke();

    ctx.restore();
  }

  function animateLeaves() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    leaves.forEach((l, i) => {
      // physics
      l.sway      += l.swaySpeed;
      l.tiltPhase += l.tiltSpeed;
      l.rot       += l.rotSpeed;
      l.x         += l.vx + Math.sin(l.sway) * l.swayAmt;
      l.y         += l.vy + Math.cos(l.sway * 0.7) * 0.3;

      // recycle when off-screen
      const margin = l.size * 3;
      if (l.y > canvas.height + margin ||
          l.x > canvas.width + margin  ||
          l.x < -margin) {
        leaves[i] = createLeaf();
        return;
      }

      drawLeaf(l);
    });

    requestAnimationFrame(animateLeaves);
  }

  resizeCanvas();
  initLeaves();
  animateLeaves();
  window.addEventListener('resize', resizeCanvas);

  // ─── Init ─────────────────────────────────────────────────────────────
  initTheme();
  updateAura();
  updateParticleColor();

})();