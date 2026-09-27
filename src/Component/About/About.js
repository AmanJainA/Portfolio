import React from "react";
import techSkills from "./techSkillsData";

const About = () => {
  return (
    <section id="about" className="featured-projects-section section mx-auto py-5">
      {/* Section heading */}
      <h3 className="section-heading mb-4" data-aos="fade-up">
        About Me
      </h3>

      {/* Intro text */}
      <div
        className="section-intro mb-4 limit-max-width mx-auto text-md-center"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        Hi! I'm a motivated and detail-oriented Full Stack Developer with 5 years
        of experience in web and mobile development. I specialize in building
        responsive, secure, and scalable applications using technologies like PHP,
        React.js, Node.js, Flutter, MySQL, and more. I hold a Master's in Computer
        Applications (MCA) and have worked on a variety of enterprise-level projects.
      </div>

      {/* Tech skills grid */}
      <div className="row tech-list justify-content-center align-items-center">
        {techSkills.map(({ src, alt, delay, level }) => (
          <div
            key={alt}
            className="icon-item col-4 col-md-3 col-lg-2 mb-4 mt-4 mb-lg-5 text-center"
            data-aos="zoom-in"
            data-aos-delay={delay}
            style={{ cursor: "default" }}
            title={`${alt} — Skill`}
            // title={`${alt} — Skill Level: ${level}`}
          >
            <img
              className="rounded tech-icon"
              src={src}
              alt={alt}
              loading="lazy"
              style={{
                transition: "transform 0.3s ease",
                maxWidth: "55px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
            <div style={{ fontSize: "0.8rem", marginTop: "5px" }}>{level}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default About;
