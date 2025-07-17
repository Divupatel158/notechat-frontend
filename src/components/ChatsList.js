import React, { useEffect, useState } from 'react';
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
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const myEmail = localStorage.getItem('email');
  const API_BASE = 'https://notechat-backend-production.up.railway.app';

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/chat/chats`, {
        headers: { 'auth-token': token }
      });
      const data = await res.json();
      setContacts(data.contacts || []);
      setLoading(false);
    };
    fetchContacts();
  }, [token]);

  useEffect(() => {
    // Fetch last message for each contact
    const fetchLastMessages = async () => {
      let lm = {};
      for (const contact of contacts) {
        const res = await fetch(`${API_BASE}/api/chat/messages/${encodeURIComponent(contact.email)}`, {
          headers: { 'auth-token': token }
        });
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          lm[contact.email] = data.messages[data.messages.length - 1];
        }
      }
      setLastMessages(lm);
    };
    if (contacts.length > 0) fetchLastMessages();
  }, [contacts, token]);

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

  if (loading) return <div>Loading contacts...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 0, position: 'relative' }}>
      {/* Fixed Navbar */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
        <Navbar />
      </div>
      {/* Main content below navbar */}
      <div style={{ marginTop: 56 }}>
        <h2 style={{ textAlign: 'center', padding: '20px 0', color: '#333', fontWeight: 700, letterSpacing: 1 }}>Your Chats</h2>
        <div style={{ padding: 0 }}>
          {contacts.length === 0 && <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>No chats yet. Start a conversation!</div>}
          {contacts.map(contact => {
            const lastMsg = lastMessages[contact.email];
            return (
              <div
                key={contact.email}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#fff',
                  borderRadius: 12,
                  margin: '12px 16px',
                  padding: '14px 18px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  border: '1px solid #ececec',
                  position: 'relative',
                  minHeight: 64
                }}
                onClick={() => navigate(`/chat/${encodeURIComponent(contact.email)}`)}
                onMouseOver={e => e.currentTarget.style.background = '#f0f4ff'}
                onMouseOut={e => e.currentTarget.style.background = '#fff'}
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
                  <div style={{ fontWeight: 600, fontSize: 18, color: '#222', marginBottom: 2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{contact.uname}</div>
                  <div style={{ color: '#888', fontSize: 14, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {lastMsg ? (lastMsg.content.length > 40 ? lastMsg.content.slice(0, 40) + '...' : lastMsg.content) : <span style={{ color: '#bbb' }}>No messages yet</span>}
                  </div>
                </div>
                {/* Last message time */}
                <div style={{ color: '#aaa', fontSize: 12, marginLeft: 10, minWidth: 70, textAlign: 'right' }}>
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
                      <span style={{ fontWeight: 500, fontSize: 16 }}>{user.uname}</span>
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