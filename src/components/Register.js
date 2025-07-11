import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
function Register(props) {
    const { showAlert } = props;
    const [credentials, setCredentials] = useState({ name: "", uname: "", email: "", password: "", cpassword: "" });
    let navigate = useNavigate();
    const hendalSubmit = async (e) => {
        if (credentials.password !== credentials.cpassword) {
            alert("Passwords do not match");
            e.preventDefault();
            return false;
        }
        e.preventDefault();
        const { name, uname, email, password } = credentials;
        const response = await fetch("http://localhost:5001/api/auth/createuser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: name, uname: uname, email: email, password: password })
        });
        const data = await response.json();
        console.log(data);
        if (data.success) {
            navigate("/login");
            showAlert("account created successfully", "success");
        }
        else {
            showAlert("please check your details", "warning");
        }
    }
    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
    }
    return (<>
        <section className="vh-99  pb-4 " style={{ backgroundColor: "transparent" }}>
            <div className="container h-99">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-lg-12 col-xl-11">
                        <div className="card text-black" style={{ borderRadius: "25px"}}>
                            <div className="card-body ">
                                <div className="row justify-content-center">
                                    <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
                                        <p className="text-center h1 fw-bold mb-4 mx-1 mx-md-4 mt-2">Sign up</p>
                                        <form className="mx-1 mx-md-4" onSubmit={hendalSubmit}>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-user fa-lg me-3 fa-fw"></i>
                                                <div data-mdb-input-init className="form-outline flex-fill mb-0">
                                                    <input type="text" id="name" className="form-control" name='name' placeholder='Enter your name' value={credentials.name} onChange={onChange} required />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-user fa-lg me-3 fa-fw"></i>
                                                <div data-mdb-input-init className="form-outline flex-fill mb-0">
                                                    <input type="text" id="uname" className="form-control" name='uname' placeholder='Enter your username' value={credentials.uname} onChange={onChange} required />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
                                                <div data-mdb-input-init className="form-outline flex-fill mb-0">
                                                    <input type="email" id="email" className="form-control" name='email' placeholder='Enter your email' value={credentials.email} onChange={onChange} required />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-lock fa-lg me-3 fa-fw"></i>
                                                <div data-mdb-input-init className="form-outline flex-fill mb-0">
                                                    <input type="password" id="password" className="form-control" name='password' placeholder='Create your new password' value={credentials.password} onChange={onChange} required />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-key fa-lg me-3 fa-fw"></i>
                                                <div data-mdb-input-init className="form-outline flex-fill mb-0">
                                                    <input type="password" id="cpassword" className="form-control" name='cpassword' placeholder='Confirm your password' value={credentials.cpassword} onChange={onChange} required />
                                                </div>
                                            </div>
                                            <div className="form-check d-flex justify-content-center mb-5">
                                                you have already an account? <NavLink to="/login">Login</NavLink>

                                            </div>
                                            <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                                                <button type="submit" data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-lg">Register</button>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                                        <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp" className="img-fluid" alt="Sample" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </>);
}

export default Register;