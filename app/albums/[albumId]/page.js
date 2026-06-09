'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MediaGrid from '@/components/media/MediaGrid';
import MediaViewer from '@/components/media/MediaViewer';
import ShareModal from '@/components/social/ShareModal';
import Button from '@/components/ui/Button';
import './albums.css';

export default function AlbumDetailPage() {
  const { albumId } = useParams();
  const { data: session } = useSession();
  const [album, setAlbum] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewerMedia, setViewerMedia] = useState(null);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    fetch(`/api/albums/${albumId}`).then(r => r.json()).then(data => {
      const a = data.album || data;
      setAlbum(a);
      setMedia(a.media || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [albumId]);

  return (
    <><Navbar user={session?.user} /><Sidebar user={session?.user} />
      <main className="page-wrapper"><div className="page-content">
        <div className="album-detail-header animate-fadeInUp">
          <div><h1 style={{fontFamily:'var(--font-heading)'}}>{album?.title || 'Album'}</h1>
          {album?.description && <p style={{color:'var(--color-text-secondary)',marginTop:'8px'}}>{album.description}</p>}</div>
          <Button variant="primary" onClick={() => router.push(`/upload?albumId=${albumId}`)}>📤 Upload Media</Button>
        </div>
        <MediaGrid items={media} loading={loading} onItemClick={(m) => setViewerMedia(m)} emptyMessage="This album is empty." />
        {viewerMedia && <MediaViewer media={viewerMedia} items={media} initialIndex={media.findIndex(m=>m._id===viewerMedia._id)} onClose={()=>setViewerMedia(null)} />}
        <ShareModal isOpen={showShare} onClose={()=>setShowShare(false)} shareUrl={`${typeof window!=='undefined'?window.location.origin:''}/albums/${albumId}`} title={album?.title} />
      </div></main>
    </>
  );
}
