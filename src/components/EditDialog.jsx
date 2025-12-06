import React, { useEffect, useState, useRef } from 'react';
import { updateEntry, normalizeImgUrl } from '../api';

export default function EditDialog({ open, onClose, entry = {}, onSaved, apiBase = '' }) {
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

  const normDate = (d) => {
    if (!d) return '';
    const dt = (d instanceof Date) ? d : new Date(d);
    return isNaN(dt.getTime()) ? '' : dt.toISOString().slice(0,10);
  };

  useEffect(() => {
    if (!open) return;
    setTitle(entry?.title ?? '');
    setDate(normDate(entry?.date));
    setSummary(entry?.summary ?? '');
    setMood(entry?.mood ?? '');
    setImgName(entry?.img_name ?? '');
    setFile(null);
    if (entry?.img_name) setPreview(entry.img_name.startsWith('uploads/') ? `${base}/${entry.img_name}` : entry.img_name);
    else setPreview('');
    setErrors({});
    setStatus('');
    setTimeout(()=>firstRef.current?.focus(), 10);
  }, [open, entry, base]);

  useEffect(()=>() => {
    if (fileObjectUrlRef.current) { URL.revokeObjectURL(fileObjectUrlRef.current); fileObjectUrlRef.current=null; }
  }, []);

  const handleFileChange = (ev) => {
    const f = ev.target.files && ev.target.files[0];
    if (fileObjectUrlRef.current) { URL.revokeObjectURL(fileObjectUrlRef.current); fileObjectUrlRef.current=null; }
    setFile(f || null);
    if (f) { const url=URL.createObjectURL(f); fileObjectUrlRef.current=url; setPreview(url); setImgName(''); }
    else setPreview(imgName || (entry?.img_name ? (entry.img_name.startsWith('uploads/') ? `${base}/${entry.img_name}` : entry.img_name) : ''));
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setStatus(''); setErrors({});
    if (!title.trim() || !date || !summary.trim()) { setStatus('Missing required fields'); return; }
    setSaving(true);
    try {
      const id = entry._id ?? entry.id;
      if (!id) throw new Error('No entry id');
      const form = new FormData();
      form.append('title', title);
      form.append('date', date);
      form.append('summary', summary);
      form.append('mood', mood || '');
      if (file) form.append('img', file, file.name);
      else form.append('img_name', imgName || (entry.img_name||''));

      console.log('PUT', `${base}/api/journalEntries/${id}`, form);
      const saved = await updateEntry(id, form);
      console.log('Update success:', saved);
      if (saved && saved.img_name && !saved.img_url) saved.img_url = normalizeImgUrl(saved.img_name);
      onSaved && onSaved(saved);
      setStatus('Saved.');
      onClose && onClose();
    } catch (err) {
      console.error('Update failed:', err);
      if (err && err.details && Array.isArray(err.details)) {
        const map = {};
        err.details.forEach(d => { const k = (d.path && d.path.length ? d.path[d.path.length-1] : (d.context && d.context.key)) || '_general'; map[k]=d.message; });
        setErrors(map);
        setStatus('Validation errors returned by server.');
      } else {
        setStatus('Error: ' + (err.message || String(err)));
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>
        <h3>Edit entry (debug)</h3>
        <form onSubmit={submit} encType="multipart/form-data">
          <p><label>Title</label><br/>
            <input ref={firstRef} value={title} onChange={e=>setTitle(e.target.value)} disabled={saving} />
            {errors.title && <div style={errStyle}>{errors.title}</div>}
          </p>

          <p><label>Date</label><br/>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} disabled={saving} />
            {errors.date && <div style={errStyle}>{errors.date}</div>}
          </p>

          <p><label>Summary</label><br/>
            <textarea rows={6} value={summary} onChange={e=>setSummary(e.target.value)} disabled={saving} />
            {errors.summary && <div style={errStyle}>{errors.summary}</div>}
          </p>

          <p><label>Upload new image</label><br/>
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={saving} />
            {errors.img && <div style={errStyle}>{errors.img}</div>}
          </p>

          {preview && <p><img src={preview} alt="preview" style={{maxWidth:200}}/></p>}
          <p>
            <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>{' '}
            <button type="button" onClick={()=>onClose&&onClose()} disabled={saving}>Cancel</button>
          </p>

          <div style={{marginTop:8, color: status && status.startsWith('Error') ? 'crimson' : 'inherit'}}>{status}</div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle={ position:'fixed', left:0,top:0,right:0,bottom:0, background:'rgba(0,0,0,0.4)', display:'flex',alignItems:'center',justifyContent:'center', zIndex:2000 };
const dialogStyle={ background:'#fff', padding:16, borderRadius:8, width:'min(720px,94%)', boxShadow:'0 6px 20px rgba(0,0,0,0.2)' };
const errStyle={ color:'crimson', marginTop:4, fontSize:'0.9em' };
