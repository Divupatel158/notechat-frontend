import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { API_ENDPOINTS } from '../config';

function Register(props) {
    const { showAlert } = props;
    const [credentials, setCredentials] = useState({ name: "", uname: "", email: "", password: "", cpassword: "" });
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    let navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!credentials.email) {
            showAlert("Please enter your email", "warning");
            return;
        }
        setSendingOtp(true);
        const response = await fetch(API_ENDPOINTS.SEND_EMAIL_OTP, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: credentials.email })
        });
        const data = await response.json();
        setSendingOtp(false);
        if (data.success) {
            setOtpSent(true);
            showAlert("OTP sent to your email", "success");
        } else {
            showAlert(data.error || "Failed to send OTP", "warning");
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) {
            showAlert("Please enter the OTP", "warning");
            return;
        }
        setVerifyingOtp(true);
        const response = await fetch(API_ENDPOINTS.VERIFY_EMAIL_OTP, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: credentials.email, otp })
        });
        const data = await response.json();
        setVerifyingOtp(false);
        if (data.success) {
            setOtpVerified(true);
            showAlert("OTP verified! You can now register.", "success");
        } else {
            showAlert(data.error || "OTP verification failed", "warning");
        }
    };

    const hendalSubmit = async (e) => {
        if (credentials.password !== credentials.cpassword) {
            alert("Passwords do not match");
            e.preventDefault();
            return false;
        }
        if (!otpVerified) {
            showAlert("Please verify OTP before registering", "warning");
            e.preventDefault();
            return false;
        }
        e.preventDefault();
        const { name, uname, email, password } = credentials;
        const response = await fetch(API_ENDPOINTS.CREATE_USER, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, uname, email, password })
        });

        if (!response.ok) {
            console.error("Registration failed with status:", response.status);
            const errorData = await response.json();
            console.error("Error data:", errorData);
            showAlert(errorData.errors || errorData.error || `Registration failed (${response.status})`, "warning");
            return;
        }

        const data = await response.json();
        console.log("Registration response:", data);
        if (data.success) {
            navigate("/login");
            showAlert("account created successfully", "success");
        }
        else {
            console.error("Registration failed:", data);
            showAlert(data.errors || data.error || "please check your details", "warning");
        }
    }
    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
    }
    // Responsive styles for the registration card and image
    const cardStyle = {
        borderRadius: "25px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        background: "#fff",
        margin: "0 auto",
        maxWidth: 900,
        lineHeight: 1.1 // Decreased line height
    };
    const imgStyle = {
        width: "100%",
        maxWidth: 350,
        margin: "0 auto",
        display: "block",
        objectFit: "contain"
    };
    // Decreased line height for form controls and text
    const inputStyle = {
        lineHeight: 1.1
    };
    return (
        <>
            <section className="vh-99 pb-4" style={{ backgroundColor: "transparent" }}>
                <div className="container h-99">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-12">
                            <div className="card text-black" style={cardStyle}>
                                <div className="card-body">
                                    <div className="row justify-content-center align-items-center g-0 flex-wrap-reverse flex-md-nowrap">
                                        {/* Form and image stacked on mobile, side by side on md+ */}
                                        <div className="col-12 col-md-6 order-2 order-md-1 d-flex flex-column justify-content-center">
                                            <p className="text-center h1 fw-bold mb-3 mx-1 mx-md-4 mt-2" style={{lineHeight:1.1}}>Sign up</p>
                                            <form className="mx-1 mx-md-4" onSubmit={hendalSubmit}>
                                                <div className="d-flex flex-row align-items-center mb-3" style={{lineHeight:1.1}}>
                                                    <i className="fas fa-user fa-lg me-3 fa-fw"></i>
                                                    <div data-mdb-input-init className="form-outline flex-fill mb-0">
                                                        <input type="text" id="name" className="form-control" name='name' placeholder='Enter your name' value={credentials.name} onChange={onChange} required style={inputStyle} />
                                                    </div>
                                                </div>
                                                <div className="d-flex flex-row align-items-center mb-3" style={{lineHeight:1.1}}>
                                                    <i className="fas fa-user fa-lg me-3 fa-fw"></i>
                                                    <div data-mdb-input-init className="form-outline flex-fill mb-0">
                                                        <input type="text" id="uname" className="form-control" name='uname' placeholder='Enter your username' value={credentials.uname} onChange={onChange} required style={inputStyle} />
                                                    </div>
                                                </div>
                                                <div className="d-flex flex-row align-items-center mb-3" style={{lineHeight:1.1}}>
                                                    <i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
                                                    <div data-mdb-input-init className="form-outline flex-fill mb-0 d-flex align-items-center flex-wrap">
                                                        <input
                                                            type="email"
                                                            id="email"
                                                            className="form-control"
                                                            name='email'
                                                            placeholder='Enter your email'
                                                            value={credentials.email}
                                                            onChange={onChange}
                                                            required
                                                            style={{ ...inputStyle, maxWidth: '100%', minWidth: 0, flex: 1 }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-primary ms-2 mt-2 mt-md-0"
                                                            onClick={handleSendOtp}
                                                            disabled={sendingOtp || otpSent}
                                                            style={{ whiteSpace: "nowrap", lineHeight: 1.1 }}
                                                        >
                                                            {sendingOtp ? 'Sending...' : otpSent ? 'OTP Sent' : 'Send OTP'}
                                                        </button>
                                                    </div>
                                                </div>
                                                {otpSent && (
                                                    <div className="d-flex flex-row align-items-center mb-3" style={{lineHeight:1.1}}>
                                                        <i className="fas fa-key fa-lg me-3 fa-fw"></i>
                                                        <div data-mdb-input-init className="form-outline flex-fill mb-0 d-flex align-items-center flex-wrap">
                                                            <input
                                                                type="password"
                                                                id="otp"
                                                                className="form-control"
                                                                name='otp'
                                                                placeholder='Enter OTP'
                                                                value={otp}
                                                                onChange={e => setOtp(e.target.value)}
                                                                required
                                                                style={{ ...inputStyle, maxWidth: '100%', minWidth: 0, flex: 1 }}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-success ms-2 mt-2 mt-md-0"
                                                                onClick={handleVerifyOtp}
                                                                disabled={verifyingOtp || otpVerified}
                                                                style={{ whiteSpace: "nowrap", lineHeight: 1.1 }}
                                                            >
                                                                {verifyingOtp ? 'Verifying...' : otpVerified ? 'Verified' : 'Verify OTP'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="d-flex flex-row align-items-center mb-3" style={{lineHeight:1.1}}>
                                                    <i className="fas fa-lock fa-lg me-3 fa-fw"></i>
                                                    <div data-mdb-input-init className="form-outline flex-fill mb-0">
                                                        <input type="password" id="password" className="form-control" name='password' placeholder='Create your new password' value={credentials.password} onChange={onChange} required style={inputStyle} />
                                                    </div>
                                                </div>
                                                <div className="d-flex flex-row align-items-center mb-3" style={{lineHeight:1.1}}>
                                                    <i className="fas fa-key fa-lg me-3 fa-fw"></i>
                                                    <div data-mdb-input-init className="form-outline flex-fill mb-0">
                                                        <input type="password" id="cpassword" className="form-control" name='cpassword' placeholder='Confirm your password' value={credentials.cpassword} onChange={onChange} required style={inputStyle} />
                                                    </div>
                                                </div>
                                                <div className="form-check d-flex justify-content-center mb-4" style={{lineHeight:1.1}}>
                                                    you have already an account? <NavLink to="/login" className="ms-1">Login</NavLink>
                                                </div>
                                                <div className="d-flex justify-content-center mx-4 mb-2 mb-lg-3" style={{lineHeight:1.1}}>
                                                    <button type="submit" data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-lg w-100" disabled={!otpVerified} style={{lineHeight:1.1}}>Register</button>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="col-12 col-md-6 order-1 order-md-2 d-flex align-items-center justify-content-center mb-3 mb-md-0">
                                            <img
                                                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp"
                                                className="img-fluid"
                                                alt="Sample"
                                                style={imgStyle}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Register;
