import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const genAccess = user => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
const genRefresh = user => jwt.sign({ id: user._id, tokenVersion: user.tokenVersion }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

const sendRefresh = (res, token) => {
  res.cookie('jid', token, { httpOnly: true, sameSite: 'lax', path: '/api/auth/refresh', maxAge: 7 * 86400000 });
};

export const register = async (req, res) => {
  const { email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User exists' });
  const user = new User({ email, password, role: role || 'user' });
  await user.save();
  const access = genAccess(user);
  const refresh = genRefresh(user);
  sendRefresh(res, refresh);
  res.json({ user: { id: user._id, email, role: user.role }, access });
};

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.role !== 'admin') {
            res.clearCookie('jid', { path: '/api/auth/refresh' });
            return res.status(403).json({ message: 'Access denied: Admin role required.' });
        }

        const access = genAccess(user);
        const refresh = genRefresh(user);
        sendRefresh(res, refresh);
        res.json({ user: { id: user._id, email, role: user.role }, access });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error during admin login.' });
    }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) return res.status(400).json({ message: 'Invalid credentials' });
  const access = genAccess(user);
  const refresh = genRefresh(user);
  sendRefresh(res, refresh);
  res.json({ user: { id: user._id, email, role: user.role }, access });
};

export const refresh = async (req, res) => {
  const token = req.cookies.jid;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  try {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.id);
    if (!user || payload.tokenVersion !== user.tokenVersion) return res.status(401).json({ message: 'Token expired' });
    const newAccess = genAccess(user);
    const newRefresh = genRefresh(user);
    sendRefresh(res, newRefresh);
    res.json({ access: newAccess });
  } catch {
    res.status(401).json({ message: 'Invalid refresh' });
  }
};


export const logout = (_, res) => {
  res.clearCookie('jid', { path: '/api/auth/refresh' });
  res.json({ ok: true });
};
