import React from 'react';
import { FaEnvelope, FaPhone, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { useTheme } from '../ThemeContext';

const Footer = () => {
  const { theme } = useTheme();

  // Define footer classes with matching background color
  const footerClasses = `py-5 ${theme === 'dark' ? 'bg-dark text-white' : 'bg-primary text-white'}`;
  const iconClasses = `fa-2x mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-light'}`;
  const linkClasses = `text-${theme === 'dark' ? 'white' : 'light'} text-decoration-none`;

  return (
    <>
      <footer className={footerClasses}>
        <div className="container">
          <div className="row justify-content-center mb-4">
            {/* Contact Us Section */}
            <div className="col-lg-3 text-center">
              <h4 className={`text-${theme === 'dark' ? 'white' : 'light'}`}>Contact Us</h4>
              <FaPhone className={iconClasses} />
              <div className={`text-${theme === 'dark' ? 'white' : 'light'}`}>+251-46881-4986</div>
              <FaEnvelope className={iconClasses} />
              <a className={linkClasses} href="mailto:mail@amu.edu.et">mail@amu.edu.et</a>
            </div>

            {/* Quick Links Section */}
            <div className="col-lg-3 text-center">
              <h4 className={`text-${theme === 'dark' ? 'white' : 'light'}`}>Quick Links</h4>
              <ul className="list-unstyled">
                <li><a className={linkClasses} href="/about">About Us</a></li>
                <li><a className={linkClasses} href="/events">Events</a></li>
                <li><a className={linkClasses} href="/jobs">Jobs</a></li>
              </ul>
            </div>

            {/* FAQ Section */}
            <div className="col-lg-3 text-center">
              <h4 className={`text-${theme === 'dark' ? 'white' : 'light'}`}>FAQs</h4>
              <ul className="list-unstyled">
  <li><a className={linkClasses} href="/faq/post-job">How can I post a job?</a></li>
  <li><a className={linkClasses} href="/faq/post-event">How do I post an event?</a></li>
  <li><a className={linkClasses} href="/faq/contact-support">How can I contact support?</a></li>
</ul>
            </div>

            {/* Follow Us Section */}
            <div className="col-lg-3 text-center">
              <h4 className={`text-${theme === 'dark' ? 'white' : 'light'}`}>Follow Us</h4>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="mx-2">
                <FaFacebook className={iconClasses} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="mx-2">
                <FaTwitter className={iconClasses} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="mx-2">
                <FaLinkedin className={iconClasses} />
              </a>
            </div>
          </div>

          {/* Divider */}
          <hr className={`divider my-4 ${theme === 'dark' ? 'bg-gray-500' : 'bg-light'}`} />

          {/* Footer Bottom Text */}
          <div className="row">
            <div className="col text-center">
              <small className={`text-${theme === 'dark' ? 'gray-400' : 'light'}`}>
                Copyright © 2025 - AMU Alumni Management System
              </small>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;