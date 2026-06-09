'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MediaGrid from '@/components/media/MediaGrid';
import MediaViewer from '@/components/media/MediaViewer';
import Badge from '@/components/ui/Badge';
import './explore.css';

const FILTERS = ['All', 'Photos', 'Videos', 'Popular', 'Recent'];

export default function ExplorePage() {
  const { data: session } = useSession();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [tags, setTags] = useState([]);
  const [viewerMedia, setViewerMedia] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams({ limit: '50' });
    if (activeFilter === 'Photos') params.set('type', 'image');
    if (activeFilter === 'Videos') params.set('type', 'video');
    if (activeFilter === 'Popular') params.set('sort', '-likeCount');
    if (activeFilter === 'Recent') params.set('sort', '-createdAt');
    if (search) params.set('q', search);

    const endpoint = search ? `/api/search?${params}` : `/api/media?${params}`;
    fetch(endpoint).then(r => r.json()).then(data => {
      const items = Array.isArray(data) ? data : data.media || [];
      setMedia(items);
      const allTags = [...new Set(items.flatMap(m => m.tags || []))].slice(0, 20);
      setTags(allTags);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [activeFilter, search]);

  return (
    <><Navbar user={session?.user} /><Sidebar user={session?.user} />
      <main className="page-wrapper"><div className="page-content">
        <div className="explore-header animate-fadeInUp">
          <h1>🔍 Explore</h1>
          <input type="text" placeholder="Search by tags, events, users..." value={search} onChange={(e) => setSearch(e.target.value)} className="explore-search" />
        </div>
        <div className="explore-filter-chips animate-fadeInUp" style={{animationDelay:'0.1s'}}>
          {FILTERS.map(f => (
            <button key={f} className={`explore-chip ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>
          ))}
        </div>
        {tags.length > 0 && (
          <div className="explore-tags animate-fadeInUp" style={{animationDelay:'0.15s'}}>
            {tags.map((tag, i) => <Badge key={i} variant="primary" onClick={() => setSearch(tag)}>#{tag}</Badge>)}
          </div>
        )}
        <div className="animate-fadeInUp" style={{animationDelay:'0.2s'}}>
          <MediaGrid items={media} loading={loading} onItemClick={(m) => setViewerMedia(m)} emptyMessage="No media found. Try adjusting your filters." />
        </div>
        {viewerMedia && <MediaViewer media={viewerMedia} items={media} initialIndex={media.findIndex(m=>m._id===viewerMedia._id)} onClose={() => setViewerMedia(null)} />}
      </div></main>
    </>
  );
}
