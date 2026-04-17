function StatsCard({ label, value, highlight, accent }) {
  const classes = [
    'stat-card',
    highlight === 'blue' ? 'highlight-blue' : '',
    accent === 'yellow' ? 'accent-yellow' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <h2>{value}</h2>
      <p>{label}</p>
    </div>
  );
}

export default StatsCard;