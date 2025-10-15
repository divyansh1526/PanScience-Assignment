import { useEffect, useState } from "react";
import API from "../api/api";
import TaskCard from "../components/TaskCard";

export default function AdminDashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    role: "user",
  });
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    assignedTo: "",
    documents: [],
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uRes, tRes] = await Promise.all([
        API.get("/users"),
        API.get("/tasks"),
      ]);
      setUsers(uRes.data.users || uRes.data);
      setTasks(tRes.data.tasks || tRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await API.post("/users", newUser);
      setNewUser({ email: "", password: "", role: "user" });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleFileChange = (e) => {
    setNewTask({ ...newTask, documents: Array.from(e.target.files) });
  };

  const createTask = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      for (const key of [
        "title",
        "description",
        "priority",
        "dueDate",
        "assignedTo",
      ]) {
        formData.append(key, newTask[key]);
      }
      for (const f of newTask.documents) {
        formData.append("documents", f);
      }

      await API.post("/tasks", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) => {
          const percent = Math.round((p.loaded * 100) / p.total);
        },
      });

      alert("✅ Task created");
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        assignedTo: "",
        documents: [],
      });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Task creation failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl mb-4 font-bold">Admin Dashboard</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-lg mb-3">Create User</h3>
          <form onSubmit={createUser} className="flex flex-col gap-2">
            <input
              className="input"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />
            <input
              className="input"
              placeholder="Password"
              type="password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />
            <select
              className="input"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button className="btn" type="submit">
              Create
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="text-lg mb-3">Create Task</h3>
          <form
            onSubmit={createTask}
            className="flex flex-col gap-2"
            encType="multipart/form-data"
          >
            <input
              className="input"
              placeholder="Title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />
            <textarea
              className="input"
              placeholder="Description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
            <select
              className="input"
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({ ...newTask, priority: e.target.value })
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              className="input"
              type="date"
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask({ ...newTask, dueDate: e.target.value })
              }
            />
            <select
              className="input"
              value={newTask.assignedTo}
              onChange={(e) =>
                setNewTask({ ...newTask, assignedTo: e.target.value })
              }
            >
              <option value="">--Assign to user--</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.email}
                </option>
              ))}
            </select>
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="input"
            />
            <button disabled={uploading} className="btn" type="submit">
              {uploading ? "Uploading..." : "Create Task"}
            </button>
          </form>
        </div>
      </div>

      <div className="card mt-3.5">
        <h3 className="text-lg mb-3">Users</h3>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ul>
            {users.length === 0 && <li>No users Created</li>}
            {users.map((u) => (
              <li key={u._id} className="flex justify-between py-2 border-b">
                <div>
                  <div className="font-medium">{u.email}</div>
                  <div className="small">{u.role}</div>
                </div>
                <button
                  className="bg-red-500 px-3 rounded-2xl cursor-pointer"
                  onClick={async () => {
                    if (confirm(`Delete user ${u.email}?`)) {
                      try {
                        await API.delete(`/users/${u._id}`);
                        alert("User deleted");
                        fetchAll();
                      } catch (err) {
                        alert(
                          err.response?.data?.message || "Failed to delete"
                        );
                      }
                    }
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card mt-6">
        <h3 className="text-xl mb-3">All Tasks</h3>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid gap-3">
            {tasks.length === 0 && <div>No tasks Created</div>}
            {tasks.map((t) => (
              <div key={t._id} className="card">
                <TaskCard task={t} />
                <div className="flex justify-end">
                  <button
                    className="bg-red-500 px-3 py-2 rounded-2xl mt-2 cursor-pointer"
                    onClick={async () => {
                      if (confirm(`Delete task "${t.title}"?`)) {
                        try {
                          await API.delete(`/tasks/${t._id}`);
                          alert("Task deleted");
                          fetchAll();
                        } catch (err) {
                          alert(
                            err.response?.data?.message ||
                              "Failed to delete task"
                          );
                        }
                      }
                    }}
                  >
                    Delete Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
