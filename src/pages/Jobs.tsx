import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { apiFetch } from "../lib/api";
import { Plus, Trash2, ExternalLink, Building2, Briefcase } from "lucide-react";

type Job = {
  id: string;
  company: string;
  role: string;
  status: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const loadJobs = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const result = await apiFetch("/jobs", token);
    setJobs(result);
  };

  useEffect(() => { loadJobs(); }, []);

  const createJob = async () => {
    if (!company || !role || !description) return;
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      await apiFetch("/jobs", token, {
        method: "POST",
        body: JSON.stringify({ company, role, description }),
      });
      setCompany(""); setRole(""); setDescription("");
      loadJobs();
    } finally { setLoading(false); }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      await apiFetch(`/jobs/${jobId}`, token, { method: "DELETE" });
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (err) { console.error("Failed to delete job", err); }
  };

  return (
   
    <div className="h-[calc(100vh-64px)] bg-slate-50 text-slate-900 flex flex-col overflow-hidden">
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col min-h-0">
        
        <header className="mb-6 flex-shrink-0">
          <h1 className="text-3xl font-extrabold tracking-tight">Job Tracker</h1>
          <p className="text-slate-500">Track and manage applications in real-time.</p>
        </header>

        <div className="flex flex-1 gap-8 min-h-0">
       
          <aside className="w-80 flex-shrink-0 overflow-y-auto pr-2">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Plus size={18} className="text-indigo-600" />
                Add Job
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Company</label>
                  <input
                    placeholder="Company name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                  <input
                    placeholder="Job title"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                  <textarea
                    placeholder="Details..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <button
                  onClick={createJob}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Create Job"}
                </button>
              </div>
            </div>
          </aside>

         
          <main className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h2 className="font-bold flex items-center gap-2">
                <Briefcase size={18} className="text-slate-400" />
                Applications
              </h2>
              <span className="text-xs font-bold px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-500">
                {jobs.length} Total
              </span>
            </div>

            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {jobs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                  <p>No applications yet.</p>
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-white transition-colors">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 leading-none">{job.role}</h3>
                        <p className="text-sm text-slate-500 mt-1">{job.company}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                        {job.status}
                      </span>
                      <Link to={`/jobs/${job.id}`} className="p-2 text-slate-400 hover:text-indigo-600">
                        <ExternalLink size={18} />
                      </Link>
                      <button onClick={() => deleteJob(job.id)} className="p-2 text-slate-400 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}