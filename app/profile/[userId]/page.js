'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MediaGrid from '@/components/media/MediaGrid';
import Badge from '@/components/ui/Badge';
import './profile.css';

export default function UserProfilePage() {
  const { userId } = useParams();
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [media, setMedia] = useState([]);
  const [tab, setTab] = useState('uploads');
  const [loading, setLoading] = useState(true);
  const isOwnProfile = session?.user?.id === userId;

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${userId}`).then(r => r.json()),
      fetch(`/api/media?uploader=${userId}&limit=50`).then(r => r.json()),
    ]).then(([userData, mediaData]) => {
      setUser(userData.user || userData);
      setMedia(Array.isArray(mediaData) ? mediaData : mediaData.media || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [userId]);

  const roleColors = { admin: '#F44336', photographer: '#FF9800', club_member: '#2196F3', viewer: '#888' };

  return (
    <><Navbar user={session?.user} /><Sidebar user={session?.user} />
      <main className="page-wrapper"><div className="page-content">
        <div className="profile-header animate-fadeInUp">
          <div className="profile-banner" />
          <div className="profile-info">
            <div className="profile-avatar-large">{user?.name?.[0] || '?'}</div>
            <div className="profile-details">
              <h1>{user?.name || 'User'}</h1>
              <Badge variant="primary" style={{background: roleColors[user?.role] || '#888'}}>{user?.role?.replace('_',' ') || 'viewer'}</Badge>
              {user?.bio && <p className="profile-bio">{user.bio}</p>}
              <span className="profile-joined">📅 Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US',{month:'long',year:'numeric'}) : 'Unknown'}</span>
            </div>
          </div>
        </div>
        <div className="profile-stats animate-fadeInUp" style={{animationDelay:'0.1s'}}>
          {[{label:'Uploads',value:media.length},{label:'Favorites',value:user?.favorites?.length||0},{label:'Events',value:0}].map((s,i) => (
            <div key={i} className="profile-stat"><span className="profile-stat-value">{s.value}</span><span className="profile-stat-label">{s.label}</span></div>
          ))}
        </div>
        <div className="event-detail-tabs animate-fadeInUp" style={{animationDelay:'0.15s'}}>
          {['uploads','favorites'].map(t=><button key={t} className={`event-tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>{t==='uploads'?'📸 Uploads':'⭐ Favorites'}</button>)}
        </div>
        <div className="animate-fadeInUp" style={{animationDelay:'0.2s'}}>
          <MediaGrid items={tab==='uploads' ? media : []} loading={loading} emptyMessage={tab==='uploads' ? 'No uploads yet.' : 'No favorites yet.'} />
        </div>
      </div></main>
    </>
  );
}
