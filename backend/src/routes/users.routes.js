import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { listUsers, createUser, updateUser, deleteUser } from '../controllers/users.controller.js';

const router = express.Router();

router.use(authenticate, authorize(['admin']));
router.get('/', listUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
