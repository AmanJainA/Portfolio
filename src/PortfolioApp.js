import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import PortfolioHero from './components/ui/portfolio-hero';
import { db, supabase } from './supabase';
import './PortfolioApp.css';

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
    const pauseAfterTyping = 1800;
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
    <h3 className="p-hero-role-typewriter" aria-label={roles[roleIndex]}>
      <span>{text}</span><span className="p-hero-role-cursor" aria-hidden="true" />
    </h3>
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
    <div className="p-ring-wrap" ref={ref}>
      <motion.div
        className="p-ring"
        initial={{ '--pct': '0deg' }}
        animate={{ '--pct': inView ? (skill.percent * 3.6) + 'deg' : '0deg' }}
        transition={{ duration: .95, ease: [0.22, 1, 0.36, 1] }}
      >
        <strong>{display}%</strong>
      </motion.div>
      <span>{skill.name}</span>
    </div>
  );
}

function ProjectSection({ projects }) {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'PHP', 'Android', 'Flutter', 'React'];
  const filteredProjects = useMemo(() => {
    if (filter === 'All') return projects;
    return projects.filter((project) =>
      (project.tech_stack || []).some((tech) => {
        const value = String(tech).toLowerCase();
        if (filter === 'Android') return value.includes('android') || value.includes('flutter');
        return value.includes(filter.toLowerCase());
      })
    );
  }, [projects, filter]);

  return (
    <Section id="projects" title="My Projects" eyebrow="03 / SELECTED WORK">
      <div className="p-project-filters" role="tablist" aria-label="Project filters">
        {filters.map((item) => (
          <button key={item} type="button" role="tab" aria-selected={filter === item}
            className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>
            {item}
          </button>
        ))}
      </div>
      <motion.div layout className="p-project-grid">
        {filteredProjects.map((project, i) => (
          <motion.article layout className="p-project" key={project.id}
            initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.035 }} whileHover={{ y: -8 }}>
            <div className="p-project-image">
              {project.image_url ? <img src={project.image_url} alt={project.title} /> : <div className="p-project-placeholder"><i className="fa-solid fa-code" /></div>}
              {project.link && project.link !== '#' && (
                <a className="p-project-link" href={project.link} target="_blank" rel="noreferrer"
                  aria-label={'Open ' + project.title} title="Open project">
                  <i className="fa-solid fa-arrow-up-right-from-square" />
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
    </Section>
  );
}

function Section({ id, title, eyebrow, children }) {
  return (
    <section id={id} className="p-section">
      <div className="p-container">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55 }}>
          <span className="p-eyebrow">{eyebrow}</span>
          <h2 className="p-title">{title}</h2>
        </motion.div>
        {children}
      </div>
    </section>
  );
}

