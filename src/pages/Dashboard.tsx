import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import ResumePage from "./Resume";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  FileCheck,
  Mic2,
  Target,
  ChevronRight,
} from "lucide-react";

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
        const session = await import("../lib/supabase").then(m =>
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

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Dashboard
            </h1>
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

        {/* Stats */}
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

        {/* Main grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Performance */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Performance trend
            </h2>
            <LineChart
              ats={data.averageATSScore}
              interview={data.averageInterviewScore}
            />
          </div>

          {/* Status */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Job status
            </h2>

            <div className="space-y-3">
              {Object.entries(data.jobsByStatus).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="capitalize text-slate-500">
                    {status}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Resume */}
        <section className="border-t border-slate-200 pt-6">
          <ResumePage />
        </section>
      </div>
    </div>
  );
}

/* -------------------- Components -------------------- */

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

function LineChart({
  ats,
  interview,
}: {
  ats: number;
  interview: number;
}) {
  const a = 100 - ats;
  const i = 100 - interview;

  return (
    <svg
      viewBox="0 0 400 120"
      className="w-full h-40"
      preserveAspectRatio="none"
    >
      {[30, 60, 90].map(y => (
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
        {[1, 2, 3, 4].map(i => (
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
