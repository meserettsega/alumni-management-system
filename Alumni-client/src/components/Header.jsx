import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaAngleDown, FaCog, FaPowerOff, FaEnvelope, FaBars } from 'react-icons/fa';
import { MdDashboard } from "react-icons/md";
import logo from "../assets/uploads/logoamu.gif";
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import axios from 'axios';
import { Fade as Hamburger } from 'hamburger-react';
import { baseUrl } from '../utils/globalurl';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { logout, isLoggedIn, isAdmin } = useAuth();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [name, setName] = useState();
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const navRef = useRef(null);

    useEffect(() => {
        const user_name = localStorage.getItem("user_name");
        setName(user_name);
    }, [location.state]);

    useEffect(() => {
        if (isLoggedIn) {
            axios.get(`${baseUrl}messages/unread`)
                .then((res) => {
                    setMessages(res.data);
                    setUnreadCount(res.data.length);
                })
                .catch((err) => console.log(err));
        }
    }, [isLoggedIn]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        axios.post(`${baseUrl}auth/logout`)
            .then(() => {
                navigate("/", { state: { action: "homelogout" } });
                localStorage.clear();
                logout();
            })
            .catch((err) => console.log(err));
    };

    return (
        <>
            {/* Internal CSS for active link styling */}
            <style>
                {`
                .nav-item .nav-link {
                    position: relative;
                    color: #fff;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                .nav-item .nav-link:hover {
                    color: #007bff;
                }

                .nav-item.active .nav-link {
                    color: #007bff;
                }

                .nav-item.active .nav-link::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: -5px;
                    width: 100%;
                    height: 2px;
                    background-color: #007bff;
                    transform: scaleX(0);
                    transform-origin: right;
                    transition: transform 0.3s ease;
                }

                .nav-item.active .nav-link:hover::after,
                .nav-item.active .nav-link::after {
                    transform: scaleX(1);
                    transform-origin: left;
                }
                `}
            </style>

            <nav className={`navbar navbar-expand-lg navbar-${theme} fixed-top`} id="mainNav">
                <div className="container">
                    <Link className="navbar-brand js-scroll-trigger d-flex align-items-center gap-2" to="/">
                 <img src={logo} className='logoimg' alt="logo" style={{ height: '60px' }} />
                 <span className="text-white fw-bold fs-5">AMU ALUMNI</span>
                   </Link>

                    <button className="navbar-toggler navbar-light" type="button">
                        <Hamburger hideOutline={false} rounded color="#FFFFFF" toggled={isMenuOpen} toggle={setIsMenuOpen} />
                    </button>
                    <div ref={navRef} className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarResponsive">
                        <ul className="navbar-nav ml-auto my-2 my-lg-0">
                            <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                                <Link onClick={toggleMenu} className="nav-link js-scroll-trigger" to="/">Home</Link>
                            </li>
                            <li className={`nav-item ${location.pathname === '/alumni' ? 'active' : ''}`}>
                                <Link onClick={toggleMenu} className="nav-link js-scroll-trigger" to="/alumni">Alumni</Link>
                            </li>
                            {isLoggedIn && !isAdmin && (
                                <li className={`nav-item ${location.pathname === '/donations' ? 'active' : ''}`}>
                                    <Link onClick={toggleMenu} className="nav-link js-scroll-trigger" to="/donations">Donation</Link>
                                </li>
                            )}
                            <li className={`nav-item ${location.pathname === '/jobs' ? 'active' : ''}`}>
                                <Link onClick={toggleMenu} className="nav-link js-scroll-trigger" to="/jobs">Jobs</Link>
                            </li>
                            <li className={`nav-item ${location.pathname === '/forums' ? 'active' : ''}`}>
                                <Link onClick={toggleMenu} className="nav-link js-scroll-trigger" to="/forums">Forums</Link>
                            </li>
                            <li className={`nav-item ${location.pathname === '/events' ? 'active' : ''}`}>
                                <Link onClick={toggleMenu} className="nav-link js-scroll-trigger" to="/events">Events</Link>
                            </li>
                            
                            {isLoggedIn && !isAdmin &&(
                               <li className={`nav-item ${location.pathname === '/messages' ? 'active' : ''}`}>
                                     <Link onClick={toggleMenu} className="nav-link js-scroll-trigger" to="/messages">
                                  <FaEnvelope /> Messages {unreadCount > 0 && <span className="badge badge-danger">{unreadCount}</span>}
                                     </Link>
                                 </li>
                                   )}
                                   <li className={`nav-item ${location.pathname === '/about' ? 'active' : ''}`}>
                                <Link onClick={toggleMenu} className="nav-link js-scroll-trigger" to="/about">About</Link>
                                  </li>
                            {isLoggedIn ? (
                                <li className="nav-item dropdown">
                                    <Link className="nav-link " role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        {name} <FaAngleDown />
                                    </Link>
                                    <ul className="dropdown-menu">
                                        {isAdmin && <li><Link onClick={toggleMenu} className="dropdown-item" to="/dashboard"><MdDashboard /> Dashboard</Link></li>}
                                        {!isAdmin && <li><Link onClick={toggleMenu} className="dropdown-item" to="/account"><FaCog /> Manage Account</Link></li>}
                                        <li><hr className="dropdown-divider" /></li>
                                        <li><button className="dropdown-item" onClick={handleLogout}><FaPowerOff /> Logout</button></li>
                                    </ul>
                                </li>
                            ) : (
                                <li className={`nav-item ${location.pathname === '/login' ? 'active' : ''}`}>
                                    <Link onClick={toggleMenu} className="nav-link js-scroll-trigger" to="/login">Login</Link>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Header;