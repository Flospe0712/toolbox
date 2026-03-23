import { useState, useCallback } from 'react';
import GenericToolModal from '../GenericToolModal';
import FormField from '../FormField';
import { useToast } from '../../context/ToastContext';
import toolFetch from '../../utils/toolFetch';

const ACTIONS = [
  { value: 'create', label: 'Create New Playlist' },
  { value: 'add_videos', label: 'Add Videos to Playlist' },
  { value: 'reorder', label: 'Reorder Videos' },
  { value: 'remove', label: 'Remove from Playlist' }
];

export default function PlaylistManagerModal() {
  const { showToast } = useToast();
  const [action, setAction] = useState('create');
  const [playlistName, setPlaylistName] = useState('');
  const [description, setDescription] = useState('');
  const [playlistId, setPlaylistId] = useState('');
  const [videoUrls, setVideoUrls] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleSubmit = useCallback(async () => {
    if (action === 'create' && !playlistName.trim()) {
      setError({ message: 'Please enter a playlist name', type: 'warning' });
      return;
    }

    if ((action === 'add_videos' || action === 'remove') && !playlistId.trim()) {
      setError({ message: 'Please enter a playlist ID', type: 'warning' });
      return;
    }

    if (action === 'add_videos' && !videoUrls.trim()) {
      setError({ message: 'Please enter video URLs', type: 'warning' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await toolFetch('/api/youtube/manage-playlists', {
        action,
        playlistId: playlistId.trim() || undefined,
        playlistName: playlistName.trim() || undefined,
        description: description.trim() || undefined,
        videoUrls: videoUrls
          .split('\n')
          .map(url => url.trim())
          .filter(url => url) || undefined,
        isPublic
      });
      
      setPreview(data);
      showToast('Playlist action completed successfully!', 'success');
    } catch (err) {
      const errorMsg = err.message || 'Failed to manage playlist';
      const errorType = err.type === 'rate-limit' ? 'warning' : 'error';
      setError({ message: errorMsg, type: errorType });
      showToast(errorMsg, errorType === 'warning' ? 'warning' : 'error');
    } finally {
      setLoading(false);
    }
  }, [action, playlistName, description, playlistId, videoUrls, isPublic, showToast]);

  const previewContent = preview ? (
    <div className="space-y-4">
      <div className="bg-slate-700/30 border border-slate-600 rounded p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Action Status</h3>
        <div className="space-y-2">
          <p className="text-slate-200">
            <span className="text-green-400">✓</span> Action: <span className="font-medium capitalize">{preview.action}</span>
          </p>
          {preview.playlistId && (
            <p className="text-slate-200">
              <span className="text-blue-400">📋</span> Playlist ID: <span className="font-mono text-xs text-slate-400">{preview.playlistId}</span>
            </p>
          )}
          {preview.message && (
            <p className="text-slate-200">
              <span className="text-amber-400">ℹ️</span> {preview.message}
            </p>
          )}
        </div>
      </div>

      {preview.playlistUrl && (
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium transition-colors"
          onClick={() => window.open(preview.playlistUrl, '_blank')}
        >
          Open Playlist on YouTube
        </button>
      )}
    </div>
  ) : null;

  return (
    <GenericToolModal
      title="Smart Playlist Manager"
      description="Auto-organize and optimize playlists for engagement"
      icon="📋"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      onDismissError={() => setError(null)}
      submitLabel="Execute Action"
      previewContent={previewContent}
      previewTitle="Result"
    >
      <FormField
        label="Action"
        type="select"
        value={action}
        onChange={(e) => setAction(e.target.value)}
        disabled={loading}
      >
        {ACTIONS.map(a => (
          <option key={a.value} value={a.value}>{a.label}</option>
        ))}
      </FormField>

      {action === 'create' && (
        <>
          <FormField
            label="Playlist Name"
            placeholder="My awesome playlist"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            disabled={loading}
            required
          />

          <FormField
            label="Description (optional)"
            type="textarea"
            placeholder="Add a description for your playlist..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-slate-300">Make playlist public</span>
          </label>
        </>
      )}

      {(action === 'add_videos' || action === 'remove') && (
        <FormField
          label="Playlist ID"
          placeholder="e.g., PLxxxxxxxxxxxxx"
          value={playlistId}
          onChange={(e) => setPlaylistId(e.target.value)}
          disabled={loading}
          required
          helper="YouTube playlist ID"
        />
      )}

      {action === 'add_videos' && (
        <FormField
          label="Video URLs"
          type="textarea"
          placeholder="Paste YouTube video URLs, one per line"
          value={videoUrls}
          onChange={(e) => setVideoUrls(e.target.value)}
          disabled={loading}
          required
          helper="One URL per line"
        />
      )}
    </GenericToolModal>
  );
}
