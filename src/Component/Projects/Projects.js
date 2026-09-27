import React, { useState } from 'react';
import { projects } from './projectsData';
import './Projects.css';
import android from '../../images/tech-icons/android.svg';
import html5 from '../../images/tech-icons/html5.svg';
import bootstrap5 from '../../images/tech-icons/bootstrap5.svg';
import css3 from '../../images/tech-icons/css3.svg';
import javascript from '../../images/tech-icons/javascript.svg';
import php from '../../images/tech-icons/php.svg';
import mysql from '../../images/tech-icons/mysql.svg';
import jquery from '../../images/tech-icons/jQuery.svg';
import flutter from '../../images/tech-icons/flutter.svg';
import restApi from '../../images/tech-icons/rest-api.svg';
import dart from '../../images/tech-icons/dart.svg';
import sql from '../../images/tech-icons/sql.svg';

// Map tech names to imported icons
const techIconMap = {
  android,
  html5,
  css3,
  bootstrap5,
  javascript,
  php,
  mysql,
  jquery,
  flutter,
  'rest-api': restApi,
  dart,
  sql,
};
function Projects() {
  const [selectedTech, setSelectedTech] = useState('All');

  // Define static tech filters
  const techFilters = ['All', 'PHP', 'Android', 'Flutter'];

  // Filter projects based on selected tech
  const filteredProjects =
    selectedTech === 'All'
      ? projects
      : projects.filter(project =>
        project.tech.some(tech =>
          tech.toLowerCase().includes(selectedTech.toLowerCase())
        )
      );

  return (
    <section id="projects" className="projects-section section mx-auto py-5" data-aos="fade-up">
      <div className="intro-holder text-center mb-4">
        <h2 className="intro-name" data-aos="zoom-in">My Projects</h2>

        {/* Static Tech Filter Buttons */}
        <div className="tech-filter mt-4">
          {techFilters.map((tech, index) => (
            <button
              key={index}
              className={`btn btn-sm me-2 mb-2 ${selectedTech === tech ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedTech(tech)}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>

      <div className="row gx-4 gy-5 justify-content-center">
        {filteredProjects.map((project, index) => (
          <div key={index} className="col-12 col-md-6 col-lg-4" data-aos="fade-up">
            <div className="project-card position-relative shadow rounded-3 overflow-hidden">
              <div className="project-image-wrapper position-relative">
                <img src={project.image} alt={project.title} className="w-100 project-image" />
                <div className="overlay d-flex align-items-center justify-content-center">
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="icon-link">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      fill="none"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M10 13a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
                      <path d="M14 11a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
                    </svg>
                  </a>
                </div>
                <div className="project-title-overlay p-2 text-white position-absolute bottom-0 w-100">
                  <h5 className="mb-0">{project.title}</h5>
                </div>
              </div>

              <div className="p-3">
                <p className="project-summary">{project.summary}</p>
                <h6 className="mb-2">Tech Stack:</h6>
                <ul className="tech-stack list-inline mb-0">
                {project.tech.map((tech, i) => {
                    const iconSrc = techIconMap[tech.toLowerCase()];
                    if (!iconSrc) return null;
                    return (
                      <li key={i} className="list-inline-item me-1">
                        <img src={iconSrc} alt={tech.toLowerCase()} className="tech-icon1" />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Projects;
