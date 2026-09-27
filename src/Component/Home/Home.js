import React from "react";
import profilePic from '../../images/profile.png'; 

const Home = () => {
  return (
    <section
      className="page-intro-section section has-profile-image mx-auto py-5"
      id="home"
    >
      <div className="row align-items-center w-100">
        <div
          className="col-md-6 position-relative d-flex justify-content-center mb-4 mb-md-0"
          data-aos="fade-right"
        >
          <div className="position-relative">
            <img
              src={profilePic}
              alt="Aman Jain Profile"
              className="profile-img" style={{ height: "280px" }}
            />
            {/* <img
              src="assets/images/tech-icons/figma.svg"
              alt="Figma Icon"
              className="badge-icon fig"
            />
            <img
              src="assets/images/tech-icons/photoshop.svg"
              alt="Photoshop Icon"
              className="badge-icon ps"
            /> */}
          </div>
        </div>

        <div
          className="intro-holder col-md-6 text-center text-md-start"
          data-aos="fade-left"
        >
          <div className="intro-label animate__animated animate__fadeInDown">
            Hi, I’m
          </div>

          <div className="intro-name animate__animated animate__fadeInUp animate__delay-1s">
            Aman Jain!
          </div>

          <div className="hero-role animate__animated animate__fadeInUp animate__delay-2s">
            Full Stack Developer
          </div>

          <p className="profile-intro limit-max-width mx-auto animate__animated animate__fadeInUp animate__delay-3s">
            Building modern web and mobile solutions with clean, scalable code.
          </p>

          <a
            href={`${process.env.PUBLIC_URL}/assets/pdf/AmanJainResume.pdf`}
            className="btn btn-secondary theme-btn-cta mt-3 mb-3 animate__animated animate__fadeInUp animate__delay-4s"
            download
          >
            <i className="fa-solid fa-download me-2"></i>Download CV
          </a>
        </div>
      </div>
    </section>
  );
};

export default Home;
