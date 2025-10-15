import express from 'express';
import { upload } from '../middleware/upload.middleware.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  createTask,
  listTasks,
  updateTask,
  deleteTask
} from '../controllers/tasks.controller.js';

const router = express.Router();

router.use(authenticate);
router.post('/', authorize(['admin']), upload.array('documents', 5), createTask);
router.delete('/:id', authorize(['admin']), deleteTask);
router.put('/:id', upload.array('documents', 5), updateTask);
router.get('/', listTasks);

export default router;
