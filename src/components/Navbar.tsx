import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const { logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);


  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const navLinkClass = (path: string) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition
     ${
       location.pathname === path
         ? "bg-slate-900 text-white"
         : "text-slate-400 hover:text-white hover:bg-slate-900/50"
     }`;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full
  bg-white
  border-b border-slate-200
">

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
           
            <div className="flex items-center gap-6">
              <span className="text-sm font-semibold tracking-tight text-black">
                Interview Master
              </span>

              <div className="hidden md:flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className={navLinkClass("/dashboard")}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <Link to="/jobs" className={navLinkClass("/jobs")}>
                  <Briefcase size={16} />
                  Manage jobs
                </Link>
                <Link to="/resume" className={navLinkClass("/resume")}>
                  <Briefcase size={16} />
                  Resume
                </Link>
                <Link
                  to="/reports"
                  className={navLinkClass("/reports")}
                >
                  <BarChart3 size={16} />
                  Reports
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={logout}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 transition"
              >
                <LogOut size={16} />
                Logout
              </button>

           
              <button
                onClick={() => setOpen(true)}
                className="md:hidden p-2 text-slate-400 hover:text-white"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
         
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

        
          <div className="absolute right-0 top-0 h-full w-[80%] max-w-xs bg-slate-950 border-l border-slate-800 flex flex-col">
            
            <div className="flex items-center justify-between px-4 h-14 border-b border-slate-800">
              <span className="text-sm font-semibold text-white">
                Interview Master
              </span>
              <button
                onClick={() => setOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className={navLinkClass("/dashboard")}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>

              <Link
                to="/jobs"
                onClick={() => setOpen(false)}
                className={navLinkClass("/jobs")}
              >
                <Briefcase size={16} />
                Manage jobs
              </Link>
               <Link
                to="/resume"
                onClick={() => setOpen(false)}
                className={navLinkClass("/resume")}
              >
                <Briefcase size={16} />
                Resume
              </Link>

              <Link
                to="/reports"
                onClick={() => setOpen(false)}
                className={navLinkClass("/reports")}
              >
                <BarChart3 size={16} />
                Reports
              </Link>
            </div>

          
            <div className="border-t border-slate-800 p-3">
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
