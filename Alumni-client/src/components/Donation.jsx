import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { baseUrl } from '../utils/globalurl';
import '../styles/donations.css';
import headbg from '../assets/uploads/headebg.jpg';

const Donation = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        amount: '',
    });
    const [thankYou, setThankYou] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.id]: e.target.value });
    };

    const validate = () => {
        const { name, email, phone, amount } = form;
        if (!name || !email || !phone || !amount) {
            toast.error("Please fill out all required fields.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            // Save form data and get Chapa checkout URL
            const res = await axios.post(`${baseUrl}auth/donations`, form);
            const { checkoutUrl } = res.data;
            window.location.href = checkoutUrl;
        } catch (err) {
            toast.error("Submission failed. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ToastContainer position="top-center" />
            <header className="masthead" style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.28)), url(${headbg})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
                padding: "3rem 0 2rem 0",
                color: "#fff"
            }}>
                <div className="container-fluid h-100">
                    <div className="row h-100 align-items-center justify-content-center text-center">
                        <div className="col-lg-8 align-self-end mb-4 page-title">
                            <h1 className="text-white fw-bold">Support Our Cause</h1>
                            <p className="text-white fs-5">Your generosity helps us empower the next generation of Computer Science leaders.</p>
                            <hr className="divider my-4" style={{ borderColor: "#fff" }} />
                        </div>
                    </div>
                </div>
            </header>

            <div className="container main-content mt-0">
                {!thankYou ? (
                    <form onSubmit={handleSubmit} className="donation-forme shadow-lg p-4 rounded bg-white" style={{ maxWidth: 500, margin: "2rem auto" }}>
                        <h2 className="mb-4 text-center text-primary">Make a Donation</h2>

                        <input id="name" type="text" className="form-control mb-3" placeholder="Full Name" value={form.name} onChange={handleChange} required />
                        <input id="email" type="email" className="form-control mb-3" placeholder="Email" value={form.email} onChange={handleChange} required />
                        <input id="phone" type="text" className="form-control mb-3" placeholder="Phone Number" value={form.phone} onChange={handleChange} required />
                        <input id="amount" type="number" className="form-control mb-3" placeholder="Amount in ETB" value={form.amount} onChange={handleChange} required min="1" />

                        <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
                            {loading ? (
                                <span>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Processing...
                                </span>
                            ) : "Donate Now"}
                        </button>

                        <div className="text-muted text-center mt-3">
                            <i className="bi bi-shield-check text-success"></i> Secure payment powered by <b>Chapa</b>
                        </div>
                    </form>
                ) : (
                    <div className="thank-you-message text-center p-5">
                        <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Thank you" width={80} className="mb-3" />
                        <h2 className="text-success">Thank You!</h2>
                        <p className="fs-5">Your donation makes a real difference.<br />We appreciate your support!</p>
                        <button className="btn btn-outline-primary mt-3" onClick={() => setThankYou(false)}>Make Another Donation</button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Donation;