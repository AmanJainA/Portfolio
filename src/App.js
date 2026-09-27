import './App.css';
import Home from './Component/Home/Home';
import About from './Component/About/About';
import Skills from './Component/Skills/Skills';
import Resume from './Component/Resume/Resume';
import Projects from './Component/Projects/Projects';
import Contact from './Component/Contact/Contact';
import Footer from './Component/Footer/Footer';
import useScrollSpy from './Hooks/useScrollSpy';
import useTheme from './Hooks/useTheme';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  useScrollSpy(); 
  useTheme(); 

  return (
    <div className="App">
      <div className="container-fluid">
        {/* Sidebar Navigation */}
        <div className="side-panel position-relative">
          <nav className="navbar">
            <div
              className="offcanvas offcanvas-start show d-flex"
              id="offcanvasNavbar"
              data-bs-scroll="true"
              data-bs-backdrop="false"
              tabIndex="-1"
              aria-labelledby="offcanvasNavbarLabel"
            >
              <div className="offcanvas-body d-flex align-items-center">
                <ul className="main-nav navbar-nav text-center">
                  {[
                    { id: 'home', icon: 'fa-house', label: 'Home' },
                    { id: 'about', icon: 'fa-circle-user', label: 'About' },
                    { id: 'skills', icon: 'fa-laptop-code', label: 'Skills' },
                    { id: 'projects', icon: 'fa-briefcase', label: 'Projects' },
                    { id: 'resume', icon: 'fa-user-graduate', label: 'Resume' },
                    { id: 'contact', icon: 'fa-comment-dots', label: 'Contact' },
                  ].map(({ id, icon, label }, i) => (
                    <li className="nav-item" data-aos="fade-right" data-aos-delay={i * 50} key={id}>
                      <a className="nav-link d-flex flex-column" href={`#${id}`}>
                        <span className="icon-holder">
                          <i className={`fa-solid ${icon}`}></i>
                        </span>
                        <span className="nav-text">{label}</span>
                      </a>
                    </li>
                  ))}
                  <li className="nav-item nav-item-close">
                    <button className="btn-close" data-bs-dismiss="offcanvas" type="button" aria-label="Close">
                      <i className="bi bi-x"></i>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="main-content-wrapper">
          <div className="container-fluid">
            <div className="top-bar text-center position-relative" data-aos="fade-down">
              <div className="top-bar-inner">
                <a
                  className="menu-toggler"
                  data-bs-toggle="offcanvas"
                  href="#offcanvasNavbar"
                  role="button"
                  aria-controls="offcanvasNavbar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor"
                    className="bi bi-list" viewBox="0 0 16 16">
                    <path fillRule="evenodd"
                      d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
                  </svg>
                </a>

                <div className="mode-toggle text-center">
                  <input className="toggle" id="darkmode" type="checkbox" />
                  <label className="toggle-btn mx-auto mb-0" htmlFor="darkmode">
                    <span className="day-icon toggle-icon"><i className="bi bi-sun-fill"></i></span>
                    <span className="night-icon toggle-icon"><i className="bi bi-moon-fill"></i></span>
                  </label>
                </div>
                <a className="btn btn-primary top-bar-cta" href="#contact">Hire Me</a>
                <ul className="social-list list-inline mx-auto d-none d-lg-block">
                  <li className="list-inline-item"><a href="https://x.com/amanamanjain033"><i className="fa-brands fa-x-twitter fa-fw"></i></a></li>
                  <li className="list-inline-item"><a href="https://github.com/amanjaina"><i className="fa-brands fa-github fa-fw"></i></a></li>
                  <li className="list-inline-item"><a href="https://www.linkedin.com/in/aman-jain-269684184"><i className="fa-brands fa-linkedin-in fa-fw"></i></a></li>
                  <li className="list-inline-item"><a href="mailto:amanjain033@email.com"><i className="fa-solid fa-envelope fa-fw"></i></a></li>
  <li className="list-inline-item"><a href={`${process.env.PUBLIC_URL}/assets/pdf/AmanJainResume.pdf`} download><i className="fa-solid fa-file-lines fa-fw"></i></a></li>
                  {/* <li className="list-inline-item"><a href="#"><i className="fa-brands fa-stack-overflow fa-fw"></i></a></li>
                  <li className="list-inline-item"><a href="#"><i className="fa-brands fa-medium fa-fw"></i></a></li> */}
                </ul>
              </div>
            </div>

            {/* Page Sections with IDs */}
            <section id="home"><Home /></section>
            <section id="about"><About /></section>
            <section id="skills"><Skills /></section>
            <section id="projects"><Projects /></section>
            <section id="resume"><Resume /></section>
            <section id="contact"><Contact /></section>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
