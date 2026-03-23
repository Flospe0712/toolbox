import { useState, useCallback } from 'react';
import GenericToolModal from '../GenericToolModal';
import FormField from '../FormField';
import { useToast } from '../../context/ToastContext';
import toolFetch from '../../utils/toolFetch';

export default function SEOOptimizerModal() {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setError({ message: 'Please enter a video title', type: 'warning' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await toolFetch('/api/youtube/optimize-seo', {
        title: title.trim(),
        description: description.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      
      setPreview(data);
      showToast('SEO optimization complete!', 'success');
    } catch (err) {
      const errorMsg = err.message || 'Failed to optimize SEO';
      const errorType = err.type === 'rate-limit' ? 'warning' : 'error';
      setError({ message: errorMsg, type: errorType });
      showToast(errorMsg, errorType === 'warning' ? 'warning' : 'error');
    } finally {
      setLoading(false);
    }
  }, [title, description, tags, showToast]);

  const previewContent = preview ? (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Optimized Title</h3>
        <p className="text-slate-200 bg-slate-800/50 p-3 rounded border border-slate-700">
          {preview.optimized?.title}
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-2">SEO Score</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${preview.score}%` }}
            />
          </div>
          <span className="text-lg font-bold text-green-400">{preview.score}</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Recommended Tags</h3>
        <div className="flex flex-wrap gap-2">
          {preview.optimized?.tags?.map((tag, i) => (
            <span 
              key={i}
              className="bg-blue-600/20 border border-blue-600/40 text-blue-300 px-3 py-1 rounded text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Suggestions</h3>
        <ul className="space-y-2">
          {preview.suggestions?.map((suggestion, i) => (
            <li key={i} className="text-sm text-slate-300 flex gap-2">
              <span className="text-green-400">✓</span>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
    </div>
  ) : null;

  return (
    <GenericToolModal
      title="SEO Optimizer"
      description="Optimize tags, titles, and keywords for maximum discoverability"
      icon="🔍"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      onDismissError={() => setError(null)}
      submitLabel="Optimize SEO"
      previewContent={previewContent}
      previewTitle="Optimization Results"
    >
      <FormField
        label="Video Title"
        placeholder="Enter your video title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
        required
        helper="Character count: {0}/100"
      />

      <FormField
        label="Description"
        type="textarea"
        placeholder="Enter video description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
      />

      <FormField
        label="Tags (comma-separated)"
        placeholder="e.g., 'react, javascript, web development'"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        disabled={loading}
        helper="Separate tags with commas"
      />
    </GenericToolModal>
  );
}
