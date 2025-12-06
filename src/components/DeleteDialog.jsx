// src/components/DeleteDialog.jsx (debug-friendly)
import React, { useState } from 'react';
import { deleteEntry } from '../api';

export default function DeleteDialog({ open, onClose, entryId, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  if (!open) return null;

  const confirmDelete = async () => {
    setBusy(true);
    setStatus('');
    try {
      if (!entryId) throw new Error('No entry id provided');
      console.log('DELETE /api/journalEntries/', entryId);
      await deleteEntry(entryId);
      console.log('Delete success for', entryId);
      onDeleted && onDeleted(entryId);
      onClose && onClose();
    } catch (err) {
      console.error('Delete failed', err);
      setStatus('Error: ' + (err.message || String(err)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>
        <h3>Delete entry (debug)</h3>
        <p>Are you sure you want to delete?</p>
        <div>
          <button onClick={confirmDelete} disabled={busy}>{busy ? 'Deleting...' : 'Yes, delete'}</button>{' '}
          <button onClick={()=>onClose&&onClose()} disabled={busy}>Cancel</button>
        </div>
        {status && <div style={{color:'crimson', marginTop:8}}>{status}</div>}
      </div>
    </div>
  );
}

const overlayStyle={ position:'fixed', left:0,top:0,right:0,bottom:0, background:'rgba(0,0,0,0.4)', display:'flex',alignItems:'center',justifyContent:'center', zIndex:2000 };
const dialogStyle={ background:'#fff', padding:16, borderRadius:8, width:'min(420px,92%)', boxShadow:'0 6px 20px rgba(0,0,0,0.2)' };
