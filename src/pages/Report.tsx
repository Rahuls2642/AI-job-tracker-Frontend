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
      <div className="p-6 max-w-5xl">
        <p className="text-gray-500">Loading reports…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-gray-500 text-sm mt-1">
          Your interview and resume performance over time
        </p>
      </header>
      
      {/* OVERVIEW */}

      {overview && (
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard label="Jobs Practiced" value={overview.totalJobs} />

          <StatCard
            label="Avg Interview Score"
            value={`${overview.averageInterviewScore}/10`}
          />
        </section>
      )}
      {atsProgress.length > 0 && (
        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="font-medium mb-4">ATS Progress</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatInline label="Latest" value={`${latestATS}%`} />
            <StatInline label="Average" value={`${avgATS}%`} />
            <StatInline label="Best" value={`${bestATS}%`} />
            <StatInline label="Worst" value={`${worstATS}%`} />
          </div>

          <div className="mt-4 space-y-2">
            {atsProgress.map((p, i) => (
              <div
                key={i}
                className="flex justify-between text-sm text-gray-600"
              >
                
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-4">
            ATS analysis is cached and only recalculated when you explicitly run
            it.
          </p>
        </section>
      )}

{/* WEAK AREAS */}
      <section className="bg-white rounded-xl shadow p-5">
  <h2 className="font-medium mb-4">Weak Areas</h2>

  {weakAreas.length === 0 ? (
    <p className="text-gray-500 text-sm">
      Not enough data yet. Practice more questions to see weak areas.
    </p>
  ) : (
    <ul className="space-y-3">
      {weakAreas.map((w) => (
        <li
          key={w.skill}
          className="flex items-center justify-between"
        >
          <span className="text-sm text-gray-700 capitalize">
            {w.skill}
          </span>
         
        </li>
      ))}
    </ul>
  )}

  <p className="text-xs text-gray-500 mt-4">
    Weak areas are derived from frequently missed skills in interview answers.
  </p>
</section>
    </div>
  );
}

/* ---------- small reusable components ---------- */

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold ${
          highlight ? "capitalize" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatInline({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-medium">{value}</p>
    </div>
  );
}
