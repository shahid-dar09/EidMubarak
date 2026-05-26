/* ============================================================
   EID MUBARAK - script.js
   Premium JavaScript — All Features
   ============================================================ */

'use strict';

/* ============================================================
   1. LOADING SCREEN
   ============================================================ */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    if (loader) loader.classList.add('hidden');
    document.body.classList.add('loaded');
    // init AOS-like scroll animations
    initScrollAnimations();
    startTyping();
    rotateBlessings();

    // Check for personalized query name (WhatsApp Viral surprise style)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const nameParam = urlParams.get('name');
      const themeParam = urlParams.get('theme');

      if (themeParam) {
        setCardTheme(themeParam);
        // Apply theme to the Hero Section background!
        const heroSection = document.getElementById('hero');
        if (heroSection) {
          if (themeParam === 'royal') {
            heroSection.style.background = 'linear-gradient(180deg, #060d1f 0%, #0a1628 50%, #1a2a4a 100%)';
          } else if (themeParam === 'ruby') {
            heroSection.style.background = 'linear-gradient(180deg, #060d1f 0%, #30060d 50%, #5c0d1e 100%)';
          } else if (themeParam === 'emerald') {
            heroSection.style.background = 'linear-gradient(180deg, #060d1f 0%, #0a1628 50%, #0d1f0f 100%)';
          }
        }
      }

      if (nameParam) {
        const cleanName = decodeURIComponent(nameParam).trim();
        if (cleanName) {
          const greetingBadge = document.getElementById('personalized-greeting');
          const greetingName  = document.getElementById('personalized-name');
          if (greetingBadge && greetingName) {
            greetingName.textContent = cleanName.toUpperCase();
            greetingBadge.classList.remove('hidden');
          }
          // Prefill name input so they can reply or create their own card easily!
          const nameInput = document.getElementById('wish-name');
          if (nameInput) nameInput.value = cleanName;
        }
      }
    } catch (e) {
      console.log('Error parsing url name/theme:', e);
    }
  }, 1800);
});

/* ============================================================
   2. CUSTOM CURSOR (desktop only)
   ============================================================ */
const cursor    = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing') || document.getElementById('cursor-ring');

let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  if (cursor) { cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px'; }
});

function animateCursorRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  if (cursorRing) { cursorRing.style.left = ringX + 'px'; cursorRing.style.top = ringY + 'px'; }
  requestAnimationFrame(animateCursorRing);
}
animateCursorRing();

document.querySelectorAll('a, button, .glass-card, .greeting-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (cursor) { cursor.style.width = '22px'; cursor.style.height = '22px'; }
    if (cursorRing) { cursorRing.style.width = '55px'; cursorRing.style.height = '55px'; cursorRing.style.opacity = '0.3'; }
  });
  el.addEventListener('mouseleave', () => {
    if (cursor) { cursor.style.width = '14px'; cursor.style.height = '14px'; }
    if (cursorRing) { cursorRing.style.width = '36px'; cursorRing.style.height = '36px'; cursorRing.style.opacity = '0.6'; }
  });
});

/* ============================================================
   3. CACHED DOM ELEMENTS, SCROLL METRICS & THROTLED SCROLL
   ============================================================ */
const progressBar = document.getElementById('scroll-progress');
const navbar      = document.getElementById('navbar');
const hamburger   = document.getElementById('hamburger');
const navLinks    = document.getElementById('nav-links');
const moon        = document.querySelector('.moon-container');
const lanterns    = Array.from(document.querySelectorAll('.lantern'));

let docHeight = 0;
let scrollY = 0;
let ticking = false;

function updateScrollMetrics() {
  docHeight = document.documentElement.scrollHeight - window.innerHeight;
}

// Initial calculation and recalculation on resize to avoid layout queries during scrolling
window.addEventListener('load', updateScrollMetrics);
window.addEventListener('resize', updateScrollMetrics);

