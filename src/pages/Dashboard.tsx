import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import ResumePage from "./Resume";
import { useNavigate } from "react-router-dom";
import { Briefcase, FileCheck, Mic2, Target, ChevronRight } from "lucide-react";

type Overview = {
  totalJobs: number;
  jobsByStatus: Record<string, number>;
  averageATSScore: number;
  averageInterviewScore: number;
  answersPracticed: number;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const session = await import("../lib/supabase").then((m) =>
          m.supabase.auth.getSession()
        );
        const token = session.data.session?.access_token;
        if (!token) return;

        const res = await apiFetch("/reports/overview", token);
        setData(res);
      } catch {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Skeleton />;
  if (error) return <Error message={error} />;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-[1320px] mx-auto px-6 py-8 space-y-8">

        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Your job search at a glance
            </p>
          </div>

          <button
            onClick={() => navigate("/reports")}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Reports <ChevronRight size={16} />
          </button>
        </header>

       
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric
            label="Jobs tracked"
            value={data.totalJobs}
            icon={<Briefcase size={18} />}
          />
          <Metric
            label="ATS score"
            value={`${data.averageATSScore}%`}
            icon={<FileCheck size={18} />}
          />
          <Metric
            label="Interview score"
            value={data.averageInterviewScore}
            icon={<Mic2 size={18} />}
          />
          <Metric
            label="Answers practiced"
            value={data.answersPracticed}
            icon={<Target size={18} />}
          />
        </section>

        
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-700">
                  Performance overview
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Current ATS vs interview readiness
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-900" />
                  ATS
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Interview
                </span>
              </div>
            </div>

            <LineChart
              ats={data.averageATSScore}
              interview={data.averageInterviewScore}
            />

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-600">
              <div>
                <p className="font-medium text-slate-700">ATS score</p>
                <p>
                  Your resume currently matches job descriptions at{" "}
                  <span className="font-semibold">{data.averageATSScore}%</span>
                  .
                </p>
              </div>

              <div>
                <p className="font-medium text-slate-700">Interview score</p>
                <p>
                  Based on practice answers, your interview readiness is{" "}
                  <span className="font-semibold">
                    {data.averageInterviewScore}/100
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>

       
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
           
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Job pipeline
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Current status of your applications
                </p>
              </div>

              <div className="text-xs font-medium text-slate-500">
                {data.totalJobs} total
              </div>
            </div>

          
            <div className="space-y-4">
              {Object.entries(data.jobsByStatus).map(([status, count]) => {
                const total = data.totalJobs || 1;
                const percent = Math.round((count / total) * 100);

                const colorMap: Record<string, string> = {
                  applied: "bg-indigo-500",
                  screening: "bg-indigo-500",
                  interview: "bg-amber-500",
                  offer: "bg-emerald-500",
                  rejected: "bg-rose-400",
                };

                const barColor = colorMap[status] || "bg-slate-400";

                return (
                  <div
                    key={status}
                    className="rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium capitalize text-slate-700">
                        {status}
                      </span>

                      <span className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">
                          {count}
                        </span>
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            
            <div className="mt-5 rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-xs text-slate-600">
                Tip: Prioritize follow-ups on applications stuck in early
                stages.
              </p>
            </div>
          </div>
        </section>

        
        <section className="border-t border-slate-200 pt-6">
          <ResumePage />
        </section>
      </div>
    </div>
  );
}



function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: any;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
      <div className="text-slate-500">{icon}</div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-semibold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function LineChart({ ats, interview }: { ats: number; interview: number }) {
  const a = 100 - ats;
  const i = 100 - interview;

  return (
    <svg
      viewBox="0 0 400 120"
      className="w-full h-40"
      preserveAspectRatio="none"
    >
      {[30, 60, 90].map((y) => (
        <line
          key={y}
          x1="0"
          x2="400"
          y1={y}
          y2={y}
          stroke="#E2E8F0"
          strokeWidth="1"
        />
      ))}

      <polyline
        fill="none"
        stroke="#0F172A"
        strokeWidth="2"
        points={`0,${a} 100,${a - 8} 200,${a + 6} 300,${a - 4} 400,${a}`}
      />

      <polyline
        fill="none"
        stroke="#6366F1"
        strokeWidth="2"
        points={`0,${i} 100,${i + 6} 200,${i - 4} 300,${i + 8} 400,${i}`}
      />
    </svg>
  );
}

function Skeleton() {
  return (
    <div className="max-w-[1320px] mx-auto px-6 py-8 space-y-6 animate-pulse">
      <div className="h-6 w-40 bg-slate-200 rounded" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-slate-200 rounded-xl" />
        ))}
      </div>
      <div className="h-40 bg-slate-200 rounded-xl" />
    </div>
  );
}

function Error({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
        {message}
      </div>
    </div>
  );
}
