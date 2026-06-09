'use client';
import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import './events.css';

const CATEGORIES = [
  { value: 'photoshoot', label: '📷 Photoshoot' },
  { value: 'workshop', label: '🎓 Workshop' },
  { value: 'trip', label: '✈️ Trip' },
  { value: 'competition', label: '🏆 Competition' },
  { value: 'cultural_fest', label: '🎭 Cultural Fest' },
  { value: 'party', label: '🎉 Party' },
  { value: 'other', label: '📌 Other' },
];

export default function EventForm({ event, onSubmit, loading }) {
  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    category: event?.category || 'other',
    date: event?.date ? new Date(event.date).toISOString().split('T')[0] : '',
    location: event?.location || '',
    visibility: event?.visibility || 'public',
    tags: event?.tags?.join(', ') || '',
    coverImage: event?.coverImage || '',
  });

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value || e.target?.checked }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <Input label="Event Title" value={form.title} onChange={handleChange('title')} required placeholder="Enter event name..." />
      <div className="event-form-row">
        <div className="event-form-field">
          <label className="event-form-label">Category</label>
          <select value={form.category} onChange={handleChange('category')} className="event-form-select">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <Input label="Date" type="date" value={form.date} onChange={handleChange('date')} />
      </div>
      <Input label="Location" value={form.location} onChange={handleChange('location')} placeholder="Where is this event?" icon="📍" />
      <Input label="Cover Image URL" value={form.coverImage} onChange={handleChange('coverImage')} placeholder="https://..." icon="🖼️" />
      <div className="event-form-field">
        <label className="event-form-label">Description</label>
        <textarea value={form.description} onChange={handleChange('description')} placeholder="Describe the event..." className="event-form-textarea" rows={4} />
      </div>
      <Input label="Tags" value={form.tags} onChange={handleChange('tags')} placeholder="photography, outdoor, fun (comma separated)" />
      <div className="event-form-field">
        <label className="event-form-label">Visibility</label>
        <div className="event-form-visibility">
          <label className={`visibility-option ${form.visibility === 'public' ? 'active' : ''}`}>
            <input type="radio" name="visibility" value="public" checked={form.visibility === 'public'} onChange={handleChange('visibility')} />
            🌍 Public
          </label>
          <label className={`visibility-option ${form.visibility === 'private' ? 'active' : ''}`}>
            <input type="radio" name="visibility" value="private" checked={form.visibility === 'private'} onChange={handleChange('visibility')} />
            🔒 Private
          </label>
        </div>
      </div>
      <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>{event ? 'Update Event' : 'Create Event'}</Button>
    </form>
  );
}
