import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ══════════════════════════════════════════════
//  SUPABASE CLIENT
// ══════════════════════════════════════════════
const SUPABASE_URL = "https://aanksddaitghblfrarvj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbmtzZGRhaXRnaGJsZnJhcnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MjE2MDgsImV4cCI6MjA4NzE5NzYwOH0.9U7TdjAd-r4nVhI9VEAa77DBA6Kp5eEsit9FPOZM1N8";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ══════════════════════════════════════════════
//  DEFAULT ADMIN PASSWORD
const DEFAULT_ADMIN_PASSWORD = "admin123";
// ══════════════════════════════════════════════

// Navigation helper
const goTo = (path) => {
  if (typeof window.__navigate === "function") window.__navigate(path);
  else window.location.href = path;
};

// Get admin password from Supabase settings table
const getAdminPassword = async () => {
  const { data } = await sb.from("settings").select("value").eq("key", "admin_password").single();
  return data?.value || DEFAULT_ADMIN_PASSWORD;
};

/* ─────────────────────────────────────────────
   DEFAULT DATA (used as fallback only)
───────────────────────────────────────────── */
const DEFAULT_BOOKS = [
  { id: "b1", title: "Iron & Shadow", genre: "Urban Fantasy",
    synopsis: "Malik Kane has one rule: never get involved. But when a ritual murder leaves a supernatural calling card across Chicago's South Side, the ex-soldier turned bounty-hunter is pulled back into a world of shadow courts and ancient debts — whether he wants it or not. The city has teeth. Something old just woke up hungry.",
    coverUrl: "", links: [{ label: "Amazon", url: "#" }, { label: "Goodreads", url: "#" }] },
  { id: "b2", title: "Born of Embers", genre: "Dark Fantasy",
    synopsis: "They told Darius Vael he was broken — a fire-touched outcast who couldn't control the storm inside him. Three years after burning down everything he loved, he returns to Harrow City ruled by the same creatures who made him. Revenge would be simple. Survival is something else entirely.",
    coverUrl: "", links: [{ label: "Amazon", url: "#" }, { label: "Apple Books", url: "#" }] },
  { id: "b3", title: "The Last Threshold", genre: "Paranormal Fantasy",
    synopsis: "Between the seen and unseen world stands one door, and Jonah Cross is its keeper. He didn't ask for the job — it was bled into him. Now the door is cracking, something on the other side wants through, and the only people who can help him are the ones he swore he'd never trust again.",
    coverUrl: "", links: [{ label: "Amazon", url: "#" }, { label: "Barnes & Noble", url: "#" }] },
];

const DEFAULT_AUTHOR = {
  name: "Rex Magnus", tagline: "Exclusive Author at Newreading & Meganovel",
  bio1: "Write your first bio paragraph here.", bio2: "A second paragraph here.",
  photoUrl: "", email: "hello@rexmagnus.com",
  socials: [
    { label: "Twitter / X", url: "" }, { label: "Instagram", url: "" },
    { label: "Goodreads",   url: "" }, { label: "Newsletter", url: "" },
  ],
};

/* ─────────────────────────────────────────────
   CSS
───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --black:    #050507;
  --deep:     #0a0a0f;
  --dark:     #0f0f18;
  --panel:    #13131e;
  --border:   rgba(255,255,255,0.06);
  --border2:  rgba(255,255,255,0.12);
  --cyan:     #00d4ff;
  --cyan2:    #00a8cc;
  --violet:   #7b2fff;
  --violet2:  #5a1fcc;
  --magenta:  #ff2d7a;
  --gold:     #ffb800;
  --text:     #e8e8f0;
  --muted:    #6b6b85;
  --soft:     #9898b8;
  --r:        8px;
}

html{scroll-behavior:smooth}
body{
  font-family:'Inter',sans-serif;
  background:var(--black);
  color:var(--text);
  overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:var(--black)}
::-webkit-scrollbar-thumb{background:var(--violet);border-radius:2px}

#particles{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:0.55}

/* ── NAV ── */
.nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 3rem;height:64px;
  background:rgba(5,5,7,0.85);backdrop-filter:blur(20px);
  border-bottom:1px solid var(--border);
}
.nav::after{
  content:'';position:absolute;bottom:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,var(--cyan),var(--violet),transparent);
  opacity:0.5;
}
.nav-logo{
  font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:0.08em;
  background:linear-gradient(135deg,var(--cyan),var(--violet));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  text-decoration:none;cursor:pointer;
}
.nav-links{display:flex;align-items:center;gap:2rem}
.nav-links a{
  font-family:'Rajdhani',sans-serif;font-weight:600;font-size:0.8rem;
  letter-spacing:0.14em;text-transform:uppercase;
  color:var(--muted);text-decoration:none;transition:color 0.2s;position:relative;
}
.nav-links a::after{
  content:'';position:absolute;bottom:-4px;left:0;width:0;height:1px;
  background:var(--cyan);transition:width 0.3s;
}
.nav-links a:hover{color:var(--cyan)}
.nav-links a:hover::after{width:100%}
.nav-admin{
  padding:0.4rem 1.1rem;border-radius:4px;
  border:1px solid rgba(0,212,255,0.3);background:rgba(0,212,255,0.05);
  color:var(--cyan);font-family:'Rajdhani',sans-serif;font-size:0.75rem;
  font-weight:700;letter-spacing:0.12em;text-transform:uppercase;
  cursor:pointer;transition:all 0.25s;
}
.nav-admin:hover{background:rgba(0,212,255,0.12);border-color:var(--cyan);box-shadow:0 0 20px rgba(0,212,255,0.2)}

