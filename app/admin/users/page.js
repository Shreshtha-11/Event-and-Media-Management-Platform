'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import UserRoleManager from '@/components/admin/UserRoleManager';
import './admin.css';

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => { if (session && session.user.role !== 'admin') router.push('/dashboard'); }, [session, router]);

  return (
    <><Navbar user={session?.user} /><Sidebar user={session?.user} />
      <main className="page-wrapper"><div className="page-content">
        <h1 className="animate-fadeInUp" style={{fontFamily:'var(--font-heading)',marginBottom:'8px'}}>👥 User Management</h1>
        <p className="animate-fadeInUp" style={{color:'var(--color-text-muted)',marginBottom:'28px'}}>Manage user roles and permissions. Only admins can change roles.</p>
        <div className="animate-fadeInUp" style={{animationDelay:'0.1s'}}><UserRoleManager /></div>
      </div></main>
    </>
  );
}
