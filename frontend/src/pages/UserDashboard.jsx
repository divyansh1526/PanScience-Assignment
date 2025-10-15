import { useEffect, useState } from 'react';
import API from '../api/api';
import TaskCard from '../components/TaskCard';

export default function UserDashboard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [updating, setUpdating] = useState(null);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await API.get('/tasks');
      setTasks(res.data.tasks || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await API.put(`/tasks/${id}`, { status });
      await fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">My Tasks</h2>
      <div className="grid gap-3">
        {tasks.length ? tasks.map(t => (
          <div key={t._id} className="card">
            <TaskCard task={t} />
            <div className="flex items-center gap-3 mt-3">
              <select
                className="input w-auto"
                value={t.status}
                onChange={e => updateStatus(t._id, e.target.value)}
                disabled={updating === t._id}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              {updating === t._id && <span className="small text-gray-500">Updating...</span>}
            </div>
          </div>
        )) : <div className="card">No tasks assigned.</div>}
      </div>
    </div>
  );
}
