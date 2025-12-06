// src/components/EditDialog.jsx
import React, { useEffect, useState, useRef } from 'react';
import { updateEntry, normalizeImgUrl } from '../api';

export default function EditDialog({
  open,
  onClose,
  entry = {},
  onSaved,
  apiBase = '',
}) {
  const base = apiBase || process.env.REACT_APP_API_URL || 'https://server-journal-2.onrender.com';
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [summary, setSummary] = useState('');
  const [mood, setMood] = useState('');
  const [imgName, setImgName] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const firstRef = useRef(null);
  const fileObjectUrlRef = useRef(null);

  const normalizeDateForInput = (d) => {
    if (!d) return '';
    const dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return '';
    return dt.toISOString().slice(0, 10);
  };

  useEffect(() => {
    return () => {
      if (fileObjectUrlRef.current) {
        URL.revokeObjectURL(fileObjectUrlRef.current);
        fileObjectUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setTitle(entry?.title ?? '');
    setDate(normalizeDateForInput(entry?.date));
    setSummary(entry?.summary ?? '');
    setMood(entry?.mood ?? '');
    setImgName(entry?.img_name ?? '');
    setFile(null);

    if (entry?.img_name) {
      if (entry.img_name.startsWith('uploads/')) {
        setPreview(`${base}/${entry.img_name}`);
      } else {
        setPreview(entry.img_name);
      }
    } else {
      setPreview('');
    }

    setErrors({});
    setStatus('');
    setTimeout(() => firstRef.current?.focus(), 10);
  }, [open, entry, base]);

  function validate() {
    const e = {};
    const t = (title ?? '').trim();
    const s = (summary ?? '').trim();
    const m = (mood ?? '').trim();
    const i = (imgName ?? '').trim();
    if (!t) e.title = 'Title is required.';
    else if (t.length > 200) e.title = 'Title must be 1–200 characters.';
    if (!date) e.date = 'Date is required.';
    else if (isNaN(new Date(date).getTime())) e.date = 'Date is invalid.';
    if (!s) e.summary = 'Summary is required.';
    else if (s.length > 5000) e.summary = 'Summary must be 1–5000 characters.';
    if (m.length > 200) e.mood = 'Mood must be 200 characters or less.';
    if (i.length > 1000) e.img_name = 'Image URL must be 1000 characters or less.';
    if (file) {
      if (!file.type.startsWith('image/')) e.img = 'Uploaded file must be an image.';
      if (file.size > 5 * 1024 * 1024) e.img = 'Image must be 5MB or smaller.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleFileChange = (ev) => {
    const f = ev.target.files && ev.target.files[0];
    if (fileObjectUrlRef.current) {
      URL.revokeObjectURL(fileObjectUrlRef.current);
      fileObjectUrlRef.current = null;
    }

    setFile(f || null);

    if (f) {
      try {
        const url = URL.createObjectURL(f);
        fileObjectUrlRef.current = url;
        setPreview(url);
      } catch {
        setPreview('');
      }
      setImgName('');
    } else {
      setPreview(imgName || (entry?.img_name ? (entry.img_name.startsWith('uploads/') ? `${base}/${entry.img_name}` : entry.img_name) : ''));
    }
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setStatus('');
    if (!validate()) return;
    setSaving(true);

    const id = entry._id ?? entry.id;
    if (!id) {
      setStatus('No entry id provided');
      setSaving(false);
      return;
    }

    try {
      const form = new FormData();
      form.append('title', title.trim());
      form.append('date', date);
      form.append('summary', summary.trim());
      form.append('mood', mood.trim());
      if (file) form.append('img', file, file.name);
      else form.append('img_name', imgName || (entry.img_name || ''));

      const saved = await updateEntry(id, form);

      if (saved && saved.img_name && !saved.img_url) {
        saved.img_url = normalizeImgUrl(saved.img_name);
      }

      onSaved && onSaved(saved);
      setStatus('Saved.');
      onClose && onClose();
    } catch (err) {
      // if server returned joi details, update field errors
      if (err && err.details && Array.isArray(err.details)) {
        const map = {};
        err.details.forEach((d) => {
          const key = (d.path && d.path.length ? d.path[d.path.length - 1] : (d.context && d.context.key)) || '_general';
          map[key] = d.message;
        });
        setErrors(map);
        setStatus('Validation errors — please fix the fields.');
      } else {
        const msg = err?.message || String(err);
        setStatus('Error: ' + msg);
      }
    } finally {
      setSaving(false);
    }
  };

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
            <input value={imgName} onChange={(e) => setImgName(e.target.value)} disabled={saving} placeholder="https://..." />
            {errors.img_name && <div style={errStyle}>{errors.img_name}</div>}
          </p>

          <p>
            <label>Or upload a new image:</label><br />
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={saving} />
            {errors.img && <div style={errStyle}>{errors.img}</div>}
          </p>

          {preview && <p><img src={preview} alt="preview" style={{ maxWidth: 200 }} onError={(ev) => { ev.currentTarget.style.display = 'none'; }} /></p>}

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
