'use client';
import { useState } from 'react';
import './social.css';

export default function TagUsers({ selectedUsers = [], onUsersChange }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async (query) => {
    if (query.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/users?search=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setResults((data.users || []).filter(u => !selectedUsers.find(s => s._id === u._id)));
    } catch {}
    setLoading(false);
  };

  const addUser = (user) => {
    onUsersChange?.([...selectedUsers, user]);
    setSearch('');
    setResults([]);
  };

  const removeUser = (userId) => {
    onUsersChange?.(selectedUsers.filter(u => u._id !== userId));
  };

  return (
    <div className="tag-users">
      <div className="tag-users-selected">
        {selectedUsers.map(user => (
          <span key={user._id} className="tag-user-chip">
            {user.name}
            <button onClick={() => removeUser(user._id)} className="tag-user-remove">×</button>
          </span>
        ))}
      </div>
      <div className="tag-users-search">
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); searchUsers(e.target.value); }} placeholder="Search users to tag..." className="tag-users-input" />
        {results.length > 0 && (
          <div className="tag-users-dropdown">
            {results.map(user => (
              <button key={user._id} className="tag-users-result" onClick={() => addUser(user)}>
                <span className="tag-result-avatar">{user.name?.[0]}</span>
                <span>{user.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
