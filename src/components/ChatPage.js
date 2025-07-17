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
      {/* Fixed Navbar */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', zIndex: 1000 }}>
        <Navbar />
      </div>
      {/* Fixed Chat Header (copied from ChatInterface) */}
      <div style={{
        position: 'fixed',
        top: 75, // below navbar
        left: 0,
        width: '100vw',
        height: 56,
        background: '#f8f9fa',
        borderBottom: '1px solid #ccc',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        fontWeight: 'bold',
        fontSize: 18
      }}>
        <div className="avatar" style={{ marginRight: 12 }}>
          <img src="/media/dp.jpg" alt="Profile" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{contactUname ? contactUname : email}</div>
          <small style={{ color: '#888' }}>Online</small>
        </div>
      </div>
      {/* Messages Area */}
      <div
        className="chat-messages"
        style={{
          border: '1px solid #ccc',
          flex: 1,
          overflowY: 'auto',
          padding: 10,
          marginBottom: 10,
          background: '#fafafa',
          minHeight: 0,
          marginTop: 131, // 75 (navbar) + 56 (header)
          width: '100vw',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              textAlign: msg.sender.email === myEmail ? 'right' : 'left',
              margin: '8px 0'
            }}
          >
            <span
              style={{
                display: 'inline-block',
                background: msg.sender.email === myEmail ? '#dcf8c6' : '#fff',
                padding: '6px 12px',
                borderRadius: 12,
                maxWidth: '70%',
                wordBreak: 'break-word'
              }}
            >
              {msg.content}
              <br />
              <small>{msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}</small>
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, padding: 8, width: '100vw', boxSizing: 'border-box' }}>
        <input
          type="text"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 8 }}
          onFocus={() => {
            setTimeout(() => {
              document.activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Send</button>
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