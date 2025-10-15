const BASE_URL = import.meta.env.VITE_API_BASE || "/api";

export default function TaskCard({ task }) {
  return (
    <div className="card">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">{task.title}</h3>
        <span className="small">
          {task.priority} • {task.status}
        </span>
      </div>
      <p className="small mt-2">{task.description}</p>
      {task.dueDate && (
        <div className="small mt-2">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}

      {task.documents?.length ? (
        <ul className="mt-2">
          {task.documents?.length ? (
            <ul>
              {task.documents.map((doc) => (
                <li key={doc._id || doc.filename}>
                  <a
                    href={`http://localhost:5000${doc.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {doc.originalname || doc.filename}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="small text-gray-500">No documents attached</p>
          )}
        </ul>
      ) : null}
    </div>
  );
}
