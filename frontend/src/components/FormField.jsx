import './FormField.css';

export default function FormField({ label, error, children, required }) {
  return (
    <div className={`form-field ${error ? 'form-field-error' : ''}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}
      {children}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
