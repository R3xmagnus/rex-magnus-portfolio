import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ══════════════════════════════════════════════
//  SUPABASE CLIENT
// ══════════════════════════════════════════════
const SUPABASE_URL = "https://aanksddaitghblfrarvj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbmtzZGRhaXRnaGJsZnJhcnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MjE2MDgsImV4cCI6MjA4NzE5NzYwOH0.9U7TdjAd-r4nVhI9VEAa77DBA6Kp5eEsit9FPOZM1N8";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ══════════════════════════════════════════════
//  ADMIN CONFIG
//  After your first join, open DevTools → Application → localStorage
//  → rm_chat_user → copy the "id" field → paste below.
// ══════════════════════════════════════════════
const ADMIN_IDS = ["REPLACE_WITH_YOUR_USER_ID"];
const checkIsAdmin = (userId) => ADMIN_IDS.includes(userId);

// ══════════════════════════════════════════════
//  MUTE DURATION OPTIONS
// ══════════════════════════════════════════════
const MUTE_DURATIONS = [
  { label: "1 Hour",   ms: 1 * 60 * 60 * 1000 },
  { label: "6 Hours",  ms: 6 * 60 * 60 * 1000 },
  { label: "12 Hours", ms: 12 * 60 * 60 * 1000 },
  { label: "1 Day",    ms: 24 * 60 * 60 * 1000 },
  { label: "3 Days",   ms: 3 * 24 * 60 * 60 * 1000 },
  { label: "1 Week",   ms: 7 * 24 * 60 * 60 * 1000 },
  { label: "2 Weeks",  ms: 14 * 24 * 60 * 60 * 1000 },
  { label: "1 Month",  ms: 30 * 24 * 60 * 60 * 1000 },
  { label: "3 Months", ms: 90 * 24 * 60 * 60 * 1000 },
  { label: "6 Months", ms: 180 * 24 * 60 * 60 * 1000 },
  { label: "1 Year",   ms: 365 * 24 * 60 * 60 * 1000 },
  { label: "5 Years",  ms: 5 * 365 * 24 * 60 * 60 * 1000 },
  { label: "10 Years", ms: 10 * 365 * 24 * 60 * 60 * 1000 },
];

// ── How many mutes before the mute auto-lifts permanently (admin configurable) ──
const MAX_MUTES_OPTIONS = [1, 2, 3, 4, 5, 10];

const fmtMuteExpiry = (isoString) => {
  if (!isoString) return "";
  const diff = new Date(isoString) - Date.now();
  if (diff <= 0) return "Expired";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return d + "d " + h + "h remaining";
  if (h > 0) return h + "h " + m + "m remaining";
  return m + "m remaining";
};

const muteExpired = (until) => until && new Date(until) <= new Date();

// ══════════════════════════════════════════════
//  NAV / STORAGE HELPERS
// ══════════════════════════════════════════════
const goTo = (path) => {
  if (typeof window.__navigate === "function") window.__navigate(path);
  else window.location.href = path;
};
const lGet = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } };
const lSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// ══════════════════════════════════════════════
//  PROFANITY FILTER
// ══════════════════════════════════════════════
const PROFANITY = ["fuck","shit","bitch","asshole","cunt","motherfucker","nigger","faggot","bastard","cock","dick","pussy","whore","slut","prick","wanker","bollocks"];
const hasProfanity = (text) => {
  const lower = text.toLowerCase().replace(/[^a-z\s]/g, "");
  return PROFANITY.some((w) => new RegExp("\\b" + w + "\\b").test(lower));
};

// ══════════════════════════════════════════════
//  CONSTANTS
// ══════════════════════════════════════════════
const AVATARS = ["🐺","🦅","🐉","🗡️","🔥","⚡","🌑","💀","🦴","🌊","🕷️","🧿","👁️","🌀","🏹"];
const AVATAR_COLORS = ["#7b2fff","#00d4ff","#ff2d7a","#ffb800","#22c55e","#f97316","#a855f7","#06b6d4"];
const QUICK_REACTIONS = ["🔥","💀","👁️","⚡","🏹","💜","😭","🤯"];
const EMOJI_LIST = ["🔥","💀","👁️","⚡","🏹","💜","😭","🤯","🐺","🦅","🐉","🗡️","🌑","🌊","🕷️","🔮","💯","😤","🥶","😈","👏","❤️","😂","🎯","🤔","👀","✨","💪"];

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
const rowToMsg = (r) => ({
  id: r.id, roomId: r.room_id, userId: r.user_id,
  userName: r.user_name, userColor: r.user_color, userAvatar: r.user_avatar,
  text: r.text, imgUrl: r.img_url,
  ts: new Date(r.created_at).getTime(), reactions: r.reactions || {},
});

// ══════════════════════════════════════════════
//  CSS
// ══════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --black:#050507;--deep:#0a0a0f;--dark:#0f0f18;--panel:#13131e;--panel2:#17172a;
  --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.12);
  --cyan:#00d4ff;--cyan2:#00a8cc;--violet:#7b2fff;--magenta:#ff2d7a;
  --gold:#ffb800;--text:#e8e8f0;--muted:#6b6b85;--soft:#9898b8;
}
html,body,#root{height:100%;overflow:hidden}
body{font-family:'Inter',sans-serif;background:var(--black);color:var(--text);-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(123,47,255,0.4);border-radius:2px}
#comm-particles{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:0.4}
input,textarea,button{font-family:inherit}
input,textarea{background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:4px;color:var(--text);outline:none;transition:border-color 0.2s}
input:focus,textarea:focus{border-color:var(--violet)}

/* ── LAYOUT ── */
.comm-wrap{position:relative;z-index:1;display:grid;grid-template-columns:260px 1fr;height:100vh;overflow:hidden}

