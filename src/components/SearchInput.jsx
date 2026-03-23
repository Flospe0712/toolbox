export default function SearchInput({ value, onChange }) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search tools..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-300 transition-colors text-lg"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
