import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { apiFetch } from "../lib/api";

type Job = {
  id: string;
  company: string;
  role: string;
  description: string;
  status: string;
};
type InterviewQuestion = {
  id: string;
  question: string;
  category: string;
};

type ATSResult = {
  matchScore: number;
  missingKeywords: string[] | string;
  suggestions: string;
};

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);

  const [ats, setATS] = useState<ATSResult | null>(null);
  const [atsLoading, setATSLoading] = useState(false);
  const [atsError, setATSError] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [qLoading, setQLoading] = useState(false);
  const [qError, setQError] = useState("");

 useEffect(() => {
  const loadJob = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token || !id) return;

    const result = await apiFetch(`/jobs/${id}`, token);
    setJob(result);
  };

  loadJob();
}, [id]);

useEffect(() => {
  const loadExistingQuestions = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token || !id) return;

    const result = await apiFetch(`/interviews/${id}`, token);
    setQuestions(result);
  };

  loadExistingQuestions();
}, [id]);

  const generateQuestions = async () => {
    if (!id) return;

    setQLoading(true);
    setQError("");

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      await apiFetch(`/interviews/generate/${id}`, token, {
        method: "POST",
      });

      await loadQuestions(token);
    } catch {
      setQError("Failed to generate questions");
    } finally {
      setQLoading(false);
    }
  };

  const loadQuestions = async (token: string) => {
    const result = await apiFetch(`/interviews/${id}`, token);
    setQuestions(result);
  };

  const runATS = async () => {
    if (!id) return;

    setATSLoading(true);
    setATSError("");
    setATS(null);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const result = await apiFetch("/ats/analyze", token, {
        method: "POST",
        body: JSON.stringify({ jobId: id }),
      });

      setATS(result);
    } catch (err: any) {
      setATSError("Failed to run ATS analysis");
    } finally {
      setATSLoading(false);
    }
  };

  if (!job) return <p className="p-6">Loading job...</p>;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">{job.role}</h1>
      <p className="text-gray-600 mb-4">{job.company}</p>

      <p className="mb-4 whitespace-pre-wrap">{job.description}</p>

      <p className="text-sm mb-6">
        Status: <span className="font-medium capitalize">{job.status}</span>
      </p>

      {/* ATS Button */}
      <button
        onClick={runATS}
        disabled={atsLoading}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {atsLoading ? "Analyzing..." : "Run ATS Analysis"}
      </button>

      {/* ATS Error */}
      {atsError && <p className="mt-3 text-sm text-red-600">{atsError}</p>}

      {/* ATS Result */}
      {ats && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">ATS Result</h2>

          <p className="mb-2">
            <span className="font-medium">Match Score:</span> {ats.matchScore}%
          </p>

          <div className="mb-2">
            <span className="font-medium">Missing Keywords:</span>
            <ul className="list-disc list-inside text-sm mt-1">
              {(Array.isArray(ats.missingKeywords)
                ? ats.missingKeywords
                : String(ats.missingKeywords).split(",")
              ).map((k, i) => (
                <li key={i}>{k.trim()}</li>
              ))}
            </ul>
          </div>

          <div>
            <span className="font-medium">Suggestions:</span>
            <p className="text-sm mt-1 whitespace-pre-wrap">
              {ats.suggestions}
            </p>
          </div>
        </div>
      )}
      <div className="mt-8">
  <h2 className="text-lg font-semibold mb-3">
    Interview Questions
  </h2>

  <button
    onClick={generateQuestions}
    disabled={qLoading}
    className="mb-4 border px-4 py-2 rounded disabled:opacity-50"
  >
    {qLoading ? "Generating..." : "Generate Questions"}
  </button>

  {qError && (
    <p className="text-sm text-red-600 mb-3">{qError}</p>
  )}

  {questions.length === 0 && (
    <p className="text-sm text-gray-500">
      No questions generated yet.
    </p>
  )}

  <div className="space-y-3">
    {questions.map((q) => (
      <div
        key={q.id}
        className="bg-gray-100 p-3 rounded"
      >
        <p className="text-sm text-gray-500 capitalize">
          {q.category}
        </p>
        <p className="mt-1">{q.question}</p>
      </div>
    ))}
  </div>
</div>

    </div>
  );
}
