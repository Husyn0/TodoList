import { useEffect, useMemo, useRef, useState } from 'react';
import { TIMEZONES, formatTimezoneLabel, matchScore } from '../constants/timezones';

export default function TimezoneSelect({ value, onChange, placeholder = 'Select timezone…' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setQuery('');
      setHighlight(0);
      // slight defer so element is mounted
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query) return TIMEZONES;
    return TIMEZONES
      .map((tz) => ({ tz, score: matchScore(tz, query) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.tz.localeCompare(b.tz))
      .map((r) => r.tz)
      .slice(0, 200);
  }, [query]);

  // Keep the highlighted row scrolled into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[highlight];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [highlight, open]);

  const commit = (tz) => {
    if (!tz) return;
    onChange(tz);
    setOpen(false);
    setQuery('');
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      commit(results[highlight]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="tz-select" ref={wrapRef}>
      <button
        type="button"
        className={`tz-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="tz-value">
          {value ? formatTimezoneLabel(value) : placeholder}
        </span>
        <span className="tz-caret" aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="tz-panel">
          <input
            ref={inputRef}
            className="tz-search"
            type="text"
            placeholder="Search by city or region…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlight(0);
            }}
            onKeyDown={onKeyDown}
          />
          <ul className="tz-list" ref={listRef} role="listbox">
            {results.length === 0 && (
              <li className="tz-empty">No matching timezone</li>
            )}
            {results.map((tz, i) => (
              <li
                key={tz}
                role="option"
                aria-selected={tz === value}
                className={`tz-item ${i === highlight ? 'is-highlighted' : ''} ${
                  tz === value ? 'is-selected' : ''
                }`}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(tz);
                }}
              >
                {formatTimezoneLabel(tz)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}