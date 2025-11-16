// components/EditDialog.jsx
import "../styles/dialog.css";
import React, { useState } from "react";

const EditDialog = (props) => {
  const [inputs, setInputs] = useState({
    _id: props._id,
    title: props.title,
    date: props.date,
    summary: props.summary,
    mood: props.mood,
    prev_img: props.img_name || null,
  });

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleImageChange = (event) => {
    const name = event.target.name;
    const value = event.target.files[0];
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const [result, setResult] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    const formData = new FormData(event.target);

    const response = await fetch(
      `http://localhost:3002/api/journalEntries/${props._id}`,
      {
        method: "PUT",
        body: formData,
      }
    );

    if (response.status === 200) {
      setResult("Entry Successfully updated");
      event.target.reset();
      if (props.editJournalEntry) props.editJournalEntry(await response.json());
      props.closeDialog();
    } else {
      console.log("Error editing entry", response);
      setResult(`Error: ${response.statusText || response.status}`);
    }
  };

  return (
    <div id="edit-dialog" className="w3-modal">
      <div className="w3-modal-content">
        <div className="w3-container">
          <span
            id="dialog-close"
            className="w3-button w3-display-topright"
            onClick={props.closeDialog}
          >
            &times;
          </span>
          <form id="edit-entry-form" onSubmit={onSubmit} encType="multipart/form-data">
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
            </p>

            <section className="columns">
              <p id="img-prev-section">
                <img
                  id="img-prev"
                  src={
                    inputs.img
                      ? URL.createObjectURL(inputs.img)
                      : inputs.prev_img
                      ? `http://localhost:3002/${inputs.prev_img}`
                      : ""
                  }
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

export default EditDialog;
