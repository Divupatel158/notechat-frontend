import React, { useContext, useEffect, useRef, useState } from "react";
import NoteContext from "../context/notes/NoteContext";
import Noteitem from "./Noteitem";
import { useNavigate } from "react-router-dom";

// WhatsApp-style chat CSS
const chatStyles = `
  .chat-bubble {
    position: relative;
    word-wrap: break-word;
  }
  
  .chat-bubble:before {
    content: '';
    position: absolute;
    top: 0;
    width: 0;
    height: 0;
  }
  
  .chat-bubble.bg-white:before {
    left: -8px;
    top: 10px;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-right: 8px solid white;
  }
  
  .chat-bubble.bg-primary:before {
    right: -8px;
    top: 10px;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-left: 8px solid #0d6efd;
  }
  
  .chat-messages::-webkit-scrollbar {
    width: 6px;
  }
  
  .chat-messages::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  .chat-messages::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  .chat-messages::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;
function Notes(props) {
    const context = useContext(NoteContext);
    const { notes, getNote, editNote } = context;
    const { showAlert } = props
    let navigate = useNavigate();
    
    useEffect(() => {
        if (localStorage.getItem('token')) {
            getNote();
            
            // Set up automatic reload every 10 seconds
            const interval = setInterval(async () => {
                setIsRefreshing(true);
                await getNote();
                setLastRefresh(new Date());
                setIsRefreshing(false);
            }, 1000); // 5 seconds = 5000 milliseconds
            
            // Cleanup interval on component unmount
            return () => clearInterval(interval);
        }
        else {
            navigate("/login");
        }
        // eslint-disable-next-line
    }, []);
    const ref = useRef(null)
    const refClose = useRef(null)
    const [note, setNote] = useState({ id: "", etitle: "", edescription: "" })
    const [lastRefresh, setLastRefresh] = useState(new Date())
    const [isRefreshing, setIsRefreshing] = useState(false)
    
    const updateNote = (currentNote) => {
        ref.current.click();
        setNote({ id: currentNote.id, etitle: currentNote.title, edescription: currentNote.description })
    }
    const handleClick = (e) => {
        setNote({ id: note.id, title: note.etitle, description: note.edescription })
        editNote(note.id, note.etitle, note.edescription)
        showAlert("updated successfully", "success")
        // Don't close the modal automatically - let user close it manually
    }
    
    const handleDescriptionChange = (e) => {
        const newDescription = e.target.value;
        setNote({ ...note, edescription: newDescription });
        // Update the note in real-time as user types
        editNote(note.id, note.etitle, newDescription);
    }
    
    const closeModal = () => {
        refClose.current.click();
    }
    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value });
    }
    return (<>
        <style>{chatStyles}</style>
        <h1 className="d-flex justify-content-center">{localStorage.getItem('uname')}'s' Notes</h1>
        <div className=" overflow-scroll" style={{ height: "65vh", display: "flex", flexDirection: "column" }} >
            <button ref={ref} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#exampleModal"></button>
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title" id="exampleModalLabel">
                                <i className="fas fa-comments me-2"></i>
                                {note.etitle}
                            </h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body p-0" style={{ height: '400px' }}>
                            {/* Chat Messages Area */}
                            <div className="chat-messages p-3" style={{ height: '320px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                                {/* Original Message */}
                                <div className="d-flex justify-content-start mb-3">
                                    <div className="chat-bubble bg-white p-3 rounded shadow-sm" style={{ maxWidth: '70%', border: '1px solid #e9ecef' }}>
                                        <small className="text-muted d-block mb-1">
                                            <i className="fas fa-user me-1"></i>
                                            Original Note
                                        </small>
                                        <div className="original-content">
                                            {note.edescription}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Updated Message */}
                                <div className="d-flex justify-content-end mb-3">
                                    <div className="chat-bubble bg-primary text-white p-3 rounded shadow-sm" style={{ maxWidth: '70%' }}>
                                        <small className="d-block mb-1 opacity-75">
                                            <i className="fas fa-edit me-1"></i>
                                            Updated Version
                                        </small>
                                        <div className="updated-content">
                                            {note.edescription}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Input Area */}
                            <div className="chat-input p-3" style={{ borderTop: '1px solid #dee2e6', backgroundColor: 'white' }}>
                                <div className="input-group">
                                    <textarea 
                                        className="form-control border-0" 
                                        id="edescription" 
                                        name="edescription" 
                                        value={note.edescription} 
                                        onChange={handleDescriptionChange} 
                                        placeholder="Type your updated note here..."
                                        rows="3"
                                        style={{ resize: 'none' }}
                                    ></textarea>
                                    <button 
                                        className="btn btn-primary" 
                                        type="button"
                                        onClick={handleClick}
                                        style={{ borderTopLeftRadius: '0', borderBottomLeftRadius: '0' }}
                                    >
                                        <i className="fas fa-paper-plane"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={refClose} className="btn btn-secondary d-none" data-bs-dismiss="modal"></button>
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