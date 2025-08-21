import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import defaultavatar from "../assets/uploads/defaultavatar.jpg";
import { baseUrl } from '../utils/globalurl';
import { motion } from 'framer-motion';

const AlumniList = () => {
    const [alumniList, setAlumniList] = useState([]);
    const [filteredAlumni, setFilteredAlumni] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(3); // Show only 3 alumni initially
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch alumni list from the server
    useEffect(() => {
        setIsLoading(true);
        axios.get(`${baseUrl}auth/alumni_list`)
            .then((res) => {
                // Filter only verified alumni
                const verifiedAlumni = res.data.filter(alumnus => alumnus.status === 1); // Assuming `status === 1` means verified
                setAlumniList(verifiedAlumni);
                setFilteredAlumni(verifiedAlumni); // Initialize filtered list
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching alumni list:", err);
                setError("Failed to fetch alumni data. Please try again later.");
                setIsLoading(false);
            });
    }, []);

    // Debounce function for search input
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    };

    // Handle search input change with debounce
    const handleSearchInputChange = debounce((e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (alumniList.length > 0) {
            const filteredList = alumniList.filter(list =>
                list.name.toLowerCase().includes(query.toLowerCase()) ||
                list.course.toLowerCase().includes(query.toLowerCase()) ||
                list.batch.toString().includes(query)
            );
            setFilteredAlumni(filteredList);
        }
    }, 300); // 300ms debounce delay

    // Show more alumni on button click
    const handleShowMore = () => {
        setVisibleCount(prevCount => prevCount + 3); // Show 3 more alumni on each click
    };

    return (
        <>
            <header className="masthead">
                <div className="container-fluid h-100">
                    <div className="row h-100 align-items-center justify-content-center text-center">
                        <div className="col-lg-8 align-self-end mb-4 page-title">
                            <h3 className="text-white">Alumnus/Alumnae List</h3>
                            <hr className="divider my-4" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mt-4">
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-8">
                                <div className="input-group mb-3">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text" id="filter-field">
                                            <FaSearch />
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="filter"
                                        placeholder="Filter name, Department, batch"
                                        aria-label="Filter"
                                        aria-describedby="filter-field"
                                        onChange={handleSearchInputChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid mt-3 pt-2">
                {isLoading ? (
                    <div className="d-flex justify-content-center align-items-center">
                        <p>Loading...</p>
                    </div>
                ) : error ? (
                    <div className="d-flex justify-content-center align-items-center">
                        <p className="text-danger">{error}</p>
                    </div>
                ) : filteredAlumni.length > 0 ? (
                    <>
                        <div className="row">
                            {filteredAlumni.slice(0, visibleCount).map((a, index) => (
                                <motion.div
                                    className="col-md-4 mb-4"
                                    key={index}
                                    initial={{ opacity: 0, x: -100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="card h-100 shadow-sm">
                                        <center>
                                            {a.avatar ? (
                                                <img
                                                    src={`${baseUrl}${a.avatar}`}
                                                    className="card-img-top img-fluid alimg"
                                                    alt="avatar"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultavatar; }}
                                                />
                                            ) : (
                                                <img
                                                    src={defaultavatar}
                                                    className="card-img-top img-fluid alimg"
                                                    alt="avatar"
                                                />
                                            )}
                                        </center>
                                        <div className="card-body">
                                            <p className="card-text">
                                                <strong>Name:</strong> {a.name}
                                            </p>
                                            <p className="card-text">
                                                <strong>Email:</strong> {a.email}
                                            </p>
                                            {a.course && (
                                                <p className="card-text">
                                                    <strong>Department:</strong> {a.course}
                                                </p>
                                            )}
                                            {a.batch !== "0000" && (
                                                <p className="card-text">
                                                    <strong>Batch:</strong> {a.batch}
                                                </p>
                                            )}
                                            {a.connected_to && (
                                                <p className="card-text">
                                                    <strong>Currently working in (statuse):</strong> {a.connected_to}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        {visibleCount < filteredAlumni.length && (
                            <div className="text-center mt-4">
                                <motion.button
                                    className="btn btn-primary btn-lg shadow rounded-pill text-uppercase mb-4 font-size-0.5rem"
                                    onClick={handleShowMore}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    Show More
                                </motion.button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="d-flex flex-column justify-content-center align-items-center">
                        <h4 className="text-info-emphasis">No Data Available</h4>
                    </div>
                )}
            </div>
        </>
    );
};

export default AlumniList;