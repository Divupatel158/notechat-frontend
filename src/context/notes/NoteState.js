import NoteContext from './NoteContext';
import React, { useState } from 'react';
import { API_ENDPOINTS } from '../../config';
const NoteState = (props) => {
  const notesInitial = [];
  const [notes, setNotes] = useState(notesInitial);
  //get All note
  const getNote = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No token found in localStorage! User is not logged in.");
      return;
    }
    try {
      const response = await fetch(API_ENDPOINTS.FETCH_ALL_NOTES, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
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
          "Authorization": `Bearer ${localStorage.getItem('token')}`
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
          "Authorization": `Bearer ${localStorage.getItem('token')}`
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
          "Authorization": `Bearer ${localStorage.getItem('token')}`
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

  //clear all notes
  const clearAllNotes = async () => {
    try {
      console.log("Attempting to clear all notes...");
      console.log("API endpoint:", API_ENDPOINTS.CLEAR_ALL_NOTES);
      
      const response = await fetch(API_ENDPOINTS.CLEAR_ALL_NOTES, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      
      if (!response.ok) {
        console.error("Failed to clear all notes:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        return false;
      }
      
      const json = await response.json();
      console.log("Success response:", json);
      setNotes([]); // Clear all notes from state
      return true;
    } catch (error) {
      console.error("Error clearing all notes:", error);
      return false;
    }
  }

  return (
    <NoteContext.Provider value={{ notes, addNote, deleteNote, editNote, getNote, clearAllNotes }}>
      {props.children}
    </NoteContext.Provider>
  )
}
export default NoteState;