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
      setPracticeCount(c => c + 1);
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
  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-4">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
        {job.role}
      </h1>
      <p className="text-sm text-slate-600 mt-1">
        {job.company}
      </p>
    </div>

    <div className="flex items-center gap-3">
      <button
        onClick={runATS}
        disabled={atsLoading || !!ats}
        className="bg-indigo-600 text-white px-5 py-2.5 text-sm font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {atsLoading ? "Processing…" : ats ? "ATS Ready" : "Run ATS"}
      </button>

      <button
        onClick={() => (window.location.href = "/resume")}
        className="border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold rounded-md text-slate-700 hover:border-slate-500 transition"
      >
        Upload Resume
      </button>
    </div>
  </div>

  <div className="mt-2 min-h-[22px]">
    {resumeError && (
      <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded">
        {resumeError}
      </span>
    )}
  </div>
</header>


        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Mock Interview
              <span className="text-slate-500 font-medium ml-2">
                ({questions.length})
              </span>
            </h2>

            <div className="flex gap-3 items-center">
              {questions.length < QUESTIONS_LIMIT && (
                <button
                  disabled={qLoading}
                  onClick={() => generateQuestions("all")}
                  className="border border-slate-300 bg-white px-4 py-2 text-xs font-semibold rounded-md text-slate-700 hover:border-slate-500 transition"
                >
                  {qLoading ? "Generating…" : "Add Question"}
                </button>
              )}

              <span className="text-xs border border-slate-300 px-3 py-1 rounded-md text-slate-600">
                {practiceCount}/{MAX_PRACTICE_PER_JOB} Attempts
              </span>
            </div>
          </div>

          {qError && (
            <p className="text-sm text-red-600 text-center mb-4">{qError}</p>
          )}

          <div className="space-y-5">
            {paginatedQuestions.map(q => (
              <div
                key={q.id}
                className={`border bg-white rounded-xl ${
                  activeQuestionId === q.id
                    ? "border-indigo-400"
                    : "border-slate-300"
                }`}
              >
                <div className="px-5 py-4">
                  <span className="text-[10px] uppercase font-semibold text-slate-500">
                    {q.category}
                  </span>

                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {q.question}
                  </p>

                  <button
                    className="mt-3 text-sm font-semibold text-indigo-600 hover:underline"
                    onClick={() => {
                      setActiveQuestionId(q.id);
                      setAnswerText("");
                      setAnswerResult(null);
                    }}
                  >
                    Practice →
                  </button>

                  {activeQuestionId === q.id && (
                    <div className="mt-5 space-y-4">
                      <textarea
                        rows={4}
                        className="w-full border border-slate-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        value={answerText}
                        onChange={e => setAnswerText(e.target.value)}
                      />

                      <button
                        disabled={answerLoading}
                        onClick={() => submitAnswer(q.id)}
                        className="bg-indigo-600 text-white px-5 py-2 text-sm font-semibold rounded-md hover:bg-indigo-700 transition"
                      >
                        {answerLoading ? "Evaluating…" : "Analyze Answer"}
                      </button>

                      {answerResult && (
                        <div className="pt-4 space-y-3 border-t border-slate-200">
                          <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3">
                            <p className="font-semibold text-emerald-700">
                              Score: {answerResult.score}/10
                            </p>
                            <p className="text-sm text-slate-700 mt-1">
                              {answerResult.feedback}
                            </p>
                          </div>

                          <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3 text-sm italic text-indigo-700">
                            “{answerResult.improvedAnswer}”
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

         {totalPages > 1 && (
  <div className="mt-10 grid grid-cols-3 items-center">
    <div className="justify-self-start">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(p => p - 1)}
        className="border border-slate-300 px-4 py-2 rounded-md text-sm disabled:opacity-40"
      >
        ← Previous
      </button>
    </div>

    <div className="justify-self-center text-sm text-slate-600">
      Page {currentPage} of {totalPages}
    </div>

    <div className="justify-self-end">
      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(p => p + 1)}
        className="border border-slate-300 px-4 py-2 rounded-md text-sm disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  </div>
)}

        </section>
      </div>
    </div>
  );
}
