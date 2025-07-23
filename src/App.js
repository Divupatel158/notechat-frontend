import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import { Route, Routes } from 'react-router-dom';
import NoteState from './context/notes/NoteState';
import Login from './components/Login';
import Register from './components/Register';
import { useState } from 'react';
import Alert from './components/Alert'
import ChatsList from './components/ChatsList';
import ChatPage from './components/ChatPage';
import ChatLayout from './components/ChatLayout';
import ResponsiveChatRoute from './components/ResponsiveChatRoute';
function App() {
  const [alert, setAlert] = useState();
  const showAlert = (message, type) => {
    setAlert({ msg: message, type: type });
    setTimeout(() => {
      setAlert(null);
    }, 2000);
  }
  return (
    <div className='Homepage'>
      <NoteState>
        <div style={{ position: 'sticky', top: 0, left: 0, width: '100%', zIndex: 1000, background: '#fff' }}>
        <Navbar showAlert={showAlert} />
      </div>
        <Alert alert={alert} />
        <div className="container-fluid p-0">
          <Routes>
            {localStorage.getItem('token') ? (
              <>
                <Route path="/" element={<Home showAlert={showAlert} />} />
                {/* <Route path="/chats/*" element={<ChatLayout />}> */}
                <Route path="/chats/*" element={<ResponsiveChatRoute />}>
                  <Route path=":email" element={null} />
                </Route>
              </>
            ) : (
              <Route path="/" element={<Login showAlert={showAlert} />} />
            )}
            <Route path="/login" element={<Login showAlert={showAlert} />} />
            <Route path="/register" element={<Register showAlert={showAlert} />} />
          </Routes>
        </div>
      </NoteState>
    </div>
  );
}
export default App;