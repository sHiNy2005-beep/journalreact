import React, { useState, useEffect } from 'react';
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

  const API_URL = process.env.REACT_APP_API_URL || "https://server-journal-1.onrender.com";

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
    </section>
  );
}
