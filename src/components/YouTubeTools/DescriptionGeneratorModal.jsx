import { useState, useCallback } from 'react';
import GenericToolModal from '../GenericToolModal';
import FormField from '../FormField';
import { useToast } from '../../context/ToastContext';
import toolFetch from '../../utils/toolFetch';

export default function DescriptionGeneratorModal() {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeLinks, setIncludeLinks] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setError({ message: 'Please enter a video title', type: 'warning' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await toolFetch('/api/youtube/generate-description', {
        title: title.trim(),
        topic: topic.trim(),
        includeTimestamps,
        includeLinks
      });
      
      setPreview(data.description);
      showToast('Description generated successfully!', 'success');
    } catch (err) {
      const errorMsg = err.message || 'Failed to generate description';
      const errorType = err.type === 'rate-limit' ? 'warning' : 'error';
      setError({ message: errorMsg, type: errorType });
      showToast(errorMsg, errorType === 'warning' ? 'warning' : 'error');
    } finally {
      setLoading(false);
    }
  }, [title, topic, includeTimestamps, includeLinks, showToast]);

  return (
    <GenericToolModal
      title="Video Description Generator"
      description="Auto-generate video descriptions with timestamps and chapters"
      icon="📝"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      onDismissError={() => setError(null)}
      submitLabel="Generate Description"
      previewContent={preview}
      previewTitle="Generated Description"
    >
      <FormField
        label="Video Title"
        placeholder="Enter your video title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
        required
      />

      <FormField
        label="Topic/Topic Tags (optional)"
        placeholder="e.g., 'React, JavaScript, Web Development'"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        disabled={loading}
        helper="Add relevant topics or tags"
      />

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={includeTimestamps}
          onChange={(e) => setIncludeTimestamps(e.target.checked)}
          disabled={loading}
          className="w-4 h-4 accent-blue-600"
        />
        <span className="text-sm text-slate-300">Include timestamps</span>
      </label>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={includeLinks}
          onChange={(e) => setIncludeLinks(e.target.checked)}
          disabled={loading}
          className="w-4 h-4 accent-blue-600"
        />
        <span className="text-sm text-slate-300">Include helpful links section</span>
      </label>
    </GenericToolModal>
  );
}
