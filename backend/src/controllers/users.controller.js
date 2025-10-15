import Task from '../models/Task.js';
import User from '../models/User.js';

export const listUsers = async (req, res) => {
  const page = parseInt(req.query.page || 1);
  const limit = parseInt(req.query.limit || 10);
  const skip = (page-1)*limit;
  const query = {};
  const total = await User.countDocuments(query);
  const users = await User.find(query).select('-password').skip(skip).limit(limit);
  res.json({ total, page, limit, users });
};

export const createUser = async (req, res) => {
  const { email, password, role } = req.body;
  const u = new User({ email, password, role });
  await u.save();
  res.status(201).json({ id: u._id, email: u.email, role: u.role });
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  if (updates.password) {
    const user = await User.findById(id);
    user.password = updates.password;
    if (updates.role) user.role = updates.role;
    if (updates.email) user.email = updates.email;
    await user.save();
    return res.json({ id: user._id, email: user.email, role: user.role });
  }
  const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
  res.json(user);
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const deletedTasks = await Task.deleteMany({ assignedTo: id });

    await User.findByIdAndDelete(id);

    res.json({
      message: `✅ User deleted successfully.`,
      deletedTasks: deletedTasks.deletedCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting user.', error: error.message });
  }
};
