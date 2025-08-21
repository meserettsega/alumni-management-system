import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaMapMarker, FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ViewEvent from './view/View_Event';
import ManageEvents from '../admin/save/ManageEvents';
import { useAuth } from '../AuthContext';
import { baseUrl } from '../utils/globalurl';

const Event = () => {
    const { isLoggedIn, user, isAdmin } = useAuth();
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [handleAdd, setHandleAdd] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editEvent, setEditEvent] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${baseUrl}auth/events`)
            .then((res) => {
                setEvents(res.data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [handleAdd]);

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    useEffect(() => {
        const filtered = events.filter(event =>
            (event.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (event.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (event.location || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredEvents(filtered);
    }, [searchQuery, events]);

    const openModal = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedEvent(null);
        setIsModalOpen(false);
    };

    const handleViewEvent = (event) => {
        navigate("/events/view", { state: { data: event } });
    };

    // Edit: set editEvent and show ManageEvents
    const handleEditEvent = (event) => {
        setEditEvent(event);
        setHandleAdd(true);
    };

    // Delete: use e.id, not e._id
    const handleDeleteEvent = (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            axios.delete(`${baseUrl}auth/events/${eventId}`)
                .then(() => {
                    setEvents(events.filter(e => e.id !== eventId)); // FIX: use id
                })
                .catch(err => alert('Delete failed'));
        }
    };

    // After editing, reset editEvent and refresh events
    const handleEditComplete = () => {
        setEditEvent(null);
        setHandleAdd(false);
        axios.get(`${baseUrl}auth/events`)
            .then((res) => setEvents(res.data));
    };

    return (
        <>
            <header className="masthead">
                <div className="container-fluid h-100">
                    <div className="row h-100 align-items-center justify-content-center text-center">
                        <div className="col-lg-8 align-self-end mb-4 page-title">
                            <h3 className="text-white">Event List</h3>
                            <hr className="divider my-4" />
                            <div className="row col-md-12 mb-2 justify-content-center">
                                {isLoggedIn ? (
                                    !handleAdd && (
                                        <button onClick={() => { setHandleAdd(true); setEditEvent(null); }} className="btn btn-primary btn-block col-sm-4">
                                            <FaPlus /> Create New Event
                                        </button>
                                    )
                                ) : (
                                    <p className='text-white'>Please Login to create events.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Event Creation/Edit Form */}
            {handleAdd ? (
                <div className="container mt-5 pt-2">
                    <div className="col-lg-12">
                        <div className="card mb-4">
                            <div className="card-body">
                                <div className="row justify-content-center">
                                    <ManageEvents event={editEvent} onComplete={handleEditComplete} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="container mt-3 pt-2">
                    {/* Search Bar */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-8">
                                    <div className="input-group mb-3">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text"><FaSearch /></span>
                                        </div>
                                        <input
                                            value={searchQuery}
                                            onChange={handleSearchInputChange}
                                            type="text"
                                            className="form-control"
                                            placeholder="Search events..."
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <button className="btn btn-primary btn-block btn-sm">Search</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Event List */}
                    {isLoading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        filteredEvents.length > 0 ? (
                            filteredEvents.map((event, index) => {
                                const createdAt = event.created_at ? new Date(event.created_at) : new Date();
                                const now = new Date();
                                const diffMinutes = event.created_at ? (now - createdAt) / (1000 * 60) : NaN;

                                const isOwner = user?.id && event.createdBy && String(event.createdBy) === String(user.id);
                                const canEdit = isAdmin || (isOwner && diffMinutes <= 5);

                                return (
                                    <div className="card event-list" key={event.id || index}>
                                        <div className="card-body">
                                            <div className="text-center">
                                                <h3><b className="filter-txt">{event.title}</b></h3>
                                                <div>
                                                    <span className="filter-txt"><small><b><FaCalendarAlt /> {event.schedule}</b></small></span>
                                                    <span className="filter-txt"><small><b><FaMapMarker /> {event.location}</b></small></span>
                                                </div>
                                                <hr />
                                                <p dangerouslySetInnerHTML={{ __html: event.content }} className="truncate filter-txt"></p>
                                                <hr className="divider" style={{ maxWidth: "80%" }} />
                                                <div className='event-btn d-flex justify-content-between align-items-center'>
                                                    <span className="badge badge-info">
                                                        <b><i>Created by: {event.host}</i></b>
                                                    </span>
                                                    <div>
                                                        <button className="btn btn-sm btn-primary mr-2" onClick={() => handleViewEvent(event)}>Read More</button>
                                                        {canEdit && (
                                                            <>
                                                                <button className="btn btn-sm btn-warning mr-2" onClick={() => handleEditEvent(event)}>
                                                                    <FaEdit /> Edit
                                                                </button>
                                                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteEvent(event.id)}>
                                                                    <FaTrash /> Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Show info if alumni can't edit/delete anymore */}
                                              {!isAdmin && isOwner && diffMinutes > 5 && (
                                             <div className="alert alert-info mt-2" role="alert">
                                              <small>
                                          Editing and deleting is only allowed within 5 minutes of event creation. For further changes, please contact the administrator.
                                         </small>
                                         </div>
                          )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="d-flex flex-column justify-content-center align-items-center">
                                <p>{searchQuery}</p>
                                <h4 className='text-info-emphasis'>No Events Available</h4>
                            </div>
                        )
                    )}
                    <br />
                </div>
            )}

            {/* Event Details Modal */}
            {isModalOpen && selectedEvent && (
                <ViewEvent event={selectedEvent} closeModal={closeModal} />
            )}
        </>
    );
};

export default Event;