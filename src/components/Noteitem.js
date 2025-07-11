import React, { useContext } from "react";
import NoteContext from "../context/notes/NoteContext";
function Noteitem(prpos) {
  const context=useContext(NoteContext)
  const {deleteNote}=context;
  const { note, updateNote,showAlert } = prpos;
  return (
    <div className="mx-2">
      <div className="card my-3" >
        <div className="card-body overflow-hidden" style={{maxHeight:"100px"}}>
            <div className="container d-flex justify-content-between">
          <h5 className="card-title">{note.title}</h5>
          <div className="d-flex justify-content-end">
          <i className="fas fa-edit mx-2" onClick={()=>{updateNote(note);}} ></i>
          <i className="fas fa-trash-alt mx-2" onClick={()=>{deleteNote(note.id);showAlert("deleted successfully","success")}}></i>
          </div>
          </div>
          <div className="container d-flex justify-content-start">
          <p className="card-text mx-3">{note.description}</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
export default Noteitem;
