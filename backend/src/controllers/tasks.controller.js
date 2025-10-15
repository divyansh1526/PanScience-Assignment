import Task from '../models/Task.js';

export const listTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, assignedTo, sort = '-createdAt' } = req.query;
    const query = {};

    if (req.user.role !== 'admin') {
      query.assignedTo = req.user._id;
    } else {
      if (assignedTo) query.assignedTo = assignedTo;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate('assignedTo', 'email role')
      .populate('createdBy', 'email role')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ total, page: parseInt(page), limit: parseInt(limit), tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tasks.', error: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    if (!title || !assignedTo) {
      return res.status(400).json({ message: 'Title and assigned user are required.' });
    }

    const documents = req.files?.map(f => ({
      filename: f.filename,
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      url: `/uploads/${f.filename}`
    })) || [];

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user._id,
      documents
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating task.', error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Task.findById(id);
    if (!existing) return res.status(404).json({ message: 'Task not found.' });

    if (req.user.role === 'admin') {
      const updates = req.body;
      if (req.files?.length) {
        const docs = req.files.map(f => ({
          filename: f.filename,
          originalname: f.originalname,
          mimetype: f.mimetype,
          size: f.size,
          url: `/uploads/${f.filename}`
        }));
        existing.documents = existing.documents.concat(docs);
      }
      Object.assign(existing, updates);
      await existing.save();
      return res.json(existing);
    }

    if (req.user.role === 'user') {
      if (existing.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: You can only modify your assigned tasks.' });
      }

      const { status } = req.body;
      if (!status || !['pending', 'in-progress', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status update.' });
      }

      existing.status = status;
      await existing.save();
      return res.json({ message: `Task status updated to ${status}.`, task: existing });
    }

    res.status(403).json({ message: 'Forbidden.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating task.', error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Task not found.' });

    res.json({ message: '✅ Task deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting task.', error: error.message });
  }
};

