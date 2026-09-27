import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import PortfolioHero from './components/ui/portfolio-hero';
import { db } from './supabase';
import './PortfolioApp.css';

const emptyData = { profile: null, languages: [], skills: [], projects: [], education: [], experience: [], social_links: [] };

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
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get('name'),
      email: form.get('email'),
      subject: form.get('subject'),
      message: form.get('message'),
      source: 'portfolio-site',
    };
    const { error: insertError } = await db.from('contact').insert(payload);
    if (insertError) {
      alert(insertError.message);
      return;
    }
    try {
      const api = window.location.hostname === 'localhost' ? 'http://localhost:5000/send' : null;
      if (api) await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } catch (_) {}
    e.currentTarget.reset();
    alert('Message sent successfully.');
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
            <button className="p-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}><i className={theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'} /></button>
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
              <h3>{p.hero_role || 'Creative Developer & Professional'}</h3>
              <p>{p.hero_intro || p.about_text || 'I build useful digital experiences by combining technology, design and practical problem solving.'}</p>
              <div className="p-actions">
                <a className="p-primary-btn" href="#projects">View Projects <i className="fa-solid fa-arrow-down" /></a>
                <a className="p-secondary-btn" href="#contact">Let’s Talk <i className="fa-solid fa-arrow-up-right-from-square" /></a>
              </div>
              <div className="p-socials">
                {data.social_links.map((social) => <a key={social.id} href={social.url} target="_blank" rel="noreferrer" aria-label={social.label} title={social.label}><i className={social.icon_class || 'fa-solid fa-link'} /></a>)}
              </div>
            </motion.div>
            <motion.div className="p-hero-visual" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }}>
              <div className="p-orbit p-orbit-one" />
              <div className="p-orbit p-orbit-two" />
              {p.profile_image_url ? <div className="p-profile-card"><img src={p.profile_image_url} alt={p.full_name || 'Profile'} /><div className="p-profile-badge"><span />Available for opportunities</div></div> : <div className="p-profile-card"><div className="p-profile-badge"><span />Available for opportunities</div></div>}
            </motion.div>
          </div>
        </section>

        <Section id="about" title="About Me" eyebrow="01 / PROFILE">
          <div className="p-about-grid">
            <motion.div className="p-glass p-about-copy" initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p>{p.about_text}</p>
              <div className="p-meta-grid">
                <div><span>Location</span><strong>{p.location || 'India'}</strong></div>
                <div><span>Email</span><strong>{p.email || '—'}</strong></div>
                <div><span>Role</span><strong>{p.hero_role || '—'}</strong></div>
              </div>
            </motion.div>
            <div className="p-language-grid">
              {data.languages.map((l, i) => <motion.div className="p-language" key={l.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                {l.icon_url ? <img src={l.icon_url} alt={l.name} /> : <i className={l.icon_class || 'fa-solid fa-code'} />}
                <div><strong>{l.name}</strong><small>{l.level || 'Skill'}</small></div>
              </motion.div>)}
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
            <div className="p-glass p-skill-panel"><h3>Technical Skills</h3>{technical.map((s) => <div className="p-progress" key={s.id}><div><span>{s.name}</span><b>{s.percent}%</b></div><span className="p-track"><span style={{ width: `${s.percent}%` }} /></span></div>)}</div>
            <div className="p-glass p-skill-panel"><h3>Professional Skills</h3><div className="p-ring-grid">{professional.map((s) => <div className="p-ring-wrap" key={s.id}><div className="p-ring" style={{ '--pct': `${s.percent * 3.6}deg` }}><strong>{s.percent}%</strong></div><span>{s.name}</span></div>)}</div></div>
          </div>
        </Section>

        <Section id="projects" title="My Projects" eyebrow="03 / SELECTED WORK">
          <div className="p-project-grid">
            {data.projects.map((project, i) => <motion.article className="p-project" key={project.id} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.035 }} whileHover={{ y: -8 }}>
              <div className="p-project-image"><img src={project.image_url} alt={project.title} /><a href={project.link} target="_blank" rel="noreferrer"><i className="fa-solid fa-arrow-up-right-from-square" /></a></div>
              <div className="p-project-body"><span className="p-project-no">{String(i + 1).padStart(2,'0')}</span><h3>{project.title}</h3><p>{project.summary}</p><div className="p-tech-row">{(project.tech_stack || []).map((t) => <span key={t}>{t}</span>)}</div></div>
            </motion.article>)}
          </div>
        </Section>

        <Section id="resume" title="Education & Work Experience" eyebrow="04 / JOURNEY">
          <div className="p-timeline-grid">
            <div><h3 className="p-column-title">Education</h3>{data.education.map((x) => <motion.article className="p-timeline-card" key={x.id} initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}><span>{x.period}</span><h3>{x.title}</h3><b>{x.location}</b>{(x.details || []).map(d => <p key={d}>{d}</p>)}</motion.article>)}</div>
            <div><h3 className="p-column-title">Work Experience</h3>{data.experience.map((x) => <motion.article className="p-timeline-card" key={x.id} initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}><span>{x.period}</span><h3>{x.title}</h3><b>{x.company}</b>{(x.details || []).map(d => <p key={d}>{d}</p>)}</motion.article>)}</div>
          </div>
        </Section>

        <Section id="contact" title={p.contact_heading || 'Contact Form'} eyebrow="05 / CONNECT">
          <div className="p-contact-grid">
            <div className="p-contact-copy"><h3>Let’s build something useful.</h3><p>{p.contact_description}</p><div className="p-contact-links">{p.email && <a href={`mailto:${p.email}`}><i className="fa-solid fa-envelope" />{p.email}</a>}{p.phone && <a href={`tel:${p.phone}`}><i className="fa-solid fa-phone" />{p.phone}</a>}</div></div>
            <form className="p-glass p-contact-form" onSubmit={submitContact}>
              <div className="p-form-grid"><input name="name" placeholder="Your name" required /><input name="email" type="email" placeholder="Email address" required /></div>
              <input name="subject" placeholder="Subject" /><textarea name="message" rows="7" placeholder="Tell me about your project…" required /><button className="p-primary-btn" type="submit">Send Message <i className="fa-solid fa-paper-plane" /></button>
            </form>
          </div>
        </Section>
      </main>
      <footer className="p-footer"><div className="p-container"><span>© {new Date().getFullYear()} {p.full_name || 'Aman Jain'}</span><span>Designed with Motion + modern UX principles</span></div></footer>
        </>
      )}
    </div>
  );
}
