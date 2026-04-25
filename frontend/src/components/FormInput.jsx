/**
 * FormInput — reusable controlled input with label + inline error.
 * Designed to work with React Hook Form's `register` API.
 */
export default function FormInput({
  id,
  label,
  type = 'text',
  placeholder,
  error,
  registration,  // spread from register(...)
  autoComplete,
  ...rest
}) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`field-input${error ? ' error' : ''}`}
        {...registration}
        {...rest}
      />
      {error && (
        <p className="field-error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  )
}
