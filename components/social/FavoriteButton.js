'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import './social.css';

export default function FavoriteButton({ mediaId }) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!mediaId || !session) return;
    fetch(`/api/media/${mediaId}/favorite`)
      .then(r => r.json())
      .then(data => setFavorited(data.favorited))
      .catch(() => {});
  }, [mediaId, session]);

  const handleToggle = async () => {
    if (!session || loading) return;
    
    // Optimistic UI update
    setFavorited(!favorited);
    if (!favorited) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 400);
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/media/${mediaId}/favorite`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to toggle favorite');
      const data = await res.json();
      setFavorited(data.favorited);
    } catch {
      // Revert on failure
      setFavorited(!favorited);
    }
    setLoading(false);
  };

  return (
    <button 
      className={`favorite-button ${favorited ? 'favorited' : ''} ${animating ? 'animating' : ''}`} 
      onClick={handleToggle}
      disabled={!session || loading}
      title={favorited ? 'Remove from Favorites' : 'Add to Favorites'}
    >
      <span className="favorite-icon">{favorited ? '⭐' : '☆'}</span>
      <span className="favorite-text">{favorited ? 'Favorited' : 'Favorite'}</span>
      {animating && (
        <div className="favorite-particles">
          {Array.from({length: 6}).map((_, i) => (
            <div key={i} className="favorite-particle" style={{ '--angle': `${i * 60}deg` }} />
          ))}
        </div>
      )}
    </button>
  );
}
