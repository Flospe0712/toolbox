import { useParams } from 'react-router-dom';
import ThumbnailCreatorPage from './ThumbnailCreatorPage';
import ScriptGeneratorModal from '../components/YouTubeTools/ScriptGeneratorModal';
import SEOOptimizerModal from '../components/YouTubeTools/SEOOptimizerModal';
import SubtitleGeneratorModal from '../components/YouTubeTools/SubtitleGeneratorModal';
import CommentModerationModal from '../components/YouTubeTools/CommentModerationModal';
import BannerCreatorModal from '../components/YouTubeTools/BannerCreatorModal';
import PlaylistManagerModal from '../components/YouTubeTools/PlaylistManagerModal';
import DescriptionGeneratorModal from '../components/YouTubeTools/DescriptionGeneratorModal';

const TOOL_COMPONENTS = {
  'thumbnail-creator': ThumbnailCreatorPage,
  'script-generator': ScriptGeneratorModal,
  'seo-optimizer': SEOOptimizerModal,
  'subtitle-generator': SubtitleGeneratorModal,
  'comment-moderation': CommentModerationModal,
  'banner-creator': BannerCreatorModal,
  'playlist-manager': PlaylistManagerModal,
  'description-generator': DescriptionGeneratorModal,
};

export default function ToolPage() {
  const { id } = useParams();
  const Component = TOOL_COMPONENTS[id];

  if (Component) {
    return <Component />;
  }

  // Placeholder for unimplemented tools
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <button
        onClick={() => window.history.back()}
        className="text-blue-400 hover:text-blue-300 mb-6 transition-colors"
      >
        ← Back to Dashboard
      </button>
      <h1 className="text-3xl font-bold text-white mb-4">Tool: {id}</h1>
      <p className="text-slate-300 text-lg">
        Tool interface coming soon
      </p>
    </div>
  );
}
