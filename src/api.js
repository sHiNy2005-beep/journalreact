// src/api.js (debug version — drop in temporarily)
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
  const url = buildUrl('/api/journalEntries');
  console.log('[api debug] GET ->', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch entries failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.entries || []);
}

export async function createEntry(payload) {
  const isForm = payload instanceof FormData;
  const url = buildUrl('/api/journalEntries');
  console.log('[api debug] POST ->', url, 'isForm=', isForm, 'payload=', isForm ? '(FormData)' : payload);
  const res = await fetch(url, {
    method: 'POST',
    headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    body: isForm ? payload : JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({message: res.statusText || res.status}));
    console.log('[api debug] POST error body=', err);
    throw new Error(err.message || `Create failed ${res.status}`);
  }
  const saved = await res.json();
  console.log('[api debug] POST success body=', saved);
  if (saved && saved.img_name) saved.img_url = normalizeImgUrl(saved.img_name);
  return saved;
}

export async function updateEntry(id, payload) {
  const isForm = payload instanceof FormData;
  const url = buildUrl(`/api/journalEntries/${id}`);
  console.log('[api debug] PUT ->', url, 'isForm=', isForm, 'payload=', isForm ? '(FormData)' : payload);
  const res = await fetch(url, {
    method: 'PUT',
    headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    body: isForm ? payload : JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({message: res.statusText || res.status}));
    console.log('[api debug] PUT error body=', err);
    const e = new Error(err.message || `Update failed ${res.status}`);
    if (err.details) e.details = err.details;
    throw e;
  }
  const saved = await res.json();
  console.log('[api debug] PUT success body=', saved);
  if (saved && saved.img_name) saved.img_url = normalizeImgUrl(saved.img_name);
  return saved;
}

export async function deleteEntry(id) {
  const url = buildUrl(`/api/journalEntries/${id}`);
  console.log('[api debug] DELETE ->', url);
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(()=>({message: res.statusText || res.status}));
    console.log('[api debug] DELETE error body=', err);
    const e = new Error(err.message || `Delete failed ${res.status}`);
    if (err.details) e.details = err.details;
    throw e;
  }
  console.log('[api debug] DELETE success for id=', id);
  return true;
}

export { normalizeImgUrl, BASE as API_BASE };
