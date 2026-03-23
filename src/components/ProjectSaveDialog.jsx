import { useState } from 'react';

export default function ProjectSaveDialog({ initialName, onSave, onCancel }) {
  const [name, setName] = useState(initialName || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      setName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-md">
        <div className="bg-slate-700 px-6 py-4 border-b border-slate-600 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Save Project</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-white text-2xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              autoFocus
              className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
              maxLength={100}
            />
            <p className="text-xs text-slate-500 mt-1">{name.length}/100</p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
