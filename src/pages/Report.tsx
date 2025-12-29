import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { apiFetch } from "../lib/api";

type OverviewReport = {
  totalJobs: number;
  jobsByStatus: Record<string, number>;
  averageATSScore: number;
  averageInterviewScore: number;
  answersPracticed: number;
};

type ATSProgressItem = {
  score: number;
};

type WeakArea = {
  skill: string;
};

export default function ReportsPage() {
  const [overview, setOverview] = useState<OverviewReport | null>(null);
  const [atsProgress, setATSProgress] = useState<ATSProgressItem[]>([]);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const atsScores = atsProgress.map(p => p.score);

  const avgATS =
    atsScores.length > 0
      ? Math.round(atsScores.reduce((a, b) => a + b, 0) / atsScores.length)
      : 0;

  const bestATS = atsScores.length > 0 ? Math.max(...atsScores) : 0;
  const worstATS = atsScores.length > 0 ? Math.min(...atsScores) : 0;
  const latestATS =
    atsProgress.length > 0 ? atsProgress[atsProgress.length - 1].score : null;

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) throw new Error();

        const [o, a, w] = await Promise.all([
          apiFetch("/reports/overview", token),
          apiFetch("/reports/ats-progress", token),
          apiFetch("/reports/weak-areas", token),
        ]);

        setOverview(o);
        setATSProgress(Array.isArray(a) ? a : []);
        setWeakAreas(Array.isArray(w) ? w : []);
      } catch {
        setError("Could not load reports");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          Analyzing data…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          Performance Reports
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track your journey from resume analysis to interview mastery.
        </p>
      </header>

      {overview && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Applications" value={overview.totalJobs} tone="indigo" />
          <StatCard label="Avg Interview Score" value={`${overview.averageInterviewScore}/10`} tone="emerald" />
          <StatCard label="Answers Practiced" value={overview.answersPracticed || 0} tone="amber" />
          <StatCard label="Resume Strength" value={`${avgATS}%`} tone="blue" />
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {atsProgress.length > 0 && (
          <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">
                Resume Optimization (ATS)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                History of your resume match scores
              </p>
            </div>

            <div className="p-5 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatInline label="Latest Match" value={`${latestATS}%`} />
                <StatInline label="Avg Match" value={`${avgATS}%`} />
                <StatInline label="Personal Best" value={`${bestATS}%`} />
                <StatInline label="Needs Work" value={`${worstATS}%`} />
              </div>

              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all"
                  style={{ width: `${avgATS}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 bg-slate-50 border border-slate-100 rounded-lg p-3">
                ATS analysis is cached and recalculated only when you run analysis on a job.
              </p>
            </div>
          </section>
        )}

        <section className="bg-white rounded-2xl border border-slate-200 flex flex-col">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">
              Growth Opportunities
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Skills to focus on next
            </p>
          </div>

          <div className="p-5 flex-1">
            {weakAreas.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                Practice more questions to generate insights.
              </div>
            ) : (
              <div className="space-y-3">
                {weakAreas.map(w => (
                  <div
                    key={w.skill}
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 hover:border-indigo-200 hover:bg-indigo-50/30 transition"
                  >
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {w.skill}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-indigo-600">
                      Review
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-3 text-center">
            <p className="text-[11px] text-slate-400 italic">
              Derived from frequently missed skills in interview answers.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "indigo" | "emerald" | "amber" | "blue";
}) {
  const tones = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
        {label}
      </p>
      <p className={`text-2xl font-semibold ${tones[tone]}`}>
        {value}
      </p>
    </div>
  );
}

function StatInline({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">
        {label}
      </p>
      <p className="text-lg font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}
