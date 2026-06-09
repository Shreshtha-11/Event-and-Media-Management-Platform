'use client';

import Badge from '../ui/Badge';
import './layout.css';

const ROLE_LABELS = {
  admin: 'Administrator',
  photographer: 'Photographer',
  club_member: 'Club Member',
  viewer: 'Viewer',
};

const SECTIONS = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Events', href: '/events' },
      { label: 'Albums', href: '/albums' },
    ],
  },
  {
    title: 'Create',
    items: [
      { label: 'Upload Media', href: '/upload' },
      { label: 'New Event', href: '/events/create' },
    ],
  },
  {
    title: 'Discover',
    items: [
      { label: 'Explore', href: '/explore' },
      { label: 'My Photos', href: '/my-photos' },
    ],
  },
];

const ADMIN_SECTION = {
  title: 'Admin',
  items: [
    { label: 'Users', href: '/admin/users' },
    { label: 'Analytics', href: '/admin/analytics' },
    { label: 'Moderation', href: '/admin/moderation' },
  ],
};

export default function Sidebar({ user, activePath = '/', open = false, onClose }) {
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const allSections = [
    ...SECTIONS,
    ...(user?.role === 'admin' ? [ADMIN_SECTION] : []),
  ];

  return (
    <>
      <aside className={`mm-sidebar ${open ? 'mm-sidebar--open' : ''}`}>
        <div className="mm-sidebar__user">
          <div className="mm-sidebar__user-avatar">
            {user?.avatar ? <img src={user.avatar} alt={user?.name} /> : initials}
          </div>
          <div className="mm-sidebar__user-info">
            <div className="mm-sidebar__user-name">{user?.name || 'Guest'}</div>
            <div className="mm-sidebar__user-role">
              <Badge variant={user?.role === 'admin' ? 'primary' : 'default'} size="sm">
                {ROLE_LABELS[user?.role] || 'Viewer'}
              </Badge>
            </div>
          </div>
        </div>

        <nav className="mm-sidebar__nav">
          {allSections.map((section) => (
            <div key={section.title} className="mm-sidebar__section">
              <div className="mm-sidebar__section-title">{section.title}</div>
              {section.items.map((item) => (
                <a key={item.href} href={item.href}
                  className={`mm-sidebar__link ${activePath === item.href ? 'mm-sidebar__link--active' : ''}`}
                >
                  <span className="mm-sidebar__link-dot" />
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      {open && <div className="mm-sidebar-overlay" onClick={onClose} />}
    </>
  );
}
