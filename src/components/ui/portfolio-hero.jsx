import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

function BlurText({ text, delay = 100, animateBy = 'letters', direction = 'top', className = '' }) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const segments = useMemo(
    () => (animateBy === 'words' ? text.split(' ') : text.split('')),
    [text, animateBy]
  );

  return (
    <p ref={ref} className={className}>
      {segments.map((segment, index) => (
        <span
          key={`${segment}-${index}`}
          style={{
            display: 'inline-block',
            filter: inView ? 'blur(0px)' : 'blur(10px)',
            opacity: inView ? 1 : 0,
            transform: inView
              ? 'translateY(0)'
              : `translateY(${direction === 'top' ? '-18px' : '18px'})`,
            transition: `all .55s cubic-bezier(.22,1,.36,1) ${index * delay}ms`,
          }}
        >
          {segment}
          {animateBy === 'words' && index < segments.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </p>
  );
}

const splashStyles = `
  .it-splash {
    --it-green: #9fb300;
    --it-green-soft: rgba(159,179,0,.55);
    --it-ink: #111;
    --it-muted: rgba(17,17,17,.56);
    position: relative;
    isolation: isolate;
    min-height: 100svh;
    width: 100%;
    overflow: hidden;
    display: grid;
    place-items: center;
    background:
      radial-gradient(circle at 50% 45%, rgba(159,179,0,.10), transparent 28%),
      radial-gradient(circle at 82% 15%, rgba(159,179,0,.07), transparent 22%),
      #f4f4ef;
    color: var(--it-ink);
    cursor: pointer;
    outline: none;
  }

  .it-splash::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -4;
    opacity: .62;
    background-image:
      linear-gradient(rgba(17,17,17,.055) 1px, transparent 1px),
      linear-gradient(90deg, rgba(17,17,17,.055) 1px, transparent 1px);
    background-size: 56px 56px;
    transform: perspective(620px) rotateX(58deg) scale(1.8) translateY(17%);
    transform-origin: center bottom;
    animation: it-grid-drift 14s linear infinite;
  }

  .it-splash::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 8;
    pointer-events: none;
    opacity: .12;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent 3px,
      rgba(17,17,17,.18) 4px
    );
    mix-blend-mode: multiply;
  }

  .it-splash-shell {
    position: relative;
    width: min(1180px, 92vw);
    min-height: 82svh;
    display: grid;
    place-items: center;
  }

  .it-splash-topline,
  .it-splash-status,
  .it-splash-meta,
  .it-splash-index {
    position: absolute;
    z-index: 7;
    font-family: "Courier New", monospace;
    text-transform: uppercase;
    letter-spacing: .16em;
    font-size: 10px;
    line-height: 1.5;
  }

  .it-splash-topline {
    top: 3%;
    left: 0;
    color: var(--it-muted);
  }

  .it-splash-topline strong {
    color: var(--it-green);
    font-weight: 700;
  }

  .it-splash-status {
    top: 3%;
    right: 0;
    display: flex;
    gap: 8px;
    align-items: center;
    color: var(--it-muted);
  }

  .it-splash-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--it-green);
    box-shadow: 0 0 15px var(--it-green-soft);
    animation: it-pulse 1.8s ease-in-out infinite;
  }

  .it-splash-center {
    position: relative;
    z-index: 5;
    width: min(760px, 88vw);
    text-align: center;
  }

  .it-splash-kicker {
    margin: 0 0 18px;
    font: 700 clamp(9px, 1vw, 12px)/1.4 "Courier New", monospace;
    letter-spacing: .24em;
    color: var(--it-green);
    text-transform: uppercase;
  }

  .it-splash-title {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    font-size: clamp(52px, 10vw, 148px);
    line-height: .79;
    letter-spacing: -.075em;
    font-weight: 800;
    text-transform: uppercase;
    position: relative;
  }

  .it-splash-title-line {
    display: block;
  }

  .it-splash-title-line.outline {
    color: transparent;
    -webkit-text-stroke: clamp(1px, .11vw, 2px) currentColor;
    opacity: .88;
  }

  .it-splash-title-accent {
    color: var(--it-green);
    display: inline-block;
    animation: it-title-flicker 5s ease-in-out infinite;
  }

  .it-splash-role {
    margin: 26px auto 0;
    max-width: 620px;
    font: 600 clamp(10px, 1.25vw, 14px)/1.6 "Courier New", monospace;
    letter-spacing: .13em;
    text-transform: uppercase;
  }

  .it-splash-role span {
    color: var(--it-green);
  }

  .it-splash-photo {
    position: absolute;
    z-index: -1;
    left: 50%;
    top: 49%;
    width: clamp(160px, 20vw, 260px);
    aspect-ratio: 1;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    overflow: hidden;
    opacity: .16;
    filter: grayscale(1) contrast(1.25);
    mix-blend-mode: multiply;
    box-shadow: 0 0 0 1px rgba(159,179,0,.45), 0 0 70px rgba(159,179,0,.16);
  }

  .it-splash-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .it-orbit {
    position: absolute;
    z-index: 1;
    left: 50%;
    top: 49%;
    width: min(76vw, 680px);
    aspect-ratio: 1;
    transform: translate(-50%, -50%);
    border: 1px solid rgba(17,17,17,.15);
    border-radius: 50%;
    pointer-events: none;
  }

  .it-orbit::before,
  .it-orbit::after {
    content: "";
    position: absolute;
    inset: 10%;
    border: 1px solid rgba(159,179,0,.34);
    border-radius: 50%;
  }

  .it-orbit::after {
    inset: 22%;
    border-color: rgba(17,17,17,.12);
  }

  .it-orbit-a { animation: it-orbit 18s linear infinite; }
  .it-orbit-b { width: min(56vw, 500px); transform: translate(-50%, -50%) rotate(64deg) scaleY(.46); animation: it-orbit-reverse 12s linear infinite; }
  .it-orbit-c { width: min(88vw, 820px); transform: translate(-50%, -50%) rotate(-28deg) scaleY(.34); animation: it-orbit 25s linear infinite; }

  .it-node {
    position: absolute;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--it-green);
    box-shadow: 0 0 16px rgba(159,179,0,.8);
  }

  .it-node-a { left: 12%; top: 22%; animation: it-float 3.4s ease-in-out infinite; }
  .it-node-b { right: 9%; top: 36%; animation: it-float 4.1s ease-in-out .5s infinite; }
  .it-node-c { left: 20%; bottom: 18%; animation: it-float 3.8s ease-in-out 1s infinite; }
  .it-node-d { right: 23%; bottom: 13%; animation: it-float 4.5s ease-in-out .8s infinite; }

  .it-circuit {
    position: absolute;
    z-index: 2;
    width: 160px;
    height: 90px;
    opacity: .55;
    pointer-events: none;
  }

  .it-circuit svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .it-circuit path {
    fill: none;
    stroke: var(--it-green);
    stroke-width: 1;
    stroke-dasharray: 5 7;
    animation: it-circuit-flow 5s linear infinite;
  }

  .it-circuit circle {
    fill: var(--it-green);
    filter: drop-shadow(0 0 4px rgba(159,179,0,.75));
  }

  .it-circuit-left { left: 2%; top: 32%; }
  .it-circuit-right { right: 2%; bottom: 27%; transform: scaleX(-1); }

  .it-splash-meta {
    left: 0;
    bottom: 3%;
    color: var(--it-muted);
  }

  .it-splash-index {
    right: 0;
    bottom: 3%;
    color: var(--it-muted);
    text-align: right;
  }

  .it-progress {
    position: absolute;
    left: 50%;
    bottom: 9%;
    width: min(260px, 42vw);
    transform: translateX(-50%);
    z-index: 7;
  }

  .it-progress-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    font: 9px "Courier New", monospace;
    letter-spacing: .12em;
    color: var(--it-muted);
  }

  .it-progress-track {
    height: 2px;
    overflow: hidden;
    background: rgba(17,17,17,.12);
  }

  .it-progress-fill {
    width: 72%;
    height: 100%;
    background: var(--it-green);
    box-shadow: 0 0 12px rgba(159,179,0,.55);
    animation: it-progress 3.5s ease-in-out infinite alternate;
  }

  .it-splash-scroll {
    position: absolute;
    z-index: 10;
    left: 50%;
    bottom: 2%;
    width: 40px;
    height: 40px;
    transform: translateX(-50%);
    border: 1px solid rgba(17,17,17,.22);
    border-radius: 50%;
    background: rgba(244,244,239,.5);
    color: var(--it-ink);
    display: grid;
    place-items: center;
    cursor: pointer;
    backdrop-filter: blur(6px);
    animation: it-scroll-bob 2s ease-in-out infinite;
  }

  .it-splash-scroll svg { width: 16px; height: 16px; }

  .it-splash:focus-visible .it-splash-scroll {
    outline: 2px solid var(--it-green);
    outline-offset: 4px;
  }

  @keyframes it-grid-drift {
    from { background-position: 0 0, 0 0; }
    to { background-position: 0 56px, 56px 0; }
  }

  @keyframes it-orbit {
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  @keyframes it-orbit-reverse {
    to { transform: translate(-50%, -50%) rotate(-296deg) scaleY(.46); }
  }

  @keyframes it-float {
    0%, 100% { transform: translate3d(0,0,0); }
    50% { transform: translate3d(7px,-10px,0); }
  }

  @keyframes it-pulse {
    0%, 100% { opacity: .5; transform: scale(.85); }
    50% { opacity: 1; transform: scale(1.15); }
  }

  @keyframes it-progress {
    from { width: 42%; }
    to { width: 91%; }
  }

  @keyframes it-scroll-bob {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(5px); }
  }

  @keyframes it-circuit-flow {
    to { stroke-dashoffset: -48; }
  }

  @keyframes it-title-flicker {
    0%, 90%, 100% { opacity: 1; }
    92% { opacity: .55; }
    94% { opacity: 1; }
  }

  @media (max-width: 700px) {
    .it-splash-shell { width: 88vw; min-height: 88svh; }
    .it-splash-topline { top: 1.5%; max-width: 180px; }
    .it-splash-status { top: 1.5%; }
    .it-splash-title { font-size: clamp(46px, 15vw, 82px); }
    .it-splash-role { font-size: 9px; max-width: 300px; margin-top: 20px; }
    .it-orbit { width: 92vw; }
    .it-orbit-b { width: 70vw; }
    .it-orbit-c { width: 104vw; }
    .it-circuit { width: 92px; height: 60px; opacity: .38; }
    .it-circuit-left { left: -4%; top: 25%; }
    .it-circuit-right { right: -4%; bottom: 24%; }
    .it-splash-meta,
    .it-splash-index { font-size: 8px; max-width: 120px; }
    .it-progress { bottom: 11%; width: 190px; }
    .it-splash-scroll { bottom: 2%; width: 36px; height: 36px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .it-splash *,
    .it-splash::before {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
    }
  }
`;

export default function PortfolioHero({ name = 'Aman Jain', imageUrl = '', onScrollDown }) {
  const displayName = String(name || 'Aman Jain').trim() || 'Aman Jain';

  const scrollToAbout = () => {
    if (onScrollDown) {
      onScrollDown();
      return;
    }
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="portfolio-splash it-splash"
      aria-label="Information technology portfolio introduction"
      role="button"
      tabIndex={0}
      onClick={scrollToAbout}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          scrollToAbout();
        }
      }}
    >
      <style>{splashStyles}</style>

      <div className="it-splash-shell">
        <div className="it-splash-topline">
          <strong>INFORMATION TECHNOLOGY</strong><br />
          PORTFOLIO / DIGITAL SYSTEMS
        </div>

        <div className="it-splash-status" aria-label="System status online">
          <span className="it-splash-status-dot" aria-hidden="true" />
          SYSTEM ONLINE
        </div>

        <div className="it-orbit it-orbit-a" aria-hidden="true" />
        <div className="it-orbit it-orbit-b" aria-hidden="true" />
        <div className="it-orbit it-orbit-c" aria-hidden="true" />

        <span className="it-node it-node-a" aria-hidden="true" />
        <span className="it-node it-node-b" aria-hidden="true" />
        <span className="it-node it-node-c" aria-hidden="true" />
        <span className="it-node it-node-d" aria-hidden="true" />

        <div className="it-circuit it-circuit-left" aria-hidden="true">
          <svg viewBox="0 0 160 90">
            <path d="M4 72 H52 V42 H86 V18 H156" />
            <circle cx="52" cy="42" r="3" />
            <circle cx="86" cy="18" r="3" />
          </svg>
        </div>

        <div className="it-circuit it-circuit-right" aria-hidden="true">
          <svg viewBox="0 0 160 90">
            <path d="M4 72 H52 V42 H86 V18 H156" />
            <circle cx="52" cy="42" r="3" />
            <circle cx="86" cy="18" r="3" />
          </svg>
        </div>

        <div className="it-splash-center">
          {imageUrl && (
            <div className="it-splash-photo" aria-hidden="true">
              <img src={imageUrl} alt="" />
            </div>
          )}

          <p className="it-splash-kicker">SOFTWARE / DATA / BUSINESS</p>

          <h1 className="it-splash-title">
            <span className="it-splash-title-line">
              FULL <span className="it-splash-title-accent">STACK</span>
            </span>
            <span className="it-splash-title-line outline">DEVELOPER</span>
          </h1>

          <BlurText
            text={`${displayName.toUpperCase()} / CONSULTANT & DATA ANALYST`}
            delay={45}
            animateBy="letters"
            direction="top"
            className="it-splash-role"
          />
        </div>

        <div className="it-progress" aria-hidden="true">
          <div className="it-progress-label">
            <span>INITIALIZING PROFILE</span>
            <span>72%</span>
          </div>
          <div className="it-progress-track">
            <div className="it-progress-fill" />
          </div>
        </div>

        <div className="it-splash-meta">
          DATA SYSTEMS<br />
          <span>NODE / 01 — DELHI</span>
        </div>

        <div className="it-splash-index">
          <span>SYS.2026</span><br />
          <span>01 / 01</span>
        </div>

        <button
          type="button"
          className="it-splash-scroll"
          aria-label="Scroll to portfolio"
          onClick={(event) => {
            event.stopPropagation();
            scrollToAbout();
          }}
        >
          <ChevronDown />
        </button>
      </div>
    </section>
  );
}
