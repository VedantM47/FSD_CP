import React from 'react';

const Hero = () => {
    return (
        <div className="hero-section">
            <div className="hero-content">
                <h1 className="hero-title">Discover Hackathons.<br />Build. Compete.</h1>
                <p className="hero-description">
                    Join innovative developers worldwide. Collaborate on groundbreaking projects.
                    Win exciting prizes and recognition.
                </p>
                <button className="hero-cta">Explore Hackathons</button>

                <div className="scroll-indicator">
                    <div className="mouse"></div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
