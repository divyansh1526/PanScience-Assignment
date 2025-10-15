import express from 'express';
import { register, login, adminLogin, refresh, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;