/* ── SIDEBAR ── */
.comm-sidebar{background:var(--deep);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
.comm-logo{padding:1.2rem 1.4rem 0.8rem;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:0.2rem}
.comm-logo-top{display:flex;align-items:center;gap:0.7rem}
.comm-logo-icon{width:34px;height:34px;border-radius:6px;flex-shrink:0;background:linear-gradient(135deg,var(--violet),var(--cyan2));display:flex;align-items:center;justify-content:center;font-size:0.95rem}
.comm-logo-name{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:0.08em;background:linear-gradient(135deg,var(--cyan),var(--violet));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.comm-logo-sub{font-family:'Rajdhani',sans-serif;font-size:0.65rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);padding-left:0.2rem}
.back-link{display:inline-flex;align-items:center;gap:0.4rem;padding:0.3rem 0;margin-top:0.3rem;font-family:'Rajdhani',sans-serif;font-size:0.68rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);text-decoration:none;transition:color 0.2s;cursor:pointer;background:none;border:none}
.back-link:hover{color:var(--cyan)}
.room-list{flex:1;overflow-y:auto;padding:0.8rem 0}
.room-section-label{padding:0.5rem 1.4rem 0.3rem;font-family:'Rajdhani',sans-serif;font-size:0.6rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--muted)}
.room-btn{width:100%;display:flex;align-items:center;gap:0.75rem;padding:0.55rem 1.4rem;background:none;border:none;cursor:pointer;transition:background 0.15s;text-align:left;position:relative}
.room-btn:hover{background:rgba(255,255,255,0.03)}
.room-btn.active{background:rgba(123,47,255,0.12)}
.room-btn.active::before{content:'';position:absolute;left:0;top:15%;height:70%;width:2px;background:var(--violet);border-radius:0 2px 2px 0}
.room-icon{font-size:1rem;flex-shrink:0;width:20px;text-align:center}
.room-label{font-family:'Rajdhani',sans-serif;font-weight:600;font-size:0.82rem;letter-spacing:0.06em;color:var(--text)}
.room-btn.active .room-label{color:var(--cyan)}
.room-adult-badge{font-size:0.55rem;font-weight:700;padding:0.1rem 0.3rem;border-radius:3px;background:rgba(255,45,122,0.15);border:1px solid rgba(255,45,122,0.3);color:var(--magenta);letter-spacing:0.08em;margin-left:auto;flex-shrink:0}
.sidebar-profile{border-top:1px solid var(--border);padding:1rem 1.4rem;display:flex;align-items:center;gap:0.75rem}
.sp-avatar{width:34px;height:34px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.1rem;border:2px solid rgba(123,47,255,0.4)}
.sp-name{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.82rem;color:var(--text);display:flex;align-items:center;gap:0.3rem;flex-wrap:wrap;line-height:1.3}
.sp-status{font-family:'Rajdhani',sans-serif;font-size:0.65rem;color:var(--muted);display:flex;align-items:center;gap:0.3rem;flex-wrap:wrap}
.sp-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.sp-edit{margin-left:auto;flex-shrink:0;background:none;border:none;color:var(--muted);cursor:pointer;font-size:0.85rem;transition:color 0.2s;padding:0.2rem}
.sp-edit:hover{color:var(--cyan)}

/* ── ADMIN BADGE ── */
.admin-tag{
  display:inline-flex;align-items:center;gap:0.15rem;
  padding:0.05rem 0.35rem;border-radius:3px;
  background:linear-gradient(135deg,rgba(255,184,0,0.22),rgba(255,140,0,0.14));
  border:1px solid rgba(255,184,0,0.5);
  font-family:'Rajdhani',sans-serif;font-size:0.58rem;font-weight:800;
  letter-spacing:0.13em;text-transform:uppercase;color:var(--gold);
  flex-shrink:0;white-space:nowrap;vertical-align:middle;
}

/* ── MAIN ── */
.comm-main{display:flex;flex-direction:column;overflow:hidden;background:var(--black)}
.chat-header{padding:1rem 1.5rem;border-bottom:1px solid var(--border);background:rgba(10,10,15,0.9);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;position:relative}
.chat-header::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--violet),transparent);opacity:0.4}
.chat-header-left{display:flex;align-items:center;gap:0.8rem}
.chat-header-icon{font-size:1.3rem}
.chat-header-title{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:0.06em;color:var(--text)}
.chat-header-desc{font-family:'Rajdhani',sans-serif;font-size:0.72rem;color:var(--muted);margin-top:0.1rem;letter-spacing:0.04em}
.online-pill{display:flex;align-items:center;gap:0.4rem;padding:0.25rem 0.8rem;border-radius:12px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);font-family:'Rajdhani',sans-serif;font-size:0.68rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#22c55e}
.online-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:pulse 2s ease infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}

