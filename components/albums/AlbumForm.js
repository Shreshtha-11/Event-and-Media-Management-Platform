'use client';
import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function AlbumForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    event: '',
    visibility: 'public',
  });
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('/api/events?limit=50').then(r => r.json()).then(data => {
      setEvents(Array.isArray(data) ? data : data.events || []);
    }).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'20px'}}>
      <Input label="Album Title" name="title" value={form.title} onChange={handleChange} required />
      
      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
        <label style={{fontSize:'0.9rem',fontWeight:500,color:'var(--color-text-secondary)'}}>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={4} style={{padding:'12px 16px',borderRadius:'var(--radius-md)',border:'1px solid var(--color-border)',background:'var(--color-surface)',color:'var(--color-text)',fontFamily:'var(--font-body)',resize:'vertical',outline:'none',transition:'border-color 0.2s'}} />
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
        <label style={{fontSize:'0.9rem',fontWeight:500,color:'var(--color-text-secondary)'}}>Associated Event (Optional)</label>
        <select name="event" value={form.event} onChange={handleChange} style={{padding:'12px 16px',borderRadius:'var(--radius-md)',border:'1px solid var(--color-border)',background:'var(--color-surface)',color:'var(--color-text)',fontFamily:'var(--font-body)',outline:'none',cursor:'pointer'}}>
          <option value="">No Event</option>
          {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
        </select>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
        <label style={{fontSize:'0.9rem',fontWeight:500,color:'var(--color-text-secondary)'}}>Visibility</label>
        <select name="visibility" value={form.visibility} onChange={handleChange} style={{padding:'12px 16px',borderRadius:'var(--radius-md)',border:'1px solid var(--color-border)',background:'var(--color-surface)',color:'var(--color-text)',fontFamily:'var(--font-body)',outline:'none',cursor:'pointer'}}>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      <Button type="submit" variant="primary" loading={loading} style={{marginTop:'12px'}}>Create Album</Button>
    </form>
  );
}
