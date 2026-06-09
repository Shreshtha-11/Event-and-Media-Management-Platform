'use client';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import ThemeSelector from '@/components/ui/ThemeSelector';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import './settings.css';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState({ name: session?.user?.name || '', bio: '', email: session?.user?.email || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/users/${session?.user?.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } catch {}
    setSaving(false);
  };

  return (
    <><Navbar user={session?.user} /><Sidebar user={session?.user} />
      <main className="page-wrapper"><div className="page-content" style={{maxWidth:'800px'}}>
        <h1 className="animate-fadeInUp" style={{fontFamily:'var(--font-heading)',marginBottom:'28px'}}>⚙️ Settings</h1>

        <Card glassmorphism className="settings-section animate-fadeInUp" style={{animationDelay:'0.1s'}}>
          <h2 className="settings-section-title">🎨 Theme Settings</h2>
          <p style={{color:'var(--color-text-muted)',marginBottom:'20px'}}>Choose your preferred color scheme and mode</p>
          <ThemeSelector />
        </Card>

        <Card glassmorphism className="settings-section animate-fadeInUp" style={{animationDelay:'0.2s'}}>
          <h2 className="settings-section-title">👤 Account Settings</h2>
          <div className="settings-form">
            <Input label="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
            <Input label="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} type="email" />
            <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
              <label style={{fontSize:'0.85rem',fontWeight:'600',color:'var(--color-text-secondary)'}}>Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} placeholder="Tell us about yourself..." style={{padding:'12px 16px',border:'1px solid var(--color-border)',borderRadius:'var(--radius-md)',background:'var(--color-bg)',color:'var(--color-text)',fontFamily:'var(--font-body)',fontSize:'0.95rem',resize:'vertical',minHeight:'80px',outline:'none'}} />
            </div>
            <Button variant="primary" onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        </Card>

        <Card glassmorphism className="settings-section animate-fadeInUp" style={{animationDelay:'0.3s'}}>
          <h2 className="settings-section-title">🔒 Privacy Settings</h2>
          <div className="settings-toggle-group">
            <div className="settings-toggle-item"><span>Default upload visibility</span><select className="events-filter-select"><option>Public</option><option>Private</option></select></div>
            <div className="settings-toggle-item"><span>Show profile to others</span><label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="toggle-slider" /></label></div>
          </div>
        </Card>

        <Card glassmorphism className="settings-section animate-fadeInUp" style={{animationDelay:'0.4s'}}>
          <h2 className="settings-section-title">🔔 Notification Preferences</h2>
          <div className="settings-toggle-group">
            {['Likes','Comments','Tags','Event invites','System updates'].map((label,i)=>(
              <div key={i} className="settings-toggle-item"><span>{label}</span><label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="toggle-slider" /></label></div>
            ))}
          </div>
        </Card>
      </div></main>
    </>
  );
}
