'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import MediaGrid from '@/components/media/MediaGrid';
import EventCard from '@/components/events/EventCard';
import Loader from '@/components/ui/Loader';
import './dashboard.css';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [media, setMedia] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (status === 'unauthenticated') router.push('/login'); }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    Promise.all([
      fetch('/api/media?limit=8&sort=-createdAt').then(r => r.json()).catch(() => ({})),
      fetch('/api/events?limit=4&sort=-date').then(r => r.json()).catch(() => ({})),
    ]).then(([mediaData, eventData]) => {
      setMedia(Array.isArray(mediaData) ? mediaData : mediaData.media || []);
      setEvents(Array.isArray(eventData) ? eventData : eventData.events || []);
      setLoading(false);
    });
  }, [status]);

  if (status === 'loading') return <div className="page-loader"><Loader type="spinner" size="lg" /></div>;
  if (!session) return null;

  const statCards = [
    { label: 'My Uploads', value: media.length, href: `/explore?uploader=${session.user.id}` },
    { label: 'Favorites', value: 0, href: '/explore' },
    { label: 'Events', value: events.length, href: '/events' },
    { label: 'Notifications', value: 0, href: '/notifications' },
  ];

  return (
    <><Navbar user={session.user} /><Sidebar user={session.user} />
      <main className="page-wrapper"><div className="page-content">
        <div className="dashboard-welcome animate-fadeInUp">
          <div className="welcome-text">
            <h1>Welcome back, <span className="gradient-text">{session.user.name || 'User'}</span></h1>
            <p>Here's what's happening with your media and events.</p>
          </div>
        </div>
        <div className="dashboard-stats animate-fadeInUp" style={{animationDelay:'0.1s'}}>
          {statCards.map((s, i) => (
            <Link key={i} href={s.href} className="dash-stat-link">
              <Card glassmorphism hoverable className="dash-stat-card">
                <span className="dash-stat-value">{s.value}</span>
                <span className="dash-stat-label">{s.label}</span>
              </Card>
            </Link>
          ))}
        </div>
        <div className="dashboard-actions animate-fadeInUp" style={{animationDelay:'0.2s'}}>
          <Link href="/upload" className="dash-action-card"><span>Upload Media</span></Link>
          <Link href="/events/create" className="dash-action-card"><span>Create Event</span></Link>
          <Link href="/explore" className="dash-action-card"><span>Explore</span></Link>
        </div>
        <section className="dashboard-section animate-fadeInUp" style={{animationDelay:'0.3s'}}>
          <div className="section-head"><h2>Recent Uploads</h2><Link href="/explore">View All →</Link></div>
          <MediaGrid items={media} loading={loading} emptyMessage="No uploads yet. Start sharing your photos!" />
        </section>
        <section className="dashboard-section animate-fadeInUp" style={{animationDelay:'0.4s'}}>
          <div className="section-head"><h2>Upcoming Events</h2><Link href="/events">View All →</Link></div>
          {events.length > 0 ? (
            <div className="dash-events-grid">{events.map((e,i) => <EventCard key={e._id||i} event={e} onClick={() => router.push(`/events/${e._id}`)} />)}</div>
          ) : (<p className="dash-empty">No events yet. <Link href="/events/create">Create one!</Link></p>)}
        </section>
      </div></main>
    </>
  );
}
