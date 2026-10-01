import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useScroll, useSpring, useTransform } from 'motion/react';
import PortfolioHero from './components/ui/portfolio-hero';
import { db, supabase } from './supabase';
import './PortfolioApp.css';
import sqlIcon from './images/tech-icons/sql.svg';

const emptyData = { profile: null, languages: [], skills: [], projects: [], education: [], experience: [], social_links: [] };

function sanitizeRichText(html) {
  if (!html) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(String(html), 'text/html');
  const allowed = new Set(['P','BR','STRONG','B','EM','I','U','SPAN','DIV']);
  doc.body.querySelectorAll('*').forEach((node) => {
    if (!allowed.has(node.tagName)) {
      node.replaceWith(...Array.from(node.childNodes));
      return;
    }
    Array.from(node.attributes).forEach((attr) => {
      if (attr.name !== 'style') node.removeAttribute(attr.name);
    });
    if (node.hasAttribute('style')) {
      const color = node.style.color;
      node.removeAttribute('style');
      if (color) node.style.color = color;
    }
  });
  return doc.body.innerHTML;
}

function RichText({html,className=''}) {
  const safe = sanitizeRichText(html);
  return <div className={className} dangerouslySetInnerHTML={{__html:safe || ''}} />;
}

function setFavicon(url) {
  if (!url) return;
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
}

function HeroRoleTypewriter() {
  const roles = ['Full Stack Developer', 'Consultant & Data Analyst'];
  const [roleIndex, setRoleIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentRole = roles[roleIndex];
    const typingSpeed = deleting ? 55 : 95;
    const pauseAfterTyping = 5000;
    const pauseAfterDeleting = 450;

    const timer = setTimeout(() => {
      if (!deleting) {
        const nextText = currentRole.slice(0, text.length + 1);
        setText(nextText);
        if (nextText === currentRole) setDeleting(true);
      } else {
        const nextText = currentRole.slice(0, Math.max(0, text.length - 1));
        setText(nextText);
        if (!nextText) {
          setDeleting(false);
          setRoleIndex((index) => (index + 1) % roles.length);
        }
      }
    }, !deleting && text === currentRole ? pauseAfterTyping : deleting && text === '' ? pauseAfterDeleting : typingSpeed);

    return () => clearTimeout(timer);
  }, [text, deleting, roleIndex]);

  return (
    <div className="p-hero-role-typewriter" aria-label={roles[roleIndex]}>
      <span className="p-hero-role-text">{text}</span><span className="p-hero-role-cursor" aria-hidden="true" />
    </div>
  );
}

function AnimatedNumber({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const target = Number(value) || 0;
    const duration = 900;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);
  return <span ref={ref}>{display}</span>;
}

function ProfessionalRing({ skill }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const target = Number(skill.percent) || 0;
    const duration = 950;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, skill.percent]);
  return (
    <motion.div
      className="p-ring-wrap"
      ref={ref}
      initial={{ opacity: 0, y: 34, scale: 0.78, rotate: -8 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, type: 'spring', stiffness: 115, damping: 14 }}
      whileHover={{ y: -8, scale: 1.045, rotate: 1.5 }}
    >
      <motion.div
        className="p-ring"
        initial={{ '--pct': '0deg', scale: 0.82 }}
        animate={{ '--pct': inView ? (skill.percent * 3.6) + 'deg' : '0deg', scale: inView ? 1 : 0.82 }}
        transition={{ duration: .95, ease: [0.22, 1, 0.36, 1] }}
      >
        <strong>{display}%</strong>
      </motion.div>
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: .18, duration: .35 }}
      >
        {skill.name}
      </motion.span>
    </motion.div>
  );
}

