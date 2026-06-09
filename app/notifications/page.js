'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Button from '@/components/ui/Button';
import './notifications.css';

const TYPES = { like: '❤️', comment: '💬', tag: '🏷️', role_change: '👑', event_invite: '📩', upload: '📤', system: '🔔' };

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const params = new URLSearchParams({ limit: '50' });
    if (filter === 'unread') params.set('filter', 'unread');
    else if (filter !== 'all') params.set('filter', filter);
    fetch(`/api/notifications?${params}`).then(r => r.json()).then(data => {
      setNotifications(data.notifications || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [session, filter]);

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAll: true }) });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <><Navbar user={session?.user} /><Sidebar user={session?.user} />
      <main className="page-wrapper"><div className="page-content" style={{maxWidth:'800px'}}>
        <div className="notif-header animate-fadeInUp">
          <h1>🔔 Notifications</h1>
          <Button variant="ghost" onClick={markAllRead}>Mark all read</Button>
        </div>
        <div className="notif-filters animate-fadeInUp" style={{animationDelay:'0.1s'}}>
          {['all','unread','like','comment','tag','system'].map(f => (
            <button key={f} className={`explore-chip ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>{f === 'all' ? 'All' : f === 'unread' ? 'Unread' : TYPES[f] || ''} {f.charAt(0).toUpperCase()+f.slice(1)}</button>
          ))}
        </div>
        <div className="notif-list animate-fadeInUp" style={{animationDelay:'0.2s'}}>
          {notifications.length > 0 ? notifications.map((n,i) => (
            <div key={n._id||i} className={`notif-item ${!n.read ? 'unread' : ''}`}>
              <span className="notif-icon">{TYPES[n.type] || '🔔'}</span>
              <div className="notif-content">
                <p className="notif-message">{n.message}</p>
                <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString()}</span>
              </div>
              {!n.read && <span className="notif-dot" />}
            </div>
          )) : <div className="events-empty"><span>🔔</span><h3>No notifications</h3><p>You're all caught up!</p></div>}
        </div>
      </div></main>
    </>
  );
}
