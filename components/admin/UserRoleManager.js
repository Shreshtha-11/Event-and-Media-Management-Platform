'use client';
import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import './admin.css';

const ROLES = [
  { value: 'viewer', label: '👁️ Viewer', color: '#888' },
  { value: 'club_member', label: '👥 Club Member', color: '#2196F3' },
  { value: 'photographer', label: '📷 Photographer', color: '#FF9800' },
  { value: 'admin', label: '👑 Admin', color: '#F44336' },
];

export default function UserRoleManager() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?limit=100`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch {}
    setLoading(false);
  };

  const handleRoleChange = (user, newRole) => {
    setConfirmModal({ user, newRole });
  };

  const confirmRoleChange = async () => {
    if (!confirmModal) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${confirmModal.user._id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: confirmModal.newRole }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === confirmModal.user._id ? { ...u, role: confirmModal.newRole } : u));
      }
    } catch {}
    setSaving(false);
    setConfirmModal(null);
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="user-role-manager">
      <div className="urm-header">
        <h2>User Management</h2>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="urm-search" />
      </div>

      <div className="urm-table-wrapper">
        <table className="urm-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td>
                  <div className="urm-user-cell">
                    <div className="urm-avatar">{user.name?.[0] || '?'}</div>
                    <span>{user.name}</span>
                  </div>
                </td>
                <td className="urm-email">{user.email}</td>
                <td>
                  <span className="urm-role-badge" style={{ '--role-color': ROLES.find(r => r.value === user.role)?.color }}>
                    {ROLES.find(r => r.value === user.role)?.label || user.role}
                  </span>
                </td>
                <td>
                  <select value={user.role} onChange={(e) => handleRoleChange(user, e.target.value)} className="urm-role-select">
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="urm-loading">Loading users...</div>}
      </div>

      <Modal isOpen={!!confirmModal} onClose={() => setConfirmModal(null)} title="Confirm Role Change" size="sm">
        <div className="urm-confirm">
          <p>Change <strong>{confirmModal?.user?.name}</strong>'s role to <strong>{ROLES.find(r => r.value === confirmModal?.newRole)?.label}</strong>?</p>
          <div className="urm-confirm-actions">
            <Button variant="ghost" onClick={() => setConfirmModal(null)}>Cancel</Button>
            <Button variant="primary" onClick={confirmRoleChange} loading={saving}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
