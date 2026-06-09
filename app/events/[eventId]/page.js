'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MediaGrid from '@/components/media/MediaGrid';
import MediaViewer from '@/components/media/MediaViewer';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ShareModal from '@/components/social/ShareModal';
import './events.css';

export default function EventDetailPage() {
  const { eventId } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [media, setMedia] = useState([]);
  const [tab, setTab] = useState('media');
  const [loading, setLoading] = useState(true);
  const [viewerMedia, setViewerMedia] = useState(null);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${eventId}`).then(r => r.json()),
      fetch(`/api/media?event=${eventId}&limit=50`).then(r => r.json()),
    ]).then(([eventData, mediaData]) => {
      setEvent(eventData.event || eventData);
      setMedia(Array.isArray(mediaData) ? mediaData : mediaData.media || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [eventId]);

  if (loading) return <><Navbar user={session?.user} /><Sidebar user={session?.user} /><main className="page-wrapper"><div className="page-content"><div className="page-loader" style={{minHeight:'50vh',display:'flex',alignItems:'center',justifyContent:'center'}}><span>Loading...</span></div></div></main></>;

  return (
    <><Navbar user={session?.user} /><Sidebar user={session?.user} />
      <main className="page-wrapper"><div className="page-content">
        <div className="event-detail-banner" style={{backgroundImage:`url(${event?.coverImage || `https://picsum.photos/seed/${eventId}/1200/400`})`}}>
          <div className="event-detail-banner-overlay">
            <Badge variant="primary">{event?.category?.replace('_',' ') || 'Event'}</Badge>
            <h1 className="event-detail-title">{event?.title || 'Event'}</h1>
            <div className="event-detail-meta">
              <span>📅 {event?.date ? new Date(event.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : 'TBD'}</span>
              {event?.location && <span>📍 {event.location}</span>}
              <span>👤 {event?.organizer?.name || 'Organizer'}</span>
            </div>
          </div>
        </div>
        <div className="event-detail-actions">
          <Button variant="outline" onClick={() => setShowShare(true)}>🔗 Share</Button>
          {(session?.user?.role === 'admin' || session?.user?.id === event?.organizer?._id) && (
            <Button variant="ghost" onClick={() => router.push(`/events/${eventId}/edit`)}>✏️ Edit</Button>
          )}
        </div>
        <div className="event-detail-tabs">
          {['media','albums','details'].map(t => (
            <button key={t} className={`event-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t === 'media' ? '📸 Media' : t === 'albums' ? '📁 Albums' : '📋 Details'}</button>
          ))}
        </div>
        {tab === 'media' && <MediaGrid items={media} onItemClick={(m) => setViewerMedia(m)} emptyMessage="No media uploaded yet." />}
        {tab === 'details' && (
          <div className="event-detail-info glass" style={{padding:'32px',borderRadius:'var(--radius-lg)',marginTop:'20px'}}>
            <h3>About this Event</h3>
            <p style={{color:'var(--color-text-secondary)',lineHeight:1.8,marginTop:'12px'}}>{event?.description || 'No description provided.'}</p>
            {event?.tags?.length > 0 && <div style={{marginTop:'16px',display:'flex',gap:'8px',flexWrap:'wrap'}}>{event.tags.map((t,i)=><Badge key={i} variant="primary">#{t}</Badge>)}</div>}
          </div>
        )}
        {tab === 'albums' && (
          <div className="event-detail-albums" style={{marginTop:'20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <h3>Albums ({event?.albums?.length || 0})</h3>
              {session?.user && (
                <Button size="sm" onClick={() => router.push(`/albums/create?eventId=${eventId}`)}>+ Create Album</Button>
              )}
            </div>
            {event?.albums?.length > 0 ? (
              <div className="albums-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:'20px'}}>
                {event.albums.map((album,i) => (
                  <div key={album._id||i} className="album-card glass animate-fadeInUp" style={{animationDelay:`${i*0.05}s`,cursor:'pointer',borderRadius:'var(--radius-lg)',overflow:'hidden'}} onClick={() => router.push(`/albums/${album._id}`)}>
                    <div style={{height:'150px',overflow:'hidden'}}>
                      <img src={album.coverImage || `https://picsum.photos/seed/${album._id || i}/400/300`} alt={album.title} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={(e)=>{e.target.src=`https://picsum.photos/seed/${Math.random()}/400/300`;}} />
                    </div>
                    <div style={{padding:'16px'}}>
                      <h4 style={{margin:0}}>{album.title}</h4>
                      <p style={{fontSize:'0.85rem',color:'var(--color-text-muted)',margin:'4px 0 0'}}>{album.media?.length || 0} items</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="events-empty"><span>📁</span><h3>No albums yet</h3><p>Be the first to create an album for this event.</p></div>
            )}
          </div>
        )}
        {viewerMedia && <MediaViewer media={viewerMedia} items={media} initialIndex={media.findIndex(m=>m._id===viewerMedia._id)} onClose={() => setViewerMedia(null)} />}
        <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/events/${eventId}`} title={event?.title} />
      </div></main>
    </>
  );
}
