import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

/* ─────────────────────────────────────────────
   SUPABASE CLIENT
───────────────────────────────────────────── */
const SUPABASE_URL = "https://aanksddaitghblfrarvj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbmtzZGRhaXRnaGJsZnJhcnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MjE2MDgsImV4cCI6MjA4NzE5NzYwOH0.9U7TdjAd-r4nVhI9VEAa77DBA6Kp5eEsit9FPOZM1N8";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// Navigation helper
const goTo = (path) => {
  if (typeof window.__navigate === "function") window.__navigate(path);
  else window.location.href = path;
};

// localStorage for user profile only (device-specific is correct for this)
const lGet = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } };
const lSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const ROOMS = [
  { id: "general",   label: "General",       icon: "💬", desc: "Talk about anything — the books, the world, the vibes." },
  { id: "iron",      label: "Iron & Shadow", icon: "🗡️", desc: "Deep-dive into Malik Kane's story and the shadow courts." },
  { id: "embers",    label: "Born of Embers",icon: "🔥", desc: "Darius Vael, fire-magic, and the road to revenge." },
  { id: "threshold", label: "The Threshold",  icon: "🚪", desc: "Jonah Cross, door-keeping, and what lies beyond." },
  { id: "theories",  label: "Fan Theories",   icon: "🔮", desc: "Wild guesses, hidden clues, and lore speculation." },
];

const AVATARS = ["🐺","🦅","🐉","🗡️","🔥","⚡","🌑","💀","🦴","🌊","🕷️","🧿","👁️","🌀","🏹"];
const AVATAR_COLORS = ["#7b2fff","#00d4ff","#ff2d7a","#ffb800","#22c55e","#f97316","#a855f7","#06b6d4"];

/* ─────────────────────────────────────────────
   CSS
───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --black:#050507;--deep:#0a0a0f;--dark:#0f0f18;--panel:#13131e;--panel2:#17172a;
  --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.12);
  --cyan:#00d4ff;--cyan2:#00a8cc;--violet:#7b2fff;--violet2:#5a1fcc;
  --magenta:#ff2d7a;--gold:#ffb800;--text:#e8e8f0;--muted:#6b6b85;--soft:#9898b8;
}
html,body,#root{height:100%;overflow:hidden}
body{font-family:'Inter',sans-serif;background:var(--black);color:var(--text);-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(123,47,255,0.4);border-radius:2px}

#comm-particles{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:0.4}

/* ── Layout ── */
.comm-wrap{position:relative;z-index:1;display:grid;grid-template-columns:260px 1fr;height:100vh;overflow:hidden}

/* ── Sidebar ── */
.comm-sidebar{
  background:var(--deep);border-right:1px solid var(--border);
  display:flex;flex-direction:column;overflow:hidden;
}
.comm-logo{
  padding:1.2rem 1.4rem 0.8rem;border-bottom:1px solid var(--border);
  display:flex;flex-direction:column;gap:0.2rem;
}
.comm-logo-top{display:flex;align-items:center;gap:0.7rem}
.comm-logo-icon{
  width:34px;height:34px;border-radius:6px;flex-shrink:0;
  background:linear-gradient(135deg,var(--violet),var(--cyan2));
  display:flex;align-items:center;justify-content:center;font-size:0.95rem;
}
.comm-logo-name{
  font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:0.08em;
  background:linear-gradient(135deg,var(--cyan),var(--violet));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.comm-logo-sub{
  font-family:'Rajdhani',sans-serif;font-size:0.65rem;font-weight:600;
  letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);
  padding-left:0.2rem;
}
.back-link{
  display:inline-flex;align-items:center;gap:0.4rem;
  padding:0.3rem 0;margin-top:0.3rem;
  font-family:'Rajdhani',sans-serif;font-size:0.68rem;font-weight:700;
  letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);
  text-decoration:none;transition:color 0.2s;cursor:pointer;background:none;border:none;
}
.back-link:hover{color:var(--cyan)}

