import './shared.css';

export default function PageHeader({ title, subtitle, actions, compact = false }) {
  return (
    <header className={`page-header-shell ${compact ? 'compact' : ''}`}>
      <div className="page-header-copy">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </header>
  );
}
