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
  const [firstName, ...rest] = String(name).trim().split(/\s+/);
  const lastName = rest.join(' ') || firstName;

  return (
    <section className="portfolio-splash" aria-label="Portfolio introduction">
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
            className="portfolio-splash-word"
          />

          {imageUrl && (
            <div className="portfolio-splash-photo">
              <img src={imageUrl} alt={name || 'Profile'} />
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
        onClick={() => {
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
