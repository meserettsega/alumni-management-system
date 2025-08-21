import React from 'react';
import { motion } from 'framer-motion';

const FAQContactSupport = () => {
  return (
    <motion.div
      className="container my-5"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-center mb-4 pt-5">How Can I Contact Support?</h1>
      <p className="lead">
        You can contact support by:
      </p>
      <ul>
        <li>Emailing us at <a href="mailto:mail@amu.edu.et">mail@amu.edu.et</a></li>
        <li>Calling us at <strong>+251-46881-4986</strong></li>
      </ul>
      <p>Our support team is available to assist you with any issues or questions.</p>
    </motion.div>
  );
};

export default FAQContactSupport;