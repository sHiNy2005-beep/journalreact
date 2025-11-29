import React, { useEffect, useState, useRef } from 'react';

export default function EditDialog({
  open,
  onClose,
  entry = {},
  onEdit,
  onSaved,
  apiBase = '',
}) {
  const base = apiBase || process.env.REACT_APP_API_URL || 'https://server-journal-1.onrender.com';
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [summary, setSummary] = useState('');
  const [mood, setMood] = useState('');
  const [img, setImg] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const firstRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTitle(entry?.title ?? '');
    setDate(entry?.date ? (entry.date.slice(0,10)) : '');
    setSummary(entry?.summary ?? '');
    setMood(entry?.mood ?? '');
    setImg(entry?.img_name ?? '');
    setErrors({});
    setStatus('');
    setTimeout(() => firstRef.current?.focus(), 10);
  }, [open, entry]);

  function validate() {
    const e = {};
    const t = (title ?? '').trim();
    const s = (summary ?? '').trim();
    const m = (mood ?? '').trim();
    const i = (img ?? '').trim();
    if (!t) e.title = 'Title is required.';
    else if (t.length > 200) e.title = 'Title must be 1–200 characters.';
    if (!date) e.date = 'Date is required.';
    else if (isNaN(new Date(date).getTime())) e.date = 'Date is invalid.';
    if (!s) e.summary = 'Summary is required.';
    else if (s.length > 5000) e.summary = 'Summary must be 1–5000 characters.';
    if (m.length > 200) e.mood = 'Mood must be 200 characters or less.';
    if (i.length > 1000) e.img_name = 'Image URL must be 1000 characters or less.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev) {
    ev.preventDefault();
    setStatus('');
    if (!validate()) return;
    setSaving(true);

    const payload = {
      title: title.trim(),
      date,
      summary: summary.trim(),
      mood: mood.trim(),
      img_name: img.trim(),
    };

    try {
      if (typeof onEdit === 'function') {
        const result = await onEdit({ ...entry, ...payload });
        onSaved && onSaved(result ?? { ...entry, ...payload });
        setStatus('Saved.');
        onClose && onClose();
        return;
      }

      const id = entry._id ?? entry.id;
      if (!id) throw new Error('No entry id provided');

      const res = await fetch(`${base}/api/journalEntries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const txt = await res.text();
      let parsed = null;
      try { parsed = txt ? JSON.parse(txt) : null; } catch (e) { parsed = null; }

      if (res.ok) {
        const updated = parsed || { ...entry, ...payload, _id: id };
        onSaved && onSaved(updated);
        setStatus('Saved.');
        onClose && onClose();
      } else if (res.status === 400 && parsed && parsed.details) {
        const map = {};
        parsed.details.forEach((d) => {
          const key = (d.path && d.path.length ? d.path[d.path.length - 1] : (d.context && d.context.key)) || '_general';
          map[key] = d.message;
        });
        setErrors(map);
        setStatus('Validation errors — please fix the fields.');
      } else {
        const msg = (parsed && (parsed.message || parsed.error)) || txt || `HTTP ${res.status}`;
        setStatus(`Error: ${msg}`);
      }
    } catch (err) {
      setStatus('Network error: ' + (err?.message || err));
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-label="Edit entry dialog" style={overlayStyle}>
      <div className="dialog" style={dialogStyle}>
        <h3>Edit Entry</h3>
        <form onSubmit={submit}>
          <p>
            <label>Title</label><br />
            <input ref={firstRef} value={title} onChange={(e) => setTitle(e.target.value)} disabled={saving} />
            {errors.title && <div style={errStyle}>{errors.title}</div>}
          </p>

          <p>
            <label>Date</label><br />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={saving} />
            {errors.date && <div style={errStyle}>{errors.date}</div>}
          </p>

          <p>
            <label>Summary</label><br />
            <textarea rows={6} value={summary} onChange={(e) => setSummary(e.target.value)} disabled={saving} />
            {errors.summary && <div style={errStyle}>{errors.summary}</div>}
          </p>

          <p>
            <label>Mood (optional)</label><br />
            <input value={mood} onChange={(e) => setMood(e.target.value)} disabled={saving} />
            {errors.mood && <div style={errStyle}>{errors.mood}</div>}
          </p>

          <p>
            <label>Image URL (optional)</label><br />
            <input value={img} onChange={(e) => setImg(e.target.value)} disabled={saving} />
            {errors.img_name && <div style={errStyle}>{errors.img_name}</div>}
          </p>

          <p>
            <button type="submit" disabled={saving}>Save</button>{' '}
            <button type="button" onClick={() => onClose && onClose()} disabled={saving}>Cancel</button>
          </p>

          {status && <p className="status">{status}</p>}
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', left: 0, top: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
};
const dialogStyle = {
  background: '#fff', padding: 16, borderRadius: 8, width: 'min(720px, 94%)', boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
};
const errStyle = { color: 'crimson', marginTop: 4, fontSize: '0.9em' };
