import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { FiBook, FiUsers, FiClipboard, FiTool } from 'react-icons/fi';
import { FaCalendar, FaArrowRight, FaUserGraduate, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { motion } from 'framer-motion'; // Import framer-motion for animations
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import imgcs from "../assets/uploads/imgbg.jpg";
import universityImage from "../assets/uploads/amu pic.jpg"; // Add a university image
import { baseUrl } from '../utils/globalurl';
import careerSupportImg from "../assets/uploads/career support.jpg"; // Add images for benefits
import researchAccessImg from "../assets/uploads/research access.jpg";
import workshopsImg from "../assets/uploads/workshop.jpg";
import networkingImg from "../assets/uploads/alumni network.jpg";
const Home = () => {
    const { theme } = useTheme();
    const { isLoggedIn, isAdmin } = useAuth();
    const [events, setEvents] = useState([]);
    const [alumniStats, setAlumniStats] = useState({ total: 0, active: 0, inactive: 0 });
    const location = useLocation();
    const navigate = useNavigate();


    useEffect(() => {
        if (isLoggedIn) {
            const user_name = localStorage.getItem("user_name");
            if (location.state && location.state.action === 'homelogin') {
                toast.success(`Welcome ${user_name}`);
            }
        }
        if (location.state && location.state.action === 'homelogout') {
            toast.info("Logout Success");
        }
    }, [location.state, isLoggedIn]);

    useEffect(() => {
        axios.get(`${baseUrl}auth/up_events`)
            .then((res) => {
                setEvents(res.data);
            })
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        axios.get(`${baseUrl}auth/alumni_stats`)
            .then((res) => {
                setAlumniStats(res.data);
            })
            .catch((err) => console.log(err));
    }, []);

    const formatDate = (timestamp) => {
        const options = {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        };
        return new Date(timestamp).toLocaleDateString('en-US', options);
    };

    return (
        <div>
            <ToastContainer hideProgressBar="true" position="top-center" pauseOnHover="false" pauseOnFocusLoss="false" />
            
            {/* Hero Section */}
            <motion.header
                className="masthead"
                style={{
                    backgroundImage: `url(${imgcs})`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    height: "100vh"
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <div className="container h-100">
                    <div className="row h-100 align-items-center justify-content-center">
                        <div className="col-lg-8 text-center">
                            <motion.h1
                                className="text-white font-weight-bold display-3 mb-4"
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 1 }}
                            >
                                Welcome to AMU ALUMNI
                            </motion.h1>
                            <motion.p
                                className="text-white-75 font-weight-light lead mb-5"
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 1, delay: 0.5 }}
                            >
                                Connecting Alumni Across The Globe
                            </motion.p>
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 1 }}
                            >
                                {!isAdmin && <Link className="btn btn-primary btn-xl" to="about">Find Out More</Link>}
                                {!isLoggedIn && <Link className="btn btn-info ms-2 btn-xl" to="login">Login</Link>}
                                {isLoggedIn && isAdmin && <Link className="btn btn-primary btn-xl" to="dashboard">Admin Dashboard</Link>}
                                {isLoggedIn && !isAdmin && <Link className="btn btn-info ms-2 btn-xl" to="account">Profile</Link>}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.header>
              
            <section className={`py-4 bg-${theme}`} id="upcoming-events">
                <div className="container">
                    <motion.h2
                        className="section-heading text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        Upcoming Events
                    </motion.h2>
                    <hr className="divider my-4" />
                    {events.length > 0 ? (
                        events.map((e, index) => (
                            <motion.div
                                className="card event-list mb-4"
                                key={index}
                                initial={{ opacity: 0, x: -100 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                            >
                                 <div className="card-body">
                                    <h3 className="card-title">{e.title}</h3>
                                    <p><FaCalendar className="me-1" /> {formatDate(e.schedule)}</p>
                                    <p dangerouslySetInnerHTML={{ __html: e.content }}></p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate("events/view", { state: { action: "view", data: e } })}
                                    >
                                        Read More <FaArrowRight />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="d-flex flex-column justify-content-center align-items-center">
                            <h4 className="text-info-emphasis">No Upcoming Event Available</h4>
                        </div>
                    )}
                </div>
            </section>
            {/* Alumni Status Section */}
<section className="py-5 bg-light" id="alumni-status">
    <div className="container">
        <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <h2 className="section-heading text-uppercase">Alumni Status</h2>
            <p className="text-muted">Explore the strength of our alumni network.</p>
        </motion.div>
        <div className="row text-center mt-4">
            {[
                {
                    icon: <FaUserGraduate size={60} className="mb-3 text-primary" />,
                    label: "Total Alumni",
                    value: alumniStats.total,
                    description: "The total number of alumni in our network."
                },
                {
                    icon: <FaUserCheck size={60} className="mb-3 text-success" />,
                    label: "Active Alumni",
                    value: alumniStats.active,
                    description: "Alumni actively engaged in our community."
                }
            ].map((stat, index) => (
                <motion.div
                    className="col-lg-6 col-sm-12 mb-4"
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                    <div className="card h-100 shadow-lg border-0">
                        <div className="card-body">
                            {stat.icon}
                            <h4 className="card-title mt-2">{stat.label}</h4>
                            <p className="card-text display-4 fw-bold">{stat.value}</p>
                            <p className="text-muted">{stat.description}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
</section>
            {/* Alumni Benefits Section */}
            <section className={`page-section bg-${theme}`} id="alumni-benefits" style={{ marginTop: "-6rem" }}>
    <div className="container">
        <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <h2 className="section-heading text-uppercase">Alumni Benefits</h2>
            <h3 className="card-title text-muted">
                As a member of the global AMU alumni network, you have access to a variety of exclusive services and benefits.
            </h3>
        </motion.div>
        <motion.div
            className="row"
            initial={{ x: "100%" }}
            animate={{ x: "-100%" }}
            transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
            }}
        >
            {[
                { image: careerSupportImg, title: "Career Support", text: "Get assistance with your career goals and job opportunities." },
                { image: researchAccessImg, title: "Research Access", text: "Access to exclusive research papers and resources." },
                { image: workshopsImg, title: "Workshops", text: "Participate in skill-building workshops and training." },
                { image: networkingImg, title: "Networking", text: "Connect with fellow alumni and industry leaders." }
            ].map((benefit, index) => (
                <div className="col-lg-3 col-sm-6 mb-4" key={index}>
                    <div className="card h-100 benefit-card" style={{ padding: "1.5rem" }}>
                        <div className="card-body text-center">
                            <img
                                src={benefit.image}
                                alt={benefit.title}
                                className="img-fluid mb-3"
                                style={{ maxHeight: "120px", objectFit: "cover" }} // Increased maxHeight
                            />
                            <h4 className="card-title">{benefit.title}</h4>
                            <p className="card-text">{benefit.text}</p>
                        </div>
                    </div>
                </div>
            ))}
        </motion.div>
    </div>
</section>
            <section className="py-5 bg-light" id="university-description" style={{ marginTop: "-4rem" }}>
                <div className="container">
                    <div className="row align-items-center">
                        <motion.div
                            className="col-lg-6 mb-4"
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 1 }}
                        >
                            <img
                                src={universityImage}
                                alt="University"
                                className="img-fluid rounded shadow"
                            />
                        </motion.div>
                        <motion.div
                            className="col-lg-6"
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 1 }}
                        >
                                 <h2 className="section-heading text-uppercase">About Our University</h2>
                            <p className="text-muted">
                            Arba Minch University (AMU) is a prominent national research university located in Arba Minch, 
                            in the South Ethiopia Regional State. Established in September 1986 as the Arba Minch Water Technology Institute (AWTI),
                             it was officially inaugurated as a full-fledged university in June 2004.
                            </p>
                            <p className="text-muted">
                            AMU offers a wide range of academic programs, including 75 undergraduate, 140 master's, and 34 PhD programs. 
                            The university comprises three institutes, six colleges, and four schools spread across six campuses: 
                            Main Campus, Abaya Campus, Chamo Campus, Kulfo Campus, Nech Sar Campus, and Sawla Campus.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Other sections remain unchanged */}
        </div>
    );
};

export default Home;