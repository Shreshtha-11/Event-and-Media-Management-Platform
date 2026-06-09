'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import ModerationQueue from '@/components/admin/ModerationQueue';
import './admin.css';

export default function AdminModerationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [items, setItems] = useState([]);
  useEffect(() => { if (session && session.user.role !== 'admin') router.push('/dashboard'); }, [session, router]);
  useEffect(() => { fetch('/api/media?moderated=false&limit=50').then(r => r.json()).then(d => setItems(Array.isArray(d) ? d : d.media || [])).catch(() => {}); }, []);

  const handleApprove = async (id) => {
    await fetch(`/api/media/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isModerated: true }) });
    setItems(prev => prev.filter(i => i._id !== id));
  };
  const handleReject = async (id) => {
    await fetch(`/api/media/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i._id !== id));
  };

  return (
    <><Navbar user={session?.user} /><Sidebar user={session?.user} />
      <main className="page-wrapper"><div className="page-content">
        <h1 className="animate-fadeInUp" style={{fontFamily:'var(--font-heading)',marginBottom:'28px'}}>🛡️ Content Moderation</h1>
        <div className="animate-fadeInUp" style={{animationDelay:'0.1s'}}><ModerationQueue items={items} onApprove={handleApprove} onReject={handleReject} /></div>
      </div></main>
    </>
  );
}
