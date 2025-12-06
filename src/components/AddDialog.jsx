// src/components/AddDialog.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createEntry, normalizeImgUrl } from '../api';

export default function AddDialog({
  open,
  onClose,
  onAdded,         // called with saved entry
  apiBase = '',    // optional override (if provided, preview/uploads use this)
}) {
  // <-- FIXED fallback to your Render server
  const base = apiBase || process.env.REACT_APP_API_URL || 'https://server-journal-2.onrender.com';

  const [inputs, setInputs] = useState({ title: '', date: '', summary: '', mood: '', img_name: '' });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const fileObjectUrlRef = useRef(null);
  const firstRef = useRef(null);

  useEffect(() => {
    if (open) {
      setInputs({ title: '', date: '', summary: '', mood: '', img_name: '' });
      setFile(null);
      setPreviewUrl('');
      setErrors({});
      setStatus('');
      setTimeout(() => firstRef.current?.focus(), 10);
    } else {
      // cleanup preview URL if dialog closed
      if (fileObjectUrlRef.current) {
        URL.revokeObjectURL(fileObjectUrlRef.current);
        fileObjectUrlRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const validate = (vals, f) => {
    const e = {};
    const t = (vals.title || '').trim();
    const s = (vals.summary || '').trim();
    const m = (vals.mood || '').trim();
    const i = (vals.img_name || '').trim();

    if (!t) e.title = 'Title is required.';
    else if (t.length > 200) e.title = 'Title must be 200 characters or less.';
    if (!vals.date) e.date = 'Date is required.';
    else if (isNaN(Date.parse(vals.date))) e.date = 'Invalid date.';
    if (!s) e.summary = 'Summary is required.';
    else if (s.length > 5000) e.summary = 'Summary must be 5000 characters or less.';
    if (m.length > 200) e.mood = 'Mood must be 200 characters or less.';
    if (i.length > 1000) e.img_name = 'Image URL too long.';
    if (f) {
      if (!f.type.startsWith('image/')) e.img = 'Uploaded file must be an image.';
      if (f.size > 5 * 1024 * 1024) e.img = 'Image must be 5MB or smaller.';
    }
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((p) => {
      const next = { ...p, [name]: value };
      // if user sets img_name and it looks like an uploads/ path, show preview using base
      if (name === 'img_name' && !file) {
        const t = (value || '').trim();
        if (t.startsWith('uploads/')) {
          setPreviewUrl(base ? `${base}/${t}` : t);
        } else {
          setPreviewUrl(t || '');
        }
      }
      return next;
    });
  };

  const handleFileChange = (ev) => {
    const f = ev.target.files && ev.target.files[0];
    // revoke prior object url
    if (fileObjectUrlRef.current) {
      URL.revokeObjectURL(fileObjectUrlRef.current);
      fileObjectUrlRef.current = null;
    }
    setFile(f || null);
    if (f) {
      try {
        const url = URL.createObjectURL(f);
        fileObjectUrlRef.current = url;
        setPreviewUrl(url);
      } catch {
        setPreviewUrl('');
      }
      setInputs((p) => ({ ...p, img_name: '' })); // file takes precedence
    } else {
      // no file chosen: show inputs.img_name or empty
      const name = inputs.img_name || '';
      if (name.startsWith('uploads/')) setPreviewUrl(base ? `${base}/${name}` : name);
      else setPreviewUrl(name || '');
    }
    setErrors((p) => ({ ...p, img: undefined }));
  };

  useEffect(() => {
    return () => {
      if (fileObjectUrlRef.current) {
        URL.revokeObjectURL(fileObjectUrlRef.current);
        fileObjectUrlRef.current = null;
      }
    };
  }, []);

  const submit = async (ev) => {
    ev.preventDefault();
    setStatus('');
    const valErr = validate(inputs, file);
    if (Object.keys(valErr).length) {
      setErrors(valErr);
      setStatus('Please fix the highlighted errors.');
      return;
    }
    setErrors({});
    setBusy(true);
    setStatus('Uploading...');

    try {
      let payload;
      if (file) {
        payload = new FormData();
        payload.append('title', inputs.title || '');
        payload.append('date', inputs.date || '');
        payload.append('summary', inputs.summary || '');
        payload.append('mood', inputs.mood || '');
        payload.append('img', file, file.name);
      } else {
        // send JSON; createEntry supports both JSON and FormData
        payload = {
          title: inputs.title || '',
          date: inputs.date || '',
          summary: inputs.summary || '',
          mood: inputs.mood || '',
          img_name: inputs.img_name || ''
        };
      }

      const saved = await createEntry(payload);

      // normalize for UI: ensure img_url exists (and uses base for uploads/)
      if (saved && saved.img_name && !saved.img_url) saved.img_url = normalizeImgUrl(saved.img_name);

      setStatus('Saved.');
      onAdded && onAdded(saved);
      onClose && onClose();
    } catch (err) {
      if (err && err.details && Array.isArray(err.details)) {
        const map = {};
        err.details.forEach((d) => {
          const key = (d.path && d.path.length ? d.path[d.path.length - 1] : (d.context && d.context.key)) || '_general';
          map[key] = d.message;
        });
        setErrors(map);
        setStatus('Validation errors — please fix fields.');
      } else {
        const msg = err?.message || String(err);
        setStatus('Error: ' + msg);
      }
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-label="Add entry dialog" style={overlayStyle}>
      <div className="dialog" style={dialogStyle}>
        <h3>Add Entry</h3>

        <form onSubmit={submit} encType="multipart/form-data" noValidate>
          <p>
            <label>Title</label><br />
            <input name="title" ref={firstRef} value={inputs.title} onChange={handleChange} disabled={busy} />
            {errors.title && <div className="field-error" style={errStyle}>{errors.title}</div>}
          </p>

          <p>
            <label>Date</label><br />
            <input type="date" name="date" value={inputs.date} onChange={handleChange} disabled={busy} />
            {errors.date && <div className="field-error" style={errStyle}>{errors.date}</div>}
          </p>

          <p>
            <label>Summary</label><br />
            <textarea name="summary" rows={6} value={inputs.summary} onChange={handleChange} disabled={busy} />
            {errors.summary && <div className="field-error" style={errStyle}>{errors.summary}</div>}
          </p>

          <p>
            <label>Mood (optional)</label><br />
            <input name="mood" value={inputs.mood} onChange={handleChange} disabled={busy} />
            {errors.mood && <div className="field-error" style={errStyle}>{errors.mood}</div>}
          </p>

          <section style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <p>
                <label>Upload image (optional)</label><br />
                <input type="file" accept="image/*" onChange={handleFileChange} disabled={busy} />
                {errors.img && <div className="field-error" style={errStyle}>{errors.img}</div>}
              </p>

              <p>
                <label>or image URL (optional)</label><br />
                <input name="img_name" value={inputs.img_name} onChange={handleChange} disabled={busy} placeholder="https://..." />
                {errors.img_name && <div className="field-error" style={errStyle}>{errors.img_name}</div>}
              </p>

              <div style={{ marginTop: 8 }}>
                <small>Tip: file upload takes precedence over URL. Files are stored on the server.</small>
              </div>
            </div>

            <div style={{ width: 180 }}>
              <div style={{ marginBottom: 8 }}>Preview</div>
              {previewUrl ? (
                <img src={previewUrl} alt="preview" style={{ width: '100%', borderRadius: 8 }} onError={(ev) => { ev.currentTarget.style.display = 'none'; }} />
              ) : <div style={{ width: '100%', height: 120, background: '#f6f6f6', borderRadius: 8 }} />}
            </div>
          </section>

          <div style={{ marginTop: 12 }}>
            <button type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>{' '}
            <button type="button" onClick={() => onClose && onClose()} disabled={busy}>Cancel</button>
          </div>

          {status && <div style={{ marginTop: 10 }}>{status}</div>}
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', left: 0, top: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
};
const dialogStyle = {
  background: '#fff', padding: 16, borderRadius: 8, width: 'min(880px, 96%)', boxShadow: '0 6px 24px rgba(0,0,0,0.18)'
};
const errStyle = { color: 'crimson', marginTop: 6, fontSize: '0.92em' };
