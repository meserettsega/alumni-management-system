import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { baseUrl } from '../utils/globalurl';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Super admin credentials
  const adminCredentials = {
    id: "admin123",
    email: "admin@gmail.com",
  };

  useEffect(() => {
    // Fetch the logged-in user's details from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem("current_user"));
    if (loggedInUser) {
      console.log("Retrieved User from localStorage:", loggedInUser); // Debugging
      setCurrentUser(loggedInUser);
    } else {
      console.error("No logged-in user found in localStorage.");
    }

    // Fetch all users
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get(`${baseUrl}auth/users`)
      .then((res) => {
        console.log("API Response:", res.data); // Debugging
        setUsers(res.data); // Display all users (including alumni)
      })
      .catch((err) => console.error("Error fetching users:", err));
  };

  const addSubAdmin = () => {
    // Ensure only the super admin can add sub-admins
    if (currentUser?.id === adminCredentials.id) {
      navigate("/dashboard/users/manage", {
        state: { status: "add", type: "sub-admin", allowedRoles: ["admin"] },
      });
      toast.success("Sub-admin added successfully!"); // Success notification
    } else {
      toast.error("Only the super admin can add sub-admins!");
    }
  };

  const delUser = (id) => {
    // Ensure only the super admin can delete users
    if (currentUser?.id === adminCredentials.id) {
      axios.delete(`${baseUrl}auth/user/${id}`)
        .then((res) => {
          toast.info(res.data.message || "User deleted successfully!");
          fetchUsers(); // Refresh the table after deleting a user
        })
        .catch((err) => {
          console.error("Error deleting user:", err);
          toast.error("An error occurred while deleting the user.");
        });
    } else {
      toast.error("Only the super admin can delete users!");
    }
  };

  const isSuperAdmin = currentUser?.id === adminCredentials.id;
  console.log("Current User:", currentUser);
  console.log("Is Super Admin:", isSuperAdmin); // Debugging

  return (
    <div className="container-fluid mt-4">
      <ToastContainer position="top-center" />

      {/* Add Sub-Admin Button */}
      {isSuperAdmin && (
        <div className="row">
          <div className="col-lg-12">
            <button onClick={addSubAdmin} className="btn btn-primary float-right btn-sm" id="new_user">
              <FaPlus /> Add Sub-Admin
            </button>
          </div>
        </div>
      )}
      {currentUser && currentUser.type === "admin" && !isSuperAdmin && (
  <div className="row mb-2">
    <div className="col-lg-12">
      <button
        className="btn btn-info float-right btn-sm"
        onClick={() =>
          navigate("/dashboard/users/manage", {
            state: {
              status: "edit",
              data: currentUser,
              type: currentUser.type,
            },
          })
        }
      >
        <FaEdit /> Manage My Account
      </button>
    </div>
  </div>
)}

      <div className="row mt-4">
        <div className="col-lg-12 padzero">
          <div className="card tablecard">
            <div className="card-body cardwidth">
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th className="text-center">#</th>
                      <th className="text-center">Name</th>
                      <th className="text-center">Email</th>
                      <th className="text-center">Type</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={index}>
                        <td className="text-center">{index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.type}</td>
                        <td className="text-center">
  {isSuperAdmin  && user.type === "admin" ? (
    <>
      {/* <Link
        to="/dashboard/users/manage"
        state={{
          status: "edit",
          data: user,
          type: user.type, // Pass the correct user type (e.g., "alumnus" or "admin")
        }}
        className="btn btn-primary btn-sm mr-2"
        onClick={() => toast.info(`Editing user: ${user.name}`)} // Toast notification for editing

      >
        <FaEdit /> EditF
      </Link> */}
      <button
        onClick={() =>{ delUser(user.id);
          toast.success(`User ${user.name} deleted successfully!`); // Toast notification for deleting

        }}
        className="btn btn-danger btn-sm"
      >
        <FaTrash /> Delete
      </button>
    </>
  ) : (
    <span className="text-muted">Restricted</span>
  )}
</td>            </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;