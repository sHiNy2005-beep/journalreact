// components/DeleteDialog.jsx
import "../styles/dialog.css";
import React, { useState } from "react";

const DeleteDialog = (props) => {
  const [result, setResult] = useState("");

  const deleteEntry = async () => {
    const response = await fetch(
      `http://localhost:3002/api/journalEntries/${props._id}`,
      {
        method: "DELETE",
      }
    );

    if (response.status === 200) {
      setResult("Entry successfully deleted");
      if (props.hideEntry) props.hideEntry(props._id);
    } else {
      console.log("Error deleting entry", response);
      setResult(`Error: ${response.statusText || response.status}`);
    }

    props.closeDialog();
  };

  return (
    <div id="delete-dialog" className="w3-modal">
      <div className="w3-modal-content">
        <div className="w3-container">
          <span
            id="dialog-close"
            className="w3-button w3-display-topright"
            onClick={props.closeDialog}
          >
            &times;
          </span>
          <div id="delete-content">
            <h3>Are you sure you want to delete "{props.title}"?</h3>
            <section>
              <button onClick={deleteEntry}>Yes</button>
              <button onClick={props.closeDialog}>No</button>
            </section>
            <span>{result}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteDialog;
