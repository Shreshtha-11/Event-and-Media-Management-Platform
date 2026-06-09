'use client';
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import LikeButton from '../social/LikeButton';
import CommentSection from '../social/CommentSection';
import FavoriteButton from '../social/FavoriteButton';
import './media.css';

export default function MediaViewer({ media, items = [], initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [showInfo, setShowInfo] = useState(true);
  const current = items[currentIndex] || media;

  const goNext = useCallback(() => {
    if (currentIndex < items.length - 1) setCurrentIndex(i => i + 1);
  }, [currentIndex, items.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  }, [currentIndex]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, goNext, goPrev]);

  if (!current || typeof document === 'undefined') return null;

  return createPortal(
    <div className="media-viewer-overlay" onClick={onClose}>
      <div className="media-viewer-content" onClick={(e) => e.stopPropagation()}>
        <button className="media-viewer-close" onClick={onClose}>✕</button>

        {items.length > 1 && currentIndex > 0 && (
          <button className="media-viewer-nav media-viewer-prev" onClick={goPrev}>‹</button>
        )}
        {items.length > 1 && currentIndex < items.length - 1 && (
          <button className="media-viewer-nav media-viewer-next" onClick={goNext}>›</button>
        )}

        <div className="media-viewer-media">
          {current.type === 'video' ? (
            <video src={current.fileUrl} controls className="media-viewer-image" />
          ) : (
            <img
              src={current.fileUrl || current.thumbnailUrl}
              alt={current.title || 'Media'}
              className="media-viewer-image"
              style={{ transform: `scale(${zoom})` }}
              onError={(e) => { e.target.src = `https://picsum.photos/seed/${current._id}/800/600`; }}
            />
          )}
        </div>

        <div className="media-viewer-controls">
          <button onClick={() => setZoom(z => Math.min(z + 0.25, 3))} title="Zoom in">🔍+</button>
          <button onClick={() => setZoom(1)} title="Reset zoom">↺</button>
          <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} title="Zoom out">🔍−</button>
          <button onClick={() => setShowInfo(v => !v)} title="Toggle info">ℹ️</button>
          <a href={`/api/media/${current._id}/download`} download className="media-viewer-download" title="Download">⬇️</a>
        </div>

        {showInfo && (
          <div className="media-viewer-sidebar">
            <div className="media-viewer-info">
              <h3>{current.title || 'Untitled'}</h3>
              {current.description && <p>{current.description}</p>}
              {current.aiCaption && <p className="ai-caption">🤖 {current.aiCaption}</p>}
              <div className="media-viewer-meta">
                <span>👤 {current.uploader?.name || 'Unknown'}</span>
                <span>📅 {new Date(current.createdAt).toLocaleDateString()}</span>
                {current.event?.title && <span>📸 {current.event.title}</span>}
              </div>
              {current.tags?.length > 0 && (
                <div className="media-viewer-tags">
                  {current.tags.map((tag, i) => <span key={i} className="viewer-tag">#{tag}</span>)}
                </div>
              )}
            </div>
            <div className="media-viewer-actions" style={{display:'flex', gap:'12px'}}>
              <LikeButton mediaId={current._id} initialCount={current.likeCount || 0} initialLiked={false} />
              <FavoriteButton mediaId={current._id} />
            </div>
            <CommentSection mediaId={current._id} />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
