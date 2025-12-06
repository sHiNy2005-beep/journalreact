// src/api.js
const BASE = (process.env.REACT_APP_API_URL || "https://server-journal-2.onrender.com").replace(/\/$/, '');

function buildUrl(path) {
  return `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

function normalizeImgUrl(img_name) {
  if (!img_name) return '';
  if (img_name.startsWith('uploads/')) return `${BASE}/${img_name}`;
  if (img_name.startsWith('json/')) return `/${img_name.replace(/^json\//i, '')}`;
  return img_name;
}

export async function fetchEntries() {
  const res = await fetch(buildUrl('/api/journalEntries'));
  if (!res.ok) throw new Error(`Fetch entries failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.entries || []);
}

export async function createEntry(payload) {
  const isForm = payload instanceof FormData;
  const res = await fetch(buildUrl('/api/journalEntries'), {
    method: 'POST',
    headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    body: isForm ? payload : JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({message: res.statusText || res.status}));
    throw new Error(err.message || `Create failed ${res.status}`);
  }
  const saved = await res.json();
  if (saved && saved.img_name) saved.img_url = normalizeImgUrl(saved.img_name);
  return saved;
}

export async function updateEntry(id, payload) {
  const isForm = payload instanceof FormData;
  const res = await fetch(buildUrl(`/api/journalEntries/${id}`), {
    method: 'PUT',
    headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    body: isForm ? payload : JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({message: res.statusText || res.status}));
    // include details if present for calling code
    const e = new Error(err.message || `Update failed ${res.status}`);
    if (err.details) e.details = err.details;
    throw e;
  }
  const saved = await res.json();
  if (saved && saved.img_name) saved.img_url = normalizeImgUrl(saved.img_name);
  return saved;
}

export async function deleteEntry(id) {
  const res = await fetch(buildUrl(`/api/journalEntries/${id}`), { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(()=>({message: res.statusText || res.status}));
    const e = new Error(err.message || `Delete failed ${res.status}`);
    if (err.details) e.details = err.details;
    throw e;
  }
  return true;
}

export { normalizeImgUrl, BASE as API_BASE };
