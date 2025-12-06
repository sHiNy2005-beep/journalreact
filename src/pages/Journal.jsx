// src/Journal.jsx
import React, { useEffect, useState } from 'react';
import { embeddedJournal } from '../data/entriesData';
import '../styles/journal.css';
import EditDialog from '../components/EditDialog.jsx';
import DeleteDialog from '../components/DeleteDialog.jsx';
import AddDialog from '../components/AddDialog.jsx';
import { fetchEntries, createEntry, normalizeImgUrl, API_BASE } from '../api';

function parseToDate(dstr) {
  if (!dstr) return null;
  if (dstr instanceof Date && !isNaN(dstr)) return dstr;
  if (typeof dstr === 'string') {
    const s = dstr.trim();
    const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (ymd) {
      const [_, y, m, d] = ymd;
      const dt = new Date(+y, +m - 1, +d);
      if (!isNaN(dt)) return dt;
    }
    const dt2 = new Date(s);
    if (!isNaN(dt2)) return dt2;
  }
  return null;
}

function formatDate(dstr) {
  const dt = parseToDate(dstr);
  return dt ? dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
}

function timeValue(dstr) {
  const dt = parseToDate(dstr);
  return dt ? dt.getTime() : 0;
}

export default function Journal() {
  const initialEntries = (embeddedJournal?.entries || []).slice().sort((a, b) => timeValue(b.date) - timeValue(a.date));
  const [entriesState, setEntriesState] = useState(initialEntries);
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', date: '', summary: '', mood: '', img_name: '' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || API_BASE;

  const [editOpen, setEditOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const arr = await fetchEntries();
        arr.sort((a, b) => timeValue(b.date) - timeValue(a.date));
        if (mounted && arr.length) setEntriesState(arr);
      } catch (err) {
        if (mounted) setErrorMsg('Could not load latest entries — showing embedded data.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => setNewEntry((p) => ({ ...p, [e.target.name]: e.target.value }));

  const safeImgValue = (val) => {
    if (!val) return '';
    try {
      new URL(val, window.location.origin);
      return val;
    } catch {
      return val;
    }
  };

  function validateNewEntryFields(entry) {
    const t = entry.title?.trim() ?? '';
    const d = entry.date ?? '';
    const s = entry.summary?.trim() ?? '';
    const m = (entry.mood ?? '').trim();
    const img = (entry.img_name ?? '').trim();

    if (!t || t.length < 1 || t.length > 200) return 'Title must be 1–200 characters.';
    if (!d) return 'Date is required.';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return 'Date is invalid.';
    if (!s || s.length < 1 || s.length > 5000) return 'Summary must be 1–5000 characters.';
    if (m.length > 200) return 'Mood must be 200 characters or less.';
    if (img.length > 1000) return 'Image URL must be 1000 characters or less.';
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const vError = validateNewEntryFields(newEntry);
    if (vError) {
      setErrorMsg(vError);
      return;
    }

    setSubmitting(true);
    const localTempId = `temp-${Date.now()}`;
    const optimisticEntry = { ...newEntry, _id: localTempId, isTemp: true };
    setEntriesState((p) => [optimisticEntry, ...p].sort((a, b) => timeValue(b.date) - timeValue(a.date)));
    setNewEntry({ title: '', date: '', summary: '', mood: '', img_name: '' });
    setShowForm(false);
    try {
      const saved = await createEntry({
        title: optimisticEntry.title,
        date: optimisticEntry.date,
        summary: optimisticEntry.summary,
        mood: optimisticEntry.mood,
        img_name: safeImgValue(optimisticEntry.img_name)
      });
      setEntriesState((p) => {
        const filtered = p.filter((it) => it._id !== localTempId);
        return [saved, ...filtered].sort((a, b) => timeValue(b.date) - timeValue(a.date));
      });
      setSuccessMsg('Entry added successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setEntriesState((p) => p.filter((it) => it._id !== localTempId));
      setErrorMsg(err.message || 'Could not save entry to server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  function openEdit(entryToEdit) {
    setEditEntry(entryToEdit);
    setEditOpen(true);
  }

  function openDelete(id) {
    setDeleteEntryId(id);
    setDeleteOpen(true);
  }

  function handleEditSaved(updated) {
    if (!updated) return;
    const idKey = updated._id ?? updated.id;
    setEntriesState((prev) => prev.map((it) => ((it._id ?? it.id) === idKey ? updated : it)).sort((a, b) => timeValue(b.date) - timeValue(a.date)));
    setSuccessMsg('Entry edited successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  function handleDeleted(id) {
    if (!id) return;
    setEntriesState((prev) => prev.filter((it) => (it._id ?? it.id) !== id));
    if (editEntry && ((editEntry._id ?? editEntry.id) === id)) {
      setEditOpen(false);
      setEditEntry(null);
    }
    setSuccessMsg('Entry deleted.');
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  const entries = entriesState;

  return (
    <section id="journal" className="entries">
      <h1 className="entries-title">Recent Entries</h1>

      {successMsg && <div className="info" role="status" style={{ marginBottom: 8 }}>{successMsg}</div>}
      {loading && <div className="info">Loading latest entries…</div>}
      {errorMsg && <div className="error" role="alert" style={{ marginBottom: 8 }}>{errorMsg}</div>}

      <div className="journal-scroll-wrapper" aria-live="polite">
        {entries.length === 0 && !loading && <div className="info">No entries yet.</div>}
        {entries.map((e, idx) => {
          const PUBLIC_URL = process.env.PUBLIC_URL || '';
          let imgSrc = '';
          if (e.img_name) {
            let name = e.img_name.replace(/^json\//i, '/images/').replace(/^\/+/, '/');
            if (name.startsWith('uploads/')) {
              imgSrc = `${API_URL}/${name}`;
            } else if (name.startsWith('http://') || name.startsWith('https://')) {
              imgSrc = name;
            } else {
              imgSrc = `${PUBLIC_URL}${name}`;
            }
          } else if (e.img_url) {
            imgSrc = e.img_url;
          }

          return (
            <article className="entry" key={e._id ?? e.id ?? `${e.title}-${idx}`}>
              <div className="entry-content">
                <div className="entry-date">{formatDate(e.date)}</div>
                <h2>{e.title}</h2>
                <p>{e.summary}</p>
                <span className="mood">{e.mood}</span>
                {e.isTemp && <small> (pending)</small>}
              </div>

              {imgSrc && (
                <img
                  className="entry-thumb"
                  src={imgSrc}
                  alt={e.title || 'Journal image'}
                  onError={(ev) => { ev.currentTarget.style.display = 'none'; }}
                />
              )}

              <div className="entry-actions">
                <button className="edit-btn" onClick={() => openEdit(e)} aria-label={`Edit entry ${e.title}`}>
                  Edit
                </button>
                <button className="delete-btn" onClick={() => openDelete(e._id ?? e.id)} aria-label={`Delete entry ${e.title}`}>
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button className="add-entry-btn" onClick={() => setShowForm((s) => !s)} aria-pressed={showForm} disabled={submitting}>
          {showForm ? 'Cancel' : 'Add New Entry'}
        </button>
      </div>

      {showForm && (
        <form className="add-entry-form" onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
          <input type="text" name="title" placeholder="Title" aria-label="Title" value={newEntry.title} onChange={handleChange} required />
          <input type="date" name="date" aria-label="Date" value={newEntry.date} onChange={handleChange} required />
          <textarea name="summary" placeholder="Write your entry..." aria-label="Summary" value={newEntry.summary} onChange={handleChange} required />
          <input type="text" name="mood" placeholder="Mood" aria-label="Mood" value={newEntry.mood} onChange={handleChange} />
          <input type="text" name="img_name" placeholder="Image URL (optional)" aria-label="Image URL" value={newEntry.img_name} onChange={handleChange} />
          <div style={{ marginTop: '0.5rem' }}>
            <button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save Entry'}</button>
          </div>
        </form>
      )}

      <EditDialog
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditEntry(null); }}
        entry={editEntry}
        apiBase={API_URL}
        onSaved={handleEditSaved}
      />

      <DeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteEntryId(null); }}
        entryId={deleteEntryId}
        apiBase={API_URL}
        onDeleted={handleDeleted}
      />
    </section>
  );
}
