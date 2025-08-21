import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { baseUrl } from '../utils/globalurl';
import '../styles/MyAccount.css'; // Add custom styles for unique class names

const MyAccount = () => {
    const [acc, setAcc] = useState({
        name: '',
        connected_to: "",
        course_id: "",
        email: "",
        gender: "",
        password: "",
        batch: "",
    });
    const [file, setFile] = useState(null);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const departmentsRes = await axios.get(`${baseUrl}auth/courses`);
                setDepartments(departmentsRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Error fetching data');
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setAcc({ ...acc, [e.target.name]: e.target.value });
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const alumnus_id = localStorage.getItem("alumnus_id");
        const user_id = localStorage.getItem("user_id");
        const pswrd = document.getElementById("pswrd").value;
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('name', acc.name);
            formData.append('connected_to', acc.connected_to);
            formData.append('course_id', acc.course_id);
            formData.append('email', acc.email);
            formData.append('gender', acc.gender);
            formData.append('password', pswrd);
            formData.append('batch', acc.batch);
            formData.append('alumnus_id', alumnus_id);
            formData.append('user_id', user_id);

            const response = await axios.put(`${baseUrl}auth/upaccount`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success(response.data.message);
            setFile(null);
            setAcc({
                name: '',
                connected_to: "",
                course_id: "",
                email: "",
                gender: "",
                password: "",
                batch: "",
            });
        } catch (error) {
            toast.error('An error occurred');
            console.error('Error:', error);
        }
    };

    return (
        <>
            <ToastContainer position="top-center" />
            <motion.header
                className="myaccount-header bg-primary text-white text-center py-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="container">
                    <h1 className="display-4">Manage Your Account</h1>
                    <FaStar className="text-warning mt-3" size={30} />
                    <p className="lead mt-3">Update your personal information and preferences</p>
                </div>
            </motion.header>
            <motion.section
                className="myaccount-section bg-light text-dark py-5"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <form onSubmit={handleSubmit} className="myaccount-form shadow p-4 rounded bg-white">
                                <div className="form-group row mb-3">
                                    <label htmlFor="name" className="col-sm-3 col-form-label myaccount-label">Name</label>
                                    <div className="col-sm-9">
                                        <input onChange={handleChange} type="text" className="form-control myaccount-input" name="name" placeholder="Enter your FullName" required value={acc.name} />
                                    </div>
                                </div>
                                <div className="form-group row mb-3">
                                    <label htmlFor="gender" className="col-sm-3 col-form-label myaccount-label">Gender</label>
                                    <div className="col-sm-3">
                                        <select onChange={handleChange} className="form-control myaccount-select" name="gender" required value={acc.gender}>
                                            <option disabled value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                    <label htmlFor="batch" className="col-sm-3 col-form-label myaccount-label">Batch</label>
                                    <div className="col-sm-3">
                                        <input onChange={handleChange} type="text" className="form-control myaccount-input" name="batch" id="batch" required value={acc.batch} />
                                    </div>
                                </div>
                                <div className="form-group row mb-3">
                                    <label htmlFor="course_id" className="col-sm-3 col-form-label myaccount-label">Department</label>
                                    <div className="col-sm-9">
                                        <select onChange={handleChange} className="form-control myaccount-select" name="course_id" required value={acc.course_id}>
                                            <option disabled value="">Select department</option>
                                            {departments.map(d => (
                                                <option key={d.id} value={d.id}>{d.course}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group row mb-3">
                                    <label htmlFor="connected_to" className="col-sm-3 col-form-label myaccount-label">Currently Connected To</label>
                                    <div className="col-sm-9">
                                        <textarea onChange={handleChange} name="connected_to" className="form-control myaccount-textarea" rows="3" placeholder="Enter your current connection" value={acc.connected_to}></textarea>
                                    </div>
                                </div>
                                <div className="form-group row mb-3">
                                    <label htmlFor="avatar" className="col-sm-3 col-form-label myaccount-label">Image</label>
                                    <div className="col-sm-9">
                                        <input onChange={handleFileChange} type="file" className="form-control-file myaccount-file" name="avatar" />
                                    </div>
                                </div>
                                <div className="form-group row mb-3">
                                    <label htmlFor="email" className="col-sm-3 col-form-label myaccount-label">Email (Alternative)</label>
                                    <div className="col-sm-9">
                                        <input onChange={handleChange} type="email" className="form-control myaccount-input" name="email" placeholder="Enter your email" required value={acc.email} />
                                    </div>
                                </div>
                                <div className="form-group row mb-3">
                                    <label htmlFor="password" className="col-sm-3 col-form-label myaccount-label">Password</label>
                                    <div className="col-sm-9">
                                        <input onChange={handleChange} id='pswrd' type="password" className="form-control myaccount-input" name="password" placeholder="Enter your password" />
                                        <small className="form-text text-muted fst-italic">Leave this blank if you don't want to change your password</small>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <div className="col-sm-12 text-center">
                                        <motion.button
                                            type='submit'
                                            className="btn myaccount-btn px-5 py-2"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            Update Account
                                        </motion.button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </motion.section>
        </>
    );
}

export default MyAccount;