/* ── HERO ── */
.hero{
  min-height:100vh;padding-top:64px;
  display:grid;grid-template-columns:1fr 1fr;
  position:relative;overflow:hidden;
}
.hero-bg{
  position:absolute;inset:0;z-index:0;
  background:
    radial-gradient(ellipse 80% 70% at 0% 50%,rgba(123,47,255,0.14) 0%,transparent 65%),
    radial-gradient(ellipse 50% 40% at 100% 20%,rgba(0,212,255,0.08) 0%,transparent 60%),
    radial-gradient(ellipse 40% 50% at 60% 90%,rgba(255,45,122,0.06) 0%,transparent 60%),
    var(--black);
}
.hero-scan{
  position:absolute;inset:0;z-index:1;pointer-events:none;
  background:repeating-linear-gradient(
    0deg,transparent,transparent 2px,rgba(0,212,255,0.008) 2px,rgba(0,212,255,0.008) 4px
  );
}
.hero-left{
  position:relative;z-index:2;
  display:flex;flex-direction:column;justify-content:center;
  padding:5rem 3rem 5rem 5rem;
}
.hero-platform-tag{
  display:inline-flex;align-items:center;gap:0.55rem;
  padding:0.32rem 0.9rem;border-radius:4px;
  border:1px solid rgba(0,212,255,0.2);background:rgba(0,212,255,0.05);
  margin-bottom:1.6rem;width:fit-content;
  animation:fadeDown 0.7s ease both;
}
.hero-platform-tag .ptag-dot{
  width:5px;height:5px;border-radius:50%;background:var(--cyan);
  animation:blink 1.5s ease infinite;flex-shrink:0;
}
.hero-platform-tag span{
  font-family:'Rajdhani',sans-serif;font-weight:600;font-size:0.68rem;
  letter-spacing:0.18em;text-transform:uppercase;color:var(--cyan);
}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.15}}
.hero-name{
  font-family:'Bebas Neue',sans-serif;
  font-size:clamp(3.5rem,6vw,7rem);
  line-height:0.92;letter-spacing:0.04em;margin-bottom:0.6rem;
  animation:fadeUp 0.85s ease 0.1s both;
}
.hero-name .nm-first{
  display:block;
  background:linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.75) 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.hero-name .nm-last{
  display:block;
  background:linear-gradient(135deg,var(--cyan),var(--violet));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  filter:drop-shadow(0 0 30px rgba(0,212,255,0.25));
}
.hero-platform-line{
  display:flex;align-items:center;gap:0.7rem;flex-wrap:wrap;
  margin-bottom:1.8rem;animation:fadeUp 0.85s ease 0.2s both;
}
.hero-platform-line .pl-rule{
  width:28px;height:1px;
  background:linear-gradient(90deg,var(--violet),var(--cyan));flex-shrink:0;
}
.hero-platform-line p{
  font-family:'Rajdhani',sans-serif;font-size:0.82rem;font-weight:500;
  color:var(--soft);letter-spacing:0.06em;
}
.hero-platform-line .pl-badge{
  padding:0.15rem 0.55rem;border-radius:3px;
  background:rgba(123,47,255,0.18);border:1px solid rgba(123,47,255,0.3);
  font-family:'Rajdhani',sans-serif;font-size:0.62rem;font-weight:700;
  letter-spacing:0.1em;text-transform:uppercase;color:var(--violet);white-space:nowrap;
}
.hero-tagline{
  font-family:'Rajdhani',sans-serif;font-size:1.05rem;font-weight:400;
  color:var(--muted);line-height:1.75;max-width:480px;
  margin-bottom:2.8rem;letter-spacing:0.03em;
  animation:fadeUp 0.85s ease 0.3s both;
}
.hero-btns{
  display:flex;gap:1rem;flex-wrap:wrap;
  animation:fadeUp 0.85s ease 0.4s both;margin-bottom:3.5rem;
}
.btn-glow{
  display:inline-flex;align-items:center;gap:0.6rem;
  padding:0.85rem 2rem;border-radius:4px;border:none;cursor:pointer;text-decoration:none;
  font-family:'Rajdhani',sans-serif;font-size:0.88rem;font-weight:700;
  letter-spacing:0.1em;text-transform:uppercase;
  background:linear-gradient(135deg,var(--violet),var(--cyan2));
  color:#fff;transition:all 0.3s;box-shadow:0 4px 30px rgba(123,47,255,0.4);
  position:relative;overflow:hidden;
}
.btn-glow::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,var(--cyan),var(--violet2));opacity:0;transition:opacity 0.3s;
}
.btn-glow:hover::before{opacity:1}
.btn-glow:hover{transform:translateY(-2px);box-shadow:0 8px 40px rgba(123,47,255,0.6)}
.btn-glow span{position:relative}
.btn-outline{
  display:inline-flex;align-items:center;gap:0.6rem;
  padding:0.85rem 2rem;border-radius:4px;border:1px solid var(--border2);
  background:rgba(255,255,255,0.03);color:var(--soft);cursor:pointer;text-decoration:none;
  font-family:'Rajdhani',sans-serif;font-size:0.88rem;font-weight:600;
  letter-spacing:0.08em;text-transform:uppercase;transition:all 0.25s;
}
.btn-outline:hover{border-color:var(--cyan);color:var(--cyan);background:rgba(0,212,255,0.05)}
.hero-stats{
  display:flex;gap:0;border:1px solid var(--border);border-radius:6px;
  background:rgba(255,255,255,0.02);backdrop-filter:blur(10px);
  overflow:hidden;animation:fadeUp 0.9s ease 0.55s both;width:fit-content;
}
.hstat{padding:1rem 2rem;text-align:center;position:relative;}
.hstat+.hstat::before{
  content:'';position:absolute;left:0;top:20%;height:60%;width:1px;background:var(--border);
}
.hstat-n{
  font-family:'Bebas Neue',sans-serif;font-size:2rem;
  background:linear-gradient(135deg,var(--cyan),var(--violet));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  line-height:1;display:block;
}
.hstat-l{
  font-family:'Rajdhani',sans-serif;font-size:0.65rem;font-weight:600;
  letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);display:block;margin-top:0.25rem;
}
.hero-right{
  position:relative;z-index:2;display:flex;align-items:center;justify-content:center;overflow:hidden;
}
.hero-right-bg{
  position:absolute;inset:0;
  background:radial-gradient(ellipse 70% 80% at 50% 50%,rgba(123,47,255,0.12) 0%,transparent 70%);
}
.hero-right-grid{
  position:absolute;inset:0;
  background-image:
    linear-gradient(rgba(123,47,255,0.06) 1px,transparent 1px),
    linear-gradient(90deg,rgba(0,212,255,0.04) 1px,transparent 1px);
  background-size:44px 44px;
  mask-image:radial-gradient(ellipse at center,black 40%,transparent 78%);
  -webkit-mask-image:radial-gradient(ellipse at center,black 40%,transparent 78%);
}
.hero-book-3d{
  position:relative;display:flex;flex-direction:column;align-items:center;gap:2rem;z-index:2;
}
.hero-book-cover{
  width:200px;aspect-ratio:2/3;border-radius:6px;
  background:linear-gradient(160deg,#1e1030,#0d0d1a);
  border:1px solid rgba(123,47,255,0.3);
  box-shadow:0 40px 80px rgba(0,0,0,0.7),0 0 60px rgba(123,47,255,0.18),-8px 0 20px rgba(0,0,0,0.5);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:0.8rem;padding:1.5rem;text-align:center;
  position:relative;overflow:hidden;
  animation:floatBook 7s ease-in-out infinite;
}
@keyframes floatBook{
  0%,100%{transform:translateY(0) rotateY(-4deg)}
  50%{transform:translateY(-18px) rotateY(-2deg)}
}
.hero-book-cover::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(123,47,255,0.12) 0%,transparent 55%);
}
.hero-book-cover::after{
  content:'';position:absolute;top:0;left:0;bottom:0;width:6px;
  background:linear-gradient(to bottom,var(--violet),var(--cyan));border-radius:6px 0 0 6px;
}
.hero-book-cover img{
  width:100%;height:100%;object-fit:cover;position:absolute;inset:0;border-radius:6px;
}
.hbc-icon{font-size:3.5rem;opacity:0.3;position:relative}
.hbc-title{
  font-family:'Bebas Neue',sans-serif;font-size:1rem;letter-spacing:0.08em;
  color:rgba(232,232,240,0.85);line-height:1.25;position:relative;
}
.hbc-genre{
  font-family:'Rajdhani',sans-serif;font-size:0.6rem;font-weight:700;
  letter-spacing:0.2em;text-transform:uppercase;color:var(--cyan);position:relative;
}
.hero-float-chip{
  position:absolute;padding:0.4rem 1rem;border-radius:4px;
  background:linear-gradient(135deg,rgba(123,47,255,0.9),rgba(0,168,204,0.9));
  color:white;font-family:'Rajdhani',sans-serif;font-size:0.65rem;
  font-weight:700;letter-spacing:0.12em;text-transform:uppercase;
  box-shadow:0 4px 16px rgba(123,47,255,0.5);
}
.hfc1{top:18%;right:4%;animation:chipFloat 5s ease-in-out infinite}
.hfc2{bottom:20%;left:2%;animation:chipFloat 7s ease-in-out infinite 1.5s}
@keyframes chipFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.hero-scroll{
  position:absolute;bottom:2rem;left:5rem;
  display:flex;flex-direction:column;align-items:center;gap:0.5rem;
  color:var(--muted);animation:fadeUp 1s ease 1s both;z-index:3;
}
.hero-scroll span{font-family:'Rajdhani',sans-serif;font-size:0.62rem;letter-spacing:0.2em;text-transform:uppercase}
.scroll-line{width:1px;height:40px;background:linear-gradient(to bottom,var(--violet),transparent);animation:scrollAnim 2s ease infinite}
@keyframes scrollAnim{0%{opacity:1;transform:scaleY(1);transform-origin:top}100%{opacity:0;transform:scaleY(0.3);transform-origin:bottom}}
@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}

