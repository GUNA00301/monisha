// Generates an offline-ready, standalone, single-file HTML keepsake under 25KB

export function generateSingleFileHtml(customPhotoUrl?: string | null): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Happy 21st Birthday, Monisha! ✨</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: radial-gradient(ellipse at 50% 0%, #1e133d 0%, #120a2a 45%, #080415 100%);
      color: #f1f5f9;
      min-height: 100vh;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }
    .font-fraunces { font-family: 'Fraunces', Georgia, serif; }
    .font-caveat { font-family: 'Caveat', cursive, sans-serif; }
    
    /* Stars Canvas */
    #stars-bg {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 1;
    }
    #confetti-canvas {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 999;
    }

    .wrapper {
      position: relative;
      z-index: 10;
      max-width: 680px;
      margin: 0 auto;
      padding: 24px 16px 80px 16px;
    }

    /* Gift Gate Screen */
    #gift-gate {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
      background: radial-gradient(ellipse at 50% 30%, #2a1b4e 0%, #120926 70%, #080414 100%);
      transition: opacity 0.8s ease, transform 0.8s ease;
    }
    #gift-gate.hidden-gate {
      opacity: 0;
      transform: scale(1.08);
      pointer-events: none;
    }

    .gift-box {
      width: 140px;
      height: 140px;
      position: relative;
      cursor: pointer;
      margin: 28px 0;
      animation: bounce 2.4s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95);
      filter: drop-shadow(0 12px 30px rgba(244, 114, 182, 0.35));
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      25% { transform: translateY(-16px) rotate(-3deg); }
      50% { transform: translateY(0); }
      75% { transform: translateY(-8px) rotate(2deg); }
    }

    .btn-primary {
      background: linear-gradient(135deg, #ec4899, #a855f7);
      color: #fff;
      border: none;
      padding: 14px 28px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 9999px;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(236, 72, 153, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-primary:active { transform: scale(0.96); }

    /* Card styling */
    .glass-card {
      background: rgba(26, 17, 51, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(244, 114, 182, 0.2);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 32px;
      box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
    }

    .gradient-text {
      background: linear-gradient(135deg, #fbcfe8, #f472b6, #c084fc, #93c5fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Flip Card Grid */
    .flip-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-top: 16px;
    }
    @media (min-width: 520px) {
      .flip-grid { grid-template-columns: 1fr 1fr; }
    }

    .flip-card {
      perspective: 1000px;
      min-height: 200px;
      cursor: pointer;
    }
    .flip-inner {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 200px;
      transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
      transform-style: preserve-3d;
    }
    .flip-card.flipped .flip-inner {
      transform: rotateY(180deg);
    }
    .flip-front, .flip-back {
      position: absolute;
      inset: 0;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      border-radius: 18px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 1px solid rgba(244, 114, 182, 0.2);
    }
    .flip-front {
      background: rgba(30, 19, 58, 0.85);
    }
    .flip-back {
      background: linear-gradient(145deg, rgba(46, 21, 74, 0.95), rgba(28, 14, 56, 0.95));
      transform: rotateY(180deg);
      border-color: rgba(244, 114, 182, 0.45);
    }

    /* Polaroid */
    .polaroid {
      background: #fdfbf7;
      color: #1e1b4b;
      padding: 16px 16px 24px 16px;
      border-radius: 8px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.6);
      transform: rotate(-1.5deg);
      transition: transform 0.3s;
      max-width: 380px;
      margin: 0 auto;
    }
    .polaroid:hover {
      transform: rotate(0deg) scale(1.02);
    }
    .polaroid-img-box {
      width: 100%;
      aspect-ratio: 1/1;
      background: #18112e;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #cbd5e1;
      cursor: pointer;
    }

    /* Letter */
    .letter-parchment {
      background: #fdfbf7;
      color: #1e1b4b;
      border-radius: 16px;
      padding: 28px;
      position: relative;
      box-shadow: 0 16px 40px rgba(0,0,0,0.5);
    }

    /* Modal */
    #finale-modal {
      position: fixed;
      inset: 0;
      z-index: 100;
      background: rgba(8, 4, 21, 0.85);
      backdrop-filter: blur(12px);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    #finale-modal.show { display: flex; }
    .modal-box {
      background: linear-gradient(145deg, #241445, #140b2a);
      border: 1px solid rgba(244, 114, 182, 0.35);
      border-radius: 24px;
      max-width: 520px;
      width: 100%;
      padding: 32px 24px;
      text-align: center;
      position: relative;
      box-shadow: 0 25px 60px rgba(0,0,0,0.7);
    }

    @keyframes flame-anim {
      0%, 100% { transform: scale(1) skewX(0deg); opacity: 0.95; }
      50% { transform: scale(1.1, 0.92) skewX(3deg); opacity: 0.85; }
    }
    .candle-flame {
      animation: flame-anim 0.6s infinite ease-in-out;
      transform-origin: bottom center;
    }
    .flame-extinguished { display: none !important; }

    @media (prefers-reduced-motion: reduce) {
      *, .gift-box, .candle-flame { animation: none !important; }
    }
  </style>
</head>
<body>
  <canvas id="stars-bg"></canvas>
  <canvas id="confetti-canvas"></canvas>

  <!-- 1. Gift Gate Intro -->
  <div id="gift-gate">
    <div style="font-size: 14px; letter-spacing: 2px; text-transform: uppercase; color: #f472b6; margin-bottom: 8px;">
      ✨ Surprise for Monisha ✨
    </div>
    <h1 class="font-fraunces" style="font-size: 32px; font-weight: 700; margin-bottom: 8px;">
      Something Special Awaits!
    </h1>
    <p style="color: #cbd5e1; font-size: 15px; max-width: 380px;">
      Unoda 21st birthday-ku oru chinna magical surprise kaathukittu irukku...
    </p>

    <!-- 3D Gift Box SVG -->
    <div class="gift-box" onclick="openSurprise()">
      <svg viewBox="0 0 160 160" width="100%" height="100%">
        <!-- Box Base -->
        <rect x="25" y="60" width="110" height="85" rx="10" fill="#db2777" />
        <rect x="25" y="60" width="55" height="85" fill="#be185d" opacity="0.25" />
        <!-- Vertical Ribbon -->
        <rect x="68" y="60" width="24" height="85" fill="#fef08a" />
        <!-- Lid -->
        <rect x="20" y="42" width="120" height="24" rx="6" fill="#f43f5e" />
        <rect x="68" y="42" width="24" height="24" fill="#fef08a" />
        <!-- Ribbon Bow -->
        <path d="M80 42 C60 10 30 25 70 42 Z" fill="#fde047" />
        <path d="M80 42 C100 10 130 25 90 42 Z" fill="#fde047" />
        <circle cx="80" cy="42" r="8" fill="#facc15" />
        <!-- Tag -->
        <g transform="translate(95, 80) rotate(10)">
          <rect width="45" height="24" rx="4" fill="#fff" opacity="0.95" />
          <text x="22" y="11" font-size="8" font-weight="bold" fill="#be185d" text-anchor="middle">To: Monisha</text>
          <text x="22" y="20" font-size="7" fill="#64748b" text-anchor="middle">Age: 21 ✨</text>
        </g>
      </svg>
    </div>

    <button class="btn-primary" onclick="openSurprise()">
      ✨ Tap to Open Surprise 🎁 💖
    </button>
    <p class="font-caveat" style="font-size: 18px; color: #f472b6; margin-top: 14px;">
      (Don't forget to smile when you open it!)
    </p>
  </div>

  <!-- Main Surprises Container -->
  <main class="wrapper" id="main-content" style="opacity: 0; transition: opacity 0.8s ease;">
    <!-- 2. Hero Section -->
    <header style="text-align: center; padding: 32px 0 24px 0;">
      <div style="font-size: 13px; color: #f472b6; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">
        06 · 11 · 2005 &nbsp;·&nbsp; Celebrating 21 Magical Years
      </div>
      <div class="font-fraunces gradient-text" style="font-size: 88px; font-weight: 800; line-height: 1; letter-spacing: -2px; margin-bottom: 6px;">
        21
      </div>
      <div style="font-size: 16px; color: #e2e8f0; font-weight: 500; margin-bottom: 4px;">
        Happy Birthday, My Friend!
      </div>
      <h2 class="font-fraunces gradient-text" style="font-size: 44px; font-weight: 800; margin-bottom: 12px;">
        Monisha
      </h2>
      <p style="color: #cbd5e1; font-size: 16px; max-width: 460px; margin: 0 auto 24px auto; line-height: 1.5;">
        21 years of pure chaotic energy, unstoppable laughter, and the most golden heart.
      </p>

      <!-- Stats row -->
      <div style="display: flex; gap: 12px; justify-content: center; margin-bottom: 24px;">
        <div style="background: rgba(255,255,255,0.06); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); min-width: 90px;">
          <div class="font-fraunces" style="font-size: 22px; font-weight: bold; color: #93c5fd;">252</div>
          <div style="font-size: 11px; color: #94a3b8;">Months of Smiles</div>
        </div>
        <div style="background: rgba(255,255,255,0.06); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); min-width: 90px;">
          <div class="font-fraunces" style="font-size: 22px; font-weight: bold; color: #f472b6;">7,671</div>
          <div style="font-size: 11px; color: #94a3b8;">Days of Sunshine</div>
        </div>
        <div style="background: rgba(255,255,255,0.06); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); min-width: 90px;">
          <div class="font-fraunces" style="font-size: 22px; font-weight: bold; color: #c084fc;">∞</div>
          <div style="font-size: 11px; color: #94a3b8;">Unconditional Love</div>
        </div>
      </div>
    </header>

    <!-- 3. Make A Wish: SVG Cake Section -->
    <section class="glass-card" style="text-align: center;">
      <div style="font-size: 13px; color: #f472b6; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
        Make a Silent Wish First...
      </div>
      <h3 class="font-fraunces" style="font-size: 28px; margin-bottom: 6px;">21st Birthday Cake 🎂</h3>
      <p class="font-caveat" style="color: #fed7aa; font-size: 18px; margin-bottom: 20px;">
        Kannai moodi unoda deepest wish-ah nenachukittu candles-ah blow pannu!
      </p>

      <!-- SVG Birthday Cake -->
      <div style="max-width: 280px; margin: 0 auto 20px auto;">
        <svg viewBox="0 0 240 240" width="100%">
          <!-- Plate -->
          <ellipse cx="120" cy="210" rx="90" ry="14" fill="#334155" opacity="0.6" />
          <ellipse cx="120" cy="206" rx="84" ry="12" fill="#e2e8f0" />
          <ellipse cx="120" cy="204" rx="78" ry="9" fill="#f8fafc" />

          <!-- Bottom Tier -->
          <rect x="50" y="145" width="140" height="55" rx="8" fill="#f43f5e" />
          <!-- Blue ribbon icing on bottom tier -->
          <path d="M50 160 Q 65 170 80 160 Q 95 170 110 160 Q 125 170 140 160 Q 155 170 170 160 Q 185 170 190 160 L 190 145 L 50 145 Z" fill="#38bdf8" />
          <!-- 21 on Cake -->
          <text x="120" y="188" font-family="'Fraunces', serif" font-size="20" font-weight="800" fill="#ffffff" text-anchor="middle">21 ✨</text>

          <!-- Middle Tier -->
          <rect x="70" y="105" width="100" height="42" rx="6" fill="#fb7185" />
          <path d="M70 118 Q 80 126 95 118 Q 110 126 125 118 Q 140 126 155 118 Q 165 124 170 118 L 170 105 L 70 105 Z" fill="#fef08a" />

          <!-- Top Tier -->
          <rect x="90" y="75" width="60" height="32" rx="4" fill="#fda4af" />
          <path d="M90 85 Q 100 92 110 85 Q 120 92 130 85 Q 140 92 150 85 L 150 75 L 90 75 Z" fill="#ffffff" />

          <!-- Candles -->
          <!-- Candle 1 -->
          <rect x="98" y="55" width="5" height="20" fill="#38bdf8" rx="1" />
          <!-- Candle 2 (Center) -->
          <rect x="117" y="50" width="6" height="25" fill="#facc15" rx="1" />
          <!-- Candle 3 -->
          <rect x="137" y="55" width="5" height="20" fill="#c084fc" rx="1" />

          <!-- Flames -->
          <g id="cake-flames" class="candle-flame">
            <!-- Flame 1 -->
            <path d="M100.5 55 C98 50 99 44 100.5 39 C102 44 103 50 100.5 55 Z" fill="#fbbf24" />
            <circle cx="100.5" cy="48" r="2.5" fill="#ef4444" />
            <!-- Flame 2 -->
            <path d="M120 50 C117 44 118 36 120 30 C122 36 123 44 120 50 Z" fill="#f59e0b" />
            <circle cx="120" cy="42" r="3" fill="#ef4444" />
            <!-- Flame 3 -->
            <path d="M139.5 55 C137 50 138 44 139.5 39 C141 44 142 50 139.5 55 Z" fill="#fbbf24" />
            <circle cx="139.5" cy="48" r="2.5" fill="#ef4444" />
          </g>
        </svg>
      </div>

      <div id="wish-prompt-actions">
        <button id="blow-btn" class="btn-primary" onclick="blowCandles()">
          💨 Blow the Candles! ✨
        </button>
      </div>

      <!-- Wish Result Card Revealed after blowing -->
      <div id="wish-result" style="display: none; margin-top: 20px; background: rgba(255,255,255,0.08); padding: 20px; border-radius: 16px; border: 1px solid rgba(244, 114, 182, 0.3);">
        <div style="font-size: 20px; font-weight: 700; color: #fbcfe8; margin-bottom: 8px;">
          Wish Registered in the Stars! ✨
        </div>
        <p style="color: #e2e8f0; font-size: 15px; line-height: 1.6; margin-bottom: 12px;">
          Unoda wish kandippa niraverum Moni! May this 21st year give you all the peaceful sleep, unfiltered joy, incredible career milestones, and all the love you effortlessly give everyone else.
        </p>
        <p class="font-caveat" style="color: #f472b6; font-size: 20px;">
          "Look up! Glowing lanterns are floating to heaven for you 🏮"
        </p>
        <button onclick="relightCandles()" style="margin-top: 14px; background: transparent; border: 1px solid rgba(255,255,255,0.25); color: #cbd5e1; padding: 8px 18px; border-radius: 9999px; font-size: 13px; cursor: pointer;">
          🕯️ Relight Candles
        </button>
      </div>
    </section>

    <!-- 4. Photo Keepsake Polaroid Frame -->
    <section class="glass-card" style="text-align: center;">
      <div style="font-size: 13px; color: #f472b6; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
        Memory Lane
      </div>
      <h3 class="font-fraunces" style="font-size: 28px; margin-bottom: 6px;">Our Polaroid Keepsake 📷</h3>
      <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">
        Tap the polaroid or button below to add your favorite picture of Monisha!
      </p>

      <div class="polaroid" onclick="triggerPhotoUpload()">
        <div class="polaroid-img-box" id="polaroid-display">
          ${customPhotoUrl ? `<img src="${customPhotoUrl}" style="width:100%; height:100%; object-fit: cover;" alt="Monisha" />` : `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 36px; margin-bottom: 8px;">📸</div>
            <div style="font-weight: 600; font-size: 15px; color: #f1f5f9;">Tap to upload a photo!</div>
            <div class="font-caveat" style="font-size: 17px; color: #f472b6; margin-top: 4px;">Namma favourite memory inga podu</div>
          </div>
          `}
        </div>
        <div style="margin-top: 14px; text-align: center;">
          <div class="font-caveat" style="font-size: 24px; font-weight: bold; color: #1e1b4b;">
            Monisha @ 21 · Pure Sunshine 💖
          </div>
          <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
            06.11.2005 · Forever Bestie
          </div>
        </div>
      </div>
      <input type="file" id="photo-input" accept="image/*" style="display: none;" onchange="handlePhoto(event)">

      <div style="margin-top: 20px;">
        <button class="btn-primary" onclick="triggerPhotoUpload()" style="font-size: 14px; padding: 10px 22px;">
          📷 Upload Her Photo
        </button>
      </div>
    </section>

    <!-- 5. Six Flip Cards -->
    <section class="glass-card">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 13px; color: #f472b6; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
          Tap Each Card to Flip ✨
        </div>
        <h3 class="font-fraunces" style="font-size: 28px; margin-bottom: 4px;">Reasons Why You're Irreplaceable</h3>
        <p style="color: #94a3b8; font-size: 14px;">
          Ovvoru card-layum unakkaaga oru unmaiyaana memory & heartfelt note irukku.
        </p>
      </div>

      <div class="flip-grid">
        <!-- Card 1 -->
        <div class="flip-card" onclick="flipCard(this)">
          <div class="flip-inner">
            <div class="flip-front">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 24px;">😂</span>
                <span style="font-size: 11px; color: #94a3b8; font-style: italic;">The Humor</span>
              </div>
              <div>
                <h4 class="font-fraunces" style="font-size: 18px; margin-bottom: 4px;">Unstoppable Laughs</h4>
                <p style="font-size: 13px; color: #cbd5e1;">Namma siricha stop-ey aagathu!</p>
              </div>
              <div style="font-size: 11px; color: #f472b6;">✨ Tap to flip</div>
            </div>
            <div class="flip-back">
              <h5 class="font-fraunces" style="font-size: 16px; color: #fbcfe8;">Those Stomach-Cramping Laughs</h5>
              <p style="font-size: 12px; line-height: 1.5; color: #e2e8f0; margin-top: 6px;">
                Remember those moments when someone cracked a totally lame joke in the most serious situation, and both of us laughed till tears rolled down? Nobody gets my crazy sense of humor like you do!
              </p>
              <div class="font-caveat" style="font-size: 15px; color: #fef08a; margin-top: 6px;">
                "Laughter therapy with you is 100% free!"
              </div>
            </div>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="flip-card" onclick="flipCard(this)">
          <div class="flip-inner">
            <div class="flip-front">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 24px;">🌙</span>
                <span style="font-size: 11px; color: #94a3b8; font-style: italic;">Safe Space</span>
              </div>
              <div>
                <h4 class="font-fraunces" style="font-size: 18px; margin-bottom: 4px;">Un Kooda Pesumbothu...</h4>
                <p style="font-size: 13px; color: #cbd5e1;">Olarittey irunthaalum semma feeling 😊</p>
              </div>
              <div style="font-size: 11px; color: #f472b6;">✨ Tap to flip</div>
            </div>
            <div class="flip-back">
              <h5 class="font-fraunces" style="font-size: 15px; color: #fbcfe8;">My No-Judgment Zone</h5>
              <p style="font-size: 11px; line-height: 1.45; color: #e2e8f0; margin-top: 4px;">
                Un kooda pesitu irunth okk antha feeling nalla iruku, eppavume enna judge panna maatta. Enna problem vandhaalum serthu handle pannalaam. Enna eppavumae judge panama elamae share panra oru nalla pullai nee 💖
              </p>
              <div class="font-caveat" style="font-size: 14px; color: #fef08a; margin-top: 4px;">
                "Enna eppavum judge pannatha nalla pullai nee"
              </div>
            </div>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="flip-card" onclick="flipCard(this)">
          <div class="flip-inner">
            <div class="flip-front">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 24px;">🛡️</span>
                <span style="font-size: 11px; color: #94a3b8; font-style: italic;">Resilience</span>
              </div>
              <div>
                <h4 class="font-fraunces" style="font-size: 18px; margin-bottom: 4px;">Strongest Soul I Know</h4>
                <p style="font-size: 13px; color: #cbd5e1;">Grace, dignity & quiet courage</p>
              </div>
              <div style="font-size: 11px; color: #f472b6;">✨ Tap to flip</div>
            </div>
            <div class="flip-back">
              <h5 class="font-fraunces" style="font-size: 16px; color: #fbcfe8;">Proud of the Woman You Are</h5>
              <p style="font-size: 12px; line-height: 1.5; color: #e2e8f0; margin-top: 6px;">
                People see your jokes and radiant smile, but I know how tough the battles you fought silently were. Stepping into 21 as a truly unstoppable warrior!
              </p>
              <div class="font-caveat" style="font-size: 15px; color: #fef08a; margin-top: 6px;">
                "Soft heart, but made of unbreakable steel."
              </div>
            </div>
          </div>
        </div>

        <!-- Card 4 -->
        <div class="flip-card" onclick="flipCard(this)">
          <div class="flip-inner">
            <div class="flip-front">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 24px;">♾️</span>
                <span style="font-size: 11px; color: #94a3b8; font-style: italic;">The Promise</span>
              </div>
              <div>
                <h4 class="font-fraunces" style="font-size: 18px; margin-bottom: 4px;">80 Vayasula Kooda...</h4>
                <p style="font-size: 13px; color: #cbd5e1;">Till we have no teeth left!</p>
              </div>
              <div style="font-size: 11px; color: #f472b6;">✨ Tap to flip</div>
            </div>
            <div class="flip-back">
              <h5 class="font-fraunces" style="font-size: 16px; color: #fbcfe8;">A Lifetime Guarantee</h5>
              <p style="font-size: 12px; line-height: 1.5; color: #e2e8f0; margin-top: 6px;">
                Cities might change, but this bond is locked in titanium. 80 years aanaalum naama rendu perum tea kudichukitte gossip panni sirikkanum!
              </p>
              <div class="font-caveat" style="font-size: 15px; color: #fef08a; margin-top: 6px;">
                "Permanently stuck with me forever, Moni!"
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. Personal Letter -->
    <section class="glass-card">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 13px; color: #f472b6; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
          Straight From My Heart
        </div>
        <h3 class="font-fraunces" style="font-size: 28px; margin-bottom: 4px;">A Personal Letter to Monisha 💌</h3>
        <p style="color: #94a3b8; font-size: 14px;">
          Some words I don't say out loud often enough, written just for you.
        </p>
      </div>

      <div class="letter-parchment">
        <!-- Letter Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 14px; margin-bottom: 18px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #be185d; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px;">
              M
            </div>
            <div>
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; font-weight: 700;">Special Edition</div>
              <div style="font-weight: 700; font-size: 13px; color: #1e1b4b;">A Letter From Your Friend</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; color: #64748b;">06 Nov 2026</div>
            <div class="font-caveat" style="font-size: 16px; color: #db2777; font-weight: bold;">Year 21 ✨</div>
          </div>
        </div>

        <!-- Letter Body -->
        <div class="font-fraunces" style="font-size: 20px; font-weight: 700; color: #1e1b4b; margin-bottom: 14px;">
          Hey Monisha (My Friend),
        </div>

        <p style="font-size: 15px; line-height: 1.7; color: #334155; margin-bottom: 16px;">
          Enaku therinji un life la naraya kastam pattu iruka , and neraya vishiyam achive pannanum nanaipa but athulam sila reasons naala mudiyathu , anyway ithu un life unaku pudicha mari vazhthuko seriya yaar enna nanaipanga athulaam yapayumae yosikatthaa seriya , just neeya iru ethukagavum unaa change panikanum nanaikathe and be happy always .
        </p>

        <!-- Golden Highlight Box -->
        <div style="background: #fefce8; border-left: 3px solid #facc15; padding: 12px 16px; border-radius: 6px; margin: 18px 0;">
          <p class="font-caveat" style="font-size: 21px; line-height: 1.4; color: #854d0e;">
            "Just neeya iru ethukagavum unaa change panikanum nanaikathe and be happy always."
          </p>
        </div>

        <p style="font-size: 15px; line-height: 1.7; color: #334155; margin-bottom: 24px;">
          May this 21st year give you all the peace, courage, and unconditional happiness you deserve. Always here for you as your friend!
        </p>

        <!-- Sign-off -->
        <div style="text-align: right; border-top: 1px dashed #cbd5e1; padding-top: 16px;">
          <div style="font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #94a3b8; font-weight: bold;">
            With Warm Wishes & Care,
          </div>
          <div class="font-caveat" style="font-size: 28px; font-weight: bold; color: #be185d; margin-top: 2px;">
            Your Friend ❤️
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            Always wishing the best for you · 06.11.2005 to Infinity
          </div>
        </div>
      </div>
    </section>

    <!-- 7. Finale Section -->
    <section style="text-align: center; padding: 20px 0;">
      <div class="font-caveat" style="font-size: 22px; color: #f472b6; margin-bottom: 4px;">
        Wait, one last thing...
      </div>
      <h3 class="font-fraunces" style="font-size: 32px; margin-bottom: 10px;">
        A Finale for the Birthday Queen 👑
      </h3>
      <p style="color: #cbd5e1; font-size: 15px; max-width: 440px; margin: 0 auto 24px auto;">
        Tap the button below to illuminate the dusk sky with fireworks, balloons, and floating lanterns!
      </p>

      <button class="btn-primary" onclick="showFinaleModal()" style="font-size: 17px; padding: 16px 36px;">
        ✨ One More Surprise! 🎆 💖
      </button>
    </section>
  </main>

  <!-- Finale Modal -->
  <div id="finale-modal" onclick="closeModalOnBg(event)">
    <div class="modal-box">
      <div style="font-size: 13px; color: #f472b6; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">
        The Grand Birthday Wish 💖
      </div>
      <h2 class="font-fraunces gradient-text" style="font-size: 36px; font-weight: 800; margin-bottom: 8px;">
        Happy 21st Birthday, Monisha!
      </h2>
      <div class="font-caveat" style="font-size: 22px; color: #fed7aa; margin-bottom: 16px;">
        May the stars always guide your steps ✨
      </div>
      <p style="color: #e2e8f0; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        Inaikku unakku 21 years start aaguthu! This is your golden era Moni. May your twenties be filled with unforgettable journeys, belly-aching laughter, peaceful nights, loyal friends, and every single dream you've whispered to the universe.<br><br>
        <strong>Never stop being the bold, hilarious, kind-hearted queen you are today!</strong>
      </p>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button class="btn-primary" onclick="launchGrandFireworks()">
          🎆 Launch More Fireworks! 💖
        </button>
        <button onclick="closeFinaleModal()" style="background: transparent; border: 1px solid rgba(255,255,255,0.25); color: #cbd5e1; padding: 10px; border-radius: 9999px; cursor: pointer;">
          Close & Keep Celebrating
        </button>
      </div>
    </div>
  </div>

  <script>
    // Canvas Twinkling Stars
    const starCanvas = document.getElementById('stars-bg');
    const sCtx = starCanvas.getContext('2d');
    let stars = [];

    function resizeStarCanvas() {
      starCanvas.width = window.innerWidth;
      starCanvas.height = window.innerHeight;
      stars = [];
      const count = Math.min(120, Math.floor(window.innerWidth / 8));
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * starCanvas.width,
          y: Math.random() * starCanvas.height,
          radius: Math.random() * 1.5 + 0.5,
          alpha: Math.random(),
          speed: 0.01 + Math.random() * 0.02
        });
      }
    }
    window.addEventListener('resize', resizeStarCanvas);
    resizeStarCanvas();

    function renderStars() {
      sCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
      for (let s of stars) {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0.2) s.speed = -s.speed;
        sCtx.beginPath();
        sCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        sCtx.fillStyle = 'rgba(255, 255, 255, ' + Math.abs(s.alpha) + ')';
        sCtx.fill();
      }
      requestAnimationFrame(renderStars);
    }
    renderStars();

    // Confetti, Hearts, and Fireworks Canvas
    const cCanvas = document.getElementById('confetti-canvas');
    const cCtx = cCanvas.getContext('2d');
    let particles = [];

    function resizeConfetti() {
      cCanvas.width = window.innerWidth;
      cCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeConfetti);
    resizeConfetti();

    function spawnConfetti(originX, originY, count, withHearts) {
      const colors = ['#f472b6', '#ec4899', '#c084fc', '#a855f7', '#60a5fa', '#fef08a', '#38bdf8'];
      for (let i = 0; i < count; i++) {
        const isHeart = withHearts && Math.random() < 0.35;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 4;
        particles.push({
          x: originX || window.innerWidth / 2,
          y: originY || window.innerHeight / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 4,
          size: isHeart ? Math.random() * 8 + 8 : Math.random() * 7 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 12,
          gravity: 0.25,
          drag: 0.96,
          life: 1,
          decay: Math.random() * 0.01 + 0.008,
          isHeart: isHeart
        });
      }
    }

    function drawHeart(ctx, x, y, size, color, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = color;
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size * 1.3);
      ctx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
      ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function animateParticles() {
      cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        if (p.isHeart) {
          drawHeart(cCtx, p.x, p.y, p.size, p.color, p.life);
        } else {
          cCtx.save();
          cCtx.translate(p.x, p.y);
          cCtx.rotate((p.rotation * Math.PI) / 180);
          cCtx.globalAlpha = Math.max(0, p.life);
          cCtx.fillStyle = p.color;
          cCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          cCtx.restore();
        }
      }
      requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // Gift Gate Open
    function openSurprise() {
      const gate = document.getElementById('gift-gate');
      const main = document.getElementById('main-content');
      gate.classList.add('hidden-gate');
      main.style.opacity = '1';
      spawnConfetti(window.innerWidth / 2, window.innerHeight * 0.45, 120, true);
    }

    // Candle Blowing
    function blowCandles() {
      const flames = document.getElementById('cake-flames');
      if (flames) flames.classList.add('flame-extinguished');
      document.getElementById('wish-prompt-actions').style.display = 'none';
      document.getElementById('wish-result').style.display = 'block';
      spawnConfetti(window.innerWidth / 2, window.innerHeight * 0.4, 70, true);
    }

    function relightCandles() {
      const flames = document.getElementById('cake-flames');
      if (flames) flames.classList.remove('flame-extinguished');
      document.getElementById('wish-prompt-actions').style.display = 'block';
      document.getElementById('wish-result').style.display = 'none';
    }

    // Photo Upload Handler
    function triggerPhotoUpload() {
      document.getElementById('photo-input').click();
    }
    function handlePhoto(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          const display = document.getElementById('polaroid-display');
          display.innerHTML = '<img src="' + evt.target.result + '" style="width:100%; height:100%; object-fit: cover;" alt="Monisha" />';
          spawnConfetti(window.innerWidth / 2, window.innerHeight * 0.5, 40, true);
        };
        reader.readAsDataURL(file);
      }
    }

    // Flip Card
    function flipCard(el) {
      el.classList.toggle('flipped');
      const rect = el.getBoundingClientRect();
      spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 25, true);
    }

    // Finale
    function showFinaleModal() {
      document.getElementById('finale-modal').classList.add('show');
      launchGrandFireworks();
    }
    function closeFinaleModal() {
      document.getElementById('finale-modal').classList.remove('show');
    }
    function closeModalOnBg(e) {
      if (e.target.id === 'finale-modal') closeFinaleModal();
    }
    function launchGrandFireworks() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      spawnConfetti(w * 0.25, h * 0.35, 90, true);
      setTimeout(() => spawnConfetti(w * 0.75, h * 0.3, 90, true), 250);
      setTimeout(() => spawnConfetti(w * 0.5, h * 0.45, 110, true), 500);
    }
  </script>
</body>
</html>`;
}
