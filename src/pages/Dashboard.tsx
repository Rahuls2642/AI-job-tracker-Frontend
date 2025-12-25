import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

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
        const session =
          await import("../lib/supabase").then(m =>
            m.supabase.auth.getSession()
          );

        const token = session.data.session?.access_token;
        if (!token) return;

        const result = await apiFetch("/reports/overview", token);
        setData(result);
      } catch (err: any) {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <p className="p-6">Loading dashboard...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!data) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Welcome{user?.email ? `, ${user.email}` : ""}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="Total Jobs" value={data.totalJobs} />
        <Card title="ATS Score" value={`${data.averageATSScore}%`} />
        <Card
          title="Interview Score"
          value={data.averageInterviewScore}
        />
        <Card
          title="Answers Practiced"
          value={data.answersPracticed}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Jobs by Status</h2>
        <ul className="space-y-1">
          {Object.entries(data.jobsByStatus).map(
            ([status, count]) => (
              <li key={status}>
                <span className="font-medium capitalize">
                  {status}
                </span>
                : {count}
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
