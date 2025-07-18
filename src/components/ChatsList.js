import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const avatarColors = [
  '#6C63FF', '#FF6584', '#43E97B', '#F9D423', '#FFB347', '#36D1C4', '#FF6B6B', '#FFD166', '#06D6A0', '#118AB2'
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function ChatsList(props) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastMessages, setLastMessages] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [unreadChats, setUnreadChats] = useState([]); // Track unread chats
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const myEmail = localStorage.getItem('email');
  const API_BASE = 'https://notechat-backend-production.up.railway.app';
  const socketRef = useRef(null);

  // Set body background to black for full-page effect
  useEffect(() => {
    const originalBg = document.body.style.background;
    const originalColor = document.body.style.color;
    document.body.style.background = '#111';
    document.body.style.color = '#bbb';
    return () => {
      document.body.style.background = originalBg;
      document.body.style.color = originalColor;
    };
  }, []);

  // Helper to sort contacts by last message time
  const sortContacts = (contactsArr, lastMsgs) => {
    return [...contactsArr].sort((a, b) => {
      const aTime = lastMsgs[a.email]?.created_at || 0;
      const bTime = lastMsgs[b.email]?.created_at || 0;
      return new Date(bTime) - new Date(aTime);
    });
  };

  // Fetch contacts and last messages (combined for polling)
  const fetchContactsAndMessages = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/chat/chats`, {
      headers: { 'auth-token': token }
    });
    const data = await res.json();
    let contactsData = data.contacts || [];
    // Fetch last messages
    let lm = {};
    let newUnread = [];
    for (const contact of contactsData) {
      const resMsg = await fetch(`${API_BASE}/api/chat/messages/${encodeURIComponent(contact.email)}`, {
        headers: { 'auth-token': token }
      });
      const dataMsg = await resMsg.json();
      if (dataMsg.messages && dataMsg.messages.length > 0) {
        const lastMsg = dataMsg.messages[dataMsg.messages.length - 1];
        lm[contact.email] = lastMsg;
        // If the last message is not from me, mark as unread
        if (lastMsg.sender !== myEmail) {
          newUnread.push(contact.email);
        }
      }
    }
    // Sort contacts by last message time
    contactsData = sortContacts(contactsData, lm);
    setContacts(contactsData);
    setLastMessages(lm);
    setUnreadChats(newUnread);
    setLoading(false);
    // Cache in sessionStorage
    sessionStorage.setItem('chat_contacts', JSON.stringify(contactsData));
    sessionStorage.setItem('chat_lastMessages', JSON.stringify(lm));
  };

  // On mount, load from sessionStorage if available
  useEffect(() => {
    const cachedContacts = sessionStorage.getItem('chat_contacts');
    const cachedLastMessages = sessionStorage.getItem('chat_lastMessages');
    if (cachedContacts && cachedLastMessages) {
      setContacts(JSON.parse(cachedContacts));
      setLastMessages(JSON.parse(cachedLastMessages));
      setLoading(false);
    } else {
      fetchContactsAndMessages();
    }
  }, [token, myEmail]);

  // WebSocket setup for real-time chat list updates
  useEffect(() => {
    // Connect to socket.io server
    const socket = io(API_BASE, { transports: ['websocket'] });
    socketRef.current = socket;
    // Join room for this user
    if (myEmail) socket.emit('join', myEmail);
    // Listen for new message events
    socket.on('message:new', (msg) => {
      // Refresh chat list on any new message
      fetchContactsAndMessages();
    });
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, [token, myEmail]);

  // Mark chat as read when opened
  const handleChatClick = (email) => {
    // Mark the last message as read in localStorage
    const lastMsg = lastMessages[email];
    if (lastMsg && lastMsg.id) {
      localStorage.setItem(`chat_read_${email}`, lastMsg.id);
    }
    setUnreadChats((prev) => prev.filter(e => e !== email));
    navigate(`/chat/${encodeURIComponent(email)}`);
  };

  // Fetch all users for new chat modal
  const fetchAllUsers = async () => {
    const res = await fetch(`${API_BASE}/api/auth/getallusers`, {
      headers: { 'auth-token': token }
    });
    const data = await res.json();
    setAllUsers((data.users || []).filter(u => u.email !== myEmail));
  };

  const handleNewChatClick = async () => {
    await fetchAllUsers();
    setShowModal(true);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 0, position: 'relative', background: '#111', minHeight: '100vh', color: '#bbb' }}>
      {/* Fixed Navbar */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
        <Navbar />
      </div>
      {/* Main content below navbar */}
      <div style={{ marginTop: 56, background: '#111', minHeight: '100vh', color: '#fff' }}>
        <h2 style={{ textAlign: 'center', padding: '20px 0', color: '#bbb', fontWeight: 700, letterSpacing: 1 }}>Your Chats</h2>
        <div style={{ padding: 0 }}>
          {contacts.length === 0 && <div style={{ textAlign: 'center', color: '#bbb', padding: 40 }}>No chats yet. Start a conversation!</div>}
          {contacts.map((contact, idx) => {
            const lastMsg = lastMessages[contact.email];
            // Robust unread logic: compare last message ID to last read
            let isUnread = false;
            if (lastMsg && lastMsg.sender !== myEmail) {
              const lastReadId = localStorage.getItem(`chat_read_${contact.email}`);
              isUnread = lastMsg.id && lastMsg.id.toString() !== lastReadId;
            }
            return (
              <div
                key={contact.email}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#222',
                  borderRadius: 12,
                  margin: '12px 16px',
                  padding: '14px 18px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  border: '1px solid #222',
                  position: 'relative',
                  minHeight: 64
                }}
                onClick={() => handleChatClick(contact.email)}
                onMouseOver={e => e.currentTarget.style.background = '#333'}
                onMouseOut={e => e.currentTarget.style.background = '#222'}
              >
                {/* Avatar */}
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: getAvatarColor(contact.uname),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 22,
                  marginRight: 18,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
                }}>
                  {contact.uname ? contact.uname[0].toUpperCase() : '?'}
                </div>
                {/* Chat Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 18, color: '#bbb', marginBottom: 2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{contact.uname}</div>
                  <div style={{
                    color: isUnread ? '#fff' : '#bbb',
                    fontSize: isUnread ? 16 : 14,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    fontWeight: isUnread ? 700 : 400
                  }}>
                    {lastMsg ? (lastMsg.content.length > 40 ? lastMsg.content.slice(0, 40) + '...' : lastMsg.content) : <span style={{ color: '#666' }}>No messages yet</span>}
                  </div>
                </div>
                {/* Last message time */}
                <div style={{ color: '#bbb', fontSize: 12, marginLeft: 10, minWidth: 70, textAlign: 'right' }}>
                  {lastMsg && lastMsg.created_at ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            );
          })}
        </div>
        {/* Floating New Chat Button */}
        <button
          onClick={handleNewChatClick}
          style={{
            position: 'fixed',
            right: 40,
            bottom: 40,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: '#6C63FF',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 16px rgba(108,99,255,0.18)',
            fontSize: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer',
          }}
          title="New Chat"
        >
          <span style={{ fontWeight: 700, fontSize: 36, lineHeight: 1 }}>+</span>
        </button>
        {/* Modal Popup for All Users */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.25)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
            onClick={() => setShowModal(false)}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                minWidth: 320,
                maxWidth: 400,
                boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
                maxHeight: '70vh',
                overflowY: 'auto',
              }}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={{ marginBottom: 18, textAlign: 'center', color: '#6C63FF' }}>Start New Chat</h3>
              {allUsers.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center' }}>No other users found.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {allUsers.map(user => (
                    <li
                      key={user.email}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setShowModal(false);
                        navigate(`/chat/${encodeURIComponent(user.email)}`);
                      }}
                    >
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: getAvatarColor(user.uname),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 18,
                        marginRight: 14,
                      }}>
                        {user.uname ? user.uname[0].toUpperCase() : '?'}
                      </div>
                      <span style={{ fontWeight: 500, fontSize: 16, color: '#111' }}>{user.uname}</span>
                      <span style={{ color: '#aaa', fontSize: 13, marginLeft: 8 }}>{user.email}</span>
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={() => setShowModal(false)}
                style={{
                  marginTop: 18,
                  width: '100%',
                  padding: '10px 0',
                  borderRadius: 8,
                  border: 'none',
                  background: '#eee',
                  color: '#333',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 