/* ── SECTIONS ── */
.section{padding:7rem 4rem;position:relative}
.sec-eyebrow{display:flex;align-items:center;gap:1rem;margin-bottom:1.2rem}
.sec-eyebrow-line{width:40px;height:1px;background:linear-gradient(90deg,var(--cyan),var(--violet))}
.sec-eyebrow span{
  font-family:'Rajdhani',sans-serif;font-size:0.72rem;font-weight:700;
  letter-spacing:0.22em;text-transform:uppercase;color:var(--cyan);
}
.sec-title{
  font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,5vw,4.5rem);
  letter-spacing:0.05em;line-height:0.95;margin-bottom:0.8rem;
}
.sec-title .grad{background:linear-gradient(135deg,#fff,var(--soft));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sec-title .col{background:linear-gradient(135deg,var(--cyan),var(--violet));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sec-sub{font-family:'Rajdhani',sans-serif;font-size:1rem;font-weight:400;color:var(--muted);letter-spacing:0.04em;line-height:1.6}

/* ── BOOKS ── */
.books-section{background:var(--deep)}
.books-section::before{
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,var(--violet),var(--cyan),transparent);
}
.books-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:2rem;margin-top:3.5rem}
.book-card{cursor:pointer;position:relative;transition:transform 0.4s cubic-bezier(.34,1.56,.64,1)}
.book-card:hover{transform:translateY(-12px)}
.book-card::before{
  content:'';position:absolute;inset:-1px;border-radius:6px;
  background:linear-gradient(135deg,var(--cyan),var(--violet),var(--magenta));
  opacity:0;transition:opacity 0.4s;z-index:-1;
}
.book-card:hover::before{opacity:0.4}
.book-cover{
  aspect-ratio:2/3;border-radius:5px;overflow:hidden;position:relative;
  background:linear-gradient(160deg,#1a1128,#0d0d1a);
  box-shadow:0 20px 60px rgba(0,0,0,0.7);transition:box-shadow 0.4s;
}
.book-card:hover .book-cover{box-shadow:0 30px 80px rgba(0,0,0,0.8),0 0 40px rgba(123,47,255,0.2)}
.book-cover img{width:100%;height:100%;object-fit:cover;display:block}
.book-ph{
  width:100%;height:100%;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:0.8rem;padding:1.5rem;text-align:center;
  background:linear-gradient(160deg,#1a1128 0%,#0d0d1a 100%);position:relative;overflow:hidden;
}
.book-ph::before{
  content:'';position:absolute;inset:0;
  background:repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(123,47,255,0.03) 20px,rgba(123,47,255,0.03) 21px);
}
.book-ph-num{font-family:'Bebas Neue',sans-serif;font-size:5rem;background:linear-gradient(135deg,var(--violet),transparent);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;position:relative}
.book-ph-title{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1rem;color:rgba(232,232,240,0.8);line-height:1.3;position:relative}
.book-ph-genre{font-size:0.62rem;text-transform:uppercase;letter-spacing:0.16em;color:var(--cyan);font-family:'Rajdhani',sans-serif;font-weight:600;position:relative}
.book-overlay{
  position:absolute;inset:0;border-radius:5px;
  background:linear-gradient(to top,rgba(5,5,7,0.97) 0%,rgba(5,5,7,0.5) 50%,transparent 100%);
  opacity:0;transition:opacity 0.35s;display:flex;flex-direction:column;justify-content:flex-end;padding:1.2rem;
}
.book-card:hover .book-overlay{opacity:1}
.book-overlay-text{font-family:'Rajdhani',sans-serif;font-size:0.85rem;font-weight:400;color:rgba(232,232,240,0.85);line-height:1.65;display:-webkit-box;-webkit-line-clamp:6;-webkit-box-orient:vertical;overflow:hidden}
.book-overlay-cta{display:flex;align-items:center;gap:0.5rem;margin-top:0.8rem;font-family:'Rajdhani',sans-serif;font-size:0.75rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--cyan)}
.book-genre-chip{position:absolute;top:0.7rem;left:0.7rem;padding:0.25rem 0.65rem;border-radius:3px;background:rgba(123,47,255,0.85);font-family:'Rajdhani',sans-serif;font-size:0.6rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#fff}
.book-info{padding:1rem 0 0}
.book-title{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:0.06em;color:var(--text);line-height:1;margin-bottom:0.3rem}
.book-short{font-family:'Rajdhani',sans-serif;font-size:0.82rem;font-weight:400;color:var(--muted);line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

/* ── MODAL ── */
.modal-bg{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.88);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;padding:2rem;animation:fadeIn 0.2s ease}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{transform:translateY(32px);opacity:0}to{transform:translateY(0);opacity:1}}
.modal{background:var(--panel);border:1px solid var(--border);border-radius:10px;max-width:720px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 40px 100px rgba(0,0,0,0.9),0 0 60px rgba(123,47,255,0.12);animation:slideUp 0.35s cubic-bezier(.34,1.56,.64,1);position:relative}
.modal::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),var(--violet),transparent)}
.modal-hero{height:200px;position:relative;overflow:hidden;border-radius:10px 10px 0 0;background:linear-gradient(140deg,#1a1128,#0d0d1a)}
.modal-hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(123,47,255,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(123,47,255,0.08) 1px,transparent 1px);background-size:30px 30px}
.modal-hero-glow{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,rgba(123,47,255,0.3) 0%,transparent 65%)}
.modal-hero-inner{position:relative;z-index:2;display:flex;align-items:flex-end;gap:2rem;padding:2rem;height:100%}
.modal-thumb{width:110px;aspect-ratio:2/3;border-radius:4px;flex-shrink:0;overflow:hidden;box-shadow:0 16px 50px rgba(0,0,0,0.8);transform:translateY(36px);background:linear-gradient(160deg,#1a1128,#0d0d1a);border:1px solid rgba(123,47,255,0.3)}
.modal-thumb img{width:100%;height:100%;object-fit:cover}
.modal-thumb-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:0.8rem;text-align:center}
.modal-thumb-ph span{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.7rem;color:rgba(232,232,240,0.6);line-height:1.3}
.modal-head-text{padding-bottom:0.5rem}
.modal-genre-tag{font-family:'Rajdhani',sans-serif;font-size:0.68rem;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:var(--cyan);margin-bottom:0.4rem}
.modal-title{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:0.06em;color:#fff;line-height:1}
.modal-x{position:absolute;top:1rem;right:1rem;z-index:10;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.06);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.1);color:var(--soft);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.85rem;transition:all 0.2s}
.modal-x:hover{background:rgba(255,255,255,0.14);color:#fff}
.modal-body{padding:3rem 2.5rem 2.5rem}
.modal-synopsis{font-family:'Rajdhani',sans-serif;font-size:1.05rem;font-weight:400;line-height:1.85;color:var(--soft);margin-bottom:2rem;letter-spacing:0.02em}
.modal-links-label{font-family:'Rajdhani',sans-serif;font-size:0.7rem;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:var(--muted);margin-bottom:0.9rem}
.modal-links{display:flex;flex-wrap:wrap;gap:0.7rem}
.mlink{display:inline-flex;align-items:center;gap:0.4rem;padding:0.6rem 1.4rem;border-radius:4px;text-decoration:none;font-family:'Rajdhani',sans-serif;font-size:0.8rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;transition:all 0.25s}
.mlink-p{background:linear-gradient(135deg,var(--violet),var(--cyan2));color:#fff;box-shadow:0 4px 20px rgba(123,47,255,0.4)}
.mlink-p:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(123,47,255,0.6)}
.mlink-s{background:rgba(255,255,255,0.04);color:var(--soft);border:1px solid var(--border2)}
.mlink-s:hover{border-color:var(--cyan);color:var(--cyan)}

/* ── ABOUT ── */
.about-section{background:var(--black);position:relative;overflow:hidden}
.about-section::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 70% at 100% 50%,rgba(123,47,255,0.08) 0%,transparent 65%),radial-gradient(ellipse 40% 50% at 0% 50%,rgba(0,212,255,0.05) 0%,transparent 60%);pointer-events:none}
.about-grid{display:grid;grid-template-columns:1fr 1.5fr;gap:6rem;align-items:center;max-width:1100px;margin:0 auto;position:relative;z-index:1}
.about-img-wrap{position:relative}
.about-img{aspect-ratio:3/4;border-radius:6px;overflow:hidden;background:linear-gradient(140deg,#1a1128,#0d0d1a);border:1px solid var(--border);box-shadow:0 30px 80px rgba(0,0,0,0.7),0 0 60px rgba(123,47,255,0.08)}
.about-img img{width:100%;height:100%;object-fit:cover}
.about-img-ph{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.5rem}
.about-img-ph svg{opacity:0.15}
.about-img-ph span{font-family:'Rajdhani',sans-serif;font-size:0.75rem;letter-spacing:0.12em;color:var(--muted);text-transform:uppercase}
.about-corner{position:absolute;bottom:-1rem;right:-1rem;width:90px;height:90px;border-radius:50%;background:linear-gradient(135deg,var(--violet),var(--cyan2));display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 8px 30px rgba(123,47,255,0.5)}
.about-corner-n{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;color:#fff;line-height:1}
.about-corner-l{font-size:0.55rem;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.8)}
.about-text-p{font-family:'Rajdhani',sans-serif;font-size:1rem;font-weight:400;line-height:1.85;color:var(--soft);margin-bottom:1.2rem;letter-spacing:0.02em}
.about-socials{display:flex;gap:0.6rem;flex-wrap:wrap;margin-top:2rem}
.social-btn{padding:0.45rem 1.1rem;border-radius:4px;border:1px solid var(--border);background:rgba(255,255,255,0.02);color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;transition:all 0.2s}
.social-btn:hover{border-color:var(--cyan);color:var(--cyan);background:rgba(0,212,255,0.05)}

/* ── CONTACT ── */
.contact-section{background:var(--deep);padding:8rem 4rem;text-align:center;position:relative;overflow:hidden}
.contact-section::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 50%,rgba(123,47,255,0.1) 0%,transparent 65%)}
.contact-section::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--violet),var(--cyan),transparent)}
.contact-inner{position:relative;z-index:1;max-width:600px;margin:0 auto}
.contact-glitch{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,6vw,5rem);letter-spacing:0.06em;color:#fff;line-height:1;margin-bottom:1.5rem;text-shadow:2px 0 rgba(0,212,255,0.3),-2px 0 rgba(255,45,122,0.3)}
.contact-p{font-family:'Rajdhani',sans-serif;font-size:1rem;font-weight:400;color:var(--muted);line-height:1.75;margin-bottom:2.5rem;letter-spacing:0.03em}
.contact-link{display:inline-flex;align-items:center;gap:0.7rem;padding:1rem 2.5rem;border-radius:4px;background:linear-gradient(135deg,var(--violet),var(--cyan2));color:#fff;text-decoration:none;font-family:'Rajdhani',sans-serif;font-size:0.9rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;box-shadow:0 6px 30px rgba(123,47,255,0.5);transition:all 0.3s}
.contact-link:hover{transform:translateY(-3px);box-shadow:0 12px 50px rgba(123,47,255,0.7)}

/* ── FOOTER ── */
footer{background:var(--black);padding:2.5rem 4rem;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem}
footer p{font-family:'Rajdhani',sans-serif;font-size:0.8rem;font-weight:500;letter-spacing:0.08em;color:var(--muted)}

/* ── ADMIN LOGIN ── */
.admin-overlay{position:fixed;inset:0;z-index:600;background:rgba(0,0,0,0.9);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;padding:2rem}
.login-box{background:var(--panel);border:1px solid var(--border);border-radius:10px;max-width:400px;width:100%;padding:2.8rem;box-shadow:0 40px 100px rgba(0,0,0,0.9),0 0 60px rgba(123,47,255,0.1);animation:slideUp 0.3s ease;position:relative}
.login-box::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--violet),var(--cyan),transparent)}
.login-icon{width:52px;height:52px;border-radius:10px;margin-bottom:1.8rem;background:linear-gradient(135deg,rgba(123,47,255,0.2),rgba(0,212,255,0.1));border:1px solid rgba(123,47,255,0.3);display:flex;align-items:center;justify-content:center;font-size:1.4rem}
.login-box h2{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:0.06em;background:linear-gradient(135deg,#fff,var(--soft));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:0.4rem}
.login-sub{font-family:'Rajdhani',sans-serif;font-size:0.88rem;font-weight:400;color:var(--muted);margin-bottom:2rem;letter-spacing:0.04em}
.ff{margin-bottom:1.2rem}
.ff label{display:block;font-family:'Rajdhani',sans-serif;font-size:0.68rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--muted);margin-bottom:0.5rem}
.ff input,.ff textarea{width:100%;padding:0.8rem 1rem;border:1px solid var(--border);border-radius:4px;background:rgba(255,255,255,0.03);color:var(--text);font-family:'Rajdhani',sans-serif;font-size:0.95rem;outline:none;transition:border-color 0.2s;letter-spacing:0.04em}
.ff input:focus,.ff textarea:focus{border-color:var(--violet)}
.ff textarea{resize:vertical;min-height:90px}
.btn-login{width:100%;padding:0.85rem;border:none;border-radius:4px;background:linear-gradient(135deg,var(--violet),var(--cyan2));color:#fff;font-family:'Rajdhani',sans-serif;font-size:0.88rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;transition:all 0.25s;box-shadow:0 4px 20px rgba(123,47,255,0.4)}
.btn-login:hover{box-shadow:0 6px 30px rgba(123,47,255,0.6);transform:translateY(-1px)}
.login-err{color:var(--magenta);font-family:'Rajdhani',sans-serif;font-size:0.8rem;font-weight:500;margin-top:0.5rem;letter-spacing:0.06em}
.btn-cancel{width:100%;background:none;border:none;color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:0.8rem;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;margin-top:1rem;transition:color 0.2s}
.btn-cancel:hover{color:var(--text)}

/* ── DASHBOARD ── */
.dash{position:fixed;inset:0;z-index:600;background:var(--dark);overflow-y:auto;animation:fadeIn 0.25s ease}
.dash-nav{position:sticky;top:0;z-index:10;background:rgba(10,10,15,0.95);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:1rem 3rem;display:flex;align-items:center;justify-content:space-between}
.dash-nav::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--violet),transparent)}
.dash-brand{display:flex;align-items:center;gap:1rem}
.dash-ico{width:36px;height:36px;border-radius:6px;background:linear-gradient(135deg,var(--violet),var(--cyan2));display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.9rem}
.dash-brand h1{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:0.08em;background:linear-gradient(135deg,var(--cyan),var(--violet));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.dash-brand p{font-family:'Rajdhani',sans-serif;font-size:0.72rem;color:var(--muted);letter-spacing:0.08em}
.dash-acts{display:flex;gap:0.6rem}
.da{padding:0.4rem 0.9rem;border-radius:4px;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;transition:all 0.2s}
.da-outline{border:1px solid var(--border);background:rgba(255,255,255,0.02);color:var(--muted)}
.da-outline:hover{border-color:var(--cyan);color:var(--cyan)}
.da-glow{border:none;background:linear-gradient(135deg,var(--violet),var(--cyan2));color:#fff;box-shadow:0 2px 12px rgba(123,47,255,0.4)}
.da-glow:hover{box-shadow:0 4px 20px rgba(123,47,255,0.6)}
.dash-body{padding:2.5rem 3rem;max-width:1200px;margin:0 auto}
.dash-hi{margin-bottom:2.5rem}
.dash-hi h2{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:0.06em;background:linear-gradient(135deg,#fff,var(--soft));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:0.25rem}
.dash-hi p{font-family:'Rajdhani',sans-serif;font-size:0.82rem;color:var(--muted);letter-spacing:0.06em}
.scards{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:2.5rem}
.scard{background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:1.5rem;position:relative;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.3)}
.scard::before{content:'';position:absolute;top:0;left:0;bottom:0;width:2px;background:linear-gradient(to bottom,var(--violet),var(--cyan))}
.scard-ico{font-size:1.4rem;margin-bottom:0.7rem}
.scard-n{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:0.04em;background:linear-gradient(135deg,var(--cyan),var(--violet));-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:block;line-height:1}
.scard-l{font-family:'Rajdhani',sans-serif;font-size:0.66rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);display:block;margin-top:0.3rem}
.tabs{display:flex;border-bottom:1px solid var(--border);margin-bottom:2rem}
.tab{padding:0.7rem 1.4rem;background:none;border:none;border-bottom:2px solid transparent;margin-bottom:-1px;font-family:'Rajdhani',sans-serif;font-size:0.78rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);cursor:pointer;transition:all 0.2s}
.tab.on{color:var(--cyan);border-bottom-color:var(--cyan)}
.tab:hover:not(.on){color:var(--text)}
.acard{background:var(--panel);border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:2rem}
.acard-head{padding:1.2rem 1.5rem;border-bottom:1px solid var(--border);background:rgba(255,255,255,0.01)}
.acard-head h3{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:0.06em;color:var(--text)}
.acard-head p{font-family:'Rajdhani',sans-serif;font-size:0.75rem;color:var(--muted);margin-top:0.1rem}
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:0.8rem 1.5rem;font-family:'Rajdhani',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--muted);background:rgba(255,255,255,0.02);border-bottom:1px solid var(--border)}
td{padding:0.9rem 1.5rem;border-bottom:1px solid rgba(255,255,255,0.03);font-family:'Rajdhani',sans-serif;font-size:0.88rem;font-weight:500;color:var(--text)}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(255,255,255,0.02)}
.td-clicks{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:0.06em;background:linear-gradient(135deg,var(--cyan),var(--violet));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.bar-row{display:flex;align-items:center;gap:0.8rem}
.bar-t{height:4px;background:rgba(255,255,255,0.06);border-radius:2px;flex:1;overflow:hidden}
.bar-f{height:100%;background:linear-gradient(90deg,var(--violet),var(--cyan));border-radius:2px;transition:width 0.8s ease}
.top-chip{display:inline-flex;align-items:center;gap:0.25rem;padding:0.15rem 0.55rem;border-radius:3px;background:rgba(123,47,255,0.15);border:1px solid rgba(123,47,255,0.3);font-family:'Rajdhani',sans-serif;font-size:0.6rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--violet)}
.mgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem}
.mcard{background:var(--panel);border:1px solid var(--border);border-radius:8px;overflow:hidden;transition:box-shadow 0.2s}
.mcard:hover{box-shadow:0 8px 30px rgba(0,0,0,0.5),0 0 20px rgba(123,47,255,0.08)}
.mcard-img{height:130px;overflow:hidden;position:relative;background:linear-gradient(140deg,#1a1128,#0d0d1a)}
.mcard-img img{width:100%;height:100%;object-fit:cover}
.mcard-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:1rem}
.mcard-ph span{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.78rem;color:rgba(232,232,240,0.4);line-height:1.3;text-align:center}
.mcard-clk{position:absolute;top:0.5rem;right:0.5rem;padding:0.2rem 0.55rem;border-radius:3px;background:rgba(0,0,0,0.7);font-family:'Rajdhani',sans-serif;font-size:0.62rem;font-weight:700;color:var(--cyan)}
.mcard-body{padding:0.9rem}
.mcard-title{font-family:'Bebas Neue',sans-serif;font-size:1.05rem;letter-spacing:0.06em;color:var(--text);margin-bottom:0.2rem}
.mcard-genre{font-family:'Rajdhani',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--cyan)}
.mcard-acts{display:flex;gap:0.4rem;margin-top:0.75rem}
.medit{flex:1;padding:0.38rem 0;border:1px solid var(--border);border-radius:3px;background:none;color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;transition:all 0.2s}
.medit:hover{border-color:var(--cyan);color:var(--cyan)}
.mdel{padding:0.38rem 0.7rem;border:1px solid var(--border);border-radius:3px;background:none;color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:0.7rem;cursor:pointer;transition:all 0.2s}
.mdel:hover{border-color:var(--magenta);color:var(--magenta)}
.add-card{background:transparent;border:1px dashed rgba(123,47,255,0.25);border-radius:8px;min-height:155px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.6rem;cursor:pointer;transition:all 0.25s;color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:0.82rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase}
.add-card:hover{border-color:var(--violet);color:var(--violet);background:rgba(123,47,255,0.04)}
.add-icon{width:38px;height:38px;border-radius:50%;border:1px dashed currentColor;display:flex;align-items:center;justify-content:center;font-size:1.2rem}
.author-card{background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:2rem;max-width:780px}
.author-card h3{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:0.06em;color:var(--text);margin-bottom:1.8rem}
.fr2{display:grid;grid-template-columns:1fr 1fr;gap:1rem}

