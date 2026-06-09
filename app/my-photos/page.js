'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MediaGrid from '@/components/media/MediaGrid';
import Button from '@/components/ui/Button';
import './my-photos.css';

export default function MyPhotosPage() {
  const { data: session } = useSession();
  const [selfie, setSelfie] = useState(null);
  const [preview, setPreview] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { setSelfie(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSearch = async () => {
    if (!selfie) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('selfie', selfie);
    try {
      const res = await fetch('/api/ai/face', { method: 'POST', body: formData });
      const data = await res.json();
      setMatches(data.matches || []);
    } catch {}
    setLoading(false);
    setSearched(true);
  };

  return (
    <><Navbar user={session?.user} /><Sidebar user={session?.user} />
      <main className="page-wrapper"><div className="page-content" style={{maxWidth:'900px'}}>
        <h1 className="animate-fadeInUp" style={{fontFamily:'var(--font-heading)',marginBottom:'8px'}}>🤳 My Photos</h1>
        <p className="animate-fadeInUp" style={{color:'var(--color-text-muted)',marginBottom:'28px'}}>Upload a selfie to find all photos containing you using facial recognition</p>

        <div className="my-photos-upload glass animate-fadeInUp" style={{animationDelay:'0.1s'}}>
          <div className="selfie-upload-area" onClick={() => document.getElementById('selfie-input')?.click()}>
            {preview ? (
              <img src={preview} alt="Selfie preview" className="selfie-preview" />
            ) : (
              <div className="selfie-placeholder">
                <span className="selfie-icon">🤳</span>
                <h3>Upload Your Selfie</h3>
                <p>Click to select a photo of yourself</p>
              </div>
            )}
            <input id="selfie-input" type="file" accept="image/*" onChange={handleFileChange} style={{display:'none'}} />
          </div>
          {selfie && <Button variant="primary" size="lg" fullWidth onClick={handleSearch} loading={loading} style={{marginTop:'20px'}}>🔍 Find My Photos</Button>}
        </div>

        {loading && (
          <div className="my-photos-scanning animate-fadeIn">
            <div className="scanning-animation"><div className="scan-line" /></div>
            <p>Scanning photos for your face...</p>
          </div>
        )}

        {searched && !loading && (
          <div className="animate-fadeInUp" style={{marginTop:'32px'}}>
            <h2 style={{fontFamily:'var(--font-heading)',marginBottom:'20px'}}>Found {matches.length} matching photos</h2>
            <MediaGrid items={matches} emptyMessage="No matching photos found. Try uploading a clearer selfie." />
          </div>
        )}
      </div></main>
    </>
  );
}
