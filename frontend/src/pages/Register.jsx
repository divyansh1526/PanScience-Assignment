import { useState } from 'react';
import API, { setAccessToken } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function Register({ onSuccess }) {
  const [form, setForm] = useState({ email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await API.post('/auth/register', form);
      const token = res.data.access || res.data.accessToken || res.data.access;
      const user = res.data.user;
      setAccessToken(token);
      if (onSuccess) onSuccess(user, token);
      else {
        if (user.role === 'admin') navigate('/admin'); else navigate('/user');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-xl mb-4">Register</h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input className="input" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="input" placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn" type="submit">Register</button>
        {error && <div className="text-red-600 small">{error}</div>}
      </form>
    </div>
  );
}
