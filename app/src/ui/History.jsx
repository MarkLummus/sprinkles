/** Shared history presentation. Callers own ordering, labels, routes and pen locks. */
export function HistoryDisclosure({ open, onToggle, panelId, children }) {
  return (
    <button type="button" className="text-control history-disclosure"
      aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
      {children}
    </button>
  );
}

/** Keep the target mounted when closed, but remove its content from the tab order. */
export function HistoryPanel({ id, open = true, title, className = '', children }) {
  return (
    <section id={id} hidden={!open} className={className} aria-label={open ? title : undefined}>
      {open && <><h2 className="region-name">{title}</h2>{children}</>}
    </section>
  );
}

/** Ordered lists preserve chronology/lineage; nested variants share responsive indentation. */
export function HistoryList({ ordered = false, nested, label, className = '', children }) {
  const List = ordered ? 'ol' : 'ul';
  return <List role="list" aria-label={label} className={`${className} history-list${nested ? ` history-list--${nested}` : ''}`.trim()}>{children}</List>;
}

/** Put current on the record, never a wrapper that also contains descendant versions. */
export function HistoryItem({ as: Element = 'li', current = false, className = '', children }) {
  return <Element className={`${className} history-item${current ? ' is-current' : ''}`.trim()} aria-current={current ? 'true' : undefined}>{children}</Element>;
}

export function HistoryMarkers({ current = false, latest = false }) {
  const words = [current && 'In view', latest && 'Latest'].filter(Boolean);
  return words.length ? <span className="history-register__marker">{` · ${words.join(' · ')}`}</span> : null;
}

/** Metadata can contain entity-specific text or provenance links. */
export function HistoryProvenance({ className = '', children }) {
  return <p className={`history-provenance ${className}`.trim()}>{children}</p>;
}
