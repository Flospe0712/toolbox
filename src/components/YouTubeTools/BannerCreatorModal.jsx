import { useState, useCallback } from 'react';
import GenericToolModal from '../GenericToolModal';
import FormField from '../FormField';
import { useToast } from '../../context/ToastContext';
import toolFetch from '../../utils/toolFetch';

const BANNER_THEMES = [
  { value: 'modern', label: 'Modern' },
  { value: 'dark', label: 'Dark' },
  { value: 'colorful', label: 'Colorful' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'tech', label: 'Tech' }
];

export default function BannerCreatorModal() {
  const { showToast } = useToast();
  const [channelName, setChannelName] = useState('');
  const [tagline, setTagline] = useState('');
  const [theme, setTheme] = useState('modern');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!channelName.trim()) {
      setError({ message: 'Please enter your channel name', type: 'warning' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await toolFetch('/api/youtube/create-banner', {
        channelName: channelName.trim(),
        tagline: tagline.trim(),
        theme,
        logoUrl: logoUrl.trim() || undefined
      });
      
      setPreview(data.banner);
      showToast('Banner created successfully!', 'success');
    } catch (err) {
      const errorMsg = err.message || 'Failed to create banner';
      const errorType = err.type === 'rate-limit' ? 'warning' : 'error';
      setError({ message: errorMsg, type: errorType });
      showToast(errorMsg, errorType === 'warning' ? 'warning' : 'error');
    } finally {
      setLoading(false);
    }
  }, [channelName, tagline, theme, logoUrl, showToast]);

  const previewContent = preview ? (
    <div className="space-y-4">
      <div className="bg-slate-700/30 rounded border border-slate-600 p-4">
        {preview.startsWith('<svg') || preview.startsWith('data:image') ? (
          preview.startsWith('<svg') ? (
            <div dangerouslySetInnerHTML={{ __html: preview }} className="w-full" />
          ) : (
            <img src={preview} alt="Banner preview" className="w-full rounded" />
          )
        ) : (
          <p className="text-slate-300">{preview}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium text-sm transition-colors"
          onClick={() => {
            const link = document.createElement('a');
            link.href = preview;
            link.download = `channel-banner-${Date.now()}.png`;
            link.click();
          }}
        >
          Download
        </button>
        <button
          className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded font-medium text-sm transition-colors"
          onClick={() => navigator.clipboard.writeText(preview)}
        >
          Copy URL
        </button>
      </div>

      <p className="text-xs text-slate-400">
        📐 Format: 2560x1440px (recommended YouTube dimension)
      </p>
    </div>
  ) : null;

  return (
    <GenericToolModal
      title="Channel Banner Creator"
      description="Design professional channel banners with AI templates"
      icon="🖼️"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      onDismissError={() => setError(null)}
      submitLabel="Create Banner"
      previewContent={previewContent}
      previewTitle="Banner Preview"
    >
      <FormField
        label="Channel Name"
        placeholder="Your channel name"
        value={channelName}
        onChange={(e) => setChannelName(e.target.value)}
        disabled={loading}
        required
      />

      <FormField
        label="Tagline (optional)"
        placeholder="e.g., 'Create • Learn • Inspire'"
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
        disabled={loading}
        helper="Add a short description or motto"
      />

      <FormField
        label="Theme"
        type="select"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        disabled={loading}
      >
        {BANNER_THEMES.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </FormField>

      <FormField
        label="Logo URL (optional)"
        type="url"
        placeholder="https://example.com/logo.png"
        value={logoUrl}
        onChange={(e) => setLogoUrl(e.target.value)}
        disabled={loading}
        helper="Optional logo image URL"
      />
    </GenericToolModal>
  );
}
