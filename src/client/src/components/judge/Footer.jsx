import React from "react";
import { Link } from "react-router-dom";
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
              <Link to="/about">Our Mission</Link>
            </li>
            <li>
              <Link to="/team">Team</Link>
            </li>
            <li>
              <Link to="/careers">Careers</Link>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Support</h4>
          <ul className="footer-links">
            <li>
              <Link to="/faqs">FAQs</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/help">Help Center</Link>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Legal</h4>
          <ul className="footer-links">
            <li>
              <Link to="/terms">Terms of Service</Link>
            </li>
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/cookies">Cookie Policy</Link>
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
