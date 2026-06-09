'use client';
import { useState } from 'react';
import './media.css';

export default function MediaCard({ media, onView, onLike }) {
  const [liked, setLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const handleDoubleClick = () => {
    if (!liked) {
      setLiked(true);
      onLike?.(media._id);
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
  };

  return (
    <div className="media-card" onDoubleClick={handleDoubleClick}>
      <div className="media-card-image-wrapper">
        {media.type === 'video' ? (
          <video src={media.fileUrl} className="media-card-image" muted />
        ) : (
          <img
            src={media.fileUrl || media.thumbnailUrl || '/placeholder.jpg'}
            alt={media.title || 'Media'}
            className="media-card-image"
            loading="lazy"
            onError={(e) => { e.target.src = `https://picsum.photos/seed/${media._id || Math.random()}/400/300`; }}
          />
        )}
        {media.type === 'video' && <span className="media-card-video-badge">▶ Video</span>}
        {showHeart && (
          <div className="media-card-heart-overlay">
            <span className="heart-animation">❤️</span>
          </div>
        )}
        <div className="media-card-overlay" onClick={() => onView?.(media)}>
          <div className="media-card-overlay-stats">
            <span className="overlay-stat">❤️ {media.likeCount || 0}</span>
            <span className="overlay-stat">💬 {media.commentCount || 0}</span>
            <span className="overlay-stat">⬇️ {media.downloadCount || 0}</span>
          </div>
        </div>
      </div>
      <div className="media-card-info">
        <div className="media-card-user">
          <div className="media-card-avatar">
            {media.uploader?.name?.[0] || '?'}
          </div>
          <span className="media-card-username">{media.uploader?.name || 'Unknown'}</span>
        </div>
        {media.title && <p className="media-card-title">{media.title}</p>}
        {media.tags?.length > 0 && (
          <div className="media-card-tags">
            {media.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="media-card-tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
