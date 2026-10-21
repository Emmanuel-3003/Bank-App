export default function Field({ label, name, error, hint, options, ...controlProps }) {
  const className = `w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
    error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
      : 'border-slate-300 focus:border-teal-600 focus:ring-teal-600/30'
  }`
  const shared = {
    id: name,
    name,
    className,
    'aria-invalid': error ? 'true' : undefined,
    ...controlProps,
  }

  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {options ? (
        <select {...shared}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input {...shared} />
      )}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}