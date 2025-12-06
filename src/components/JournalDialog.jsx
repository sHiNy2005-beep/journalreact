// src/components/JournalDialog.jsx
import React, { useState } from "react";
import JournalDetailsDialog from "./JournalDetailsDialog";
import JournalAddDialog from "./AddDialog";
import JournalEditDialog from "./EditDialog";
import JournalDeleteDialog from "./DeleteDialog";
import '../styles/journal.css';


export default function JournalDialog(props) {
  // props.mode: "details" | "add" | "edit" | "delete"
  const initialMode = props.mode || (props.entry ? "details" : "add");
  const [mode, setMode] = useState(initialMode);

  const close = () => {
    setMode("details");
    props.closeJournalDialog && props.closeJournalDialog();
  };

  return (
    <div className="dialog-overlay" style={overlayStyle}>
      <div className="dialog" style={dialogStyle}>
        <button style={{ float: "right" }} onClick={close}>×</button>
        {mode === "details" ? (
          <JournalDetailsDialog
            {...props.entry}
            showEdit={() => setMode("edit")}
            showDelete={() => setMode("delete")}
            showAdd={() => setMode("add")}
          />
        ) : mode === "add" ? (
          <JournalAddDialog closeAddDialog={close} onCreated={props.addEntry} />
        ) : mode === "edit" ? (
          <JournalEditDialog {...(props.entry || {})} closeEditDialog={() => setMode("details")} updateEntry={props.updateEntry} />
        ) : (
          <JournalDeleteDialog {...(props.entry || {})} closeDeleteDialog={() => setMode("details")} hideEntry={props.hideEntry} />
        )}
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed", left: 0, top: 0, right: 0, bottom: 0,
  background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000
};

const dialogStyle = {
  background: "#fff", padding: 20, borderRadius: 8, width: "min(800px, 96%)", boxShadow: "0 8px 30px rgba(0,0,0,0.2)"
};
