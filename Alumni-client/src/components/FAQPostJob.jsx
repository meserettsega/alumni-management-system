import React from 'react';
import { motion } from 'framer-motion';

const FAQPostJob = () => {
  return (
    <motion.div
      className="container my-5"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-center mb-4 pt-5">How Can I Post a Job?</h1>
      <p className="lead">
        To post a job, navigate to the <strong>"Jobs"</strong> section in the dashboard. Click on the <strong>"Post Job"</strong> button, fill out the required details such as:
      </p>
      <ul>
        <li>Company Name</li>
        <li>Job Title</li>
        <li>Location</li>
        <li>Description</li>
      </ul>
      <p>Once completed, submit the form. Your job posting will be reviewed and published.</p>
    </motion.div>
  );
};

export default FAQPostJob;