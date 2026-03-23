export default function ErrorMessage({ 
  message, 
  onDismiss = null,
  type = 'error',
  actions = null
}) {
  const bgClasses = {
    error: 'bg-red-900/20 border-red-700/30',
    warning: 'bg-amber-900/20 border-amber-700/30',
    info: 'bg-blue-900/20 border-blue-700/30'
  };

  const textClasses = {
    error: 'text-red-300',
    warning: 'text-amber-300',
    info: 'text-blue-300'
  };

  const iconClasses = {
    error: '⚠️',
    warning: '⚡',
    info: 'ℹ️'
  };

  return (
    <div className={`${bgClasses[type]} border border-slate-700 rounded-lg p-4 flex items-start gap-3`}>
      <span className="text-xl">{iconClasses[type]}</span>
      <div className="flex-1">
        <p className={`${textClasses[type]} text-sm leading-5`}>{message}</p>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-300 transition-colors"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