function AboutScrollScene({ aboutText, techItems }) {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia?.('(max-width: 650px)').matches ?? false);
  const sceneRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(max-width: 650px)');
    if (!mediaQuery) return undefined;
    const handleViewportChange = (event) => setIsMobile(event.matches);
    mediaQuery.addEventListener?.('change', handleViewportChange);
    return () => mediaQuery.removeEventListener?.('change', handleViewportChange);
  }, []);
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start end', 'end start'],
  });
  const sceneRotate = useTransform(scrollYProgress, [0, .5, 1], [4, 0, -3]);
  const sceneY = useTransform(scrollYProgress, [0, .5, 1], [70, 0, -45]);
  const sceneScale = useTransform(scrollYProgress, [0, .45, 1], [.94, 1, .97]);
  const gridY = useTransform(scrollYProgress, [0, .5, 1], [55, 0, -55]);
  const gridRotate = useTransform(scrollYProgress, [0, .5, 1], [-2, 0, 2]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div ref={sceneRef} className="p-about-scrollscene">
      <div className="p-about-scroll-sticky">
        <motion.div
          className="p-glass p-about-immersive"
          style={{ y: isMobile ? 0 : sceneY, rotateX: isMobile ? 0 : sceneRotate, scale: isMobile ? 1 : sceneScale }}
          initial={isMobile ? false : { opacity: 0, scale: .96 }}
          whileInView={isMobile ? undefined : { opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: .7 }}
        >
          <div className="p-about-motion-hud" aria-hidden="true">
            <span className="p-about-hud-chip"><i className="fa-solid fa-terminal" /> ABOUT://SYSTEM</span>
            <span className="p-about-hud-status"><i /> SCROLL_ACTIVE</span>
          </div>
          <div className="p-about-motion-grid" aria-hidden="true" />
          <div className="p-about-motion-orbit p-about-motion-orbit-one" aria-hidden="true" />
          <div className="p-about-motion-orbit p-about-motion-orbit-two" aria-hidden="true" />
          <div className="p-about-motion-node p-about-motion-node-one" aria-hidden="true" />
          <div className="p-about-motion-node p-about-motion-node-two" aria-hidden="true" />
          <div className="p-about-copy">
            <span className="p-about-scroll-label">SCROLL TO EXPLORE</span>
            <RichText html={aboutText} className="p-about-rich-text" />
          </div>
          <motion.div
            className="p-about-tech-field"
            aria-label="Technical skills"
            style={{ y: isMobile ? 0 : gridY, rotateZ: isMobile ? 0 : gridRotate }}
          >
            <div className="p-about-tech-glow" />
            {techItems.map(([name, level, icon, color], i) => (
              <motion.div
                className="p-about-tech-card"
                key={name}
                style={{ '--tech-color': color }}
                initial={isMobile ? false : { opacity: 0, scale: .25, y: 100, rotateX: 80, rotateY: i % 2 ? -55 : 55, z: -220 }}
                whileInView={isMobile ? undefined : { opacity: 1, scale: 1, y: 0, rotateX: 0, rotateY: 0, z: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ delay: i * .11, duration: .8, type: 'spring', stiffness: 90, damping: 14 }}
                whileHover={isMobile ? undefined : { y: -16, scale: 1.08, rotateX: -8, rotateY: i % 2 ? 9 : -9, z: 45 }}
              >
                <span className="p-about-tech-icon"><img src={icon} alt={name} /></span>
                <strong>{name}</strong>
                <small>{level}</small>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function JourneyMotionScene({ data }) {
  const sceneRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start 92%', 'end 18%'],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 26,
    mass: 0.45,
  });
  const sceneY = useTransform(smoothProgress, [0, .2, .7, 1], [18, 0, 0, -10]);
  const sceneScale = useTransform(smoothProgress, [0, .2, .75, 1], [.992, 1, 1, .998]);
  const lineScale = useTransform(smoothProgress, [0, .16, .72, 1], [.05, .55, .9, 1]);

  return (
    <motion.div
      ref={sceneRef}
      className="p-journey-motion-scene"
      style={{ y: sceneY, scale: sceneScale }}
    >
      <div className="p-journey-motion-hud" aria-hidden="true">
        <span><i /> JOURNEY://TIMELINE</span>
        <span>DATA_FLOW <b>●</b></span>
      </div>
      <div className="p-journey-timeline">
        <motion.div className="p-journey-line" aria-hidden="true" style={{ scaleY: lineScale }} />
        <motion.div
          className="p-journey-head"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: .12 }}
          transition={{ duration: .5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3>Education</h3><span /><h3>Work Experience</h3>
        </motion.div>
        {Array.from({ length: Math.max(data.education.length, data.experience.length) }).map((_, i) => {
          const education = data.education[i];
          const experience = data.experience[i];
          return (
            <div className="p-journey-row" key={education?.id || experience?.id || i}>
              <div className="p-journey-side p-journey-education">
                {education && <motion.article className="p-journey-card p-journey-card-left"
                  initial={{ opacity: 0, x: -48, rotateY: 5, scale: .96 }}
                  whileInView={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                  viewport={{ once: true, amount: .2 }}
                  transition={{ duration: .7, delay: i * .08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6, x: -4, scale: 1.012 }}
                >
                  <span>{education.period}</span><h3>{education.title}</h3><b>{education.location}</b>
                  {(education.details || []).map(d => <p key={d}>{d}</p>)}
                </motion.article>}
              </div>
              <motion.div
                className="p-journey-dot"
                aria-hidden="true"
                initial={{ opacity: 0, scale: .25 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: .12 }}
                transition={{ duration: .4, delay: i * .07 + .08, type: 'spring', stiffness: 180, damping: 14 }}
              />
              <div className="p-journey-side p-journey-experience">
                {experience && <motion.article className="p-journey-card p-journey-card-right mb-2"
                  initial={{ x: 48, rotateY: -5, scale: .96 }}
                  whileInView={{ x: 0, y: 0, rotateY: 0, scale: 1 }}
                  viewport={{ once: true, amount: .2 }}
                  transition={{ duration: .7, delay: i * .08 + .04, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6, scale: 1.012 }}
                >
                  <span>{experience.period}</span><h3>{experience.title}</h3><b>{experience.company}</b>
                  {(experience.details || []).map(d => <p key={d}>{d}</p>)}
                </motion.article>}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function ProjectSection({ projects }) {
  const [filter, setFilter] = useState('All');
  const sceneRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia?.('(max-width: 650px)').matches ?? false);
  const filters = ['All', 'PHP', 'Android', 'Flutter', 'React'];

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(max-width: 650px)');
    if (!mediaQuery) return undefined;
    const handleViewportChange = (event) => setIsMobile(event.matches);
    mediaQuery.addEventListener?.('change', handleViewportChange);
    return () => mediaQuery.removeEventListener?.('change', handleViewportChange);
  }, []);
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start 90%', 'end 15%'],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 25,
    mass: 0.45,
  });
  const gridY = useTransform(smoothProgress, [0, .5, 1], [55, 0, -45]);
  const gridRotate = useTransform(smoothProgress, [0, .5, 1], [-1.5, 0, 1.5]);
  const scanY = useTransform(smoothProgress, [0, 1], ['0%', '92%']);

  const filteredProjects = useMemo(() => {
    if (filter === 'All') return projects;
    return projects.filter((project) =>
      (project.tech_stack || []).some((tech) => {
        const value = String(tech).toLowerCase();
        if (filter === 'Android') return value.includes('android');
        return value.includes(filter.toLowerCase());
      })
    );
  }, [projects, filter]);

  return (
    <Section id="projects" title="My Projects" eyebrow="03 / SELECTED WORK">
      <motion.div
        ref={sceneRef}
        className="p-projects-motion-scene"
        initial={isMobile ? false : { opacity: 0, y: 55, scale: .975 }}
        whileInView={isMobile ? undefined : { opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: .12 }}
        transition={{ duration: .85, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="p-projects-grid-bg"
          aria-hidden="true"
          style={{ y: isMobile ? 0 : gridY, rotateZ: isMobile ? 0 : gridRotate }}
        />
        <motion.div
          className="p-projects-scanline"
          aria-hidden="true"
          style={{ y: isMobile ? '0%' : scanY }}
        />
        <div className="p-about-scroll-progress p-projects-scroll-progress" aria-hidden="true">
          <motion.span initial={isMobile ? false : { scaleX: 0 }} whileInView={isMobile ? undefined : { scaleX: 1 }}
            viewport={{ once: true, amount: .15 }}
            transition={{ duration: 1.1, delay: .12, ease: [0.22, 1, 0.36, 1] }} />
        </div>
        <motion.div className="p-project-filters" role="tablist" aria-label="Project filters"
          initial={isMobile ? false : { opacity: 0, y: 25 }} whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: .3 }} transition={{ duration: .6, delay: .16 }}>
          {filters.map((item, i) => (
            <motion.button key={item} type="button" role="tab" aria-selected={filter === item}
              className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}
              whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: .96 }}
              transition={{ duration: .2 }}>
              {item}
            </motion.button>
          ))}
        </motion.div>

        <motion.div layout className="p-project-grid">
          {filteredProjects.map((project, i) => (
            <motion.article layout className="p-project p-project-motion-card" key={project.id}
              initial={isMobile ? false : { opacity: 0, y: 55, rotateX: 12, scale: .95 }}
              whileInView={isMobile ? undefined : { opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: true, amount: .16 }}
              transition={{ delay: i * .075, duration: .65, ease: [0.22, 1, 0.36, 1] }}
              whileHover={isMobile ? undefined : { y: -10, rotateX: -1.5, scale: 1.012 }}>
              <div className="p-project-image">
                <div className="p-project-image-shine" aria-hidden="true" />
                {project.image_url ? <img src={project.image_url} alt={project.title} /> : <div className="p-project-placeholder"><span className="p-project-icon-code" aria-hidden="true">&lt;/&gt;</span></div>}
                <span className="p-project-live"><i /> BUILD_READY</span>
                {project.link && project.link !== '#' && (
                  <a className="p-project-link" href={project.link} target="_blank" rel="noreferrer"
                    aria-label={'Open ' + project.title} title="Open project">
                    <span className="p-project-link-icon" aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
              <div className="p-project-body">
                <span className="p-project-no">{String(project.sort_order || i + 1).padStart(2,'0')}</span>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <div className="p-tech-row">{(project.tech_stack || []).map((t) => <span key={t}>{t}</span>)}</div>
              </div>
            </motion.article>
          ))}
        </motion.div>
        {!filteredProjects.length && <div className="p-project-empty">No projects found for {filter}.</div>}
      </motion.div>
    </Section>
  );
}

function Section({ id, title, eyebrow, children }) {
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia?.('(max-width: 650px)').matches ?? false);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(max-width: 650px)');
    if (!mediaQuery) return undefined;
    const handleViewportChange = (event) => setIsMobile(event.matches);
    mediaQuery.addEventListener?.('change', handleViewportChange);
    return () => mediaQuery.removeEventListener?.('change', handleViewportChange);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.45,
  });
  const isProjects = id === 'projects';
  const headingY = useTransform(smoothProgress, isProjects ? [0, 0.22, 1] : [0, 0.5, 1], isProjects ? [24, 0, 0] : [42, 0, -24]);
  const contentY = useTransform(smoothProgress, isProjects ? [0, 0.22, 1] : [0, 0.5, 1], isProjects ? [34, 0, 0] : [58, 0, -34]);
  const headingScale = useTransform(smoothProgress, isProjects ? [0, 0.22, 1] : [0, 0.5, 1], isProjects ? [0.97, 1, 1] : [0.94, 1, 1.02]);
  const contentScale = useTransform(smoothProgress, isProjects ? [0, 0.22, 1] : [0, 0.5, 1], isProjects ? [0.98, 1, 1] : [0.97, 1, 1.015]);
  const headingOpacity = useTransform(smoothProgress, isProjects ? [0, 1] : [0, 0.18, 0.82, 1], isProjects ? [1, 1] : [0, 1, 1, 0.86]);
  const contentOpacity = useTransform(smoothProgress, isProjects ? [0, 0.22, 1] : [0, 0.16, 0.84, 1], isProjects ? [0, 1, 1] : [0.15, 1, 1, 0.9]);
  const sectionLineProgress = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <section id={id} ref={sectionRef} className="p-section">
      <div className="p-container">
        <motion.div
          className="p-section-heading-motion"
          style={id === 'resume' ? { y: 0, scale: 1, opacity: 1 } : { y: headingY, scale: headingScale, opacity: headingOpacity }}
        >
          <span className="p-eyebrow">{eyebrow}</span>
          <h2 className="p-title">{title}</h2>
          {['about', 'skills', 'resume', 'contact'].includes(id) && (
            <div className="p-section-about-line" aria-hidden="true"><span></span></div>
          )}
        </motion.div>

        <motion.div
          className="p-section-scroll-motion"
          style={{
            y: (id === 'projects' || id === 'resume') && isMobile ? 0 : contentY,
            scale: id === 'projects' || id === 'resume' ? 1 : contentScale,
            opacity: id === 'projects' || id === 'resume' ? 1 : contentOpacity,
          }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}

export default function PortfolioApp() {
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(() => window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  const [activeSection, setActiveSection] = useState('home');
  const [showSplash, setShowSplash] = useState(true);
  const [contactMapOpen, setContactMapOpen] = useState(false);

  const enterPortfolio = () => {
    setShowSplash(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);
  };

  const menuItems = [
    ['home', 'Home', 'fa-house'],
    ['about', 'About', 'fa-user'],
    ['skills', 'Skills', 'fa-code'],
    ['projects', 'Projects', 'fa-briefcase'],
    ['resume', 'Resume', 'fa-file-lines'],
    ['contact', 'Contact', 'fa-envelope'],
  ];

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: light)');
    if (!mediaQuery) return undefined;

    const handleSystemThemeChange = (event) => {
      setTheme(event.matches ? 'light' : 'dark');
    };

    mediaQuery.addEventListener?.('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener?.('change', handleSystemThemeChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.portfolioTheme = theme;
    document.body.classList.toggle('portfolio-light-mode', theme === 'light');
  }, [theme]);

  useEffect(() => {
    const onScroll = () => {
      const point = window.scrollY + 130;
      let current = 'home';
      menuItems.forEach(([id]) => {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= point) current = id;
      });
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!showSplash) return;

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) > 5) enterPortfolio();
    };

    const handleTouchMove = () => enterPortfolio();

    const handleKeyDown = (event) => {
      if (
        event.key === 'ArrowDown' ||
        event.key === 'PageDown' ||
        event.key === ' ' ||
        event.key === 'Enter'
      ) {
        enterPortfolio();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSplash]);

  const load = async () => {
    setLoading(true);
    const results = await Promise.all([
      db.from('site_profile').select('*').limit(1),
      db.from('languages').select('*').order('sort_order', { ascending: true }),
      db.from('skills').select('*').order('sort_order', { ascending: true }),
      db.from('projects').select('*').order('sort_order', { ascending: true }),
      db.from('education').select('*').order('sort_order', { ascending: true }),
      db.from('experience').select('*').order('sort_order', { ascending: true }),
      db.from('social_links').select('*').order('sort_order', { ascending: true }),
    ]);
    const failed = results.find((r) => r.error);
    if (failed) setError(failed.error.message);
    else {
      const next = {
        profile: results[0].data?.[0] || null,
        languages: results[1].data || [],
        skills: results[2].data || [],
        projects: results[3].data || [],
        education: results[4].data || [],
        experience: results[5].data || [],
        social_links: results[6].data || [],
      };
      setData(next);
      if (next.profile?.favicon_url || next.profile?.profile_image_url) setFavicon(next.profile.favicon_url || next.profile.profile_image_url);
      document.title = next.profile?.full_name ? `${next.profile.full_name} — Portfolio` : 'Portfolio';
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const technical = useMemo(() => data.skills.filter((s) => s.category === 'technical'), [data.skills]);
  const professional = useMemo(() => data.skills.filter((s) => s.category === 'professional'), [data.skills]);
  const boxes = useMemo(() => data.skills.filter((s) => s.category === 'box'), [data.skills]);

  const submitContact = async (e) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
      subject: String(form.get('subject') || '').trim(),
      message: String(form.get('message') || '').trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      alert('Please fill in your name, email and message.');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: payload,
      });

      if (error) {
        let message = error.message || 'Unable to send the message.';
        try {
          if (error.context) {
            const body = await error.context.json();
            if (body?.error) message = body.error;
          }
        } catch (_) {}
        throw new Error(message);
      }

      if (!data?.ok) {
        throw new Error(data?.error || 'Unable to send the message.');
      }

      formElement.reset();
      alert('Message sent successfully. I will get back to you soon.');
    } catch (error) {
      console.error('Contact form error:', error);
      alert(error?.message || 'Unable to send the message. Please try again.');
    }
  };

  if (loading) return <div className="p-loader"><div className="p-loader-orb" /><p>Loading portfolio…</p></div>;
  if (error) return <div className="p-loader"><p>Portfolio data could not be loaded.</p><small>{error}</small></div>;

  const p = data.profile || {};

  return (
    <div className="portfolio-modern">
      {showSplash && (
        <div className="portfolio-splash-layer">
          <PortfolioHero
            name={p.full_name || 'Aman Jain'}
            imageUrl={p.profile_image_url}
            onScrollDown={enterPortfolio}
          />
        </div>
      )}

      {!showSplash && (
        <>
      <header className="p-header">
        <div className="p-container p-header-inner">
          <a className="p-brand" href="#home"><span className="p-brand-mark"><i className="fa-solid fa-code" /></span><span>{p.username || p.full_name || 'Portfolio'}</span></a>
          <nav className="p-nav" aria-label="Primary navigation">
            {menuItems.map(([id, label, icon]) => <a key={id} className={activeSection === id ? 'active' : ''} href={`#${id}`}><span className="p-nav-icon"><i className={`fa-solid ${icon}`} /></span><span className="p-nav-text">{label}</span></a>)}
          </nav>
          <div className="p-header-actions">
            <button key={`theme-${theme}`} className={`p-theme-toggle ${theme === 'light' ? 'is-light' : 'is-dark'}`} type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}><span className="p-theme-toggle-track"><span className="p-theme-toggle-knob"><i className={theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'} /></span></span></button>
            <a className="p-header-cta" href="#contact">Let’s Talk <i className="fa-solid fa-arrow-up-right-from-square" /></a>
          </div>
        </div>
      </header>
      <nav className="p-mobile-nav" aria-label="Mobile navigation">
        {menuItems.map(([id, label, icon]) => <a key={id} className={activeSection === id ? 'active' : ''} href={`#${id}`}><i className={`fa-solid ${icon}`} /><span>{label}</span></a>)}
      </nav>

      <main>
        <section id="home" className="p-hero">
          <div className="p-container p-hero-grid">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <span className="p-eyebrow">WELCOME TO MY PORTFOLIO</span>
              <h1>Hi, I’m <span>{p.full_name || 'Aman Jain'}</span></h1>
              <HeroRoleTypewriter />
              <RichText html={p.hero_intro || p.about_text || 'I build useful digital experiences by combining technology, design and practical problem solving.'} className="p-hero-rich-text" />
              <div className="p-actions mt-2">
                <a className="p-primary-btn" href="#projects">View Projects <i className="fa-solid fa-arrow-down" /></a>
                <a className="p-secondary-btn" href="#contact">Let’s Talk <i className="fa-solid fa-arrow-up-right-from-square" /></a>
              </div>
              <div className="p-socials">
                {data.social_links
                  .filter((social) => !/portfolio|website/i.test(String(social.label || '')))
                  .map((social) => <a key={social.id} href={social.url} target="_blank" rel="noreferrer" aria-label={social.label} title={social.label}><i className={social.icon_class || 'fa-solid fa-link'} /></a>)}
                <a className="p-resume-link" href="/Portfollio/assets/pdf/AmanJainResume.pdf" download="Aman-Jain-Resume.pdf" aria-label="Download Resume" title="Download Resume">
                  <i className="fa-solid fa-file-arrow-down" />
                </a>
              </div>
            </motion.div>
            <motion.div className="p-hero-visual" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }}>
              <div className="p-hero-tech-grid" aria-hidden="true" />
              <div className="p-hero-node node-one" aria-hidden="true" />
              <div className="p-hero-node node-two" aria-hidden="true" />
              <div className="p-hero-node node-three" aria-hidden="true" />
              <div className="p-orbit p-orbit-one" />
              <div className="p-orbit p-orbit-two" />
              <div className="p-hero-icon-cloud" aria-label="Portfolio capabilities">
                {[
                  ['fa-code', 'Coding', 'icon-coding'],
                  ['fa-chart-line', 'Data & Analytics', 'icon-analytics'],
                  ['fa-briefcase', 'Business', 'icon-business'],
                  ['fa-user-tie', 'Consulting', 'icon-consulting'],
                  ['fa-laptop-code', 'Developer', 'icon-developer'],
                  ['fa-handshake', 'Stakeholders', 'icon-relations'],
                  ['fa-train', 'Railway & Logistics', 'icon-railway'],
                  ['fa-plug', 'Technology Integration', 'icon-integration'],
                ].map(([icon, label, tone], i) => (
                  <span className={`p-hero-float-icon ${tone}`} key={label} style={{ '--icon-index': i }}>
                    <i className={`fa-solid ${icon}`} />
                    <small>{label}</small>
                  </span>
                ))}
              </div>
              {p.profile_image_url ? (
                <div
                  className="p-profile-card p-profile-mascot"
                  onMouseMove={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    const x = (event.clientX - rect.left) / rect.width - 0.5;
                    const y = (event.clientY - rect.top) / rect.height - 0.5;
                    event.currentTarget.style.setProperty('--mouse-x', x.toFixed(3));
                    event.currentTarget.style.setProperty('--mouse-y', y.toFixed(3));
                    event.currentTarget.classList.add('is-looking');
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.setProperty('--mouse-x', '0');
                    event.currentTarget.style.setProperty('--mouse-y', '0');
                    event.currentTarget.classList.remove('is-looking');
                  }}
                >
                  <div className="p-profile-mascot-inner">
                    <img src={p.profile_image_url} alt={p.full_name || 'Profile'} />
                    <span className="p-mascot-wave">Hello 👋</span>
                  </div>
                  <div className="p-profile-badge"><span />Available for opportunities</div>
                </div>
              ) : <div className="p-profile-card"><div className="p-profile-badge"><span />Available for opportunities</div></div>}
            </motion.div>
          </div>
        </section>

        <Section id="about" title="About Me" eyebrow="01 / PROFILE">
          <AboutScrollScene
            aboutText={p.about_text}
            techItems={[
              ['HTML5','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/html5.svg','#E55025'],
              ['CSS3','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/css3.svg','#1572B6'],
              ['Bootstrap','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/bootstrap5.svg','#7952B3'],
              ['JavaScript','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/javascript.svg','#F7DF1E'],
              ['jQuery','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/jQuery.svg','#0769AD'],
              ['PHP','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/php.svg','#777BB4'],
              ['SQL','Advanced',sqlIcon,'#00758F'],
              ['MySQL','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/mysql.svg','#4479A1'],
              ['Node.js','Intermediate','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/nodejs.svg','#68A063'],
              ['React.js','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/react.svg','#61DAFB'],
              ['Android','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/android.svg','#3DDC84'],
              ['Flutter','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/flutter.svg','#54C5F8'],
            ]}
          />
        </Section>

        <Section id="skills" title="Skills" eyebrow="02 / CAPABILITIES">
          <motion.div className="p-skills-motion-scene"
              initial={{ opacity: 0, y: 70, scale: .97, rotateX: 4 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              viewport={{ once: true, amount: .12 }}
              transition={{ duration: .9, ease: [0.22, 1, 0.36, 1] }}>
            <div className="p-about-scroll-progress p-skills-scroll-progress" aria-hidden="true">
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: .2 }}
                transition={{ duration: 1.1, delay: .15, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="p-skills-grid-bg" aria-hidden="true" />
            <div className="p-skills-scanline" aria-hidden="true" />
            <div className="p-skills-hud" aria-hidden="true">
              <span><i className="fa-solid fa-terminal" /> SKILLS://STACK</span>
              <span><i /> SYSTEM_READY</span>
            </div>
            <motion.div className="p-skills-intro" initial={{ opacity: 0, y: 45, filter: 'blur(6px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, amount: .35 }} transition={{ duration: .75, delay: .08, ease: [0.22, 1, 0.36, 1] }}>
              <span className="p-skills-kicker">DEVELOPER PROFILE</span>
            </motion.div>
            <div className="p-box-grid p-skills-capability-grid">
              {boxes.map((skill, i) => (
                <motion.article className="p-glass p-skill-box p-skill-capability-card" key={skill.id}
                  initial={{ opacity: 0, y: 45, rotateX: 18, scale: .94 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                  viewport={{ once: true, amount: .2 }}
                  transition={{ delay: i * .07, duration: .7, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -9, rotateX: -2, scale: 1.018 }}>
                  <span className="p-skill-card-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="p-skill-card-icon"><i className={skill.icon_class || 'fa-solid fa-code'} /></span>
                  <div className="p-skill-card-copy"><h3>{skill.name}</h3><p>{skill.description}</p></div>
                  <span className="p-skill-card-corner" aria-hidden="true" />
                </motion.article>
              ))}
            </div>
            <div className="p-skill-columns p-skills-data-grid">
              <motion.div className="p-glass p-skill-panel p-skills-terminal" initial={{ opacity: 0, x: -70, rotateY: 7 }} whileInView={{ opacity: 1, x: 0, rotateY: 0 }} viewport={{ once: true, amount: .18 }} transition={{ duration: .8, ease: [0.22, 1, 0.36, 1] }}>
                <div className="p-skills-panel-head">
                  <div><span className="p-terminal-dots"><i /><i /><i /></span><h3>Technical Skills</h3></div><code>skills.tech</code>
                </div>
                <div className="p-skills-tech-list">
                  {technical.map((skill, i) => (
                    <motion.div className="p-progress p-skills-progress" key={skill.id}
                      initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .4 }} transition={{ delay: i * .055, duration: .45 }}>
                      <div><span>{skill.name}</span><b><AnimatedNumber value={skill.percent} />%</b></div>
                      <span className="p-track"><motion.span initial={{ width: 0 }} whileInView={{ width: skill.percent + '%' }} viewport={{ once: true, amount: .45 }} transition={{ duration: 1, delay: i * .035, ease: [0.22, 1, 0.36, 1] }} /></span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div className="p-glass p-skill-panel p-skills-terminal p-skills-professional" initial={{ opacity: 0, x: 70, rotateY: -7 }} whileInView={{ opacity: 1, x: 0, rotateY: 0 }} viewport={{ once: true, amount: .18 }} transition={{ duration: .8, delay: .1, ease: [0.22, 1, 0.36, 1] }}>
                <div className="p-skills-panel-head">
                  <div><span className="p-terminal-dots"><i /><i /><i /></span><h3>Professional Skills</h3></div><code>skills.pro</code>
                </div>
                <div className="p-ring-grid">{professional.map((skill) => <ProfessionalRing key={skill.id} skill={skill} />)}</div>
              </motion.div>
            </div>
          </motion.div>
        </Section>

        <ProjectSection projects={data.projects} />

        <Section id="resume" title="Education & Work Experience" eyebrow="04 / JOURNEY">
          <JourneyMotionScene data={data} />
        </Section>

        <Section id="contact" title={p.contact_heading || 'Contact Form'} eyebrow="05 / CONNECT">
          <motion.div
            className="p-contact-motion-scene"
            initial={{ opacity: 0, y: 60, scale: .975 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: .12 }}
            transition={{ duration: .85, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="p-about-scroll-progress" aria-hidden="true">
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: .15 }}
                transition={{ duration: 1.1, delay: .1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="p-contact-hud" aria-hidden="true">
              <span><i className="fa-solid fa-terminal" /> CONTACT://CHANNEL</span>
              <span className="p-contact-status"><i /> READY_TO_CONNECT</span>
            </div>
            <div className="p-contact-grid p-contact-grid-motion">
              <motion.div
                className="p-contact-copy p-contact-copy-motion"
                initial={{ opacity: 0, x: -55, rotateY: 6 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true, amount: .2 }}
                transition={{ duration: .75, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="p-contact-kicker">OPEN FOR COLLABORATION</span>
                <h3>Let’s build something useful.</h3>
                <p>{p.contact_description}</p>
                <div className="p-contact-links p-contact-links-motion">
                  {p.phone && <motion.a className="p-contact-card p-contact-card-motion" href={`tel:${p.phone}`} whileHover={{ x: 5 }} transition={{ duration: .25 }}>
                    <span className="p-contact-card-icon p-contact-card-icon-motion"><i className="fa-solid fa-phone" /></span><span><small>Phone</small><strong>{p.phone}</strong></span>
                  </motion.a>}
                  {p.email && <motion.a className="p-contact-card p-contact-card-motion" href={`mailto:${p.email}`} whileHover={{ y: -3 }} transition={{ duration: .25 }}>
                    <span className="p-contact-card-icon p-contact-card-icon-motion"><i className="fa-solid fa-envelope" /></span><span><small>Email</small><strong>{p.email}</strong></span>
                  </motion.a>}
                  {(p.address || p.location) && (
                    <>
                      <motion.button
                        type="button"
                        className="p-contact-card p-contact-card-motion p-contact-address-trigger"
                        onClick={() => setContactMapOpen(true)}
                        whileHover={{ x: 5, rotateY: 2 }}
                        whileTap={{ scale: .985 }}
                        transition={{ duration: .25 }}
                        aria-haspopup="dialog"
                      >
                        <span className="p-contact-card-icon p-contact-card-icon-motion"><i className="fa-solid fa-location-dot" /></span>
                        <span><small>Address · View Location</small><strong>{p.address || p.location}</strong></span>
                        <i className="fa-solid fa-arrow-up-right-from-square p-contact-address-arrow" aria-hidden="true" />
                      </motion.button>

                      <AnimatePresence>
                        {contactMapOpen && (
                          <motion.div
                            className="p-contact-map-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Location map"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: .3 }}
                            onClick={() => setContactMapOpen(false)}
                          >
                            <motion.div
                              className="p-contact-map-modal-card"
                              initial={{ opacity: 0, y: 70, scale: .82, rotateX: 12, rotateY: -4 }}
                              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0, rotateY: 0 }}
                              exit={{ opacity: 0, y: 40, scale: .9, rotateX: -8 }}
                              transition={{ type: 'spring', stiffness: 150, damping: 18 }}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <div className="p-contact-map-modal-head">
                                <div>
                                  <small>LOCATION://MAP</small>
                                </div>
                                <button type="button" className="p-contact-map-close" onClick={() => setContactMapOpen(false)} aria-label="Close map">
                                  <i className="fa-solid fa-xmark" />
                                </button>
                              </div>
                              <div className="p-contact-map-modal-frame">
                                <div className="p-contact-map-scanline" aria-hidden="true" />
                                <iframe
                                  title="Bijainagar, Ajmer location map"
                                  src="https://www.google.com/maps?q=Parasnath%20Colony%2C%20Baral%20Road%2C%20Bijainagar%2C%20Ajmer%20-%20305624&output=embed"
                                  loading="lazy"
                                  referrerPolicy="no-referrer-when-downgrade"
                                />
                                <a
                                  className="p-contact-map-open"
                                  href="https://www.google.com/maps/search/?api=1&query=Parasnath%20Colony%2C%20Baral%20Road%2C%20Bijainagar%2C%20Ajmer%20-%20305624"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Open in Google Maps <i className="fa-solid fa-arrow-up-right-from-square" />
                                </a>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}

                </div>
              </motion.div>
              <motion.form
                className="p-glass p-contact-form p-contact-form-motion"
                onSubmit={submitContact}
                initial={{ opacity: 0, x: 55, rotateY: -6 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true, amount: .2 }}
                transition={{ duration: .75, delay: .08, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="p-form-grid"><input name="name" placeholder="Your name" required /><input name="email" type="email" placeholder="Email address" required /></div>
                <input name="subject" placeholder="Subject" /><textarea name="message" rows="7" placeholder="Tell me about your project…" required />
                <motion.button className="p-primary-btn p-contact-send" type="submit" whileHover={{ y: -3, scale: 1.015 }} whileTap={{ scale: .98 }}>
                  Send Message <i className="fa-solid fa-paper-plane" />
                </motion.button>
              </motion.form>
            </div>
          </motion.div>
        </Section>
      </main>
      <footer className="p-footer"><div className="p-container"><span>© 2026 All rights reserved by {p.full_name || 'Aman Jain'}</span></div></footer>
        </>
      )}
    </div>
  );
}

