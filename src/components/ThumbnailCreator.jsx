import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TemplateSelector from './TemplateSelector';
import TextEditor from './TextEditor';
import ColorPicker from './ColorPicker';
import CanvasPreview from './CanvasPreview';
import ProjectManager from './ProjectManager';
import ProjectSaveDialog from './ProjectSaveDialog';
import AISuggestionsPanel from './AISuggestionsPanel';
import { useToast } from '../context/ToastContext';
import * as projectService from '../utils/projectService';
import templates from '../../data/templates.json';

export default function ThumbnailCreator() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const canvasRef = useRef(null);

  // State management
  const [selectedTemplate, setSelectedTemplate] = useState('gradient-dark');
  const [text, setText] = useState({
    headline: 'Amazing Video Title',
    subheadline: 'Catchy subtitle here',
    topic: 'trending topic'
  });
  const [colors, setColors] = useState({
    headline: '#ffffff',
    subheadline: '#cbd5e1',
    topic: '#94a3b8',
    background: '#1e293b'
  });
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [currentProjectName, setCurrentProjectName] = useState('Untitled Project');
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [aiHealth, setAIHealth] = useState({ ollama: false, gemini: false });

  // Handlers
  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    setIsDirty(true);
  };

  const handleTextChange = (field, value) => {
    setText(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleColorChange = (field, value) => {
    if (field === 'all' && typeof value === 'object') {
      setColors(value);
    } else {
      setColors(prev => ({ ...prev, [field]: value }));
    }
    setIsDirty(true);
  };

  // Check AI health on mount
  useEffect(() => {
    const checkAI = async () => {
      try {
        const res = await fetch('/api/ai/health');
        const health = await res.json();
        setAIHealth(health);
      } catch (e) {
        console.warn('AI health check failed:', e.message);
      }
    };
    checkAI();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentProjectId) {
          handleSaveProject();
        } else {
          setShowSaveDialog(true);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExport();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProjectId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isDirty && currentProjectId) {
        const projectData = {
          id: currentProjectId,
          name: currentProjectName,
          createdAt: new Date(currentProjectId.split('_')[0] * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          thumbnail: { selectedTemplate, text, colors }
        };
        await projectService.saveProject(currentProjectId, projectData);
        setIsDirty(false);
        setLastSaved(new Date());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isDirty, currentProjectId, currentProjectName, selectedTemplate, text, colors]);

  // Project handlers
  const handleNewProject = async (name) => {
    const project = await projectService.createProject(name);
    if (project) {
      setCurrentProjectId(project.id);
      setCurrentProjectName(project.name);
      setIsDirty(false);
      setShowSaveDialog(false);
    }
  };

  const handleLoadProject = async (projectId) => {
    const project = await projectService.getProject(projectId);
    if (project) {
      setCurrentProjectId(project.id);
      setCurrentProjectName(project.name);
      setSelectedTemplate(project.thumbnail.selectedTemplate);
      setText(project.thumbnail.text);
      setColors(project.thumbnail.colors);
      setIsDirty(false);
      setShowProjectManager(false);
    }
  };

  const handleSaveProject = async () => {
    if (currentProjectId) {
      const projectData = {
        id: currentProjectId,
        name: currentProjectName,
        createdAt: new Date(currentProjectId.split('_')[0] * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        thumbnail: { selectedTemplate, text, colors }
      };
      await projectService.saveProject(currentProjectId, projectData);
      setIsDirty(false);
      setLastSaved(new Date());
    }
  };

  const handleDeleteProject = async (projectId) => {
    await projectService.deleteProject(projectId);
    setShowProjectManager(false);
    if (currentProjectId === projectId) {
      setCurrentProjectId(null);
      setCurrentProjectName('Untitled Project');
    }
  };

  const handleApplySuggestion = (suggestion, type) => {
    if (type === 'text') {
      setText(prev => ({ ...prev, headline: suggestion }));
      showToast('Headline applied!', 'success', 2000);
    } else if (type === 'color') {
      // Parse color palette (hex colors separated by commas)
      const colorArray = suggestion
        .split(',')
        .map(c => c.trim())
        .filter(c => /^#[0-9A-Fa-f]{6}$/.test(c))
        .slice(0, 4);
      
      if (colorArray.length >= 2) {
        setColors({
          headline: colorArray[0],
          subheadline: colorArray.length > 1 ? colorArray[1] : colorArray[0],
          topic: colorArray.length > 2 ? colorArray[2] : colorArray[0],
          background: colorArray.length > 3 ? colorArray[3] : '#1e293b'
        });
        showToast('Color palette applied!', 'success', 2000);
      } else {
        showToast('Could not parse color palette', 'error', 2000);
      }
    }
    setIsDirty(true);
  };

  const handleExport = async () => {
    try {
      showToast('Preparing download...', 'info', 2000);
      
      // Get canvas element from CanvasPreview component
      const canvases = document.querySelectorAll('canvas');
      if (canvases.length === 0) {
        showToast('Canvas not ready', 'error');
        return;
      }

      // Use the first canvas (main preview)
      const canvas = canvases[0];
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          showToast('Failed to export canvas', 'error');
          return;
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `thumbnail_${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Downloaded! (Ctrl+E)', 'success', 3000);
      }, 'image/png');
    } catch (error) {
      console.error('Export error:', error);
      showToast(`Export failed: ${error.message}`, 'error');
    }
  };

  const currentTemplate = templates.templates.find(t => t.id === selectedTemplate);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowProjectManager(true)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors text-sm"
            >
              Projects
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded transition-colors text-sm"
            >
              Save
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded transition-colors text-sm flex items-center gap-2"
            >
              <span>⬇</span>
              Download PNG
            </button>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{currentProjectName}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {isDirty ? '● Unsaved changes' : lastSaved ? `✓ Auto-saved at ${lastSaved.toLocaleTimeString()}` : ''}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8 p-8">
        {/* Left Sidebar: Controls */}
        <div className="lg:w-80 space-y-8">
          {/* Template Selector */}
          <TemplateSelector
            templates={templates.templates}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleTemplateChange}
          />

          {/* Text Editor */}
          <TextEditor
            text={text}
            onTextChange={handleTextChange}
          />

          {/* Color Picker */}
          <ColorPicker
            colors={colors}
            onColorChange={handleColorChange}
          />

          {/* AI Suggestions */}
          <AISuggestionsPanel
            topic={text.topic}
            onApplySuggestion={handleApplySuggestion}
            aiHealth={aiHealth}
          />
        </div>

        {/* Right Side: Canvas Preview */}
        <div className="flex-1">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 space-y-6">
            {/* Canvas Preview */}
            <CanvasPreview
              template={currentTemplate}
              text={text}
              colors={colors}
            />

            {/* Current Selection Info */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Current Selection</h3>
              <div className="bg-slate-700 rounded p-4 space-y-2 text-sm">
                <p>
                  <span className="text-slate-400">Template:</span>
                  <span className="text-white ml-2">{currentTemplate?.name || 'None'}</span>
                </p>
                <p>
                  <span className="text-slate-400">Headline:</span>
                  <span className="text-white ml-2">{text.headline}</span>
                </p>
                <p>
                  <span className="text-slate-400">Subheadline:</span>
                  <span className="text-white ml-2">{text.subheadline}</span>
                </p>
                <p>
                  <span className="text-slate-400">Topic:</span>
                  <span className="text-white ml-2">{text.topic}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showProjectManager && (
        <ProjectManager
          onClose={() => setShowProjectManager(false)}
          onLoadProject={handleLoadProject}
          onDeleteProject={handleDeleteProject}
        />
      )}

      {showSaveDialog && (
        <ProjectSaveDialog
          initialName={currentProjectName || 'My Project'}
          onSave={handleNewProject}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}
    </div>
  );
}
