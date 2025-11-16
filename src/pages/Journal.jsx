import React, { useEffect, useState } from 'react';
import { embeddedJournal } from '../data/entriesData';
import '../styles/journal.css';

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
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

  useEffect(() => {
    const ac = new AbortController();
    const load = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await fetch(`${API_URL}/api/journalEntries`, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data.entries || []);
        arr.sort((a, b) => timeValue(b.date) - timeValue(a.date));
        if (arr.length) setEntriesState(arr);
      } catch (err) {
        if (err.name !== 'AbortError') setErrorMsg('Could not load latest entries — showing embedded data.');
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => ac.abort();
  }, [API_URL]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    const localTempId = `temp-${Date.now()}`;
    const optimisticEntry = { ...newEntry, _id: localTempId, isTemp: true };
    setEntriesState((p) => [optimisticEntry, ...p].sort((a, b) => timeValue(b.date) - timeValue(a.date)));
    setNewEntry({ title: '', date: '', summary: '', mood: '', img_name: '' });
    setShowForm(false);
    try {
      const res = await fetch(`${API_URL}/api/journalEntries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: optimisticEntry.title,
          date: optimisticEntry.date,
          summary: optimisticEntry.summary,
          mood: optimisticEntry.mood,
          img_name: safeImgValue(optimisticEntry.img_name)
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      setEntriesState((p) => {
        const filtered = p.filter((it) => it._id !== localTempId);
        return [saved, ...filtered].sort((a, b) => timeValue(b.date) - timeValue(a.date));
      });
    } catch {
      setEntriesState((p) => p.filter((it) => it._id !== localTempId));
      setErrorMsg('Could not save entry to server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const entries = entriesState;

  return (
    <section id="journal" className="entries">
      <h1 className="entries-title">Recent Entries</h1>
      {loading && <div className="info">Loading latest entries…</div>}
      {errorMsg && <div className="error" role="alert">{errorMsg}</div>}
      <div className="journal-scroll-wrapper" aria-live="polite">
        {entries.length === 0 && !loading && <div className="info">No entries yet.</div>}
        {entries.map((e) => (
          <article className="entry" key={e._id}>
            <div className="entry-content">
              <div className="entry-date">{formatDate(e.date)}</div>
              <h2>{e.title}</h2>
              <p>{e.summary}</p>
              <span className="mood">{e.mood}</span>
              {e.isTemp && <small> (pending)</small>}
            </div>
            {e.img_name && (
              <img
                className="entry-thumb"
                src={e.img_name.replace(/^json\//i, '/')}
                alt={e.title || 'Journal image'}
                onError={(ev) => { ev.currentTarget.style.display = 'none'; }}
              />
            )}
          </article>
        ))}
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
    </section>
  );
}
