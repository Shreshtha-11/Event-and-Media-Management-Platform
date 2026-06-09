'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import EventForm from '@/components/events/EventForm';

export default function EditEventPage() {
  const { eventId } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${eventId}`).then(r => r.json()).then(data => {
      setEvent(data.event || data);
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [eventId]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/events/${eventId}`);
      } else {
        alert(data.error || 'Failed to update event');
      }
    } catch (e) {
      alert('An error occurred');
    }
    setLoading(false);
  };

  if (fetching) {
    return <><Navbar user={session?.user} /><Sidebar user={session?.user} /><main className="page-wrapper"><div className="page-content">Loading...</div></main></>;
  }

  return (
    <><Navbar user={session?.user} /><Sidebar user={session?.user} />
      <main className="page-wrapper"><div className="page-content" style={{maxWidth:'700px'}}>
        <h1 className="animate-fadeInUp" style={{fontFamily:'var(--font-heading)',marginBottom:'32px'}}>✏️ Edit Event</h1>
        <div className="animate-fadeInUp glass" style={{padding:'32px',borderRadius:'var(--radius-xl)',animationDelay:'0.1s'}}>
          <EventForm event={event} onSubmit={handleSubmit} loading={loading} />
        </div>
      </div></main>
    </>
  );
}
