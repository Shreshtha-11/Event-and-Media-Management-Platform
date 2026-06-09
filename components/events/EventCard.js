'use client';
import './events.css';

export default function EventCard({ event, onClick }) {
  return (
    <div className="event-card hover-lift" onClick={() => onClick?.(event)}>
      <div className="event-card-image-wrapper">
        <img src={event.coverImage || `https://picsum.photos/seed/${event._id || event.title}/600/400`} alt={event.title} className="event-card-image" onError={(e) => { e.target.src = `https://picsum.photos/seed/${Math.random()}/600/400`; }} />
        <div className="event-card-overlay">
          <span className="event-card-category">{event.category?.replace('_', ' ') || 'Event'}</span>
        </div>
      </div>
      <div className="event-card-content">
        <h3 className="event-card-title">{event.title}</h3>
        <div className="event-card-meta">
          <span className="event-card-date">📅 {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}</span>
          {event.location && <span className="event-card-location">📍 {event.location}</span>}
        </div>
        <div className="event-card-stats">
          <span>📸 {event.albums?.length || 0} albums</span>
          <span>👥 {event.members?.length || 0} members</span>
        </div>
        {event.visibility === 'private' && <span className="event-card-private-badge">🔒 Private</span>}
      </div>
    </div>
  );
}
