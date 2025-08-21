import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { baseUrl } from '../utils/globalurl';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminDonation = () => {
    const [donations, setDonations] = useState([]);

    useEffect(() => {
        axios.get(`${baseUrl}auth/donations`)
            .then((res) => {
                if (Array.isArray(res.data)) {
                    setDonations(res.data);
                } else {
                    setDonations([]);
                }
            })
            .catch((err) => {
                console.error('Error fetching donations:', err);
                setDonations([]);
            });
    }, []);

    return (
        <div className="container-fluid">
            <ToastContainer position="top-center" />
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header">
                            <b>Donation List</b>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover">
                                    <thead>
                                        <tr>
                                            <th className="text-center">#</th>
                                            <th className="text-center">Name</th>
                                            <th className="text-center">Email</th>
                                            <th className="text-center">Phone</th>
                                            <th className="text-center">Graduation Year</th>
                                            <th className="text-center">Department</th>
                                            <th className="text-center">Amount</th>
                                            <th className="text-center">Payment Method</th>
                                            <th className="text-center">Account Number</th>
                                            <th className="text-center">Telebirr Phone Number</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {donations.map((donation, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{index + 1}</td>
                                                <td>{donation.name}</td>
                                                <td>{donation.email}</td>
                                                <td>{donation.phone}</td>
                                                <td>{donation.graduationYear}</td>
                                                <td>{donation.department}</td>
                                                <td>{donation.amount} ETB</td>
                                                <td>{donation.paymentMethod}</td>
                                                <td>{donation.accountNumber}</td>
                                                <td>{donation.telebirrPhoneNumber}</td>
                                            </tr>
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

export default AdminDonation;