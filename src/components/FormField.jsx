export default function FormField({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  disabled = false,
  error = null,
  helper = null,
  className = '',
  ...props 
}) {
  const baseClasses = 'w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${baseClasses} ${errorClasses} ${className} resize-vertical min-h-24`}
          {...props}
        />
      ) : type === 'select' ? (
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`${baseClasses} ${errorClasses} ${className}`}
          {...props}
        >
          {props.children}
        </select>
      ) : type === 'file' ? (
        <input
          type="file"
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`${baseClasses} ${errorClasses} ${className} file:mr-3 file:py-1 file:px-3 file:bg-blue-600 file:text-white file:border-0 file:rounded cursor-pointer`}
          {...props}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${baseClasses} ${errorClasses} ${className}`}
          {...props}
        />
      )}
      
      {error && <p className="text-sm text-red-400">{error}</p>}
      {helper && <p className="text-xs text-slate-400">{helper}</p>}
    </div>
  );
}
