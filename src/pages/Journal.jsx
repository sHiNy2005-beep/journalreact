import React, { useEffect, useState } from 'react';
import { embeddedJournal } from '../data/entriesData';
import '../styles/journal.css';
import entriesData from "../data/entriesData";

function formatDate(dstr) {
  if (!dstr) return '';
  const [y,m,d] = dstr.split('-').map(Number);
  const dt = new Date(y,m-1,d);
  return dt.toLocaleDateString(undefined,{ year: 'numeric', month: 'short', day: 'numeric'});
}

export default function Journal(){
  const [entriesState, setEntriesState] = useState(
    (embeddedJournal.entries || []).slice().sort((a,b)=> new Date(b.date) - new Date(a.date))
  );
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    date: "",
    summary: "",
    mood: "",
    img_name: ""
  });

  const API_URL = "http://localhost:3002";

  useEffect(() => {
    fetch(`${API_URL}/api/journalEntries`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        const arr = Array.isArray(data) ? data : (data.entries || []);
        arr.sort((a,b)=> new Date(b.date) - new Date(a.date));
        if (arr.length) setEntriesState(arr);
      })
      .catch(err => {
        console.warn("Could not fetch live entries, using embedded data:", err);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const localTempId = `temp-${Date.now()}`;
    const optimisticEntry = { ...newEntry, _id: localTempId };
    setEntriesState(prev => [optimisticEntry, ...prev]);

    setNewEntry({ title: "", date: "", summary: "", mood: "", img_name: "" });
    setShowForm(false);

    try {
      const res = await fetch(`${API_URL}/api/journalEntries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: optimisticEntry.title,
          date: optimisticEntry.date,
          summary: optimisticEntry.summary,
          mood: optimisticEntry.mood,
          img_name: optimisticEntry.img_name || ""
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();

      setEntriesState(prev => {
        const filtered = prev.filter(e => e._id !== localTempId);
        return [saved, ...filtered].sort((a,b)=> new Date(b.date) - new Date(a.date));
      });

    } catch (err) {
      setEntriesState(prev => prev.filter(e => e._id !== localTempId));
      console.warn("Could not save entry to server:", err);
    }
  };

  const entries = entriesState;

  return (
    <section id="journal" className="entries">
      <h1 className="entries-title">Recent Entries</h1>
      <div className="journal-scroll-wrapper">
        {entries.map(e=> (
          <article className="entry" key={e._id}>
            <div className="entry-content">
              <div className="entry-date">{formatDate(e.date)}</div>
              <h2>{e.title}</h2>
              <p>{e.summary}</p>
              <span className="mood">{e.mood}</span>
            </div>
            {e.img_name && (
              <img
                className="entry-thumb"
                src={e.img_name.replace(/^json\//i,'/')}
                alt={e.title}
                onError={(ev)=>{ev.currentTarget.style.display='none'}}
              />
            )}
          </article>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button className="add-entry-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add New Entry"}
        </button>
      </div>

      {showForm && (
        <form className="add-entry-form" onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={newEntry.title}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="date"
            value={newEntry.date}
            onChange={handleChange}
            required
          />
          <textarea
            name="summary"
            placeholder="Write your entry..."
            value={newEntry.summary}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="mood"
            placeholder="Mood"
            value={newEntry.mood}
            onChange={handleChange}
          />
          <input
            type="text"
            name="img_name"
            placeholder="Image URL (optional)"
            value={newEntry.img_name}
            onChange={handleChange}
          />
          <button type="submit">Save Entry</button>
        </form>
      )}
    </section>
  );
}
