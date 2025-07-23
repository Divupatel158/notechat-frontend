import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import ChatLayout from './ChatLayout';
import ChatList from './ChatsList';
import ChatPage from './ChatPage'; // This is your chat box view

const ResponsiveChatRoute = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop: render ChatLayout (which itself has routes)
  if (!isMobile) return <ChatLayout />;

  // Mobile: manage ChatList and ChatPage here
  return (
    <Routes>
      <Route path="/" element={<ChatList />} />
      <Route path=":email" element={<ChatPage />} />
    </Routes>
  );
};

export default ResponsiveChatRoute;
