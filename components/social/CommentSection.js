'use client';
import { useState, useEffect } from 'react';
import './social.css';

export default function CommentSection({ mediaId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mediaId) return;
    fetch(`/api/media/${mediaId}/comment`).then(r => r.json()).then(data => {
      setComments(Array.isArray(data) ? data : data.comments || []);
    }).catch(() => {});
  }, [mediaId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/media/${mediaId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment }),
      });
      const data = await res.json();
      if (data.comment) setComments(prev => [data.comment, ...prev]);
      setNewComment('');
    } catch {}
    setLoading(false);
  };

  return (
    <div className="comment-section">
      <h4 className="comment-section-title">💬 Comments ({comments.length})</h4>
      <form onSubmit={handleSubmit} className="comment-form">
        <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="comment-input" disabled={loading} />
        <button type="submit" className="comment-submit" disabled={loading || !newComment.trim()}>Post</button>
      </form>
      <div className="comment-list">
        {comments.map((comment, i) => (
          <div key={comment._id || i} className="comment-item animate-fadeIn">
            <div className="comment-avatar">{comment.user?.name?.[0] || '?'}</div>
            <div className="comment-body">
              <span className="comment-author">{comment.user?.name || 'User'}</span>
              <p className="comment-text">{comment.text}</p>
              <span className="comment-time">{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Just now'}</span>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="comment-empty">No comments yet. Be the first!</p>}
      </div>
    </div>
  );
}
