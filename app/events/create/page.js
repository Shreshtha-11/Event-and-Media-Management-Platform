'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import EventForm from '@/components/events/EventForm';
import './events.css';

export default function CreateEventPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) router.push(`/events/${data.event?._id || data._id}`);
    } catch {}
    setLoading(false);
  };

  return (
    <><Navbar user={session?.user} /><Sidebar user={session?.user} />
      <main className="page-wrapper"><div className="page-content" style={{maxWidth:'700px'}}>
        <h1 className="animate-fadeInUp" style={{fontFamily:'var(--font-heading)',marginBottom:'32px'}}>🎉 Create New Event</h1>
        <div className="animate-fadeInUp glass" style={{padding:'32px',borderRadius:'var(--radius-xl)',animationDelay:'0.1s'}}>
          <EventForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div></main>
    </>
  );
}
