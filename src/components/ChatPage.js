import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';

const API_BASE = 'https://notechat-backend-production.up.railway.app';

const ChatPage = () => {
  const { email } = useParams();
  const [messages, setMessages] = useState([]);
  const [contact, setContact] = useState(null);
  const [contactUname, setContactUname] = useState("");
  const [newMsg, setNewMsg] = useState('');
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');
  const myEmail = localStorage.getItem('email');
  const [deleting, setDeleting] = useState(false);

  // Fetch messages function
  const fetchMessages = async () => {
    const res = await fetch(`${API_BASE}/api/chat/messages/${encodeURIComponent(email)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setMessages(data.messages || []);
    if (data.messages && data.messages.length > 0) {
      setContact(data.messages[0].sender.email === myEmail ? data.messages[0].receiver : data.messages[0].sender);
      setContactUname(data.messages[0].sender.email === myEmail ? data.messages[0].receiver.uname : data.messages[0].sender.uname);
    } else {
      // If no messages, fetch uname by email
      fetch(`${API_BASE}/api/auth/getallusers`)
        .then(res => res.json())
        .then(data => {
          const user = data.users.find(u => u.email === email);
          setContactUname(user ? user.uname : email);
        });
    }
  };

  useEffect(() => {
    fetchMessages();
    // Set up polling every 1 second
    const interval = setInterval(() => {
      fetchMessages();
    }, 1000);
    return () => clearInterval(interval);
  }, [email, token, myEmail]);

  useEffect(() => {
    // Only scroll to bottom if a new message is added
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    await fetch(`${API_BASE}/api/chat/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ receiver_email: email, content: newMsg })
    });
    setNewMsg('');
    // Fetch messages again after sending
    fetchMessages();
  };

  // Delete all chat messages handler
  const handleDeleteChat = async () => {
    if (!window.confirm('Are you sure you want to delete all messages in this chat? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await fetch(`${API_BASE}/api/chat/messages/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchMessages();
    } catch (err) {
      alert('Failed to delete chat messages.');
    }
    setDeleting(false);
  };

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

  return (
    <div
      className="chat-page-container"
      style={{
        width: '100vw',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        boxSizing: 'border-box',
        position: 'relative',
        background: '#fff',
        overflowX: 'hidden'
      }}
    >
      <style>{chatStyles}</style>
      {/* Fixed Navbar */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', zIndex: 1000 }}>
        <Navbar />
      </div>
      {/* Fixed Chat Header (copied from ChatInterface) */}
      <div style={{
        position: 'fixed',
        top: 72, // below navbar
        left: 0,
        width: '100vw',
        height: 80,
        background: '#3E5F44',
        borderBottom: '1px solid #ccc',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        fontWeight: 'bold',
        fontSize: 18,
        color: '#fff'
      }}>
        <div className="avatar" style={{ marginRight: 12 }}>
          <img src="/media/dp.jpg" alt="Profile" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{contactUname ? contactUname : email}</div>
          <small style={{ color: '#888' }}>Online</small>
        </div>
        <button
          onClick={handleDeleteChat}
          disabled={deleting}
          title="Delete all chat messages"
          style={{
            background: 'none',
            color: 'red',
            border:"2px solid red",
            fontSize: 15,
            cursor: deleting ? 'not-allowed' : 'pointer',
            marginLeft: 8,
            padding: 8,
            borderRadius: 4,
            transition: 'background 0.2s',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            opacity: deleting ? 0.5 : 1
          }}
        >
          <i className="fas fa-trash-alt me-1"></i>
         Delete Chat
        </button>
      </div>
      <div style={{height: 150, backgroundColor:'#3E5F44'}}></div>
      {/* Messages Area */}
      <div
        className="chat-messages"
        style={{
          border: '1px solid #ccc',
          flex: 1,
          overflowY: 'auto',
          padding: 10,
          marginBottom: 10,
          background: '#93DA97',
          minHeight: 0,
          marginTop: 131, // 75 (navbar) + 56 (header)
          paddingTop: 8, // extra space for scroll-to-top
          width: '100vw',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        {messages.map(msg => (
          <div
            key={msg.id}
            className={
              msg.sender.email === myEmail
                ? 'd-flex justify-content-end mb-3'
                : 'd-flex justify-content-start mb-3'
            }
          >
            <div
              className={
                'chat-bubble ' +
                (msg.sender.email === myEmail
                  ? 'bg-primary text-white'
                  : 'bg-white') +
                ' p-3 rounded shadow-sm'
              }
              style={{ maxWidth: '70%', border: msg.sender.email === myEmail ? 'none' : '1px solid #e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <span style={{ flex: 1, wordBreak: 'break-word' }}>{msg.content}</span>
              <span style={{ fontSize: 12, marginLeft: 8, opacity: 0.7, whiteSpace: 'nowrap' }}>
                {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, padding: 8, width: '100vw', boxSizing: 'border-box'}}>
        <input
          type="text"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 8, paddingLeft:'15px', border:'1px solid gray', borderTopLeftRadius:'50px', borderBottomLeftRadius:'50px' }}
          onFocus={() => {
            setTimeout(() => {
              document.activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }}
        />
        <button type="submit" style={{ padding: '8px 3vw', border:'1px solid gray',borderTopRightRadius:'50px',borderBottomRightRadius:'50px' }}>Send</button>
      </form>
      <style>{`
        html, body, #root {
          width: 100vw !important;
          overflow-x: hidden !important;
        }
        .chat-page-container, .chat-messages {
          width: 100vw !important;
          max-width: 100vw !important;
          margin: 0 !important;
          overflow-x: hidden !important;
        }
      `}</style>
    </div>
  );
};

export default ChatPage; 