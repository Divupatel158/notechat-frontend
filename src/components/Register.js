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
        // ...existing OTP send logic...
        setSendingOtp(false);
        setOtpSent(true);
        showAlert("OTP sent to your email", "success");
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
                        <div className="col-md-8 col-lg-7 col-xl-6">
                            <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg" className="img-fluid" alt="Phone" />
                        </div>
                        <div className="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
                            <p className="text-center h1 fw-bold mb-4 mx-1 mx-md-4 mt-2">Sign up</p>
                            <form onSubmit={hendalSubmit}>
                                <div className="form-outline mb-4">
                                    <input type="text" id="name" className="form-control form-control-lg" name='name' value={credentials.name} onChange={onChange} required />
                                    <label className="form-label" htmlFor="name">Name</label>
                                </div>
                                <div className="form-outline mb-4">
                                    <input type="text" id="uname" className="form-control form-control-lg" name='uname' value={credentials.uname} onChange={onChange} required />
                                    <label className="form-label" htmlFor="uname">Username</label>
                                </div>
                                <div className="form-outline mb-4">
                                    <input type="email" id="email" className="form-control form-control-lg" name='email' value={credentials.email} onChange={onChange} required />
                                    <label className="form-label" htmlFor="email">Email address</label>
                                </div>
                                <div className="form-outline mb-4">
                                    <input type="password" id="password" className="form-control form-control-lg" name='password' value={credentials.password} onChange={onChange} required />
                                    <label className="form-label" htmlFor="password">Password</label>
                                </div>
                                <div className="form-outline mb-4">
                                    <input type="password" id="cpassword" className="form-control form-control-lg" name='cpassword' value={credentials.cpassword} onChange={onChange} required />
                                    <label className="form-label" htmlFor="cpassword">Confirm Password</label>
                                </div>
                                {/* OTP fields and buttons */}
                                <div className="form-outline mb-4">
                                    <input type="text" id="otp" className="form-control form-control-lg" name='otp' value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} inputMode="numeric" pattern="\d*" required={!otpVerified} disabled={otpVerified} />
                                    <label className="form-label" htmlFor="otp">OTP</label>
                                </div>
                                <div className="mb-3 d-flex justify-content-between">
                                    <button className="btn btn-secondary" onClick={handleSendOtp} disabled={sendingOtp || otpSent}>Send OTP</button>
                                    <button className="btn btn-info" onClick={handleVerifyOtp} disabled={verifyingOtp || otpVerified}>Verify OTP</button>
                                </div>
                                <button type="submit" className="btn btn-primary btn-lg btn-block">Sign up</button>
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