/* ── MESSAGES ── */
.chat-messages{flex:1;overflow-y:auto;padding:1.2rem 1.5rem;display:flex;flex-direction:column;gap:0.2rem}
.msg-date-divider{display:flex;align-items:center;gap:0.8rem;margin:1rem 0 0.5rem}
.msg-date-divider span{font-family:'Rajdhani',sans-serif;font-size:0.65rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);white-space:nowrap}
.msg-date-divider::before,.msg-date-divider::after{content:'';flex:1;height:1px;background:var(--border)}
.msg-group{display:flex;gap:0.8rem;padding:0.4rem 0.2rem;border-radius:6px;transition:background 0.15s;animation:msgIn 0.25s ease;position:relative}
.msg-group:hover{background:rgba(255,255,255,0.015)}
.msg-group:hover .admin-hover-bar{opacity:1;pointer-events:all}
.msg-group.own{flex-direction:row-reverse}
.msg-avatar{width:36px;height:36px;border-radius:50%;flex-shrink:0;margin-top:2px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;border:2px solid rgba(255,255,255,0.06)}
.msg-content{flex:1;min-width:0}
.msg-group.own .msg-content{display:flex;flex-direction:column;align-items:flex-end}
.msg-meta{display:flex;align-items:center;gap:0.4rem;margin-bottom:0.3rem;flex-wrap:wrap}
.msg-group.own .msg-meta{flex-direction:row-reverse}
.msg-name{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.82rem;letter-spacing:0.04em}
.msg-time{font-family:'Rajdhani',sans-serif;font-size:0.62rem;color:var(--muted)}
.msg-bubble{display:inline-block;max-width:520px;padding:0.6rem 0.9rem;border-radius:4px 12px 12px 12px;background:var(--panel2);border:1px solid var(--border);font-family:'Rajdhani',sans-serif;font-size:0.92rem;font-weight:400;line-height:1.6;color:var(--text);letter-spacing:0.02em;word-break:break-word}
.msg-group.own .msg-bubble{border-radius:12px 4px 12px 12px;background:linear-gradient(135deg,rgba(123,47,255,0.25),rgba(0,168,204,0.15));border-color:rgba(123,47,255,0.3)}
.msg-emoji{font-size:2.2rem;line-height:1.2}
.msg-img-wrap{margin-top:0.3rem}
.msg-img{max-width:280px;max-height:220px;border-radius:8px;object-fit:cover;cursor:pointer;border:1px solid var(--border);transition:transform 0.2s,box-shadow 0.2s;display:block}
.msg-img:hover{transform:scale(1.02);box-shadow:0 8px 30px rgba(0,0,0,0.5)}
.msg-reactions{display:flex;gap:0.25rem;flex-wrap:wrap;margin-top:0.3rem}
.reaction-btn{display:inline-flex;align-items:center;gap:0.2rem;padding:0.15rem 0.45rem;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid var(--border);font-size:0.7rem;cursor:pointer;transition:all 0.15s;font-family:'Rajdhani',sans-serif;font-weight:600;color:var(--muted)}
.reaction-btn:hover,.reaction-btn.mine{background:rgba(123,47,255,0.15);border-color:rgba(123,47,255,0.3);color:var(--violet)}

/* ── ADMIN HOVER BAR on messages ── */
.admin-hover-bar{
  position:absolute;right:0.6rem;top:50%;transform:translateY(-50%);
  display:flex;align-items:center;gap:0.3rem;
  opacity:0;pointer-events:none;transition:opacity 0.15s;
  background:var(--panel);border:1px solid var(--border2);
  border-radius:6px;padding:0.2rem 0.35rem;z-index:5;
}
.ahb-btn{
  background:none;border:none;cursor:pointer;
  font-family:'Rajdhani',sans-serif;font-size:0.65rem;font-weight:800;
  letter-spacing:0.08em;text-transform:uppercase;
  padding:0.2rem 0.42rem;border-radius:3px;transition:all 0.15s;
}
.ahb-mute{color:var(--gold)}
.ahb-mute:hover{background:rgba(255,184,0,0.14)}
.ahb-unmute{color:#22c55e}
.ahb-unmute:hover{background:rgba(34,197,94,0.14)}
.ahb-ban{color:var(--magenta)}
.ahb-ban:hover{background:rgba(255,45,122,0.14)}
.ahb-sep{width:1px;height:14px;background:var(--border2);flex-shrink:0}

/* ── SYS MSGS ── */
.sys-msg{padding:0.5rem 1.2rem;margin:0.2rem 0;border-radius:4px;font-family:'Rajdhani',sans-serif;font-size:0.8rem;letter-spacing:0.04em;text-align:center;flex-shrink:0}
.sys-warn{background:rgba(255,184,0,0.08);border:1px solid rgba(255,184,0,0.2);color:var(--gold)}
.sys-ban{background:rgba(255,45,122,0.08);border:1px solid rgba(255,45,122,0.2);color:var(--magenta)}

/* ── INPUT ── */
.typing-bar{padding:0.4rem 1.5rem;min-height:26px;flex-shrink:0}
.chat-input-area{padding:0.8rem 1.5rem 1rem;border-top:1px solid var(--border);background:rgba(10,10,15,0.6);flex-shrink:0}
.chat-input-box{display:flex;align-items:flex-end;gap:0.6rem;background:var(--panel2);border:1px solid var(--border2);border-radius:8px;padding:0.5rem 0.6rem;transition:border-color 0.2s}
.chat-input-box:focus-within{border-color:rgba(123,47,255,0.5)}
.chat-textarea{flex:1;background:none;border:none;outline:none;resize:none;font-family:'Rajdhani',sans-serif;font-size:0.95rem;font-weight:400;color:var(--text);line-height:1.5;letter-spacing:0.02em;min-height:24px;max-height:120px;padding:0.2rem 0}
.chat-textarea::placeholder{color:var(--muted)}
.input-btn{width:34px;height:34px;border-radius:6px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1rem;transition:all 0.2s;flex-shrink:0;background:none;color:var(--muted)}
.input-btn:hover{background:rgba(255,255,255,0.06);color:var(--text)}
.input-send{background:linear-gradient(135deg,var(--violet),var(--cyan2));color:#fff}
.input-send:hover{box-shadow:0 4px 16px rgba(123,47,255,0.5);transform:translateY(-1px)}
.input-send:disabled{opacity:0.3;cursor:default;transform:none;box-shadow:none}
.img-upload-btn{position:relative;overflow:hidden}
.img-upload-btn input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer}
.input-relative{position:relative}
.emoji-picker{position:absolute;bottom:calc(100% + 8px);right:0;background:var(--panel);border:1px solid var(--border2);border-radius:10px;padding:0.7rem;display:flex;flex-wrap:wrap;gap:0.2rem;width:240px;box-shadow:0 20px 60px rgba(0,0,0,0.7);z-index:50;animation:slideUp 0.2s ease}
.emoji-opt{font-size:1.3rem;cursor:pointer;padding:0.2rem;border-radius:4px;transition:background 0.15s;border:none;background:none}
.emoji-opt:hover{background:rgba(255,255,255,0.08)}
.input-hint{font-family:'Rajdhani',sans-serif;font-size:0.62rem;color:var(--muted);letter-spacing:0.06em;margin-top:0.4rem;text-align:center}

/* ── LIGHTBOX ── */
.lightbox{position:fixed;inset:0;z-index:900;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;cursor:zoom-out}
.lightbox img{max-width:90vw;max-height:88vh;border-radius:8px;box-shadow:0 40px 100px rgba(0,0,0,0.9)}
.lightbox-x{position:absolute;top:1.5rem;right:1.5rem;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s}
.lightbox-x:hover{background:rgba(255,255,255,0.2)}

/* ── ONBOARDING ── */
.onboard-bg{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.88);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;padding:1.5rem}
.onboard-box{background:var(--panel);border:1px solid var(--border);border-radius:12px;max-width:440px;width:100%;padding:2.5rem;box-shadow:0 40px 100px rgba(0,0,0,0.9),0 0 60px rgba(123,47,255,0.12);animation:slideUp 0.35s cubic-bezier(.34,1.56,.64,1);position:relative;max-height:90vh;overflow-y:auto}
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
.profile-overlay{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:1.5rem}
.home-btn{display:flex;align-items:center;gap:0.4rem;padding:0.35rem 0.9rem;border-radius:4px;border:1px solid var(--border2);background:rgba(255,255,255,0.03);color:var(--soft);cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;transition:all 0.2s}
.home-btn:hover{border-color:var(--cyan);color:var(--cyan)}

