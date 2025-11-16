import "../styles/dialog.css";
import React, { useState } from "react";

const AddDialog = (props) => {
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState("");

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

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    const formData = new FormData(event.target);

    const response = await fetch("http://localhost:3002/api/journalEntries", {
      method: "POST",
      body: formData,
    });

    if (response.status === 200 || response.status === 201) {
      setResult("Entry Successfully Added");
      event.target.reset();
      props.addJournalEntry(await response.json());
      props.closeDialog();
    } else {
      console.log("Error adding entry", response);
      setResult(`Error: ${response.statusText || response.status}`);
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
          <form id="add-entry-form" onSubmit={onSubmit} encType="multipart/form-data">
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