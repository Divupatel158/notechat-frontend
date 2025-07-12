import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import { Route, Routes } from 'react-router-dom';
import NoteState from './context/notes/NoteState';
import Login from './components/Login';
import Register from './components/Register';
import { useState } from 'react';
import Alert from './components/Alert'
function App() {
  const [alert, setAlert] = useState();
  const showAlert = (message, type) => {
    setAlert({ msg: message, type: type });
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  }
  return (
    <div className='Homepage'>
      <NoteState>
        <Navbar showAlert={showAlert} />
        <Alert alert={alert} />
        <div className="container-fluid p-0">
          <Routes>
            {localStorage.getItem('token') ? <Route path="/" element={<Home showAlert={showAlert} />} /> : <Route path="/" element={<Login showAlert={showAlert} />} />}
            <Route path="/login" element={<Login showAlert={showAlert} />} />
            <Route path="/register" element={<Register showAlert={showAlert} />} />
          </Routes>
        </div>
      </NoteState>
    </div>
  );
}
export default App;