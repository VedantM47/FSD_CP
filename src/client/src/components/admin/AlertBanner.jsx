function AlertBanner({ message }) {
  return (
    <div className="alert-banner">
      <svg className="alert-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 6V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="10" cy="14" r="1" fill="currentColor"/>
      </svg>
      <span className="alert-message">{message}</span>
    </div>
  );
}

export default AlertBanner;