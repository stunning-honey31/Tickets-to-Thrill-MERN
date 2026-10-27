export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="text-center" style={{ padding: '80px 0', color: 'var(--text-faint)' }}>
      {label}
    </div>
  );
}
