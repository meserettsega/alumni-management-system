import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaComments, FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import ManageForum from '../admin/save/ManageForum';
import { baseUrl } from '../utils/globalurl';

const Forum = () => {
    const { isLoggedIn, isAdmin, user } = useAuth();
    const [forum, setForum] = useState([]);
    const [filteredForum, setFilteredForum] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [handleAdd, setHandleAdd] = useState(false);
    const [editForum, setEditForum] = useState(null);

    useEffect(() => {
        axios.get(`${baseUrl}auth/forums`)
            .then((res) => {
                setForum(res.data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const handleView = (e) => {
        navigate("/forum/view", { state: { action: "view", data: e } });
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [handleAdd]);

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    useEffect(() => {
        const filteredTopics = forum.filter(topic =>
            (topic.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (topic.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredForum(filteredTopics);
    }, [searchQuery, forum]);

    const handleEditForum = (topic) => {
        setEditForum(topic);
        setHandleAdd(true);
    };

    const handleDeleteForum = (forumId) => {
        if (window.confirm('Are you sure you want to delete this topic?')) {
            axios.delete(`${baseUrl}auth/forum/${forumId}`)
                .then(() => {
                    setForum(forum.filter(f => f.id !== forumId));
                })
                .catch(() => alert('Delete failed'));
        }
    };

    const handleEditComplete = () => {
        setEditForum(null);
        setHandleAdd(false);
        axios.get(`${baseUrl}auth/forums`)
            .then((res) => setForum(res.data));
    };

    return (
        <>
            <header className="masthead">
                <div className="container-fluid h-100">
                    <div className="row h-100 align-items-center justify-content-center text-center">
                        <div className="col-lg-8 align-self-end mb-4 page-title">
                            <h3 className="text-white">Forum List</h3>
                            <hr className="divider my-4" />
                            <div className="row col-md-12 mb-2 justify-content-center">
                                {isLoggedIn ? (
                                    !handleAdd && (
                                        <button onClick={() => { setHandleAdd(true); setEditForum(null); }} className="btn btn-primary btn-block col-sm-4" type="button" id="new_career">
                                            <FaPlus /> Create New Topic
                                        </button>
                                    )
                                ) : (
                                    <p className='text-white'>Please Login to create new topic.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            {handleAdd ? (
                <div className="container mt-5 pt-2">
                    <div className="col-lg-12">
                        <div className="card mb-4">
                            <div className="card-body">
                                <div className="row justify-content-center">
                                    <ManageForum forum={editForum} onComplete={handleEditComplete} setHandleAdd={setHandleAdd} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="container mt-3 pt-2">
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-8">
                                    <div className="input-group mb-3">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text" id="filter-field"><FaSearch /></span>
                                        </div>
                                        <input value={searchQuery} onChange={handleSearchInputChange} type="text" className="form-control" id="filter" placeholder="Filter" aria-label="Filter" aria-describedby="filter-field" />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <button className="btn btn-primary btn-block btn-sm" id="search">Search</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        filteredForum.length > 0 ? (
                            filteredForum.map((e, index) => {
                                const createdAt = e.created_at ? new Date(e.created_at) : new Date();
                                const now = new Date();
                                let diffMinutes = 0;
                                if (createdAt && !isNaN(createdAt.getTime())) {
                              diffMinutes = (now - createdAt) / (1000 * 60);
                            } else {
                             diffMinutes = 0; // Treat as just created
                            }

                                const isOwner = user?.id && e.created_by && String(e.created_by) === String(user.id);
                                // REMOVE the 5-minute rule for debugging (or keep it if you want)
                                // const canEdit = isAdmin || (isOwner && diffMinutes <= 5);
const canEdit = isAdmin || (isOwner && diffMinutes <= 5);
                                // Debug log for troubleshooting
                                console.log(
                                    'user.id:', user?.id,
                                    'e.created_by:', e.created_by,
                                    'isAdmin:', isAdmin,
                                    'diffMinutes:', diffMinutes,
                                    'isOwner:', isOwner,
                                    'canEdit:', canEdit
                                );

                                return (
                                    <div className="card Forum-list" key={e.id || index}>
                                        <div className="card-body">
                                            <div className="row align-items-center justify-content-center text-center h-100">
                                                <div>
                                                    <h3><b className="filter-txt">{e.title}</b></h3>
                                                    <hr />
                                                    <p className="truncate filter-txt" dangerouslySetInnerHTML={{ __html: e.description }} ></p>
                                                    <br />
                                                    <hr className="divider" style={{ maxWidth: "calc(80%)" }} />
                                                    <div className='forumbtn d-flex justify-content-between align-items-center'>
                                                        <div>
                                                            <span className="badge badge-info me-1 px-3">
                                                                <b><i>Created by: <span className="filter-txt">{e.creator_name}</span></i></b>
                                                            </span>
                                                            <span className="badge badge-secondary px-3">
                                                                <b><FaComments /> <i> {e.comments_count}</i></b>
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <button className="btn btn-primary btn-sm mr-2" onClick={() => handleView(e)}>View Topic</button>
                                                            {/* Show canEdit value for debugging */}
                                                            {/* <span style={{ color: 'red', fontWeight: 'bold' }}>canEdit: {String(canEdit)}</span> */}
                                                            {canEdit && (
                                                                <>
                                                                    <button className="btn btn-warning btn-sm mr-2" onClick={() => handleEditForum(e)}>
                                                                        <FaEdit /> Edit
                                                                    </button>
                                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteForum(e.id)}>
                                                                        <FaTrash /> Delete
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* If you want to show info about the 5-minute rule, uncomment below */}
                                                    {!isAdmin && isOwner && diffMinutes > 5 && (
                                                        <div className="alert alert-info mt-2" role="alert">
                                                            <small>
                                                                Editing and deleting is only allowed within 5 minutes of topic creation. For further changes, please contact the administrator.
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="d-flex flex-column justify-content-center align-items-center">
                                <p>{searchQuery}</p>
                                <h4 className='text-info-emphasis'>No Topic Available</h4>
                            </div>
                        )
                    )}
                    <br />
                </div>
            )}
        </>
    );
};

export default Forum;