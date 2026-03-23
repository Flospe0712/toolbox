import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function GenericToolModal({
  title,
  description,
  icon,
  children,
  onSubmit,
  loading = false,
  error = null,
  onDismissError = null,
  submitLabel = 'Generate',
  previewContent = null,
  previewTitle = 'Preview'
}) {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(previewContent ? true : false);

  const handleBack = () => navigate('/');

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="text-blue-400 hover:text-blue-300 mb-4 transition-colors flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <span className="text-5xl">{icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <p className="text-slate-400 mt-1">{description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Configuration</h2>

          {error && (
            <div className="mb-6">
              <ErrorMessage
                message={error.message}
                type={error.type || 'error'}
                onDismiss={onDismissError}
              />
            </div>
          )}

          <form onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }} className="space-y-6">
            {children}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                submitLabel
              )}
            </button>
          </form>
        </div>

        {/* Preview Section */}
        {previewContent && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">{previewTitle}</h2>
            
            {loading ? (
              <div className="flex items-center justify-center min-h-64">
                <LoadingSpinner message="Generating preview..." size="lg" />
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-auto max-h-96">
                {typeof previewContent === 'string' ? (
                  <p className="text-slate-300 whitespace-pre-wrap text-sm">{previewContent}</p>
                ) : (
                  previewContent
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
