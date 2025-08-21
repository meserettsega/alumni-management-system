import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import { baseUrl } from '../../utils/globalurl';
import { useAuth } from '../../AuthContext';

const ManageForum = ({ forum, onComplete, setHandleAdd }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (forum) {
      setFormData({
        id: forum.id,
        title: forum.title || '',
        description: forum.description || '',
      });
    } else {
      setFormData({
        id: '',
        title: '',
        description: '',
      });
    }
  }, [forum]);

  const handleBack = () => {
    if (setHandleAdd) setHandleAdd(false);
    else navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("User not authenticated. Please log in again.");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    setSubmitting(true);
    try {
      if (formData.id) {
        // Edit mode
        await axios.put(`${baseUrl}auth/manageforum`, { ...formData, user_id: user.id });
        toast.success('Forum updated successfully');
      } else {
        // Create mode
        await axios.post(`${baseUrl}auth/manageforum`, { ...formData, user_id: user.id });
        toast.success('Forum created successfully');
      }
      if (onComplete) onComplete();
      setFormData({
        id: '',
        title: '',
        description: '',
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (description) => {
    setFormData(prevState => ({
      ...prevState,
      description
    }));
  };

  return (
    <div className="container-fluid mt-4">
      <ToastContainer position="top-center" />
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="id" value={formData.id} className="form-control" />

        <div className="row form-group">
          <div className="col-md-8">
            <label className="control-label">Title</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="row form-group mt-3">
          <div className="col-md-12">
            <label className="control-label">Description</label>
            <ReactQuill
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="col-md-8 mt-4">
          <button type="submit" className="btn btn-primary me-2" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="btn btn-danger" onClick={handleBack} disabled={submitting}>Back</button>
        </div>
      </form>
    </div>
  );
};

export default ManageForum;