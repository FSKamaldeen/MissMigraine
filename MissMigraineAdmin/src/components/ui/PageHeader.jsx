export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}

export function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon" aria-hidden>
        {icon}
      </div>
      <div>
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, id }) {
  const inputId = id || label?.replace(/\s/g, '-').toLowerCase();
  return (
    <label className="toggle" htmlFor={inputId}>
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle__track" />
      {label && <span className="toggle__label">{label}</span>}
    </label>
  );
}
