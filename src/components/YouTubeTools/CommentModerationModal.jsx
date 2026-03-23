import { useState, useCallback } from 'react';
import GenericToolModal from '../GenericToolModal';
import FormField from '../FormField';
import { useToast } from '../../context/ToastContext';
import toolFetch from '../../utils/toolFetch';

export default function CommentModerationModal() {
  const { showToast } = useToast();
  const [comments, setComments] = useState('');
  const [threshold, setThreshold] = useState('0.7');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleSubmit = useCallback(async () => {
    if (!comments.trim()) {
      setError({ message: 'Please enter comments to moderate', type: 'warning' });
      return;
    }

    const commentList = comments
      .split('\n')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (commentList.length === 0) {
      setError({ message: 'Please enter at least one comment', type: 'warning' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await toolFetch('/api/youtube/moderate-comments', {
        comments: commentList,
        threshold: parseFloat(threshold)
      }, { timeout: 15000 });
      
      setPreview(data);
      showToast('Comments moderated successfully!', 'success');
    } catch (err) {
      const errorMsg = err.message || 'Failed to moderate comments';
      const errorType = err.type === 'rate-limit' ? 'warning' : 'error';
      setError({ message: errorMsg, type: errorType });
      showToast(errorMsg, errorType === 'warning' ? 'warning' : 'error');
    } finally {
      setLoading(false);
    }
  }, [comments, threshold, showToast]);

  const previewContent = preview ? (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-700/30 rounded p-3 border border-slate-600">
          <p className="text-xs text-slate-400">Total Comments</p>
          <p className="text-2xl font-bold text-slate-200">{preview.analyzed}</p>
        </div>
        <div className="bg-red-900/20 rounded p-3 border border-red-700/40">
          <p className="text-xs text-slate-400">Spam Detected</p>
          <p className="text-2xl font-bold text-red-400">{preview.spam}</p>
        </div>
        <div className="bg-green-900/20 rounded p-3 border border-green-700/40">
          <p className="text-xs text-slate-400">Safe Comments</p>
          <p className="text-2xl font-bold text-green-400">{preview.safe}</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Recommended Actions</h3>
        <div className="space-y-2">
          {preview.actions?.map((action, i) => {
            const actionLabels = {
              'approve': { label: 'Approve', color: 'bg-green-900/20 border-green-700/40 text-green-400' },
              'reject': { label: 'Reject', color: 'bg-red-900/20 border-red-700/40 text-red-400' },
              'review': { label: 'Review', color: 'bg-amber-900/20 border-amber-700/40 text-amber-400' }
            };
            const actionConfig = actionLabels[action] || actionLabels.review;
            return (
              <div key={i} className={`border rounded px-3 py-2 text-sm ${actionConfig.color}`}>
                {actionConfig.label}
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-xs text-slate-400 bg-slate-700/20 p-2 rounded">
        <p>🔍 Moderation completed with {threshold * 100}% confidence threshold</p>
      </div>
    </div>
  ) : null;

  return (
    <GenericToolModal
      title="Comment Moderation AI"
      description="Intelligent spam detection and comment moderation"
      icon="💬"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      onDismissError={() => setError(null)}
      submitLabel="Moderate Comments"
      previewContent={previewContent}
      previewTitle="Moderation Results"
    >
      <FormField
        label="Comments to Moderate"
        type="textarea"
        placeholder="Paste comments here, one per line"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        disabled={loading}
        required
        helper="Paste each comment on a new line"
      />

      <div>
        <label className="text-sm font-medium text-slate-300 mb-2 block">
          Confidence Threshold: <span className="text-blue-400 font-semibold">{(threshold * 100).toFixed(0)}%</span>
        </label>
        <input
          type="range"
          min="0.5"
          max="0.99"
          step="0.05"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          disabled={loading}
          className="w-full accent-blue-600"
        />
        <p className="text-xs text-slate-400 mt-2">
          Higher = stricter spam detection, may miss some spam. Lower = catches more spam, may mark legitimate as spam.
        </p>
      </div>
    </GenericToolModal>
  );
}
