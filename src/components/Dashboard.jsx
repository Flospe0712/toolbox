import { useState, useEffect } from 'react';
import ToolGrid from './ToolGrid';
import Sidebar from './Sidebar';
import SearchInput from './SearchInput';

export default function Dashboard() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetch('/api/tools')
      .then(res => res.json())
      .then(data => {
        setTools(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Extract unique categories from tools
  const categories = [...new Set(tools.map(t => t.category))];

  // Filtering logic: AND logic between category and search
  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const matchesSearch = query === '' || 
                         tool.name.toLowerCase().includes(query.toLowerCase()) ||
                         tool.description.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (newQuery) => {
    setQuery(newQuery);
  };

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-8 py-6">
          <h1 className="text-3xl font-bold text-white mb-6">ToolBox Dashboard</h1>
          <SearchInput value={query} onChange={handleSearchChange} />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {loading && <p className="text-slate-300">Loading tools...</p>}
          {error && <p className="text-red-400">Error: {error}</p>}
          {!loading && !error && filteredTools.length === 0 && (
            <p className="text-slate-400 text-center">No tools found</p>
          )}
          {!loading && !error && filteredTools.length > 0 && (
            <ToolGrid tools={filteredTools} />
          )}
        </main>
      </div>
    </div>
  );
}
