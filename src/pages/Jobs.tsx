import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { apiFetch } from "../lib/api";

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

  useEffect(() => {
    loadJobs();
  }, []);

  const createJob = async () => {
    if (!company || !role || !description) return;

    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;

      await apiFetch("/jobs", token, {
        method: "POST",
        body: JSON.stringify({
          company,
          role,
          description,
        }),
      });

      setCompany("");
      setRole("");
      setDescription("");
      loadJobs();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Jobs</h1>

      {/* Create job */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-3">Add Job</h2>

        <input
          placeholder="Company"
          className="border p-2 w-full mb-2"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />

        <input
          placeholder="Role"
          className="border p-2 w-full mb-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <textarea
          placeholder="Job description"
          className="border p-2 w-full mb-3"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={createJob}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Create Job"}
        </button>
      </div>

      {/* Jobs list */}
      <div>
        <h2 className="font-semibold mb-3">Your Jobs</h2>

        {jobs.length === 0 && (
          <p className="text-sm text-gray-500">
            No jobs added yet.
          </p>
        )}

        <ul className="space-y-2">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="bg-gray-100 p-3 rounded flex justify-between"
            >
              <div>
                <p className="font-medium">
                  {job.role} @ {job.company}
                </p>
                <p className="text-sm text-gray-600 capitalize">
                  Status: {job.status}
                </p>
              </div>

              <Link
                to={`/jobs/${job.id}`}
                className="text-sm underline"
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
