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

  const atsScores = atsProgress.map((p) => p.score);

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
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Analyzing data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <span className="text-xl font-bold">!</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-5 sm:px-6 space-y-4 overflow-x-hidden ">

      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Performance Reports</h1>
        <p className="text-slate-500 font-medium">
          Track your journey from resume analysis to interview mastery.
        </p>
      </header>

     
      {overview && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Total Applications" 
            value={overview.totalJobs} 
            color="indigo"
          />
          <StatCard
            label="Avg Interview Score"
            value={`${overview.averageInterviewScore}/10`}
            color="emerald"
          />
          <StatCard
            label="Answers Practiced"
            value={overview.answersPracticed || 0}
            color="amber"
          />
          <StatCard
            label="Resume Strength"
            value={`${avgATS}%`}
            color="blue"
          />
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {atsProgress.length > 0 && (
          <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 ">
              <h2 className="text-lg font-bold text-slate-800">Resume Optimization (ATS)</h2>
              <p className="text-sm text-slate-500">History of your resume match scores</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                <StatInline label="Latest Match" value={`${latestATS}%`} trend="neutral" />
                <StatInline label="Avg Match" value={`${avgATS}%`} trend="neutral" />
                <StatInline label="Personal Best" value={`${bestATS}%`} trend="up" />
                <StatInline label="Needs Work" value={`${worstATS}%`} trend="down" />
              </div>

             
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-1000" 
                  style={{ width: `${avgATS}%` }} 
                />
              </div>
              
              <p className="text-[11px] text-slate-400 mt-6 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                💡 ATS analysis is cached and only recalculated when you explicitly run
                the "Analyze" tool on a specific job page.
              </p>
            </div>
          </section>
        )}

       
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">Growth Opportunities</h2>
            <p className="text-sm text-slate-500">Skills to focus on next</p>
          </div>

          <div className="p-6 flex-1">
            {weakAreas.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <span className="text-slate-300">🔍</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">
                  Practice more questions to generate insights.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {weakAreas.map((w) => (
                  <div
                    key={w.skill}
                    className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                  >
                    <span className="text-sm font-semibold text-slate-700 capitalize flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform"></span>
                      {w.skill}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-indigo-600">Review</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-50">
             <p className="text-[11px] text-slate-400 text-center italic">
              Derived from frequently missed skills in interview answers.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- small reusable components ---------- */

function StatCard({
  label,
  value,
  color = "indigo",
}: {
  label: string;
  value: string | number;
  color?: "indigo" | "emerald" | "amber" | "blue";
}) {
  const colors = {
    indigo: "from-indigo-500 to-indigo-600 text-indigo-600 bg-indigo-50",
    emerald: "from-emerald-500 to-emerald-600 text-emerald-600 bg-emerald-50",
    amber: "from-amber-500 to-amber-600 text-amber-600 bg-amber-50",
    blue: "from-blue-500 to-blue-600 text-blue-600 bg-blue-50",
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className={`text-3xl font-black ${colors[color].split(' ')[2]}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StatInline({ 
  label, 
  value, 
  trend 
}: { 
  label: string; 
  value: string; 
  trend: "up" | "down" | "neutral" 
}) {
  const trendIcons = {
    up: "↑",
    down: "↓",
    neutral: "•"
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <span className={`text-[10px] ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-slate-400'}`}>
          {trendIcons[trend]}
        </span>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
  );
}