export default function PortfolioApp() {
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('portfolio_theme') || 'dark');
  const [activeSection, setActiveSection] = useState('home');
  const [showSplash, setShowSplash] = useState(true);

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
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('portfolio_theme', next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.dataset.portfolioTheme = theme;
    document.body.classList.toggle('portfolio-light-mode', theme === 'light');
    return () => document.body.classList.remove('portfolio-light-mode');
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
              <div className="p-actions">
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
              <div className="p-orbit p-orbit-one" />
              <div className="p-orbit p-orbit-two" />
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
          <div className="p-about-scrollscene">
            <div className="p-about-scroll-sticky">
              <motion.div
                className="p-glass p-about-immersive"
                initial={{ opacity: 0, scale: .96, rotateX: 5 }}
                whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: .7 }}
              >
                <div className="p-about-copy">
                  <span className="p-about-scroll-label">SCROLL TO EXPLORE</span>
                  <RichText html={p.about_text} className="p-about-rich-text" />
                </div>
                <div className="p-about-tech-field" aria-label="Technical skills">
                  <div className="p-about-tech-glow" />
                  {[
                    ['HTML5','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/html5.svg','#E55025'],
                    ['CSS3','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/css3.svg','#1572B6'],
                    ['Bootstrap','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/bootstrap5.svg','#7952B3'],
                    ['JavaScript','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/javascript.svg','#F7DF1E'],
                    ['jQuery','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/jQuery.svg','#0769AD'],
                    ['PHP','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/php.svg','#777BB4'],
                    ['MySQL','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/mysql.svg','#4479A1'],
                    ['Node.js','Intermediate','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/nodejs.svg','#68A063'],
                    ['React.js','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/react.svg','#61DAFB'],
                    ['Android','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/android.svg','#3DDC84'],
                    ['Flutter','Advanced','https://raw.githubusercontent.com/AmanJainA/Portfolio/main/src/images/tech-icons/flutter.svg','#54C5F8'],
                  ].map(([name, level, icon, color], i) => (
                    <motion.div
                      className="p-about-tech-card"
                      key={name}
                      style={{ '--tech-color': color }}
                      initial={{ opacity: 0, scale: .25, y: 100, rotateX: 80, rotateY: i % 2 ? -55 : 55, z: -220 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0, rotateX: 0, rotateY: 0, z: 0 }}
                      viewport={{ once: true, amount: 0.18 }}
                      transition={{ delay: i * .11, duration: .8, type: 'spring', stiffness: 90, damping: 14 }}
                      whileHover={{ y: -16, scale: 1.08, rotateX: -8, rotateY: i % 2 ? 9 : -9, z: 45 }}
                    >
                      <span className="p-about-tech-icon"><img src={icon} alt={name} /></span>
                      <strong>{name}</strong>
                      <small>{level}</small>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </Section>

        <Section id="skills" title="Skills" eyebrow="02 / CAPABILITIES">
          <div className="p-box-grid">
            {boxes.map((s, i) => <motion.article className="p-glass p-skill-box" key={s.id} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} whileHover={{ y: -6 }}>
              <i className={s.icon_class || 'fa-solid fa-code'} />
              <h3>{s.name}</h3><p>{s.description}</p>
            </motion.article>)}
          </div>
          <div className="p-skill-columns">
            <motion.div className="p-glass p-skill-panel" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: .55 }}>
              <h3>Technical Skills</h3>
              {technical.map((s) => <div className="p-progress" key={s.id}>
                <div><span>{s.name}</span><b><AnimatedNumber value={s.percent} />%</b></div>
                <span className="p-track"><motion.span initial={{ width: 0 }} whileInView={{ width: s.percent + '%' }} viewport={{ once: true, amount: 0.45 }} transition={{ duration: .95, ease: [0.22, 1, 0.36, 1] }} /></span>
              </div>)}
            </motion.div>
            <motion.div className="p-glass p-skill-panel" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: .55, delay: .08 }}>
              <h3>Professional Skills</h3>
              <div className="p-ring-grid">{professional.map((s) => <ProfessionalRing key={s.id} skill={s} />)}</div>
            </motion.div>
          </div>
        </Section>

        <ProjectSection projects={data.projects} />

        <Section id="resume" title="Education & Work Experience" eyebrow="04 / JOURNEY">
          <div className="p-journey-timeline">
            <div className="p-journey-head">
              <h3>Education</h3><span /><h3>Work Experience</h3>
            </div>
            <div className="p-journey-line" aria-hidden="true" />
            {Array.from({ length: Math.max(data.education.length, data.experience.length) }).map((_, i) => {
              const education = data.education[i];
              const experience = data.experience[i];
              return (
                <div className="p-journey-row" key={education?.id || experience?.id || i}>
                  <div className="p-journey-side p-journey-education">
                    {education && <motion.article className="p-journey-card p-journey-card-left"
                      initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: .25 }} transition={{ duration: .55 }}>
                      <span>{education.period}</span><h3>{education.title}</h3><b>{education.location}</b>
                      {(education.details || []).map(d => <p key={d}>{d}</p>)}
                    </motion.article>}
                  </div>
                  <div className="p-journey-dot" aria-hidden="true" />
                  <div className="p-journey-side p-journey-experience mb-2">
                    {experience && <motion.article className="p-journey-card p-journey-card-right"
                      initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: .25 }} transition={{ duration: .55 }}>
                      <span>{experience.period}</span><h3>{experience.title}</h3><b>{experience.company}</b>
                      {(experience.details || []).map(d => <p key={d}>{d}</p>)}
                    </motion.article>}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section id="contact" title={p.contact_heading || 'Contact Form'} eyebrow="05 / CONNECT">
          <div className="p-contact-grid">
            <div className="p-contact-copy">
              <h3>Let’s build something useful.</h3>
              <p>{p.contact_description}</p>
              <div className="p-contact-links">
                {p.phone && <a className="p-contact-card" href={`tel:${p.phone}`}><span className="p-contact-card-icon"><i className="fa-solid fa-phone" /></span><span><small>Phone</small><strong>{p.phone}</strong></span></a>}
                {p.email && <a className="p-contact-card" href={`mailto:${p.email}`}><span className="p-contact-card-icon"><i className="fa-solid fa-envelope" /></span><span><small>Email</small><strong>{p.email}</strong></span></a>}
                {(p.address || p.location) && <div className="p-contact-card"><span className="p-contact-card-icon"><i className="fa-solid fa-location-dot" /></span><span><small>Address</small><strong>{p.address || p.location}</strong></span></div>}
              </div>
            </div>
            <form className="p-glass p-contact-form" onSubmit={submitContact}>
              <div className="p-form-grid"><input name="name" placeholder="Your name" required /><input name="email" type="email" placeholder="Email address" required /></div>
              <input name="subject" placeholder="Subject" /><textarea name="message" rows="7" placeholder="Tell me about your project…" required /><button className="p-primary-btn" type="submit">Send Message <i className="fa-solid fa-paper-plane" /></button>
            </form>
          </div>
        </Section>
      </main>
      <footer className="p-footer"><div className="p-container"><span>© 2026 All rights reserved by {p.full_name || 'Aman Jain'}</span></div></footer>
        </>
      )}
    </div>
  );
}
