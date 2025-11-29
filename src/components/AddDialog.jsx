import "../styles/dialog.css";
import React, { useState } from "react";

function validateEntry(entry) {
  const errors = {};
  if (!entry.title || entry.title.trim().length < 1)
    errors.title = "Title is required.";
  else if (entry.title.length > 200)
    errors.title = "Title must be 200 characters or less.";
  if (!entry.date) errors.date = "Date is required.";
  else if (isNaN(Date.parse(entry.date))) errors.date = "Invalid date format.";
  if (!entry.summary || entry.summary.trim().length < 1)
    errors.summary = "Summary is required.";
  else if (entry.summary.length > 5000)
    errors.summary = "Summary must be 5000 characters or less.";
  if (entry.mood && entry.mood.length > 200)
    errors.mood = "Mood must be 200 characters or less.";
  if (entry.img_name && entry.img_name.length > 1000)
    errors.img_name = "Image name too long.";
  return errors;
}

const AddDialog = (props) => {
  const [inputs, setInputs] = useState({});
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setInputs((values) => ({ ...values, img: file || null }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("");
    const candidate = {
      title: inputs.title || "",
      date: inputs.date || "",
      summary: inputs.summary || "",
      mood: inputs.mood || "",
      img_name: inputs.img ? inputs.img.name : "",
    };

    const validationErrors = validateEntry(candidate);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setResult("Please fix the highlighted errors.");
      return;
    }

    setErrors({});
    setResult("Sending...");
    const formData = new FormData(event.target);

    try {
      const response = await fetch("https://server-journal-1.onrender.com/api/journalEntries", { // changed link so chnage both front and backend to see if it workks without running it locally 
        method: "POST",
        body: formData,
      });

      if (response.status === 200 || response.status === 201) {
        setResult("Entry Successfully Added");
        event.target.reset();
        props.addJournalEntry && props.addJournalEntry(await response.json());
        props.closeDialog && props.closeDialog();
      } else {
        console.log("Error adding entry", response);
        setResult(`Error: ${response.statusText || response.status}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      setResult("Network error — could not reach server.");
    }
  };

  return (
    <div id="add-dialog" className="w3-modal">
      <div className="w3-modal-content">
        <div className="w3-container">
          <span
            id="dialog-close"
            className="w3-button w3-display-topright"
            onClick={props.closeDialog}
          >
            &times;
          </span>

          <form
            id="add-entry-form"
            onSubmit={onSubmit}
            encType="multipart/form-data"
            noValidate
          >
            <p>
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={inputs.title || ""}
                onChange={handleChange}
                required
              />
              {errors.title && <div className="field-error">{errors.title}</div>}
            </p>

            <p>
              <label htmlFor="date">Date:</label>
              <input
                type="date"
                id="date"
                name="date"
                value={inputs.date || ""}
                onChange={handleChange}
                required
              />
              {errors.date && <div className="field-error">{errors.date}</div>}
            </p>

            <p>
              <label htmlFor="summary">Summary:</label>
              <textarea
                id="summary"
                name="summary"
                value={inputs.summary || ""}
                onChange={handleChange}
                required
              />
              {errors.summary && (
                <div className="field-error">{errors.summary}</div>
              )}
            </p>

            <p>
              <label htmlFor="mood">Mood:</label>
              <input
                type="text"
                id="mood"
                name="mood"
                value={inputs.mood || ""}
                onChange={handleChange}
              />
              {errors.mood && <div className="field-error">{errors.mood}</div>}
            </p>

            <section className="columns">
              <p id="img-prev-section">
                <img
                  id="img-prev"
                  src={inputs.img ? URL.createObjectURL(inputs.img) : ""}
                  alt=""
                />
              </p>
              <p id="img-upload">
                <label htmlFor="img">Upload Image:</label>
                <input
                  type="file"
                  id="img"
                  name="img"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                {errors.img_name && (
                  <div className="field-error">{errors.img_name}</div>
                )}
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
