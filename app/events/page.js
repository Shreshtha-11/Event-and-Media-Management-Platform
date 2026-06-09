'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import EventCard from '@/components/events/EventCard';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import './events.css';

export default function EventsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-date');

  useEffect(() => {
    const params = new URLSearchParams({ limit: '50', sort });
    if (category) params.set('category', category);
    fetch(`/api/events?${params}`).then(r => r.json()).then(data => {
      setEvents(Array.isArray(data) ? data : data.events || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [category, sort]);

  const filtered = events.filter(e => !search || e.title?.toLowerCase().includes(search.toLowerCase()));
  const canCreate = session?.user?.role === 'admin' || session?.user?.role === 'photographer';

  return (
    <><Navbar user={session?.user} /><Sidebar user={session?.user} />
      <main className="page-wrapper"><div className="page-content">
        <div className="events-header animate-fadeInUp">
          <h1>🎉 Events</h1>
          {canCreate && <Link href="/events/create"><Button variant="primary">+ Create Event</Button></Link>}
        </div>
        <div className="events-filters animate-fadeInUp" style={{animationDelay:'0.1s'}}>
          <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="events-search" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="events-filter-select">
            <option value="">All Categories</option>
            <option value="photoshoot">📷 Photoshoot</option><option value="workshop">🎓 Workshop</option>
            <option value="trip">✈️ Trip</option><option value="competition">🏆 Competition</option>
            <option value="cultural_fest">🎭 Cultural Fest</option><option value="party">🎉 Party</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="events-filter-select">
            <option value="-date">Newest First</option><option value="date">Oldest First</option><option value="title">A-Z</option>
          </select>
        </div>
        {loading ? <Loader type="skeleton" /> : filtered.length > 0 ? (
          <div className="events-grid animate-fadeInUp" style={{animationDelay:'0.2s'}}>
            {filtered.map((event, i) => <EventCard key={event._id || i} event={event} onClick={() => router.push(`/events/${event._id}`)} />)}
          </div>
        ) : (
          <div className="events-empty"><span>📅</span><h3>No events found</h3><p>Create your first event or adjust filters.</p></div>
        )}
      </div></main>
    </>
  );
}
