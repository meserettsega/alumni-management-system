import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { baseUrl } from '../../utils/globalurl';
import { FaEye, FaEyeSlash } from "react-icons/fa"; // <-- Add this import

const ManageUser = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [users, setUsers] = useState({
        id: '',
        name: '',
        email: '',
        password: '',
        type: 'admin'
    });

    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // <-- Add this state
    const [passwordError, setPasswordError] = useState(""); // <-- Add this state
   
     // --- Add this logic ---
    const currentUser = JSON.parse(localStorage.getItem("current_user"));
    const isEditingSelf = location.state?.status === "edit" &&
        currentUser &&
        location.state?.data?.id === currentUser.id &&
        currentUser.type === "admin";
    // ----------------------
    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem("current_user"));
        if (currentUser && currentUser.id === "admin123") {
            setIsSuperAdmin(true);
        } else {
            setIsSuperAdmin(false);
        }
   if (location.state && location.state.status === 'edit') {
        setUsers({
            id: location.state.data.id,
            name: location.state.data.name,
            email: location.state.data.email || currentUser?.email || "", // <-- ensure this is set
            password: "",
            type: location.state.type || location.state.data.type || 'admin',
        });
    }
    }, [location.state]);

    const handleChange = (e) => {
        setUsers({ ...users, [e.target.name]: e.target.value });
        if (e.target.name === "password") {
            validatePassword(e.target.value);
        }
    };

    // Password validation: at least one letter, one number, one special character, min 6 chars
    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
        if (!password || regex.test(password)) {
            setPasswordError("");
            return true;
        } else {
            setPasswordError("Password must be at least 6 characters and include a letter, a number, and a special character.");
            return false;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

      

        if (location.state.status === 'add' && !users.password) {
            toast.error("Password is required for adding a new admin!");
            return;
        }
        if (!users.email) {
    toast.error("Email is missing. Please contact the administrator.");
    return;
}

        // Validate password if adding or changing
        if (users.password && !validatePassword(users.password)) {
            toast.error("Password must be at least 6 characters and include a letter, a number, and a special character.");
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem("current_user"));
        const superAdmin = {
            id: "admin123",
            email: "admin@gmail.com"
        };

         if (location.state.status === 'add' && (!currentUser || currentUser.id !== superAdmin.id)) {
        toast.error("Only the super admin can add sub-admins!");
        return;
    }
const userData = {
    ...(location.state.status === 'edit' && { id: users.id }),
    name: users.name,
    email: users.email,
    password: users.password || (location.state.data && location.state.data.password) || "",
    type: users.type,
    ...(location.state.status === 'add' && { currentUser })
};
     // Debug: log what you are sending
    console.log("Submitting userData:", userData);
     if (
    (location.state.status === 'edit' && !userData.id) ||
    !userData.name ||
    !userData.email ||
    !userData.type ||
    !userData.password
) {
    toast.error("All fields are required.");
    return;
}

        const apiEndpoint = location.state.status === 'add'
            ? `${baseUrl}auth/adduser`
            : `${baseUrl}auth/manageuser`;

const axiosMethod = location.state.status === 'add' ? axios.post : axios.put;

axiosMethod(apiEndpoint, userData, { withCredentials: true })
    .then((res) => {
        if (users.password) {
            toast.success("Password updated successfully!");
        } else {
            toast.success(res.data.message || "User saved successfully!");
        }
        navigate("/dashboard/users");
    })
    .catch((err) => {
        console.error("Error occurred:", err);
        const errorMessage = err.response?.data?.error || "An error occurred while saving the user.";
        toast.error(errorMessage);
    });
}; // <-- Close handleSubmit function here

    return (
        <>
            <ToastContainer position="top-center" />
            <div className="container-fluid">
                <div id="msg"></div>
                <form onSubmit={handleSubmit} id="manage-user">
                    <input type="hidden" name="id" value={users.id} />
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            className="form-control"
                            value={users.name}
                            onChange={handleChange}
                            required
                            disabled={isEditingSelf}

                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            className="form-control"
                            value={users.email}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                            disabled={isEditingSelf}

                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
                                className="form-control"
                                onChange={handleChange}
                                autoComplete="off"
                                value={users.password}
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
                        {location.state.status === 'add' && (
                            <small><i>Password is required for adding a new admin.</i></small>
                        )}
                        {/* <small className="form-text text-muted">
                            Password must be at least 6 characters and include a letter, a number, and a special character.
                        </small> */}
                    </div>
                    <div className="form-group d-none">
                        <label htmlFor="type">User Type</label>
                        <select
                            onChange={handleChange}
                            className="custom-select"
                            name="type"
                            value={users.type}
                            disabled
                        >
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                   {(isSuperAdmin || isEditingSelf) && (
                  <button type="submit" className="btn btn-primary">Submit</button>
                             )}
                     <button
                        type="button"
                        className="btn btn-outline-danger float-end"
                        onClick={() => navigate("/dashboard/users")}
                    >
                        Back
                    </button>
                </form>
            </div>
        </>
    );
};

export default ManageUser;