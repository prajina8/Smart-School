import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
    <p className="text-6xl font-bold text-brand-600 mb-2">404</p>
    <p className="text-slate-500 mb-4">Page not found</p>
    <Link to="/" className="btn-primary">
      Back to dashboard
    </Link>
  </div>
);

export default NotFound;