// Consolidate scroll handlers into a single throttled passive scroll listener
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
  
  if (!ticking) {
    window.requestAnimationFrame(() => {
      // 1. Scroll progress bar
      const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      if (progressBar) progressBar.style.width = pct + '%';

      // 2. Navbar scrolled state
      if (navbar) {
        if (scrollY > 60) navbar.classList.add('scrolled');
        else              navbar.classList.remove('scrolled');
      }

      // 3. Parallax elements with hardware acceleration (translate3d)
      if (moon) {
        moon.style.transform = `translate3d(0, ${scrollY * 0.1}px, 0)`;
      }
      lanterns.forEach((l, i) => {
        l.style.transform = `translate3d(0, ${scrollY * (0.05 + i * 0.02)}px, 0)`;
      });

      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

/* ============================================================
   4. HAMBURGER MENU INTERACTION
   ============================================================ */
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

/* ============================================================
   5. STAR / PARTICLE CANVAS (OPTIMIZED 60FPS)
   ============================================================ */
/* ============================================================
   5. STAR / PARTICLE CANVAS (OPTIMIZED 60FPS WITH STARLIGHT TRAIL & MANDALAS)
   ============================================================ */
(function initStars() {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  let W, H, stars = [], particles = [];
  let mouseSparkles = [];
  let mandalas = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Sparkle generator for mouse and touch interactions
  function spawnSparkle(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Create sparkles
    for (let i = 0; i < 2; i++) {
      mouseSparkles.push({
        x: x,
        y: y,
        r: Math.random() * 1.6 + 0.8,
        vx: (Math.random() - 0.5) * 2.2,
        vy: (Math.random() - 0.5) * 2.2 - 0.5,
        alpha: 1.0,
        decay: Math.random() * 0.035 + 0.015,
        color: Math.random() > 0.5 ? '#d4a843' : '#e8f4f8'
      });
    }

    // Sparkle sound chime!
    if (window.playSparkleChime) {
      window.playSparkleChime(clientX, clientY);
    }
  }

  window.addEventListener('mousemove', e => {
    spawnSparkle(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    if (e.touches && e.touches[0]) {
      spawnSparkle(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  // Islamic Geometric Star drawing helper
  function drawIslamicStar(ctx, cx, cy, r, points = 8) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const dist = i % 2 === 0 ? r : r * 0.45;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Global hook to spawn Mandala fireworks explosions
  window.spawnMandalaExplosion = function(x, y) {
    const colors = ['#d4a843', '#f0c96e', '#10b981', '#27a865', '#ffffff', '#a07830'];
    const count = Math.random() > 0.5 ? 4 : 5;
    for (let i = 0; i < count; i++) {
      mandalas.push({
        x: x || Math.random() * W,
        y: y || Math.random() * (H * 0.55) + H * 0.1, // upper portion of screen
        r: 6,
        vr: Math.random() * 1.6 + 1.2,
        rotation: Math.random() * Math.PI * 2,
        vRotation: (Math.random() - 0.5) * 0.015 + 0.008,
        alpha: 1.0,
        decay: Math.random() * 0.012 + 0.006,
        color: colors[Math.floor(Math.random() * colors.length)],
        lineWidth: Math.random() * 0.8 + 1.0
      });
    }
  };

  // Create stars
  for (let i = 0; i < 220; i++) {
    stars.push({
      x: Math.random() * 2000,
      y: Math.random() * 2000,
      r: Math.random() * 1.8 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.002,
      twinkleOffset: Math.random() * Math.PI * 2,
    });
  }

  // Floating particles
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: Math.random() * 2000,
      y: Math.random() * 2000,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.5 + 0.1),
      alpha: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.5 ? '#d4a843' : '#10b981',
    });
  }

  let t = 0;
  function draw() {
    t += 0.01;
    ctx.clearRect(0, 0, W, H);

    // Draw stars: Optimized by removing expensive ctx.save(), ctx.restore(), and ctx.shadowBlur
    ctx.fillStyle = '#e8f4f8';
    stars.forEach(s => {
      const twinkle = 0.5 + 0.5 * Math.sin(t * s.speed * 100 + s.twinkleOffset);
      ctx.globalAlpha = (0.3 + 0.7 * twinkle) * 0.8;
      ctx.beginPath();
      ctx.arc(
        (s.x + t * 2) % W,
        (s.y + Math.sin(t * s.speed * 5) * 4) % H,
        s.r, 0, Math.PI * 2
      );
      ctx.fill();
    });

    // Draw particles: Optimized with high-perf double circle glow (core + halo) instead of slow shadowBlur
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.001;
      if (p.y < 0 || p.alpha <= 0) {
        p.x = Math.random() * W;
        p.y = H + 10;
        p.alpha = Math.random() * 0.4 + 0.1;
      }
      
      // Outer translucent halo glow
      ctx.globalAlpha = p.alpha * 0.35;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x % W, p.y, p.r * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Inner solid bright core
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x % W, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw interactive sparkles (diamond sparkles)
    for (let i = mouseSparkles.length - 1; i >= 0; i--) {
      const s = mouseSparkles[i];
      s.x += s.vx;
      s.y += s.vy;
      s.alpha -= s.decay;
      if (s.alpha <= 0) {
        mouseSparkles.splice(i, 1);
        continue;
      }
      
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      
      // Diamond Spark shape drawing
      const cx = s.x;
      const cy = s.y;
      const r = s.r * 2.8;
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r/3, cy - r/3);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx + r/3, cy + r/3);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r/3, cy + r/3);
      ctx.lineTo(cx - r, cy);
      ctx.lineTo(cx - r/3, cy - r/3);
      ctx.closePath();
      ctx.fill();
    }

    // Draw mandalas (Islamic Geometric Fireworks)
    for (let i = mandalas.length - 1; i >= 0; i--) {
      const m = mandalas[i];
      m.r += m.vr;
      m.rotation += m.vRotation;
      m.alpha -= m.decay;
      if (m.alpha <= 0) {
        mandalas.splice(i, 1);
        continue;
      }
      
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.rotation);
      ctx.globalAlpha = m.alpha;
      ctx.strokeStyle = m.color;
      ctx.lineWidth = m.lineWidth;
      
      // Layer 1: Outer circle
      ctx.beginPath();
      ctx.arc(0, 0, m.r, 0, Math.PI * 2);
      ctx.stroke();
      
      // Layer 2: 8-pointed star
      drawIslamicStar(ctx, 0, 0, m.r, 8);
      
      // Layer 3: Nested smaller star rotated
      ctx.save();
      ctx.rotate(Math.PI / 8);
      drawIslamicStar(ctx, 0, 0, m.r * 0.72, 8);
      ctx.restore();
      
      // Layer 4: Concentric middle circle
      ctx.beginPath();
      ctx.arc(0, 0, m.r * 0.4, 0, Math.PI * 2);
      ctx.stroke();
      
      // Layer 5: Inner 12-pointed star
      drawIslamicStar(ctx, 0, 0, m.r * 0.25, 12);
      
      // Layer 6: Center filled core
      ctx.beginPath();
      ctx.arc(0, 0, m.r * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = m.color;
      ctx.fill();
      
      ctx.restore();
    }

    ctx.globalAlpha = 1.0; // Reset global alpha
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ============================================================
   6. COUNTDOWN TIMER
   ============================================================ */
(function initCountdown() {
  // Next Eid al-Adha 2026 — May 27, 2026 (tomorrow!)
  const eidDate = new Date('2026-05-27T00:00:00');

  function update() {
    const now  = new Date();
    const diff = eidDate - now;

    if (diff <= 0) {
      // Eid is here!
      ['days','hours','minutes','seconds'].forEach(id => {
        const el = document.getElementById(`timer-${id}`);
        if (el) el.textContent = '00';
      });
      const label = document.getElementById('countdown-label');
      if (label) {
        label.textContent = '🌙 Eid Mubarak! The celebration is here!';
        label.style.color = 'var(--gold)';
      }
      return;
    }

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const pad = n => String(n).padStart(2, '0');
    const set = (id, val) => { const el = document.getElementById(`timer-${id}`); if (el) el.textContent = pad(val); };

    set('days', days);
    set('hours', hours);
    set('minutes', minutes);
    set('seconds', seconds);
  }

  update();
  setInterval(update, 1000);
})();

/* ============================================================
   7. WISH GENERATOR
   ============================================================ */
const WISHES = [
  "🌙 Eid Mubarak from {name}! May your heart shine brighter than the moon tonight and your soul find the peace it truly deserves.",
  "✨ Sending love from {name} — May Allah bless you with joy, health, and countless reasons to smile this blessed Eid.",
  "🕌 {name} wishes you a Eid filled with divine blessings, warm embraces, and unforgettable memories with those you love.",
  "🌺 From the heart of {name} — May the spirit of Eid bring you closer to your dreams and fill your home with laughter and light.",
  "💛 Eid greetings from {name}! May Allah accept your prayers, forgive your sins, and shower you with His infinite mercy.",
  "🌟 With love from {name} — May this Eid be a turning point, a new beginning, and a beautiful chapter in your blessed life.",
  "🎉 {name} says: Eid Mubarak! May every dua you make reach the heavens and every blessing return to you a thousandfold.",
  "🌸 Warm Eid wishes from {name} — May you be surrounded by love, wrapped in happiness, and guided always by His light.",
  "🕌 Heartfelt Eid greetings from {name} — May your home be filled with the sweet melodies of laughter, your heart with deep contentment, and your life with Allah's endless grace.",
  "🌙 {name} wishes you a magical Eid! May this holy celebration bring you peace that surpasses understanding and success in all your righteous steps.",
  "✨ From {name} to your beautiful family — May the blessings of this Eid illuminate every corner of your life and guide you to ultimate happiness.",
  "🌟 On this glorious day, {name} sends you prayers of gratitude — May Allah accept your sacrifices, fulfill your deepest duas, and surround you with blessings.",
  "🌺 Eid Mubarak from {name}! May the blessings of Allah be the soft breeze that guides your sails towards peace, health, and prosperity.",
  "💛 Sending a basket of blessings from {name} — May this Eid al-Adha bring you closer to the ones you cherish and wrap you in divine safety and joy.",
  "🎉 Double the joy, double the blessings! {name} wishes you a spectacular Eid filled with sweet treats, warm hugs, and beautiful moments.",
  "🌸 As the crescent moon glows, {name} prays for your peace — May you find comfort in your faith, strength in your heart, and boundless love in your life.",
  "🕌 {name} says: Eid Mubarak! May this auspicious day usher in a lifetime of positive changes, true friendships, and spiritual heights."
];

let currentTheme = 'emerald';

window.setCardTheme = function(theme) {
  currentTheme = theme;
  
  // Update theme buttons state in UI
  document.querySelectorAll('.theme-select-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.querySelector(`.${theme}-theme-btn`);
  if (activeBtn) activeBtn.classList.add('active');
  
  // Apply theme styling to the wish result card
  const card = document.getElementById('wish-result');
  if (card) {
    const isVisible = card.classList.contains('visible');
    card.className = `glass-card wish-result-card card-theme--${theme}`;
    if (isVisible) card.classList.add('visible');
  }
};

function generateWish() {
  const nameEl  = document.getElementById('wish-name');
  const cardEl  = document.getElementById('wish-result');
  const msgEl   = document.getElementById('wish-message');
  if (!nameEl || !cardEl || !msgEl) return;

  const name = nameEl.value.trim() || 'Your Friend';
  const template = WISHES[Math.floor(Math.random() * WISHES.length)];
  const message  = template.replace('{name}', name);

  msgEl.textContent = message;
  cardEl.classList.remove('visible');
  // Force reflow for re-animation
  void cardEl.offsetWidth;
  cardEl.classList.add('visible');
}

window.generateWish = generateWish;

// Copy wish
window.copyWish = function() {
  const msg = document.getElementById('wish-message');
  if (!msg) return;
  navigator.clipboard.writeText(msg.textContent).then(() => {
    showToast('✅ Copied to clipboard!');
  });
};

// Share wish
window.shareWish = function() {
  const nameEl  = document.getElementById('wish-name');
  const msg = document.getElementById('wish-message');
  if (!msg) return;
  
  const name = nameEl ? nameEl.value.trim() : '';
  const baseText = msg.textContent;
  
  // Construct the custom surprise URL with name and active theme parameters
  let siteUrl = window.location.origin + window.location.pathname;
  let queryParts = [];
  if (name) queryParts.push(`name=${encodeURIComponent(name)}`);
  if (currentTheme !== 'emerald') queryParts.push(`theme=${currentTheme}`);
  if (queryParts.length > 0) {
    siteUrl += `?${queryParts.join('&')}`;
  }
  
  let shareText = name 
    ? `✨ *${name}* has sent you a special Eid Mubarak surprise surprise! 🌙 Click the link below to open your surprise card:\n👉 ${siteUrl}\n\n`
    : `Create your own custom Eid wish surprise surprise here:\n👉 ${siteUrl}\n\n`;
    
  const fullMessage = shareText + `"${baseText}"`;
    
  if (navigator.share) {
    navigator.share({ 
      title: 'Eid Mubarak Surprise 🌙', 
      text: fullMessage, 
      url: siteUrl 
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(fullMessage);
    showToast('📋 Surprise link & wish copied — share it anywhere!');
  }
};

// Download wish as image
window.downloadWish = function() {
  const card = document.getElementById('wish-result');
  if (!card || typeof html2canvas === 'undefined') {
    showToast('⏳ Loading canvas library...');
    return;
  }
  html2canvas(card, {
    backgroundColor: '#060d1f',
    scale: 2,
    useCORS: true,
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'EidMubarak-Wish.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('📸 Image downloaded!');
  });
};

// Share on WhatsApp
window.shareWA = function() {
  const nameEl  = document.getElementById('wish-name');
  const msg = document.getElementById('wish-message');
  
  const name = nameEl ? nameEl.value.trim() : '';
  const baseText = msg ? msg.textContent : 'Eid Mubarak! 🌙 May Allah bless you!';
  
  // Construct the custom surprise URL with name and active theme parameters
  let siteUrl = window.location.origin + window.location.pathname;
  let queryParts = [];
  if (name) queryParts.push(`name=${encodeURIComponent(name)}`);
  if (currentTheme !== 'emerald') queryParts.push(`theme=${currentTheme}`);
  if (queryParts.length > 0) {
    siteUrl += `?${queryParts.join('&')}`;
  }
  
  // Custom viral WhatsApp prefilled text!
  let viralText = "";
  if (name) {
    viralText = `*${name}* has sent you a special Eid Mubarak surprise surprise! 🌙✨\n\n` +
                `👇 Click the blue link below to see your personalized blessing:\n` +
                `👉 ${siteUrl}\n\n` +
                `---\n` +
                `"${baseText}"`;
  } else {
    viralText = `${baseText}\n\n✨ Create your own custom Eid surprise wish here:\n👉 ${siteUrl}`;
  }
  
  const text = encodeURIComponent(viralText);
  window.open(`https://wa.me/?text=${text}`, '_blank');
};

/* ============================================================
   8. GREETING CARDS CAROUSEL
   ============================================================ */
(function initCarousel() {
  const track   = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  if (!track || !prevBtn || !nextBtn) return;

  let currentIdx = 0;
  const cards    = track.querySelectorAll('.greeting-card');
  const total    = cards.length;
  let cardWidth  = 316; // 300 + 16 gap (approx)

  function getCardWidth() {
    if (cards[0]) {
      const style = window.getComputedStyle(cards[0]);
      return cards[0].offsetWidth + parseInt(style.marginRight || 0) + 24;
    }
    return 316;
  }

  function goTo(idx) {
    cardWidth = getCardWidth();
    const max = Math.max(0, total - Math.floor(track.parentElement.offsetWidth / cardWidth));
    currentIdx = Math.max(0, Math.min(idx, max));
    track.style.transform = `translateX(-${currentIdx * cardWidth}px)`;
  }

  prevBtn.addEventListener('click', () => goTo(currentIdx - 1));
  nextBtn.addEventListener('click', () => goTo(currentIdx + 1));

  // Touch / drag support
  let startX = 0, isDragging = false, dragDelta = 0;
  track.addEventListener('mousedown',  e => { isDragging = true; startX = e.clientX; track.style.transition = 'none'; });
  track.addEventListener('mousemove',  e => { if (!isDragging) return; dragDelta = e.clientX - startX; track.style.transform = `translateX(${-currentIdx * getCardWidth() + dragDelta}px)`; });
  track.addEventListener('mouseup',    () => { track.style.transition = ''; isDragging = false; if (dragDelta < -50) goTo(currentIdx + 1); else if (dragDelta > 50) goTo(currentIdx - 1); else goTo(currentIdx); dragDelta = 0; });
  track.addEventListener('mouseleave', () => { if (isDragging) { isDragging = false; track.style.transition = ''; goTo(currentIdx); dragDelta = 0; } });

  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; track.style.transition = 'none'; }, { passive: true });
  track.addEventListener('touchmove',  e => { dragDelta = e.touches[0].clientX - startX; track.style.transform = `translateX(${-currentIdx * getCardWidth() + dragDelta}px)`; }, { passive: true });
  track.addEventListener('touchend',   () => { track.style.transition = ''; if (dragDelta < -50) goTo(currentIdx + 1); else if (dragDelta > 50) goTo(currentIdx - 1); else goTo(currentIdx); dragDelta = 0; });

  window.addEventListener('resize', () => goTo(currentIdx));
})();

/* ============================================================
   9. ISLAMIC QUOTES SLIDESHOW
   ============================================================ */
(function initQuotes() {
  const quotes = document.querySelectorAll('.quote-slide');
  if (!quotes.length) return;
  let qIdx = 0;

  function nextQuote() {
    quotes[qIdx].classList.remove('active');
    qIdx = (qIdx + 1) % quotes.length;
    quotes[qIdx].classList.add('active');
  }

  setInterval(nextQuote, 5000);
})();

/* ============================================================
   10. CONFETTI / FIREWORKS (canvas-confetti & GEOMETRIC MANDALAS)
   ============================================================ */
window.triggerCelebration = function() {
  const colors = ['#d4a843', '#f0c96e', '#10b981', '#27a865', '#ffffff', '#a07830'];

  // Spawn mathematical Islamic Geometric Mandala fireworks explosions dynamically
  if (window.spawnMandalaExplosion) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    
    // Immediate left/right explosions
    window.spawnMandalaExplosion(W * 0.25, H * 0.35);
    window.spawnMandalaExplosion(W * 0.75, H * 0.35);

    // Delayed center peak explosion
    setTimeout(() => {
      window.spawnMandalaExplosion(W * 0.5, H * 0.22);
    }, 250);

    // Secondary delayed ambient bursts
    setTimeout(() => {
      window.spawnMandalaExplosion(W * 0.35, H * 0.45);
      window.spawnMandalaExplosion(W * 0.65, H * 0.45);
    }, 500);

    // Final grand finale burst
    setTimeout(() => {
      window.spawnMandalaExplosion(W * 0.5, H * 0.38);
    }, 750);
  }

  if (typeof confetti === 'undefined') {
    showToast('🎉 Eid Mubarak! 🌙');
    return;
  }

  // Burst from left
  confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.6 }, colors });
  // Burst from right
  confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.6 }, colors });

  setTimeout(() => {
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 }, colors });
  }, 300);

  setTimeout(() => {
    confetti({
      particleCount: 60, angle: 90, spread: 360,
      origin: { y: 0.5 },
      startVelocity: 45,
      ticks: 200,
      shapes: ['star'],
      colors,
    });
  }, 600);

  // Moon-glow pulse
  const moon = document.querySelector('.moon');
  if (moon) {
    moon.style.filter = 'drop-shadow(0 0 60px rgba(240,201,110,1)) drop-shadow(0 0 120px rgba(240,201,110,0.6))';
    setTimeout(() => { moon.style.filter = ''; }, 2000);
  }

  showToast('🎉 Eid Mubarak! Celebrating with joy! 🌙');
};

