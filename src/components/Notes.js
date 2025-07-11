import React, { useContext, useEffect, useRef, useState } from "react";
import NoteContext from "../context/notes/NoteContext";
import Noteitem from "./Noteitem";
import { useNavigate } from "react-router-dom";
function Notes(props) {
    const context = useContext(NoteContext);
    const { notes, getNote, editNote } = context;
    const { showAlert } = props
    let navigate = useNavigate();
    useEffect(() => {
        if (localStorage.getItem('token')) {
            getNote();
        }
        else {
            navigate("/login");
        }
        // eslint-disable-next-line
    }, []);
    const ref = useRef(null)
    const refClose = useRef(null)
    const [note, setNote] = useState({ id: "", etitle: "", edescription: "" })
    const updateNote = (currentNote) => {
        ref.current.click();
        setNote({ id: currentNote.id, etitle: currentNote.title, edescription: currentNote.description })
    }
    const handleClick = (e) => {
        setNote({ id: note.id, title: note.etitle, description: note.edescription })
        editNote(note.id, note.etitle, note.edescription)
        refClose.current.click();
        showAlert("updated successfully", "success")
    }
    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value });
    }
    return (<>
        <h1 className="d-flex justify-content-center">{localStorage.getItem('uname')}'s' Notes</h1>
        <div className=" overflow-scroll" style={{ height: "65vh", display: "flex", flexDirection: "column" }} >
            <button ref={ref} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#exampleModal"></button>
            <div className="modal fade " id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">{note.etitle}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form className="my-3">
                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <textarea rows={10} className="form-control" id="edescription" name="edescription" value={note.edescription} onChange={onChange} minLength={5} required></textarea>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={refClose} className="btn btn-secondary d-none" data-bs-dismiss="modal"></button>
                            <button onClick={handleClick} type="button" className="btn btn-primary">Update Note</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* modal end */}

            {notes.length === 0 && <h3 className="mx-3">No notes Created yet</h3>}
            {notes.map((note) => {
                return <Noteitem key={note.id} updateNote={updateNote} note={note} showAlert={showAlert} />
            })}
        </div>
    </>
    );
}
export default Notes