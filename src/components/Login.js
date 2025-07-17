import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
// import { supabase } from '../supabaseClient';

function Login(props) {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    let navigate = useNavigate();
    const hendalSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('https://notechat-backend-production.up.railway.app/api/auth/login', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password
            })
        });
        const data = await response.json();
        if (!data.success) {
            props.showAlert(data.errors || "Please enter valid credentials", "warning");
            return;
        }
        // Store the JWT
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", credentials.email);
        localStorage.setItem("uname", data.uname);
        navigate("/");
        props.showAlert("Login Successful", "success");
    };
    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
    };
    return (
        <>
            <section className="vh-99 pb-4 pt-3">
                <div className="container py-5 h-100">
                    <div className="row d-flex align-items-center justify-content-center h-100">
                        <div className="col-md-8 col-lg-7 col-xl-6">
                            <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg" className="img-fluid" alt="Phone" />
                        </div>
                        <div className="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
                            <p className="text-center h1 fw-bold mb-4 mx-1 mx-md-4 mt-2">Sign in</p>
                            <form onSubmit={hendalSubmit}>
                                <div data-mdb-input-init className="form-outline mb-4">
                                    <input type="email" id="form1Example13" className="form-control form-control-lg" name='email' value={credentials.email} onChange={onChange} required />
                                    <label className="form-label" htmlFor="form1Example13">Email address</label>
                                </div>
                                <div data-mdb-input-init className="form-outline mb-4">
                                    <input type="password" id="form1Example23" className="form-control form-control-lg" name='password' value={credentials.password} onChange={onChange} required />
                                    <label className="form-label" htmlFor="form1Example23">Password</label>
                                </div>
                                <button type="submit" data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-lg btn-block">Sign in</button>
                                <div className="divider d-flex align-items-center my-4">
                                    <p className="text-center fw-bold mx-3 mb-0 text-muted">Not a member? <NavLink to="/register">Register</NavLink></p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Login;