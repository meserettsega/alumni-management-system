import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import defaultavatar from "../assets/uploads/defaultavatar.jpg";
import { baseUrl } from '../utils/globalurl';

const AdminAlumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const navigate = useNavigate();

  // Fetch alumni data
  useEffect(() => {
    axios.get(`${baseUrl}auth/alumni`)
      .then((res) => {
        setAlumni(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Restrict alumni
/// ...existing code...

// ...existing code...
const handleVerifyAlumni = (id) => {
  axios.patch(`${baseUrl}auth/alumni/verify/${id}`, { status: 1 })
    .then((res) => {
      toast.success("Alumni verified successfully.");
      setAlumni(alumni.map((e) => e.id === id ? { ...e, status: 1 } : e));
    })
    .catch((err) => {
      toast.error("Failed to verify alumni.");
    });
};
// ...existing code...
// Toggle alumni activation (activate/deactivate)
const toggleAlumniActivation = (id, currentActive) => {
  const newActive = currentActive === 1 ? 0 : 1;
  axios.patch(`${baseUrl}auth/alumni/activation/${id}`, { isActive: newActive })
    .then((res) => {
      toast.success(res.data.message);
      setAlumni(alumni.map((e) => e.id === id ? { ...e, isActive: newActive } : e));
    })
    .catch((err) => {
      console.error(err);
      toast.error("Failed to update alumni activation status.");
    });
};
// ...existing code...

  // Handle password input changes
  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // Reset password
  const resetPassword = (id) => {
    if (!passwords.newPassword || !passwords.confirmPassword) {
      toast.error("Password fields cannot be empty.");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    axios.post(`${baseUrl}auth/alumni/resetpassword`, { id, newPassword: passwords.newPassword })
      .then((res) => {
        toast.success(res.data.message);
        setPasswords({ newPassword: '', confirmPassword: '' }); // Clear password fields
        setSelectedAlumni(null); // Close the reset password modal
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to reset password.");
      });
  };

  return (
    <>
      <ToastContainer position="top-center" />

      <div className="container-fluid">
        <div className="col-lg-12">
          <div className="row mb-4 mt-4">
            <div className="col-md-12">
              <h3>Admin Alumni Management</h3>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 col-sm-8">
              <div className="card">
                <div className="card-header">
                  <b>List of Alumni ({alumni.length})</b>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead>
                        <tr>
                          <th className="text-center">#</th>
                          <th>Avatar</th>
                          <th>Name</th>
                          <th>Department</th>
                          <th>Status</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alumni.length > 0 ? (
                          alumni.map((a, index) => (
                            <tr key={index}>
                              <td className="text-center">{index + 1}</td>
                              <td className="text-center">
                                <div className="avatar">
                                  <img
                                    src={a.avatar && a.avatar.trim() !== "" ? `${baseUrl}${a.avatar}` : defaultavatar}
                                    className="gimg"
                                    alt="avatar"
                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultavatar; }}
                                  />
                                </div>
                              </td>
                              <td>
                                <p><b>{a.name}</b></p>
                              </td>
                              <td>
                                <p><b>{a.course}</b></p>
                              </td>
                              <td className="text-center">
                                {a.status === 1 ? (
                                  <span className="badge badge-primary">Verified</span>
                                ) : (
                                     <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleVerifyAlumni(a.id)}
                                     type="button"
                                       >
                                     Verify
                                    </button>
                                 )}
                              </td>
                              <td className="text-center">
                                <div className="d-flex justify-content-center">
                                  {/* View Button */}
                                  <button
                                    onClick={() => navigate("/dashboard/alumni/view", { state: { status: "view", data: a } })}
                                    className="btn btn-sm btn-outline-primary"
                                    type="button"
                                  >
                                    View
                                  </button>

                        {a.isActive === 1 ? (
      <button
        onClick={() => toggleAlumniActivation(a.id, a.isActive)}
        className="btn btn-sm btn-outline-danger ms-1"
        type="button"
      >
        Deactivate
      </button>
    ) : (
      <button
        onClick={() => toggleAlumniActivation(a.id, a.isActive)}
        className="btn btn-sm btn-outline-success ms-1"
        type="button"
      >
        Activate
      </button>
    )}
  </div>
</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center">No Alumni Available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {selectedAlumni && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reset Password for {selectedAlumni.name}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedAlumni(null)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => { e.preventDefault(); resetPassword(selectedAlumni.id); }}>
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
                  <button type="submit" className="btn btn-warning">Reset Password</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminAlumni;