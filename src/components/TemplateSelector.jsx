export default function TemplateSelector({ templates, selectedTemplate, onSelectTemplate }) {
  return (
    <div className="space-y-3">
      <label className="block text-lg font-semibold text-white">
        Template
      </label>
      <select
        value={selectedTemplate}
        onChange={(e) => onSelectTemplate(e.target.value)}
        className="w-full px-4 py-3 bg-slate-700 text-white border border-slate-600 rounded focus:outline-none focus:border-blue-400 transition-colors"
      >
        {templates.map(template => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>

      {/* Preview Image */}
      <div className="mt-4 border border-slate-700 rounded overflow-hidden aspect-video bg-slate-800">
        {templates.find(t => t.id === selectedTemplate)?.preview ? (
          <img
            src={templates.find(t => t.id === selectedTemplate).preview}
            alt="Template preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-slate-400">No preview available</p>
          </div>
        )}
      </div>
    </div>
  );
}
