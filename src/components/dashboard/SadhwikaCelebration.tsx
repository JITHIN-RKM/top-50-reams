'use client';

import { useEffect, useRef, useState } from 'react';

// --- The ONE and ONLY person who gets this -----------------------------------
const SPECIAL_TEAM_ID = 'a25de582-de32-4cea-9e11-3765aacb82be';
const SPECIAL_LEADER_ID = 'user_3IazszF8uI8SYz3X8XivtNX5Oks';

interface Props {
  teamId: string;
  userId: string;
  trigger: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  shape: 'circle' | 'square' | 'star';
  size: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  life: number;
}

function useConfetti(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#FF6BD6','#FF9F1C','#FFFFFF','#A8DADC'];
    const spawn = () => {
      for (let i = 0; i < 12; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: -10,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 3 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: (['circle','square','star'] as const)[Math.floor(Math.random() * 3)],
          size: Math.random() * 10 + 5,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          alpha: 1,
          life: 1,
        });
      }
    };

    const drawStar = (c: CanvasRenderingContext2D, x: number, y: number, r: number) => {
      c.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 4) / 5 - Math.PI / 2;
        const ia = a + Math.PI / 5;
        if (i === 0) c.moveTo(x + r * Math.cos(a), y + r * Math.sin(a));
        else c.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
        c.lineTo(x + (r / 2) * Math.cos(ia), y + (r / 2) * Math.sin(ia));
      }
      c.closePath();
    };

    let t = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (t++ % 3 === 0) spawn();
      particlesRef.current = particlesRef.current.filter(p => p.alpha > 0.01);
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05;
        p.rotation += p.rotationSpeed; p.life -= 0.005; p.alpha = Math.max(0, p.life);
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0,0,p.size/2,0,Math.PI*2); ctx.fill(); }
        else if (p.shape === 'square') { ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size); }
        else { drawStar(ctx,0,0,p.size/2); ctx.fill(); }
        ctx.restore();
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(rafRef.current); particlesRef.current = []; };
  }, [active]);

  return canvasRef;
}

// Use unicode escapes so file encoding never corrupts them
const HEART = '\u2764\uFE0F';
const STAR = '\u2B50';
const GLOWING_STAR = '\uD83C\uDF1F';
const SPARKLES = '\u2728';
const DIZZY = '\uD83D\uDCAB';
const TADA = '\uD83C\uDF89';
const CONFETTI = '\uD83C\uDF8A';
const SPARKLING_HEART = '\uD83D\uDC96';
const CHERRY_BLOSSOM = '\uD83C\uDF38';
const BUTTERFLY = '\uD83E\uDD8B';
const EMOJIS = [HEART, GLOWING_STAR, SPARKLES, DIZZY, TADA, CONFETTI, SPARKLING_HEART, STAR, CHERRY_BLOSSOM, BUTTERFLY];

export function SadhwikaCelebration({ teamId, userId, trigger }: Props) {
  const [visible, setVisible] = useState(false);
  const [floaters, setFloaters] = useState<{ id: number; emoji: string; x: number; delay: number; dur: number }[]>([]);
  const canvasRef = useConfetti(visible);

  const isTheOne = teamId === SPECIAL_TEAM_ID && userId === SPECIAL_LEADER_ID;

  useEffect(() => {
    if (trigger && isTheOne) {
      setVisible(true);
      setFloaters(Array.from({ length: 20 }, (_, i) => ({
        id: i,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        x: Math.random() * 90 + 5,
        delay: Math.random() * 2,
        dur: Math.random() * 3 + 3,
      })));
    }
  }, [trigger, isTheOne]);

  if (!visible || !isTheOne) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 9998 }} />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" style={{ zIndex: 9999 }} onClick={() => setVisible(false)} />

      {floaters.map(f => (
        <div key={f.id} className="fixed pointer-events-none select-none text-2xl"
          style={{ left: `${f.x}%`, bottom: '-2rem', zIndex: 10000,
            animation: `sadhwikaFloat ${f.dur}s ${f.delay}s ease-in infinite` }}>
          {f.emoji}
        </div>
      ))}

      <div className="relative max-w-md w-full mx-auto" style={{ zIndex: 10001 }}>
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-pink-400 via-yellow-300 to-pink-500 opacity-80 blur animate-pulse" />
        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-yellow-200 via-pink-300 to-purple-400 opacity-40 blur-lg animate-ping" style={{ animationDuration: '2s' }} />

        <div className="relative bg-white rounded-2xl p-8 text-center shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-yellow-50 to-purple-50 opacity-80" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="absolute select-none"
                style={{ left: `${(i * 8) % 90}%`, top: `${(i * 13 + 5) % 85}%`,
                  animation: `sadhwikaTwinkle ${1.5 + (i % 5) * 0.4}s ${(i % 3) * 0.6}s ease-in-out infinite alternate`,
                  opacity: 0.4, fontSize: `${0.8 + (i % 3) * 0.3}rem` }}>
                {EMOJIS[i % EMOJIS.length]}
              </span>
            ))}
          </div>

          <div className="relative z-10">
            <div className="text-6xl mb-3" style={{ animation: 'sadhwikaBounce 1s ease-in-out infinite' }}>{TADA}</div>

            <h1 className="text-xl font-black mb-6 leading-tight"
              style={{ background: 'linear-gradient(90deg,#FF6B6B,#FFD93D,#6BCB77,#4D96FF,#FF6BD6,#FF6B6B)',
                backgroundSize: '300% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                animation: 'sadhwikaShimmer 3s linear infinite' }}>
              Thank you so much Sadhwika for finding that bug for me!
            </h1>

            <div className="space-y-3 mb-6">
              <p className="text-gray-700 font-semibold text-base">You made my work so much easier.... {HEART}</p>
              <p className="text-pink-600 font-bold text-base">So this is for you... {HEART}</p>
              <p className="text-purple-600 font-bold text-base">As a token of appreciation... {HEART}</p>
            </div>

            <div className="flex justify-center gap-1 text-2xl mb-6">
              {[STAR, GLOWING_STAR, SPARKLES, DIZZY, GLOWING_STAR, SPARKLES, STAR].map((s, i) => (
                <span key={i} style={{ display: 'inline-block',
                  animation: `sadhwikaTwinkle ${0.8 + i * 0.15}s ease-in-out infinite alternate` }}>{s}</span>
              ))}
            </div>

            <button onClick={() => setVisible(false)}
              className="px-8 py-3 font-black text-white uppercase tracking-wider rounded-full text-sm transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#FF6B6B,#FF6BD6,#4D96FF)',
                boxShadow: '0 4px 20px rgba(255,107,214,0.5)' }}>
              {SPARKLING_HEART} Aww, Thanks!
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sadhwikaFloat { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-100vh) scale(0.5);opacity:0} }
        @keyframes sadhwikaTwinkle { 0%{opacity:0.2;transform:scale(0.8)} 100%{opacity:1;transform:scale(1.2)} }
        @keyframes sadhwikaShimmer { 0%{background-position:0% center} 100%{background-position:300% center} }
        @keyframes sadhwikaBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
      `}</style>
    </div>
  );
}
