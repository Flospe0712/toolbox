import { useEffect, useRef, useCallback } from 'react';
import { renderAllVariants } from '../utils/canvasRenderer';

export default function CanvasPreview({ template, text, colors }) {
  const canvasRefs = [useRef(null), useRef(null), useRef(null)];
  const renderTimeoutRef = useRef(null);

  // Debounced render
  const render = useCallback(() => {
    if (!template) return;

    const canvases = [
      canvasRefs[0].current,
      canvasRefs[1].current,
      canvasRefs[2].current
    ];

    renderAllVariants(canvases, template, text, colors);
  }, [template, text, colors]);

  const scheduleRender = useCallback(() => {
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    renderTimeoutRef.current = setTimeout(render, 200);
  }, [render]);

  // Effect: Re-render when props change (debounced)
  useEffect(() => {
    scheduleRender();
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [template, text, colors, scheduleRender]);

  // Initial render on mount
  useEffect(() => {
    render();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Preview</h2>

      {/* 3 Variants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {['left', 'center', 'right'].map((variant, idx) => (
          <div key={variant} className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 capitalize">
              {variant === 'left' && '← Conservative'}
              {variant === 'center' && '● Primary'}
              {variant === 'right' && 'Aggressive →'}
            </label>
            <div className="border border-slate-700 rounded bg-slate-700 p-2">
              <canvas
                ref={canvasRefs[idx]}
                className="w-full block bg-slate-800 rounded"
                style={{
                  aspectRatio: '16 / 9',
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>
            <p className="text-xs text-slate-500">
              {variant === 'left' && '75% text size, extra spacing'}
              {variant === 'center' && '100% text size, balanced'}
              {variant === 'right' && '115% text size, compact'}
            </p>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-slate-700 rounded p-4 text-sm text-slate-300 space-y-2">
        <p>
          <strong>💡 Pro Tip:</strong> Compare all 3 variants to find the best balance for your thumbnail.
        </p>
        <p>
          Changes update live with 200ms debounce to avoid lag.
        </p>
      </div>
    </div>
  );
}
