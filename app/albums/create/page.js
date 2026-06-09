'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import AlbumForm from '@/components/albums/AlbumForm';

export default function CreateAlbumPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/albums', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/albums/${data.album?._id || data._id}`);
      } else {
        alert(data.error || 'Failed to create album');
      }
    } catch (e) {
      alert('An error occurred');
    }
    setLoading(false);
  };

  return (
    <><Navbar user={session?.user} /><Sidebar user={session?.user} />
      <main className="page-wrapper"><div className="page-content" style={{maxWidth:'700px'}}>
        <h1 className="animate-fadeInUp" style={{fontFamily:'var(--font-heading)',marginBottom:'32px'}}>📁 Create New Album</h1>
        <div className="animate-fadeInUp glass" style={{padding:'32px',borderRadius:'var(--radius-xl)',animationDelay:'0.1s'}}>
          <AlbumForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div></main>
    </>
  );
}
