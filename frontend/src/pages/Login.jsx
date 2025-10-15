import { useState } from 'react';
import API, { setAccessToken } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function Login({ onSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await API.post('/auth/login', form);
      const token = res.data.access || res.data.accessToken || res.data.token;
      const user = res.data.user;
      if (token) {
        localStorage.setItem('token', token);
        setAccessToken(token);
      }

      if (onSuccess) onSuccess(user, token);
      else {
        if (user.role === 'admin') navigate('/admin'); else navigate('/user');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-xl mb-4">Login</h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input className="input" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <button className="btn" type="submit">Login</button>
        {error && <div className="text-red-600 small">{error}</div>}
      </form>
    </div>
  );
}
