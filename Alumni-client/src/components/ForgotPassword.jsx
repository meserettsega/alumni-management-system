import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { baseUrl } from '../utils/globalurl';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Send the forgot password request to the backend
            const res = await axios.post(`${baseUrl}auth/forgot-password`, { email });
            toast.success(res.data.message || 'Password reset email sent successfully!');
            setEmail(''); // Clear the email field after success
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to send password reset email.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container  d-flex justify-content-center align-items-center" style={{ marginTop: '7rem' }}>
            <ToastContainer position="top-center" />
            <div className="card shadow-lg" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="card-header bg-primary text-white text-center">
                    <h4>Forgot Password</h4>
                </div>
                <div className="card-body">
                    <p className="text-muted text-center">
                        Enter your email address below and we'll send you a link to reset your password.
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-control form-control-lg"
                                id="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="d-grid">
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Sending...
                                    </span>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                <div className="card-footer text-center text-muted">
                    Remembered your password? <a href="/login" className="text-primary">Login</a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;