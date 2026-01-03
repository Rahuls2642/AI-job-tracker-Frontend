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

const MAX_PRACTICE_PER_JOB = 3;
const QUESTIONS_LIMIT = 50;
const QUESTIONS_PER_PAGE = 10;

export default function JobDetailPage() {
  const { id } = useParams();

  const [job, setJob] = useState<Job | null>(null);

  const [ats, setATS] = useState<ATSResult | null>(null);
  const [atsLoading, setATSLoading] = useState(false);
  const [resumeError, setResumeError] = useState("");

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [qLoading, setQLoading] = useState(false);
  const [qError, setQError] = useState("");

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [practiceCount, setPracticeCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

  const paginatedQuestions = questions.slice(
    (currentPage - 1) * QUESTIONS_PER_PAGE,
    currentPage * QUESTIONS_PER_PAGE
  );

  useEffect(() => {
    const loadAll = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token || !id) return;

      try {
        const jobResult = await apiFetch(`/jobs/${id}`, token);
        setJob(jobResult);

        const atsResult = await apiFetch(`/ats/${id}`, token);
        setATS(atsResult);
      } catch {}

      try {
        const qs = await apiFetch(`/interviews/${id}`, token);
        setQuestions([...qs].reverse());
      } catch {}
    };

    loadAll();

    return () => {
      setActiveQuestionId(null);
      setAnswerText("");
      setAnswerResult(null);
    };
  }, [id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [questions.length]);

  const runATS = async () => {
    if (!id || ats) return;

    setATSLoading(true);
    setResumeError("");

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token!;

      const result = await apiFetch("/ats/analyze", token, {
        method: "POST",
        body: JSON.stringify({ jobId: id }),
      });

      setATS(result);
    } catch {
      setResumeError("Upload a resume to run ATS analysis.");
    } finally {
      setATSLoading(false);
    }
  };

  const generateQuestions = async (mode: "one" | "all") => {
    if (!id || questions.length >= QUESTIONS_LIMIT) return;

    setQLoading(true);
    setQError("");

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token!;

      const endpoint =
        mode === "one"
          ? `/interviews/generate-one/${id}`
          : `/interviews/generate/${id}`;

      await apiFetch(endpoint, token, { method: "POST" });

      const qs = await apiFetch(`/interviews/${id}`, token);
      setQuestions([...qs].reverse());
    } catch {
      setQError("Too many requests. Please wait.");
    } finally {
      setQLoading(false);
    }
  };

  const submitAnswer = async (questionId: string) => {
    if (!answerText.trim() || practiceCount >= MAX_PRACTICE_PER_JOB) return;

    setAnswerLoading(true);
    setAnswerResult(null);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token!;

      const result = await apiFetch("/answers", token, {
        method: "POST",
        body: JSON.stringify({ questionId, answer: answerText }),
      });

      setAnswerResult(result);
      setPracticeCount((c) => c + 1);
    } finally {
      setAnswerLoading(false);
    }
  };

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        Loading job…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 sm:px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="bg-white border border-slate-300 rounded-xl px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{job.role}</h1>
              <p className="text-sm text-slate-600 mt-1">{job.company}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={runATS}
                disabled={atsLoading || !!ats}
                className="bg-indigo-600 text-white px-5 py-2.5 text-sm font-semibold rounded-md disabled:opacity-50"
              >
                {atsLoading ? "Processing…" : ats ? "ATS Completed" : "Run ATS"}
              </button>

              <button
                onClick={() => (window.location.href = "/resume")}
                className="border border-slate-300 px-5 py-2.5 text-sm font-semibold rounded-md"
              >
                Upload Resume
              </button>
            </div>
          </div>

          {resumeError && (
            <p className="text-xs text-amber-700 mt-2">{resumeError}</p>
          )}
        </header>

        {ats && (
          <section className="bg-white border border-slate-300 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">ATS Analysis</h2>
              <span className="font-semibold text-indigo-600">
                Match Score: {ats.matchScore}%
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold mb-2">Missing Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(ats.missingKeywords)
                    ? ats.missingKeywords
                    : ats.missingKeywords.split(",")
                  ).map((k, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs"
                    >
                      {k.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold mb-1">Suggestions</p>
                <p className="text-slate-700">{ats.suggestions}</p>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg font-bold">
              Mock Interview
              <span className="text-slate-500  font-medium ml-2">
                ({questions.length})
              </span>
            </h2>

            <div className="flex items-center gap-3">
              {questions.length < QUESTIONS_LIMIT && (
                <button
                  disabled={qLoading}
                  onClick={() => generateQuestions("all")}
                  className="border border-slate-300 bg-white px-4 py-2 text-xs font-semibold rounded-md"
                >
                  {qLoading ? "Generating…" : "Add Question"}
                </button>
              )}

              <span className="text-xs border border-slate-200 bg-white shadow-sm px-3 py-1 rounded-md">
                {practiceCount}/{MAX_PRACTICE_PER_JOB} Attempts
              </span>
            </div>
          </div>

          {qError && <p className="text-sm text-red-600 mb-4">{qError}</p>}

          {paginatedQuestions.map((q) => (
            <div key={q.id} className="border-slate-200 bg-white shadow-sm bg-white border rounded-xl p-5 mb-4">
              <span className="text-xs uppercase text-slate-500">
                {q.category}
              </span>

              <p className="font-semibold mt-2">{q.question}</p>

              <button
                className="text-indigo-600 text-sm mt-2"
                onClick={() => {
                  setActiveQuestionId(q.id);
                  setAnswerText("");
                  setAnswerResult(null);
                }}
              >
                Practice →
              </button>

              {activeQuestionId === q.id && (
                <div className="mt-4 space-y-3 ">
                  <textarea
                    rows={4}
                    className="w-full border rounded-md p-3 border-slate-200 bg-white shadow-sm "
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                  />

                  <button
                    disabled={answerLoading}
                    onClick={() => submitAnswer(q.id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md"
                  >
                    {answerLoading ? "Evaluating…" : "Analyze Answer"}
                  </button>

                  {answerResult && (
                    <div className="pt-4 space-y-4 border-t border-slate-200">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3">
                        <p className="font-semibold text-emerald-700">
                          Score: {answerResult.score}/10
                        </p>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                        <p className="font-semibold text-amber-700 mb-1">
                          Feedback
                        </p>
                        <p className="text-sm text-slate-700">
                          {answerResult.feedback}
                        </p>
                      </div>

                      <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3">
                        <p className="font-semibold text-indigo-700 mb-1">
                          Improved Answer
                        </p>
                        <p className="text-sm italic text-indigo-800 leading-relaxed">
                          “{answerResult.improvedAnswer}”
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {totalPages > 1 && (
            <div className="mt-8 flex justify-between text-sm">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ← Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
