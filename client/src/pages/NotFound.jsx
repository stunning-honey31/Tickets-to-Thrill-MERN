import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container section text-center">
      <h1 className="gradient-text" style={{ fontSize: '3rem' }}>404</h1>
      <p>This ride doesn't exist. Let's get you back on track.</p>
      <Link to="/" className="btn btn-primary">Back Home</Link>
    </div>
  );
}
