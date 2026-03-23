import { useNavigate } from 'react-router-dom';

export default function ToolCard({ tool }) {
  const navigate = useNavigate();

  const statusColors = {
    active: 'bg-green-500',
    dev: 'bg-amber-500',
    planned: 'bg-indigo-500'
  };

  return (
    <div
      onClick={() => navigate(`/tool/${tool.id}`)}
      className="bg-slate-800 border border-slate-700 rounded-lg p-6 cursor-pointer transition-all hover:border-slate-600 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="text-4xl mb-3">{tool.icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{tool.name}</h3>
      <p className="text-sm text-slate-300 mb-4 line-clamp-2">{tool.description}</p>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full text-white ${statusColors[tool.status]}`}>
          {tool.status}
        </span>
        <span className="text-blue-400 text-sm font-medium">Open →</span>
      </div>
    </div>
  );
}
