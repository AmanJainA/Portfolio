import React from 'react';
import './Resume.css';
import { educationData, experienceData } from './resumeData'; // adjust the path as needed

const TimelineItem = ({ time, location, title, details, direction, delay }) => (
  <article
    className="resume-timeline-item position-relative pb-5"
    data-aos={`fade-${direction}`}
    data-aos-delay={delay}
  >
    <div className="resume-timeline-item-header mb-2">
      <div className="resume-position-meta d-flex justify-content-between mb-1">
        <div className="resume-position-time">{time}</div>
        <div className="resume-company-name">{location}</div>
      </div>
      <h3 className="resume-position-title mb-1">{title}</h3>
    </div>
    <div className="resume-timeline-item-desc text-start">
      <ul className="resume-timeline-list">
        {details.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  </article>
);

const Resume = () => {
  return (
    <section id="resume" className="page-intro-section section mx-auto">
      <div className="row g-1 justify-content-center">

        {/* Education Section */}
        <div className="post-item col-12 col-md-6 col-lg-6">
          <div className="post-item-inner d-flex flex-column">
            <section className="resume-education-section resume-section">
              <h3 className="resume-section-heading text-uppercase py-2 py-lg-3" data-aos="fade-up">
                <i className="resume-section-heading-icon bi bi-book me-2"></i>
                Education
              </h3>
              <div className="resume-timeline position-relative">
                {educationData.map((item, index) => (
                  <TimelineItem key={index} {...item} />
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Experience Section */}
        <div className="post-item col-12 col-md-6 col-lg-6">
          <div className="post-item-inner d-flex flex-column">
            <section className="resume-experience-section resume-section">
              <h3 className="resume-section-heading text-uppercase py-2 py-lg-3" data-aos="fade-up">
                <i className="resume-section-heading-icon bi bi-briefcase me-2"></i>
                Work Experience
              </h3>
              <div className="resume-timeline position-relative">
                {experienceData.map((item, index) => (
                  <TimelineItem key={index} {...item} />
                ))}
              </div>
            </section>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Resume;
