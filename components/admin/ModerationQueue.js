'use client';
import { useState } from 'react';
import Button from '../ui/Button';
import './admin.css';

export default function ModerationQueue({ items = [], onApprove, onReject }) {
  return (
    <div className="moderation-queue">
      {items.length === 0 ? (
        <div className="moderation-empty">
          <span className="moderation-empty-icon">✅</span>
          <h3>All Clear!</h3>
          <p>No items pending moderation.</p>
        </div>
      ) : (
        <div className="moderation-grid">
          {items.map((item) => (
            <div key={item._id} className="moderation-card">
              <div className="moderation-image-wrapper">
                <img src={item.fileUrl || item.thumbnailUrl} alt={item.title || 'Media'} className="moderation-image" onError={(e) => { e.target.src = `https://picsum.photos/seed/${item._id}/300/300`; }} />
                {item.flags && <div className="moderation-flags">{item.flags.map((f, i) => <span key={i} className="moderation-flag">{f}</span>)}</div>}
              </div>
              <div className="moderation-info">
                <p className="moderation-title">{item.title || 'Untitled'}</p>
                <p className="moderation-uploader">By {item.uploader?.name || 'Unknown'}</p>
              </div>
              <div className="moderation-actions">
                <Button variant="primary" size="sm" onClick={() => onApprove?.(item._id)}>✓ Approve</Button>
                <Button variant="danger" size="sm" onClick={() => onReject?.(item._id)}>✕ Reject</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