.room-list{flex:1;overflow-y:auto;padding:0.8rem 0}
.room-section-label{
  padding:0.5rem 1.4rem 0.3rem;
  font-family:'Rajdhani',sans-serif;font-size:0.6rem;font-weight:700;
  letter-spacing:0.2em;text-transform:uppercase;color:var(--muted);
}
.room-btn{
  width:100%;display:flex;align-items:center;gap:0.75rem;
  padding:0.55rem 1.4rem;background:none;border:none;cursor:pointer;
  transition:background 0.15s;text-align:left;position:relative;
}
.room-btn:hover{background:rgba(255,255,255,0.03)}
.room-btn.active{background:rgba(123,47,255,0.12)}
.room-btn.active::before{content:'';position:absolute;left:0;top:15%;height:70%;width:2px;background:var(--violet);border-radius:0 2px 2px 0}
.room-icon{font-size:1rem;flex-shrink:0;width:20px;text-align:center}
.room-label{font-family:'Rajdhani',sans-serif;font-weight:600;font-size:0.82rem;letter-spacing:0.06em;color:var(--text)}
.room-btn.active .room-label{color:var(--cyan)}
.room-unread{
  margin-left:auto;min-width:18px;height:18px;border-radius:9px;
  background:var(--violet);display:flex;align-items:center;justify-content:center;
  font-family:'Rajdhani',sans-serif;font-size:0.6rem;font-weight:700;color:#fff;padding:0 4px;
}

.sidebar-profile{
  border-top:1px solid var(--border);padding:1rem 1.4rem;
  display:flex;align-items:center;gap:0.75rem;
}
.sp-avatar{
  width:34px;height:34px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;font-size:1.1rem;
  border:2px solid rgba(123,47,255,0.4);
}
.sp-name{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.82rem;color:var(--text)}
.sp-status{font-family:'Rajdhani',sans-serif;font-size:0.65rem;color:var(--muted);display:flex;align-items:center;gap:0.3rem}
.sp-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;flex-shrink:0}
.sp-edit{
  margin-left:auto;background:none;border:none;color:var(--muted);
  cursor:pointer;font-size:0.85rem;transition:color 0.2s;padding:0.2rem;
}
.sp-edit:hover{color:var(--cyan)}

/* ── Main chat area ── */
.comm-main{display:flex;flex-direction:column;overflow:hidden;background:var(--black)}

.chat-header{
  padding:1rem 1.5rem;border-bottom:1px solid var(--border);
  background:rgba(10,10,15,0.9);backdrop-filter:blur(12px);
  display:flex;align-items:center;justify-content:space-between;flex-shrink:0;
  position:relative;
}
.chat-header::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--violet),transparent);opacity:0.4}
.chat-header-left{display:flex;align-items:center;gap:0.8rem}
.chat-header-icon{font-size:1.3rem}
.chat-header-title{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:0.06em;color:var(--text)}
.chat-header-desc{font-family:'Rajdhani',sans-serif;font-size:0.72rem;color:var(--muted);margin-top:0.1rem;letter-spacing:0.04em}
.online-pill{
  display:flex;align-items:center;gap:0.4rem;
  padding:0.25rem 0.8rem;border-radius:12px;
  background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);
  font-family:'Rajdhani',sans-serif;font-size:0.68rem;font-weight:700;
  letter-spacing:0.1em;text-transform:uppercase;color:#22c55e;
}
.online-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:pulse 2s ease infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}

/* ── Messages ── */
.chat-messages{flex:1;overflow-y:auto;padding:1.2rem 1.5rem;display:flex;flex-direction:column;gap:0.2rem}

.msg-date-divider{
  display:flex;align-items:center;gap:0.8rem;margin:1rem 0 0.5rem;
}
.msg-date-divider span{font-family:'Rajdhani',sans-serif;font-size:0.65rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);white-space:nowrap}
.msg-date-divider::before,.msg-date-divider::after{content:'';flex:1;height:1px;background:var(--border)}

.msg-group{display:flex;gap:0.8rem;padding:0.4rem 0.2rem;border-radius:6px;transition:background 0.15s}
.msg-group:hover{background:rgba(255,255,255,0.015)}
.msg-group.own{flex-direction:row-reverse}

