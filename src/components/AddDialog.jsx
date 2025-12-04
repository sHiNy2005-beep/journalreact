import React, { useState } from "react";
import "../styles/dialog.css";

function validateEntry(entry, file) {
  const errors = {};
  const t = (entry.title || "").trim();
  const s = (entry.summary || "").trim();
  const m = (entry.mood || "").trim();
  const imgName = (entry.img_name || "").trim();

  if (!t) errors.title = "Title is required.";
  else if (t.length > 200) errors.title = "Title must be 200 characters or less.";
  if (!entry.date) errors.date = "Date is required.";
  else if (isNaN(Date.parse(entry.date))) errors.date = "Invalid date format.";
  if (!s) errors.summary = "Summary is required.";
  else if (s.length > 5000) errors.summary = "Summary must be 5000 characters or less.";
  if (m.length > 200) errors.mood = "Mood must be 200 characters or less.";
  if (imgName && imgName.length > 1000) errors.img_name = "Image name too long.";

  if (file) {
    if (!file.type.startsWith("image/")) errors.img = "Uploaded file must be an image.";
    if (file.size > 5 * 1024 * 1024) errors.img = "Image must be 5MB or smaller.";
  }

  return errors;
}

const AddDialog = ({ apiBase = '', addJournalEntry, closeDialog }) => {
  const base = apiBase || process.env.REACT_APP_API_URL || 'https://server-journal-2.onrender.com';
  const [inputs, setInputs] = useState({ title: "", date: "", summary: "", mood: "", img_name: "" });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState("");

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
    if (f) setPreviewUrl(URL.createObjectURL(f));
    else setPreviewUrl("");
    setInputs((p) => ({ ...p, img_name: "" }));
  };

  const handlePickUrl = (url) => {
    setInputs((p) => ({ ...p, img_name: url }));
    setFile(null);
    setPreviewUrl(url);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setResult("");
    const validation = validateEntry(inputs, file);
    if (Object.keys(validation).length) {
      setErrors(validation);
      setResult("Please fix highlighted errors.");
      return;
    }
    setErrors({});
    setResult("Uploading...");

    const form = new FormData();
    form.append("title", inputs.title || "");
    form.append("date", inputs.date || "");
    form.append("summary", inputs.summary || "");
    form.append("mood", inputs.mood || "");
    if (file) form.append("img", file, file.name);
    else form.append("img_name", inputs.img_name || "");

    try {
      const res = await fetch(`${base}/api/journalEntries`, {
        method: "POST",
        body: form,
      });

      const txt = await res.text();
      let parsed = null;
      try { parsed = txt ? JSON.parse(txt) : null; } catch (_) { parsed = null; }

      if (res.status === 201 || res.ok) {
        const saved = parsed || await res.json().catch(() => null);
        setResult("Entry Successfully Added");
        addJournalEntry && addJournalEntry(saved);
        closeDialog && closeDialog();
      } else if (res.status === 400 && parsed && parsed.details) {
        const map = {};
        parsed.details.forEach((d) => {
          const key = (d.path && d.path.length ? d.path[d.path.length - 1] : (d.context && d.context.key)) || '_general';
          map[key] = d.message;
        });
        setErrors(map);
        setResult("Validation errors — please fix the fields.");
      } else {
        const msg = (parsed && (parsed.message || parsed.error)) || txt || `HTTP ${res.status}`;
        setResult(`Error: ${msg}`);
      }
    } catch (err) {
      setResult("Network error — could not reach server.");
      console.error(err);
    }
  };

  return (
    <div id="add-dialog" className="w3-modal">
      <div className="w3-modal-content">
        <div className="w3-container">
          <span id="dialog-close" className="w3-button w3-display-topright" onClick={closeDialog}>&times;</span>
          <form id="add-entry-form" onSubmit={onSubmit} encType="multipart/form-data" noValidate>
            <p>
              <label>Title:</label><br />
              <input name="title" value={inputs.title} onChange={handleChange} required />
              {errors.title && <div className="field-error">{errors.title}</div>}
            </p>

            <p>
              <label>Date:</label><br />
              <input type="date" name="date" value={inputs.date} onChange={handleChange} required />
              {errors.date && <div className="field-error">{errors.date}</div>}
            </p>

            <p>
              <label>Summary:</label><br />
              <textarea name="summary" value={inputs.summary} onChange={handleChange} required />
              {errors.summary && <div className="field-error">{errors.summary}</div>}
            </p>

            <p>
              <label>Mood (optional):</label><br />
              <input name="mood" value={inputs.mood} onChange={handleChange} />
              {errors.mood && <div className="field-error">{errors.mood}</div>}
            </p>

            <section className="columns">
              <p id="img-prev-section">
                {previewUrl ? <img id="img-prev" src={previewUrl} alt="preview" style={{ maxWidth: 160 }} /> : null}
              </p>
              <p id="img-upload">
                <label>Upload Image (optional):</label><br />
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {errors.img && <div className="field-error">{errors.img}</div>}

                <div style={{ marginTop: 10 }}>
                  <label>or provide an image URL:</label><br />
                  <input name="img_name" value={inputs.img_name} onChange={handleChange} placeholder="https://..." />
                  {errors.img_name && <div className="field-error">{errors.img_name}</div>}
                </div>

                <div style={{ marginTop: 8 }}>
                  <small>Tip: pick a file or paste a URL. File takes precedence.</small>
                </div>
              </p>
            </section>

            <p>
              <button type="submit">Submit</button>
            </p>
            <p>{result}</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDialog;
