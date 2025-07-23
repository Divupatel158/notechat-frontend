import React, { useState } from 'react';
import ChatsList from './ChatsList';
import ChatPage from './ChatPage';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const ChatPlaceholder = () => (
  <div style={{
    top: 50,
    height: '80%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#bbb',
    fontSize: 24,
    background: '#222',
    borderRadius: 16,
    margin: 32,
    minHeight: 200
  }}>
    Select a chat to start messaging
  </div>
);

function useIsDesktop() {
  // Returns true if screen width >= 900px
  const [isDesktop, setIsDesktop] = React.useState(window.innerWidth >= 900);
  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isDesktop;
}

const ChatLayout = () => {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const { email } = useParams();
  const location = useLocation();
  // On mobile, redirect to separate pages
  React.useEffect(() => {
    if (!isDesktop) {
      if (email) {
        navigate(`/chats/${encodeURIComponent(email)}`, { replace: true });
      } else {
        navigate('/chats', { replace: true });
      }
    }
  }, [isDesktop, email, navigate]);

  if (!isDesktop) return null; // Don't render on mobile

  return (
    <div style={{
      display: 'flex',
      height: '90vh',
      background: '#111',
      overflow: 'hidden',
    }}>
      {/* Chat List */}
      <div style={{
        width: 350,
        minWidth: 300,
        maxWidth: 400,
        borderRight: '1px solid #222',
        background: '#181818',
        overflowY: 'auto',
        height: '90vh',
      }}>
        <ChatsList onSelectChat={email => navigate(`/chats/${encodeURIComponent(email)}`)} />
      </div>
      {/* Chat Page or Placeholder */}
      <div style={{ flex: 1, minWidth: 0, height: '100vh', overflow: 'auto' }}>
        {email ? <ChatPage /> : <ChatPlaceholder />}
      </div>
    </div>
  );
};

export default ChatLayout; 