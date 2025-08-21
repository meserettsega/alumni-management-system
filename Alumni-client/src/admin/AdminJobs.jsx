import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import ViewJobs from './view/ViewJobs';
import { baseUrl } from '../utils/globalurl';

const AdminJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (job) => {
        setSelectedJob(job);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedJob(null);
        setIsModalOpen(false);
    };

    useEffect(() => {
        fetchJobs();
    }, []);
    const fetchJobs = () => {
        axios.get(`${baseUrl}auth/jobs/all`)
            .then((res) => {
                // Ensure jobs is always an array
                console.log("Jobs API response:", res.data);
                setJobs(Array.isArray(res.data) ? res.data : []);
            })
            .catch((err) => {
                setJobs([]); // On error, set to empty array
                console.log(err);
            });
    };
    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`${baseUrl}auth/jobs/${id}`);
            toast.warning(response.data.message || "Job deleted");
            setJobs(jobs.filter(job => job.id !== id));
        } catch (error) {
            console.error('Error:', error);
            toast.error("An error occurred");
        }
    };

    const handleApprove = async (id) => {
        try {
            await axios.post(`${baseUrl}auth/jobs/approve/${id}`);
            toast.success("Job approved!");
            setJobs(jobs.map(job => job.id === id ? { ...job, status: 'approved' } : job));
        } catch (error) {
            toast.error("Failed to approve job");
        }
    };

    return (
        <>
            <ToastContainer position="top-center" />
            <div className="container-fluid">
                <div className="col-lg-12">
                    <div className="row mb-4 mt-4">
                        <div className="col-md-12"></div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-header">
                                    <b>Jobs List</b>
                                    <span className="">
                                        <Link to="/dashboard/jobs/manage" className="btn btn-primary btn-block btn-sm col-sm-2 float-right">
                                            <FaPlus /> New
                                        </Link>
                                    </span>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-condensed table-hover">
                                            <thead>
                                                <tr>
                                                    <th className="text-center">#</th>
                                                    <th>Company</th>
                                                    <th>Job Title</th>
                                                    <th>Posted By</th>
                                                    <th>Status</th>
                                                    <th className="text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {jobs.length > 0 ? (
                                                    jobs.map((job, index) => (
                                                        <tr key={job.id}>
                                                            <td className="text-center">{index + 1}</td>
                                                            <td><b>{job.company}</b></td>
                                                            <td><b>{job.job_title || job.title}</b></td>
                                                            <td><b>{job.name}</b></td>
                                                            <td>
                                                                <span className={
                                                                    job.status === 'pending'
                                                                        ? 'badge bg-warning'
                                                                        : job.status === 'no need approve'
                                                                            ? 'badge bg-info'
                                                                            : 'badge bg-success'
                                                                }>
                                                                    {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'N/A'}
                                                                </span>
                                                            </td>
                                                            <td className="text-center justify-content-center border-0 d-flex gap-1">
                                                                <button className="btn btn-sm btn-outline-primary view_career" type="button" onClick={() => openModal(job)}>View</button>
                                                                <Link to="/dashboard/jobs/manage" state={{ action: "edit", data: job }} className="btn btn-sm btn-outline-primary edit_career" >Edit</Link>
                                                                <button className="btn btn-sm btn-outline-danger delete_career" type="button" onClick={() => handleDelete(job.id)}>Delete</button>
                                                                {job.status === 'pending' && (
                                                                    <button className="btn btn-sm btn-outline-success" type="button" onClick={() => handleApprove(job.id)}>
                                                                        Approve
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} className="text-center">No Job Available</td>
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
            {isModalOpen && selectedJob && (
                <ViewJobs job={selectedJob} closeModal={closeModal} />
            )}
        </>
    );
}

export default AdminJobs;