import { useState, useEffect } from 'react';
import * as projectService from '../utils/projectService';

export default function ProjectManager({ onClose, onLoadProject, onDeleteProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const loadProjects = async () => {
      const list = await projectService.getAllProjects();
      setProjects(list || []);
      setLoading(false);
    };
    loadProjects();
  }, []);

  const handleDelete = async (projectId) => {
    const success = await projectService.deleteProject(projectId);
    if (success) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      onDeleteProject(projectId);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-md max-h-96 flex flex-col">
        {/* Header */}
        <div className="bg-slate-700 px-6 py-4 border-b border-slate-600 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Your Projects</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">✕</button>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && <p className="text-slate-400">Loading projects...</p>}
          {!loading && projects.length === 0 && <p className="text-slate-400">No projects yet. Create one!</p>}
          {projects.map(project => (
            <div key={project.id} className="border border-slate-700 rounded p-3 hover:bg-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => onLoadProject(project.id)}>
                  <p className="text-white hover:text-blue-400 font-medium">{project.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(project.updatedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setDeleteConfirm(project.id)}
                  className="ml-2 px-2 py-1 bg-red-900 hover:bg-red-800 text-red-200 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="bg-slate-900 border border-red-700 rounded p-6 w-80 text-center">
              <p className="text-white mb-4">
                Delete "{projects.find(p => p.id === deleteConfirm)?.name}"?
              </p>
              <p className="text-slate-400 text-sm mb-6">This cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-700 px-6 py-3 border-t border-slate-600 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
