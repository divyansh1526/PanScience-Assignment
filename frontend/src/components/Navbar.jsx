import { Link } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-green-400 shadow p-4 mb-6">
      <div className="container flex justify-between items-center">
        <div className="text-xl font-semibold">PanScience</div>
        <div className="flex gap-4 items-center">
          {!user && <Link to="/login" className="text-sm small text-black font-semibold">Login</Link>}
          {!user && <Link to="/register" className="text-sm small font-semibold">Register</Link>}
          {user && user.role === 'admin' && <Link to="/admin" className="text-sm small">Admin</Link>}
          {user && user.role === 'user' && <Link to="/user" className="text-sm small">My Tasks</Link>}
          {user ? (
            <button onClick={onLogout} className="btn text-sm cursor-pointer">Logout</button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
