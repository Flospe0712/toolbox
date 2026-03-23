export default function ColorPicker({ colors, onColorChange }) {
  const palettes = {
    default: {
      name: 'Default (Slate)',
      colors: {
        headline: '#ffffff',
        subheadline: '#cbd5e1',
        topic: '#94a3b8',
        background: '#1e293b'
      }
    },
    ocean: {
      name: 'Ocean',
      colors: {
        headline: '#06b6d4',
        subheadline: '#06d6d0',
        topic: '#0891b2',
        background: '#0c2340'
      }
    },
    sunset: {
      name: 'Sunset',
      colors: {
        headline: '#fed7aa',
        subheadline: '#fb923c',
        topic: '#ea580c',
        background: '#7c2d12'
      }
    },
    forest: {
      name: 'Forest',
      colors: {
        headline: '#86efac',
        subheadline: '#4ade80',
        topic: '#16a34a',
        background: '#15803d'
      }
    },
    neon: {
      name: 'Neon',
      colors: {
        headline: '#06b6d4',
        subheadline: '#d946ef',
        topic: '#ec4899',
        background: '#0f0f0f'
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Colors</h2>

      {/* Preset Palettes */}
      <div className="space-y-3">
        <p className="text-sm text-slate-300">Preset Palettes:</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(palettes).map(([key, palette]) => (
            <button
              key={key}
              onClick={() => onColorChange('all', palette.colors)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-medium transition-colors"
            >
              {palette.name}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="space-y-3 pt-4 border-t border-slate-700">
        <p className="text-sm text-slate-300">Custom Colors:</p>

        {['headline', 'subheadline', 'topic', 'background'].map(field => (
          <div key={field} className="flex items-center gap-3">
            <label className="text-sm text-slate-400 w-24 capitalize">
              {field}
            </label>
            <input
              type="color"
              value={colors[field]}
              onChange={(e) => onColorChange(field, e.target.value)}
              className="w-12 h-10 border border-slate-600 rounded cursor-pointer"
              title={field}
            />
            <input
              type="text"
              value={colors[field]}
              onChange={(e) => onColorChange(field, e.target.value)}
              placeholder="#000000"
              className="flex-1 px-3 py-1 bg-slate-700 text-white text-sm border border-slate-600 rounded font-mono"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