/* ============================================================
   11. DARK / LIGHT THEME
   ============================================================ */
(function initTheme() {
  const btn   = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('eid-theme') || 'dark';
  if (saved === 'light') document.body.classList.add('light-mode');

  const icon  = document.getElementById('theme-icon');
  function updateIcon() {
    if (icon) icon.textContent = document.body.classList.contains('light-mode') ? '🌞' : '🌙';
  }
  updateIcon();

  if (btn) {
    btn.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const mode = document.body.classList.contains('light-mode') ? 'light' : 'dark';
      localStorage.setItem('eid-theme', mode);
      updateIcon();
    });
  }
})();

/* ============================================================
   12. MUSIC TOGGLE (PREMIUM ETHEREAL HIJAZ SYNTHESIZER & SPARKLING CHIMES)
   ============================================================ */
(function initMusic() {
  const btn = document.getElementById('music-toggle');
  if (!btn) return;
  let playing = false;

  let audioCtx = null;
  let masterGain = null;
  let filterNode = null;
  let droneOsc = null;
  let droneGain = null;
  let arpeggioTimer = null;

  // C Hijaz chords progression
  const chords = [
    [130.81, 196.00, 277.18, 329.63, 392.00], // C Hijaz (C3, G3, Db4, E4, G4)
    [130.81, 207.65, 277.18, 349.23, 415.30], // Fm/C (C3, Ab3, Db4, F4, Ab4)
    [138.59, 207.65, 277.18, 349.23, 415.30], // Db Major (Db3, Ab3, Db4, F4, Ab4)
    [130.81, 196.00, 277.18, 329.63, 392.00]  // C Hijaz
  ];

  // High-pitch shimmering wind chime scale in Hijaz mode
  const chimeScale = [
    523.25, // C5
    554.37, // Db5
    659.25, // E5
    698.46, // F5
    783.99, // G5
    830.61, // Ab5
    987.77, // B5
    1046.50, // C6
    1108.73, // Db6
    1318.51, // E6
    1396.91, // F6
    1567.98  // G6
  ];
  let lastChimeTime = 0;

  function startAmbient() {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Master output gain
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + 1.5);
      masterGain.connect(audioCtx.destination);

      // Low-pass filter for warm background drone aesthetics
      filterNode = audioCtx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(650, audioCtx.currentTime);
      filterNode.connect(masterGain);

      // Warm continuous drone base frequency (C2 = 65.41 Hz)
      droneOsc = audioCtx.createOscillator();
      droneGain = audioCtx.createGain();
      droneOsc.type = 'sine';
      droneOsc.frequency.setValueAtTime(65.41, audioCtx.currentTime);
      droneGain.gain.setValueAtTime(0, audioCtx.currentTime);
      droneGain.gain.linearRampToValueAtTime(0.018, audioCtx.currentTime + 3.0);
      
      droneOsc.connect(droneGain);
      droneGain.connect(filterNode);
      droneOsc.start();

      // Begin scheduling the rolling, breathing Hijaz pad chord arpeggiations
      let currentChordIndex = 0;
      let currentNoteIndex = 0;

      function scheduleNextNote() {
        if (!audioCtx || audioCtx.state === 'suspended') return;
        const chord = chords[currentChordIndex];
        const freq = chord[currentNoteIndex];

        const osc = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();

        // Alternates between warm sine waves and glassy triangle wave overtones
        osc.type = Math.random() > 0.45 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        osc.connect(noteGain);
        noteGain.connect(filterNode);

        const now = audioCtx.currentTime;
        noteGain.gain.setValueAtTime(0, now);
        // Soft blooming attack envelope
        noteGain.gain.linearRampToValueAtTime(0.012, now + 1.2);
        // Beautiful, slow, lingering arpeggio decay
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.start(now);
        osc.stop(now + 4.7);

        // Progress to next note
        currentNoteIndex = (currentNoteIndex + 1) % chord.length;
        if (currentNoteIndex === 0) {
          // Switch chord progression at the end of each arpeggiator cycle
          currentChordIndex = (currentChordIndex + 1) % chords.length;
        }

        arpeggioTimer = setTimeout(scheduleNextNote, 1000);
      }

      scheduleNextNote();
    } catch (e) {
      console.log('Ethereal Audio Engine start error:', e);
    }
  }

  function stopAmbient() {
    if (audioCtx) {
      if (arpeggioTimer) {
        clearTimeout(arpeggioTimer);
        arpeggioTimer = null;
      }
      
      if (masterGain) {
        masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8);
      }
      
      setTimeout(() => {
        if (audioCtx) {
          try {
            audioCtx.close();
          } catch(e) {}
          audioCtx = null;
          masterGain = null;
          filterNode = null;
          droneOsc = null;
          droneGain = null;
        }
      }, 900);
    }
  }

  // Globally wire cursor/touch diamond sparkles to play musical chime notes
  window.playSparkleChime = function(clientX, clientY) {
    if (!audioCtx || audioCtx.state === 'suspended' || !masterGain) return;
    
    // Throttle chime audio nodes (max 1 every 80ms) to ensure smooth performance
    const nowMs = Date.now();
    if (nowMs - lastChimeTime < 80) return;
    lastChimeTime = nowMs;

    const ratio = Math.max(0, Math.min(0.999, clientX / window.innerWidth));
    const noteIndex = Math.floor(ratio * chimeScale.length);
    const freq = chimeScale[noteIndex];
    const now = audioCtx.currentTime;

    try {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const chimeGain = audioCtx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);

      // Shimmering crystalline harmonic overtone detuned slightly for acoustic organic feeling
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.015, now);

      chimeGain.gain.setValueAtTime(0, now);
      chimeGain.gain.linearRampToValueAtTime(0.016, now + 0.008);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc1.connect(chimeGain);
      osc2.connect(chimeGain);
      chimeGain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.3);
      osc2.stop(now + 1.3);
    } catch(e) {
      console.log('Error triggering chime synth:', e);
    }
  };

  btn.addEventListener('click', () => {
    playing = !playing;
    const icon = btn.querySelector('i');
    if (playing) {
      btn.classList.add('playing');
      if (icon) { icon.classList.remove('fa-music'); icon.classList.add('fa-pause'); }
      btn.title = 'Pause Ambient Music';
      startAmbient();
    } else {
      btn.classList.remove('playing');
      if (icon) { icon.classList.remove('fa-pause'); icon.classList.add('fa-music'); }
      btn.title = 'Play Ambient Music';
      stopAmbient();
    }
  });
})();

