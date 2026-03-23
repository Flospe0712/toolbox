export default function Sidebar({ categories, selectedCategory, onSelectCategory }) {
  return (
    <aside className="hidden md:flex w-64 bg-slate-800 border-r border-slate-700 p-6 flex-col gap-6">
      <h2 className="text-lg font-semibold text-white">Categories</h2>
      <nav className="flex flex-col gap-3">
        {/* "All" button */}
        <button
          onClick={() => onSelectCategory('All')}
          className={`text-left px-4 py-2 rounded transition-colors ${
            selectedCategory === 'All'
              ? 'bg-blue-500 text-white font-medium'
              : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700'
          }`}
        >
          All
        </button>

        {/* Category buttons */}
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`text-left px-4 py-2 rounded transition-colors ${
              selectedCategory === cat
                ? 'bg-blue-500 text-white font-medium'
                : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </nav>
    </aside>
  );
}
