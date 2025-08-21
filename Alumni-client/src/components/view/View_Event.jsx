import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '../../AuthContext';
import { baseUrl } from '../../utils/globalurl';

const ViewEvent = () => {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [eventData, setEventData] = useState(null);
    const [participated, setParticipated] = useState(false);

    useEffect(() => {
        if (location.state?.data) {
            setEventData(location.state.data);
        } else {
            // Fallback: Fetch event data if not passed through state
            const eventId = new URLSearchParams(location.search).get("id");
            if (eventId) {
                axios.get(`${baseUrl}auth/events/${eventId}`)
                    .then((res) => setEventData(res.data))
                    .catch((err) => console.error("Error fetching event:", err));
            }
        }
    }, [location.state]);

    useEffect(() => {
        if (eventData) {
            const userId = localStorage.getItem("user_id");
            const requestData = { event_id: eventData.id, user_id: userId };

            axios.post(`${baseUrl}auth/eventcommits/check`, requestData)
                .then((res) => setParticipated(res.data.eventCommit))
                .catch((err) => console.error("Error checking participation:", err));
        }
    }, [eventData]);

    const handleParticipation = async () => {
        if (!eventData) return;
        const userId = localStorage.getItem("user_id");
        const requestData = { event_id: eventData.id, user_id: userId };

        try {
            await axios.post(`${baseUrl}auth/events/participate`, requestData);
            setParticipated(true);
            toast.success("Successfully participated in the event!");
        } catch (error) {
            console.error("Error participating in event:", error);
            toast.error("An error occurred while trying to participate.");
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });
    };

    return (
        <>
            <ToastContainer position="top-center" />
            <header className="masthead">
                <div className="container-fluid h-100">
                    <div className="row h-100 align-items-center justify-content-center text-center">
                        <div className="col-lg-8 align-self-end mb-4 page-title">
                            <h3 className="text-white">{eventData ? eventData.title : "Loading Event..."}</h3>
                            <hr className="divider my-4" />
                            {eventData && (
                                <div className="row col-md-12 mb-2 justify-content-center">
                                    <span className="badge badge-primary px-3 pt-1 pb-1">
                                        <b><i>Event scheduled on: {formatDate(eventData.schedule)}</i></b>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mt-3 pt-2">
                {eventData ? (
                    <div className="card mb-4">
                        <div className="card-body">
                            <div dangerouslySetInnerHTML={{ __html: eventData.content }} className="card-body" />
                            <hr className="divider" />
                            <div className="text-center">
                                {isLoggedIn ? (
                                    participated ? (
                                        <span className="badge badge-primary d-none">Committed to Participate</span>
                                    ) : (
                                        <button className="btn btn-primary d-none" onClick={handleParticipation}>Participate</button>
                                    )
                                ) : (
                                    <div>
                                        <span className="text-danger">Please Login to post the event</span>
                                        <br />
                                        <button className="btn btn-primary mt-2" onClick={() => navigate("/login")}>Login</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-muted">Loading event details...</p>
                )}
            </div>
        </>
    );
};

export default ViewEvent;