import React from 'react';
import { useContext } from 'react';
import NoteContext from '../context/notes/NoteContext';
function Addnote(props) {
    const context = useContext(NoteContext);
    const { addNote } = context;
    const [note, setNote] = React.useState({ title: "", description: "", tag: "" });
    const handleNote = (e) => {
        e.preventDefault();
        if (note.title.length < 3 || note.description.length < 5) {
            props.showAlert("Please enter valid title and description", "warning");
            return false;
        }
        addNote(note.title, note.description, note.tag);
        setNote({ title: "", description: "", tag: "" });
        props.showAlert("Note Added Successfully", "success");

    }
    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value })
    }
    return (<>
        <div className="addNote container my-3" >
            <h3 className='d-flex justify-content-center'>Add Note</h3>
            <form>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Enter Title</label>
                    <input type="text" className="form-control" id="title" name='title' aria-describedby="emailHelp" value={note.title} onChange={onChange} minLength={3} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Enter Description</label>
                    <textarea className="form-control" id="description" name='description' rows="5" value={note.description} onChange={onChange} minLength={5} required></textarea>
                </div>
                <div className="mb-3">
                    <label htmlFor="tag" className="form-label">Enter Tag</label>
                    <input type="text" className="form-control" id="tag" name='tag' aria-describedby="emailHelp" value={note.tag} onChange={onChange} placeholder='general' />
                </div>

                <button type="submit" className="btn btn-primary" onClick={handleNote}>Add Note</button>
            </form>
        </div>
    </>);
}

export default Addnote;