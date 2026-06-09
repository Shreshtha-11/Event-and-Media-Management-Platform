'use client';
import { useState } from 'react';
import Modal from '../ui/Modal';
import './social.css';

export default function ShareModal({ isOpen, onClose, shareUrl, title }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share" size="sm">
      <div className="share-modal-content">
        <h3 className="share-title">{title || 'Share this'}</h3>
        <div className="share-url-box">
          <input type="text" value={shareUrl || window.location.href} readOnly className="share-url-input" />
          <button onClick={handleCopy} className={`share-copy-btn ${copied ? 'copied' : ''}`}>{copied ? '✓ Copied!' : 'Copy'}</button>
        </div>
        {shareUrl?.includes('/albums/') && (
          <div className="share-qr-section">
            <h4>QR Code</h4>
            <img src={`/api/qr/${shareUrl.split('/albums/')[1]}`} alt="QR Code" className="share-qr-image" />
          </div>
        )}
        <div className="share-social-links">
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl || '')}`} target="_blank" rel="noopener noreferrer" className="share-social-btn twitter">Twitter</a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl || '')}`} target="_blank" rel="noopener noreferrer" className="share-social-btn facebook">Facebook</a>
          <a href={`https://wa.me/?text=${encodeURIComponent(shareUrl || '')}`} target="_blank" rel="noopener noreferrer" className="share-social-btn whatsapp">WhatsApp</a>
        </div>
      </div>
    </Modal>
  );
}