/* ============================================================
   13. SCROLL REVEAL ANIMATIONS (custom AOS-like)
   ============================================================ */
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-aos]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.aosDelay || 0;
        setTimeout(() => {
          entry.target.classList.add('aos-animate');
        }, parseInt(delay));
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   14. TYPING TEXT ANIMATION
   ============================================================ */
function startTyping() {
  const el = document.getElementById('typing-text');
  if (!el) return;

  const phrases = [
    'Eid Mubarak! 🌙',
    'عيد مبارك ✨',
    'Happy Eid! 🎉',
    'Blessed Celebrations 🕌',
    'Peace & Joy 🌺',
  ];

  let pIdx = 0, cIdx = 0, deleting = false;

  function type() {
    const current = phrases[pIdx];
    if (!deleting) {
      el.textContent = current.slice(0, cIdx + 1);
      cIdx++;
      if (cIdx === current.length) {
        deleting = true;
        setTimeout(type, 1800);
        return;
      }
    } else {
      el.textContent = current.slice(0, cIdx - 1);
      cIdx--;
      if (cIdx === 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
      }
    }
    setTimeout(type, deleting ? 50 : 100);
  }
  type();
}

/* ============================================================
   15. RANDOM BLESSINGS ROTATOR
   ============================================================ */
const BLESSINGS = [
  '🌙 May Allah accept your prayers',
  '✨ Peace be upon you and your family',
  '🕌 May your heart be filled with joy',
  '💛 Wishing you a blessed Eid',
  '🌺 May Allah shower His mercy on you',
  '⭐ Taqabbal Allahu Minna Wa Minkum',
  '🎉 Eid greetings from around the world',
  '🌟 May this day bring peace to all',
];

