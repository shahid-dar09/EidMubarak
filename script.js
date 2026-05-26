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
(function initStars() {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  let W, H, stars = [], particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

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
];

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
  const msg = document.getElementById('wish-message');
  if (!msg) return;
  const text = msg.textContent;
  if (navigator.share) {
    navigator.share({ title: 'Eid Mubarak 🌙', text, url: window.location.href })
      .catch(() => {});
  } else {
    navigator.clipboard.writeText(text);
    showToast('📋 Message copied — share it anywhere!');
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
  const msg = document.getElementById('wish-message');
  const baseText = msg ? msg.textContent : 'Eid Mubarak! 🌙 May Allah bless you!';
  const fullText = `${baseText}\n\n✨ Create your own custom Eid wish card here:\n👉 ${window.location.href}`;
  const text = encodeURIComponent(fullText);
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
   10. CONFETTI / FIREWORKS (canvas-confetti)
   ============================================================ */
window.triggerCelebration = function() {
  if (typeof confetti === 'undefined') {
    showToast('🎉 Eid Mubarak! 🌙');
    return;
  }

  const colors = ['#d4a843', '#f0c96e', '#10b981', '#27a865', '#ffffff', '#a07830'];

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
   12. MUSIC TOGGLE
   ============================================================ */
(function initMusic() {
  const btn = document.getElementById('music-toggle');
  if (!btn) return;
  let playing = false;

  // We'll use the Web Audio API to generate a simple ambient tone
  let audioCtx = null, gainNode = null, oscillator = null;

  function startAmbient() {
    try {
      audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
      gainNode  = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 2);
      gainNode.connect(audioCtx.destination);

      // Create layered soft tones (C major arpeggio simulation)
      const freqs = [261.63, 329.63, 392.00, 523.25];
      freqs.forEach((freq, i) => {
        const osc  = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(gainNode);
        osc.start(audioCtx.currentTime + i * 0.5);
      });
    } catch(e) {
      console.log('Audio not supported:', e);
    }
  }

  function stopAmbient() {
    if (audioCtx) {
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
      setTimeout(() => { audioCtx.close(); audioCtx = null; }, 1100);
    }
  }

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
