import React from 'react';

const FAQ = () => {
  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Frequently Asked Questions</h1>
      <div className="accordion" id="faqAccordion">
        {/* Post Job FAQ */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingPostJob">
            <button
              className="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapsePostJob"
              aria-expanded="true"
              aria-controls="collapsePostJob"
            >
              How can I post a job?
            </button>
          </h2>
          <div
            id="collapsePostJob"
            className="accordion-collapse collapse show"
            aria-labelledby="headingPostJob"
            data-bs-parent="#faqAccordion"
          >
            <div className="accordion-body">
              To post a job, navigate to the "Jobs" section in the dashboard. Click on the "Post Job" button, fill out the required details such as company name, job title, location, and description, and submit the form. Your job posting will be reviewed and published.
            </div>
          </div>
        </div>

        {/* Post Event FAQ */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingPostEvent">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapsePostEvent"
              aria-expanded="false"
              aria-controls="collapsePostEvent"
            >
              How can I post an event?
            </button>
          </h2>
          <div
            id="collapsePostEvent"
            className="accordion-collapse collapse"
            aria-labelledby="headingPostEvent"
            data-bs-parent="#faqAccordion"
          >
            <div className="accordion-body">
              To post an event, go to the "Events" section in the dashboard. Click on the "Post Event" button, provide the event details such as title, date, location, and description, and submit the form. The event will be published after approval.
            </div>
          </div>
        </div>

        {/* Contact Support FAQ */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingContactSupport">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseContactSupport"
              aria-expanded="false"
              aria-controls="collapseContactSupport"
            >
              How can I contact support?
            </button>
          </h2>
          <div
            id="collapseContactSupport"
            className="accordion-collapse collapse"
            aria-labelledby="headingContactSupport"
            data-bs-parent="#faqAccordion"
          >
            <div className="accordion-body">
              You can contact support by emailing us at <a href="mailto:mail@amu.edu.et">mail@amu.edu.et</a> or calling us at +251-46881-4986. Our support team is available to assist you with any issues or questions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;