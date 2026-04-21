import React from 'react';
import { Link } from 'react-router-dom';

const DiscussionLink = ({ hackathonId, className }) => {
  return (
    <Link
      to={`/hackathon/${hackathonId}/discussion`}
      className={`discussion-link ${className || ''}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span>Discussion</span>
    </Link>
  );
};

export default DiscussionLink;