function rotateBlessings() {
  const el = document.getElementById('blessing-text');
  if (!el) return;
  let bIdx = 0;
  setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      bIdx = (bIdx + 1) % BLESSINGS.length;
      el.textContent = BLESSINGS[bIdx];
      el.style.opacity = '1';
    }, 400);
  }, 3500);
  el.textContent = BLESSINGS[0];
}

/* ============================================================
   16. PARALLAX EFFECT (CONSOLIDATED)
   ============================================================ */
// Note: Parallax scroll event logic has been consolidated into the unified, 
// throttled passive scroll listener in Section 3 for 60FPS scroll performance.

/* ============================================================
   17. TOAST NOTIFICATION
   ============================================================ */
function showToast(msg, duration = 3000) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    Object.assign(toast.style, {
      position: 'fixed', bottom: '5rem', left: '50%', transform: 'translateX(-50%) translateY(20px)',
      background: 'rgba(6,13,31,0.95)', border: '1px solid rgba(212,168,67,0.4)',
      color: '#f0c96e', padding: '0.75rem 1.5rem', borderRadius: '50px',
      fontFamily: "'Poppins', sans-serif", fontSize: '0.9rem', fontWeight: '500',
      zIndex: '99999', backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
      transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
      opacity: '0',
    });
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, duration);
}

