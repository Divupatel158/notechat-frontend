import NoteContext from './NoteContext';
import React, { useState } from 'react';
import { API_ENDPOINTS } from '../../config';
const NoteState = (props) => {
  const notesInitial = [];
  const [notes, setNotes] = useState(notesInitial);
  //get All note
  const getNote = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.FETCH_ALL_NOTES, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem('token')
        },
      });
      
      if (!response.ok) {
        console.error("Failed to fetch notes:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        return;
      }
      
      const json = await response.json();
      setNotes(json);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  }
  //add note
  const addNote = async (title, description, tag) => {
    try {
      const response = await fetch(API_ENDPOINTS.ADD_NOTE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem('token')
        },
        body: JSON.stringify({ title, description, tag })
      });
      
      if (!response.ok) {
        console.error("Failed to add note:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        return;
      }
      
      const json = await response.json();
      setNotes(notes.concat(json));
    } catch (error) {
      console.error("Error adding note:", error);
    }
  }
  //edit note
  const editNote = async (id, title, description, tag) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.UPDATE_NOTE}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem('token')
        },
        body: JSON.stringify({ title, description, tag })
      });
      
      if (!response.ok) {
        console.error("Failed to update note:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        return;
      }
      
      const json = await response.json();
      console.log(json);

      let newNotes = JSON.parse(JSON.stringify(notes))
      for (let i = 0; i < newNotes.length; i++) {
        if (newNotes[i].id === id) {
          newNotes[i].title = title;
          newNotes[i].description = description;
          newNotes[i].tag = tag;
          break;
        }
      }
      setNotes(newNotes);
    } catch (error) {
      console.error("Failed to edit note:", error);
    }

  }
  //delete note
  const deleteNote = async (id) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.DELETE_NOTE}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem('token')
        }
      });
      
      if (!response.ok) {
        console.error("Failed to delete note:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        return;
      }
      
      const json = await response.json();
      console.log(json);
      const newnotes = notes.filter((note) => {
        return note.id !== id
      });
      setNotes(newnotes);
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  }
  return (
    <NoteContext.Provider value={{ notes, addNote, deleteNote, editNote, getNote }}>
      {props.children}
    </NoteContext.Provider>
  )
}
export default NoteState;