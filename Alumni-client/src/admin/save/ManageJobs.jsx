import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bounce, ToastContainer, toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import { baseUrl } from '../../utils/globalurl';

const ManageJobs = ({ setHandleAdd }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const uid = localStorage.getItem("user_id");
  const isAdmin = useMemo(() => localStorage.getItem("user_type") === "admin", []);

  const toastId = useRef(null);

  const [formData, setFormData] = useState({
    id: '',
    company: '',
    job_title: '',
    location: '',
    description: '',
    user_id: uid,
    status: isAdmin ? 'no need approve' : 'pending',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.action === 'edit' && location.state.data) {
      setFormData({
        ...location.state.data,
        status: location.state.data.status || 'pending',
      });
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleChangeDesc = (description) => {
    setFormData(prev => ({ ...prev, description }));
  };

  const handleBack = () => {
   console.log("Current path:", location.pathname);
    if (location.pathname.startsWith("/dashboard")) {
      navigate("/dashboard/jobs");
    } else {
      setHandleAdd(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!toastId.current) {
      toastId.current = toast('📧 Sending job, please wait...', {
        position: "top-center",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "light",
        transition: Bounce,
      });
    }

    try {
      if (location.state?.action === 'edit') {
        const response = await axios.put(`${baseUrl}auth/managejob`, formData);
        toast.success(response.data.message || 'Job updated successfully');
      } else {
        const status = isAdmin ? 'no need approve' : 'pending';
        const response = await axios.post(`${baseUrl}auth/managejob`, {
          ...formData,
          user_id: uid,
          status,
        });

        toast.success(
          isAdmin
            ? "Job posted and does not need approval."
            : "Job submitted and pending admin approval."
        );
      }

      // Reset form
      setFormData({
        id: '',
        company: '',
        job_title: '',
        location: '',
        description: '',
        user_id: uid,
        status: isAdmin ? 'no need approve' : 'pending',
      });

    } catch (error) {
      console.error('Error submitting job:', error);
      toast.error('An error occurred while submitting the job.');
    } finally {
      setLoading(false);
      if (toastId.current) {
        toast.dismiss(toastId.current);
        toastId.current = null;
      }
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />
      <div className="container-fluid">
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id" value={formData.id} />

          <div className="row form-group">
            <div className="col-md-8">
              <label className="control-label">Company</label>
              <input
                type="text"
                name="company"
                className="form-control"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row form-group">
            <div className="col-md-8">
              <label className="control-label">Job Title</label>
              <input
                type="text"
                name="job_title"
                className="form-control"
                value={formData.job_title}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row form-group">
            <div className="col-md-8">
              <label className="control-label">Location</label>
              <input
                type="text"
                name="location"
                className="form-control"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row form-group">
            <div className="col-md-8">
              <label className="control-label">Description</label>
              <ReactQuill
                value={formData.description}
                onChange={handleChangeDesc}
                required
              />
            </div>
          </div>

          <div className="col-md-8 mt-3">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              className="btn btn-outline-danger float-end"
              onClick={handleBack}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ManageJobs;
