import React, { useState, useEffect } from 'react';

/**
 * AISuggestionsPanel Component
 * Provides AI-powered suggestions for text headlines and color palettes
 *
 * Props:
 *   topic (string): The topic/subject for generating suggestions
 *   onApplySuggestion (function): Callback when user applies a suggestion
 *                                  Called with (suggestion, type) where type is 'text' or 'color'
 *   aiHealth (object): Optional AI health status from parent
 */
export default function AISuggestionsPanel({ topic, onApplySuggestion, aiHealth: parentAiHealth }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [textSuggestions, setTextSuggestions] = useState([]);
  const [colorSuggestions, setColorSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [costStats, setCostStats] = useState(null);
  const [aiHealth, setAiHealth] = useState(
    parentAiHealth || {
      ollama: false,
      gemini: false,
    }
  );

  /**
   * Check AI service health on component mount
   */
  useEffect(() => {
    // If parent provided health status, use that initially
    if (parentAiHealth) {
      setAiHealth(parentAiHealth);
    }

    const checkHealth = async () => {
      try {
        const response = await fetch('/api/ai/health');
        if (response.ok) {
          const data = await response.json();
          setAiHealth({
            ollama: data.ollama,
            gemini: data.gemini,
          });
        }
      } catch (err) {
        console.warn('Failed to check AI health:', err);
        setAiHealth({ ollama: false, gemini: false });
      }
    };

    checkHealth();

    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [parentAiHealth]);

  /**
   * Fetch AI suggestions for text and color
   */
  const handleGetSuggestions = async () => {
    if (!topic || !topic.trim()) {
      setError('Please enter a topic first');
      return;
    }

    if (!aiHealth.ollama) {
      setError('Ollama service is not available. Please ensure Ollama is running.');
      return;
    }

    setLoading(true);
    setError(null);
    setTextSuggestions([]);
    setColorSuggestions([]);

    try {
      // Fetch text suggestions
      const textResponse = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, type: 'text' }),
      });

      const textData = await textResponse.json();

      if (!textResponse.ok) {
        throw new Error(textData.error || 'Failed to get text suggestions');
      }

      setTextSuggestions(textData.suggestions || []);

      // Fetch color suggestions
      const colorResponse = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, type: 'color' }),
      });

      const colorData = await colorResponse.json();

      if (!colorResponse.ok) {
        throw new Error(colorData.error || 'Failed to get color suggestions');
      }

      setColorSuggestions(colorData.suggestions || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError(err.message || 'Failed to get suggestions. Try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Apply a text suggestion
   */
  const handleApplyTextSuggestion = (suggestion) => {
    if (onApplySuggestion) {
      onApplySuggestion(suggestion, 'text');
    }
    setShowSuggestions(false);
  };

  /**
   * Apply a color suggestion
   */
  const handleApplyColorSuggestion = (colorString) => {
    if (onApplySuggestion) {
      onApplySuggestion(colorString, 'color');
    }
    setShowSuggestions(false);
  };

  /**
   * Parse color palette string (e.g., "#FF5733,#33FF57,#3357FF")
   * and return array of hex codes
   */
  const parseColorPalette = (paletteStr) => {
    if (!paletteStr) return [];
    return paletteStr
      .split(',')
      .map((c) => c.trim())
      .filter((c) => /^#[0-9A-Fa-f]{6}$/.test(c));
  };

  return (
    <div className="ai-suggestions-panel bg-slate-800 rounded-lg p-4 border border-slate-700">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-xl">✨</span>
          AI Suggestions
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Generate ideas powered by Ollama AI
        </p>
      </div>

      {/* Health Status */}
      {!aiHealth.ollama && (
        <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded text-sm text-red-200">
          ⚠️ Ollama is not available. Make sure it's running on localhost:11434
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Get Suggestions Button */}
      {!showSuggestions || loading ? (
        <button
          onClick={handleGetSuggestions}
          disabled={loading || !aiHealth.ollama}
          className={`w-full py-2 px-4 rounded font-medium transition-colors ${
            loading || !aiHealth.ollama
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
              Generating...
            </div>
          ) : (
            'Get Suggestions'
          )}
        </button>
      ) : null}

      {/* Text Suggestions */}
      {showSuggestions && textSuggestions.length > 0 && !loading && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">
            Headline Ideas
          </h4>
          <div className="space-y-2">
            {textSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyTextSuggestion(suggestion)}
                className="w-full text-left p-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-slate-100 transition-colors border border-slate-600"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Suggestions */}
      {showSuggestions && colorSuggestions.length > 0 && !loading && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">
            Color Palettes
          </h4>
          <div className="space-y-2">
            {colorSuggestions.map((palette, idx) => {
              const colors = parseColorPalette(palette);
              return (
                <button
                  key={idx}
                  onClick={() => handleApplyColorSuggestion(palette)}
                  className="w-full p-2 bg-slate-700 hover:bg-slate-600 rounded flex items-center gap-2 transition-colors border border-slate-600"
                >
                  {colors.length > 0 ? (
                    <div className="flex gap-1 flex-1">
                      {colors.map((color, colorIdx) => (
                        <div
                          key={colorIdx}
                          className="h-6 w-6 rounded border border-slate-500"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">{palette}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Gemini Cost Stats */}
      {showSuggestions && costStats && (
        <div className="text-xs text-slate-400 border-t border-slate-700 pt-2 mt-2">
          <p>Gemini API Spend: ${costStats.totalCost.toFixed(2)}</p>
        </div>
      )}

      {/* Reset Button */}
      {showSuggestions && !loading && (
        <button
          onClick={() => {
            setShowSuggestions(false);
            setTextSuggestions([]);
            setColorSuggestions([]);
          }}
          className="w-full mt-3 py-1 px-3 text-xs bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
