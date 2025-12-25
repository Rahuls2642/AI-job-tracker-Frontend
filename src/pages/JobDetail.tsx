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

type ATSResult = {
  matchScore: number;
  missingKeywords: string[] | string;
  suggestions: string;
};

type InterviewQuestion = {
  id: string;
  question: string;
  category: string;
};

type AnswerResult = {
  score: number;
  feedback: string;
  improvedAnswer: string;
};

export default function JobDetailPage() {
  const { id } = useParams();

  const [job, setJob] = useState<Job | null>(null);

  // ATS
  const [ats, setATS] = useState<ATSResult | null>(null);
  const [atsLoading, setATSLoading] = useState(false);
  const [atsError, setATSError] = useState("");

  // Interview questions
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [qLoading, setQLoading] = useState(false);
  const [qError, setQError] = useState("");

  // Practice (scoped per question)
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [answerLoading, setAnswerLoading] = useState(false);

  /* ---------------- LOAD JOB ONLY ---------------- */
  useEffect(() => {
    const loadJob = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token || !id) return;

      const result = await apiFetch(`/jobs/${id}`, token);
      setJob(result);
    };

    loadJob();

    // 🔑 clear questions when leaving page
    return () => {
      setQuestions([]);
      setActiveQuestionId(null);
    };
  }, [id]);

  /* ---------------- ATS ---------------- */
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
    } catch {
      setATSError("Failed to run ATS analysis");
    } finally {
      setATSLoading(false);
    }
  };

  /* ---------------- QUESTIONS ---------------- */
  const loadQuestions = async (token: string) => {
    const result = await apiFetch(`/interviews/${id}`, token);
    setQuestions(result);
  };

  const generateAllQuestions = async () => {
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

  const generateOneQuestion = async () => {
    if (!id) return;

    setQLoading(true);
    setQError("");

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      await apiFetch(`/interviews/generate-one/${id}`, token, {
        method: "POST",
      });

      await loadQuestions(token);
    } catch {
      setQError("Failed to generate question");
    } finally {
      setQLoading(false);
    }
  };

  /* ---------------- ANSWERS ---------------- */
  const submitAnswer = async (questionId: string) => {
    if (!answerText.trim()) return;

    setAnswerLoading(true);
    setAnswerResult(null);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const result = await apiFetch("/answers", token, {
        method: "POST",
        body: JSON.stringify({
          questionId,
          answer: answerText,
        }),
      });

      setAnswerResult(result);
    } finally {
      setAnswerLoading(false);
    }
  };

  if (!job) return <p className="p-6">Loading job...</p>;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold">{job.role}</h1>
      <p className="text-gray-600 mb-4">{job.company}</p>

      <p className="mb-4 whitespace-pre-wrap">{job.description}</p>

      <button
        onClick={runATS}
        disabled={atsLoading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {atsLoading ? "Analyzing..." : "Run ATS Analysis"}
      </button>

      {ats && (
        <div className="mt-4 bg-white p-4 rounded shadow">
          <p>
            <b>Match:</b> {ats.matchScore}%
          </p>
          <p>
            <b>Suggestions:</b> {ats.suggestions}
          </p>
        </div>
      )}

      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Interview Questions</h2>

        <div className="flex gap-3 mb-4">
          <button
            onClick={generateOneQuestion}
            disabled={qLoading}
            className="border px-3 py-2 rounded disabled:opacity-50"
          >
            {qLoading ? "Generating..." : "Generate 1 Question"}
          </button>

          <button
            onClick={generateAllQuestions}
            disabled={qLoading}
            className="border px-3 py-2 rounded disabled:opacity-50"
          >
            {qLoading ? "Generating..." : "Generate All Questions"}
          </button>

         
        </div>

        {qError && <p className="text-red-600">{qError}</p>}

        {questions.length === 0 && (
          <p className="text-gray-500">
            No questions yet. Generate to start practicing.
          </p>
        )}

        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-500 capitalize">{q.category}</p>
              <p className="font-medium">{q.question}</p>

              <button
                className="mt-2 text-sm underline"
                onClick={() => {
                  setActiveQuestionId(q.id);
                  setAnswerText("");
                  setAnswerResult(null);
                }}
              >
                Practice
              </button>

              {activeQuestionId === q.id && (
                <div className="mt-3">
                  <textarea
                    className="w-full border p-2 rounded"
                    rows={4}
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                  />

                  <button
                    onClick={() => submitAnswer(q.id)}
                    className="mt-2 bg-black text-white px-4 py-2 rounded"
                  >
                    {answerLoading ? "Evaluating..." : "Submit"}
                  </button>

                  {answerResult && (
                    <div className="mt-3 bg-white p-3 rounded shadow">
                      <p>
                        <b>Score:</b> {answerResult.score}/10
                      </p>
                      <p>
                        <b>Feedback:</b> {answerResult.feedback}
                      </p>
                      <p>
                        <b>Improved:</b> {answerResult.improvedAnswer}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
