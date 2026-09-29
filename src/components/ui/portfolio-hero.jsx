import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './portfolio-splash.css';

function RevealText({ text, delay = 80, className = '', direction = 'top' }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const letters = useMemo(() => text.split(''), [text]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.1 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {letters.map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          aria-hidden="true"
          className="portfolio-splash-letter"
          style={{
            transitionDelay: `${index * delay}ms`,
            opacity: visible ? 1 : 0,
            filter: visible ? 'blur(0px)' : 'blur(14px)',
            transform: visible
              ? 'translate3d(0,0,0) scale(1)'
              : `translate3d(0,${direction === 'top' ? '-28px' : '28px'},0) scale(.96)`,
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </span>
      ))}
    </span>
  );
}

export default function PortfolioHero({ name = 'Aman Jain', imageUrl = '', onScrollDown }) {
  const displayName = String(name || 'Aman Jain').trim() || 'Aman Jain';
  const [firstName, ...rest] = displayName.split(/\s+/);
  const lastName = rest.join(' ') || firstName;
  const photoRef = useRef(null);

  const scrollToProfilePhoto = () => {
    photoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section
      className="portfolio-splash"
      aria-label="Portfolio introduction"
    >
      <div className="portfolio-splash-backdrop" aria-hidden="true">
        <div className="portfolio-splash-grid" />
        <div className="portfolio-splash-scan" />
        <div className="portfolio-splash-glow portfolio-splash-glow-one" />
        <div className="portfolio-splash-glow portfolio-splash-glow-two" />
        <div className="portfolio-splash-circuit portfolio-splash-circuit-one" />
        <div className="portfolio-splash-circuit portfolio-splash-circuit-two" />
        <div className="portfolio-splash-orbit portfolio-splash-orbit-one" />
        <div className="portfolio-splash-orbit portfolio-splash-orbit-two" />
        <span className="portfolio-splash-node portfolio-splash-node-one" />
        <span className="portfolio-splash-node portfolio-splash-node-two" />
        <span className="portfolio-splash-node portfolio-splash-node-three" />
      </div>

      <header className="portfolio-splash-topbar" aria-hidden="true">
        <span className="portfolio-splash-brand">AJ / DIGITAL SYSTEMS</span>
        <span className="portfolio-splash-status"><i /> SYSTEM ONLINE</span>
        <span className="portfolio-splash-index">01 / 01</span>
      </header>

      <div className="portfolio-splash-side portfolio-splash-side-left" aria-hidden="true">
        <span>SOFTWARE</span>
        <span>DATA</span>
        <span>CONSULTING</span>
      </div>

      <main className="portfolio-splash-content">
        <div className="portfolio-splash-kicker">
          <span className="portfolio-splash-kicker-line" />
          <span>INFORMATION TECHNOLOGY / PORTFOLIO</span>
          <span className="portfolio-splash-kicker-line" />
        </div>

        <div className="portfolio-splash-name">
          <RevealText text={firstName || 'Aman'} delay={82} className="portfolio-splash-word portfolio-splash-word-primary" />
          <RevealText text={lastName || ''} delay={82} className="portfolio-splash-word portfolio-splash-word-outline" />
        </div>

        {imageUrl && (
          <div ref={photoRef} className="portfolio-splash-photo-wrap">
            <div className="portfolio-splash-photo-frame">
              <img src={imageUrl} alt={displayName} className="portfolio-splash-photo" />
              <span className="portfolio-splash-photo-scan" aria-hidden="true" />
              <span className="portfolio-splash-photo-corner portfolio-splash-photo-corner-tl">IMG_01</span>
              <span className="portfolio-splash-photo-corner portfolio-splash-photo-corner-br">AJ</span>
            </div>
          </div>
        )}

        <div className="portfolio-splash-role">
          <span>&lt;/&gt;</span>
          <strong>FULL STACK DEVELOPER</strong>
          <b>×</b>
          <strong>CONSULTANT &amp; DATA ANALYST</strong>
        </div>

        <div className="portfolio-splash-system">
          <span>01</span>
          <span className="portfolio-splash-system-bar"><i /></span>
          <span>SOFTWARE / DATA / BUSINESS</span>
        </div>
      </main>

      <footer className="portfolio-splash-footer">
        <p>Building digital systems where technology meets practical problem solving.</p>

        <button
          type="button"
          className="portfolio-splash-scroll"
          aria-label="Scroll to profile photo"
          onClick={scrollToProfilePhoto}
        >
          <span>VIEW PROFILE</span>
          <i><ChevronDown /></i>
        </button>
      </footer>

      <div className="portfolio-splash-corner portfolio-splash-corner-tl" aria-hidden="true">DIGITAL / 2026</div>
      <div className="portfolio-splash-corner portfolio-splash-corner-br" aria-hidden="true">SCROLL / VIEW PROFILE</div>
    </section>
  );
}
