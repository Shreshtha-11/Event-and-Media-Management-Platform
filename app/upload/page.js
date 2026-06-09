'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import UploadDropzone from '@/components/media/UploadDropzone';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import './upload.css';

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ eventId: '', albumId: '', title: '', description: '', tags: '', visibility: 'public' });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);

  useEffect(() => { if (status === 'unauthenticated') router.push('/login'); }, [status, router]);
  useEffect(() => { 
    fetch('/api/events?limit=100').then(r=>r.json()).then(d=>setEvents(Array.isArray(d)?d:d.events||[])).catch(()=>{}); 
    const params = new URLSearchParams(window.location.search);
    if (params.get('albumId') || params.get('eventId')) {
      setForm(prev => ({ ...prev, albumId: params.get('albumId') || '', eventId: params.get('eventId') || '' }));
    }
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true); setProgress(0);
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    if (form.eventId) formData.append('eventId', form.eventId);
    if (form.albumId) formData.append('albumId', form.albumId);
    formData.append('visibility', form.visibility);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      setResults(data.results || []);
      setProgress(100);
    } catch {}
    setUploading(false);
  };

  return (
    <><Navbar user={session?.user} /><Sidebar user={session?.user} />
      <main className="page-wrapper"><div className="page-content" style={{maxWidth:'900px'}}>
        <h1 className="animate-fadeInUp" style={{fontFamily:'var(--font-heading)',marginBottom:'8px'}}>📤 Upload Media</h1>
        <p className="animate-fadeInUp" style={{color:'var(--color-text-muted)',marginBottom:'28px'}}>Drag & drop or browse to upload photos and videos</p>
        <div className="animate-fadeInUp" style={{animationDelay:'0.1s'}}>
          <UploadDropzone onFilesSelected={setFiles} />
        </div>
        {files.length > 0 && (
          <div className="upload-form-section glass animate-fadeInUp" style={{animationDelay:'0.2s'}}>
            <h3 style={{fontFamily:'var(--font-heading)',marginBottom:'20px'}}>Upload Details</h3>
            <div className="upload-form-grid">
              <div className="upload-form-field">
                <label>Event</label>
                <select value={form.eventId} onChange={(e)=>setForm({...form,eventId:e.target.value})} className="upload-select">
                  <option value="">No event</option>
                  {events.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                </select>
              </div>
              <div className="upload-form-field">
                <label>Visibility</label>
                <select value={form.visibility} onChange={(e)=>setForm({...form,visibility:e.target.value})} className="upload-select">
                  <option value="public">🌍 Public</option><option value="private">🔒 Private</option>
                </select>
              </div>
            </div>
            <Input label="Tags" value={form.tags} onChange={(e)=>setForm({...form,tags:e.target.value})} placeholder="nature, party, fun (comma separated)" />
            {uploading && <div className="upload-progress"><div className="upload-progress-bar" style={{width:`${progress}%`}} /><span>{progress}%</span></div>}
            <Button variant="primary" size="lg" fullWidth onClick={handleUpload} loading={uploading} style={{marginTop:'20px'}}>
              Upload {files.length} File{files.length > 1 ? 's' : ''}
            </Button>
          </div>
        )}
        {results.length > 0 && (
          <div className="upload-results glass animate-fadeInUp">
            <h3>✅ Upload Complete!</h3>
            <p>{results.filter(r=>!r.duplicate).length} files uploaded, {results.filter(r=>r.duplicate).length} duplicates skipped.</p>
            <Button variant="outline" onClick={()=>router.push('/explore')} style={{marginTop:'16px'}}>View in Explore →</Button>
          </div>
        )}
      </div></main>
    </>
  );
}
