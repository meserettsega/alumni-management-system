import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { baseUrl } from '../../utils/globalurl';

const ViewMessage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [message, setMessage] = useState({});

    useEffect(() => {
        if (location.state && location.state.status === 'view') {
            setMessage(location.state.data);
        }
    }, [location.state]);

    const handleDelete = () => {
        axios.delete(`${baseUrl}messages/${message.id}`)
            .then((res) => {
                toast.success("Message deleted successfully");
                navigate('/dashboard/messages');
            })
            .catch((err) => console.log(err));
    };

    return (
        <>
            <ToastContainer position="top-center" />
            <div className="container-field">
                <div className="col-lg-12">
                    <div className="row">
                        <div className="col-md-12">
                            <h4>From: <b>{message.sender}</b></h4>
                            <h5>To: <b>{message.receiver}</b></h5>
                            <p><strong>Subject:</strong> {message.subject}</p>
                            <p><strong>Message:</strong></p>
                            <p>{message.body}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-footer display">
                <div className="row">
                    <div className="col-lg-12">
                        <button onClick={() => navigate('/dashboard/messages')} className="btn float-right btn-secondary" type="button">Back</button>
                        <button onClick={handleDelete} className="btn float-right btn-danger mr-2" type="button">Delete Message</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewMessage;
