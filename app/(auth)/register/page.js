'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './auth.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++; if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strength = passwordStrength();
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['', '#FF1744', '#FF9800', '#FFB300', '#4CAF50', '#00C853'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return; }
      await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      router.push('/dashboard');
    } catch { setError('Something went wrong'); setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-floating-shapes"><div className="auth-shape shape-1" /><div className="auth-shape shape-2" /><div className="auth-shape shape-3" /></div>
          <Link href="/" className="auth-brand"><span className="auth-brand-icon">📷</span><span className="auth-brand-name">EventFrame</span></Link>
          <h2 className="auth-tagline">Join the platform.<br /><span className="gradient-text">Share your moments.</span></h2>
          <p className="auth-tagline-sub">Create your account and start managing event media today.</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-card glass">
          <h1 className="auth-form-title">Create Account</h1>
          <p className="auth-form-subtitle">Fill in your details to get started</p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field"><label>Full Name</label><input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required placeholder="John Doe" /></div>
            <div className="auth-field"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required placeholder="you@example.com" /></div>
            <div className="auth-field"><label>Password</label><input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required placeholder="Create a password" />
              {form.password && <div className="password-strength"><div className="strength-bar"><div className="strength-fill" style={{ width: `${strength * 20}%`, background: strengthColors[strength] }} /></div><span className="strength-label" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</span></div>}
            </div>
            <div className="auth-field"><label>Confirm Password</label><input type="password" value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})} required placeholder="Confirm your password" /></div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
          </form>
          <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
