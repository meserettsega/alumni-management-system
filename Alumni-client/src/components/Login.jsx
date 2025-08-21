import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from "react-icons/fa"; 
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '../AuthContext';
import { useUser } from '../UserContext';
import { baseUrl } from '../utils/globalurl';
import '../styles/Login.css';

const Login = () => {
    const { login } = useAuth();
    const { setCurrentUser } = useUser();

    const [values, setValues] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [cooldown, setCooldown] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.action === 'navtologin') {
            toast.info('Please Login Now');
        }
    }, [location.state]);

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [cooldown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors(null);

        if (cooldown > 0) {
            toast.error(`Too many failed attempts. Please wait ${cooldown} seconds.`);
            setIsLoading(false);
            return;
        }

        try {
            const res = await axios.post(`${baseUrl}auth/login`, values, {
                withCredentials: true,
            });

            if (res.data.loginStatus) {
                if (res.data.userType === 'alumnus' && !res.data.isVerified) {
                    toast.info('Your account is awaiting admin verification. Please wait for approval.');
                } else {
                    const userData = {
                        id: res.data.userId,
                        name: res.data.userName,
                        type: res.data.userType,
                        email: res.data.email,
                        alumnus_id: res.data.alumnus_id,
                    };

                    localStorage.setItem("current_user", JSON.stringify(userData));
                    localStorage.setItem("user_id", res.data.userId);
                    localStorage.setItem("user_type", res.data.userType);
                    localStorage.setItem("user_name", res.data.userName);
                    localStorage.setItem("alumnus_id", res.data.alumnus_id);

                    setCurrentUser(userData);
                    login(userData);

                    navigate('/', { state: { action: 'homelogin' } });
                }
            } else {
                if (res.data.Error?.toLowerCase().includes("deactivated")) {
                    toast.error("Your account has been deactivated by the admin. Please contact the administrator.");
                } else {
                    setErrors(res.data.Error || 'Login failed. Please try again.');
                    toast.error(res.data.Error || 'Login failed. Please try again.');
                }

                setLoginAttempts(prev => {
                    const next = prev + 1;
                    if (next >= 3) {
                        setCooldown(10); // 10 seconds
                        return 0;
                    }
                    return next;
                });
            }
        } catch (err) {
            console.error(err);
            setErrors('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <ToastContainer position="top-center" />
            <header className="masthead">
                <div className="container-fluid h-100">
                    <div className="row h-100 align-items-center justify-content-center text-center">
                        <div className="col-lg-8 align-self-end mb-4 page-title">
                            <h3 className="text-white fade-in">Login Account</h3>
                            <hr className="divider my-4 slide-in" />
                        </div>
                    </div>
                </div>
            </header>
            <div className="container mt-3 pt-2">
                <div className="col-lg-12">
                    <div className="card mb-4 shadow-lg scale-in">
                        <div className="card-body">
                            <div className="row justify-content-center">
                                <div className="container-fluid col-lg-6 col-md-8 col-sm-10">
                                    <form onSubmit={handleSubmit} id="login-frm">
                                        <div className="form-group">
                                            <label htmlFor="email" className="control-label">Email</label>
                                            <input
                                                onChange={(e) => setValues({ ...values, email: e.target.value })}
                                                type="email"
                                                id="email"
                                                name="email"
                                                required
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="password" className="control-label">Password</label>
                                            <div style={{ position: "relative" }}>
                                                <input
                                                    onChange={(e) => setValues({ ...values, password: e.target.value })}
                                                    type={showPassword ? "text" : "password"}
                                                    id="password"
                                                    name="password"
                                                    required
                                                    className="form-control"
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
                                            {errors && <div className="text-danger mt-2">{errors}</div>}
                                            <small className="mt-2 text-muted">
                                                Don&apos;t have an account? <Link to="/signup">Sign up here</Link>
                                                <br />
                                                <Link to="/forgot-password">Forgot Password?</Link>
                                            </small>
                                        </div>
                                        <hr className="divider" />
                                        <div className="row justify-content-center">
                                            <div className="col-md-6 text-center">
                                                <button
                                                    type="submit"
                                                    className="btn btn-info btn-block btn-animated"
                                                    disabled={isLoading || cooldown > 0}
                                                >
                                                    {cooldown > 0
                                                        ? `Wait ${cooldown}s`
                                                        : isLoading
                                                            ? 'Logging in...'
                                                            : 'Login'}
                                                </button>
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
    );
};

export default Login;
