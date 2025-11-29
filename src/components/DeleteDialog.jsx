import React, { useState } from 'react';

export default function DeleteDialog({
  open,
  onClose,
  entryId,
  onDelete,
  onDeleted,
  apiBase = '',
}) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  if (!open) return null;

  const confirmDelete = async () => {
    if (busy) return;
    setBusy(true);
    setStatus('');

    try {
      if (typeof onDelete === 'function') {
        await onDelete(entryId);
        onDeleted && onDeleted(entryId);
        onClose && onClose();
        return;
      }

      if (!entryId) {
        setStatus('No entry id provided.');
        return;
      }

  
      const res = await fetch("https://server-journal-1.onrender.com/api/journalEntries", { // added this line 
     // const res = await fetch(`${apiBase}/api/journalEntries/${entryId}`, { // change link to render server
        method: 'DELETE',
      });

      const text = await res.text();
      if (res.ok) {
        onDeleted && onDeleted(entryId);
        onClose && onClose();
      } else {
        const msg = text || `HTTP ${res.status}`;
        setStatus(`Delete failed: ${msg}`);
      }
    } catch (err) {
      setStatus('Network error: ' + (err?.message || err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>
        <h3>Delete entry?</h3>
        <p>Are you sure you want to permanently delete this entry?</p>
        <div style={{ marginTop: 12 }}>
          <button onClick={confirmDelete} disabled={busy}>Yes, delete</button>{' '}
          <button onClick={() => onClose && onClose()} disabled={busy}>Cancel</button>
        </div>
        {status && <div style={{ color: 'crimson', marginTop: 8 }}>{status}</div>}
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', left: 0, top: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
};
const dialogStyle = {
  background: '#fff', padding: 16, borderRadius: 8, width: 'min(420px, 92%)', boxShadow: '0 6px 24px rgba(0,0,0,0.2)'
};