/* ── MUTE MODAL ── */
.modal-bg{position:fixed;inset:0;z-index:800;background:rgba(0,0,0,0.85);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:1.5rem;animation:fadeIn 0.18s ease}
.mute-modal{background:var(--panel);border:1px solid var(--border2);border-radius:12px;max-width:460px;width:100%;padding:2rem;box-shadow:0 40px 100px rgba(0,0,0,0.9),0 0 50px rgba(255,184,0,0.06);animation:slideUp 0.28s cubic-bezier(.34,1.56,.64,1);position:relative}
.mute-modal::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}
.mute-modal h3{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:0.06em;color:var(--gold);margin-bottom:0.25rem}
.mute-modal-sub{font-family:'Rajdhani',sans-serif;font-size:0.82rem;color:var(--muted);line-height:1.65;margin-bottom:1.5rem;letter-spacing:0.03em}
.mute-modal-label{font-family:'Rajdhani',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:0.55rem}
.mute-duration-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0.35rem;margin-bottom:1.4rem}
.mute-dur-btn{padding:0.45rem 0.3rem;border-radius:4px;border:1px solid var(--border);background:rgba(255,255,255,0.02);color:var(--soft);font-family:'Rajdhani',sans-serif;font-size:0.72rem;font-weight:600;letter-spacing:0.04em;cursor:pointer;transition:all 0.15s;text-align:center;line-height:1.3}
.mute-dur-btn:hover{border-color:rgba(255,184,0,0.4);color:var(--gold);background:rgba(255,184,0,0.06)}
.mute-dur-btn.sel{border-color:var(--gold);color:var(--gold);background:rgba(255,184,0,0.12)}
.mute-max-row{display:flex;align-items:center;gap:0.8rem;margin-bottom:1.5rem;padding:0.9rem 1rem;border-radius:6px;background:rgba(255,255,255,0.02);border:1px solid var(--border)}
.mute-max-label{font-family:'Rajdhani',sans-serif;font-size:0.78rem;color:var(--soft);flex:1;line-height:1.5;letter-spacing:0.03em}
.mute-max-label strong{color:var(--text);display:block;font-size:0.72rem;margin-bottom:0.15rem;letter-spacing:0.08em;text-transform:uppercase}
.mute-max-select{padding:0.45rem 0.6rem;border-radius:4px;border:1px solid var(--border2);background:rgba(255,255,255,0.04);color:var(--text);font-family:'Rajdhani',sans-serif;font-size:0.82rem;font-weight:600;cursor:pointer;min-width:80px;outline:none}
.mute-max-select:focus{border-color:var(--gold)}
.mute-modal-actions{display:flex;gap:0.6rem}
.mute-confirm{flex:1;padding:0.78rem;border:none;border-radius:4px;background:linear-gradient(135deg,rgba(255,184,0,0.95),rgba(255,130,0,0.85));color:#0a0a00;font-family:'Rajdhani',sans-serif;font-size:0.82rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;transition:all 0.2s}
.mute-confirm:hover{box-shadow:0 4px 20px rgba(255,184,0,0.45);transform:translateY(-1px)}
.mute-cancel{padding:0.78rem 1.2rem;background:none;border:1px solid var(--border);border-radius:4px;color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:0.82rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;transition:all 0.2s}
.mute-cancel:hover{border-color:var(--text);color:var(--text)}

/* ── ANIMATIONS ── */
@keyframes slideUp{from{transform:translateY(26px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}

@media(max-width:700px){
  .comm-wrap{grid-template-columns:1fr}
  .comm-sidebar{display:none}
}
`;

// ══════════════════════════════════════════════
//  PARTICLES
// ══════════════════════════════════════════════
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const COLORS = ["#00d4ff","#7b2fff","#ff2d7a","#ffb800"];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.2,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill(); ctx.globalAlpha = 1;
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 110) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = pts[i].color; ctx.globalAlpha = (1 - d/110) * 0.1;
            ctx.lineWidth = 0.5; ctx.stroke(); ctx.globalAlpha = 1;
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas id="comm-particles" ref={ref} />;
}

// ══════════════════════════════════════════════
//  MUTE MODAL
// ══════════════════════════════════════════════
function MuteModal({ target, onConfirm, onCancel }) {
  const [selMs, setSelMs] = useState(MUTE_DURATIONS[3].ms);   // default: 1 Day
  const [maxMutes, setMaxMutes] = useState(3);                 // auto-lift after N mutes

  return (
    <div className="modal-bg" onClick={onCancel}>
      <div className="mute-modal" onClick={(e) => e.stopPropagation()}>
        <h3>🔇 Mute User</h3>
        <p className="mute-modal-sub">
          Muting <strong style={{ color: "var(--text)" }}>{target.name}</strong>.
          The mute will lift automatically when the timer expires.
          You can also set a total mute limit — when the user has been muted that many
          times, their next mute expires and will not reapply.
        </p>

        <span className="mute-modal-label">Mute Duration</span>
        <div className="mute-duration-grid">
          {MUTE_DURATIONS.map((d) => (
            <button
              key={d.ms}
              className={"mute-dur-btn" + (selMs === d.ms ? " sel" : "")}
              onClick={() => setSelMs(d.ms)}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="mute-max-row">
          <div className="mute-max-label">
            <strong>Auto-Lift After</strong>
            After this many total mutes the restriction is permanently cleared.
          </div>
          <select
            className="mute-max-select"
            value={maxMutes}
            onChange={(e) => setMaxMutes(Number(e.target.value))}
          >
            {MAX_MUTES_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} mute{n !== 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>

        <div className="mute-modal-actions">
          <button className="mute-confirm" onClick={() => onConfirm(selMs, maxMutes)}>
            Apply Mute
          </button>
          <button className="mute-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════
export default function Community() {
  const [user, setUser]             = useState(() => lGet("rm_chat_user") || null);
  const [modStatus, setModStatus]   = useState(null);
  const [showOnboard, setShowOnboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [channels, setChannels]     = useState([]);
  const [roomId, setRoomId]         = useState("general");
  const [messages, setMessages]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [chLoading, setChLoading]   = useState(true);
  const [input, setInput]           = useState("");
  const [showEmoji, setShowEmoji]   = useState(false);
  const [lightbox, setLightbox]     = useState(null);
  const [sending, setSending]       = useState(false);
  const [sysMsg, setSysMsg]         = useState(null);
  const [muteTarget, setMuteTarget] = useState(null);   // { id, name } of user admin is muting
  // Cache of other users' mod status so the hover bar knows muted vs not
  const [modCache, setModCache]     = useState({});

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

  const userIsAdmin = user ? checkIsAdmin(user.id) : false;

  // ── Show onboarding when no user ──
  useEffect(() => { if (!user) setShowOnboard(true); }, [user]);

  // ── Channels ──
  useEffect(() => {
    setChLoading(true);
    sb.from("channels").select("*").order("sort_order")
      .then(({ data }) => { setChannels(data || []); setChLoading(false); });
    const ch = sb.channel("channels-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "channels" }, () => {
        sb.from("channels").select("*").order("sort_order")
          .then(({ data }) => setChannels(data || []));
      }).subscribe();
    return () => sb.removeChannel(ch);
  }, []);

  // ── Own mod status (realtime) ──
  useEffect(() => {
    if (!user) return;
    sb.from("moderation").select("*").eq("user_id", user.id).single()
      .then(({ data }) => setModStatus(data || null));
    const ch = sb.channel("mod-self-" + user.id)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "moderation", filter: "user_id=eq." + user.id },
        ({ new: row }) => setModStatus(row)
      ).subscribe();
    return () => sb.removeChannel(ch);
  }, [user?.id]);

  // ── Messages (realtime) ──
  useEffect(() => {
    setLoading(true);
    sb.from("messages").select("*").eq("room_id", roomId)
      .order("created_at", { ascending: true }).limit(100)
      .then(({ data }) => { setMessages(data ? data.map(rowToMsg) : []); setLoading(false); });
    const ch = sb.channel("room-" + roomId)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: "room_id=eq." + roomId },
        (p) => setMessages((prev) => prev.find((m) => m.id === p.new.id) ? prev : [...prev, rowToMsg(p.new)])
      )
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: "room_id=eq." + roomId },
        (p) => setMessages((prev) => prev.map((m) => m.id === p.new.id ? rowToMsg(p.new) : m))
      ).subscribe();
    return () => sb.removeChannel(ch);
  }, [roomId]);

  // ── Auto-scroll ──
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ── Auto-lift expired mutes every 60s ──
  useEffect(() => {
    const lift = async () => {
      if (modStatus?.status === "muted" && muteExpired(modStatus.mute_until)) {
        const upd = { status: "ok", reason: "Mute expired", updated_at: new Date().toISOString() };
        await sb.from("moderation").update(upd).eq("user_id", user.id);
        setModStatus((p) => ({ ...p, ...upd }));
      }
    };
    lift();
    const t = setInterval(lift, 60000);
    return () => clearInterval(t);
  }, [modStatus?.status, modStatus?.mute_until]);

  // ── Computed state ──
  const currentChannel = channels.find((c) => c.id === roomId) || null;
  const isAdultChannel = currentChannel?.is_adult || false;
  const isBanned = modStatus?.status === "banned";
  const isMuted  = modStatus?.status === "muted" && !muteExpired(modStatus?.mute_until);
  const inputDisabled = !user || sending || isBanned || isMuted;

  const inputPlaceholder = isBanned
    ? "You are banned from this community."
    : isMuted
    ? "You are muted · " + fmtMuteExpiry(modStatus?.mute_until)
    : !user
    ? "Join to start chatting..."
    : "Message #" + (currentChannel?.label || roomId) + "...";

  // ── Date-grouped message list ──
  const grouped = [];
  let lastDate = "";
  messages.forEach((m) => {
    const d = fmtDate(m.ts);
    if (d !== lastDate) { grouped.push({ type: "date", label: d, key: "d_" + m.id }); lastDate = d; }
    grouped.push({ type: "msg", msg: m });
  });

  // ── Send message ──
  const sendMessage = async (text, imgUrl) => {
    if (!user || sending) return;
    if (!text.trim() && !imgUrl) return;
    if (isBanned) {
      setSysMsg({ type: "ban", text: "⛔ You are banned from this community." });
      setTimeout(() => setSysMsg(null), 4000);
      return;
    }
    if (isMuted) {
      setSysMsg({ type: "warn", text: "🔇 You are muted · " + fmtMuteExpiry(modStatus?.mute_until) });
      setTimeout(() => setSysMsg(null), 4000);
      return;
    }
    // Profanity check
    if (!isAdultChannel && text.trim() && hasProfanity(text)) {
      const curW = modStatus?.warnings || 0;
      const newW = curW + 1;
      if (newW >= 2) {
        const row = { user_id: user.id, user_name: user.name, status: "banned", warnings: newW, reason: "Auto-banned: profanity", updated_at: new Date().toISOString() };
        await sb.from("moderation").upsert(row, { onConflict: "user_id" });
        setModStatus(row);
        setSysMsg({ type: "ban", text: "⛔ You have been banned for repeated profanity." });
        setTimeout(() => setSysMsg(null), 6000);
      } else {
        const row = { user_id: user.id, user_name: user.name, status: "warned" + newW, warnings: newW, reason: "Warning " + newW + ": profanity", updated_at: new Date().toISOString() };
        await sb.from("moderation").upsert(row, { onConflict: "user_id" });
        setModStatus(row);
        setSysMsg({ type: "warn", text: "⚠ Warning " + newW + "/2: Profanity isn't allowed here. One more and you'll be banned." });
        setTimeout(() => setSysMsg(null), 6000);
      }
      return;
    }
    setSending(true);
    await sb.from("messages").insert({
      id: genId(), room_id: roomId, user_id: user.id,
      user_name: user.name, user_color: user.color, user_avatar: user.avatar,
      text: text.trim(), img_url: imgUrl || "",
      reactions: {}, created_at: new Date().toISOString(),
    });
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800, scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = img.width * scale; c.height = img.height * scale;
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        sendMessage("", c.toDataURL("image/jpeg", 0.75));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const addReaction = async (msgId, emoji) => {
    if (!user) return;
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;
    const r = { ...(msg.reactions || {}) };
    const ex = r[emoji] || { count: 0, users: [] };
    const has = ex.users.includes(user.id);
    r[emoji] = has
      ? { count: ex.count - 1, users: ex.users.filter((u) => u !== user.id) }
      : { count: ex.count + 1, users: [...ex.users, user.id] };
    if (r[emoji].count === 0) delete r[emoji];
    setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, reactions: r } : m));
    await sb.from("messages").update({ reactions: r }).eq("id", msgId);
  };

  // ── Fetch a user's mod status for the hover bar ──
  const fetchModCache = async (uid) => {
    if (modCache[uid] !== undefined) return;
    setModCache((p) => ({ ...p, [uid]: null }));
    const { data } = await sb.from("moderation").select("status,mute_until,mute_count,max_mutes")
      .eq("user_id", uid).single();
    setModCache((p) => ({ ...p, [uid]: data || { status: "ok" } }));
  };

  const cachedStatus = (uid) => {
    const c = modCache[uid];
    if (!c) return "ok";
    if (c.status === "muted" && muteExpired(c.mute_until)) return "ok";
    return c.status || "ok";
  };

  // ── ADMIN: open mute picker ──
  const openMute = (uid, uname) => {
    if (!userIsAdmin || checkIsAdmin(uid)) return;
    setMuteTarget({ id: uid, name: uname });
  };

  // ── ADMIN: apply mute with duration + max-mutes ──
  const applyMute = async (durationMs, maxMutes) => {
    if (!muteTarget || !userIsAdmin) return;
    const uid  = muteTarget.id;
    const uname = muteTarget.name;
    // Get current mute count from DB
    const { data: existing } = await sb.from("moderation").select("mute_count").eq("user_id", uid).single();
    const prevCount = existing?.mute_count || 0;
    const newCount  = prevCount + 1;

    // If they've hit their max, lift instead of muting again
    if (newCount > maxMutes) {
      const row = {
        user_id: uid, user_name: uname, status: "ok",
        warnings: 0, reason: "Mute auto-lifted: exceeded max mute limit (" + maxMutes + ")",
        mute_until: null, mute_count: newCount, max_mutes: maxMutes,
        updated_at: new Date().toISOString(),
      };
      await sb.from("moderation").upsert(row, { onConflict: "user_id" });
    } else {
      const muteUntil = new Date(Date.now() + durationMs).toISOString();
      const dur = MUTE_DURATIONS.find((d) => d.ms === durationMs)?.label || "";
      const row = {
        user_id: uid, user_name: uname, status: "muted",
        warnings: 0, reason: "Admin mute: " + dur,
        mute_until: muteUntil, mute_count: newCount, max_mutes: maxMutes,
        updated_at: new Date().toISOString(),
      };
      await sb.from("moderation").upsert(row, { onConflict: "user_id" });
    }
    // Refresh cache
    setModCache((p) => ({ ...p, [uid]: undefined }));
    setMuteTarget(null);
  };

  // ── ADMIN: unmute ──
  const adminUnmute = async (uid, uname) => {
    if (!userIsAdmin) return;
    const row = {
      user_id: uid, user_name: uname, status: "ok",
      warnings: 0, reason: "Admin unmuted", mute_until: null,
      updated_at: new Date().toISOString(),
    };
    await sb.from("moderation").upsert(row, { onConflict: "user_id" });
    setModCache((p) => ({ ...p, [uid]: undefined }));
  };

  // ── ADMIN: ban ──
  const adminBan = async (uid, uname) => {
    if (!userIsAdmin || checkIsAdmin(uid)) return;
    if (!window.confirm("Ban " + uname + "? They won't be able to send messages.")) return;
    const row = {
      user_id: uid, user_name: uname, status: "banned",
      warnings: 0, reason: "Admin ban", mute_until: null,
      updated_at: new Date().toISOString(),
    };
    await sb.from("moderation").upsert(row, { onConflict: "user_id" });
    setModCache((p) => ({ ...p, [uid]: undefined }));
  };

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
            <button className="back-link" onClick={() => goTo("/")}>← Back to Portfolio</button>
          </div>

          <div className="room-list">
            <p className="room-section-label">Channels</p>
            {chLoading
              ? <div style={{ padding: "1rem 1.4rem", fontFamily: "'Rajdhani',sans-serif", fontSize: "0.75rem", color: "var(--muted)" }}>Loading...</div>
              : channels.map((r) => (
                <button key={r.id} className={"room-btn" + (roomId === r.id ? " active" : "")} onClick={() => setRoomId(r.id)}>
                  <span className="room-icon">{r.icon}</span>
                  <span className="room-label"># {r.label}</span>
                  {r.is_adult && <span className="room-adult-badge">18+</span>}
                </button>
              ))
            }
          </div>

          {user && (
            <div className="sidebar-profile">
              <div className="sp-avatar" style={{ background: user.color + "22", borderColor: user.color + "66" }}>
                {user.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="sp-name">
                  {userIsAdmin && <span className="admin-tag">⚡ Admin</span>}
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</span>
                </p>
                <p className="sp-status">
                  <span className="sp-dot" style={{ background: isBanned ? "var(--magenta)" : isMuted ? "var(--gold)" : "#22c55e" }} />
                  {isBanned ? "Banned" : isMuted ? "Muted · " + fmtMuteExpiry(modStatus?.mute_until) : userIsAdmin ? "Admin · Online" : "Online"}
                </p>
              </div>
              <button className="sp-edit" onClick={() => setShowProfile(true)}>✏️</button>
            </div>
          )}
        </aside>

        {/* ── MAIN CHAT ── */}
        <div className="comm-main">

          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <span className="chat-header-icon">{currentChannel?.icon || "💬"}</span>
              <div>
                <p className="chat-header-title">
                  # {currentChannel?.label || roomId}
                  {isAdultChannel && (
                    <span style={{ marginLeft: "0.5rem", fontSize: "0.6rem", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, padding: "0.1rem 0.4rem", borderRadius: "3px", background: "rgba(255,45,122,0.15)", border: "1px solid rgba(255,45,122,0.3)", color: "var(--magenta)" }}>18+</span>
                  )}
                </p>
                <p className="chat-header-desc">{currentChannel?.description || ""}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <button className="home-btn" onClick={() => goTo("/")}>← Home</button>
              <div className="online-pill"><span className="online-dot" /><span>Live</span></div>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, flexDirection: "column", gap: "0.8rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid var(--violet)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "0.8rem", color: "var(--muted)" }}>Loading messages...</p>
              </div>
            ) : grouped.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.8rem" }}>{currentChannel?.icon || "💬"}</div>
                <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.4rem", letterSpacing: "0.06em", color: "var(--text)", marginBottom: "0.4rem" }}>Start the conversation</p>
                <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "0.85rem", color: "var(--muted)" }}>Be the first to post in #{currentChannel?.label || roomId}</p>
              </div>
            ) : (
              grouped.map((item) => {
                if (item.type === "date") {
                  return <div key={item.key} className="msg-date-divider"><span>{item.label}</span></div>;
                }
                const m = item.msg;
                const isOwn       = m.userId === user?.id;
                const emojiOnly   = m.text && isEmojiOnly(m.text);
                const msgIsAdmin  = checkIsAdmin(m.userId);
                // Admin hover bar: show for admins, on other people's messages, not on other admins
                const showBar     = userIsAdmin && !isOwn && !msgIsAdmin;
                const mStatus     = cachedStatus(m.userId);

                return (
                  <div
                    key={m.id}
                    className={"msg-group" + (isOwn ? " own" : "")}
                    onMouseEnter={() => { if (showBar) fetchModCache(m.userId); }}
                  >
                    <div className="msg-avatar" style={{ background: m.userColor + "22", borderColor: m.userColor + "55" }}>
                      {m.userAvatar}
                    </div>

                    <div className="msg-content">
                      <div className="msg-meta">
                        {/* ⚡ Admin tag before name */}
                        {msgIsAdmin && <span className="admin-tag">⚡ Admin</span>}
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
                        {Object.entries(m.reactions || {}).filter(([, v]) => v.count > 0).map(([emoji, v]) => (
                          <button key={emoji} className={"reaction-btn" + (v.users?.includes(user?.id) ? " mine" : "")} onClick={() => addReaction(m.id, emoji)}>
                            {emoji} {v.count}
                          </button>
                        ))}
                        {QUICK_REACTIONS.slice(0, 4).map((em) => (
                          <button key={em} className="reaction-btn" style={{ fontSize: "0.8rem", padding: "0.1rem 0.3rem" }} onClick={() => addReaction(m.id, em)}>{em}</button>
                        ))}
                      </div>
                    </div>

                    {/* Admin hover action bar */}
                    {showBar && (
                      <div className="admin-hover-bar">
                        {mStatus === "muted"
                          ? <button className="ahb-btn ahb-unmute" onClick={() => adminUnmute(m.userId, m.userName)}>Unmute</button>
                          : <button className="ahb-btn ahb-mute"   onClick={() => openMute(m.userId, m.userName)}>Mute</button>
                        }
                        <div className="ahb-sep" />
                        {mStatus !== "banned" && (
                          <button className="ahb-btn ahb-ban" onClick={() => adminBan(m.userId, m.userName)}>Ban</button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Flash system message */}
          {sysMsg && (
            <div className={"sys-msg " + (sysMsg.type === "ban" ? "sys-ban" : "sys-warn")}>{sysMsg.text}</div>
          )}

          {/* Persistent own status bar */}
          {modStatus && modStatus.status !== "ok" && !sysMsg && (
            <div className={"sys-msg " + (isBanned ? "sys-ban" : "sys-warn")}>
              {isBanned && "⛔ You are banned from this community."}
              {isMuted  && "🔇 You are muted · " + fmtMuteExpiry(modStatus?.mute_until)}
              {modStatus.status === "warned1" && "⚠ Warning 1/2: Profanity isn't allowed here. One more and you'll be banned."}
              {modStatus.status === "warned2" && "⚠ Warning 2/2: Final warning. Next violation results in a ban."}
            </div>
          )}

          <div className="typing-bar" />

          {/* Input */}
          <div className="chat-input-area">
            <div className="chat-input-box">
              <button className="input-btn img-upload-btn" disabled={inputDisabled}>
                📎<input type="file" accept="image/*" onChange={handleImageUpload} disabled={inputDisabled} />
              </button>
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKey}
                placeholder={inputPlaceholder}
                disabled={inputDisabled}
                rows={1}
              />
              <div className="input-relative">
                <button className="input-btn" onClick={() => setShowEmoji((p) => !p)} disabled={inputDisabled}>😊</button>
                {showEmoji && (
                  <div className="emoji-picker" onClick={(e) => e.stopPropagation()}>
                    {EMOJI_LIST.map((em) => (
                      <button key={em} className="emoji-opt" onClick={() => { setInput((p) => p + em); setShowEmoji(false); textareaRef.current?.focus(); }}>{em}</button>
                    ))}
                  </div>
                )}
              </div>
              <button className="input-btn input-send" onClick={() => sendMessage(input)} disabled={!input.trim() || inputDisabled}>
                {sending ? "…" : "➤"}
              </button>
            </div>
            {isAdultChannel
              ? <p className="input-hint" style={{ color: "rgba(255,45,122,0.5)" }}>🔞 18+ channel — content rules do not apply here</p>
              : <p className="input-hint">Enter to send · Shift+Enter for new line · 📎 to share images</p>
            }
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-x" onClick={() => setLightbox(null)}>✕</button>
          <img src={lightbox} alt="Full size" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Mute modal */}
      {muteTarget && (
        <MuteModal target={muteTarget} onConfirm={applyMute} onCancel={() => setMuteTarget(null)} />
      )}

      {/* Onboarding */}
      {showOnboard && (
        <Onboard onDone={(u) => { setUser(u); lSet("rm_chat_user", u); setShowOnboard(false); }} />
      )}

      {/* Profile edit */}
      {showProfile && user && (
        <div className="profile-overlay" onClick={() => setShowProfile(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Onboard initial={user} isEdit onDone={(u) => { setUser(u); lSet("rm_chat_user", u); setShowProfile(false); }} />
          </div>
        </div>
      )}

      {showEmoji && <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setShowEmoji(false)} />}
    </>
  );
}

// ══════════════════════════════════════════════
//  ONBOARD / PROFILE EDIT
// ══════════════════════════════════════════════
function Onboard({ onDone, initial, isEdit }) {
  const [name,   setName]   = useState(initial?.name   || "");
  const [avatar, setAvatar] = useState(initial?.avatar || AVATARS[0]);
  const [color,  setColor]  = useState(initial?.color  || AVATAR_COLORS[0]);
  const [err,    setErr]    = useState("");

  const submit = () => {
    if (!name.trim())          { setErr("Please choose a display name."); return; }
    if (name.trim().length < 2){ setErr("Name must be at least 2 characters."); return; }
    onDone({ id: initial?.id || genId(), name: name.trim(), avatar, color });
  };

  return (
    <div className="onboard-bg">
      <div className="onboard-box">
        <h2 className="onboard-title">{isEdit ? "Edit Profile" : "Join the Community"}</h2>
        <p className="onboard-sub">
          {isEdit ? "Update your display name, avatar, or colour." : "Pick your display name and avatar to start chatting with other Rex Magnus readers."}
        </p>

        <label className="onboard-label">Display Name</label>
        <input
          className="onboard-input" value={name} maxLength={24}
          onChange={(e) => { setName(e.target.value); setErr(""); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="e.g. ShadowReader, DarkCity42..."
          autoFocus
        />

        <label className="onboard-label">Choose Avatar</label>
        <div className="avatar-grid">
          {AVATARS.map((a) => (
            <button key={a} className={"av-opt" + (avatar === a ? " sel" : "")}
              style={avatar === a ? { background: color + "22" } : {}} onClick={() => setAvatar(a)}>
              {a}
            </button>
          ))}
        </div>

        <label className="onboard-label">Colour</label>
        <div className="color-grid">
          {AVATAR_COLORS.map((c) => (
            <div key={c} className={"col-opt" + (color === c ? " sel" : "")}
              style={{ background: c }} onClick={() => setColor(c)} />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.8rem 1rem", borderRadius: "6px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", marginBottom: "1.2rem" }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: color + "22", border: "2px solid " + color + "66", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>{avatar}</div>
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
