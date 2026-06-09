'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import './albums.css';

export default function AlbumsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/albums?limit=50').then(r => r.json()).then(data => {
      setAlbums(Array.isArray(data) ? data : data.albums || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <><Navbar user={session?.user} /><Sidebar user={session?.user} />
      <main className="page-wrapper"><div className="page-content">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px'}}>
          <h1 className="animate-fadeInUp" style={{fontFamily:'var(--font-heading)',margin:0}}>📁 Albums</h1>
          {session?.user && (
            <button className="animate-fadeInUp" style={{padding:'8px 16px',borderRadius:'var(--radius-md)',background:'var(--color-primary)',color:'#fff',border:'none',cursor:'pointer',fontWeight:600}} onClick={() => router.push('/albums/create')}>
              + Create Album
            </button>
          )}
        </div>
        {loading ? <div className="albums-grid">{Array.from({length:6}).map((_,i)=><div key={i} className="album-card-skeleton skeleton-loading" />)}</div> : albums.length > 0 ? (
          <div className="albums-grid">{albums.map((album,i)=>(
            <Card key={album._id||i} hoverable glassmorphism className="album-card animate-fadeInUp" style={{animationDelay:`${i*0.05}s`}} onClick={()=>router.push(`/albums/${album._id}`)}>
              <div className="album-card-cover"><img src={album.coverImage || `https://picsum.photos/seed/${album._id || i}/400/300`} alt={album.title} onError={(e)=>{e.target.src=`https://picsum.photos/seed/${Math.random()}/400/300`;}} /></div>
              <div className="album-card-info"><h3>{album.title}</h3><p>{album.media?.length || 0} items</p></div>
            </Card>
          ))}</div>
        ) : <div className="events-empty"><span>📁</span><h3>No albums yet</h3><p>Albums are created within events.</p></div>}
      </div></main>
    </>
  );
}
