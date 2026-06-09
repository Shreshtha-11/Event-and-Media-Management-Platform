'use client';
import { useState } from 'react';
import './social.css';

export default function LikeButton({ mediaId, initialCount = 0, initialLiked = false, onLike }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);

  const handleLike = async () => {
    setAnimating(true);
    setLiked(!liked);
    setCount(c => liked ? c - 1 : c + 1);
    setTimeout(() => setAnimating(false), 600);

    try {
      const res = await fetch(`/api/media/${mediaId}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.likeCount !== undefined) setCount(data.likeCount);
      onLike?.(data);
    } catch { /* Revert would go here */ }
  };

  return (
    <button className={`like-button ${liked ? 'liked' : ''} ${animating ? 'animating' : ''}`} onClick={handleLike}>
      <span className="like-icon">{liked ? '❤️' : '🤍'}</span>
      <span className="like-count">{count}</span>
      {animating && liked && (
        <div className="like-particles">
          {[...Array(6)].map((_, i) => <span key={i} className="particle" style={{ '--angle': `${i * 60}deg` }} />)}
        </div>
      )}
    </button>
  );
}
