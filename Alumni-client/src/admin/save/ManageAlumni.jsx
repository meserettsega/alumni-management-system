import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { baseUrl } from '../../utils/globalurl';

const ManageAlumni = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState({
    id: '',
    name: '',
    email: '',
    status: 1, // Default to "Verified"
  });

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // If editing an existing alumni, populate the data
    if (location.state && location.state.status === 'edit') {
      setAlumni(location.state.data);
    }
  }, [location.state]);

  const handleRestrict = () => {
    axios.patch(`${baseUrl}auth/alumni/restrict/${alumni.id}`)
      .then((res) => {
        toast.success(res.data.message);
        setAlumni({ ...alumni, status: 0 }); // Update status to "Not Verified"
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to restrict alumni.");
      });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleResetPassword = (e) => {
    e.preventDefault();

    // Validate that the passwords match
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    // Ensure the password is not empty
    if (!passwords.newPassword || !passwords.confirmPassword) {
      toast.error("Password fields cannot be empty.");
      return;
    }

    // Send the reset password request to the backend
    axios.post(`${baseUrl}auth/alumni/resetpassword`, {
      id: alumni.id,
      newPassword: passwords.newPassword,
    })
      .then((res) => {
        toast.success(res.data.message);
        setPasswords({ newPassword: '', confirmPassword: '' }); // Clear password fields
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to reset password.");
      });
  };

  return (
    <div className="container mt-4">
      <ToastContainer position="top-center" />
      <h3>Manage Alumni</h3>
      <div className="card">
        <div className="card-body">
          <p><strong>Name:</strong> {alumni.name}</p>
          <p><strong>Email:</strong> {alumni.email}</p>
          <p>
            <strong>Status:</strong> {alumni.status === 1 ? 'Verified' : 'Not Verified'}
          </p>
          <div className="mt-4">
            <button
              type="button"
              className="btn btn-danger me-2"
              onClick={handleRestrict}
            >
              Restrict Alumni
            </button>
          </div>
          <hr />
          <h5>Reset Password</h5>
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-warning">
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageAlumni;