'use client';
import Link from 'next/link';
import './page.css';

export default function LandingPage() {
  const features = [
    { icon: '◎', title: 'Event Media', desc: 'Organize photos and videos by events, albums, and categories seamlessly.' },
    { icon: '◈', title: 'Access Control', desc: 'Role-based access with Admin, Photographer, Club Member, and Viewer roles.' },
    { icon: '◇', title: 'AI Tagging', desc: 'Automatically tag images with smart AI-powered recognition and search.' },
    { icon: '◆', title: 'Social Features', desc: 'Like, comment, share, tag friends, and get real-time notifications.' },
    { icon: '▲', title: 'Cloud Storage', desc: 'Secure cloud storage powered by Google Cloud for all your media.' },
    { icon: '◉', title: 'Watermarking', desc: 'Dynamic watermarks on downloads based on club, event, and user role.' },
  ];

  return (
    <div className="landing-page">
      <div className="landing-bg">
        <div className="landing-orb orb-1" />
        <div className="landing-orb orb-2" />
        <div className="landing-orb orb-3" />
        <div className="landing-grid-overlay" />
      </div>

      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link href="/" className="landing-logo">
            <svg className="landing-logo-svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="url(#landGrad)" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="6" stroke="url(#landGrad)" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="2.5" fill="url(#landGrad)"/>
              <line x1="12" y1="2" x2="12" y2="5" stroke="url(#landGrad)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="12" y1="19" x2="12" y2="22" stroke="url(#landGrad)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="2" y1="12" x2="5" y2="12" stroke="url(#landGrad)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="19" y1="12" x2="22" y2="12" stroke="url(#landGrad)" strokeWidth="1.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="landGrad" x1="0" y1="0" x2="24" y2="24">
                  <stop stopColor="#3D8BFF"/>
                  <stop offset="1" stopColor="#00E5FF"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="landing-logo-text">EventFrame</span>
          </Link>
          <div className="landing-nav-links">
            <Link href="/login" className="landing-nav-link">Sign In</Link>
            <Link href="/register" className="landing-nav-cta">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-content animate-fadeInUp">
          <span className="hero-badge">Event & Media Management Platform</span>
          <h1 className="hero-title">
            Manage Your Events.<br />
            <span className="gradient-text">Share Your Moments.</span>
          </h1>
          <p className="hero-subtitle">
            The all-in-one platform for clubs, photographers, and teams to upload, organize, discover, and share event media with AI-powered features.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="hero-btn-primary">
              Get Started Free <span className="hero-btn-arrow">→</span>
            </Link>
            <Link href="/explore" className="hero-btn-secondary">Explore Events</Link>
          </div>
        </div>
        <div className="hero-visual animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="hero-mockup">
            <div className="mockup-header"><span className="mockup-dot" /><span className="mockup-dot" /><span className="mockup-dot" /></div>
            <div className="mockup-grid">
              {[1,2,3,4,5,6].map(i => <div key={i} className="mockup-item" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="section-header animate-fadeInUp">
          <span className="section-tag">Features</span>
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-subtitle">Powerful tools to manage your event media from start to finish.</p>
        </div>
        <div className="features-grid">
          {features.map((feature, i) => (
            <div key={i} className="feature-card glass hover-lift animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="feature-icon">{feature.icon}</span>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-steps">
        <div className="section-header animate-fadeInUp">
          <span className="section-tag">How it Works</span>
          <h2 className="section-title">Get Started in 3 Steps</h2>
        </div>
        <div className="steps-container">
          {[
            { num: '01', title: 'Create Event', desc: 'Set up your event with details, categories, and invite members.' },
            { num: '02', title: 'Upload Media', desc: 'Drag & drop photos and videos. AI auto-tags and organizes them.' },
            { num: '03', title: 'Share & Collaborate', desc: 'Share albums via QR codes, get social, and manage access.' },
          ].map((step, i) => (
            <div key={i} className="step-card animate-fadeInUp" style={{ animationDelay: `${i * 0.15}s` }}>
              <span className="step-number">{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div className="cta-content glass animate-fadeInUp">
          <h2>Ready to Manage Your Events?</h2>
          <p>Join EventFrame and start organizing your media today.</p>
          <Link href="/register" className="hero-btn-primary">Create Free Account</Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
            </svg>
            <span>EventFrame</span>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} EventFrame. Built for event media management.</p>
        </div>
      </footer>
    </div>
  );
}
