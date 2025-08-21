import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { baseUrl } from '../utils/globalurl';
import 'react-toastify/dist/ReactToastify.css';
// Removed duplicate imports
  

const ResetPassword = () => {
    const { token } = useParams(); // Get the token from the URL
    console.log(`TOKEN: ${token}`); // ✅ use backticks for interpolation

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            // Send the reset password request to the backend
            const res = await axios.post(`${baseUrl}auth/reset-password`, {
                token,
                newPassword: password,
            });
            toast.success(res.data.message || 'Password reset successfully!');
            navigate('/login'); // Redirect to the login page after success
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ marginTop: '10rem' }}>
            <ToastContainer position="top-center" />
            <div className="card shadow-lg border-0" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="card-header bg-gradient-primary text-white text-center py-4">
                    <h4 className="mb-0">Reset Your Password</h4>
                </div>
                <div className="card-body p-4">
                    <p className="text-muted text-center mb-4">
                        Enter your new password below to reset your account password.
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-floating mb-3">
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                placeholder="Enter your new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <label htmlFor="password">New Password</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input
                                type="password"
                                className="form-control"
                                id="confirmPassword"
                                placeholder="Confirm your new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <label htmlFor="confirmPassword">Confirm Password</label>
                        </div>
                        <div className="d-grid">
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg shadow-sm"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Resetting...
                                    </span>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                <div className="card-footer bg-light text-center py-3">
                    <p className="mb-0">
                        Remembered your password?{' '}
                        <a href="/login" className="text-primary fw-bold">
                            Login
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;