/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Heart, Sparkles, Volume2, VolumeX, Music, Flame, 
  RotateCcw, Upload, Camera, Film, X, Download,
  Laugh, Shield, Moon, Award
} from 'lucide-react';
import { sound } from './utils/sound';
import { generateSingleFileHtml } from './utils/exportHtml';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  gravity: number;
  drag: number;
  life: number;
  decay: number;
  isHeart: boolean;
}

interface FloatingLantern {
  id: number;
  x: number;
  y: number;
  speed: number;
  drift: number;
  size: number;
  color: string;
  opacity: number;
}

export default function App() {
  // State variables
  const [gateOpen, setGateOpen] = useState(false);
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [wished, setWished] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [polaroidTilt, setPolaroidTilt] = useState(-1.5);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [showFinaleModal, setShowFinaleModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Canvas Refs
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cakeSectionRef = useRef<HTMLDivElement | null>(null);

  // Particles & Lanterns system
  const particlesRef = useRef<Particle[]>([]);
  const lanternsRef = useRef<FloatingLantern[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Check prefers-reduced-motion
  const prefersReducedMotion = useRef(false);
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Initialize Twinkling Stars
  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: Array<{ x: number; y: number; radius: number; alpha: number; speed: number }> = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = [];
      const count = Math.min(110, Math.floor(window.innerWidth / 9));
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.4,
          alpha: Math.random() * 0.8 + 0.2,
          speed: 0.008 + Math.random() * 0.015,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let starFrame: number;
    const renderStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        if (!prefersReducedMotion.current) {
          s.alpha += s.speed;
          if (s.alpha > 0.95 || s.alpha < 0.2) s.speed = -s.speed;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, s.alpha)})`;
        ctx.fill();
      }
      starFrame = requestAnimationFrame(renderStars);
    };
    renderStars();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(starFrame);
    };
  }, []);

  // Confetti & Lanterns Animation Loop
  const spawnConfetti = useCallback((originX: number, originY: number, count: number, withHearts: boolean = true) => {
    if (prefersReducedMotion.current) return;
    const colors = ['#f472b6', '#ec4899', '#f43f5e', '#c084fc', '#a855f7', '#60a5fa', '#fef08a', '#38bdf8'];
    for (let i = 0; i < count; i++) {
      const isHeart = withHearts && Math.random() < 0.38;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 11 + 4;
      particlesRef.current.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: isHeart ? Math.random() * 8 + 9 : Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.24,
        drag: 0.96,
        life: 1,
        decay: Math.random() * 0.012 + 0.008,
        isHeart,
      });
    }
  }, []);

  const spawnLanterns = useCallback((count: number = 8) => {
    if (prefersReducedMotion.current) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const colors = ['#fbcfe8', '#fed7aa', '#bae6fd', '#f472b6', '#c084fc'];
    for (let i = 0; i < count; i++) {
      lanternsRef.current.push({
        id: Math.random(),
        x: Math.random() * (w - 60) + 30,
        y: h + Math.random() * 120 + 20,
        speed: Math.random() * 0.9 + 0.8,
        drift: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 14 + 22,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0,
      });
    }
  }, []);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const drawHeart = (c: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number) => {
      c.save();
      c.translate(x, y);
      c.globalAlpha = Math.max(0, alpha);
      c.fillStyle = color;
      c.beginPath();
      const topCurveHeight = size * 0.3;
      c.moveTo(0, topCurveHeight);
      c.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      c.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size * 1.3);
      c.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
      c.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      c.closePath();
      c.fill();
      c.restore();
    };

    const drawLantern = (c: CanvasRenderingContext2D, l: FloatingLantern) => {
      c.save();
      c.translate(l.x, l.y);
      c.globalAlpha = l.opacity;

      // Outer gentle glow
      const glowGrad = c.createRadialGradient(0, 0, 2, 0, 0, l.size * 1.6);
      glowGrad.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
      glowGrad.addColorStop(0.5, 'rgba(244, 114, 182, 0.25)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      c.fillStyle = glowGrad;
      c.beginPath();
      c.arc(0, 0, l.size * 1.6, 0, Math.PI * 2);
      c.fill();

      // Lantern body (curved cylinder)
      c.fillStyle = l.color;
      c.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      c.lineWidth = 1;
      c.beginPath();
      c.roundRect(-l.size * 0.45, -l.size * 0.6, l.size * 0.9, l.size * 1.2, 4);
      c.fill();
      c.stroke();

      // Internal candle light
      c.fillStyle = '#fef08a';
      c.beginPath();
      c.arc(0, l.size * 0.2, l.size * 0.18, 0, Math.PI * 2);
      c.fill();

      // Tassel hanger line
      c.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      c.beginPath();
      c.moveTo(0, l.size * 0.6);
      c.lineTo(0, l.size * 0.85);
      c.stroke();

      c.restore();
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render Floating Lanterns
      for (let i = lanternsRef.current.length - 1; i >= 0; i--) {
        const l = lanternsRef.current[i];
        l.y -= l.speed;
        l.x += l.drift;
        if (l.y > canvas.height * 0.8) {
          l.opacity = Math.min(0.9, l.opacity + 0.02);
        } else if (l.y < 80) {
          l.opacity = Math.max(0, l.opacity - 0.015);
        }

        drawLantern(ctx, l);

        if (l.y < -50 || l.opacity <= 0) {
          lanternsRef.current.splice(i, 1);
        }
      }

      // Render Confetti & Hearts
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.life -= p.decay;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        if (p.isHeart) {
          drawHeart(ctx, p.x, p.y, p.size, p.color, p.life);
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Handle Open Gate
  const handleOpenGate = () => {
    setGateOpen(true);
    sound.playCelebrationChime();
    spawnConfetti(window.innerWidth / 2, window.innerHeight * 0.45, 140, true);
    spawnLanterns(6);
  };

  // Handle Blow Candles
  const handleBlowCandles = () => {
    sound.playBlowSound();
    setCandlesBlown(true);
    setWished(true);
    spawnConfetti(window.innerWidth / 2, window.innerHeight * 0.45, 80, true);
    spawnLanterns(12);
  };

  const handleRelightCandles = () => {
    sound.playSparkle();
    setCandlesBlown(false);
  };

  // Toggle Sound & Melody
  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (muted) setIsPlayingMusic(false);
  };

  const handleToggleMusic = () => {
    if (isPlayingMusic) {
      sound.stopMelody();
      setIsPlayingMusic(false);
    } else {
      sound.playHappyBirthdayMelody(() => {
        setIsPlayingMusic(false);
      });
      setIsPlayingMusic(true);
    }
  };

  // Photo Upload Handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (typeof evt.target?.result === 'string') {
          setUserPhoto(evt.target.result);
          sound.playCelebrationChime();
          spawnConfetti(window.innerWidth / 2, window.innerHeight * 0.5, 45, true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Flip Card Handler
  const handleCardFlip = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    sound.playCardFlip();
    setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }));
    const rect = e.currentTarget.getBoundingClientRect();
    spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 24, true);
  };

  // Launch Grand Fireworks
  const launchFireworks = () => {
    sound.playCelebrationChime();
    sound.playSparkle();
    const w = window.innerWidth;
    const h = window.innerHeight;
    spawnConfetti(w * 0.25, h * 0.35, 95, true);
    spawnLanterns(8);
    setTimeout(() => {
      sound.playPop();
      spawnConfetti(w * 0.75, h * 0.3, 95, true);
    }, 280);
    setTimeout(() => {
      sound.playSparkle();
      spawnConfetti(w * 0.5, h * 0.45, 120, true);
    }, 560);
  };

  const handleOpenFinale = () => {
    setShowFinaleModal(true);
    launchFireworks();
  };

  // Download Keepsake HTML
  const handleDownloadKeepsake = () => {
    sound.playSparkle();
    const htmlContent = generateSingleFileHtml(userPhoto);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Monisha_21st_Birthday_Surprise.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const scrollToCake = () => {
    cakeSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    sound.playSparkle();
  };

  // Flip Cards Data (4 core memories matching the video keepsake)
  const flipCards = [
    {
      category: 'The Humor',
      icon: <Laugh className="w-5 h-5 text-pink-400" />,
      frontTitle: 'Unstoppable Laughs',
      frontTeaser: 'Namma siricha stop-ey aagathu!',
      backTitle: 'Those Stomach-Cramping Laughs',
      backContent: 'Remember those moments when someone cracked a totally lame joke in the most serious situation, and both of us laughed till tears rolled down? Unkooda sirikira maathiri vaarkoadusum varaathu Moni. Nobody gets my crazy sense of humor like you do!',
      quote: '"Laughter therapy with you is 100% free!"',
    },
    {
      category: 'Safe Space',
      icon: <Moon className="w-5 h-5 text-indigo-400" />,
      frontTitle: 'Un Kooda Pesumbothu...',
      frontTeaser: 'Olarittey irunthaalum semma feeling 😊',
      backTitle: 'My No-Judgment Zone',
      backContent: 'Un kooda pesitu irunth okk antha feeling nalla iruku, eppavume enna judge panna maatta nanaikara, pesu start pana un vaai summa irukathu olarite irupa gaapum, but athum nalla thaan irukum 😊. Namma elamae share panipom entha problem nallam serii ethuva irunthalum (apdi thaan nanaikera) and enna eppavumae judge panama elamae share panra oru nalla pullai nee 💖',
      quote: '"Enna eppavum judge pannatha nalla pullai nee"',
    },
    {
      category: 'Resilience',
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      frontTitle: 'Strongest Soul I Know',
      frontTeaser: 'Grace, dignity & quiet courage',
      backTitle: 'Proud of the Woman You Are',
      backContent: 'People see your jokes and radiant smile, but I know how tough the battles you fought silently were. You handled every storm with so much courage and kindness. Stepping into 21 as a truly unstoppable warrior!',
      quote: '"Soft heart, but made of unbreakable steel."',
    },
    {
      category: 'The Promise',
      icon: <Award className="w-5 h-5 text-purple-400" />,
      frontTitle: '80 Vayasula Kooda...',
      frontTeaser: 'Till we have no teeth left!',
      backTitle: 'A Lifetime Guarantee',
      backContent: 'Boyfriends, jobs, houses, cities might change over decades, but this bond is locked in titanium. 80 years aanaalum naama rendu perum tea kudichukitte gossip panni sirikkanum. I\'m unoda bestie for this life and all lifetimes to come!',
      quote: '"Permanently stuck with me forever, Moni!"',
    },
  ];

  return (
    <div className="relative min-h-screen text-slate-100 dusk-gradient-bg overflow-x-hidden">
      {/* Background canvas elements */}
      <canvas ref={starsCanvasRef} className="fixed inset-0 pointer-events-none z-0" />
      <canvas ref={confettiCanvasRef} className="fixed inset-0 pointer-events-none z-50" />

      {/* Floating Audio Controls in Top-Right Bar */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={handleToggleMusic}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            isPlayingMusic 
              ? 'bg-pink-600/80 border-pink-400 text-white shadow-lg shadow-pink-500/20 animate-pulse'
              : 'bg-slate-900/70 border-slate-700/60 text-slate-300 hover:text-white'
          } backdrop-blur-md`}
          title="Play Birthday Melody"
        >
          <Music className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isPlayingMusic ? 'Melody Playing' : 'Birthday Melody'}</span>
        </button>

        <button
          onClick={handleToggleSound}
          className="p-2 rounded-full bg-slate-900/70 border border-slate-700/60 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* ================= SECTION 1: GIFT GATE ================= */}
      {!gateOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#1c123d] via-[#100824] to-[#080415]">
          <div className="max-w-md w-full flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-pink-400 mb-3 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20">
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              Surprise for Monisha
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
            </div>

            <h1 className="font-fraunces text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Something Special Awaits!
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xs mb-6">
              Unoda 21st birthday-ku oru chinna magical surprise kaathukittu irukku...
            </p>

            {/* Bouncing Gift Box SVG */}
            <div 
              onClick={handleOpenGate}
              className="w-40 h-40 cursor-pointer animate-gift transition-transform hover:scale-105 active:scale-95 my-2"
              title="Tap to unwrap!"
            >
              <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-[0_15px_35px_rgba(236,72,153,0.45)]">
                {/* Box body */}
                <rect x="25" y="60" width="110" height="85" rx="12" fill="#db2777" />
                <rect x="25" y="60" width="55" height="85" rx="12" fill="#be185d" opacity="0.35" />
                {/* Vertical Ribbon */}
                <rect x="68" y="60" width="24" height="85" fill="#fef08a" />
                {/* Lid */}
                <rect x="18" y="42" width="124" height="24" rx="8" fill="#f43f5e" />
                <rect x="68" y="42" width="24" height="24" fill="#fef08a" />
                {/* Ribbon Bow */}
                <path d="M80 42 C60 10 30 25 70 42 Z" fill="#fde047" />
                <path d="M80 42 C100 10 130 25 90 42 Z" fill="#fde047" />
                <circle cx="80" cy="42" r="8" fill="#facc15" />
                {/* Gift Tag */}
                <g transform="translate(95, 80) rotate(10)">
                  <rect width="46" height="26" rx="4" fill="#ffffff" opacity="0.95" />
                  <text x="23" y="11" fontSize="8" fontWeight="bold" fill="#be185d" textAnchor="middle">To: Monisha</text>
                  <text x="23" y="21" fontSize="7" fill="#64748b" textAnchor="middle">Age: 21 ✨</text>
                </g>
              </svg>
            </div>

            <button
              onClick={handleOpenGate}
              className="mt-6 px-8 py-3.5 rounded-full text-base font-semibold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-xl shadow-pink-500/35 hover:shadow-pink-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Tap to Open Surprise 🎁 💖
            </button>

            <p className="font-caveat text-xl text-pink-300 mt-4">
              (Don't forget to smile when you open it!)
            </p>
          </div>
        </div>
      )}

      {/* ================= MAIN BIRTHDAY CONTENT ================= */}
      <div className={`relative z-10 transition-opacity duration-1000 ${gateOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-24 space-y-12">
          
          {/* ================= SECTION 2: HERO ================= */}
          <header className="text-center pt-6 pb-2">
            <div className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-pink-300 mb-3">
              <span>06 · 11 · 2005</span>
              <span>·</span>
              <span>Celebrating 21 Magical Years</span>
            </div>

            <div className="relative inline-block my-2">
              <div className="absolute -inset-6 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-sky-500/20 blur-2xl rounded-full pointer-events-none" />
              <div className="font-fraunces text-8xl sm:text-9xl font-black tracking-tight bg-gradient-to-br from-pink-200 via-pink-400 to-purple-400 bg-clip-text text-transparent leading-none drop-shadow-[0_10px_25px_rgba(244,114,182,0.4)]">
                21
              </div>
            </div>

            <p className="text-sm sm:text-base font-medium text-slate-300 mt-2">
              Happy Birthday, My Friend!
            </p>

            <h1 className="font-fraunces text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-pink-200 via-rose-300 to-amber-200 bg-clip-text text-transparent mt-1 mb-3">
              Monisha
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              21 years of pure chaotic energy, unstoppable laughter, and the most golden heart.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mt-6">
              <div className="card-dusk-glass p-3.5 rounded-2xl text-center">
                <div className="font-fraunces text-xl sm:text-2xl font-bold text-sky-300">252</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Months of Smiles</div>
              </div>
              <div className="card-dusk-glass p-3.5 rounded-2xl text-center">
                <div className="font-fraunces text-xl sm:text-2xl font-bold text-pink-400">7,671</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Days of Sunshine</div>
              </div>
              <div className="card-dusk-glass p-3.5 rounded-2xl text-center">
                <div className="font-fraunces text-xl sm:text-2xl font-bold text-purple-300">∞</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Unconditional Love</div>
              </div>
            </div>

            {/* Quick Trigger Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                onClick={scrollToCake}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-200 border border-pink-500/30 hover:bg-pink-500/30 transition-all flex items-center gap-1.5"
              >
                🎂 Blow the Birthday Candles 🕯️
              </button>
              <button
                onClick={() => {
                  sound.playSparkle();
                  spawnLanterns(10);
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-200 border border-purple-500/30 hover:bg-purple-500/30 transition-all flex items-center gap-1.5"
              >
                🎈 Tap to send floating balloons & lanterns 🏮
              </button>
            </div>
          </header>

          {/* ================= SECTION 3: MAKE A WISH (CAKE) ================= */}
          <section ref={cakeSectionRef} className="card-dusk-glass p-6 sm:p-8 rounded-3xl text-center relative overflow-hidden">
            <div className="text-xs font-semibold uppercase tracking-widest text-pink-400 mb-1">
              Make a Silent Wish First...
            </div>
            <h2 className="font-fraunces text-2xl sm:text-3xl font-bold text-white mb-2">
              21st Birthday Cake 🎂
            </h2>
            <p className="font-caveat text-lg sm:text-xl text-amber-200/90 mb-6 max-w-sm mx-auto">
              Kannai moodi unoda deepest wish-ah nenachukittu candles-ah blow pannu!
            </p>

            {/* SVG 3-Tier Birthday Cake with flickering flames */}
            <div className="max-w-[270px] mx-auto my-2">
              <svg viewBox="0 0 240 240" className="w-full h-auto drop-shadow-[0_15px_30px_rgba(244,114,182,0.25)]">
                {/* Plate */}
                <ellipse cx="120" cy="214" rx="92" ry="14" fill="#1e1b4b" opacity="0.6" />
                <ellipse cx="120" cy="210" rx="86" ry="11" fill="#fbcfe8" opacity="0.4" />
                <ellipse cx="120" cy="207" rx="80" ry="8" fill="#fdf2f8" />

                {/* Bottom Tier */}
                <rect x="48" y="145" width="144" height="58" rx="8" fill="#ec4899" />
                {/* Tier frosting wave */}
                <path d="M48 160 Q 64 172 80 160 Q 96 172 112 160 Q 128 172 144 160 Q 160 172 176 160 Q 186 168 192 160 L 192 145 L 48 145 Z" fill="#38bdf8" />
                {/* Golden '21' inscription on bottom tier */}
                <text x="120" y="190" fontFamily="'Fraunces', serif" fontSize="22" fontWeight="800" fill="#ffffff" textAnchor="middle" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
                  21 ✨
                </text>

                {/* Middle Tier */}
                <rect x="68" y="105" width="104" height="42" rx="6" fill="#f43f5e" />
                <path d="M68 118 Q 81 126 94 118 Q 107 126 120 118 Q 133 126 146 118 Q 159 126 172 118 L 172 105 L 68 105 Z" fill="#fde047" />

                {/* Top Tier */}
                <rect x="88" y="72" width="64" height="34" rx="4" fill="#fb7185" />
                <path d="M88 83 Q 98 90 108 83 Q 120 90 132 83 Q 142 90 152 83 L 152 72 L 88 72 Z" fill="#ffffff" />

                {/* Candle 1 (Left) */}
                <rect x="97" y="52" width="5" height="20" fill="#38bdf8" rx="1" />
                {/* Candle 2 (Center - tall) */}
                <rect x="117" y="46" width="6" height="26" fill="#facc15" rx="1" />
                {/* Candle 3 (Right) */}
                <rect x="137" y="52" width="5" height="20" fill="#c084fc" rx="1" />

                {/* Candle Flames or Smoke trails */}
                {!candlesBlown ? (
                  <g className="animate-flame">
                    {/* Flame 1 */}
                    <path d="M99.5 52 C97 46 98 40 99.5 35 C101 40 102 46 99.5 52 Z" fill="#fbbf24" />
                    <circle cx="99.5" cy="45" r="2.5" fill="#ef4444" />
                    {/* Flame 2 (Center) */}
                    <path d="M120 46 C117 40 118 32 120 26 C122 32 123 40 120 46 Z" fill="#f59e0b" />
                    <circle cx="120" cy="38" r="3" fill="#ef4444" />
                    {/* Flame 3 */}
                    <path d="M139.5 52 C137 46 138 40 139.5 35 C141 40 142 46 139.5 52 Z" fill="#fbbf24" />
                    <circle cx="139.5" cy="45" r="2.5" fill="#ef4444" />
                  </g>
                ) : (
                  <g className="animate-pulse opacity-75">
                    {/* Smoke puffs when blown */}
                    <path d="M99.5 50 Q 96 42 101 34 Q 97 26 102 18" stroke="#cbd5e1" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <path d="M120 44 Q 116 36 122 28 Q 118 20 123 12" stroke="#cbd5e1" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <path d="M139.5 50 Q 136 42 141 34 Q 137 26 142 18" stroke="#cbd5e1" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </g>
                )}
              </svg>
            </div>

            {/* Cake Action Buttons */}
            <div className="mt-4 flex flex-col items-center justify-center">
              {!candlesBlown ? (
                <button
                  onClick={handleBlowCandles}
                  className="px-8 py-3.5 rounded-full text-base font-semibold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
                  Blow The Candles! 💨 ✨
                </button>
              ) : (
                <button
                  onClick={handleRelightCandles}
                  className="px-6 py-2 rounded-full text-xs font-semibold text-slate-300 bg-slate-800/80 border border-slate-700 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-pink-400" />
                  Relight Candles 🕯️
                </button>
              )}
            </div>

            {/* Revealed Wish Message Card */}
            {wished && (
              <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-pink-950/40 via-purple-950/40 to-slate-900/60 border border-pink-500/30 text-left animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="flex items-center gap-2 text-pink-300 font-bold text-lg mb-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  Wish Registered in the Stars! ✨
                </div>
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-3">
                  Unoda wish kandippa niraverum Moni! May this 21st year give you all the peaceful sleep, unfiltered joy, incredible career milestones, and all the love you effortlessly give everyone else.
                </p>
                <div className="font-caveat text-xl sm:text-2xl text-pink-300 font-medium">
                  "Look up! Glowing lanterns are floating to heaven for you 🏮"
                </div>
              </div>
            )}
          </section>

          {/* ================= SECTION 4: POLAROID PHOTO KEEPSAKE ================= */}
          <section className="card-dusk-glass p-6 sm:p-8 rounded-3xl text-center">
            <div className="text-xs font-semibold uppercase tracking-widest text-pink-400 mb-1">
              Memory Lane
            </div>
            <h2 className="font-fraunces text-2xl sm:text-3xl font-bold text-white mb-2">
              Our Polaroid Keepsake 📷
            </h2>
            <p className="text-slate-300 text-sm max-w-sm mx-auto mb-6">
              Tap the polaroid or button below to add your favorite picture of Monisha!
            </p>

            {/* Polaroid Frame */}
            <div 
              style={{ transform: `rotate(${polaroidTilt}deg)` }}
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#fefcf8] text-slate-900 p-4 sm:p-5 rounded-md shadow-2xl shadow-black/70 max-w-[340px] mx-auto cursor-pointer transition-all duration-300 hover:rotate-0 hover:scale-[1.02] border border-amber-100"
            >
              {/* Polaroid Image Box */}
              <div className="w-full aspect-square bg-slate-900 rounded-sm overflow-hidden flex items-center justify-center relative group">
                {userPhoto ? (
                  <img 
                    src={userPhoto} 
                    alt="Monisha 21st Birthday Keepsake" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-6 text-center text-slate-300 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mb-3 text-pink-300">
                      <Camera className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-semibold text-slate-200">Tap to upload a photo!</p>
                    <p className="font-caveat text-lg text-pink-400 mt-1">Namma favourite memory inga podu</p>
                  </div>
                )}

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                  <span>📸 Tap to change photo</span>
                </div>
              </div>

              {/* Polaroid Footer */}
              <div className="pt-4 pb-2 text-center">
                <div className="font-caveat text-2xl sm:text-3xl font-bold text-slate-900">
                  Monisha @ 21 · Pure Sunshine 💖
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                  06.11.2005 · Forever Bestie
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            {/* Actions for Polaroid */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Her Photo
              </button>

              <button
                onClick={() => setPolaroidTilt(prev => (prev === -1.5 ? 2.5 : prev === 2.5 ? 0 : -1.5))}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Tilt Frame
              </button>

              <button
                onClick={() => setShowVideoModal(true)}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 hover:bg-indigo-500/30 transition-all flex items-center gap-1.5"
              >
                <Film className="w-3.5 h-3.5 text-indigo-300" />
                Birthday Video Clip 🎬
              </button>
            </div>
          </section>

          {/* ================= SECTION 5: SIX FLIP CARDS ================= */}
          <section className="card-dusk-glass p-6 sm:p-8 rounded-3xl">
            <div className="text-center mb-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-pink-400 mb-1">
                Tap Each Card to Flip ✨
              </div>
              <h2 className="font-fraunces text-2xl sm:text-3xl font-bold text-white mb-1">
                Reasons Why You're Irreplaceable
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm">
                Ovvoru card-layum unakkaaga oru unmaiyaana memory & heartfelt note irukku.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {flipCards.map((card, idx) => {
                const isFlipped = !!flippedCards[idx];
                return (
                  <div
                    key={idx}
                    onClick={(e) => handleCardFlip(idx, e)}
                    className="perspective-1000 min-h-[220px] cursor-pointer"
                  >
                    <div className={`relative w-full h-full min-h-[220px] transition-transform duration-500 transform-style-3d ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}>
                      {/* FRONT OF CARD */}
                      <div className="absolute inset-0 backface-hidden rounded-2xl p-5 flex flex-col justify-between bg-gradient-to-br from-[#231545]/90 to-[#150c2c]/90 border border-pink-500/20 hover:border-pink-500/40 transition-colors shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                            {card.icon}
                          </div>
                          <span className="text-[11px] font-medium text-slate-400 italic">
                            {card.category}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-fraunces text-lg font-bold text-white mb-1">
                            {card.frontTitle}
                          </h3>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {card.frontTeaser}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-pink-400 font-medium">
                          <span>✨ Tap to flip</span>
                          <RotateCcw className="w-3 h-3 text-pink-400" />
                        </div>
                      </div>

                      {/* BACK OF CARD */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-5 flex flex-col justify-between bg-gradient-to-br from-[#3b174d] to-[#1c0c32] border border-pink-400/50 shadow-xl">
                        <div>
                          <h4 className="font-fraunces text-sm font-bold text-pink-200 mb-1.5 flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                            {card.backTitle}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed font-normal">
                            {card.backContent}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-pink-500/20 flex items-center justify-between">
                          <span className="font-caveat text-sm sm:text-base text-amber-200 font-semibold">
                            {card.quote}
                          </span>
                          <span className="text-[10px] text-slate-400">Tap back</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ================= SECTION 6: PERSONAL LETTER ================= */}
          <section className="card-dusk-glass p-6 sm:p-8 rounded-3xl">
            <div className="text-center mb-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-pink-400 mb-1">
                Straight From My Heart
              </div>
              <h2 className="font-fraunces text-2xl sm:text-3xl font-bold text-white mb-1">
                A Personal Letter to Monisha 💌
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm">
                Some words I don't say out loud often enough, written just for you.
              </p>
            </div>

            {/* Vintage Parchment Letter Paper */}
            <div className="bg-[#fefcf8] text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl relative border border-amber-200/80">
              {/* Letter Header Bar */}
              <div className="flex items-center justify-between border-b border-dashed border-slate-300 pb-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-700 text-white font-bold text-sm flex items-center justify-center font-fraunces shadow">
                    M
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Special Edition
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      A Special Letter From Your Friend
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-slate-500">06 Nov 2026</div>
                  <div className="font-caveat text-sm font-bold text-pink-600">Year 21 ✨</div>
                </div>
              </div>

              {/* Salutation */}
              <div className="font-fraunces text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                Hey Monisha (My Friend),
              </div>

              {/* The User's Heartfelt Message */}
              <p className="text-sm sm:text-base leading-relaxed text-slate-700 mb-4">
                Enaku therinji un life la naraya kastam pattu iruka , and neraya vishiyam achive pannanum nanaipa but athulam sila reasons naala mudiyathu , anyway ithu un life unaku pudicha mari vazhthuko seriya yaar enna nanaipanga athulaam yapayumae yosikatthaa seriya , just neeya iru ethukagavum unaa change panikanum nanaikathe and be happy always .
              </p>

              {/* Core Highlight Box */}
              <div className="bg-amber-50/90 border-l-4 border-amber-400 p-4 rounded-r-lg my-4">
                <p className="font-caveat text-xl sm:text-2xl text-amber-900 leading-snug">
                  "Just neeya iru ethukagavum unaa change panikanum nanaikathe and be happy always."
                </p>
              </div>

              <p className="text-sm sm:text-base leading-relaxed text-slate-700 mb-6">
                May this 21st year give you all the peace, courage, and unconditional happiness you deserve. Always here for you as your friend!
              </p>

              {/* Sign-off */}
              <div className="border-t border-dashed border-slate-300 pt-4 text-right">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  With Warm Wishes & Care,
                </div>
                <div className="font-caveat text-3xl font-bold text-rose-600 mt-1 flex items-center justify-end gap-1.5">
                  Your Friend <Heart className="w-5 h-5 fill-rose-600 text-rose-600 inline" />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Always wishing the best for you · 06.11.2005 to Infinity
                </div>
              </div>
            </div>
          </section>

          {/* ================= SECTION 7: FINALE ================= */}
          <section className="text-center py-6">
            <div className="font-caveat text-2xl text-pink-300 mb-1">
              Wait, one last thing...
            </div>
            <h2 className="font-fraunces text-3xl sm:text-4xl font-extrabold text-white mb-2">
              A Finale for the Birthday Queen 👑
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto mb-6">
              Tap the button below to illuminate the dusk sky with fireworks, balloons, and floating lanterns!
            </p>

            <button
              onClick={handleOpenFinale}
              className="px-9 py-4 rounded-full text-base sm:text-lg font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-2xl shadow-pink-500/40 hover:shadow-pink-500/60 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 mx-auto"
            >
              <Sparkles className="w-5 h-5" />
              ✨ One More Surprise! 🎆 💖
            </button>
          </section>

          {/* Footer Note */}
          <footer className="text-center pt-8 border-t border-slate-800/80 text-xs text-slate-400">
            <p className="font-caveat text-lg text-pink-300 mb-1">
              Happy 21st Birthday, Monisha · 06.11.2005 · Made with endless love ❤️
            </p>
            <p className="text-[11px] text-slate-400">
              Crafted especially for your milestone 21st year · No matter what, besties forever.
            </p>
          </footer>
        </div>
      </div>

      {/* ================= FINALE MODAL ================= */}
      {showFinaleModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowFinaleModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300"
        >
          <div className="bg-gradient-to-br from-[#271545] to-[#120826] border border-pink-500/30 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center relative shadow-2xl shadow-purple-950/70">
            <button
              onClick={() => setShowFinaleModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-pink-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              The Grand Birthday Wish 💖
            </div>

            <h3 className="font-fraunces text-2xl sm:text-3xl font-extrabold text-white mb-1">
              Happy 21st Birthday, Monisha! 👑
            </h3>

            <div className="font-caveat text-xl sm:text-2xl text-amber-200 mb-4">
              May the stars always guide your steps ✨
            </div>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6 text-left sm:text-center">
              Inaikku unakku 21 years start aaguthu! This is your golden era Moni. May your twenties be filled with unforgettable journeys, belly-aching laughter, peaceful nights, loyal friends, and every single dream you've whispered to the universe.<br/><br/>
              <strong className="text-pink-300">Never stop being the bold, hilarious, kind-hearted queen you are today!</strong>
            </p>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={launchFireworks}
                className="w-full py-3.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-lg shadow-pink-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Launch More Fireworks! 🎆
              </button>

              <button
                onClick={handleDownloadKeepsake}
                className="w-full py-3 rounded-full text-xs sm:text-sm font-semibold text-pink-200 bg-pink-500/10 border border-pink-500/30 hover:bg-pink-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-pink-400" />
                Download .html Keepsake
              </button>

              {downloadSuccess && (
                <div className="text-xs text-emerald-400 font-medium animate-in fade-in">
                  ✓ Monisha_21st_Birthday_Surprise.html downloaded! Send it on WhatsApp anytime.
                </div>
              )}

              <p className="text-[11px] text-slate-400">
                Save the single file HTML to send to Monisha on WhatsApp or keep forever offline.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIDEO MODAL ================= */}
      {showVideoModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowVideoModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 text-center relative shadow-2xl">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-fraunces text-xl font-bold text-white mb-2">
              Birthday Video Keepsake 🎬
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              A special video memory for Monisha's 21st birthday!
            </p>

            <div className="w-full rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-[500px]">
              <video 
                src="/assets/aistudio/WhatsApp_Video_2026-11-06_at_10.41.28_PM_f13e1026.mp4" 
                controls 
                autoPlay 
                playsInline
                className="w-full h-full object-contain"
              >
                Your browser does not support video tag.
              </video>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setShowVideoModal(false)}
                className="w-full py-2.5 rounded-full text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Back to Keepsake
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
