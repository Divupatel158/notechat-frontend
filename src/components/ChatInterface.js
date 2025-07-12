import React, { useContext, useEffect, useRef, useState } from "react";
import NoteContext from "../context/notes/NoteContext";
import { useNavigate } from "react-router-dom";

function ChatInterface(props) {
    const context = useContext(NoteContext);
    const { notes, getNote, addNote, deleteNote } = context;
    const { showAlert } = props;
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const messageInputRef = useRef(null);
    const [newMessage, setNewMessage] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Helper to parse time string (e.g., '12:34:56 PM') to Date object for today
    const parseTimeString = (timeString) => {
        const now = new Date();
        const [time, modifier] = timeString.split(' ');
        let [hours, minutes, seconds] = time.split(':').map(Number);
        if (modifier && modifier.toLowerCase() === 'pm' && hours < 12) hours += 12;
        if (modifier && modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds || 0);
        return date;
    };

    useEffect(() => {
        if (localStorage.getItem('token')) {
            getNote();
            
            // Set up automatic reload every 1 second
            const interval = setInterval(async () => {
                setIsRefreshing(true);
                console.log(isRefreshing);
                await getNote();
                setIsRefreshing(false);
            }, 1000);
            
            return () => clearInterval(interval);
        } else {
            navigate("/login");
        }
    }, [getNote,navigate,isRefreshing]);

    useEffect(() => {
        // Auto-delete messages older than 24 hours
        const now = new Date();
        notes.forEach((note) => {
            let messageTime;
            try {
                messageTime = parseTimeString(note.title);
            } catch {
                return;
            }
            if (now - messageTime > 24* 60 * 60 * 1000) {
                deleteNote(note.id);
            }
        });
        // Removed scrollToBottom() to prevent auto-scroll during refresh
    }, [notes,deleteNote]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim().length < 1) {
            showAlert("Please enter a message", "warning");
            return;
        }
        
        // Use current timestamp as title and message as description
        const timestamp = new Date().toLocaleTimeString();
        addNote(timestamp, newMessage, "chat");
        setNewMessage("");
        showAlert("Message sent", "success");
        
        // Scroll to bottom when sending a message
        setTimeout(() => {
            scrollToBottom();
        }, 100);
        
        // Focus back to the message input after sending
        setTimeout(() => {
            messageInputRef.current?.focus();
        }, 100);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
        setIsTyping(e.target.value.length > 0);
    };

    // Only show messages not older than 24 hours
    const now = new Date();
    const filteredNotes = notes.filter(note => {
        let messageTime;
        try {
            messageTime = parseTimeString(note.title);
        } catch {
            return true;
        }
        return now - messageTime <= 24* 60 * 60 * 1000;
    });

    return (
        <>
            <div className="chat-container">
                {/* Chat Header */}
                <div className="chat-header">
                    <div className="avatar">
                        <img src="/media/dp.jpg" alt="Profile" />
                    </div>
                    <div>
                        <h6 className="mb-0">{localStorage.getItem('uname')}'s Chat</h6>
                        <small>{isTyping ? 'typing...' : 'Online'}</small>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="chat-messages">
                    {filteredNotes.length === 0 && (
                        <div className="text-center text-muted mt-4">
                            <i className="fas fa-comments fa-3x mb-3"></i>
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    )}
                    
                    {filteredNotes.map((note, index) => {
                        const isSent = true;
                        return (
                            <div key={note.id} className={`message ${isSent ? 'sent' : 'received'}`}>
                                <div className="message-bubble">
                                    <div className="message-content">
                                        {note.description}
                                    </div>
                                    <div className="message-time">
                                        {note.title}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="chat-input">
                    <form onSubmit={handleSendMessage}>
                        <div className="input-group">
                            <textarea
                                ref={messageInputRef}
                                className="message-input"
                                value={newMessage}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                rows="1"
                            />
                            <button 
                                type="button" 
                                className="scroll-button"
                                onClick={scrollToBottom}
                                title="Scroll to bottom"
                            >
                                <i className="fas fa-arrow-down"></i>
                            </button>
                            <button type="submit"  className="send-button">
                                <i className="fas fa-paper-plane"></i>

                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ChatInterface; 