/* image upload */
.img-upload-wrap{display:flex;flex-direction:column;gap:0.6rem}
.img-upload-tabs{display:flex;gap:0;border:1px solid var(--border);border-radius:4px;overflow:hidden;margin-bottom:0.4rem}
.img-upload-tab{flex:1;padding:0.45rem;background:none;border:none;font-family:'Rajdhani',sans-serif;font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);cursor:pointer;transition:all 0.2s}
.img-upload-tab.on{background:rgba(123,47,255,0.2);color:var(--violet)}
.img-preview{width:100%;height:140px;border-radius:4px;object-fit:cover;border:1px solid var(--border);display:block}
.img-preview-ph{width:100%;height:140px;border-radius:4px;border:1px dashed rgba(123,47,255,0.3);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.5rem;background:rgba(123,47,255,0.04);font-family:'Rajdhani',sans-serif;font-size:0.72rem;color:var(--muted);letter-spacing:0.08em}
.img-preview-ph span{font-size:1.5rem;opacity:0.4}
.file-input-label{display:flex;align-items:center;justify-content:center;gap:0.5rem;width:100%;padding:0.65rem;border-radius:4px;border:1px solid rgba(123,47,255,0.3);background:rgba(123,47,255,0.06);color:var(--violet);font-family:'Rajdhani',sans-serif;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;transition:all 0.2s}
.file-input-label:hover{background:rgba(123,47,255,0.12);border-color:var(--violet)}
.file-input-label input[type=file]{display:none}

