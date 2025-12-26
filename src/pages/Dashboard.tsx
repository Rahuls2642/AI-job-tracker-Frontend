import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import ResumePage from "./Resume";

type Overview = {
  totalJobs: number;
  jobsByStatus: Record<string, number>;
  averageATSScore: number;
  averageInterviewScore: number;
  answersPracticed: number;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const session = await import("../lib/supabase").then(m =>
          m.supabase.auth.getSession()
        );

        const token = session.data.session?.access_token;
        if (!token) return;

        const result = await apiFetch("/reports/overview", token);
        setData(result);
      } catch {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading)
    return (
      <p className="p-10 text-sm font-medium text-slate-400 animate-pulse">
        Loading dashboard…
      </p>
    );

  if (error)
    return (
      <p className="p-10 text-red-500 font-semibold">
        {error}
      </p>
    );

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#F4F7FE] px-6 py-8">
      <div className="max-w-[1600px] mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1B2559] tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 font-medium">
              Welcome back,{" "}
              <span className="text-[#4318FF]">
                {user?.email?.split("@")[0] || "User"}
              </span>
            </p>
          </div>

          <div className="hidden md:flex items-center bg-white rounded-full px-4 py-2 shadow-sm w-72">
            <span className="text-slate-400 mr-2">🔍</span>
            <input
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <DashboardCard title="Total Jobs" value={data.totalJobs} icon="💼" />
          <DashboardCard
            title="ATS Score"
            value={`${data.averageATSScore}%`}
            icon="📈"
            isBlue
          />
          <DashboardCard
            title="Interview Score"
            value={data.averageInterviewScore}
            icon="🎯"
          />
          <DashboardCard
            title="Answers Practiced"
            value={data.answersPracticed}
            icon="💬"
          />
        </div>

        {/* Lower section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Jobs by Status */}
          <div className="bg-white rounded-[28px] p-8 shadow-sm shadow-indigo-100/60">
            <h2 className="text-lg font-bold text-[#1B2559] mb-6">
              Jobs by Status
            </h2>

            <ul className="space-y-5">
              {Object.entries(data.jobsByStatus).map(([status, count]) => (
                <li key={status}>
                  <div className="flex justify-between mb-2">
                    <span className="capitalize text-slate-500 font-medium">
                      {status}
                    </span>
                    <span className="font-bold text-[#1B2559]">
                      {count}
                    </span>
                  </div>

                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4318FF] rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (count / data.totalJobs) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Coach Workspace */}
          <div className="xl:col-span-2 bg-white rounded-[28px] p-8 shadow-sm shadow-indigo-100/60">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#1B2559]">
                Coach Workspace
              </h2>
              <button className="text-xs font-bold text-[#4318FF] bg-indigo-50 px-4 py-2 rounded-full">
                View All
              </button>
            </div>

            <ResumePage />
          </div>
        </div>
      </div>
    </div>
  );
}

/* Stat Card */
function DashboardCard({
  title,
  value,
  icon,
  isBlue = false,
}: {
  title: string;
  value: any;
  icon: string;
  isBlue?: boolean;
}) {
  return (
    <div
      className={`rounded-[24px] p-6 flex items-center gap-4 transition-transform hover:scale-[1.02]
      ${
        isBlue
          ? "bg-[#4318FF] text-white shadow-lg shadow-indigo-200"
          : "bg-white text-[#1B2559] shadow-sm shadow-indigo-100/50"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl
        ${isBlue ? "bg-white/20" : "bg-[#F4F7FE] text-[#4318FF]"}`}
      >
        {icon}
      </div>

      <div>
        <p
          className={`text-sm font-medium ${
            isBlue ? "text-indigo-100" : "text-slate-400"
          }`}
        >
          {title}
        </p>
        <p className="text-2xl font-extrabold tracking-tight">
          {value}
        </p>
      </div>
    </div>
  );
}
