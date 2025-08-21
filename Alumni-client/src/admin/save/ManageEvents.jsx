import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import { baseUrl } from '../../utils/globalurl';
import { useAuth } from '../../AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const ManageEvents = ({ event, onComplete }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        schedule: '',
        content: '',
        location: '',
        host: ''
    });

    // Pre-fill form when editing
    useEffect(() => {
        if (event) {
            setFormData({
                id: event.id,
                title: event.title || '',
                schedule: event.schedule || '',
                content: event.content || '',
                location: event.location || '',
                host: event.host || ''
            });
        } else {
            setFormData({
                id: '',
                title: '',
                schedule: '',
                content: '',
                location: '',
                host: ''
            });
        }
    }, [event]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                // Edit mode
                await axios.put(`${baseUrl}auth/events`, { ...formData, createdBy: user?.id });
                toast.success('Event updated successfully');
            } else {
                // Create mode
                await axios.post(`${baseUrl}auth/events`, { ...formData, createdBy: user?.id });
                toast.success('Event created successfully');
            }
            if (onComplete) onComplete();
            setFormData({
                id: '',
                title: '',
                schedule: '',
                content: '',
                location: '',
                host: ''
            });
        } catch (error) {
            console.error('Error:', error);
            toast.error('An error occurred');
        }
    };

    const handleChange = (content) => {
        setFormData(prevState => ({
            ...prevState,
            content
        }));
    };

    return (
        <div className="container-fluid mt-5">
            <ToastContainer position="top-center" />
            <h2 className="mb-4">{formData.id ? 'Edit Event' : 'Create New Event'}</h2>
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
                <div className="row form-group">
                    <div className="col-md-8">
                        <label className="control-label">Schedule</label>
                        <input
                            type="datetime-local"
                            name="schedule"
                            className="form-control"
                            value={formData.schedule}
                            onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label className="control-label">Content</label>
                        <ReactQuill
                            value={formData.content}
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
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-8">
                        <label className="control-label">Host</label>
                        <input
                            type="text"
                            name="host"
                            className="form-control"
                            value={formData.host}
                            onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <div className="col-md-8 mt-3">
                    <button type="submit" className="btn btn-primary">Save</button>
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
    );
};

export default ManageEvents;