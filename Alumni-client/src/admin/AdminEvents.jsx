import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { baseUrl } from '../utils/globalurl';
import ManageEvents from './save/ManageEvents';

const AdminEvents = () => {
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${baseUrl}auth/events`)
            .then((res) => {
                setEvents(res.data);
            })
            .catch((err) => {
                console.error('Error fetching events:', err);
                toast.error('An error occurred while fetching events');
            });
    }, []);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const CutContent = (content, maxLength) => {
        const strippedContent = content.replace(/<[^>]+>/g, ''); // Remove HTML tags
        if (strippedContent.length > maxLength) {
            return strippedContent.substring(0, maxLength) + '...';
        }
        return strippedContent;
    };

    const handleView = (event) => {
        navigate("/events/view", { state: { action: "view", data: event } });
    };

    const delEvent = async (id) => {
        try {
            await axios.delete(`${baseUrl}auth/events/${id}`);
            setEvents(events.filter(event => event.id !== id));
            toast.success('Event deleted successfully');
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('An error occurred while deleting the event');
        }
    };

    return (
        <div className="container-fluid">
            <ToastContainer position="top-center" />
            <div className="col-lg-12">
                <div className="row mb-4 mt-4">
                    <div className="col-md-12"></div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header">
                                <b>List of Events</b>
                                <span className="float:right">
                                    <Link to="/dashboard/events/manage" className="btn btn-primary btn-block btn-sm col-sm-2 float-right" id="new_event">
                                        <FaPlus /> New Entry
                                    </Link>
                                </span>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-condensed table-bordered table-hover">
                                        <thead>
                                            <tr>
                                                <th className="text-center">#</th>
                                                <th className="">Schedule</th>
                                                <th className="">Title</th>
                                                <th className="">Description</th>
                                                <th className="">Location</th>
                                                <th className="">Host</th>
                                                <th className="text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {events.length > 0 ? (
                                                events.map((event, index) => (
                                                    <tr key={index}>
                                                        <td className="text-center">{index + 1}</td>
                                                        <td>{formatDate(event.schedule)}</td>
                                                        <td>{event.title}</td>
                                                        <td>{CutContent(event.content, 50)}</td>
                                                        <td>{event.location}</td>
                                                        <td>{event.host}</td>
                                                        <td className="text-center justify-content-center border-0 d-flex gap-1">
                                                            <button onClick={() => handleView(event)} className="btn btn-sm btn-outline-primary edit_career">View</button>
                                                            <Link to="/dashboard/events/manage" state={{ status: "edit", data: event }} className="btn btn-sm btn-outline-primary" type="button">Edit</Link>
                                                            <button onClick={() => delEvent(event.id)} className="btn btn-sm btn-outline-danger" type="button">Delete</button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="text-center">No Event Available</td>
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
    );
};

export default AdminEvents;