import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { baseUrl } from '../utils/globalurl';
import aboutImage from '../assets/uploads/amu pic.jpg'; // Replace with the actual path to your image
import aboutImg from '../assets/uploads/amuu.jpg'; // Replace with the actual path to your image
import campusImage from '../assets/uploads/gc.jpg'; // Add another image for the campus
import researchImage from '../assets/uploads/reseach.jpg'; // Add another image for research

const About = () => {
  const [system, setSystem] = useState([]);

  useEffect(() => {
    axios.get(`${baseUrl}auth/settings`)
      .then((res) => {
        setSystem(res.data);
        console.log(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <>
      {/* Hero Section */}
      <header className="masthead" style={{ backgroundSize: 'cover', backgroundPosition: 'center', height: '70vh' }}>
        <div className="container h-100 d-flex align-items-center justify-content-center">
          <div className="text-center" style={{ borderRadius: '10px', padding: '30px' }}>
            <h1 className="text-uppercase text-white font-weight-bold">Welcome to Arba Minch University</h1>
            <hr className="divider my-4" />
            <p className="text-white-75 text-light mb-0">Empowering Generations Through Education, Research, and Innovation</p>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section className="page-section py-5">
        <div className="container">
          <div className="row align-items-center">
            {/* Image Section */}
            <div className="col-lg-6 mb-4">
              <img src={aboutImg} alt="About AMU" className="img-fluid rounded shadow" />
            </div>

            {/* Text Section */}
            <div className="col-lg-6">
              <h2 className="text-primary mb-4">About Arba Minch University</h2>
              <p>
                Arba Minch University (AMU) is a prominent national research university located in Arba Minch, 
                in the South Ethiopia Regional State. Established in September 1986 as the Arba Minch Water Technology Institute (AWTI),
                it was officially inaugurated as a full-fledged university in June 2004.
              </p>
              <p>
                AMU offers a wide range of academic programs, including 75 undergraduate, 140 master's, and 34 PhD programs. 
                The university comprises three institutes, six colleges, and four schools spread across six campuses: 
                Main Campus, Abaya Campus, Chamo Campus, Kulfo Campus, Nech Sar Campus, and Sawla Campus.
              </p>
              {/* <a href="/programs" className="btn btn-primary mt-3">Explore Our Programs</a> */}
            </div>
          </div>
        </div>
      </section>

      {/* Mission and Vision Section */}
      {system.length > 0 && (
        <section className="page-section bg-light py-5">
          <div className="container">
            <h2 className="text-center text-secondary mb-4">Our Mission and Vision</h2>
            <p className="text-center">
              {system[0]?.description || 'Arba Minch University is committed to excellence in education, research, and community service.'}
            </p>
          </div>
        </section>
      )}

      {/* Campus Life Section */}
      <section className="page-section py-5">
        <div className="container">
          <h2 className="text-center text-primary mb-4">Campus Life</h2>
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4">
              <img src={campusImage} alt="Campus Life" className="img-fluid rounded shadow" />
            </div>
            <div className="col-lg-6">
              <p>
                Arba Minch University provides a vibrant campus life with state-of-the-art facilities, including modern classrooms, libraries, laboratories, and recreational areas. 
                Students enjoy a supportive environment that fosters academic excellence and personal growth.
              </p>
              <p>
                The university also hosts various cultural, social, and sports events, creating a dynamic and inclusive community for students and staff.
              </p>
              {/* <a href="/campus-life" className="btn btn-outline-primary mt-3">Discover Campus Life</a> */}
            </div>
          </div>
        </div>
      </section>

      {/* Research and Innovation Section */}
      <section className="page-section bg-light py-5">
        <div className="container">
          <h2 className="text-center text-secondary mb-4">Research and Innovation</h2>
          <div className="row align-items-center">
            <div className="col-lg-6">
              <p>
                Arba Minch University is at the forefront of research and innovation, addressing critical challenges in water technology, agriculture, health, and engineering. 
                The university collaborates with national and international partners to drive impactful research and promote sustainable development.
              </p>
              <p>
                With dedicated research centers and highly qualified faculty, AMU continues to make significant contributions to science and technology.
              </p>
              {/* <a href="/research" className="btn btn-outline-secondary mt-3">Learn More About Research</a> */}
            </div>
            <div className="col-lg-6">
              <img src={researchImage} alt="Research and Innovation" className="img-fluid rounded shadow" />
            </div>
          </div>
        </div>
      </section>

      {/* Alumni Testimonials Section */}
      <section className="page-section py-5">
        <div className="container">
          <h2 className="text-center text-primary mb-4">What Our Alumni Say</h2>
          <div className="row">
            <div className="col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <p>"AMU provided me with the skills and knowledge to excel in my career. The faculty and facilities are world-class!"</p>
                  <h6 className="text-primary">- Meseret Tsega, Class of 2017</h6>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <p>"The vibrant campus life and supportive environment made my time at AMU unforgettable."</p>
                  <h6 className="text-primary">- Hawas Abu, Class of 2017</h6>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <p>"AMU's research opportunities helped me grow academically and professionally."</p>
                  <h6 className="text-primary">- Demse Cherinet, Class of 2017</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="page-section bg-light py-5">
        <div className="container text-center">
          <h2 className="text-primary mb-4">Contact Us</h2>
          <p>
            For more information about Arba Minch University, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> info@amu.edu.et <br />
            <strong>Phone:</strong> +251-123-456-789
          </p>
          <p>
            Visit our website: <a href="https://www.amu.edu.et" target="_blank" rel="noopener noreferrer">www.amu.edu.et</a>
          </p>
        </div>
      </section>
    </>
  );
};

export default About;