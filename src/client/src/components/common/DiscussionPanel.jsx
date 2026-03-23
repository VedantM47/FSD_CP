import React, { useState, useEffect, useRef } from 'react';
import { joinHackathonRoom, sendMessage, onReceiveMessage, offReceiveMessage } from '../../services/socket';
import '../../styles/discussion.css';

const DiscussionPanel = ({ hackathonId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messageCallbackRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join room and listen for messages
  useEffect(() => {
    if (!hackathonId) return;

    setLoading(true);
    joinHackathonRoom(hackathonId);
    setLoading(false);

    // Create callback function
    const handleMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    messageCallbackRef.current = handleMessage;
    onReceiveMessage(handleMessage);

    return () => {
      if (messageCallbackRef.current) {
        offReceiveMessage(messageCallbackRef.current);
      }
    };
  }, [hackathonId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      return;
    }

    // Send message to backend
    sendMessage(hackathonId, newMessage.trim());
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach((msg) => {
      const date = formatDate(msg.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const groupedMessages = groupMessagesByDate();

  return (
    <div className="discussion-panel">
      {/* Header */}
      <div className="discussion-header">
        <h3>Discussion</h3>
        <p className="discussion-subtitle">Chat with participants</p>
      </div>

      {/* Messages Container */}
      <div className="discussion-messages">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Divider */}
            <div className="discussion-date-divider">
              <span>{date}</span>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message) => {
              const isOwnMessage = currentUser?._id === message.senderId?._id;
              const userRole = message.senderId?.systemRole || 'user';
              const roleClass = `role-${userRole}`;
              return (
                <div
                  key={message._id}
                  className={`discussion-message ${isOwnMessage ? 'own-message' : 'other-message'} ${roleClass}`}
                >
                  <div className="message-avatar">
                    <div className={`avatar-placeholder ${roleClass}`}>
                      {message.senderId?.fullName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">
                        {message.senderId?.fullName || 'Anonymous'}
                        {userRole !== 'user' && <span className="user-role-badge">{userRole}</span>}
                      </span>
                      <span className="message-time">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                    <p className="message-text">{message.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="discussion-input-form">
        <input
          type="text"
          placeholder="Share your thoughts..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="discussion-input"
          disabled={loading}
        />
        <button
          type="submit"
          className="discussion-send-btn"
          disabled={!newMessage.trim() || loading}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M2.5 10L17.5 2.5M17.5 17.5L10 10M17.5 17.5L2.5 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default DiscussionPanel;
