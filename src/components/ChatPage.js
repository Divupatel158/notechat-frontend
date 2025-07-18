import React, { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { io } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const API_BASE = 'https://notechat-backend-production.up.railway.app';

const ChatPage = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [contact, setContact] = useState(null);
  const [contactUname, setContactUname] = useState("");
  const [newMsg, setNewMsg] = useState('');
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');
  const myEmail = localStorage.getItem('email');
  const [deleting, setDeleting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  // Ref for chat container
  const chatContainerRef = useRef(null);
  // Ref to track first load for auto-scroll
  const firstLoadRef = useRef(true);

  // Helper to check if user is at (or near) the bottom
  function isAtBottom(ref, threshold = 100) {
    if (!ref.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = ref.current;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }

  // Fetch messages function
  const fetchMessages = useCallback(async () => {
    try {
    const res = await fetch(`${API_BASE}/api/chat/messages/${encodeURIComponent(email)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
      // console.log('Fetched messages:', data.messages);
    setMessages(data.messages || []);
      
    if (data.messages && data.messages.length > 0) {
      setContact(data.messages[0].sender.email === myEmail ? data.messages[0].receiver : data.messages[0].sender);
      setContactUname(data.messages[0].sender.email === myEmail ? data.messages[0].receiver.uname : data.messages[0].sender.uname);
    } else {
      // If no messages, fetch uname by email
        try {
          const userRes = await fetch(`${API_BASE}/api/auth/getallusers`);
          const userData = await userRes.json();
          const user = userData.users.find(u => u.email === email);
          setContactUname(user ? user.uname : email);
        } catch (error) {
          // console.error('Error fetching users:', error);
          setContactUname(email);
    }
      }
    } catch (error) {
      // console.error('Error fetching messages:', error);
    }
  }, [email, token, myEmail]);

  // Handle new message from socket
  const handleNewMessage = useCallback((msg) => {
    // console.log('Socket received message:', msg);
    lastUpdateRef.current = Date.now(); // Update last activity time
    
    // Check if message is for this chat
    const isForThisChat = (
      (msg.sender?.email === myEmail && msg.receiver?.email === email) ||
      (msg.sender?.email === email && msg.receiver?.email === myEmail)
    );
    
    // console.log('Is for this chat:', isForThisChat);
    
    if (isForThisChat) {
      // Stop typing indicator when message is received
      if (msg.sender?.email === email) {
        setIsTyping(false);
        setTypingUser('');
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
      setMessages(prevMessages => {
        // Remove any temporary message with same content from same sender
        const filteredMessages = prevMessages.filter(m => {
          const isTemp = typeof m.id === 'string' && m.id.startsWith('temp-');
          const sameSender = m.sender?.email === msg.sender?.email;
          const sameContent = m.content === msg.content;
          return !(isTemp && sameSender && sameContent);
        });
        // Only add the real message if it doesn't already exist
        const alreadyExists = filteredMessages.some(m => m.id === msg.id);
        if (alreadyExists) return filteredMessages;
        const newMessages = [...filteredMessages, msg];
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        return newMessages;
      });
    }
  }, [myEmail, email]);

  // Handle message read status
  const handleMessageRead = useCallback(({ messages }) => {
    // console.log('Messages marked as read:', messages);
    lastUpdateRef.current = Date.now(); // Update last activity time
    setMessages(prevMsgs =>
      prevMsgs.map(m => {
        const found = messages.find(msg => msg.id === m.id);
        return found ? { ...m, read_at: found.read_at } : m;
      })
    );
  }, []);

  // Dummy handler for typing event to fix no-undef error
  const handleTypingEvent = () => {};

  // WebSocket setup
  useEffect(() => {
    if (!myEmail || !email) return;

    // Initial fetch
    fetchMessages();

    // Setup socket connection
    const socket = io(API_BASE, {
      transports: ['websocket'],
      secure: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // console.log('Socket connected with ID:', socket.id);
      // Join rooms
      socket.emit('join', myEmail);
      socket.emit('join', email);
      // console.log('Joined rooms:', myEmail, email);
    });

    socket.on('disconnect', (reason) => {
      // console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      // console.error('Socket connection error:', error);
    });

    // Listen for new messages
    socket.on('message:new', handleNewMessage);

    // Listen for message read events
    socket.on('message:read', handleMessageRead);

    // Listen for typing events
    socket.on('typing', handleTypingEvent);

    // Listen for user online/offline status
    socket.on('user:status', (data) => {
      // console.log('User status update:', data);
      // You can update user status here if needed
    });

    // Cleanup
    return () => {
      // console.log('Cleaning up socket connection');
      socket.off('message:new', handleNewMessage);
      socket.off('message:read', handleMessageRead);
      socket.off('typing', handleTypingEvent);
      socket.off('user:status');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.disconnect();
    };
  }, [email, myEmail, fetchMessages, handleNewMessage, handleMessageRead, handleTypingEvent]);

  // Auto-refresh messages periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if we haven't received a socket message recently
      const timeSinceLastUpdate = Date.now() - lastUpdateRef.current;
      if (timeSinceLastUpdate > 10000) { // 10 seconds
        // console.log('Auto-refreshing messages...');
      fetchMessages();
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Handle typing indicators
  const handleTyping = useCallback(() => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing', { 
        to: email, 
        from: myEmail,
        typing: true 
      });
    }
  }, [email, myEmail]);

  const handleStopTyping = useCallback(() => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing', { 
        to: email, 
        from: myEmail,
        typing: false 
      });
    }
  }, [email, myEmail]);

  // Mark messages as read
  useEffect(() => {
    if (!myEmail || !email) return;
    
    const markAsRead = async () => {
      try {
        await fetch(`${API_BASE}/api/chat/messages/read/${email}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {
        // console.error('Error marking messages as read:', error);
      }
    };
    
    markAsRead();
  }, [email, myEmail, token]);

  // Reset firstLoadRef when chat user changes
  useEffect(() => {
    firstLoadRef.current = true;
  }, [email]);

  // Always scroll to bottom on first load, then only if user is at (or near) the bottom
  useLayoutEffect(() => {
    if (firstLoadRef.current) {
      // On first load, always scroll to bottom
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      }
      firstLoadRef.current = false;
    } else {
      // On subsequent updates, only scroll if user is at (or near) the bottom
      if (isAtBottom(chatContainerRef)) {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
      }
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    
    // Stop typing indicator
    handleStopTyping();
    
    const content = newMsg.trim();
    setNewMsg('');
    
    try {
      // Send to backend
      const response = await fetch(`${API_BASE}/api/chat/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
        body: JSON.stringify({ receiver_email: email, content })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      // Update last activity time
      lastUpdateRef.current = Date.now();
      // The real message will come through the socket
    } catch (error) {
      alert('Failed to send message. Please try again.');
    }
  };

  // Delete all chat messages handler
  const handleDeleteChat = async () => {
    if (!window.confirm('Are you sure you want to delete all messages in this chat? This cannot be undone.')) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/api/chat/messages/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete messages');
      }
      
      await fetchMessages();
    } catch (error) {
      // console.error('Error deleting chat:', error);
      alert('Failed to delete chat messages.');
    } finally {
      setDeleting(false);
    }
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
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
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
      <div style={{ position: 'sticky', top: 0, left: 0, width: '100vw', zIndex: 1000, background: '#fff' }}>
        <Navbar />
      </div>
      
      {/* Fixed Chat Header */}
      <div style={{
        position: 'sticky',
        top: 56, // height of navbar
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
        color: '#fff',
        boxSizing: 'border-box'
      }}>
        <button
          onClick={() => navigate('/chats')}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 28,
            cursor: 'pointer',
            marginRight: 16,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
          title="Back to Chats"
        >
          &#8592;
        </button>
        <div className="avatar" style={{ marginRight: 12 }}>
          <img src="/media/dp.jpg" alt="Profile" style={{ width: 50, height: 50, borderRadius: '50%' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{contactUname || email}</div>
          <small style={{ color: '#888' }}>
            {isTyping ? 'Typing...' : ''}
          </small>
        </div>
        <button
          onClick={handleDeleteChat}
          disabled={deleting}
          title="Delete all chat messages"
          style={{
            background: 'none',
            color: 'red',
            border: "2px solid red",
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
      
      {/* Remove spacer div for header, not needed with sticky */}
      
      {/* Messages Area */}
      <div
        className="chat-messages"
        ref={chatContainerRef}
        style={{
          border: '1px solid #ccc',
          flex: 1,
          overflowY: 'auto',
          padding: 10,
          background: '#93DA97',
          minHeight: 0,
          paddingTop: 8,
          width: '100vw',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          marginBottom: 0
        }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map((msg, index) => (
          <div
              key={`${msg.id}-${index}`}
            className={
                msg.sender?.email === myEmail
                ? 'd-flex justify-content-end mb-3'
                : 'd-flex justify-content-start mb-3'
            }
          >
            <div
              className={
                'chat-bubble ' +
                  (msg.sender?.email === myEmail
                  ? 'bg-primary text-white'
                  : 'bg-white') +
                ' p-3 rounded shadow-sm'
              }
                style={{ 
                  maxWidth: '70%', 
                  border: msg.sender?.email === myEmail ? 'none' : '1px solid #e9ecef', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  opacity: msg.isTemp ? 0.7 : 1
                }}
            >
                <span style={{ flex: 1, wordBreak: 'break-word' }}>
                  {msg.content}
                </span>
                <span style={{ 
                  fontSize: 12, 
                  marginLeft: 8, 
                  opacity: 0.7, 
                  whiteSpace: 'nowrap', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 4 
                }}>
                  {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : ''}
                  {msg.isTemp && (
                    <span style={{ fontSize: 10, color: '#999' }}>Sending...</span>
                  )}
                </span>
              </div>
            </div>
          ))
        )}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="d-flex justify-content-start mb-3">
            <div 
              className="chat-bubble bg-white p-3 rounded shadow-sm"
              style={{ 
                maxWidth: '70%', 
                border: '1px solid #e9ecef',
                animation: 'pulse 1.5s infinite'
              }}
            >
              <span style={{ color: '#999', fontStyle: 'italic' }}>
                {typingUser} is typing...
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <form onSubmit={sendMessage} style={{
        display: 'flex',
        padding: 8,
        width: '100vw',
        boxSizing: 'border-box',
        position: 'sticky',
        bottom: 0,
        background: '#fff',
        zIndex: 1002,
        margin: 0
      }}>
        <input
          type="text"
          value={newMsg}
          onChange={(e) => {
            setNewMsg(e.target.value);
            // Handle typing indicator
            if (e.target.value.trim()) {
              handleTyping();
              // Clear previous timeout
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              // Set timeout to stop typing
              typingTimeoutRef.current = setTimeout(() => {
                handleStopTyping();
              }, 1000);
            } else {
              handleStopTyping();
            }
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              sendMessage(e);
            }
          }}
          placeholder="Type your message..."
          style={{ 
            flex: 1, 
            padding: 8, 
            paddingLeft: '15px', 
            border: '1px solid gray', 
            borderTopLeftRadius: '50px', 
            borderBottomLeftRadius: '50px',
            outline: 'none'
          }}
          onFocus={() => {
            setTimeout(() => {
              document.activeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }}
          onBlur={() => {
            // Stop typing when input loses focus
            handleStopTyping();
          }}
        />
        <button 
          type="submit" 
          disabled={!newMsg.trim()}
          style={{ 
            padding: '8px 3vw', 
            border: '1px solid gray', 
            borderTopRightRadius: '50px', 
            borderBottomRightRadius: '50px',
            opacity: !newMsg.trim() ? 0.5 : 1,
            cursor: !newMsg.trim() ? 'not-allowed' : 'pointer',
            backgroundColor: !newMsg.trim() ? '#f5f5f5' : '#fff'
          }}
        >
          Send
        </button>
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