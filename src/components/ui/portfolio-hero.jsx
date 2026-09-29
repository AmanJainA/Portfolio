import React, { useEffect, useMemo, useRef, useState } from 'react';
import './portfolio-splash.css';

function BlurText({ text, delay = 70, animateBy = 'letters', direction = 'top', className = '', style }) {
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
    <p ref={ref} className={className} style={style}>
      {segments.map((segment, index) => (
        <span
          key={`${segment}-${index}`}
          style={{
            display: 'inline-block',
            filter: inView ? 'blur(0px)' : 'blur(10px)',
            opacity: inView ? 1 : 0,
            transform: inView
              ? 'translateY(0)'
              : `translateY(${direction === 'top' ? '-20px' : '20px'})`,
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

function DataStream({ side = 'left', children }) {
  return (
    <div className={`portfolio-splash-stream portfolio-splash-stream-${side}`} aria-hidden="true">
      <span className="portfolio-splash-stream-line">{children}</span>
      <span className="portfolio-splash-stream-line">0101 / SYS / 200</span>
      <span className="portfolio-splash-stream-line">API → DATA → UI</span>
    </div>
  );
}

export default function PortfolioHero({ name = 'Aman Jain', imageUrl = '', onScrollDown }) {
  const displayName = String(name || 'Aman Jain').trim() || 'Aman Jain';
  const [firstName, ...rest] = displayName.split(/\s+/);
  const lastName = rest.join(' ') || firstName;

  return (
    <section
      className="portfolio-splash"
      aria-label="Portfolio introduction"
      role="button"
      tabIndex={0}
      onClick={onScrollDown}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onScrollDown?.();
        }
      }}
    >
      <div className="portfolio-splash-grid" aria-hidden="true" />
      <div className="portfolio-splash-noise" aria-hidden="true" />
      <div className="portfolio-splash-glow portfolio-splash-glow-one" aria-hidden="true" />
      <div className="portfolio-splash-glow portfolio-splash-glow-two" aria-hidden="true" />

      <div className="portfolio-splash-topbar" aria-hidden="true">
        <span>AJ / PORTFOLIO.OS</span>
        <span className="portfolio-splash-live"><i /> SYSTEM ONLINE</span>
        <span>DEL / 28.09.26</span>
      </div>

      <div className="portfolio-splash-signature" aria-hidden="true">A</div>

      <DataStream side="left">01 / 1001 / BUILD</DataStream>
      <DataStream side="right">FULL STACK / ANALYTICS</DataStream>

      <div className="portfolio-splash-orbit portfolio-splash-orbit-one" aria-hidden="true" />
      <div className="portfolio-splash-orbit portfolio-splash-orbit-two" aria-hidden="true" />
      <div className="portfolio-splash-node portfolio-splash-node-one" aria-hidden="true" />
      <div className="portfolio-splash-node portfolio-splash-node-two" aria-hidden="true" />

      <div className="portfolio-splash-center">
        <div className="portfolio-splash-kicker">
          <span className="portfolio-splash-kicker-dot" />
          DIGITAL SYSTEMS / SOFTWARE / DATA
        </div>

        <div className="portfolio-splash-name">
          <BlurText
            text={firstName || 'Aman'}
            delay={85}
            animateBy="letters"
            direction="top"
            className="portfolio-splash-word"
          />
          <BlurText
            text={lastName || ''}
            delay={85}
            animateBy="letters"
            direction="top"
            className="portfolio-splash-word portfolio-splash-word-outline"
          />

          {imageUrl && (
            <div className="portfolio-splash-photo">
              <img src={imageUrl} alt={displayName} />
              <span className="portfolio-splash-photo-scan" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="portfolio-splash-role">
          <span className="portfolio-splash-role-prefix">&lt;/&gt;</span>
          <span>FULL STACK DEVELOPER</span>
          <span className="portfolio-splash-role-separator">×</span>
          <span>CONSULTANT &amp; DATA ANALYST</span>
        </div>

        <div className="portfolio-splash-terminal" aria-hidden="true">
          <span>init.profile()</span>
          <span className="portfolio-splash-terminal-caret">_</span>
        </div>
      </div>

      <div className="portfolio-splash-bottom">
        <div className="portfolio-splash-tagline">
          <BlurText
            text="Building digital systems where technology meets practical problem solving."
            delay={38}
            animateBy="words"
            direction="top"
            className="portfolio-splash-tagline-text"
          />
        </div>

        <div className="portfolio-splash-scroll-copy">
          <span>ENTER PORTFOLIO</span>
          <span className="portfolio-splash-scroll-line" />
          <button
            type="button"
            className="portfolio-splash-scroll"
            aria-label="Enter portfolio"
            onClick={(event) => {
              event.stopPropagation();
              onScrollDown?.();
            }}
          >
            <span>↓</span>
          </button>
        </div>
      </div>

      <div className="portfolio-splash-corner portfolio-splash-corner-tl">[ 01 ]</div>
      <div className="portfolio-splash-corner portfolio-splash-corner-br">SCROLL / CLICK / ENTER</div>
    </section>
  );
}
