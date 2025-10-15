import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import API, { setAccessToken } from './api/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    setAccessToken(token);
    API.get('/auth/me')
      .then((res) => {
        if (res?.data?.user) setUser(res.data.user);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = (userObj, token) => {
    setUser(userObj);
    localStorage.setItem('token', token);
    setAccessToken(token);
    if (userObj.role === 'admin') navigate('/admin');
    else navigate('/user');
  };

  const handleLogout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (e) { /* ignore */ }
    setUser(null);
    localStorage.removeItem('token');
    setAccessToken(null);
    navigate('/login');
  };
  if (loading) return <div className="text-center mt-10 text-lg">Checking session...</div>;

  return (
    <div className='bg-slate-400 min-h-screen'>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="container p-6">
        <Routes>
          <Route path="/" element={<Login onSuccess={handleLogin} />} />
          <Route path="/login" element={<Login onSuccess={handleLogin} />} />
          <Route path="/register" element={<Register onSuccess={handleLogin} />} />
          <Route path="/admin" element={<AdminDashboard user={user} />} />
          <Route path="/user" element={<UserDashboard user={user} />} />
        </Routes>
      </div>
    </div>
  );
}
