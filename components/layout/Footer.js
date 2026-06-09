'use client';

import './layout.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mm-footer">
      <div className="mm-footer__brand">Mogger Manages</div>

      <div className="mm-footer__links">
        <a className="mm-footer__link" href="/about">About</a>
        <a className="mm-footer__link" href="/privacy">Privacy</a>
        <a className="mm-footer__link" href="/terms">Terms</a>
        <a className="mm-footer__link" href="/contact">Contact</a>
      </div>

      <div className="mm-footer__social">
        <a className="mm-footer__social-link" href="#" aria-label="Twitter">𝕏</a>
        <a className="mm-footer__social-link" href="#" aria-label="Instagram">📸</a>
        <a className="mm-footer__social-link" href="#" aria-label="GitHub">💻</a>
      </div>

      <div className="mm-footer__tagline">
        Made with <span>❤️</span> &middot; © {year} Mogger Manages
      </div>
    </footer>
  );
}
