import { NavLink, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
function NavBar(props) {
  let location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('uname');
    window.location.reload();
  }
  const handleDelete = (e) => {
    e.preventDefault();
  
    const userId = localStorage.getItem('id');
    const token = localStorage.getItem('token');
  
    // Check if required values are present
    if (!userId || !token) {
      alert("Missing user ID or token. Please log in again.");
      return;
    }
  
    fetch(`http://localhost:5001/api/auth/deleteuser/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "auth-token": token 
      }
    })
      .then(response => response.json())
      .then((data) => {
          // Clean up localStorage and redirect or reload
          localStorage.removeItem('token');
          localStorage.removeItem('uname');
          localStorage.removeItem('id');
          window.location.href = "/login";
          props.showAlert("Account deleted successfully", "success");
      })
      .catch(error => {
        console.error("Delete user error:", error);
        alert("Internal error occurred while deleting the user.");
      });
  };
  useEffect(() => {
  }, [location]);
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <NavLink className="navbar-brand" to="/">NoteChat</NavLink>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse " id="navbarNav">
            {localStorage.getItem('token') ?(
                <ul className="navbar-nav ms-auto d-flex align-items-center">
                  <li className="nav-item">
                    <NavLink className={`btn btn-primary mx-2 my-2`} onClick={handleDelete} >Delete Account</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className={`btn btn-primary mx-2 my-2`} onClick={handleLogout} >Logout</NavLink>
                  </li>
                </ul>
                )
              : (
                <ul className="navbar-nav ms-auto">
                  <li className="nav-item">
                    <NavLink className="btn btn-primary mx-2" to="/register">Register</NavLink>
                  </li>
                </ul>
              )}
          </div>
        </div>
      </nav>
    </>);
}

export default NavBar;