'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * useMediaUpload
 *
 * @param {string} eventId  — the event to associate uploads with
 * @param {string} [albumId] — optional album id
 * @returns {{ upload, uploading, progress, uploadedFiles, error, reset }}
 */
export function useMediaUpload(eventId, albumId) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  /**
   * Upload a single file using XMLHttpRequest for progress tracking.
   */
  const uploadSingleFile = useCallback(
    (file) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('eventId', eventId);
        if (albumId) formData.append('albumId', albumId);

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            resolve.__singleProgress = Math.round((e.loaded / e.total) * 100);
          }
        });

        xhr.addEventListener('load', async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const uploadResult = JSON.parse(xhr.responseText);

              // Register the media entry in the database
              const metaRes = await fetch('/api/media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  eventId,
                  albumId: albumId || undefined,
                  url: uploadResult.url,
                  filename: file.name,
                  type: file.type,
                  size: file.size,
                }),
              });

              if (!metaRes.ok) {
                throw new Error('Failed to register media');
              }

              const media = await metaRes.json();
              resolve(media);
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload network error')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

        xhr.open('POST', '/api/upload');
        xhr.send(formData);

        // Store for potential abort
        abortRef.current = xhr;
      });
    },
    [eventId, albumId]
  );

  /**
   * Upload one or more files with aggregate progress tracking.
   */
  const upload = useCallback(
    async (files) => {
      const fileList = Array.from(files);
      if (fileList.length === 0) return [];

      setUploading(true);
      setProgress(0);
      setError(null);

      const results = [];
      const total = fileList.length;

      try {
        for (let i = 0; i < total; i++) {
          const result = await uploadSingleFile(fileList[i]);
          results.push(result);
          const pct = Math.round(((i + 1) / total) * 100);
          setProgress(pct);
        }

        setUploadedFiles((prev) => [...prev, ...results]);
        return results;
      } catch (err) {
        setError(err.message || 'Upload failed');
        throw err;
      } finally {
        setUploading(false);
        abortRef.current = null;
      }
    },
    [uploadSingleFile]
  );

  const reset = useCallback(() => {
    // Abort in-flight upload if any
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setUploading(false);
    setProgress(0);
    setUploadedFiles([]);
    setError(null);
  }, []);

  return { upload, uploading, progress, uploadedFiles, error, reset };
}

export default useMediaUpload;
