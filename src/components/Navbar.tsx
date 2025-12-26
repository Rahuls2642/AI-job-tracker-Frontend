import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <nav className="bg-black text-white p-4 flex gap-4">
      <Link to="/">Dashboard</Link>
      <Link to="/resume">Resume</Link>
      <Link to="/jobs">Jobs</Link>
      <Link to="/reports" className="underline">
  Reports
</Link>
      <button onClick={logout} className="ml-auto">
        Logout
      </button>
    </nav>
  );
}
