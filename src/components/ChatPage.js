import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = 'https://notechat-backend-production.up.railway.app';

const ChatPage = () => {
  const { email } = useParams();
  const [messages, setMessages] = useState([]);
  const [contact, setContact] = useState(null);
  const [contactUname, setContactUname] = useState("");
  const [newMsg, setNewMsg] = useState('');
//   const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');
  const myEmail = localStorage.getItem('email');

  // Fetch messages function
  const fetchMessages = async () => {
    // setLoading(true);
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
    // setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    // No polling
  }, [email, token, myEmail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

//   if (loading) return <div>Loading chat...</div>;

  return (
    <div>
      <h2>{contactUname ? contactUname : email}</h2>
      <div style={{ border: '1px solid #ccc', height: 400, overflowY: 'auto', padding: 10, marginBottom: 10 }}>
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
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Send</button>
      </form>
    </div>
  );
};

export default ChatPage; 