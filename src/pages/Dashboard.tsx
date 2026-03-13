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

           <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="bg-white border border-slate-200 rounded-xl p-6">
    <h2 className="text-sm font-semibold text-slate-700 mb-2">
      ATS Score
    </h2>

    <p className="text-3xl font-semibold text-slate-900">
      {data.averageATSScore}%
    </p>

    <p className="text-xs text-slate-500 mt-2">
      Your resume currently matches job descriptions at this rate.
    </p>

    <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-slate-900"
        style={{ width: `${data.averageATSScore}%` }}
      />
    </div>
  </div>

  <div className="bg-white border border-slate-200 rounded-xl p-6">
    <h2 className="text-sm font-semibold text-slate-700 mb-2">
      Interview Readiness
    </h2>

    <p className="text-3xl font-semibold text-slate-900">
      {data.averageInterviewScore}/100
    </p>

    <p className="text-xs text-slate-500 mt-2">
      Based on your practice interview answers.
    </p>

    <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-indigo-500"
        style={{ width: `${data.averageInterviewScore}%` }}
      />
    </div>
  </div>
</section>
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
