import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, LayoutDashboard, Briefcase, BarChart3, Menu } from "lucide-react"; // Using Lucide for icons

export default function Navbar() {
  const { logout } = useAuth();
  const location = useLocation();

  const navLinkClass = (path: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      location.pathname === path
        ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]"
        : "text-zinc-400 hover:text-white hover:bg-white/5"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          
         
          <div className="flex items-center gap-8">
            <p className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Clario
            </p>

            
            <div className="hidden md:flex items-center gap-2">
              <Link to="/dashboard" className={navLinkClass("/dashboard")}>
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <Link to="/jobs" className={navLinkClass("/jobs")}>
                <Briefcase size={18} />
                Jobs
              </Link>
              <Link to="/reports" className={navLinkClass("/reports")}>
                <BarChart3 size={18} />
                Reports
              </Link>
            </div>
          </div>

         
          <div className="flex items-center gap-4">
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors px-3 py-2"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
            
           
            <button className="md:hidden p-2 text-zinc-400">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}