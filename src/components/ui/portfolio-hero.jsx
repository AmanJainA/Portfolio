import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

function BlurText({ text, delay = 100, animateBy = 'letters', direction = 'top', className = '', style }) {
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
            transition: `all .5s ease-out ${index * delay}ms`,
          }}
        >
          {segment}
          {animateBy === 'words' && index < segments.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </p>
  );
}

export default function PortfolioHero({ name = 'Aman Jain', imageUrl = '', onScrollDown }) {
  const displayName = String(name || 'Aman Jain').trim() || 'Aman Jain';
  const [firstName, ...rest] = displayName.split(/\s+/);
  const lastName = rest.join(' ') || firstName;
  const splashRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const updateSplashMotion = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const element = splashRef.current;
        if (!element) return;
        const height = Math.max(element.offsetHeight, window.innerHeight);
        const progress = Math.min(Math.max(-element.getBoundingClientRect().top / height, 0), 1);
        setScrollProgress(progress);
      });
    };
    updateSplashMotion();
    window.addEventListener('scroll', updateSplashMotion, { passive: true });
    window.addEventListener('resize', updateSplashMotion);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateSplashMotion);
      window.removeEventListener('resize', updateSplashMotion);
    };
  }, []);

  return (
    <section
      ref={splashRef}
      className="portfolio-splash"
      style={{ '--splash-scroll': scrollProgress }}
      aria-label="Portfolio introduction"
    >
      <div className="portfolio-splash-tech-layer" aria-hidden="true">
        <div className="portfolio-splash-grid" />
        <div className="portfolio-splash-orbit portfolio-splash-orbit-one" />
        <div className="portfolio-splash-orbit portfolio-splash-orbit-two" />
        <div className="portfolio-splash-orbit portfolio-splash-orbit-three" />
        <div className="portfolio-splash-node portfolio-splash-node-one" />
        <div className="portfolio-splash-node portfolio-splash-node-two" />
        <div className="portfolio-splash-node portfolio-splash-node-three" />
        <div className="portfolio-splash-scanlines" />
        </div>

      <div className="portfolio-splash-system portfolio-splash-system-left" aria-hidden="true">
        <span>SYS://PORTFOLIO</span>
        <span>BUILD 2026.09</span>
      </div>

      <div className="portfolio-splash-system portfolio-splash-system-right" aria-hidden="true">
        <span><i /> SYSTEM ONLINE</span>
        <span>DEV_MODE / 01</span>
      </div>

      <div className="portfolio-splash-signature" aria-hidden="true">A</div>

      <div className="portfolio-splash-center">
        <div className="portfolio-splash-name">
          <BlurText
            text={firstName || 'Aman'}
            delay={90}
            animateBy="letters"
            direction="top"
            className="portfolio-splash-word"
          />
          <BlurText
            text={lastName || ''}
            delay={90}
            animateBy="letters"
            direction="top"
            className="portfolio-splash-word portfolio-splash-word-outline"
          />

          {imageUrl && (
            <div
              className="portfolio-splash-photo"
              role="button"
              tabIndex={0}
              aria-label="Enter portfolio"
              onClick={(event) => {
                event.stopPropagation();
                onScrollDown?.();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  onScrollDown?.();
                }
              }}
            >
              <img src={imageUrl} alt={displayName} />
              <span className="portfolio-splash-photo-scan portfolio-splash-photo-scan-one" aria-hidden="true" />
              <span className="portfolio-splash-photo-scan portfolio-splash-photo-scan-two" aria-hidden="true" />
              <span className="portfolio-splash-photo-frame" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>

      <div className="portfolio-splash-tagline">
        <BlurText
          text="Designing human experiences in code."
          delay={120}
          animateBy="words"
          direction="top"
          className="portfolio-splash-tagline-text"
        />
      </div>

      <button
        type="button"
        className="portfolio-splash-scroll"
        aria-label="Scroll to portfolio"
        onClick={(event) => {
          event.stopPropagation();
          if (onScrollDown) {
            onScrollDown();
            return;
          }
          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <ChevronDown />
      </button>
    </section>
  );
}
