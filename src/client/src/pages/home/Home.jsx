import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import "../../styles/home.css";

/* =============== GATEWAY CARD DATA =============== */
const gateways = [
    {
        icon: "🔍",
        title: "Discover Hackathons",
        desc: "Browse upcoming hackathons, filter by tech stack, and find the perfect challenge for your team.",
        to: "/discovery",
        accent: "#3b82f6",
        bg: "#eff6ff",
    },
    {
        icon: "📅",
        title: "Calendar",
        desc: "Track deadlines, submission dates, and presentation schedules in one unified timeline.",
        to: "/calendar",
        accent: "#8b5cf6",
        bg: "#f5f3ff",
    },
    {
        icon: "👤",
        title: "My Profile",
        desc: "Manage your skills, teams, and hackathon history. Showcase your achievements.",
        to: "/profile",
        accent: "#06b6d4",
        bg: "#ecfeff",
    },
    {
        icon: "⚖️",
        title: "Judge Panel",
        desc: "Review submissions, score teams with criteria-based rubrics, and provide feedback.",
        to: "/judge/hackathons",
        accent: "#f59e0b",
        bg: "#fffbeb",
    },
    {
        icon: "🛠",
        title: "Admin Dashboard",
        desc: "Create hackathons, manage teams, assign judges, and monitor platform activity.",
        to: "/admin/dashboard",
        accent: "#ef4444",
        bg: "#fef2f2",
    },
    {
        icon: "📝",
        title: "Register & Join",
        desc: "Form a team, invite members, and register for any open hackathon in minutes.",
        to: "/discovery",
        accent: "#10b981",
        bg: "#ecfdf5",
    },
];

/* =============== STEPS DATA =============== */
const steps = [
    {
        num: "01",
        title: "Register",
        desc: "Create your account, browse hackathons, and form or join a team.",
    },
    {
        num: "02",
        title: "Build",
        desc: "Collaborate with your team, submit prototypes, and iterate on your project.",
    },
    {
        num: "03",
        title: "Win",
        desc: "Present to judges, get scored with transparent rubrics, and claim your prizes.",
    },
];

/* =============== STATS DATA =============== */
const stats = [
    { value: "50+", label: "Hackathons Hosted" },
    { value: "1,200+", label: "Teams Formed" },
    { value: "3,500+", label: "Projects Submitted" },
    { value: "10,000+", label: "Participants" },
];

/* =============== HOME PAGE COMPONENT =============== */
const Home = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* ===== HERO ===== */}
            <section className="home-hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span>🚀</span>
                        <span>The Hackathon Hosting Platform</span>
                    </div>

                    <h1 className="hero-title">
                        Build. Compete.
                        <br />
                        <span className="gradient-text">Innovate Together.</span>
                    </h1>

                    <p className="hero-subtitle">
                        One platform to host, manage, and participate in hackathons.
                        From team formation to judging — everything in one place.
                    </p>

                    <div className="hero-actions">
                        <Link to="/discovery" className="btn-hero-primary">
                            Explore Hackathons →
                        </Link>
                        <Link to="/signup" className="btn-hero-secondary">
                            Get Started — It's Free
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== GATEWAY CARDS ===== */}
            <section className="gateway-section">
                <div className="section-header">
                    <span className="section-label">Your Gateway</span>
                    <h2 className="section-title">Everything You Need</h2>
                    <p className="section-subtitle">
                        Jump into any area of the platform. Whether you're here to compete,
                        judge, or organize — we've got you covered.
                    </p>
                </div>

                <div className="gateway-grid">
                    {gateways.map((g, i) => (
                        <Link
                            key={i}
                            to={g.to}
                            className="gateway-card"
                            style={{
                                "--card-accent": g.accent,
                                "--card-bg": g.bg,
                            }}
                        >
                            <div className="card-icon">{g.icon}</div>
                            <div className="card-title">{g.title}</div>
                            <div className="card-desc">{g.desc}</div>
                            <div className="card-arrow">
                                Go to {g.title} <span>→</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="how-section">
                <div className="section-header">
                    <span className="section-label">How It Works</span>
                    <h2 className="section-title">Three Steps to Glory</h2>
                    <p className="section-subtitle">
                        Getting started is simple — here's the path from idea to innovation.
                    </p>
                </div>

                <div className="steps-row">
                    {steps.map((s, i) => (
                        <div key={i} className="step-item">
                            <div className="step-number">{s.num}</div>
                            <div className="step-title">{s.title}</div>
                            <div className="step-desc">{s.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== STATS ===== */}
            <section className="stats-section">
                <div className="stats-row">
                    {stats.map((s, i) => (
                        <div key={i} className="stat-item">
                            <div className="stat-number">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="cta-section">
                <div className="cta-box">
                    <h2 className="cta-title">Ready to Hack? 🚀</h2>
                    <p className="cta-subtitle">
                        Join thousands of developers, designers, and innovators building the
                        future — one hackathon at a time.
                    </p>
                    <Link to="/signup" className="btn-cta">
                        Create Your Account →
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
