import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './shared.css';

function SkeletonRows({ columnsCount }) {
  return (
    <tbody>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={`skeleton-${index}`} className="table-row-skeleton">
          {Array.from({ length: columnsCount }).map((__, cellIndex) => (
            <td key={`cell-${cellIndex}`}>
              <span className="table-skeleton-line" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

function safeText(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  return value;
}

export default function ResponsiveDataTable({
  columns,
  data,
  rowKey,
  loading = false,
  emptyTitle = 'No records found',
  emptyMessage = 'There is no data to display right now.',
  renderActions,
  getMobileSummary,
  getMobileDetails,
}) {
  const [expanded, setExpanded] = useState({});
  const hasActions = Boolean(renderActions);
  const tableColumnsCount = columns.length + (hasActions ? 1 : 0);

  const rows = useMemo(() => data ?? [], [data]);

  if (!loading && rows.length === 0) {
    return (
      <div className="table-empty-state">
        <h3>{emptyTitle}</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="responsive-table-shell">
      <div className="table-desktop">
        <table className="premium-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.header}>{column.header}</th>
              ))}
              {hasActions ? <th className="align-right">Actions</th> : null}
            </tr>
          </thead>
          {loading ? (
            <SkeletonRows columnsCount={tableColumnsCount} />
          ) : (
            <tbody>
              {rows.map((row) => {
                const key = rowKey(row);
                return (
                  <tr key={key}>
                    {columns.map((column) => (
                      <td key={`${key}-${column.header}`} className={column.className ?? ''}>
                        {column.render ? column.render(row) : safeText(row[column.key])}
                      </td>
                    ))}
                    {hasActions ? <td className="align-right">{renderActions(row)}</td> : null}
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>

      <div className="table-mobile">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div className="mobile-row-card" key={`mobile-skeleton-${index}`}>
                <div className="mobile-row-skeleton-line" />
                <div className="mobile-row-skeleton-line short" />
                <div className="mobile-row-skeleton-line" />
              </div>
            ))
          : rows.map((row) => {
              const key = rowKey(row);
              const summary = getMobileSummary ? getMobileSummary(row) : {};
              const details = getMobileDetails ? getMobileDetails(row) : [];
              const isExpanded = Boolean(expanded[key]);

              return (
                <article key={key} className="mobile-row-card">
                  <header className="mobile-row-header">
                    <div>
                      <p className="mobile-row-title">{safeText(summary.title)}</p>
                      {summary.subtitle ? (
                        <p className="mobile-row-subtitle">{safeText(summary.subtitle)}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="mobile-row-toggle"
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [key]: !prev[key],
                        }))
                      }
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? 'Hide details' : 'Show details'}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </header>

                  {summary.badge ? <div className="mobile-row-badge">{summary.badge}</div> : null}

                  {isExpanded ? (
                    <div className="mobile-row-details">
                      {details.map((detail) => (
                        <div key={`${key}-${detail.label}`} className="mobile-detail-item">
                          <span>{detail.label}</span>
                          <strong>{safeText(detail.value)}</strong>
                        </div>
                      ))}
                      {hasActions ? <div className="mobile-row-actions">{renderActions(row)}</div> : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
      </div>
    </div>
  );
}
