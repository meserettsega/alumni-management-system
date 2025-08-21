import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { baseUrl } from '../utils/globalurl';
import defaultavatar from "../assets/uploads/defaultavatar.jpg";

const AdminMessage = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        axios.get(`${baseUrl}auth/alumni`)
            .then((res) => {
                setUsers(res.data);
            })
            .catch((err) => {
                console.error("Error fetching users:", err);
                toast.error("Failed to load users.");
            });
    }, []);

    const selectUser = (user) => {
        setSelectedUser(user);
        axios.get(`${baseUrl}messages/${user.id}`)
            .then((res) => {
                setMessages(res.data);
            })
            .catch((err) => {
                console.error("Error fetching messages:", err);
                toast.error("Failed to load messages.");
            });
    };

    const sendMessage = () => {
        if (!newMessage.trim()) return;

        const messageData = {
            sender: "admin",
            receiver: selectedUser.id,
            content: newMessage
        };

        axios.post(`${baseUrl}messages/send`, messageData)
            .then((res) => {
                setMessages([...messages, res.data]);
                setNewMessage('');
            })
            .catch((err) => {
                console.error("Error sending message:", err);
                toast.error("Failed to send message.");
            });
    };

    return (
        <div className="container-fluid mt-4">
            <ToastContainer position="top-center" />
            <div className="row">
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header">Alumni List</div>
                        <div className="card-body list-group">
                            {users.length > 0 ? users.map((user) => (
                                <button
                                    key={user.id}
                                    className="list-group-item list-group-item-action"
                                    onClick={() => selectUser(user)}
                                >
                                    <img 
                                        src={user.avatar ? `${baseUrl}${user.avatar}` : defaultavatar} 
                                        className="rounded-circle me-2" 
                                        width="30" 
                                        height="30" 
                                        alt="avatar" 
                                    />
                                    {user.name}
                                </button>
                            )) : <p>No Alumni Available</p>}
                        </div>
                    </div>
                </div>
                <div className="col-md-8">
                    {selectedUser ? (
                        <div className="card">
                            <div className="card-header">Chat with {selectedUser.name}</div>
                            <div className="card-body chat-box" style={{ height: "400px", overflowY: "scroll" }}>
                                {messages.length > 0 ? messages.map((msg, index) => (
                                    <div key={index} className={`message ${msg.sender === 'admin' ? 'text-end' : ''}`}>
                                        <span className={`badge ${msg.sender === 'admin' ? 'bg-primary' : 'bg-secondary'}`}>{msg.content}</span>
                                    </div>
                                )) : <p>No messages yet.</p>}
                            </div>
                            <div className="card-footer d-flex">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                />
                                <button className="btn btn-primary ms-2" onClick={sendMessage}>Send</button>
                            </div>
                        </div>
                    ) : <p className="text-center">Select an alumnus to chat.</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminMessage;