.msg-avatar{
  width:36px;height:36px;border-radius:50%;flex-shrink:0;margin-top:2px;
  display:flex;align-items:center;justify-content:center;font-size:1.1rem;
  border:2px solid rgba(255,255,255,0.06);
}
.msg-content{flex:1;min-width:0}
.msg-group.own .msg-content{display:flex;flex-direction:column;align-items:flex-end}
.msg-meta{display:flex;align-items:baseline;gap:0.5rem;margin-bottom:0.3rem}
.msg-group.own .msg-meta{flex-direction:row-reverse}
.msg-name{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.82rem;letter-spacing:0.04em}
.msg-time{font-family:'Rajdhani',sans-serif;font-size:0.62rem;color:var(--muted)}

.msg-bubble{
  display:inline-block;max-width:520px;
  padding:0.6rem 0.9rem;border-radius:4px 12px 12px 12px;
  background:var(--panel2);border:1px solid var(--border);
  font-family:'Rajdhani',sans-serif;font-size:0.92rem;font-weight:400;
  line-height:1.6;color:var(--text);letter-spacing:0.02em;
  word-break:break-word;
}
.msg-group.own .msg-bubble{
  border-radius:12px 4px 12px 12px;
  background:linear-gradient(135deg,rgba(123,47,255,0.25),rgba(0,168,204,0.15));
  border-color:rgba(123,47,255,0.3);
}

/* Image message */
.msg-img-wrap{margin-top:0.3rem}
.msg-img{
  max-width:280px;max-height:220px;border-radius:8px;
  object-fit:cover;cursor:pointer;border:1px solid var(--border);
  transition:transform 0.2s,box-shadow 0.2s;display:block;
}
.msg-img:hover{transform:scale(1.02);box-shadow:0 8px 30px rgba(0,0,0,0.5)}

/* Emoji-only message */
.msg-emoji{font-size:2.2rem;line-height:1.2}

/* Reactions */
.msg-reactions{display:flex;gap:0.25rem;flex-wrap:wrap;margin-top:0.3rem}
.reaction-btn{
  display:inline-flex;align-items:center;gap:0.2rem;
  padding:0.15rem 0.45rem;border-radius:10px;
  background:rgba(255,255,255,0.04);border:1px solid var(--border);
  font-size:0.7rem;cursor:pointer;transition:all 0.15s;
  font-family:'Rajdhani',sans-serif;font-weight:600;color:var(--muted);
}
.reaction-btn:hover,.reaction-btn.mine{background:rgba(123,47,255,0.15);border-color:rgba(123,47,255,0.3);color:var(--violet)}

/* Lightbox */
.lightbox{position:fixed;inset:0;z-index:900;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;cursor:zoom-out}
.lightbox img{max-width:90vw;max-height:88vh;border-radius:8px;box-shadow:0 40px 100px rgba(0,0,0,0.9)}
.lightbox-x{position:absolute;top:1.5rem;right:1.5rem;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s}
.lightbox-x:hover{background:rgba(255,255,255,0.2)}

/* Typing indicator */
.typing-bar{padding:0.4rem 1.5rem;min-height:26px;flex-shrink:0}
.typing-indicator{display:flex;align-items:center;gap:0.5rem;font-family:'Rajdhani',sans-serif;font-size:0.72rem;color:var(--muted)}
.typing-dots{display:flex;gap:3px;align-items:center}
.typing-dots span{width:4px;height:4px;border-radius:50%;background:var(--muted);animation:typingBounce 1.2s ease infinite}
.typing-dots span:nth-child(2){animation-delay:0.2s}
.typing-dots span:nth-child(3){animation-delay:0.4s}
@keyframes typingBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}

