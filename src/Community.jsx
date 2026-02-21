import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

/* ─── SUPABASE ───────────────────────────────────── */
const SUPABASE_URL = "https://aanksddaitghblfrarvj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbmtzZGRhaXRnaGJsZnJhcnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MjE2MDgsImV4cCI6MjA4NzE5NzYwOH0.9U7TdjAd-r4nVhI9VEAa77DBA6Kp5eEsit9FPOZM1N8";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ─── HELPERS ────────────────────────────────────── */
const goTo = (p) => { if (typeof window.__navigate==="function") window.__navigate(p); else window.location.href=p; };
const lGet = (k) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):null; } catch { return null; } };
const lSet = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} };
const lDel = (k) => { try { localStorage.removeItem(k); } catch {} };
const genId = () => Math.random().toString(36).slice(2)+Date.now().toString(36);
const fmtTime = (ts) => new Date(ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
const fmtDate = (ts) => {
  const d=new Date(ts), now=new Date();
  if (d.toDateString()===now.toDateString()) return "Today";
  const y=new Date(now); y.setDate(y.getDate()-1);
  if (d.toDateString()===y.toDateString()) return "Yesterday";
  return d.toLocaleDateString([],{month:"long",day:"numeric"});
};
const isEmojiOnly = (t) => /^(\p{Emoji_Presentation}|\p{Extended_Pictographic}|\s)+$/u.test(t.trim()) && t.trim().length<=8;
const rowToMsg = (r) => ({
  id:r.id, roomId:r.room_id, userId:r.user_id,
  userName:r.user_name, userColor:r.user_color, userAvatar:r.user_avatar,
  text:r.text, imgUrl:r.img_url, ts:new Date(r.created_at).getTime(),
  reactions:r.reactions||{}, isPinned:r.is_pinned||false, editedAt:r.edited_at||null,
});
const canEdit = (ts) => Date.now()-ts < 10*60*1000; // 10 min window

/* ─── PROFANITY ──────────────────────────────────── */
const PROFANITY = ["fuck","shit","bitch","asshole","cunt","motherfucker","nigger","faggot","bastard","cock","dick","pussy","whore","slut","prick","wanker","bollocks"];
const hasProfanity = (t) => { const l=t.toLowerCase().replace(/[^a-z\s]/g,""); return PROFANITY.some(w=>new RegExp("\\b"+w+"\\b").test(l)); };

/* ─── MUTE HELPERS ───────────────────────────────── */
const MUTE_DURATIONS = [
  {label:"1 Hour",   ms:1*3600000},  {label:"6 Hours",  ms:6*3600000},
  {label:"12 Hours", ms:12*3600000}, {label:"1 Day",    ms:24*3600000},
  {label:"3 Days",   ms:3*24*3600000},{label:"1 Week",  ms:7*24*3600000},
  {label:"2 Weeks",  ms:14*24*3600000},{label:"1 Month",ms:30*24*3600000},
  {label:"3 Months", ms:90*24*3600000},{label:"6 Months",ms:180*24*3600000},
  {label:"1 Year",   ms:365*24*3600000},{label:"5 Years",ms:5*365*24*3600000},
  {label:"10 Years", ms:10*365*24*3600000},
];
const MAX_MUTES_OPTS = [1,2,3,4,5,10];
const muteExpired = (u) => u && new Date(u)<=new Date();
const fmtMuteLeft = (u) => {
  if (!u) return "";
  const d=new Date(u)-Date.now(); if(d<=0) return "Expired";
  const dd=Math.floor(d/86400000), hh=Math.floor((d%86400000)/3600000), mm=Math.floor((d%3600000)/60000);
  if(dd>0) return dd+"d "+hh+"h left"; if(hh>0) return hh+"h "+mm+"m left"; return mm+"m left";
};

/* ─── CONSTANTS ──────────────────────────────────── */
const AVATARS = ["🐺","🦅","🐉","🗡️","🔥","⚡","🌑","💀","🦴","🌊","🕷️","🧿","👁️","🌀","🏹"];
const AVATAR_COLORS = ["#7b2fff","#00d4ff","#ff2d7a","#ffb800","#22c55e","#f97316","#a855f7","#06b6d4"];
const QUICK_REACTIONS = ["🔥","💀","👁️","⚡","🏹","💜","😭","🤯"];
const EMOJI_LIST = ["🔥","💀","👁️","⚡","🏹","💜","😭","🤯","🐺","🦅","🐉","🗡️","🌑","🌊","🕷️","🔮","💯","😤","🥶","😈","👏","❤️","😂","🎯","🤔","👀","✨","💪"];

/* ─── CSS ────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --black:#050507;--deep:#0a0a0f;--dark:#0f0f18;--panel:#13131e;--panel2:#17172a;
  --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.12);
  --cyan:#00d4ff;--cyan2:#00a8cc;--violet:#7b2fff;--magenta:#ff2d7a;
  --gold:#ffb800;--text:#e8e8f0;--muted:#6b6b85;--soft:#9898b8;
}
html,body{height:100%;overflow:hidden}
#root{height:100%;overflow:hidden}
body{font-family:'Inter',sans-serif;background:var(--black);color:var(--text);-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(123,47,255,0.4);border-radius:2px}
#comm-particles{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:0.35}
input,textarea,button,select{font-family:inherit}
input,textarea{background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:4px;color:var(--text);outline:none;transition:border-color 0.2s}
input:focus,textarea:focus{border-color:var(--violet)}

/* ── LAYOUT ── */
.comm-wrap{position:relative;z-index:1;display:flex;height:100dvh;overflow:hidden}
.comm-sidebar{width:260px;flex-shrink:0;background:var(--deep);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;transition:transform 0.3s}
.comm-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}

