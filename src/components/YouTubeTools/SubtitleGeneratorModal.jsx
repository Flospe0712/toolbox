import { useState, useCallback } from 'react';
import GenericToolModal from '../GenericToolModal';
import FormField from '../FormField';
import { useToast } from '../../context/ToastContext';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ko', label: 'Korean' }
];

export default function SubtitleGeneratorModal() {
  const { showToast } = useToast();
  const [videoUrl, setVideoUrl] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [language, setLanguage] = useState('en');
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        setError({ message: 'File size must be less than 500MB', type: 'warning' });
        return;
      }
      setAudioFile(file);
      setError(null);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!videoUrl.trim() && !audioFile) {
      setError({ message: 'Please provide either a video URL or upload an audio file', type: 'warning' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for large files

      const formData = new FormData();
      formData.append('language', language);
      formData.append('includeTimestamps', includeTimestamps);
      
      if (videoUrl.trim()) {
        formData.append('videoUrl', videoUrl.trim());
      } else if (audioFile) {
        formData.append('audioFile', audioFile);
      }

      const response = await fetch('/api/youtube/subtitles', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setPreview(data.subtitles);
      showToast('Subtitles generated successfully!', 'success');
    } catch (err) {
      if (err.name === 'AbortError') {
        setError({ message: 'Request timed out. File may be too large or connection too slow.', type: 'error' });
      } else {
        setError({ message: err.message || 'Failed to generate subtitles', type: 'error' });
      }
      showToast(error?.message || 'Generation failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [videoUrl, audioFile, language, includeTimestamps, showToast]);

  return (
    <GenericToolModal
      title="Auto Subtitle Generator"
      description="Generate and translate subtitles in 50+ languages"
      icon="🗣️"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      onDismissError={() => setError(null)}
      submitLabel="Generate Subtitles"
      previewContent={preview}
      previewTitle="Generated Subtitles"
    >
      <div className="space-y-6">
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 bg-slate-700/20">
          <p className="text-xs text-slate-400 mb-3">Choose one method:</p>
          
          <FormField
            label="YouTube Video URL"
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            disabled={loading || !!audioFile}
            helper="Paste the full YouTube video URL"
          />
        </div>

        <div className="text-center text-slate-500 text-sm">OR</div>

        <FormField
          label="Upload Audio/Video File"
          type="file"
          onChange={handleFileChange}
          disabled={loading || !!videoUrl}
          accept="audio/*,video/*"
          helper="Max 500MB. Supported: MP3, MP4, WAV, WebM"
        />

        {audioFile && (
          <div className="bg-slate-700/20 border border-slate-600 rounded p-3">
            <p className="text-sm text-slate-300">
              📁 {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)}MB)
            </p>
          </div>
        )}

        <FormField
          label="Subtitle Language"
          type="select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={loading}
        >
          {LANGUAGES.map(lang => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </FormField>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeTimestamps}
            onChange={(e) => setIncludeTimestamps(e.target.checked)}
            disabled={loading}
            className="w-4 h-4 accent-blue-600"
          />
          <span className="text-sm text-slate-300">Include timestamps in subtitles</span>
        </label>
      </div>
    </GenericToolModal>
  );
}
