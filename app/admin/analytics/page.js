'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';
import './admin.css';

export default function AdminAnalyticsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  useEffect(() => { if (session && session.user.role !== 'admin') router.push('/dashboard'); }, [session, router]);
  useEffect(() => { fetch('/api/analytics').then(r => r.json()).then(setAnalytics).catch(() => {}); }, []);

  return (
    <><Navbar user={session?.user} /><Sidebar user={session?.user} />
      <main className="page-wrapper"><div className="page-content">
        <h1 className="animate-fadeInUp" style={{fontFamily:'var(--font-heading)',marginBottom:'28px'}}>📊 Analytics Dashboard</h1>
        <div className="animate-fadeInUp" style={{animationDelay:'0.1s'}}><AnalyticsCharts data={analytics} /></div>
      </div></main>
    </>
  );
}
