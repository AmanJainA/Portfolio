import React from "react";

const Footer = () => {
  return (
    <footer
      className="footer text-center py-5"
      data-aos="fade-up"
      data-aos-delay="200"
    >
      <small className="copyright">
        &copy; {new Date().getFullYear()} All rights reserved by Aman Jain
      </small>
    </footer>
  );
};

export default Footer;