/* Book form */
.bform-bg{position:fixed;inset:0;z-index:700;background:rgba(0,0,0,0.88);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;padding:2rem}
.bform-box{background:var(--panel);border:1px solid var(--border);border-radius:10px;max-width:520px;width:100%;max-height:90vh;overflow-y:auto;padding:2.5rem;animation:slideUp 0.3s ease;position:relative;box-shadow:0 40px 100px rgba(0,0,0,0.9)}
.bform-box::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),var(--violet),transparent)}
.bform-box h3{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:0.06em;background:linear-gradient(135deg,#fff,var(--soft));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:2rem}
.lrow{display:grid;grid-template-columns:1fr 1.5fr auto;gap:0.4rem;margin-bottom:0.4rem}
.lrow input{padding:0.55rem 0.75rem;font-size:0.85rem}
.lrow-del{padding:0 0.7rem;border:1px solid rgba(255,45,122,0.25);border-radius:4px;background:none;color:var(--magenta);cursor:pointer;font-size:0.85rem;transition:all 0.2s}
.lrow-del:hover{background:rgba(255,45,122,0.08)}
.add-link{background:none;border:1px dashed rgba(123,47,255,0.3);border-radius:4px;color:var(--muted);padding:0.45rem 1rem;font-family:'Rajdhani',sans-serif;font-size:0.72rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;margin-top:0.25rem;transition:all 0.2s}
.add-link:hover{border-color:var(--violet);color:var(--violet)}
.facts{display:flex;gap:0.7rem;margin-top:2rem}
.fsave{flex:1;padding:0.8rem;border:none;border-radius:4px;background:linear-gradient(135deg,var(--violet),var(--cyan2));color:#fff;font-family:'Rajdhani',sans-serif;font-size:0.85rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;transition:all 0.25s;box-shadow:0 4px 20px rgba(123,47,255,0.4)}
.fsave:hover{box-shadow:0 6px 30px rgba(123,47,255,0.6)}
.fcancel{padding:0.8rem 1.5rem;background:none;border:1px solid var(--border);border-radius:4px;color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:0.85rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;transition:all 0.2s}
.fcancel:hover{border-color:var(--text);color:var(--text)}
.btn-primary-dash{display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.8rem;border:none;border-radius:4px;background:linear-gradient(135deg,var(--violet),var(--cyan2));color:#fff;font-family:'Rajdhani',sans-serif;font-size:0.82rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;box-shadow:0 4px 20px rgba(123,47,255,0.4);transition:all 0.25s;margin-top:0.5rem}
.btn-primary-dash:hover{box-shadow:0 6px 30px rgba(123,47,255,0.6);transform:translateY(-1px)}

/* Socials editor */
.socials-editor{display:flex;flex-direction:column;gap:0.5rem}
.social-row{display:grid;grid-template-columns:32px 130px 1fr 30px;gap:0.4rem;align-items:center}
.social-row-icon{font-size:1rem;text-align:center;opacity:0.6}
.social-row-label{padding:0.55rem 0.65rem;font-size:0.82rem}
.social-row-url{padding:0.55rem 0.65rem;font-size:0.82rem}
.social-row-del{padding:0;background:none;border:1px solid rgba(255,45,122,0.25);border-radius:4px;color:var(--magenta);cursor:pointer;font-size:0.8rem;height:100%;transition:all 0.2s;display:flex;align-items:center;justify-content:center}
.social-row-del:hover{background:rgba(255,45,122,0.08)}

/* Author photo editor */
.author-photo-editor{display:grid;grid-template-columns:160px 1fr;gap:1.5rem;align-items:start;margin-top:0.2rem}
.author-photo-preview{position:relative;width:160px;aspect-ratio:3/4;border-radius:6px;overflow:hidden;background:linear-gradient(140deg,#1a1128,#0d0d1a);border:1px solid var(--border);flex-shrink:0}
.author-photo-img{width:100%;height:100%;object-fit:cover;display:block}
.author-photo-ph{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.6rem;padding:1rem}
.author-photo-ph span{font-family:'Rajdhani',sans-serif;font-size:0.7rem;color:var(--muted);letter-spacing:0.08em;text-align:center}
.author-photo-remove{position:absolute;top:0.4rem;right:0.4rem;width:24px;height:24px;border-radius:50%;background:rgba(255,45,122,0.85);border:none;color:#fff;font-size:0.65rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s}
.author-photo-remove:hover{background:var(--magenta)}
.author-photo-controls{display:flex;flex-direction:column;justify-content:flex-start}
@media(max-width:600px){.author-photo-editor{grid-template-columns:1fr}.author-photo-preview{width:100%;aspect-ratio:3/2}}

/* Security tab */
.security-card{background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:2rem;max-width:500px}
.security-card h3{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:0.06em;color:var(--text);margin-bottom:0.4rem}
.security-card .sec-desc{font-family:'Rajdhani',sans-serif;font-size:0.82rem;color:var(--muted);letter-spacing:0.04em;margin-bottom:1.8rem;line-height:1.6}
.pw-rules{margin:0.6rem 0 1.2rem;padding:0.9rem 1rem;border-radius:4px;background:rgba(123,47,255,0.06);border:1px solid rgba(123,47,255,0.15)}
.pw-rules p{font-family:'Rajdhani',sans-serif;font-size:0.72rem;color:var(--muted);letter-spacing:0.04em;line-height:1.7}
.pw-rules p span{color:var(--cyan)}
.pw-match{font-family:'Rajdhani',sans-serif;font-size:0.75rem;margin-top:0.4rem;letter-spacing:0.06em}
.pw-match.ok{color:#22c55e}
.pw-match.no{color:var(--magenta)}
.pw-success{
  display:flex;align-items:center;gap:0.7rem;
  padding:0.9rem 1.1rem;border-radius:6px;margin-top:1rem;
  background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);
  font-family:'Rajdhani',sans-serif;font-size:0.88rem;font-weight:600;
  color:#22c55e;letter-spacing:0.06em;animation:fadeIn 0.3s ease;
}
.pw-strength{display:flex;gap:3px;margin-top:0.5rem}
.pw-strength-bar{height:3px;flex:1;border-radius:2px;background:rgba(255,255,255,0.08);transition:background 0.3s}
.pw-strength-bar.w{background:var(--magenta)}
.pw-strength-bar.m{background:var(--gold)}
.pw-strength-bar.s{background:#22c55e}

/* Responsive */
@media(max-width:900px){
  .nav{padding:0 1.5rem}
  .hero{grid-template-columns:1fr}
  .hero-left{padding:5rem 1.5rem 3rem}
  .hero-right{display:none}
  .section{padding:4.5rem 1.5rem}
  .about-grid{grid-template-columns:1fr;gap:3rem}
  .scards{grid-template-columns:1fr 1fr}
  .dash-body{padding:1.5rem}
  .dash-nav{padding:1rem 1.5rem}
  .fr2{grid-template-columns:1fr}
  .modal-hero-inner{gap:1rem;padding:1.2rem}
  .modal-thumb{width:80px}
  .modal-title{font-size:1.4rem}
  footer{padding:2rem 1.5rem;flex-direction:column;text-align:center}
  .contact-section{padding:5rem 1.5rem}
  .hero-scroll{left:1.5rem}
}
`;

/* ─────────────────────────────────────────────
   PARTICLE SYSTEM
───────────────────────────────────────────── */
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const particles = [];
    const COLORS = ["#00d4ff", "#7b2fff", "#ff2d7a", "#ffb800"];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
        r: Math.random() * 1.4 + 0.3,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.6 + 0.1,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill(); ctx.globalAlpha = 1;
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = particles[i].color; ctx.globalAlpha = (1 - dist / 120) * 0.12;
            ctx.lineWidth = 0.5; ctx.stroke(); ctx.globalAlpha = 1;
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas id="particles" ref={canvasRef} />;
}

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
export default function App() {
  const [books, setBooks] = useState(DEFAULT_BOOKS);
  const [author, setAuthor] = useState(DEFAULT_AUTHOR);
  const [visitors, setVisitors] = useState(0);
  const [clicks, setClicks] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [adminState, setAdminState] = useState(null);
  const [adminTab, setAdminTab] = useState("analytics");
  const [passInput, setPassInput] = useState("");
  const [passErr, setPassErr] = useState("");
  const [editingBook, setEditingBook] = useState(null);

  // ── Load all data from Supabase ──
  useEffect(() => {
    (async () => {
      try {
        // Books
        const { data: bData } = await sb.from("books").select("*").order("sort_order");
        if (bData?.length) {
          setBooks(bData.map(b => ({
            id: b.id, title: b.title, genre: b.genre, synopsis: b.synopsis,
            coverUrl: b.cover_url, links: b.links || [],
          })));
        }
        // Author
        const { data: aData } = await sb.from("author").select("*").eq("id", "main").single();
        if (aData) {
          setAuthor({ name: aData.name, tagline: aData.tagline, bio1: aData.bio1,
            bio2: aData.bio2, photoUrl: aData.photo_url, email: aData.email,
            socials: aData.socials || [] });
        }
        // Clicks
        const { data: cData } = await sb.from("clicks").select("*");
        if (cData) {
          const cm = {}; cData.forEach(c => { cm[c.book_id] = c.count; });
          setClicks(cm);
        }
        // Visitors — increment
        const { data: vData } = await sb.from("settings").select("value").eq("key", "visitors").single();
        const v = parseInt(vData?.value || "0") + 1;
        setVisitors(v);
        await sb.from("settings").upsert(
          { key: "visitors", value: String(v), updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
      } catch (e) { console.error("Load error", e); }
      setLoading(false);
    })();
  }, []);

  const openBook = async (book) => {
    setSelectedBook(book);
    const newCount = (clicks[book.id] || 0) + 1;
    setClicks(p => ({ ...p, [book.id]: newCount }));
    await sb.from("clicks").upsert(
      { book_id: book.id, count: newCount, updated_at: new Date().toISOString() },
      { onConflict: "book_id" }
    );
  };

  const handleLogin = async () => {
    const pwd = await getAdminPassword();
    if (passInput.trim() === pwd) {
      setAdminState("dash"); setPassErr(""); setPassInput("");
    } else {
      setPassErr("Incorrect password. Please try again.");
    }
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const totalClicks = Object.values(clicks).reduce((a, b) => a + b, 0);
  const sortedBooks = [...books].sort((a, b) => (clicks[b.id] || 0) - (clicks[a.id] || 0));
  const maxClicks = Math.max(...books.map(b => clicks[b.id] || 0), 1);
  const topBook = sortedBooks[0];

  const saveBook = async (data) => {
    if (editingBook === "new") {
      const newId = "b" + Date.now();
      const row = {
        id: newId, title: data.title, genre: data.genre, synopsis: data.synopsis,
        cover_url: data.coverUrl || "", links: data.links || [],
        sort_order: books.length + 1,
      };
      const { error } = await sb.from("books").insert(row);
      if (!error) setBooks(p => [...p, { ...data, id: newId }]);
    } else {
      const row = {
        title: data.title, genre: data.genre, synopsis: data.synopsis,
        cover_url: data.coverUrl || "", links: data.links || [],
      };
      const { error } = await sb.from("books").update(row).eq("id", data.id);
      if (!error) setBooks(p => p.map(b => b.id === data.id ? data : b));
    }
    setEditingBook(null);
  };

  const delBook = async (id) => {
    if (window.confirm("Remove this book from your portfolio?")) {
      await sb.from("books").delete().eq("id", id);
      setBooks(p => p.filter(b => b.id !== id));
    }
  };

  const saveAuthor = async (data) => {
    await sb.from("author").upsert({
      id: "main", name: data.name, tagline: data.tagline, bio1: data.bio1,
      bio2: data.bio2, photo_url: data.photoUrl, email: data.email,
      socials: data.socials, updated_at: new Date().toISOString(),
    });
    setAuthor(data);
  };

  if (loading) return (
    <>
      <style>{CSS}</style>
      <Particles />
      <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", zIndex: 10 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "2rem", letterSpacing: "0.08em", background: "linear-gradient(135deg,#00d4ff,#7b2fff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Rex Magnus</div>
        <div style={{ width: "120px", height: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "1px", overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg,#7b2fff,#00d4ff)", borderRadius: "1px", animation: "loadBar 1.2s ease infinite" }} />
        </div>
      </div>
      <style>{`@keyframes loadBar{0%{width:0;margin-left:0}50%{width:100%;margin-left:0}100%{width:0;margin-left:100%}}`}</style>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <Particles />

      {/* NAV */}
      <nav className="nav">
        <span className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Rex Magnus</span>
        <div className="nav-links">
          {[["Books","books"],["About","about"],["Contact","contact"]].map(([lbl,id]) => (
            <a key={id} href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id); }}>{lbl}</a>
          ))}
          <a href="/community" onClick={e => { e.preventDefault(); goTo('/community'); }}
            style={{ color: "var(--cyan)", borderBottom: "1px solid rgba(0,212,255,0.3)", paddingBottom: "2px" }}>
            Community ✦
          </a>
          <button className="nav-admin" onClick={() => { setAdminState("login"); setPassErr(""); setPassInput(""); }}>⚙ Admin</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-bg" /><div className="hero-scan" />
        <div className="hero-left">
          <div className="hero-platform-tag"><span className="ptag-dot" /><span>Urban Fantasy · Male Lead Fiction</span></div>
          <h1 className="hero-name">
            <span className="nm-first">Rex</span>
            <span className="nm-last">Magnus</span>
          </h1>
          <div className="hero-platform-line">
            <span className="pl-rule" />
            <p>Exclusive Author at</p>
            <span className="pl-badge">Newreading</span>
            <span style={{ color: "var(--muted)", fontSize: "0.7rem" }}>&amp;</span>
            <span className="pl-badge">Meganovel</span>
          </div>
          <p className="hero-tagline">
            Street-level warriors. Supernatural odds. Heroes who crawl out of the gutter,
            rise through the ashes, and drag revenge back with them — one city block at a time.
          </p>
          <div className="hero-btns">
            <a className="btn-glow" href="#books" onClick={e => { e.preventDefault(); scrollTo("books"); }}><span>Explore Books</span> <span>→</span></a>
            <a className="btn-outline" href="#about" onClick={e => { e.preventDefault(); scrollTo("about"); }}>About the Author</a>
          </div>
          <div className="hero-stats">
            <div className="hstat"><span className="hstat-n">{books.length}</span><span className="hstat-l">Published</span></div>
            <div className="hstat"><span className="hstat-n">{visitors.toLocaleString()}</span><span className="hstat-l">Visitors</span></div>
            <div className="hstat"><span className="hstat-n">{totalClicks}</span><span className="hstat-l">Book Views</span></div>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-right-bg" /><div className="hero-right-grid" />
          <div className="hero-book-3d">
            <div className="hero-book-cover">
              {books[0]?.coverUrl
                ? <img src={books[0].coverUrl} alt={books[0].title} />
                : <><span className="hbc-icon">📖</span><span className="hbc-title">{books[0]?.title || "Iron & Shadow"}</span><span className="hbc-genre">{books[0]?.genre || "Urban Fantasy"}</span></>}
            </div>
          </div>
          {books.length > 0 && <div className="hero-float-chip hfc1">Latest Release</div>}
          {books.length > 1 && <div className="hero-float-chip hfc2">{books.length} Books Available</div>}
        </div>
        <div className="hero-scroll"><span>Scroll</span><div className="scroll-line" /></div>
      </section>

      {/* BOOKS */}
      <section className="books-section section" id="books">
        <div className="sec-eyebrow"><span className="sec-eyebrow-line" /><span>The Collection</span></div>
        <h2 className="sec-title"><span className="grad">Stories Built </span><span className="col">With Passion</span></h2>
        <p className="sec-sub">Men who fell hard, burned everything, and clawed their way back. Urban streets. Supernatural stakes. Every book is a face-smack wake-up call wrapped in a revenge arc you won't see coming.</p>
        <div className="books-grid">
          {books.map((book, i) => (
            <div key={book.id} className="book-card" tabIndex={0} role="button"
              onClick={() => openBook(book)} onKeyDown={e => e.key === "Enter" && openBook(book)}>
              <div className="book-cover">
                {book.coverUrl ? <img src={book.coverUrl} alt={book.title} />
                  : <div className="book-ph">
                      <span className="book-ph-num">0{i + 1}</span>
                      <span className="book-ph-title">{book.title}</span>
                      <span className="book-ph-genre">{book.genre}</span>
                    </div>}
                <div className="book-overlay">
                  <p className="book-overlay-text">{book.synopsis}</p>
                  <div className="book-overlay-cta">View Details →</div>
                </div>
                <span className="book-genre-chip">{book.genre}</span>
              </div>
              <div className="book-info">
                <p className="book-title">{book.title}</p>
                <p className="book-short">{book.synopsis}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section section" id="about">
        <div className="about-grid">
          <div className="about-img-wrap">
            <div className="about-img">
              {author.photoUrl ? <img src={author.photoUrl} alt={author.name} />
                : <div className="about-img-ph">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#7b2fff" strokeWidth="1">
                      <circle cx="40" cy="28" r="18"/><path d="M8 72c0-17.673 14.327-32 32-32s32 14.327 32 32"/>
                    </svg>
                    <span>Author photo</span>
                  </div>}
            </div>
            <div className="about-corner"><span className="about-corner-n">{books.length}</span><span className="about-corner-l">Books</span></div>
          </div>
          <div>
            <div className="sec-eyebrow"><span className="sec-eyebrow-line" /><span>About the Author</span></div>
            <h2 className="sec-title" style={{ marginBottom: "1.5rem" }}>
              <span className="grad">{author.name.split(" ")[0]} </span>
              <span className="col">{author.name.split(" ").slice(1).join(" ")}</span>
            </h2>
            <p className="about-text-p">{author.bio1}</p>
            <p className="about-text-p">{author.bio2}</p>
            <div className="about-socials">
              {(author.socials || []).filter(s => s.label).map((s, i) => (
                <a key={i} href={s.url || "#"} target={s.url ? "_blank" : undefined}
                  rel="noopener noreferrer" className="social-btn"
                  style={!s.url ? { opacity: 0.4, cursor: "default", pointerEvents: "none" } : {}}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact-section" id="contact">
        <div className="contact-inner">
          <div className="sec-eyebrow" style={{ justifyContent: "center" }}><span className="sec-eyebrow-line" /><span>Get In Touch</span></div>
          <h2 className="contact-glitch">Let's Connect</h2>
          <p className="contact-p">For speaking engagements, media inquiries, collaboration, or just to tell me what you thought of the books — reach out.</p>
          <a className="contact-link" href={`mailto:${author.email}`}>✉ {author.email}</a>
        </div>
      </section>

      {/* COMMUNITY CTA */}
      <section style={{
        background: "var(--dark)", padding: "5rem 4rem", textAlign: "center",
        position: "relative", overflow: "hidden", borderTop: "1px solid var(--border)"
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 50% 50%,rgba(0,212,255,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: "580px", margin: "0 auto" }}>
          <div className="sec-eyebrow" style={{ justifyContent: "center" }}><span className="sec-eyebrow-line" /><span>Join the Conversation</span></div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(2rem,4vw,3.5rem)", letterSpacing: "0.05em", color: "#fff", margin: "0.5rem 0 1rem", lineHeight: 1 }}>
            Reader <span style={{ background: "linear-gradient(135deg,var(--cyan),var(--violet))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Community</span>
          </h2>
          <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1rem", color: "var(--muted)", lineHeight: 1.7, marginBottom: "2rem", letterSpacing: "0.03em" }}>
            Chat with other readers, share theories, drop fan art, and connect with people who get it. The community is live — come in.
          </p>
          <a href="/community"
            onClick={e => { e.preventDefault(); goTo("/community"); }}
            className="btn-glow" style={{ textDecoration: "none" }}>
            <span>Enter Community</span> <span>→</span>
          </a>
        </div>
      </section>

      <footer>
        <p>© {new Date().getFullYear()} Rex Magnus · All rights reserved</p>
        <p>Built for readers who demand more from their fiction</p>
      </footer>

      {/* BOOK MODAL */}
      {selectedBook && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setSelectedBook(null)}>
          <div className="modal">
            <button className="modal-x" onClick={() => setSelectedBook(null)}>✕</button>
            <div className="modal-hero">
              <div className="modal-hero-grid" /><div className="modal-hero-glow" />
              <div className="modal-hero-inner">
                <div className="modal-thumb">
                  {selectedBook.coverUrl ? <img src={selectedBook.coverUrl} alt={selectedBook.title} />
                    : <div className="modal-thumb-ph"><span>{selectedBook.title}</span></div>}
                </div>
                <div className="modal-head-text">
                  <p className="modal-genre-tag">{selectedBook.genre}</p>
                  <h2 className="modal-title">{selectedBook.title}</h2>
                </div>
              </div>
            </div>
            <div className="modal-body">
              <p className="modal-synopsis">{selectedBook.synopsis}</p>
              {selectedBook.links?.length > 0 && (
                <><p className="modal-links-label">Where to Read</p>
                <div className="modal-links">
                  {selectedBook.links.map((l, i) => (
                    <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                      className={`mlink ${i === 0 ? "mlink-p" : "mlink-s"}`}>
                      {l.label}{i === 0 ? " →" : ""}
                    </a>
                  ))}
                </div></>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN LOGIN */}
      {adminState === "login" && (
        <div className="admin-overlay">
          <div className="login-box">
            <div className="login-icon">🔐</div>
            <h2>Admin Access</h2>
            <p className="login-sub">Enter your password to manage your portfolio.</p>
            <div className="ff">
              <label>Password</label>
              <input type="password" value={passInput} onChange={e => setPassInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter password..." autoFocus />
              {passErr && <p className="login-err">⚠ {passErr}</p>}
            </div>
            <button className="btn-login" onClick={handleLogin}>Access Dashboard</button>
            <button className="btn-cancel" onClick={() => { setAdminState(null); setPassInput(""); setPassErr(""); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ADMIN DASHBOARD */}
      {adminState === "dash" && (
        <div className="dash">
          <div className="dash-nav">
            <div className="dash-brand">
              <div className="dash-ico">📊</div>
              <div><h1>Dashboard</h1><p>Managing Rex Magnus's portfolio</p></div>
            </div>
            <div className="dash-acts">
              <button className="da da-outline" onClick={() => setEditingBook("new")}>+ Add Book</button>
              <button className="da da-glow" onClick={() => setAdminState(null)}>← View Site</button>
              <button className="da da-outline" onClick={() => { setAdminState(null); setPassInput(""); }}>Log Out</button>
            </div>
          </div>
          <div className="dash-body">
            <div className="dash-hi"><h2>Welcome Back 👾</h2><p>Here's how your portfolio is performing.</p></div>
            <div className="scards">
              <div className="scard"><div className="scard-ico">👁</div><span className="scard-n">{visitors.toLocaleString()}</span><span className="scard-l">Total Visitors</span></div>
              <div className="scard"><div className="scard-ico">📖</div><span className="scard-n">{totalClicks}</span><span className="scard-l">Total Book Views</span></div>
              <div className="scard"><div className="scard-ico">📚</div><span className="scard-n">{books.length}</span><span className="scard-l">Books Listed</span></div>
              <div className="scard">
                <div className="scard-ico">🔥</div>
                <span className="scard-n" style={{ fontSize: "0.95rem", paddingTop: "0.3rem" }}>
                  {topBook && (clicks[topBook.id] || 0) > 0 ? topBook.title.split(" ").slice(0, 3).join(" ") : "None yet"}
                </span>
                <span className="scard-l">Most Clicked</span>
              </div>
            </div>
            <div className="tabs">
              {[["analytics","📈 Analytics"],["books","📚 Manage Books"],["author","✍ Author Info"],["security","🔑 Security"]].map(([k,l]) => (
                <button key={k} className={`tab ${adminTab === k ? "on" : ""}`} onClick={() => setAdminTab(k)}>{l}</button>
              ))}
            </div>
            {adminTab === "analytics" && (
              <div className="acard">
                <div className="acard-head"><h3>Book Click Analytics</h3><p>Ranked by most to least clicked</p></div>
                <table>
                  <thead><tr><th>#</th><th>Title</th><th>Genre</th><th>Clicks</th><th>Popularity</th><th>Status</th></tr></thead>
                  <tbody>
                    {sortedBooks.map((book, i) => {
                      const c = clicks[book.id] || 0;
                      return (
                        <tr key={book.id}>
                          <td style={{ color: "var(--muted)" }}>{i + 1}</td>
                          <td style={{ fontWeight: 600 }}>{book.title}</td>
                          <td style={{ color: "var(--muted)" }}>{book.genre}</td>
                          <td className="td-clicks">{c}</td>
                          <td><div className="bar-row"><div className="bar-t"><div className="bar-f" style={{ width: `${Math.max((c / maxClicks) * 100, 2)}%` }} /></div><span style={{ fontSize: "0.72rem", color: "var(--muted)", minWidth: "30px" }}>{Math.round((c / maxClicks) * 100)}%</span></div></td>
                          <td>{i === 0 && c > 0 ? <span className="top-chip">🔥 TOP</span> : <span style={{ color: "var(--muted)" }}>—</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {adminTab === "books" && (
              <div className="mgrid">
                {books.map(book => (
                  <div key={book.id} className="mcard">
                    <div className="mcard-img">
                      {book.coverUrl ? <img src={book.coverUrl} alt={book.title} /> : <div className="mcard-ph"><span>{book.title}</span></div>}
                      <span className="mcard-clk">{clicks[book.id] || 0} clicks</span>
                    </div>
                    <div className="mcard-body">
                      <p className="mcard-title">{book.title}</p>
                      <p className="mcard-genre">{book.genre}</p>
                      <div className="mcard-acts">
                        <button className="medit" onClick={() => setEditingBook(book)}>Edit</button>
                        <button className="mdel" onClick={() => delBook(book.id)}>🗑</button>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="add-card" onClick={() => setEditingBook("new")}>
                  <div className="add-icon">+</div><span>Add New Book</span>
                </button>
              </div>
            )}
            {adminTab === "author" && (
              <div className="author-card">
                <h3>Edit Author Information</h3>
                <AuthorForm author={author} onSave={saveAuthor} />
              </div>
            )}
            {adminTab === "security" && (
              <PasswordForm onPasswordChanged={() => setAdminTab("analytics")} />
            )}
          </div>
        </div>
      )}

      {editingBook && (
        <BookForm book={editingBook === "new" ? null : editingBook} onSave={saveBook} onCancel={() => setEditingBook(null)} />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   BOOK FORM (with image upload)
───────────────────────────────────────────── */
function BookForm({ book, onSave, onCancel }) {
  const [f, setF] = useState(book || { title: "", genre: "Urban Fantasy", synopsis: "", coverUrl: "", links: [{ label: "", url: "" }] });
  const [imgTab, setImgTab] = useState("url");
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  const sl = (i, k, v) => s("links", f.links.map((l, j) => j === i ? { ...l, [k]: v } : l));
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => s("coverUrl", ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div className="bform-bg">
      <div className="bform-box">
        <h3>{book ? "Edit Book" : "Add New Book"}</h3>
        <div className="ff"><label>Title</label><input value={f.title} onChange={e => s("title", e.target.value)} placeholder="Book title..." /></div>
        <div className="ff"><label>Genre</label><input value={f.genre} onChange={e => s("genre", e.target.value)} placeholder="e.g. Urban Fantasy..." /></div>
        <div className="ff"><label>Synopsis</label><textarea value={f.synopsis} onChange={e => s("synopsis", e.target.value)} placeholder="Full book description..." /></div>
        <div className="ff">
          <label>Cover Image</label>
          <div className="img-upload-wrap">
            <div className="img-upload-tabs">
              <button type="button" className={`img-upload-tab ${imgTab === "url" ? "on" : ""}`} onClick={() => setImgTab("url")}>🔗 Paste URL</button>
              <button type="button" className={`img-upload-tab ${imgTab === "upload" ? "on" : ""}`} onClick={() => setImgTab("upload")}>📁 Upload File</button>
            </div>
            {imgTab === "url" && <input value={f.coverUrl.startsWith("data:") ? "" : f.coverUrl} onChange={e => s("coverUrl", e.target.value)} placeholder="https://example.com/cover.jpg" />}
            {imgTab === "upload" && (
              <label className="file-input-label">
                <span>📂</span><span>Choose Image File</span>
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
            {f.coverUrl ? <img src={f.coverUrl} alt="Cover preview" className="img-preview" /> : <div className="img-preview-ph"><span>🖼</span><span>No image selected</span></div>}
          </div>
        </div>
        <div className="ff">
          <label>Read / Buy Links</label>
          {f.links.map((link, i) => (
            <div key={i} className="lrow">
              <input value={link.label} onChange={e => sl(i, "label", e.target.value)} placeholder="Label (e.g. Amazon)" />
              <input value={link.url} onChange={e => sl(i, "url", e.target.value)} placeholder="https://..." />
              <button className="lrow-del" onClick={() => s("links", f.links.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
          <button className="add-link" onClick={() => s("links", [...f.links, { label: "", url: "" }])}>+ Add Link</button>
        </div>
        <div className="facts">
          <button className="fsave" onClick={() => f.title && onSave(f)}>Save Book</button>
          <button className="fcancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PASSWORD FORM
───────────────────────────────────────────── */
function PasswordForm({ onPasswordChanged }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);

  const strength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0-4
  };
  const s = strength(next);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][s] || "";
  const strengthClass = s <= 1 ? "w" : s <= 2 ? "m" : "s";

  const matches = next && confirm && next === confirm;
  const doesntMatch = next && confirm && next !== confirm;

  const handleSave = async () => {
    setErr("");
    const pwd = await getAdminPassword();
    if (current !== pwd) { setErr("Current password is incorrect."); return; }
    if (next.length < 6) { setErr("New password must be at least 6 characters."); return; }
    if (next !== confirm) { setErr("Passwords do not match."); return; }
    await sb.from("settings").upsert(
      { key: "admin_password", value: next, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
    setSuccess(true);
    setCurrent(""); setNext(""); setConfirm("");
    setTimeout(() => { setSuccess(false); onPasswordChanged(); }, 2500);
  };

  return (
    <div className="security-card">
      <h3>🔑 Change Password</h3>
      <p className="sec-desc">Update your admin password. You'll need your current password to make changes. Pick something strong — you're the only one who should be getting in here.</p>

      <div className="ff">
        <label>Current Password</label>
        <input type="password" value={current} onChange={e => { setCurrent(e.target.value); setErr(""); }} placeholder="Your current password..." />
      </div>

      <div className="ff">
        <label>New Password</label>
        <input type="password" value={next} onChange={e => { setNext(e.target.value); setErr(""); }} placeholder="Choose a new password..." />
        {next && (
          <>
            <div className="pw-strength">
              {[1,2,3,4].map(i => <div key={i} className={`pw-strength-bar ${i <= s ? strengthClass : ""}`} />)}
            </div>
            <p className="pw-match" style={{ color: s <= 1 ? "var(--magenta)" : s <= 2 ? "var(--gold)" : "#22c55e" }}>
              {strengthLabel}
            </p>
          </>
        )}
        <div className="pw-rules">
          <p><span>Tips:</span> Use 8+ characters, a mix of uppercase, numbers, and symbols for a strong password.</p>
        </div>
      </div>

      <div className="ff">
        <label>Confirm New Password</label>
        <input type="password" value={confirm} onChange={e => { setConfirm(e.target.value); setErr(""); }} placeholder="Repeat new password..." />
        {matches && <p className="pw-match ok">✓ Passwords match</p>}
        {doesntMatch && <p className="pw-match no">✗ Passwords don't match</p>}
      </div>

      {err && <p className="login-err" style={{ marginBottom: "0.8rem" }}>⚠ {err}</p>}
      {success && <div className="pw-success">✓ Password updated successfully! Redirecting...</div>}

      <button className="btn-primary-dash" onClick={handleSave} disabled={success}
        style={{ opacity: success ? 0.5 : 1, cursor: success ? "default" : "pointer" }}>
        Update Password
      </button>
    </div>
  );
}
function AuthorForm({ author, onSave }) {
  const [f, setF] = useState(author);
  const [photoTab, setPhotoTab] = useState("url");
  const [saved, setSaved] = useState(false);
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const handlePhotoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => s("photoUrl", ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave(f);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="fr2">
        <div className="ff"><label>Full Name</label><input value={f.name} onChange={e => s("name", e.target.value)} /></div>
        <div className="ff"><label>Tagline</label><input value={f.tagline} onChange={e => s("tagline", e.target.value)} /></div>
      </div>
      <div className="ff"><label>Email Address</label><input value={f.email} onChange={e => s("email", e.target.value)} /></div>
      <div className="ff"><label>Bio — Paragraph 1</label><textarea value={f.bio1} onChange={e => s("bio1", e.target.value)} /></div>
      <div className="ff"><label>Bio — Paragraph 2</label><textarea value={f.bio2} onChange={e => s("bio2", e.target.value)} /></div>

      {/* ── Author Photo ── */}
      <div className="ff">
        <label>Author Photo</label>
        <div className="author-photo-editor">
          {/* Preview */}
          <div className="author-photo-preview">
            {f.photoUrl
              ? <img src={f.photoUrl} alt="Author preview" className="author-photo-img" />
              : <div className="author-photo-ph">
                  <svg width="48" height="48" viewBox="0 0 80 80" fill="none" stroke="#7b2fff" strokeWidth="1.5">
                    <circle cx="40" cy="28" r="18"/><path d="M8 72c0-17.673 14.327-32 32-32s32 14.327 32 32"/>
                  </svg>
                  <span>No photo yet</span>
                </div>}
            {f.photoUrl && (
              <button className="author-photo-remove" onClick={() => s("photoUrl", "")} title="Remove photo">✕</button>
            )}
          </div>

          {/* Upload tabs */}
          <div className="author-photo-controls">
            <div className="img-upload-tabs" style={{ marginBottom: "0.6rem" }}>
              <button type="button" className={`img-upload-tab ${photoTab === "url" ? "on" : ""}`} onClick={() => setPhotoTab("url")}>🔗 Paste URL</button>
              <button type="button" className={`img-upload-tab ${photoTab === "upload" ? "on" : ""}`} onClick={() => setPhotoTab("upload")}>📁 Upload File</button>
            </div>
            {photoTab === "url" && (
              <input
                value={f.photoUrl?.startsWith("data:") ? "" : (f.photoUrl || "")}
                onChange={e => s("photoUrl", e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            )}
            {photoTab === "upload" && (
              <label className="file-input-label">
                <span>📂</span>
                <span>{f.photoUrl ? "Change Photo" : "Choose Photo"}</span>
                <input type="file" accept="image/*" onChange={handlePhotoFile} />
              </label>
            )}
            <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "0.72rem", color: "var(--muted)", marginTop: "0.5rem", letterSpacing: "0.04em" }}>
              Recommended: square or portrait image, at least 400×500px
            </p>
          </div>
        </div>
      </div>

      {/* ── Social Links ── */}
      <div className="ff">
        <label>Social Media Links</label>
        <p style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"0.75rem", color:"var(--muted)", marginBottom:"0.8rem", letterSpacing:"0.04em", lineHeight:1.6 }}>
          Add your profile URLs. Leave blank to hide a button on the portfolio.
        </p>
        <div className="socials-editor">
          {(f.socials || []).map((soc, i) => (
            <div key={i} className="social-row">
              <div className="social-row-icon">{["𝕏","📸","📚","✉"][i] || "🔗"}</div>
              <input
                className="social-row-label"
                value={soc.label}
                onChange={e => {
                  const updated = [...f.socials];
                  updated[i] = { ...updated[i], label: e.target.value };
                  s("socials", updated);
                }}
                placeholder="Label"
              />
              <input
                className="social-row-url"
                value={soc.url}
                onChange={e => {
                  const updated = [...f.socials];
                  updated[i] = { ...updated[i], url: e.target.value };
                  s("socials", updated);
                }}
                placeholder="https://..."
              />
              <button className="social-row-del" onClick={() => s("socials", f.socials.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
          <button className="add-link" style={{ marginTop:"0.5rem" }}
            onClick={() => s("socials", [...(f.socials || []), { label: "", url: "" }])}>
            + Add Social Link
          </button>
        </div>
      </div>

      {saved && <div className="pw-success" style={{ marginBottom: "0.8rem" }}>✓ Author info saved successfully!</div>}
      <button className="btn-primary-dash" onClick={handleSave}>Save Changes ✓</button>
    </div>
  );
}