/* ── Input area ── */
.chat-input-area{
  padding:0.8rem 1.5rem 1rem;border-top:1px solid var(--border);
  background:rgba(10,10,15,0.6);flex-shrink:0;
}
.chat-input-box{
  display:flex;align-items:flex-end;gap:0.6rem;
  background:var(--panel2);border:1px solid var(--border2);border-radius:8px;
  padding:0.5rem 0.6rem;transition:border-color 0.2s;
}
.chat-input-box:focus-within{border-color:rgba(123,47,255,0.5)}
.chat-textarea{
  flex:1;background:none;border:none;outline:none;resize:none;
  font-family:'Rajdhani',sans-serif;font-size:0.95rem;font-weight:400;
  color:var(--text);line-height:1.5;letter-spacing:0.02em;
  min-height:24px;max-height:120px;padding:0.2rem 0;
}
.chat-textarea::placeholder{color:var(--muted)}
.input-btn{
  width:34px;height:34px;border-radius:6px;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;font-size:1rem;
  transition:all 0.2s;flex-shrink:0;background:none;color:var(--muted);
}
.input-btn:hover{background:rgba(255,255,255,0.06);color:var(--text)}
.input-send{
  background:linear-gradient(135deg,var(--violet),var(--cyan2));color:#fff;
}
.input-send:hover{box-shadow:0 4px 16px rgba(123,47,255,0.5);transform:translateY(-1px)}
.input-send:disabled{opacity:0.3;cursor:default;transform:none;box-shadow:none}
.img-upload-btn{position:relative;overflow:hidden}
.img-upload-btn input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer}

/* Emoji picker */
.emoji-picker{
  position:absolute;bottom:calc(100% + 8px);right:0;
  background:var(--panel);border:1px solid var(--border2);border-radius:10px;
  padding:0.7rem;display:flex;flex-wrap:wrap;gap:0.2rem;width:240px;
  box-shadow:0 20px 60px rgba(0,0,0,0.7);z-index:50;animation:slideUp 0.2s ease;
}
.emoji-opt{font-size:1.3rem;cursor:pointer;padding:0.2rem;border-radius:4px;transition:background 0.15s;border:none;background:none}
.emoji-opt:hover{background:rgba(255,255,255,0.08)}
.input-relative{position:relative}

/* Input hint */
.input-hint{font-family:'Rajdhani',sans-serif;font-size:0.62rem;color:var(--muted);letter-spacing:0.06em;margin-top:0.4rem;text-align:center}

