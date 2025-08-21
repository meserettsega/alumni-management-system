import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { baseUrl } from '../../utils/globalurl';

const ManageMessage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [message, setMessage] = useState({
        id: '',
        sender: '',
        receiver: '',
        subject: '',
        body: ''
    });

    useEffect(() => {
        if (location.state && location.state.status === 'edit') {
            setMessage(location.state.data);
        }
    }, [location.state]);

    const handleChange = (e) => {
        setMessage({ ...message, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.put(`${baseUrl}messages/manage`, message)
            .then((res) => toast.success(res.data.message))
            .catch((err) => console.log(err));
    };

    return (
        <>
            <ToastContainer position="top-center" />
            <div className="container-fluid">
                <form onSubmit={handleSubmit} id="manage-message">
                    <div className="form-group">
                        <label htmlFor="sender">Sender</label>
                        <input type="text" name="sender" id="sender" className="form-control" value={message.sender} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="receiver">Receiver</label>
                        <input type="text" name="receiver" id="receiver" className="form-control" value={message.receiver} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="subject">Subject</label>
                        <input type="text" name="subject" id="subject" className="form-control" value={message.subject} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="body">Message</label>
                        <textarea name="body" id="body" className="form-control" value={message.body} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="btn btn-primary">Submit</button>
                    <button type="button" className="btn btn-outline-danger float-end" onClick={() => navigate("/dashboard/messages")}>Back</button>
                </form>
            </div>
        </>
    );
};

export default ManageMessage;
