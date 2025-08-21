import React, { useEffect, useState } from 'react';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { baseUrl } from '../utils/globalurl';
import { FaEye, FaEyeSlash } from "react-icons/fa"; // <-- Add this import

const Signup = () => {
    const [values, setValues] = useState({
        name: "",
        email: "",
        password: "",
        userType: "alumnus",
        course_id: "",
    });
    const [departments, setDepartments] = useState([]);
    const [showPassword, setShowPassword] = useState(false); // <-- Add this state
    const [passwordError, setPasswordError] = useState(""); // <-- Add this state

    const navigate = useNavigate();

    // Password validation function
    const validatePassword = (password) => {
        // At least one letter, one number, one special character, min 6 chars
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
        return regex.test(password);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate password before submitting
        if (!validatePassword(values.password)) {
            setPasswordError("Password must be at least 6 characters and include a letter, a number, and a special character.");
            return;
        } else {
            setPasswordError("");
        }

        const signupData = {
            name: values.name,
            email: values.email,
            password: values.password,
            type: values.userType,
            course_id: values.course_id,
        };

        axios.post(`${baseUrl}auth/signup`, signupData)
            .then((res) => {
                if (res.data.error) {
                    return toast.warning(res.data.error);
                }
                if (res.data.signupStatus) {
                    toast.success(res.data.message);
                    setTimeout(() => {
                        navigate("/login", { state: { action: "navtologin" } });
                    }, 2000);
                } else {
                    toast.error("An error occurred");
                }
            })
            .catch(err => {
                if (err.response) {
                    toast.error(err.response.data.error || "An error occurred during signup.");
                } else if (err.request) {
                    toast.error("No response from the server. Please try again later.");
                } else {
                    toast.error("An unexpected error occurred. Please try again.");
                }
            });
    };

    useEffect(() => {
        axios.get(`${baseUrl}auth/courses`)
            .then((res) => {
                setDepartments(res.data);
            })
            .catch(err => console.log(err))
    }, [])

    return (
        <>
            <ToastContainer position="top-center" hideProgressBar />
            <header className="masthead">
                <div className="container-fluid h-100">
                    <div className="row h-100 align-items-center justify-content-center text-center">
                        <div className="col-lg-8 align-self-end mb-4 page-title">
                            <h3 className="text-white">Create Account</h3>
                            <hr className="divider my-4" />
                        </div>
                    </div>
                </div>
            </header>
            <div className="container mt-3 pt-2">
                <div className="col-lg-12">
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="row justify-content-center">
                                <div className="container col-lg-6 col-md-8 col-sm-10">
                                    <form onSubmit={handleSubmit} id="create_account">
                                        <div className="form-group">
                                            <label htmlFor="name" className="control-label">Full Name</label>
                                            <input onChange={(e) => setValues({ ...values, name: e.target.value })} type="text" className="form-control" id="name" name="name" required />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="email" className="control-label">Email</label>
                                            <input onChange={(e) => setValues({ ...values, email: e.target.value })} type="email" className="form-control" id="email" name="email" required />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="password" className="control-label">Password</label>
                                            <div style={{ position: "relative" }}>
                                                <input
                                                    onChange={(e) => setValues({ ...values, password: e.target.value })}
                                                    type={showPassword ? "text" : "password"}
                                                    className="form-control"
                                                    id="password"
                                                    name="password"
                                                    required
                                                />
                                                <span
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                    style={{
                                                        position: "absolute",
                                                        right: "10px",
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        cursor: "pointer",
                                                        color: "#888"
                                                    }}
                                                    tabIndex={0}
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                </span>
                                            </div>
                                            {passwordError && <div className="text-danger mt-2">{passwordError}</div>}
                                            {/* <small className="form-text text-muted">
                                                Password must be at least 6 characters and include a letter, a number, and a special character.
                                            </small> */}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="course_id" className="control-label">Department</label>
                                            <select onChange={(e) => setValues({ ...values, course_id: e.target.value })} className="form-control select2" name="course_id" required value={values.course_id}>
                                                <option disabled value="">Select department</option>
                                                {departments.map(d => (
                                                    <option key={d.id} value={d.id}>{d.course}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <hr className="divider" />
                                        <div className="row justify-content-center">
                                            <div className="col-md-6 text-center">
                                                <button type="submit" className="btn btn-info btn-block">Create Account</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Signup;