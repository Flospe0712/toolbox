export default function TextEditor({ text, onTextChange }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Text</h2>

      {/* Headline */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Headline
        </label>
        <input
          type="text"
          value={text.headline}
          onChange={(e) => onTextChange('headline', e.target.value)}
          placeholder="Main title"
          className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
          maxLength={100}
        />
        <p className="text-xs text-slate-500 mt-1">{text.headline.length}/100</p>
      </div>

      {/* Subheadline */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Subheadline
        </label>
        <input
          type="text"
          value={text.subheadline}
          onChange={(e) => onTextChange('subheadline', e.target.value)}
          placeholder="Subtitle or tagline"
          className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
          maxLength={80}
        />
        <p className="text-xs text-slate-500 mt-1">{text.subheadline.length}/80</p>
      </div>

      {/* Topic */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Topic
        </label>
        <input
          type="text"
          value={text.topic}
          onChange={(e) => onTextChange('topic', e.target.value)}
          placeholder="Video topic or hashtag"
          className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
          maxLength={50}
        />
        <p className="text-xs text-slate-500 mt-1">{text.topic.length}/50</p>
      </div>
    </div>
  );
}
