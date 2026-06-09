'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './auth.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    if (result?.error) { setError('Invalid email or password'); setLoading(false); }
    else router.push('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-floating-shapes"><div className="auth-shape shape-1" /><div className="auth-shape shape-2" /><div className="auth-shape shape-3" /></div>
          <Link href="/" className="auth-brand"><span className="auth-brand-icon">📷</span><span className="auth-brand-name">EventFrame</span></Link>
          <h2 className="auth-tagline">Welcome back!<br /><span className="gradient-text">Manage your events.</span></h2>
          <p className="auth-tagline-sub">Access your photos, events, and team — all in one place.</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-card glass">
          <h1 className="auth-form-title">Sign In</h1>
          <p className="auth-form-subtitle">Enter your credentials to continue</p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required placeholder="you@example.com" /></div>
            <div className="auth-field"><label>Password</label><input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required placeholder="Enter password" /></div>
            <div className="auth-options"><label className="auth-remember"><input type="checkbox" /> Remember me</label><a href="#" className="auth-forgot">Forgot password?</a></div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
          </form>
          <p className="auth-switch">Don't have an account? <Link href="/register">Create one</Link></p>
        </div>
      </div>
    </div>
  );
}
