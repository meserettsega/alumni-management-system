import React from 'react';
import { motion } from 'framer-motion';

const FAQPostEvent = () => {
  return (
    <motion.div
      className="container my-5 pt-5"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-center mb-4">How Do I Post an Event?</h1>
      <p className="lead">
        To post an event, go to the <strong>"Events"</strong> section in the dashboard. Click on the <strong>"Post Event"</strong> button and provide the following details:
      </p>
      <ul>
        <li>Event Title</li>
        <li>Date</li>
        <li>Location</li>
        <li>Description</li>
      </ul>
      <p>After submitting the form, the event will be reviewed and published.</p>
    </motion.div>
  );
};

export default FAQPostEvent;