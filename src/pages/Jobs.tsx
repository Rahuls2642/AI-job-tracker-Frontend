import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { apiFetch } from "../lib/api";
import { Plus, Trash2, Building2, Briefcase } from "lucide-react";

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
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const loadJobs = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;
    try {
      const result = await apiFetch("/jobs", token);
      setJobs(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const createJob = async () => {
    const newErrors = {
      company: !company.trim(),
      role: !role.trim(),
      description: !description.trim(),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      await apiFetch("/jobs", token, {
        method: "POST",
        body: JSON.stringify({ company, role, description }),
      });

      setCompany("");
      setRole("");
      setDescription("");
      loadJobs();
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

     
      setJobs((prev) => prev.filter((j) => j.id !== jobId));

      await apiFetch(`/jobs/${jobId}`, token, { method: "DELETE" });
    } catch (error) {
      console.error("Failed to delete job:", error);
      loadJobs()
    }
  };

  const getFieldClass = (fieldName: string) => {
    const base = "w-full rounded-xl border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2";
    return errors[fieldName]
      ? `${base} border-red-500 bg-red-50 focus:ring-red-500/20`
      : `${base} border-slate-200 bg-slate-50 focus:bg-white focus:ring-indigo-500/20`;
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-50 text-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6 h-full">
      
        <header className="flex-shrink-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Job Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">Track applications in real-time.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
       
          <aside className="lg:w-80 w-full flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                <Plus size={16} className="text-indigo-600" /> Add Job
              </h2>
              <div className="space-y-4">
                <input
                  placeholder="Company name"
                  className={getFieldClass("company")}
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    if (errors.company) setErrors((prev) => ({ ...prev, company: false }));
                  }}
                />
                <input
                  placeholder="Job title"
                  className={getFieldClass("role")}
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    if (errors.role) setErrors((prev) => ({ ...prev, role: false }));
                  }}
                />
                <textarea
                  placeholder="Details..."
                  rows={3}
                  className={`${getFieldClass("description")} resize-none`}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: false }));
                  }}
                />
                <button
                  onClick={createJob}
                  disabled={loading}
                  className="w-full rounded-xl bg-indigo-600 text-white text-sm font-medium py-2.5 hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Create Job"}
                </button>
              </div>
            </div>
          </aside>

        
          <main className="flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col min-h-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex-shrink-0">
              <h2 className="font-semibold flex items-center gap-2">
                <Briefcase size={16} className="text-slate-400" /> Applications
              </h2>
              <p className="text-xs text-slate-500 mt-1">Track your job applications and practice interviews.</p>
            </div>

            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {jobs.length === 0 ? (
                <div className="py-16 text-center text-sm text-slate-400">No applications yet.</div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{job.role}</h3>
                        <p className="text-xs text-slate-500">{job.company}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-[10px] uppercase tracking-wide font-medium text-indigo-700 bg-indigo-100 px-2 py-1 rounded-md">
                        {job.status}
                      </span>
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-xs text-slate-500 font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition"
                      >
                      RUN ATS AND PRACTICE INTERVIEWS
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteJob(job.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition cursor-pointer"
                      >
                        <Trash2 size={16} />
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