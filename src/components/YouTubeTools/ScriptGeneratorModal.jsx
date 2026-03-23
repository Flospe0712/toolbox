import { useState, useCallback } from 'react';
import GenericToolModal from '../GenericToolModal';
import FormField from '../FormField';
import { useToast } from '../../context/ToastContext';
import fetchWithRetry, { FetchError, RateLimitError } from '../../utils/fetchWithRetry';

const SCRIPT_STYLES = [
  { value: 'educational', label: 'Educational' },
  { value: 'entertaining', label: 'Entertaining' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'storytelling', label: 'Storytelling' },
  { value: 'tutorial', label: 'Tutorial' }
];

const SCRIPT_LENGTHS = [
  { value: '300', label: '5 minutes (300s)' },
  { value: '600', label: '10 minutes (600s)' },
  { value: '900', label: '15 minutes (900s)' },
  { value: '1200', label: '20 minutes (1200s)' }
];

export default function ScriptGeneratorModal() {
  const { showToast } = useToast();
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('educational');
  const [length, setLength] = useState('600');
  const [audience, setAudience] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!topic.trim()) {
      setError({ message: 'Please enter a video topic', type: 'warning' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithRetry('/api/youtube/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          style,
          length: parseInt(length),
          targetAudience: audience
        })
      }, {
        maxRetries: 2,
        timeout: 15000,
        checkRateLimit: true
      });

      const data = await response.json();
      setPreview(data.script);
      showToast('Script generated successfully!', 'success');
    } catch (err) {
      if (err instanceof RateLimitError) {
        setError({ 
          message: `Rate limited. Please wait ${err.retryAfter} seconds before trying again.`, 
          type: 'warning' 
        });
      } else if (err instanceof FetchError && err.isTimeout) {
        setError({ message: 'Request timed out. Please try again.', type: 'error' });
      } else {
        setError({ message: err.message || 'Failed to generate script', type: 'error' });
      }
      showToast(error?.message || 'Generation failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [topic, style, length, audience, showToast]);

  return (
    <GenericToolModal
      title="Video Script Generator"
      description="AI-powered scripts optimized for engagement and retention"
      icon="✍️"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      onDismissError={() => setError(null)}
      submitLabel="Generate Script"
      previewContent={preview}
      previewTitle="Generated Script"
    >
      <FormField
        label="Video Topic"
        placeholder="e.g., 'How to learn React in 30 days'"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        disabled={loading}
        required
        helper="What is your video about?"
      />

      <FormField
        label="Script Style"
        type="select"
        value={style}
        onChange={(e) => setStyle(e.target.value)}
        disabled={loading}
      >
        {SCRIPT_STYLES.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </FormField>

      <FormField
        label="Video Length"
        type="select"
        value={length}
        onChange={(e) => setLength(e.target.value)}
        disabled={loading}
      >
        {SCRIPT_LENGTHS.map(l => (
          <option key={l.value} value={l.value}>{l.label}</option>
        ))}
      </FormField>

      <FormField
        label="Target Audience"
        placeholder="e.g., 'Beginners', 'Professionals', 'Kids'"
        value={audience}
        onChange={(e) => setAudience(e.target.value)}
        disabled={loading}
      />
    </GenericToolModal>
  );
}
