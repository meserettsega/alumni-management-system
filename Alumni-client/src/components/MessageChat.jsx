import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import { baseUrl } from '../utils/globalurl';
import defaultAvatar from '../assets/uploads/defaultavatar.jpg';
import graduate from '../assets/uploads/graduate.jpg';
import chatside from '../assets/uploads/chatside.jpg';
import '../styles/MessageChat.css';
import { useUser } from '../UserContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MessageChat = () => {
    const { currentUser } = useUser();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [editingMessage, setEditingMessage] = useState(null); // Track the message being edited
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch users when the component mounts
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${baseUrl}auth/alumni_list`);
                setUsers(response.data);
                setFilteredUsers(response.data);
            } catch (err) {
                console.error('Failed to fetch users:', err);
                setError('Failed to fetch users.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Fetch messages for the selected user
    useEffect(() => {
        if (!selectedUser?.id) return;

        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${baseUrl}messages/${currentUser.id}`);
                if (!Array.isArray(response.data)) {
                    setError('Failed to fetch messages. Unexpected response format.');
                    return;
                }
                const filteredMessages = response.data.filter(
                    (msg) =>
                        (msg.sender_id === currentUser.id && msg.receiver_id === selectedUser.id) ||
                        (msg.sender_id === selectedUser.id && msg.receiver_id === currentUser.id)
                );
                setMessages(filteredMessages);
            } catch (err) {
                console.error('Failed to fetch messages:', err);
                setError('Failed to fetch messages.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [selectedUser, currentUser]);

    // Send or update a message
    const sendMessage = useCallback(async () => {
        if (!messageInput.trim() || !selectedUser) {
            setError('Message content and receiver must be specified.');
            return;
        }

        setIsLoading(true);
        try {
            if (editingMessage) {
                // Update the message
                const response = await axios.put(`${baseUrl}messages/${editingMessage.id}`, {
                    message_text: messageInput.trim(),
                });
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === editingMessage.id ? { ...msg, message_text: response.data.message_text } : msg
                    )
                );
                toast.success('Message updated successfully!');
                setEditingMessage(null);
            } else {
                // Send a new message
                const messageData = {
                    sender_id: currentUser.id,
                    receiver_id: selectedUser.id,
                    message_text: messageInput.trim(),
                };

                const response = await axios.post(`${baseUrl}messages/send`, messageData, {
                    headers: { 'Content-Type': 'application/json' },
                });

                const newMessage = {
                    ...response.data,
                    sender_name: currentUser.name,
                    receiver_name: selectedUser.name,
                    sent_at: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, newMessage]);
            }
            setMessageInput('');
        } catch (err) {
            console.error('Failed to send or update message:', err);
            setError('Failed to send or update message.');
        } finally {
            setIsLoading(false);
        }
    }, [messageInput, selectedUser, currentUser, editingMessage]);

    // Delete a message
    const deleteMessage = async (id) => {
        try {
            await axios.delete(`${baseUrl}messages/${id}`);
            setMessages((prev) => prev.filter((msg) => msg.id !== id));
            toast.success('Message deleted successfully!');
        } catch (err) {
            console.error('Failed to delete message:', err);
            toast.error('Failed to delete message.');
        }
    };

    // Handle search input
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredUsers(users.filter((user) => user.name.toLowerCase().includes(query)));
    };

    // Handle user selection
    const handleUserClick = (user) => {
        setSelectedUser(user);
    };

    // Handle editing a message
    const handleEditMessage = (msg) => {
        setEditingMessage(msg);
        setMessageInput(msg.message_text);
    };

return (
    <>
        <div className="chat-bg">
        <div
            className="message-container"
            // style={{
            //     backgroundImage: `linear-gradient(hsla(0, 0.00%, 5.90%, 0.50), hsla(0, 0.00%, 5.90%, 0.36)), url(${graduate})`,
            //     backgroundSize: 'cover',
            //     backgroundPosition: 'center',
            //     backgroundRepeat: 'no-repeat',
            // }}
        >
            <ToastContainer />
            <div className="user-list">
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search alumni..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
                <div className="users"
                //  style={{
                //     backgroundImage: `linear-gradient(hsla(0, 0.00%, 5.90%, 0.50), hsla(0, 0.00%, 5.90%, 0.36)), url(${chatside})`,
                //     height: '100%',
                //     width: '100%',
                //     backgroundSize: 'cover',
                //     backgroundPosition: 'center',
                //     backgroundRepeat: 'no-repeat',
                // }}
                >
                    
                    {isLoading ? (
                        <p className="loading">Loading...</p>
                    ) : error ? (
                        <p className="error">{error}</p>
                    ) : (
                        filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                                onClick={() => handleUserClick(user)}
                            >
                                <img
                                    src={user.avatar ? `${baseUrl}${user.avatar}` : defaultAvatar}
                                    alt="avatar"
                                    className="user-avatar"
                                />
                                <span className="user-name">{user.name}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="chat-window">
                <div className="chat-header">
                    {selectedUser ? `Chat with ${selectedUser.name}` : 'Select a user to start chatting'}
                </div>
                <div className="chat-box">
    {messages.length > 0 ? (
        messages.map((msg) => (
            <div
                key={msg.id}
                className={`message ${msg.sender_id === currentUser.id ? 'sent' : 'received'}`}
            >
                <div className="message-content">
                    <span className="message-sender">
                        {msg.sender_name} → {msg.receiver_name}:
                    </span>
                    {msg.message_text}
                    <span className="message-time">
                        {format(new Date(msg.sent_at), 'MMMM d, yyyy, hh:mm a')}
                    </span>
                    {msg.sender_id === currentUser.id && (
                        <div className="message-actions">
                            <FaEdit
                                 className="edit-icon me-3"
    
                                onClick={() => handleEditMessage(msg)}
                                title="Edit Message"
                            />
                            <FaTrash
                                   className="delete-icon"
        
                                onClick={() => deleteMessage(msg.id)}
                                title="Delete Message"
                            />
                        </div>
                    )}
                </div>
            </div>
        ))
    ) : (
        <p className="no-messages">No messages yet</p>
    )}
</div>
                {selectedUser && (
                    <div className="message-input-container">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            className="message-input"
                        />
                        <button
                            className="send-button"
                            onClick={sendMessage}
                            disabled={isLoading || !messageInput.trim()}
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                )}
            </div>
        </div>
                </div>
    </>
);
};

export default MessageChat;