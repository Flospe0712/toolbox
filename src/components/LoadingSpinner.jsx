export default function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin`} />
      <p className="text-slate-300 text-sm">{message}</p>
    </div>
  );
}
