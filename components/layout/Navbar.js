'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTheme } from '../../context/ThemeContext';
import Dropdown from '../ui/Dropdown';
import './layout.css';

const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Events', href: '/events' },
  { label: 'Albums', href: '/albums' },
  { label: 'Upload', href: '/upload' },
  { label: 'Explore', href: '/explore' },
];

export default function Navbar({ user, activePath = '/', notifCount = 0 }) {
  const { mode, toggleMode } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const userMenuItems = [
    { key: 'profile', icon: null, label: 'Profile' },
    ...(user?.role === 'admin'
      ? [{ key: 'admin', icon: null, label: 'Admin Panel' }]
      : []),
    { divider: true },
    { key: 'logout', icon: null, label: 'Sign Out', danger: true },
  ];

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const handleMenuSelect = (item) => {
    if (item.key === 'profile') router.push(`/profile/${user?.id}`);
    else if (item.key === 'admin') router.push('/admin');
    else if (item.key === 'logout') signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      <nav className="mm-navbar">
        <div className="mm-navbar__left">
          <button
            className={`mm-navbar__hamburger ${mobileOpen ? 'mm-navbar__hamburger--open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className="mm-navbar__hamburger-line" />
            <span className="mm-navbar__hamburger-line" />
            <span className="mm-navbar__hamburger-line" />
          </button>

          <a className="mm-navbar__logo" href="/dashboard">
            <span className="mm-navbar__logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="url(#logoGrad)" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="6" stroke="url(#logoGrad)" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="2.5" fill="url(#logoGrad)"/>
                <line x1="12" y1="2" x2="12" y2="5" stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="12" y1="19" x2="12" y2="22" stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="2" y1="12" x2="5" y2="12" stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="19" y1="12" x2="22" y2="12" stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="logoGrad" x1="0" y1="0" x2="24" y2="24">
                    <stop stopColor="var(--color-primary)"/>
                    <stop offset="1" stopColor="var(--color-accent)"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <span className="mm-navbar__logo-text">EventFrame</span>
          </a>

          <div className="mm-navbar__nav">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}
                className={`mm-navbar__link ${activePath === link.href ? 'mm-navbar__link--active' : ''}`}
              >{link.label}</a>
            ))}
          </div>
        </div>

        <div className="mm-navbar__right">
          <div className="mm-navbar__search">
            <svg className="mm-navbar__search-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search..." className="mm-navbar__search-input" />
          </div>

          <a href="/notifications" className="mm-navbar__notif" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {notifCount > 0 && <span className="mm-navbar__notif-count">{notifCount > 99 ? '99+' : notifCount}</span>}
          </a>

          <button className="mm-navbar__theme-btn" onClick={toggleMode}
            aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
            {mode === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>

          <Dropdown
            trigger={
              <div className="mm-navbar__avatar">
                {user?.avatar ? <img src={user.avatar} alt={user.name} /> : initials}
              </div>
            }
            items={userMenuItems}
            align="right"
            onSelect={handleMenuSelect}
          />
        </div>
      </nav>

      <div className={`mm-mobile-nav ${mobileOpen ? 'mm-mobile-nav--open' : ''}`}>
        <div className="mm-navbar__search">
          <svg className="mm-navbar__search-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search..." className="mm-navbar__search-input" />
        </div>
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href}
            className={`mm-navbar__link ${activePath === link.href ? 'mm-navbar__link--active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >{link.label}</a>
        ))}
      </div>
    </>
  );
}
