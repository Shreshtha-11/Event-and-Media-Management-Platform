'use client';
import { useState, useRef, useCallback } from 'react';
import { formatFileSize } from '@/lib/utils';
import './media.css';

export default function UploadDropzone({ onFilesSelected, acceptedTypes = 'image/*,video/*', maxSize = 50 * 1024 * 1024 }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const inputRef = useRef(null);

  const handleFiles = useCallback((newFiles) => {
    const validFiles = Array.from(newFiles).filter(f => {
      if (f.size > maxSize) return false;
      if (!f.type.startsWith('image/') && !f.type.startsWith('video/')) return false;
      return true;
    });

    const newPreviews = validFiles.map(f => ({
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    }));

    setFiles(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
    onFilesSelected?.([...files, ...validFiles]);
  }, [files, maxSize, onFilesSelected]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    if (previews[index]?.preview) URL.revokeObjectURL(previews[index].preview);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    onFilesSelected?.(newFiles);
  };

  const clearAll = () => {
    previews.forEach(p => p.preview && URL.revokeObjectURL(p.preview));
    setFiles([]);
    setPreviews([]);
    onFilesSelected?.([]);
  };

  return (
    <div className="upload-dropzone-container">
      <div
        className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${files.length > 0 ? 'has-files' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" multiple accept={acceptedTypes} onChange={(e) => handleFiles(e.target.files)} style={{ display: 'none' }} />
        <div className="upload-dropzone-content">
          <span className="upload-icon">📁</span>
          <h3>Drag & drop files here</h3>
          <p>or click to browse</p>
          <p className="upload-hint">Supports images & videos up to {formatFileSize(maxSize)}</p>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="upload-preview-section">
          <div className="upload-preview-header">
            <h4>{previews.length} file(s) selected</h4>
            <button className="upload-clear-btn" onClick={clearAll}>Clear All</button>
          </div>
          <div className="upload-preview-grid">
            {previews.map((p, i) => (
              <div key={i} className="upload-preview-item">
                {p.preview ? (
                  <img src={p.preview} alt={p.name} className="upload-preview-image" />
                ) : (
                  <div className="upload-preview-video">🎬</div>
                )}
                <div className="upload-preview-info">
                  <span className="upload-preview-name">{p.name}</span>
                  <span className="upload-preview-size">{formatFileSize(p.size)}</span>
                </div>
                <button className="upload-preview-remove" onClick={(e) => { e.stopPropagation(); removeFile(i); }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
