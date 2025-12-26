import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../index.css"

export default function Navbar() {
  const { logout } = useAuth();

 return (
  <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur border-b border-white/10">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex h-14 items-center">
        {/* Left links */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-white/80 hover:text-white transition"
          >
            Dashboard
          </Link>

          <Link
            to="/jobs"
            className="text-sm font-medium text-white/80 hover:text-white transition"
          >
            Jobs
          </Link>

          <Link
            to="/reports"
            className="text-sm font-medium text-white relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-indigo-500"
          >
            Reports
          </Link>
        </div>

        {/* Right action */}
        <button
          onClick={logout}
          className="ml-auto text-sm font-medium text-white/70 hover:text-white transition px-4 py-1.5 rounded-md hover:bg-white/10"
        >
          Logout
        </button>
      </div>
    </div>
  </nav>
);

}
