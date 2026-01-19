import React from 'react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand font-bold text-lg">Hackplatform</div>
                <nav className="footer-nav">
                    <a href="/about" className="footer-link">About</a>
                    <a href="/faqs" className="footer-link">FAQs</a>
                    <a href="/contact" className="footer-link">Contact</a>
                    <a href="/terms" className="footer-link">Terms & Privacy</a>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
