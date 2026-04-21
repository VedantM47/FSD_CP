import React from 'react';
import { Link } from 'react-router-dom';
import { CiLinkedin, CiTwitter, CiMail, } from 'react-icons/ci'
import { FaGithub, FaArrowRight } from 'react-icons/fa';
import '../../styles/footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <h2>HackHub</h2>
                    <p>
                        The comprehensive platform to Discover, Manage, and Compete in hackathons worldwide.
                        Join thousands of innovators building the future.
                    </p>
                </div>

                <div className="footer-column">
                    <h3>Platform</h3>
                    <nav className="footer-nav">
                        <Link to="/discovery" className="footer-link">
                            <FaArrowRight size={16} /> Browse Hackathons
                        </Link>
                        <Link to="/calendar" className="footer-link">
                            <FaArrowRight size={16} /> Events Calendar
                        </Link>
                        <Link to="/organizer/dashboard" className="footer-link">
                            <FaArrowRight size={16} /> Host an Event
                        </Link>
                    </nav>
                </div>

                <div className="footer-column">
                    <h3>Resources</h3>
                    <nav className="footer-nav">
                        <Link to="/about" className="footer-link">
                            <FaArrowRight size={16} /> About Us
                        </Link>
                        <Link to="/faqs" className="footer-link">
                            <FaArrowRight size={16} /> FAQs
                        </Link>
                        <Link to="/contact" className="footer-link">
                            <FaArrowRight size={16} /> Support
                        </Link>
                        <Link to="/terms" className="footer-link">
                            <FaArrowRight size={16} /> Terms & Privacy
                        </Link>
                    </nav>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} HackHub. All rights reserved.</p>
                <div className="social-links">
                    <a href="#" className="social-icon"><FaGithub size={20} /></a>
                    <a href="#" className="social-icon"><CiTwitter size={20} /></a>
                    <a href="#" className="social-icon"><CiLinkedin size={20} /></a>
                    <a href="#" className="social-icon"><CiMail size={20} /></a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
