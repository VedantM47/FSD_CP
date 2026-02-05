import React from "react";
import "../../styles/judge.css";
import "../../styles/judge-additional.css";

const Footer = () => {
  return (
    <footer className="judge-footer">
      <div className="footer-content">
        <div className="footer-column">
          <h3 className="footer-title">HackHub</h3>
          <p className="footer-description">
            Connecting innovators through hackathons worldwide.
          </p>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">About</h4>
          <ul className="footer-links">
            <li>
              <a href="#">Our Mission</a>
            </li>
            <li>
              <a href="#">Team</a>
            </li>
            <li>
              <a href="#">Careers</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Support</h4>
          <ul className="footer-links">
            <li>
              <a href="#">FAQs</a>
            </li>
            <li>
              <a href="#">Contact</a>
            </li>
            <li>
              <a href="#">Help Center</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Legal</h4>
          <ul className="footer-links">
            <li>
              <a href="#">Terms of Service</a>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
            <li>
              <a href="#">Cookie Policy</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 HackHub. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