window.showToast = showToast;

/* ============================================================
   18. SMOOTH SCROLL FOR NAV LINKS
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ============================================================
   19. GREETING CARD COPY
   ============================================================ */
window.copyCard = function(btn) {
  const card = btn.closest('.greeting-card');
  if (!card) return;
  const msg = card.querySelector('.card-message');
  if (!msg) return;
  navigator.clipboard.writeText(msg.textContent).then(() => showToast('✅ Message copied!'));
};

/* ============================================================
   20. GALLERY LIGHTBOX (Simple)
   ============================================================ */
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const label = item.querySelector('.gallery-overlay-text');
    const text  = label ? label.textContent : 'Islamic Art';
    showToast(`🖼️ ${text}`);
  });
});

/* ============================================================
   21. HERO CTA SCROLL
   ============================================================ */
window.scrollToWish = function() {
  const section = document.getElementById('wish-section');
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ============================================================
   22. ENTER KEY on wish input
   ============================================================ */
const wishInput = document.getElementById('wish-name');
if (wishInput) {
  wishInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') generateWish();
  });
}

/* ============================================================
   23. GEOMETRIC PATTERN ANIMATION
   ============================================================ */
(function animateGeo() {
  const rings = document.querySelectorAll('.geo-ring');
  rings.forEach((ring, i) => {
    ring.style.animationDuration = `${15 + i * 8}s`;
    ring.style.animationDirection = i % 2 === 0 ? 'normal' : 'reverse';
  });
})();

/* ============================================================
   24. RANDOM CARD GLOW COLORS
   ============================================================ */
document.querySelectorAll('.greeting-card').forEach(card => {
  const glow = card.querySelector('.card-glow');
  if (!glow) return;
  const colors = ['#d4a843', '#10b981', '#f0c96e', '#27a865', '#a07830'];
  const color  = colors[Math.floor(Math.random() * colors.length)];
  glow.style.background = color;
  glow.style.right = '-30px';
  glow.style.bottom = '-30px';
});

console.log('%c🌙 Eid Mubarak! May Allah bless you!', 'color: #d4a843; font-size: 1.2rem; font-weight: bold; font-family: serif;');
