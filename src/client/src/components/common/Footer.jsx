import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand font-bold text-lg">HackHub</div>
                <nav className="footer-nav">
                    <Link to="/about" className="footer-link">About</Link>
                    <Link to="/faqs" className="footer-link">FAQs</Link>
                    <Link to="/contact" className="footer-link">Contact</Link>
                    <Link to="/terms" className="footer-link">Terms & Privacy</Link>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
