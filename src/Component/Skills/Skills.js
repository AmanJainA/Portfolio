import React, { useEffect, useRef, useState } from 'react';
import './Skills.css';
import { technicalSkills, professionalSkills, skillBoxes } from './SkillsData';

function ProgressBar({ name, percent, onVisible }) {
  const barRef = useRef(null);

  useEffect(() => {
    if (!barRef.current) return;
    const bar = barRef.current;
    bar.style.width = '0%'; // Start from 0

    if (onVisible) {
      onVisible(bar, percent);
    }
  }, [percent, onVisible]);

  return (
    <div className="skill-bar mb-3" aria-label={`${name} skill level ${percent}%`}>
      <div className="d-flex justify-content-between">
        <span>{name}</span>
        <span>{percent}%</span>
      </div>
      <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100">
        <div
          className="my-progress-bar"
          data-progress={percent}
          ref={barRef}
          style={{ transition: 'width 2s ease' }}
        ></div>
      </div>
    </div>
  );
}

function CircularProgress({ label, percent, onVisible }) {
  const circRef = useRef(null);
  const [animated, setAnimated] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!circRef.current) return;
    if (animated) return; // only animate once

    if (onVisible) {
      onVisible(circRef.current, percent, setCurrent, () => setAnimated(true));
    }
  }, [percent, animated, onVisible]);

  return (
    <div
      className="circular-progress mx-auto"
      data-percentage={percent}
      ref={circRef}
      aria-label={`${label} skill level ${percent}%`}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin="0"
      aria-valuemax="100"
      style={{
        background: `conic-gradient(#e6e6e6 0deg, #e6e6e6 360deg)`,
      }}
    >
      <span className="progress-value">{current}%</span>
      <span className="label">{label}</span>
    </div>
  );
}

function Skills() {
  // Animate horizontal progress bar by setting width
  const animateProgressBar = (element, percent) => {
    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          element.style.width = `${percent}%`;
          obs.unobserve(element);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(element);
  };

  // Animate circular progress with requestAnimationFrame
  const animateCircularProgress = (element, percent, setCurrent, setAnimated) => {
    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          let currentValue = 0;
          const step = () => {
            if (currentValue <= percent) {
              setCurrent(currentValue);
              element.style.background = `conic-gradient(
                #00cba9 ${currentValue * 3.6}deg,
                #e6e6e6 ${currentValue * 3.6}deg
              )`;
              currentValue++;
              requestAnimationFrame(step);
            } else {
              setAnimated(true);
            }
          };
          step();
          obs.unobserve(element);
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(element);
  };

  return (
    <section id="skills" className="skills-section section mx-auto py-5" data-aos="fade-up">
      <div className="container">
        <h3 className="section-heading text-center mb-5" data-aos="zoom-in">
          Skills
        </h3>

        <div className="row g-4 justify-content-center">
          {skillBoxes.map(({ icon, title, description }, index) => (
            <div
              key={title}
              className="col-md-6 col-lg-4 text-center"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="skill-box">
                <i className={`bi ${icon} skill-icon mb-3 fs-1`}></i>
                <h5 className="fw-bold mb-2">{title}</h5>
                <p>{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="container">
          <div className="row mt-5">
            {/* Technical Skills Progress Bars */}
            <div className="col-md-6" data-aos="fade-right">
              <h4 className="fw-bold mb-4">Technical Skills</h4>
              {technicalSkills.map(({ name, percent }) => (
                <ProgressBar
                  key={name}
                  name={name}
                  percent={percent}
                  onVisible={animateProgressBar}
                />
              ))}
            </div>

            {/* Professional Skills Circular Progress */}
            <div className="col-md-6 text-center" data-aos="fade-left">
              <h4 className="fw-bold mb-4">Professional Skills</h4>
              <div className="row justify-content-center mt-5 mb-5">
                {professionalSkills.map(({ label, percent }) => (
                  <div className="col-6 col-sm-6 col-md-6 mt-4 mb-5" key={label}>
                    <CircularProgress
                      label={label}
                      percent={percent}
                      onVisible={animateCircularProgress}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Skills;