/* ── SIDEBAR ── */
.comm-logo{padding:1rem 1.2rem 0.8rem;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:0.2rem;flex-shrink:0}
.comm-logo-top{display:flex;align-items:center;gap:0.6rem}
.comm-logo-icon{width:30px;height:30px;border-radius:5px;flex-shrink:0;background:linear-gradient(135deg,var(--violet),var(--cyan2));display:flex;align-items:center;justify-content:center;font-size:0.85rem}
.comm-logo-name{font-family:'Bebas Neue',sans-serif;font-size:1rem;letter-spacing:0.08em;background:linear-gradient(135deg,var(--cyan),var(--violet));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.comm-logo-sub{font-family:'Rajdhani',sans-serif;font-size:0.6rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted)}
.back-link{display:inline-flex;align-items:center;gap:0.3rem;padding:0.25rem 0;margin-top:0.2rem;font-family:'Rajdhani',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);cursor:pointer;background:none;border:none;transition:color 0.2s}
.back-link:hover{color:var(--cyan)}
.room-list{flex:1;overflow-y:auto;padding:0.6rem 0}
.room-section-label{padding:0.5rem 1.2rem 0.25rem;font-family:'Rajdhani',sans-serif;font-size:0.58rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--muted);display:flex;align-items:center;justify-content:space-between}
.room-btn{width:100%;display:flex;align-items:center;gap:0.6rem;padding:0.5rem 1.2rem;background:none;border:none;cursor:pointer;transition:background 0.15s;text-align:left;position:relative}
.room-btn:hover{background:rgba(255,255,255,0.03)}
.room-btn.active{background:rgba(123,47,255,0.12)}
.room-btn.active::before{content:'';position:absolute;left:0;top:15%;height:70%;width:2px;background:var(--violet);border-radius:0 2px 2px 0}
.room-icon{font-size:0.9rem;flex-shrink:0;width:18px;text-align:center}
.room-label{font-family:'Rajdhani',sans-serif;font-weight:600;font-size:0.8rem;letter-spacing:0.05em;color:var(--text);flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.room-btn.active .room-label{color:var(--cyan)}
.room-badge-row{display:flex;align-items:center;gap:0.3rem;flex-shrink:0}
.room-adult-badge{font-size:0.5rem;font-weight:700;padding:0.08rem 0.28rem;border-radius:3px;background:rgba(255,45,122,0.15);border:1px solid rgba(255,45,122,0.3);color:var(--magenta);letter-spacing:0.06em}
.room-admin-badge{font-size:0.5rem;font-weight:700;padding:0.08rem 0.28rem;border-radius:3px;background:rgba(255,184,0,0.12);border:1px solid rgba(255,184,0,0.3);color:var(--gold);letter-spacing:0.06em}
.sidebar-profile{border-top:1px solid var(--border);padding:0.8rem 1.2rem;display:flex;align-items:center;gap:0.6rem;flex-shrink:0}
.sp-avatar{width:32px;height:32px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1rem;border:2px solid rgba(123,47,255,0.4)}
.sp-name{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.78rem;color:var(--text);display:flex;align-items:center;gap:0.3rem;flex-wrap:wrap;line-height:1.3;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sp-status{font-family:'Rajdhani',sans-serif;font-size:0.62rem;color:var(--muted);display:flex;align-items:center;gap:0.3rem;flex-wrap:wrap}
.sp-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.sp-edit{margin-left:auto;flex-shrink:0;background:none;border:none;color:var(--muted);cursor:pointer;font-size:0.8rem;transition:color 0.2s;padding:0.15rem}
.sp-edit:hover{color:var(--cyan)}

/* ── ADMIN TAG ── */
.admin-tag{display:inline-flex;align-items:center;gap:0.12rem;padding:0.04rem 0.3rem;border-radius:3px;background:linear-gradient(135deg,rgba(255,184,0,0.22),rgba(255,140,0,0.14));border:1px solid rgba(255,184,0,0.5);font-family:'Rajdhani',sans-serif;font-size:0.56rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:var(--gold);flex-shrink:0;white-space:nowrap}

/* ── HAMBURGER (mobile) ── */
.hamburger{display:none;background:none;border:none;color:var(--muted);font-size:1.3rem;cursor:pointer;padding:0.3rem;border-radius:4px;transition:color 0.2s;flex-shrink:0}
.hamburger:hover{color:var(--text)}
.sidebar-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:90;backdrop-filter:blur(4px)}

/* ── HEADER ── */
.chat-header{padding:0.8rem 1.2rem;border-bottom:1px solid var(--border);background:rgba(10,10,15,0.95);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;gap:0.8rem;position:relative}
.chat-header::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--violet),transparent);opacity:0.4}
.chat-header-left{display:flex;align-items:center;gap:0.7rem;min-width:0;flex:1}
.chat-header-icon{font-size:1.1rem;flex-shrink:0}
.chat-header-title{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:0.06em;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chat-header-desc{font-family:'Rajdhani',sans-serif;font-size:0.68rem;color:var(--muted);margin-top:0.05rem;letter-spacing:0.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.online-pill{display:flex;align-items:center;gap:0.35rem;padding:0.2rem 0.65rem;border-radius:10px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);font-family:'Rajdhani',sans-serif;font-size:0.62rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#22c55e;white-space:nowrap;flex-shrink:0}
.online-dot{width:5px;height:5px;border-radius:50%;background:#22c55e;animation:pulse 2s ease infinite;flex-shrink:0}
.home-btn{display:flex;align-items:center;gap:0.35rem;padding:0.3rem 0.75rem;border-radius:4px;border:1px solid var(--border2);background:rgba(255,255,255,0.03);color:var(--soft);cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;transition:all 0.2s;white-space:nowrap;flex-shrink:0}
.home-btn:hover{border-color:var(--cyan);color:var(--cyan)}

/* ── PINNED BANNER ── */
.pinned-banner{background:rgba(123,47,255,0.08);border-bottom:1px solid rgba(123,47,255,0.2);padding:0.6rem 1.2rem;display:flex;align-items:center;gap:0.7rem;flex-shrink:0;cursor:pointer;transition:background 0.2s}
.pinned-banner:hover{background:rgba(123,47,255,0.13)}
.pinned-banner-icon{font-size:0.85rem;flex-shrink:0;color:var(--violet)}
.pinned-banner-text{font-family:'Rajdhani',sans-serif;font-size:0.78rem;font-weight:600;color:var(--soft);letter-spacing:0.04em;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pinned-banner-label{font-family:'Rajdhani',sans-serif;font-size:0.58rem;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:var(--violet);flex-shrink:0}

/* ── MESSAGES ── */
.chat-messages{flex:1;overflow-y:auto;padding:1rem 1.2rem;display:flex;flex-direction:column;gap:0.15rem}
.msg-date-divider{display:flex;align-items:center;gap:0.7rem;margin:0.8rem 0 0.4rem}
.msg-date-divider span{font-family:'Rajdhani',sans-serif;font-size:0.62rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);white-space:nowrap}
.msg-date-divider::before,.msg-date-divider::after{content:'';flex:1;height:1px;background:var(--border)}
.msg-group{display:flex;gap:0.7rem;padding:0.35rem 0.2rem;border-radius:6px;transition:background 0.12s;animation:msgIn 0.22s ease;position:relative}
.msg-group:hover{background:rgba(255,255,255,0.015)}
.msg-group:hover .msg-action-bar{opacity:1;pointer-events:all}
.msg-group.own{flex-direction:row-reverse}
.msg-avatar{width:34px;height:34px;border-radius:50%;flex-shrink:0;margin-top:2px;display:flex;align-items:center;justify-content:center;font-size:1rem;border:2px solid rgba(255,255,255,0.06)}
.msg-content{flex:1;min-width:0}
.msg-group.own .msg-content{display:flex;flex-direction:column;align-items:flex-end}
.msg-meta{display:flex;align-items:center;gap:0.35rem;margin-bottom:0.25rem;flex-wrap:wrap}
.msg-group.own .msg-meta{flex-direction:row-reverse}
.msg-name{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.8rem;letter-spacing:0.04em}
.msg-time{font-family:'Rajdhani',sans-serif;font-size:0.6rem;color:var(--muted)}
.msg-edited{font-family:'Rajdhani',sans-serif;font-size:0.58rem;color:var(--muted);font-style:italic}
.msg-bubble{display:inline-block;max-width:min(520px,80vw);padding:0.55rem 0.85rem;border-radius:4px 12px 12px 12px;background:var(--panel2);border:1px solid var(--border);font-family:'Rajdhani',sans-serif;font-size:0.9rem;font-weight:400;line-height:1.6;color:var(--text);letter-spacing:0.02em;word-break:break-word}
.msg-group.own .msg-bubble{border-radius:12px 4px 12px 12px;background:linear-gradient(135deg,rgba(123,47,255,0.25),rgba(0,168,204,0.15));border-color:rgba(123,47,255,0.3)}
.msg-emoji{font-size:2rem;line-height:1.2}
.msg-img-wrap{margin-top:0.25rem}
.msg-img{max-width:min(260px,70vw);max-height:200px;border-radius:8px;object-fit:cover;cursor:pointer;border:1px solid var(--border);transition:transform 0.2s;display:block}
.msg-img:hover{transform:scale(1.02)}
.msg-reactions{display:flex;gap:0.2rem;flex-wrap:wrap;margin-top:0.25rem}
.reaction-btn{display:inline-flex;align-items:center;gap:0.15rem;padding:0.12rem 0.4rem;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid var(--border);font-size:0.68rem;cursor:pointer;transition:all 0.15s;font-family:'Rajdhani',sans-serif;font-weight:600;color:var(--muted)}
.reaction-btn:hover,.reaction-btn.mine{background:rgba(123,47,255,0.15);border-color:rgba(123,47,255,0.3);color:var(--violet)}

/* ── MESSAGE ACTION BAR (hover) ── */
.msg-action-bar{position:absolute;right:0.4rem;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:0.2rem;opacity:0;pointer-events:none;transition:opacity 0.12s;background:var(--panel);border:1px solid var(--border2);border-radius:6px;padding:0.15rem 0.3rem;z-index:5}
.mab-btn{background:none;border:none;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:0.62rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;padding:0.18rem 0.38rem;border-radius:3px;transition:all 0.12s}
.mab-edit{color:var(--cyan)} .mab-edit:hover{background:rgba(0,212,255,0.12)}
.mab-del{color:var(--magenta)} .mab-del:hover{background:rgba(255,45,122,0.12)}
.mab-pin{color:var(--violet)} .mab-pin:hover{background:rgba(123,47,255,0.14)}
.mab-mute{color:var(--gold)} .mab-mute:hover{background:rgba(255,184,0,0.12)}
.mab-ban{color:var(--magenta)} .mab-ban:hover{background:rgba(255,45,122,0.12)}
.mab-unmute{color:#22c55e} .mab-unmute:hover{background:rgba(34,197,94,0.12)}
.mab-sep{width:1px;height:12px;background:var(--border2);flex-shrink:0}

/* ── INLINE EDIT ── */
.msg-edit-box{display:flex;flex-direction:column;gap:0.4rem;margin-top:0.25rem}
.msg-edit-textarea{width:min(520px,75vw);padding:0.5rem 0.7rem;border-radius:6px;background:var(--panel2);border:1px solid rgba(123,47,255,0.4);color:var(--text);font-family:'Rajdhani',sans-serif;font-size:0.88rem;line-height:1.5;resize:none;outline:none}
.msg-edit-actions{display:flex;gap:0.4rem}
.msg-edit-save{padding:0.28rem 0.8rem;border:none;border-radius:3px;background:linear-gradient(135deg,var(--violet),var(--cyan2));color:#fff;font-family:'Rajdhani',sans-serif;font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer}
.msg-edit-cancel{padding:0.28rem 0.7rem;border:1px solid var(--border);border-radius:3px;background:none;color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:0.7rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer}
.msg-edit-cancel:hover{color:var(--text);border-color:var(--border2)}

/* ── SYS MSG ── */
.sys-msg{padding:0.45rem 1rem;margin:0.15rem 0;border-radius:4px;font-family:'Rajdhani',sans-serif;font-size:0.78rem;letter-spacing:0.04em;text-align:center;flex-shrink:0}
.sys-warn{background:rgba(255,184,0,0.07);border:1px solid rgba(255,184,0,0.18);color:var(--gold)}
.sys-ban{background:rgba(255,45,122,0.07);border:1px solid rgba(255,45,122,0.18);color:var(--magenta)}

/* ── ADMIN-ONLY CHANNEL NOTICE ── */
.admin-only-notice{padding:0.7rem 1.2rem;background:rgba(255,184,0,0.06);border-top:1px solid rgba(255,184,0,0.15);font-family:'Rajdhani',sans-serif;font-size:0.75rem;color:rgba(255,184,0,0.6);text-align:center;letter-spacing:0.05em;flex-shrink:0}

/* ── INPUT ── */
.typing-bar{padding:0.3rem 1.2rem;min-height:22px;flex-shrink:0}
.chat-input-area{padding:0.65rem 1.2rem 0.8rem;border-top:1px solid var(--border);background:rgba(10,10,15,0.6);flex-shrink:0}
.chat-input-box{display:flex;align-items:flex-end;gap:0.5rem;background:var(--panel2);border:1px solid var(--border2);border-radius:8px;padding:0.45rem 0.55rem;transition:border-color 0.2s}
.chat-input-box:focus-within{border-color:rgba(123,47,255,0.5)}
.chat-textarea{flex:1;background:none;border:none;outline:none;resize:none;font-family:'Rajdhani',sans-serif;font-size:0.92rem;color:var(--text);line-height:1.5;min-height:22px;max-height:120px;padding:0.15rem 0}
.chat-textarea::placeholder{color:var(--muted)}
.input-btn{width:32px;height:32px;border-radius:5px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.95rem;transition:all 0.2s;flex-shrink:0;background:none;color:var(--muted)}
.input-btn:hover{background:rgba(255,255,255,0.06);color:var(--text)}
.input-btn:disabled{opacity:0.3;cursor:default}
.input-send{background:linear-gradient(135deg,var(--violet),var(--cyan2));color:#fff}
.input-send:hover:not(:disabled){box-shadow:0 3px 14px rgba(123,47,255,0.5);transform:translateY(-1px)}
.input-send:disabled{opacity:0.3;transform:none;box-shadow:none}
.img-upload-btn{position:relative;overflow:hidden}
.img-upload-btn input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer}
.input-relative{position:relative}
.emoji-picker{position:absolute;bottom:calc(100% + 8px);right:0;background:var(--panel);border:1px solid var(--border2);border-radius:10px;padding:0.6rem;display:flex;flex-wrap:wrap;gap:0.15rem;width:220px;box-shadow:0 16px 50px rgba(0,0,0,0.7);z-index:50;animation:slideUp 0.18s ease}
.emoji-opt{font-size:1.2rem;cursor:pointer;padding:0.18rem;border-radius:3px;transition:background 0.12s;border:none;background:none}
.emoji-opt:hover{background:rgba(255,255,255,0.08)}
.input-hint{font-family:'Rajdhani',sans-serif;font-size:0.58rem;color:var(--muted);letter-spacing:0.06em;margin-top:0.35rem;text-align:center}

/* ── LIGHTBOX ── */
.lightbox{position:fixed;inset:0;z-index:900;background:rgba(0,0,0,0.93);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.18s ease;cursor:zoom-out}
.lightbox img{max-width:92vw;max-height:88vh;border-radius:8px;box-shadow:0 40px 100px rgba(0,0,0,0.9)}
.lightbox-x{position:absolute;top:1.2rem;right:1.2rem;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:0.95rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s}
.lightbox-x:hover{background:rgba(255,255,255,0.2)}

/* ── MUTE MODAL ── */
.modal-bg{position:fixed;inset:0;z-index:800;background:rgba(0,0,0,0.85);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:1.2rem;animation:fadeIn 0.16s ease}
.mute-modal{background:var(--panel);border:1px solid var(--border2);border-radius:12px;max-width:440px;width:100%;padding:1.8rem;box-shadow:0 40px 100px rgba(0,0,0,0.9);animation:slideUp 0.25s cubic-bezier(.34,1.56,.64,1);position:relative;max-height:90dvh;overflow-y:auto}
.mute-modal::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}
.mute-modal h3{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:0.06em;color:var(--gold);margin-bottom:0.2rem}
.mute-modal-sub{font-family:'Rajdhani',sans-serif;font-size:0.8rem;color:var(--muted);line-height:1.6;margin-bottom:1.3rem}
.mute-modal-label{font-family:'Rajdhani',sans-serif;font-size:0.62rem;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:0.5rem}
.mute-duration-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0.3rem;margin-bottom:1.2rem}
.mute-dur-btn{padding:0.4rem 0.25rem;border-radius:4px;border:1px solid var(--border);background:rgba(255,255,255,0.02);color:var(--soft);font-family:'Rajdhani',sans-serif;font-size:0.68rem;font-weight:600;cursor:pointer;transition:all 0.12s;text-align:center;line-height:1.3}
.mute-dur-btn:hover{border-color:rgba(255,184,0,0.4);color:var(--gold)}
.mute-dur-btn.sel{border-color:var(--gold);color:var(--gold);background:rgba(255,184,0,0.1)}
.mute-max-row{display:flex;align-items:center;gap:0.7rem;margin-bottom:1.3rem;padding:0.8rem;border-radius:6px;background:rgba(255,255,255,0.02);border:1px solid var(--border)}
.mute-max-label{font-family:'Rajdhani',sans-serif;font-size:0.75rem;color:var(--soft);flex:1;line-height:1.5}
.mute-max-label strong{color:var(--text);display:block;font-size:0.68rem;margin-bottom:0.1rem;letter-spacing:0.06em;text-transform:uppercase}
.mute-max-select{padding:0.4rem 0.55rem;border-radius:4px;border:1px solid var(--border2);background:rgba(255,255,255,0.04);color:var(--text);font-family:'Rajdhani',sans-serif;font-size:0.8rem;font-weight:600;cursor:pointer;outline:none}
.mute-modal-actions{display:flex;gap:0.5rem}
.mute-confirm{flex:1;padding:0.72rem;border:none;border-radius:4px;background:linear-gradient(135deg,rgba(255,184,0,0.95),rgba(255,130,0,0.85));color:#0a0900;font-family:'Rajdhani',sans-serif;font-size:0.8rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;transition:all 0.18s}
.mute-confirm:hover{box-shadow:0 4px 20px rgba(255,184,0,0.4);transform:translateY(-1px)}
.mute-cancel{padding:0.72rem 1rem;background:none;border:1px solid var(--border);border-radius:4px;color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:0.8rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;transition:all 0.18s}
.mute-cancel:hover{border-color:var(--text);color:var(--text)}

/* ── ONBOARDING ── */
.onboard-bg{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.9);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;padding:1.2rem}
.onboard-box{background:var(--panel);border:1px solid var(--border);border-radius:12px;max-width:420px;width:100%;padding:2rem;box-shadow:0 40px 100px rgba(0,0,0,0.9),0 0 60px rgba(123,47,255,0.1);animation:slideUp 0.32s cubic-bezier(.34,1.56,.64,1);position:relative;max-height:90dvh;overflow-y:auto}
.onboard-box::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),var(--violet),transparent)}
.onboard-title{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:0.06em;background:linear-gradient(135deg,#fff,var(--soft));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:0.25rem}
.onboard-sub{font-family:'Rajdhani',sans-serif;font-size:0.82rem;color:var(--muted);letter-spacing:0.04em;line-height:1.6;margin-bottom:1.5rem}
.onboard-label{font-family:'Rajdhani',sans-serif;font-size:0.64rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:0.45rem}
.onboard-input{width:100%;padding:0.72rem 0.9rem;border:1px solid var(--border);border-radius:4px;background:rgba(255,255,255,0.03);color:var(--text);font-family:'Rajdhani',sans-serif;font-size:0.92rem;outline:none;transition:border-color 0.2s;letter-spacing:0.04em;margin-bottom:1.1rem}
.onboard-input:focus{border-color:var(--violet)}
.avatar-grid{display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.9rem}
.av-opt{width:38px;height:38px;border-radius:50%;border:2px solid transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.1rem;transition:all 0.18s;background:rgba(255,255,255,0.04)}
.av-opt.sel{border-color:var(--cyan);transform:scale(1.1)}
.color-grid{display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:1.3rem}
.col-opt{width:22px;height:22px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all 0.18s}
.col-opt.sel{border-color:#fff;transform:scale(1.2)}
.onboard-btn{width:100%;padding:0.78rem;border:none;border-radius:4px;background:linear-gradient(135deg,var(--violet),var(--cyan2));color:#fff;font-family:'Rajdhani',sans-serif;font-size:0.85rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;transition:all 0.22s;box-shadow:0 4px 20px rgba(123,47,255,0.4)}
.onboard-btn:hover{box-shadow:0 6px 28px rgba(123,47,255,0.6);transform:translateY(-1px)}
.onboard-err{color:var(--magenta);font-family:'Rajdhani',sans-serif;font-size:0.76rem;margin-bottom:0.75rem;letter-spacing:0.04em}
.profile-overlay{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:1.2rem}

/* ── ADMIN LOGIN IN ONBOARDING ── */
.admin-login-toggle{background:none;border:1px solid rgba(255,184,0,0.25);border-radius:4px;color:rgba(255,184,0,0.7);font-family:'Rajdhani',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;padding:0.4rem 0.8rem;margin-bottom:1rem;transition:all 0.2s;display:flex;align-items:center;gap:0.4rem;width:100%}
.admin-login-toggle:hover{border-color:var(--gold);color:var(--gold);background:rgba(255,184,0,0.05)}
.admin-login-section{background:rgba(255,184,0,0.05);border:1px solid rgba(255,184,0,0.15);border-radius:6px;padding:1rem;margin-bottom:1rem}
.admin-login-section p{font-family:'Rajdhani',sans-serif;font-size:0.72rem;color:var(--muted);margin-bottom:0.8rem;line-height:1.5}
.admin-pw-row{display:flex;gap:0.4rem}
.admin-pw-input{flex:1;padding:0.55rem 0.8rem;border:1px solid rgba(255,184,0,0.2);border-radius:4px;background:rgba(255,255,255,0.03);color:var(--text);font-family:'Rajdhani',sans-serif;font-size:0.88rem;outline:none;transition:border-color 0.2s}
.admin-pw-input:focus{border-color:var(--gold)}
.admin-pw-btn{padding:0.55rem 0.9rem;border:none;border-radius:4px;background:linear-gradient(135deg,rgba(255,184,0,0.9),rgba(255,130,0,0.8));color:#0a0900;font-family:'Rajdhani',sans-serif;font-size:0.72rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;transition:all 0.18s;white-space:nowrap}
.admin-pw-btn:hover{box-shadow:0 3px 14px rgba(255,184,0,0.35)}

/* ── ANIMATIONS ── */
@keyframes slideUp{from{transform:translateY(22px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}

/* ── RESPONSIVE ── */
@media(max-width:680px){
  .comm-sidebar{position:fixed;left:0;top:0;bottom:0;z-index:95;transform:translateX(-100%);width:260px}
  .comm-sidebar.mob-open{transform:translateX(0)}
  .sidebar-overlay{display:block}
  .hamburger{display:flex}
  .home-btn span{display:none}
  .mute-duration-grid{grid-template-columns:repeat(3,1fr)}
  .chat-messages{padding:0.8rem}
  .chat-input-area{padding:0.5rem 0.8rem 0.65rem}
}
@media(max-width:380px){
  .mute-duration-grid{grid-template-columns:repeat(2,1fr)}
  .onboard-box{padding:1.5rem}
}
`;

/* ─── PARTICLES ──────────────────────────────────── */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas=ref.current; if(!canvas) return;
    const ctx=canvas.getContext("2d"); let raf;
    const COLORS=["#00d4ff","#7b2fff","#ff2d7a","#ffb800"];
    const resize=()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;};
    resize(); window.addEventListener("resize",resize);
    const pts=Array.from({length:50},()=>({
      x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,
      r:Math.random()*1.1+0.2,vx:(Math.random()-0.5)*0.22,vy:(Math.random()-0.5)*0.22,
      color:COLORS[Math.floor(Math.random()*COLORS.length)],alpha:Math.random()*0.45+0.08,
    }));
    const draw=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pts.forEach(p=>{
        p.x+=p.vx;p.y+=p.vy;
        if(p.x<0)p.x=canvas.width;if(p.x>canvas.width)p.x=0;
        if(p.y<0)p.y=canvas.height;if(p.y>canvas.height)p.y=0;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=p.color;ctx.globalAlpha=p.alpha;ctx.fill();ctx.globalAlpha=1;
      });
      for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<100){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=pts[i].color;ctx.globalAlpha=(1-d/100)*0.09;ctx.lineWidth=0.5;ctx.stroke();ctx.globalAlpha=1;}
      }
      raf=requestAnimationFrame(draw);
    };
    draw();
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas id="comm-particles" ref={ref}/>;
}

/* ─── MUTE MODAL ─────────────────────────────────── */
function MuteModal({target,onConfirm,onCancel}){
  const [selMs,setSelMs]=useState(MUTE_DURATIONS[3].ms);
  const [maxMutes,setMaxMutes]=useState(3);
  return(
    <div className="modal-bg" onClick={onCancel}>
      <div className="mute-modal" onClick={e=>e.stopPropagation()}>
        <h3>🔇 Mute User</h3>
        <p className="mute-modal-sub">Muting <strong style={{color:"var(--text)"}}>{target.name}</strong>. The mute lifts automatically when the timer expires. Set a total mute limit — once reached, the next mute is skipped.</p>
        <span className="mute-modal-label">Mute Duration</span>
        <div className="mute-duration-grid">
          {MUTE_DURATIONS.map(d=>(
            <button key={d.ms} className={"mute-dur-btn"+(selMs===d.ms?" sel":"")} onClick={()=>setSelMs(d.ms)}>{d.label}</button>
          ))}
        </div>
        <div className="mute-max-row">
          <div className="mute-max-label"><strong>Auto-Lift After</strong>After this many mutes, restriction is permanently cleared.</div>
          <select className="mute-max-select" value={maxMutes} onChange={e=>setMaxMutes(Number(e.target.value))}>
            {MAX_MUTES_OPTS.map(n=><option key={n} value={n}>{n} mute{n!==1?"s":""}</option>)}
          </select>
        </div>
        <div className="mute-modal-actions">
          <button className="mute-confirm" onClick={()=>onConfirm(selMs,maxMutes)}>Apply Mute</button>
          <button className="mute-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMMUNITY ─────────────────────────────── */
export default function Community(){
  const [user,setUser]           = useState(()=>lGet("rm_chat_user")||null);
  const [isAdmin,setIsAdmin]     = useState(()=>!!lGet("rm_comm_admin"));
  const [modStatus,setModStatus] = useState(null);
  const [showOnboard,setShowOnboard]=useState(false);
  const [showProfile,setShowProfile]=useState(false);
  const [channels,setChannels]   = useState([]);
  const [roomId,setRoomId]       = useState("general");
  const [messages,setMessages]   = useState([]);
  const [loading,setLoading]     = useState(true);
  const [chLoading,setChLoading] = useState(true);
  const [input,setInput]         = useState("");
  const [showEmoji,setShowEmoji] = useState(false);
  const [lightbox,setLightbox]   = useState(null);
  const [sending,setSending]     = useState(false);
  const [sysMsg,setSysMsg]       = useState(null);
  const [muteTarget,setMuteTarget]=useState(null);
  const [modCache,setModCache]   = useState({});
  const [editingId,setEditingId] = useState(null);
  const [editText,setEditText]   = useState("");
  const [mobSide,setMobSide]     = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

  // Admin login via token in localStorage
  const verifyAdminToken = useCallback(async()=>{
    const tok=lGet("rm_comm_admin");
    if(!tok) return;
    const {data}=await sb.from("admin_tokens").select("expires_at").eq("token",tok).single();
    if(!data||new Date(data.expires_at)<new Date()){lDel("rm_comm_admin");setIsAdmin(false);}
    else setIsAdmin(true);
  },[]);

  useEffect(()=>{verifyAdminToken();},[verifyAdminToken]);
  useEffect(()=>{ if(!user) setShowOnboard(true); },[user]);

  // Channels
  useEffect(()=>{
    setChLoading(true);
    sb.from("channels").select("*").order("sort_order").then(({data})=>{setChannels(data||[]);setChLoading(false);});
    const ch=sb.channel("ch-changes").on("postgres_changes",{event:"*",schema:"public",table:"channels"},()=>{
      sb.from("channels").select("*").order("sort_order").then(({data})=>setChannels(data||[]));
    }).subscribe();
    return ()=>sb.removeChannel(ch);
  },[]);

  // Own mod status
  useEffect(()=>{
    if(!user) return;
    sb.from("moderation").select("*").eq("user_id",user.id).single().then(({data})=>setModStatus(data||null));
    const ch=sb.channel("mod-self-"+user.id)
      .on("postgres_changes",{event:"*",schema:"public",table:"moderation",filter:"user_id=eq."+user.id},
        ({new:row})=>setModStatus(row)).subscribe();
    return ()=>sb.removeChannel(ch);
  },[user?.id]);

  // Messages
  useEffect(()=>{
    setLoading(true);
    sb.from("messages").select("*").eq("room_id",roomId)
      .order("created_at",{ascending:true}).limit(100)
      .then(({data})=>{setMessages(data?data.map(rowToMsg):[]);setLoading(false);});
    const ch=sb.channel("room-"+roomId)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:"room_id=eq."+roomId},
        p=>setMessages(prev=>prev.find(m=>m.id===p.new.id)?prev:[...prev,rowToMsg(p.new)]))
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"messages",filter:"room_id=eq."+roomId},
        p=>setMessages(prev=>prev.map(m=>m.id===p.new.id?rowToMsg(p.new):m)))
      .on("postgres_changes",{event:"DELETE",schema:"public",table:"messages",filter:"room_id=eq."+roomId},
        p=>setMessages(prev=>prev.filter(m=>m.id!==p.old.id)))
      .subscribe();
    return ()=>sb.removeChannel(ch);
  },[roomId]);

  // Auto-scroll
  useEffect(()=>{messagesEndRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);

  // Auto-lift expired mutes
  useEffect(()=>{
    const lift=async()=>{
      if(modStatus?.status==="muted"&&muteExpired(modStatus?.mute_until)){
        const upd={status:"ok",reason:"Mute expired",updated_at:new Date().toISOString()};
        await sb.from("moderation").update(upd).eq("user_id",user.id);
        setModStatus(p=>({...p,...upd}));
      }
    };
    lift();
    const t=setInterval(lift,60000);
    return ()=>clearInterval(t);
  },[modStatus?.status,modStatus?.mute_until]);

  // Computed
  const currentChannel = channels.find(c=>c.id===roomId)||null;
  const isAdultChannel = currentChannel?.is_adult||false;
  const isAdminOnly    = currentChannel?.channel_type==="announcement"||currentChannel?.channel_type==="authors_note";
  const isBanned = modStatus?.status==="banned";
  const isMuted  = modStatus?.status==="muted"&&!muteExpired(modStatus?.mute_until);
  const canSendHere = isAdminOnly ? isAdmin : true;
  const inputDisabled = !user||sending||isBanned||isMuted||!canSendHere;

  const inputPlaceholder = isBanned ? "You are banned from this community."
    : isMuted ? "You are muted · "+fmtMuteLeft(modStatus?.mute_until)
    : !user ? "Join to start chatting..."
    : isAdminOnly ? (isAdmin?"Send as Admin...":"Admin-only channel — read only")
    : "Message #"+(currentChannel?.label||roomId)+"...";

  // Pinned messages
  const pinnedMsgs = messages.filter(m=>m.isPinned);
  const regularMsgs = messages.filter(m=>!m.isPinned);

  // Date grouped
  const grouped=[];let lastDate="";
  regularMsgs.forEach(m=>{
    const d=fmtDate(m.ts);
    if(d!==lastDate){grouped.push({type:"date",label:d,key:"d_"+m.id});lastDate=d;}
    grouped.push({type:"msg",msg:m});
  });

  const flashSys=(type,text,ms=5000)=>{setSysMsg({type,text});setTimeout(()=>setSysMsg(null),ms);};

  /* ── Send ── */
  const sendMessage = async(text,imgUrl)=>{
    if(!user||sending) return;
    if(!text.trim()&&!imgUrl) return;
    if(isBanned){flashSys("ban","⛔ You are banned from this community.");return;}
    if(isMuted){flashSys("warn","🔇 You are muted · "+fmtMuteLeft(modStatus?.mute_until));return;}
    if(isAdminOnly&&!isAdmin){flashSys("warn","🔒 This channel is admin-only.");return;}
    // Profanity check (skip for admin and adult channels)
    if(!isAdmin&&!isAdultChannel&&text.trim()&&hasProfanity(text)){
      const curW=modStatus?.warnings||0, newW=curW+1;
      if(newW>=2){
        const row={user_id:user.id,user_name:user.name,status:"banned",warnings:newW,reason:"Auto-banned: profanity",updated_at:new Date().toISOString()};
        await sb.from("moderation").upsert(row,{onConflict:"user_id"});
        setModStatus(row);flashSys("ban","⛔ You have been banned for repeated profanity.",8000);
      } else {
        const row={user_id:user.id,user_name:user.name,status:"warned"+newW,warnings:newW,reason:"Warning "+newW+": profanity",updated_at:new Date().toISOString()};
        await sb.from("moderation").upsert(row,{onConflict:"user_id"});
        setModStatus(row);flashSys("warn","⚠ Warning "+newW+"/2: Profanity isn't allowed. One more and you'll be banned.",7000);
      }
      return;
    }
    setSending(true);
    await sb.from("messages").insert({
      id:genId(),room_id:roomId,user_id:user.id,
      user_name:user.name,user_color:user.color,user_avatar:user.avatar,
      text:text.trim(),img_url:imgUrl||"",reactions:{},
      created_at:new Date().toISOString(),
    });
    setInput("");
    if(textareaRef.current){textareaRef.current.style.height="auto";}
    setSending(false);
  };

  const handleKey=(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage(input);}};

  const handleImageUpload=(e)=>{
    const file=e.target.files?.[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      const img=new Image();
      img.onload=()=>{
        const MAX=800,scale=Math.min(1,MAX/Math.max(img.width,img.height));
        const c=document.createElement("canvas");
        c.width=img.width*scale;c.height=img.height*scale;
        c.getContext("2d").drawImage(img,0,0,c.width,c.height);
        sendMessage("",c.toDataURL("image/jpeg",0.75));
      };
      img.src=ev.target.result;
    };
    reader.readAsDataURL(file);e.target.value="";
  };

  const addReaction=async(msgId,emoji)=>{
    if(!user)return;
    const msg=messages.find(m=>m.id===msgId);if(!msg)return;
    const r={...(msg.reactions||{})};
    const ex=r[emoji]||{count:0,users:[]};const has=ex.users.includes(user.id);
    r[emoji]=has?{count:ex.count-1,users:ex.users.filter(u=>u!==user.id)}:{count:ex.count+1,users:[...ex.users,user.id]};
    if(r[emoji].count===0)delete r[emoji];
    setMessages(prev=>prev.map(m=>m.id===msgId?{...m,reactions:r}:m));
    await sb.from("messages").update({reactions:r}).eq("id",msgId);
  };

  /* ── Edit message ── */
  const startEdit=(m)=>{setEditingId(m.id);setEditText(m.text);};
  const saveEdit=async(msgId)=>{
    if(!editText.trim())return;
    const now=new Date().toISOString();
    await sb.from("messages").update({text:editText.trim(),edited_at:now}).eq("id",msgId);
    setMessages(prev=>prev.map(m=>m.id===msgId?{...m,text:editText.trim(),editedAt:now}:m));
    setEditingId(null);
  };

  /* ── Delete message ── */
  const deleteMsg=async(msgId)=>{
    if(!window.confirm("Delete this message?"))return;
    await sb.from("messages").delete().eq("id",msgId);
    setMessages(prev=>prev.filter(m=>m.id!==msgId));
  };

  /* ── Pin ── */
  const togglePin=async(m)=>{
    const newPin=!m.isPinned;
    await sb.from("messages").update({is_pinned:newPin}).eq("id",m.id);
    setMessages(prev=>prev.map(msg=>msg.id===m.id?{...msg,isPinned:newPin}:msg));
  };

  /* ── Mod cache ── */
  const fetchModCache=async(uid)=>{
    if(modCache[uid]!==undefined)return;
    setModCache(p=>({...p,[uid]:null}));
    const {data}=await sb.from("moderation").select("status,mute_until,mute_count,max_mutes").eq("user_id",uid).single();
    setModCache(p=>({...p,[uid]:data||{status:"ok"}}));
  };
  const cachedStatus=(uid)=>{const c=modCache[uid];if(!c)return"ok";if(c.status==="muted"&&muteExpired(c.mute_until))return"ok";return c.status||"ok";};

  /* ── Admin mod actions ── */
  const openMute=(uid,uname)=>{if(!isAdmin)return;setMuteTarget({id:uid,name:uname});};
  const applyMute=async(durationMs,maxMutes)=>{
    if(!muteTarget||!isAdmin)return;
    const uid=muteTarget.id,uname=muteTarget.name;
    const {data:ex}=await sb.from("moderation").select("mute_count").eq("user_id",uid).single();
    const prevC=ex?.mute_count||0,newC=prevC+1;
    if(newC>maxMutes){
      const row={user_id:uid,user_name:uname,status:"ok",warnings:0,reason:"Auto-lifted: exceeded max mute limit ("+maxMutes+")",mute_until:null,mute_count:newC,max_mutes:maxMutes,updated_at:new Date().toISOString()};
      await sb.from("moderation").upsert(row,{onConflict:"user_id"});
    } else {
      const muteUntil=new Date(Date.now()+durationMs).toISOString();
      const dur=MUTE_DURATIONS.find(d=>d.ms===durationMs)?.label||"";
      const row={user_id:uid,user_name:uname,status:"muted",warnings:0,reason:"Admin mute: "+dur,mute_until:muteUntil,mute_count:newC,max_mutes:maxMutes,updated_at:new Date().toISOString()};
      await sb.from("moderation").upsert(row,{onConflict:"user_id"});
    }
    setModCache(p=>({...p,[uid]:undefined}));setMuteTarget(null);
  };
  const adminUnmute=async(uid,uname)=>{
    if(!isAdmin)return;
    const row={user_id:uid,user_name:uname,status:"ok",warnings:0,reason:"Admin unmuted",mute_until:null,updated_at:new Date().toISOString()};
    await sb.from("moderation").upsert(row,{onConflict:"user_id"});
    setModCache(p=>({...p,[uid]:undefined}));
  };
  const adminBan=async(uid,uname)=>{
    if(!isAdmin)return;if(!window.confirm("Ban "+uname+"?"))return;
    const row={user_id:uid,user_name:uname,status:"banned",warnings:0,reason:"Admin ban",mute_until:null,updated_at:new Date().toISOString()};
    await sb.from("moderation").upsert(row,{onConflict:"user_id"});
    setModCache(p=>({...p,[uid]:undefined}));
  };

  const closeMob=()=>setMobSide(false);

  return(
    <>
      <style>{CSS}</style>
      <Particles/>
      {mobSide&&<div className="sidebar-overlay" onClick={closeMob}/>}

      <div className="comm-wrap">
        {/* SIDEBAR */}
        <aside className={"comm-sidebar"+(mobSide?" mob-open":"")}>
          <div className="comm-logo">
            <div className="comm-logo-top">
              <div className="comm-logo-icon">⚔️</div>
              <span className="comm-logo-name">Rex Magnus</span>
            </div>
            <span className="comm-logo-sub">Reader Community</span>
            <button className="back-link" onClick={()=>goTo("/")}>← Portfolio</button>
          </div>

          <div className="room-list">
            <p className="room-section-label">Channels</p>
            {chLoading
              ? <div style={{padding:"0.8rem 1.2rem",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.72rem",color:"var(--muted)"}}>Loading...</div>
              : channels.map(r=>(
                <button key={r.id} className={"room-btn"+(roomId===r.id?" active":"")}
                  onClick={()=>{setRoomId(r.id);closeMob();}}>
                  <span className="room-icon">{r.icon}</span>
                  <span className="room-label"># {r.label}</span>
                  <span className="room-badge-row">
                    {r.is_adult&&<span className="room-adult-badge">18+</span>}
                    {(r.channel_type==="announcement"||r.channel_type==="authors_note")&&<span className="room-admin-badge">Admin</span>}
                  </span>
                </button>
              ))
            }
          </div>

          {user&&(
            <div className="sidebar-profile">
              <div className="sp-avatar" style={{background:user.color+"22",borderColor:user.color+"66"}}>{user.avatar}</div>
              <div style={{flex:1,minWidth:0}}>
                <p className="sp-name">
                  {isAdmin&&<span className="admin-tag">⚡ Admin</span>}
                  <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</span>
                </p>
                <p className="sp-status">
                  <span className="sp-dot" style={{background:isBanned?"var(--magenta)":isMuted?"var(--gold)":"#22c55e"}}/>
                  {isBanned?"Banned":isMuted?"Muted · "+fmtMuteLeft(modStatus?.mute_until):isAdmin?"Admin · Online":"Online"}
                </p>
              </div>
              <button className="sp-edit" onClick={()=>setShowProfile(true)}>✏️</button>
            </div>
          )}
        </aside>

        {/* MAIN */}
        <div className="comm-main">
          {/* Header */}
          <div className="chat-header">
            <button className="hamburger" onClick={()=>setMobSide(p=>!p)}>☰</button>
            <div className="chat-header-left">
              <span className="chat-header-icon">{currentChannel?.icon||"💬"}</span>
              <div style={{minWidth:0}}>
                <p className="chat-header-title">
                  # {currentChannel?.label||roomId}
                  {isAdultChannel&&<span style={{marginLeft:"0.4rem",fontSize:"0.55rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,padding:"0.08rem 0.35rem",borderRadius:"3px",background:"rgba(255,45,122,0.15)",border:"1px solid rgba(255,45,122,0.3)",color:"var(--magenta)"}}>18+</span>}
                  {isAdminOnly&&<span style={{marginLeft:"0.4rem",fontSize:"0.55rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,padding:"0.08rem 0.35rem",borderRadius:"3px",background:"rgba(255,184,0,0.12)",border:"1px solid rgba(255,184,0,0.3)",color:"var(--gold)"}}>ADMIN</span>}
                </p>
                <p className="chat-header-desc">{currentChannel?.description||""}</p>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"0.6rem",flexShrink:0}}>
              <button className="home-btn" onClick={()=>goTo("/")}>← <span>Home</span></button>
              <div className="online-pill"><span className="online-dot"/><span>Live</span></div>
            </div>
          </div>

          {/* Pinned banner */}
          {pinnedMsgs.length>0&&(
            <div className="pinned-banner" onClick={()=>{
              const el=document.getElementById("pinned-"+pinnedMsgs[pinnedMsgs.length-1].id);
              el?.scrollIntoView({behavior:"smooth",block:"center"});
            }}>
              <span className="pinned-banner-icon">📌</span>
              <span className="pinned-banner-text">{pinnedMsgs[pinnedMsgs.length-1].text||"[image]"}</span>
              <span className="pinned-banner-label">Pinned · {pinnedMsgs.length}</span>
            </div>
          )}

          {/* Messages */}
          <div className="chat-messages">
            {/* Pinned messages at top */}
            {pinnedMsgs.length>0&&(
              <div style={{marginBottom:"0.8rem"}}>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.4rem"}}>
                  <span style={{fontSize:"0.6rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--violet)"}}>📌 Pinned</span>
                  <div style={{flex:1,height:"1px",background:"rgba(123,47,255,0.2)"}}/>
                </div>
                {pinnedMsgs.map(m=>(
                  <div key={"pin-"+m.id} id={"pinned-"+m.id}
                    style={{padding:"0.55rem 0.85rem",borderRadius:"6px",background:"rgba(123,47,255,0.07)",border:"1px solid rgba(123,47,255,0.18)",marginBottom:"0.3rem",display:"flex",alignItems:"flex-start",gap:"0.6rem"}}>
                    <span style={{fontSize:"0.9rem"}}>{m.userAvatar}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:"0.4rem",marginBottom:"0.15rem",flexWrap:"wrap"}}>
                        {m.userId&&m.userId==="sys"||isAdmin?<span className="admin-tag">⚡ Admin</span>:null}
                        <span style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"0.75rem",color:m.userColor}}>{m.userName}</span>
                        <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:"0.6rem",color:"var(--muted)"}}>{fmtTime(m.ts)}</span>
                      </div>
                      <p style={{fontFamily:"'Rajdhani',sans-serif",fontSize:"0.82rem",color:"var(--soft)",lineHeight:1.5,wordBreak:"break-word"}}>{m.text||"[image]"}</p>
                    </div>
                    {isAdmin&&<button onClick={()=>togglePin(m)} style={{background:"none",border:"none",color:"rgba(123,47,255,0.5)",cursor:"pointer",fontSize:"0.8rem",padding:"0.1rem",flexShrink:0}} title="Unpin">✕</button>}
                  </div>
                ))}
                <div style={{height:"1px",background:"var(--border)",margin:"0.8rem 0"}}/>
              </div>
            )}

            {loading ? (
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",flex:1,flexDirection:"column",gap:"0.7rem"}}>
                <div style={{width:38,height:38,borderRadius:"50%",border:"2px solid var(--violet)",borderTopColor:"transparent",animation:"spin 0.8s linear infinite"}}/>
                <p style={{fontFamily:"'Rajdhani',sans-serif",fontSize:"0.78rem",color:"var(--muted)"}}>Loading messages...</p>
              </div>
            ) : grouped.length===0 ? (
              <div style={{textAlign:"center",padding:"3rem 1rem"}}>
                <div style={{fontSize:"2.2rem",marginBottom:"0.7rem"}}>{currentChannel?.icon||"💬"}</div>
                <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.3rem",letterSpacing:"0.06em",color:"var(--text)",marginBottom:"0.3rem"}}>Start the conversation</p>
                <p style={{fontFamily:"'Rajdhani',sans-serif",fontSize:"0.82rem",color:"var(--muted)"}}>Be the first to post in #{currentChannel?.label||roomId}</p>
              </div>
            ) : grouped.map(item=>{
              if(item.type==="date") return <div key={item.key} className="msg-date-divider"><span>{item.label}</span></div>;
              const m=item.msg;
              const isOwn=m.userId===user?.id;
              const msgIsAdmin=isAdmin&&isOwn; // show admin tag on own msgs if admin
              const emojiOnly=m.text&&isEmojiOnly(m.text);
              const withinEdit=canEdit(m.ts);
              const showAdminTag=isAdmin&&isOwn; // admin's own msgs get the tag
              // check if this message's sender is admin (stored in community — we approximate by checking if admin is logged in and it's their own msg)
              // For other users' messages that were sent by admin: we store no flag, so we rely on a naming convention
              // Better: mark admin messages with a flag. For now, showAdminBar means admin is viewing and can act on others' msgs
              const showModBar=isAdmin&&!isOwn;
              const mStatus=cachedStatus(m.userId);

              return(
                <div key={m.id} className={"msg-group"+(isOwn?" own":"")}
                  onMouseEnter={()=>{if(showModBar)fetchModCache(m.userId);}}>
                  <div className="msg-avatar" style={{background:m.userColor+"22",borderColor:m.userColor+"55"}}>{m.userAvatar}</div>
                  <div className="msg-content">
                    <div className="msg-meta">
                      {showAdminTag&&<span className="admin-tag">⚡ Admin</span>}
                      <span className="msg-name" style={{color:m.userColor}}>{m.userName}</span>
                      <span className="msg-time">{fmtTime(m.ts)}</span>
                      {m.editedAt&&<span className="msg-edited">(edited)</span>}
                    </div>

                    {editingId===m.id ? (
                      <div className="msg-edit-box">
                        <textarea className="msg-edit-textarea" value={editText} rows={2}
                          onChange={e=>setEditText(e.target.value)}
                          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();saveEdit(m.id);}if(e.key==="Escape")setEditingId(null);}}
                          autoFocus/>
                        <div className="msg-edit-actions">
                          <button className="msg-edit-save" onClick={()=>saveEdit(m.id)}>Save</button>
                          <button className="msg-edit-cancel" onClick={()=>setEditingId(null)}>Cancel</button>
                        </div>
                      </div>
                    ):(
                      <>
                        {m.text&&(emojiOnly?<div className="msg-emoji">{m.text}</div>:<div className="msg-bubble">{m.text}</div>)}
                        {m.imgUrl&&<div className="msg-img-wrap"><img src={m.imgUrl} alt="shared" className="msg-img" onClick={()=>setLightbox(m.imgUrl)}/></div>}
                      </>
                    )}

                    <div className="msg-reactions">
                      {Object.entries(m.reactions||{}).filter(([,v])=>v.count>0).map(([emoji,v])=>(
                        <button key={emoji} className={"reaction-btn"+(v.users?.includes(user?.id)?" mine":"")}
                          onClick={()=>addReaction(m.id,emoji)}>{emoji} {v.count}</button>
                      ))}
                      {QUICK_REACTIONS.slice(0,4).map(em=>(
                        <button key={em} className="reaction-btn" style={{fontSize:"0.75rem",padding:"0.08rem 0.28rem"}}
                          onClick={()=>addReaction(m.id,em)}>{em}</button>
                      ))}
                    </div>
                  </div>

                  {/* Action bar on hover */}
                  {editingId!==m.id&&(
                    <div className="msg-action-bar">
                      {/* Own message actions (within 10 min) */}
                      {isOwn&&withinEdit&&!isAdminOnly&&(
                        <><button className="mab-btn mab-edit" onClick={()=>startEdit(m)}>Edit</button><div className="mab-sep"/></>
                      )}
                      {isOwn&&withinEdit&&(
                        <><button className="mab-btn mab-del" onClick={()=>deleteMsg(m.id)}>Del</button><div className="mab-sep"/></>
                      )}
                      {/* Admin actions */}
                      {isAdmin&&!isOwn&&(
                        <>
                          <button className="mab-btn mab-pin" onClick={()=>togglePin(m)}>{m.isPinned?"Unpin":"Pin"}</button>
                          <div className="mab-sep"/>
                          {mStatus==="muted"
                            ?<button className="mab-btn mab-unmute" onClick={()=>adminUnmute(m.userId,m.userName)}>Unmute</button>
                            :<button className="mab-btn mab-mute" onClick={()=>openMute(m.userId,m.userName)}>Mute</button>
                          }
                          {mStatus!=="banned"&&<><div className="mab-sep"/><button className="mab-btn mab-ban" onClick={()=>adminBan(m.userId,m.userName)}>Ban</button></>}
                          <div className="mab-sep"/>
                          <button className="mab-btn mab-del" onClick={()=>deleteMsg(m.id)}>Del</button>
                        </>
                      )}
                      {/* Admin can also pin their own msgs */}
                      {isAdmin&&isOwn&&(
                        <><button className="mab-btn mab-pin" onClick={()=>togglePin(m)}>{m.isPinned?"Unpin":"Pin"}</button></>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef}/>
          </div>

          {/* System message */}
          {sysMsg&&<div className={"sys-msg "+(sysMsg.type==="ban"?"sys-ban":"sys-warn")}>{sysMsg.text}</div>}
          {modStatus&&modStatus.status!=="ok"&&!sysMsg&&(
            <div className={"sys-msg "+(isBanned?"sys-ban":"sys-warn")}>
              {isBanned&&"⛔ You are banned from this community."}
              {isMuted&&"🔇 Muted · "+fmtMuteLeft(modStatus?.mute_until)}
              {modStatus.status==="warned1"&&"⚠ Warning 1/2: Profanity isn't allowed. One more and you'll be banned."}
              {modStatus.status==="warned2"&&"⚠ Warning 2/2: Final warning issued."}
            </div>
          )}
          {isAdminOnly&&!isAdmin&&<div className="admin-only-notice">📢 This is an admin-only channel. You can read but not post here.</div>}

          <div className="typing-bar"/>

          {/* Input */}
          <div className="chat-input-area">
            <div className="chat-input-box">
              <button className="input-btn img-upload-btn" disabled={inputDisabled}>
                📎<input type="file" accept="image/*" onChange={handleImageUpload} disabled={inputDisabled}/>
              </button>
              <textarea ref={textareaRef} className="chat-textarea" value={input}
                onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,120)+"px";}}
                onKeyDown={handleKey} placeholder={inputPlaceholder} disabled={inputDisabled} rows={1}/>
              <div className="input-relative">
                <button className="input-btn" onClick={()=>setShowEmoji(p=>!p)} disabled={inputDisabled}>😊</button>
                {showEmoji&&(
                  <div className="emoji-picker" onClick={e=>e.stopPropagation()}>
                    {EMOJI_LIST.map(em=>(
                      <button key={em} className="emoji-opt" onClick={()=>{setInput(p=>p+em);setShowEmoji(false);textareaRef.current?.focus();}}>{em}</button>
                    ))}
                  </div>
                )}
              </div>
              <button className="input-btn input-send" onClick={()=>sendMessage(input)} disabled={!input.trim()||inputDisabled}>
                {sending?"…":"➤"}
              </button>
            </div>
            {isAdultChannel
              ?<p className="input-hint" style={{color:"rgba(255,45,122,0.45)"}}>🔞 18+ channel — content rules do not apply here</p>
              :<p className="input-hint">Enter to send · Shift+Enter new line · 📎 images · Edit/delete within 10 min</p>
            }
          </div>
        </div>
      </div>

      {lightbox&&(
        <div className="lightbox" onClick={()=>setLightbox(null)}>
          <button className="lightbox-x" onClick={()=>setLightbox(null)}>✕</button>
          <img src={lightbox} alt="Full size" onClick={e=>e.stopPropagation()}/>
        </div>
      )}

      {muteTarget&&<MuteModal target={muteTarget} onConfirm={applyMute} onCancel={()=>setMuteTarget(null)}/>}

      {showOnboard&&<Onboard sb={sb} onDone={(u,admin)=>{setUser(u);lSet("rm_chat_user",u);if(admin)setIsAdmin(true);setShowOnboard(false);}}/>}
      {showProfile&&user&&(
        <div className="profile-overlay" onClick={()=>setShowProfile(false)}>
          <div onClick={e=>e.stopPropagation()}>
            <Onboard sb={sb} initial={user} isEdit currentIsAdmin={isAdmin}
              onDone={(u,admin)=>{setUser(u);lSet("rm_chat_user",u);if(admin!==undefined)setIsAdmin(admin);setShowProfile(false);}}
              onAdminLogout={()=>{lDel("rm_comm_admin");setIsAdmin(false);setShowProfile(false);}}/>
          </div>
        </div>
      )}

      {showEmoji&&<div style={{position:"fixed",inset:0,zIndex:40}} onClick={()=>setShowEmoji(false)}/>}
    </>
  );
}

/* ─── ONBOARDING / PROFILE ───────────────────────── */
function Onboard({sb,onDone,initial,isEdit,currentIsAdmin,onAdminLogout}){
  const [name,setName]     = useState(initial?.name||"");
  const [avatar,setAvatar] = useState(initial?.avatar||AVATARS[0]);
  const [color,setColor]   = useState(initial?.color||AVATAR_COLORS[0]);
  const [err,setErr]       = useState("");
  const [showAdmin,setShowAdmin] = useState(false);
  const [adminPw,setAdminPw]     = useState("");
  const [adminErr,setAdminErr]   = useState("");
  const [adminLoading,setAdminLoading] = useState(false);
  const [adminGranted,setAdminGranted] = useState(currentIsAdmin||false);

  const submit=()=>{
    if(!name.trim()){setErr("Please choose a display name.");return;}
    if(name.trim().length<2){setErr("Name must be at least 2 characters.");return;}
    onDone({id:initial?.id||genId(),name:name.trim(),avatar,color},adminGranted?true:undefined);
  };

  const tryAdminLogin=async()=>{
    if(!adminPw.trim())return;
    setAdminLoading(true);setAdminErr("");
    const {data}=await sb.from("settings").select("value").eq("key","admin_password").single();
    const correctPw=data?.value||"admin123";
    if(adminPw.trim()===correctPw){
      // Create a 30-day token
      const tok=genId()+genId();
      await sb.from("admin_tokens").insert({token:tok,created_at:new Date().toISOString(),expires_at:new Date(Date.now()+30*24*3600000).toISOString()});
      lSet("rm_comm_admin",tok);
      setAdminGranted(true);setAdminErr("");setShowAdmin(false);setAdminPw("");
    } else {
      setAdminErr("Wrong password.");
    }
    setAdminLoading(false);
  };

  return(
    <div className="onboard-bg">
      <div className="onboard-box">
        <h2 className="onboard-title">{isEdit?"Edit Profile":"Join the Community"}</h2>
        <p className="onboard-sub">{isEdit?"Update your display name, avatar, or colour.":"Pick your display name and avatar to start chatting."}</p>

        <label className="onboard-label">Display Name</label>
        <input className="onboard-input" value={name} maxLength={24}
          onChange={e=>{setName(e.target.value);setErr("");}}
          onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="e.g. ShadowReader, DarkCity42..." autoFocus/>

        <label className="onboard-label">Choose Avatar</label>
        <div className="avatar-grid">
          {AVATARS.map(a=>(
            <button key={a} className={"av-opt"+(avatar===a?" sel":"")}
              style={avatar===a?{background:color+"22"}:{}} onClick={()=>setAvatar(a)}>{a}</button>
          ))}
        </div>

        <label className="onboard-label">Colour</label>
        <div className="color-grid">
          {AVATAR_COLORS.map(c=>(
            <div key={c} className={"col-opt"+(color===c?" sel":"")} style={{background:c}} onClick={()=>setColor(c)}/>
          ))}
        </div>

        {/* Preview */}
        <div style={{display:"flex",alignItems:"center",gap:"0.7rem",padding:"0.7rem 0.9rem",borderRadius:"6px",background:"rgba(255,255,255,0.02)",border:"1px solid var(--border)",marginBottom:"1rem"}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:color+"22",border:"2px solid "+color+"66",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem"}}>{avatar}</div>
          <div>
            <p style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"0.85rem",color,display:"flex",alignItems:"center",gap:"0.3rem"}}>
              {adminGranted&&<span className="admin-tag">⚡ Admin</span>}
              {name||"Your name"}
            </p>
            <p style={{fontFamily:"'Rajdhani',sans-serif",fontSize:"0.62rem",color:"var(--muted)"}}>Preview</p>
          </div>
        </div>

        {/* Admin login section */}
        {!adminGranted&&(
          <>
            <button className="admin-login-toggle" onClick={()=>setShowAdmin(p=>!p)}>
              ⚡ {showAdmin?"Hide Admin Login":"Admin? Login here"}
            </button>
            {showAdmin&&(
              <div className="admin-login-section">
                <p>Enter the admin password to unlock moderation tools and the golden admin tag in chat. This does NOT share access to the portfolio admin dashboard.</p>
                <div className="admin-pw-row">
                  <input type="password" className="admin-pw-input" value={adminPw}
                    onChange={e=>{setAdminPw(e.target.value);setAdminErr("");}}
                    onKeyDown={e=>e.key==="Enter"&&tryAdminLogin()}
                    placeholder="Admin password..."/>
                  <button className="admin-pw-btn" onClick={tryAdminLogin} disabled={adminLoading}>
                    {adminLoading?"...":"Unlock"}
                  </button>
                </div>
                {adminErr&&<p style={{fontFamily:"'Rajdhani',sans-serif",fontSize:"0.72rem",color:"var(--magenta)",marginTop:"0.4rem"}}>{adminErr}</p>}
              </div>
            )}
          </>
        )}

        {/* Admin logout in profile edit */}
        {adminGranted&&isEdit&&(
          <div style={{background:"rgba(255,184,0,0.06)",border:"1px solid rgba(255,184,0,0.2)",borderRadius:"6px",padding:"0.8rem",marginBottom:"1rem",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"0.8rem"}}>
            <p style={{fontFamily:"'Rajdhani',sans-serif",fontSize:"0.75rem",color:"rgba(255,184,0,0.8)"}}>⚡ You are logged in as Community Admin.</p>
            {onAdminLogout&&<button onClick={onAdminLogout} style={{background:"none",border:"1px solid rgba(255,45,122,0.3)",borderRadius:"3px",color:"var(--magenta)",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.68rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",padding:"0.25rem 0.6rem",transition:"all 0.2s",whiteSpace:"nowrap"}}>Log Out</button>}
          </div>
        )}

        {err&&<p className="onboard-err">⚠ {err}</p>}
        <button className="onboard-btn" onClick={submit}>{isEdit?"Save Changes":"Enter Community →"}</button>
      </div>
    </div>
  );
}
