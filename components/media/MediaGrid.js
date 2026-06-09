'use client';
import MediaCard from './MediaCard';
import Loader from '../ui/Loader';
import './media.css';

export default function MediaGrid({ items = [], loading, onItemClick, onLike, emptyMessage }) {
  if (loading) {
    return (
      <div className="media-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="media-card-skeleton">
            <div className="skeleton-image skeleton-loading" />
            <div className="skeleton-info">
              <div className="skeleton-line skeleton-loading" style={{ width: '60%' }} />
              <div className="skeleton-line skeleton-loading" style={{ width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="media-grid-empty">
        <span className="media-grid-empty-icon">📷</span>
        <h3>{emptyMessage || 'No media found'}</h3>
        <p>Upload some photos or videos to get started!</p>
      </div>
    );
  }

  return (
    <div className="media-grid">
      {items.map((item, index) => (
        <div key={item._id || index} className="media-grid-item animate-fadeInUp" style={{ animationDelay: `${index * 50}ms` }}>
          <MediaCard media={item} onView={onItemClick} onLike={onLike} />
        </div>
      ))}
    </div>
  );
}
