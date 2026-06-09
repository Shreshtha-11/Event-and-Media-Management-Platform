'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';
import './admin.css';

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (session && session.user.role !== 'admin') router.push('/dashboard');
    fetch('/api/analytics').then(r => r.json()).then(setAnalytics).catch(() => {});
  }, [session, router]);

  return (
    <><Navbar user={session?.user} /><Sidebar user={session?.user} />
      <main className="page-wrapper"><div className="page-content">
        <h1 className="animate-fadeInUp" style={{fontFamily:'var(--font-heading)',marginBottom:'8px'}}>👑 Admin Dashboard</h1>
        <p className="animate-fadeInUp" style={{color:'var(--color-text-muted)',marginBottom:'28px'}}>Manage users, content, and platform analytics</p>
        <div className="admin-quick-links animate-fadeInUp" style={{animationDelay:'0.1s'}}>
          {[{href:'/admin/users',icon:'👥',label:'User Management',desc:'Manage roles & permissions'},{href:'/admin/analytics',icon:'📊',label:'Analytics',desc:'Platform statistics'},{href:'/admin/moderation',icon:'🛡️',label:'Moderation',desc:'Review flagged content'}].map((l,i)=>(
            <Link key={i} href={l.href} className="admin-link-card hover-lift">
              <span className="admin-link-icon">{l.icon}</span>
              <h3>{l.label}</h3>
              <p>{l.desc}</p>
            </Link>
          ))}
        </div>
        <div className="animate-fadeInUp" style={{animationDelay:'0.2s'}}>
          <AnalyticsCharts data={analytics} />
        </div>
      </div></main>
    </>
  );
}
