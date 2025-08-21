import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FaBuilding, FaMapMarker, FaPlus, FaSearch, FaSpinner } from 'react-icons/fa';
import ViewJobs from '../admin/view/ViewJobs';
import ManageJobs from '../admin/save/ManageJobs';
import { useAuth } from '../AuthContext';
import { baseUrl } from '../utils/globalurl';

const Careers = () => {
    const { isLoggedIn, isAdmin, user } = useAuth();
    const [filteredJob, setFilteredJob] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [handleAdd, setHandleAdd] = useState(false);
    const [loading, setLoading] = useState(true);

    const openModal = (job) => {
        setSelectedJob(job);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedJob(null);
        setIsModalOpen(false);
    };

    // Fetch jobs
   useEffect(() => {
    setLoading(true);
    axios.get(`${baseUrl}auth/jobs/all`)
        .then((res) => {
                console.log(res.data);

            // If the response is not an array, set to empty array
            setJobs(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        })
        .catch((err) => {
            setLoading(false);
            setJobs([]); // Ensure jobs is always an array on error
            console.log(err);
        });
}, [handleAdd]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [handleAdd]);

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    }

    // Filter jobs: show only approved jobs for public, show all for admin/alumni (if needed)
    useEffect(() => {
        let visibleJobs = jobs;
        if (!isAdmin && !handleAdd) {
    // Show both approved and no need approve jobs to non-admins
    visibleJobs = jobs.filter(j => j.status === 'approved' || j.status === 'no need approve');
        }
        // Alumni can see their own jobs (including pending)
        if (isLoggedIn && user && !isAdmin && handleAdd === false) {
            visibleJobs = [
                ...visibleJobs,
                ...jobs.filter(j => j.postedBy === user._id && j.status !== 'approved')
            ];
            // Remove duplicates
            visibleJobs = visibleJobs.filter((job, idx, arr) =>
                arr.findIndex(j => j._id === job._id) === idx
            );
        }
        // Search filter
        const filteredCareer = visibleJobs.filter(career =>
            (career.job_title || career.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (career.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (career.location || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredJob(filteredCareer);
    }, [searchQuery, jobs, isAdmin, isLoggedIn, user, handleAdd]);

    return (
        <>
            <header className="masthead">
                <div className="container-fluid h-100">
                    <div className="row h-100 align-items-center justify-content-center text-center">
                        <div className="col-lg-8 align-self-end mb-4 page-title">
                            <h3 className="text-white">Job List</h3>
                            <hr className="divider my-4" />
                            <div className="row col-md-12 mb-2 justify-content-center">
                                {isLoggedIn ? (
                                    handleAdd ? null : (
                                        <button onClick={() => setHandleAdd(true)} className="btn btn-primary btn-block col-sm-4" type="button" id="new_career">
                                            <FaPlus /> Post a Job Opportunity
                                        </button>
                                    )
                                ) : (
                                    <p className='text-white'>Please Login to post jobs.</p>
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
                                    <ManageJobs setHandleAdd={setHandleAdd} />
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
                                        <input value={searchQuery} onChange={handleSearchInputChange} type="text" className="form-control" placeholder="Filter" id="filter" aria-label="Filter" aria-describedby="filter-field" />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <button className="btn btn-primary btn-block btn-sm" id="search">Search</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {loading ? (
                        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: 150 }}>
                            <FaSpinner className="fa-spin" size={40} color="#0d6efd" />
                            <span className="mt-2">Loading jobs...</span>
                        </div>
                    ) : filteredJob.length > 0 ? (
                        <>
                            {filteredJob.map((j, index) => (
                                <div className="card job-list" key={index}>
                                    <div className="card-body">
                                        <div className="row align-items-center justify-content-center text-center h-100">
                                            <div>
                                                <h3><b className="filter-txt">{j.title || j.job_title}</b></h3>
                                                <div>
                                                    <span className="filter-txt"><small><b><FaBuilding /> {j.company}</b></small></span>
                                                    <span className="filter-txt"><small><b><FaMapMarker /> {j.location}</b></small></span>
                                                </div>
                                                <hr />
                                                <p dangerouslySetInnerHTML={{ __html: j.description }} className="truncate filter-txt"></p>
                                                <br />
                                                <hr className="divider" style={{ maxWidth: "calc(80%)" }} />
                                                <div className='jobbtn d-flex justify-content-between align-items-center'>
                                                    <span className="badge badge-info">
                                                        <b><i>Posted by: {j.name}</i></b>
                                                    </span>
                                                    {/* Show status badge for alumni's own jobs */}
                                                    {isLoggedIn && user && j.postedBy === user._id && (
                                                        <span className={`badge ${j.status === 'pending' ? 'bg-warning' : 'bg-success'} d-none`}>
                                                            {j.status.charAt(0).toUpperCase() + j.status.slice(1)}
                                                        </span>
                                                    )}
                                                    <button className="btn btn-sm btn-primary" onClick={() => openModal(j)}>Read More</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: 150 }}>
                            <h4 className='text-info-emphasis'>No Job Available</h4>
                        </div>
                    )}
                    <br />
                </div>
            )}
            {isModalOpen && selectedJob && (
                <ViewJobs job={selectedJob} closeModal={closeModal} />
            )}
        </>
    )
}

export default Careers;