/* ── Onboarding ── */
.onboard-bg{
  position:fixed;inset:0;z-index:200;
  background:rgba(0,0,0,0.88);backdrop-filter:blur(16px);
  display:flex;align-items:center;justify-content:center;padding:1.5rem;
}
.onboard-box{
  background:var(--panel);border:1px solid var(--border);border-radius:12px;
  max-width:440px;width:100%;padding:2.5rem;
  box-shadow:0 40px 100px rgba(0,0,0,0.9),0 0 60px rgba(123,47,255,0.12);
  animation:slideUp 0.35s cubic-bezier(.34,1.56,.64,1);position:relative;
}
.onboard-box::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),var(--violet),transparent)}
.onboard-title{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:0.06em;background:linear-gradient(135deg,#fff,var(--soft));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:0.3rem}
.onboard-sub{font-family:'Rajdhani',sans-serif;font-size:0.85rem;color:var(--muted);letter-spacing:0.04em;line-height:1.6;margin-bottom:1.8rem}
.onboard-label{font-family:'Rajdhani',sans-serif;font-size:0.68rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:0.5rem}
.onboard-input{width:100%;padding:0.8rem 1rem;border:1px solid var(--border);border-radius:4px;background:rgba(255,255,255,0.03);color:var(--text);font-family:'Rajdhani',sans-serif;font-size:0.95rem;outline:none;transition:border-color 0.2s;letter-spacing:0.04em;margin-bottom:1.2rem}
.onboard-input:focus{border-color:var(--violet)}
.avatar-grid{display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem}
.av-opt{width:40px;height:40px;border-radius:50%;border:2px solid transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.2rem;transition:all 0.2s;background:rgba(255,255,255,0.04)}
.av-opt.sel{border-color:var(--cyan);background:rgba(0,212,255,0.1);transform:scale(1.1)}
.color-grid{display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.5rem}
.col-opt{width:24px;height:24px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all 0.2s}
.col-opt.sel{border-color:#fff;transform:scale(1.2)}
.onboard-btn{width:100%;padding:0.85rem;border:none;border-radius:4px;background:linear-gradient(135deg,var(--violet),var(--cyan2));color:#fff;font-family:'Rajdhani',sans-serif;font-size:0.88rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;transition:all 0.25s;box-shadow:0 4px 20px rgba(123,47,255,0.4)}
.onboard-btn:hover{box-shadow:0 6px 30px rgba(123,47,255,0.6);transform:translateY(-1px)}
.onboard-err{color:var(--magenta);font-family:'Rajdhani',sans-serif;font-size:0.78rem;margin-bottom:0.8rem;letter-spacing:0.04em}

/* Profile edit overlay */
.profile-overlay{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:1.5rem}

/* Animations */
@keyframes slideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.msg-group{animation:msgIn 0.25s ease}

/* ── Responsive ── */
@media(max-width:700px){
  .comm-wrap{grid-template-columns:1fr}
  .comm-sidebar{display:none}
  .comm-sidebar.mob-open{display:flex;position:fixed;inset:0;z-index:100;width:260px}
}
`;

/* ─────────────────────────────────────────────
   PARTICLE SYSTEM
───────────────────────────────────────────── */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); let raf;
    const COLORS = ["#00d4ff","#7b2fff","#ff2d7a","#ffb800"];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.2,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill(); ctx.globalAlpha = 1;
      });
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = pts[i].color; ctx.globalAlpha = (1 - d / 110) * 0.1;
          ctx.lineWidth = 0.5; ctx.stroke(); ctx.globalAlpha = 1;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas id="comm-particles" ref={ref} />;
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const fmtTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtDate = (ts) => {
  const d = new Date(ts), now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "long", day: "numeric" });
};
const isEmojiOnly = (text) => /^(\p{Emoji_Presentation}|\p{Extended_Pictographic}|\s)+$/u.test(text.trim()) && text.trim().length <= 8;
const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const DEMO_MESSAGES = [
  { id:"d1", roomId:"general", userId:"sys", userName:"Rex Magnus", userColor:"#7b2fff", userAvatar:"📖", text:"Welcome to the Rex Magnus Reader Community! This is your space — talk books, share theories, and connect with other fans. 🔥", ts: Date.now() - 3600000 * 3 },
  { id:"d2", roomId:"general", userId:"u_fan1", userName:"DarkCityReader", userColor:"#00d4ff", userAvatar:"🐺", text:"Finally a community for this! Just finished Iron & Shadow last night and I can't stop thinking about it.", ts: Date.now() - 3600000 * 2 },
  { id:"d3", roomId:"general", userId:"u_fan2", userName:"EmberWolf", userColor:"#ff2d7a", userAvatar:"🔥", text:"Same! That ending hit different. No spoilers but... wow.", ts: Date.now() - 3600000 * 1.5 },
  { id:"d4", roomId:"iron",    userId:"u_fan1", userName:"DarkCityReader", userColor:"#00d4ff", userAvatar:"🐺", text:"Can we talk about Malik's backstory? There's so much left unexplained. Feels like there's a bigger world behind it all.", ts: Date.now() - 7200000 },
  { id:"d5", roomId:"theories",userId:"u_fan3", userName:"NightReader99", userColor:"#ffb800", userAvatar:"👁️", text:"Theory: the shadow courts and the door from The Last Threshold are connected. Both deal with old pacts. Rex is building a shared universe?? 👀", ts: Date.now() - 900000 },
];

const QUICK_REACTIONS = ["🔥","💀","👁️","⚡","🏹","💜","😭","🤯"];
const EMOJI_LIST = ["🔥","💀","👁️","⚡","🏹","💜","😭","🤯","🐺","🦅","🐉","🗡️","🌑","🌊","🕷️","🔮","💯","😤","🥶","😈","👏","❤️","😂","🎯","🤔","👀","✨","💪"];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const fmtTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtDate = (ts) => {
  const d = new Date(ts), now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "long", day: "numeric" });
};
const isEmojiOnly = (text) => /^(\p{Emoji_Presentation}|\p{Extended_Pictographic}|\s)+$/u.test(text.trim()) && text.trim().length <= 8;
const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// Map DB row → message object
const rowToMsg = (r) => ({
  id: r.id, roomId: r.room_id, userId: r.user_id,
  userName: r.user_name, userColor: r.user_color, userAvatar: r.user_avatar,
  text: r.text, imgUrl: r.img_url, ts: new Date(r.created_at).getTime(),
  reactions: r.reactions || {},
});

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export default function Community() {
  const [user, setUser] = useState(() => lGet("rm_chat_user") || null);
  const [showOnboard, setShowOnboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [roomId, setRoomId] = useState("general");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { if (!user) setShowOnboard(true); }, [user]);

  // ── Load messages + subscribe to real-time ──
  useEffect(() => {
    setLoading(true);
    // Fetch last 100 messages for current room
    sb.from("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data }) => {
        setMessages(data ? data.map(rowToMsg) : []);
        setLoading(false);
      });

    // Real-time subscription
    const channel = sb
      .channel(`room-${roomId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, rowToMsg(payload.new)];
        });
      })
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "messages",
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        setMessages(prev => prev.map(m => m.id === payload.new.id ? rowToMsg(payload.new) : m));
      })
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, [roomId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Group messages by date
  const grouped = [];
  let lastDate = "";
  messages.forEach(m => {
    const d = fmtDate(m.ts);
    if (d !== lastDate) { grouped.push({ type: "date", label: d, id: "date_" + m.id }); lastDate = d; }
    grouped.push({ type: "msg", msg: m });
  });

  const sendMessage = async (text, imgUrl) => {
    if (!user || sending) return;
    if (!text.trim() && !imgUrl) return;
    setSending(true);
    const id = genId();
    const row = {
      id, room_id: roomId, user_id: user.id,
      user_name: user.name, user_color: user.color, user_avatar: user.avatar,
      text: text.trim(), img_url: imgUrl || "",
      reactions: {}, created_at: new Date().toISOString(),
    };
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await sb.from("messages").insert(row);
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    // Resize large images before storing to keep DB size reasonable
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale; canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        sendMessage("", canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const addReaction = async (msgId, emoji) => {
    if (!user) return;
    const msg = messages.find(m => m.id === msgId); if (!msg) return;
    const r = { ...(msg.reactions || {}) };
    const existing = r[emoji] || { count: 0, users: [] };
    const hasIt = existing.users.includes(user.id);
    r[emoji] = hasIt
      ? { count: existing.count - 1, users: existing.users.filter(u => u !== user.id) }
      : { count: existing.count + 1, users: [...existing.users, user.id] };
    if (r[emoji].count === 0) delete r[emoji];
    // Optimistic update
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: r } : m));
    await sb.from("messages").update({ reactions: r }).eq("id", msgId);
  };

  const unreadCount = (rid) => rid === roomId ? 0 : 0; // real-time handles this

  return (
    <>
      <style>{CSS}</style>
      <Particles />

      <div className="comm-wrap">
        {/* ── SIDEBAR ── */}
        <aside className="comm-sidebar">
          <div className="comm-logo">
            <div className="comm-logo-top">
              <div className="comm-logo-icon">⚔️</div>
              <span className="comm-logo-name">Rex Magnus</span>
            </div>
            <span className="comm-logo-sub">Reader Community</span>
            <button className="back-link" onClick={() => goTo('/')}>← Back to Portfolio</button>
          </div>

          <div className="room-list">
            <p className="room-section-label">Channels</p>
            {ROOMS.map(r => (
              <button key={r.id} className={`room-btn ${roomId === r.id ? "active" : ""}`}
                onClick={() => setRoomId(r.id)}>
                <span className="room-icon">{r.icon}</span>
                <span className="room-label"># {r.label}</span>
              </button>
            ))}
          </div>

          {user && (
            <div className="sidebar-profile">
              <div className="sp-avatar" style={{ background: user.color + "22", borderColor: user.color + "66" }}>
                {user.avatar}
              </div>
              <div>
                <p className="sp-name">{user.name}</p>
                <p className="sp-status"><span className="sp-dot" />Online</p>
              </div>
              <button className="sp-edit" onClick={() => setShowProfile(true)} title="Edit profile">✏️</button>
            </div>
          )}
        </aside>

        {/* ── MAIN ── */}
        <div className="comm-main">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <span className="chat-header-icon">{ROOMS.find(r => r.id === roomId)?.icon}</span>
              <div>
                <p className="chat-header-title"># {ROOMS.find(r => r.id === roomId)?.label}</p>
                <p className="chat-header-desc">{ROOMS.find(r => r.id === roomId)?.desc}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <button onClick={() => goTo('/')}
                style={{ display:"flex",alignItems:"center",gap:"0.4rem",padding:"0.35rem 0.9rem",borderRadius:"4px",border:"1px solid var(--border2)",background:"rgba(255,255,255,0.03)",color:"var(--soft)",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.75rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",transition:"all 0.2s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--cyan)";e.currentTarget.style.color="var(--cyan)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border2)";e.currentTarget.style.color="var(--soft)"}}>
                ← Home
              </button>
              <div className="online-pill"><span className="online-dot" /><span>Live</span></div>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {loading ? (
              <div style={{ display:"flex",alignItems:"center",justifyContent:"center",flex:1,flexDirection:"column",gap:"0.8rem" }}>
                <div style={{ width:"40px",height:"40px",borderRadius:"50%",border:"2px solid var(--violet)",borderTopColor:"transparent",animation:"spin 0.8s linear infinite" }} />
                <p style={{ fontFamily:"'Rajdhani',sans-serif",fontSize:"0.8rem",color:"var(--muted)" }}>Loading messages...</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : grouped.length === 0 ? (
              <div style={{ textAlign:"center",padding:"3rem 1rem" }}>
                <div style={{ fontSize:"2.5rem",marginBottom:"0.8rem" }}>{ROOMS.find(r=>r.id===roomId)?.icon}</div>
                <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.4rem",letterSpacing:"0.06em",color:"var(--text)",marginBottom:"0.4rem" }}>Start the conversation</p>
                <p style={{ fontFamily:"'Rajdhani',sans-serif",fontSize:"0.85rem",color:"var(--muted)" }}>Be the first to post in #{ROOMS.find(r=>r.id===roomId)?.label}</p>
              </div>
            ) : grouped.map(item => {
              if (item.type === "date") return (
                <div key={item.id} className="msg-date-divider"><span>{item.label}</span></div>
              );
              const m = item.msg;
              const isOwn = m.userId === user?.id;
              const emojiOnly = m.text && isEmojiOnly(m.text);
              return (
                <div key={m.id} className={`msg-group ${isOwn ? "own" : ""}`}>
                  <div className="msg-avatar" style={{ background: m.userColor + "22", borderColor: m.userColor + "55" }}>
                    {m.userAvatar}
                  </div>
                  <div className="msg-content">
                    <div className="msg-meta">
                      <span className="msg-name" style={{ color: m.userColor }}>{m.userName}</span>
                      <span className="msg-time">{fmtTime(m.ts)}</span>
                    </div>
                    {m.text && (emojiOnly
                      ? <div className="msg-emoji">{m.text}</div>
                      : <div className="msg-bubble">{m.text}</div>
                    )}
                    {m.imgUrl && (
                      <div className="msg-img-wrap">
                        <img src={m.imgUrl} alt="shared" className="msg-img" onClick={() => setLightbox(m.imgUrl)} />
                      </div>
                    )}
                    <div className="msg-reactions">
                      {Object.entries(m.reactions || {}).filter(([,v]) => v.count > 0).map(([emoji, v]) => (
                        <button key={emoji} className={`reaction-btn ${v.users?.includes(user?.id) ? "mine" : ""}`}
                          onClick={() => addReaction(m.id, emoji)}>
                          {emoji} {v.count}
                        </button>
                      ))}
                      <div style={{ display:"inline-flex",gap:"2px" }}>
                        {QUICK_REACTIONS.slice(0,4).map(em => (
                          <button key={em} className="reaction-btn" style={{ fontSize:"0.8rem",padding:"0.1rem 0.3rem" }}
                            onClick={() => addReaction(m.id, em)}>{em}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing bar (kept for spacing) */}
          <div className="typing-bar" />

          {/* Input */}
          <div className="chat-input-area">
            <div className="chat-input-box">
              <button className="input-btn img-upload-btn" title="Send image">
                📎
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </button>
              <textarea ref={textareaRef} className="chat-textarea" value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,120)+"px"; }}
                onKeyDown={handleKey}
                placeholder={user ? `Message #${ROOMS.find(r=>r.id===roomId)?.label}...` : "Join to start chatting..."}
                disabled={!user || sending} rows={1} />
              <div className="input-relative">
                <button className="input-btn" onClick={() => setShowEmoji(p => !p)}>😊</button>
                {showEmoji && (
                  <div className="emoji-picker" onClick={e => e.stopPropagation()}>
                    {EMOJI_LIST.map(em => (
                      <button key={em} className="emoji-opt"
                        onClick={() => { setInput(p => p + em); setShowEmoji(false); textareaRef.current?.focus(); }}>
                        {em}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="input-btn input-send" onClick={() => sendMessage(input)}
                disabled={!input.trim() || !user || sending}>
                {sending ? "…" : "➤"}
              </button>
            </div>
            <p className="input-hint">Enter to send · Shift+Enter for new line · 📎 to share images</p>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-x" onClick={() => setLightbox(null)}>✕</button>
          <img src={lightbox} alt="Full size" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Onboarding */}
      {showOnboard && (
        <Onboard onDone={u => { setUser(u); lSet("rm_chat_user", u); setShowOnboard(false); }} />
      )}

      {/* Profile edit */}
      {showProfile && user && (
        <div className="profile-overlay" onClick={() => setShowProfile(false)}>
          <div onClick={e => e.stopPropagation()}>
            <Onboard initial={user} isEdit
              onDone={u => { setUser(u); lSet("rm_chat_user", u); setShowProfile(false); }} />
          </div>
        </div>
      )}

      {showEmoji && <div style={{ position:"fixed",inset:0,zIndex:40 }} onClick={() => setShowEmoji(false)} />}
    </>
  );
}

/* ─────────────────────────────────────────────
   ONBOARD / PROFILE FORM
───────────────────────────────────────────── */
function Onboard({ onDone, initial, isEdit }) {
  const [name, setName] = useState(initial?.name || "");
  const [avatar, setAvatar] = useState(initial?.avatar || AVATARS[0]);
  const [color, setColor] = useState(initial?.color || AVATAR_COLORS[0]);
  const [err, setErr] = useState("");

  const submit = () => {
    if (!name.trim()) { setErr("Please choose a display name."); return; }
    if (name.trim().length < 2) { setErr("Name must be at least 2 characters."); return; }
    onDone({ id: initial?.id || genId(), name: name.trim(), avatar, color });
  };

  return (
    <div className="onboard-bg">
      <div className="onboard-box">
        <h2 className="onboard-title">{isEdit ? "Edit Profile" : "Join the Community"}</h2>
        <p className="onboard-sub">
          {isEdit
            ? "Update your display name, avatar, or colour."
            : "Pick your display name and avatar to start chatting with other Rex Magnus readers."}
        </p>

        <label className="onboard-label">Display Name</label>
        <input className="onboard-input" value={name} maxLength={24}
          onChange={e => { setName(e.target.value); setErr(""); }}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="e.g. ShadowReader, DarkCity42..." autoFocus />

        <label className="onboard-label">Choose Avatar</label>
        <div className="avatar-grid">
          {AVATARS.map(a => (
            <button key={a} className={`av-opt ${avatar === a ? "sel" : ""}`}
              style={avatar === a ? { background: color + "22" } : {}}
              onClick={() => setAvatar(a)}>{a}</button>
          ))}
        </div>

        <label className="onboard-label">Colour</label>
        <div className="color-grid">
          {AVATAR_COLORS.map(c => (
            <div key={c} className={`col-opt ${color === c ? "sel" : ""}`}
              style={{ background: c }} onClick={() => setColor(c)} />
          ))}
        </div>

        {/* Preview */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.8rem 1rem", borderRadius: "6px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", marginBottom: "1.2rem" }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: color + "22", border: `2px solid ${color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>{avatar}</div>
          <div>
            <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: "0.88rem", color }}>{name || "Your name"}</p>
            <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "0.65rem", color: "var(--muted)" }}>Preview</p>
          </div>
        </div>

        {err && <p className="onboard-err">⚠ {err}</p>}
        <button className="onboard-btn" onClick={submit}>{isEdit ? "Save Changes" : "Enter Community →"}</button>
      </div>
    </div>
  );
}
