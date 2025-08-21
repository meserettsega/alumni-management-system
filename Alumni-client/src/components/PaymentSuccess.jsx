import React from 'react';
import { FaHeart, FaCheckCircle } from 'react-icons/fa';
import 'animate.css';

const PaymentSuccess = () => (
  <div className="d-flex justify-content-center align-items-center vh-100 bg-light animate__animated animate__fadeIn">
    <div className="text-center bg-white p-5 shadow-lg rounded-4" style={{ maxWidth: 500 }}>
      <FaCheckCircle className="text-success mb-3" size={64} />
      <h2 className="text-success fw-bold">Thank You for Your Donation!</h2>
      <p className="fs-5 text-muted mt-3">
        Your generosity makes a big difference. <br />
        We're incredibly grateful for your support.
      </p>
      <a href="/donations" className="btn btn-primary btn-lg mt-4 d-inline-flex align-items-center gap-2">
        <FaHeart />
        Donate Again
      </a>
    </div>
  </div>
);

export default PaymentSuccess;
