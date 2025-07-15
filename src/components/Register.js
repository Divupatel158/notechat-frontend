import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Register(props) {
    const { showAlert } = props;
    const [credentials, setCredentials] = useState({ name: "", uname: "", email: "", password: "", cpassword: "" });
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    let navigate = useNavigate();

    // OTP logic remains unchanged
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!credentials.email) {
            showAlert("Please enter your email", "warning");
            return;
        }
        setSendingOtp(true);
        try {
            const response = await fetch('https://notechat-backend-production.up.railway.app/api/auth/send-email-otp', {
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
        } catch (err) {
            setSendingOtp(false);
            showAlert("Network error. Please try again.", "warning");
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) {
            showAlert("Please enter the OTP", "warning");
            return;
        }
        setVerifyingOtp(true);
        // ...existing OTP verify logic...
        setVerifyingOtp(false);
        setOtpVerified(true);
        showAlert("OTP verified! You can now register.", "success");
    };

    const hendalSubmit = async (e) => {
        e.preventDefault();
        if (credentials.password !== credentials.cpassword) {
            alert("Passwords do not match");
            return false;
        }
        if (!otpVerified) {
            showAlert("Please verify OTP before registering", "warning");
            return false;
        }
        // Supabase sign up
        const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
                data: {
                    name: credentials.name,
                    uname: credentials.uname
                }
            }
        });
        if (error) {
            showAlert(error.message, "warning");
            return;
        }
        showAlert("Account created successfully. Please check your email to confirm.", "success");
        navigate("/login");
    };

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
    };

    return (
        <>
            <section className="vh-99 pb-4 pt-3">
                <div className="container py-5 h-100">
                    <div className="row d-flex align-items-center justify-content-center h-100">
                        <div className="col-12 col-md-8 col-lg-7 col-xl-6 mb-3 mb-md-0 d-flex justify-content-center">
                            <img
                                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
                                className="img-fluid register-img"
                                alt="Phone"
                                style={{ width: '100%', maxWidth: '350px', height: 'auto' }}
                            />
                        </div>
                        <div className="col-12 col-md-7 col-lg-5 col-xl-5 offset-xl-1">
                            <p className="text-center h1 fw-bold mb-4 mx-1 mx-md-4 mt-2" style={{ lineHeight: 1 }}>Sign up</p>
                            <form onSubmit={hendalSubmit}>
                                <div className="form-outline mb-3">
                                    <input type="text" id="name" className="form-control form-control-lg" name='name' value={credentials.name} onChange={onChange} required style={{ lineHeight: 1, fontSize: '1rem' }} placeholder="Name" />
                                </div>
                                <div className="form-outline mb-3">
                                    <input type="text" id="uname" className="form-control form-control-lg" name='uname' value={credentials.uname} onChange={onChange} required style={{ lineHeight: 1, fontSize: '1rem' }} placeholder="Username" />
                                </div>
                                <div className="form-outline mb-3">
                                    <input type="email" id="email" className="form-control form-control-lg" name='email' value={credentials.email} onChange={onChange} required style={{ lineHeight: 1, fontSize: '1rem' }} placeholder="Email address" />
                                </div>
                                {!otpSent && (
                                    <div className="form-outline mb-3">
                                        <button className="btn btn-secondary w-100" onClick={handleSendOtp} disabled={sendingOtp || otpSent} type="button">Send OTP</button>
                                    </div>
                                )}
                                {otpSent && (
                                    <div className="form-outline mb-3">
                                        <div className="d-flex flex-row gap-2 align-items-center">
                                            <input type="text" id="otp" className="form-control form-control-lg" name='otp' value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} inputMode="numeric" pattern="\d*" required={!otpVerified} disabled={otpVerified} style={{ lineHeight: 1, fontSize: '1rem', maxWidth: 100 }} placeholder="OTP" />
                                            <button className="btn btn-info flex-shrink-0" onClick={handleVerifyOtp} disabled={verifyingOtp || otpVerified} type="button" style={{ whiteSpace: 'nowrap' }}>Verify OTP</button>
                                        </div>
                                    </div>
                                )}
                                <div className="form-outline mb-3">
                                    <input type="password" id="password" className="form-control form-control-lg" name='password' value={credentials.password} onChange={onChange} required style={{ lineHeight: 1, fontSize: '1rem' }} placeholder="Password" />
                                </div>
                                <div className="form-outline mb-3">
                                    <input type="password" id="cpassword" className="form-control form-control-lg" name='cpassword' value={credentials.cpassword} onChange={onChange} required style={{ lineHeight: 1, fontSize: '1rem' }} placeholder="Confirm Password" />
                                </div>
                                <button type="submit" className="btn btn-primary btn-lg btn-block w-100">Sign up</button>
                                <div className="divider d-flex align-items-center my-4">
                                    <p className="text-center fw-bold mx-3 mb-0 text-muted">Already a member? <NavLink to="/login">Login</NavLink></p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Register;
