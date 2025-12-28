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
const QUESTIONS_LIMIT = 20; // The threshold to hide the button
const QUESTIONS_PER_PAGE = 20; 

export default function JobDetailPage() {
  const { id } = useParams();

  const [job, setJob] = useState<Job | null>(null);

  
  const [ats, setATS] = useState<ATSResult | null>(null);
  const [atsLoading, setATSLoading] = useState(false);
  const [atsError, setATSError] = useState("");

 
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [qLoading, setQLoading] = useState(false);
  const [qError, setQError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [practiceCount, setPracticeCount] = useState(0);

  const indexOfLastQuestion = currentPage * QUESTIONS_PER_PAGE;
  const indexOfFirstQuestion = indexOfLastQuestion - QUESTIONS_PER_PAGE;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

  useEffect(() => {
    const loadAll = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token || !id) return;

      const jobResult = await apiFetch(`/jobs/${id}`, token);
      setJob(jobResult);

      try {
        const atsResult = await apiFetch(`/ats/${id}`, token);
        setATS(atsResult);
      } catch {}

      try {
        const qs = await apiFetch(`/interviews/${id}`, token);
        // SORTING LOGIC: Reverse the array so newest is at the top
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

  const runATS = async () => {
    if (!id || ats) return;
    setATSLoading(true);
    setATSError("");
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token!;
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

  const generateQuestions = async (mode: "one" | "all") => {
    if (!id || questions.length >= QUESTIONS_LIMIT) return;
    setQLoading(true);
    setQError("");
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token!;
      const endpoint = mode === "one" ? `/interviews/generate-one/${id}` : `/interviews/generate/${id}`;

      await apiFetch(endpoint, token, { method: "POST" });
      const qs = await apiFetch(`/interviews/${id}`, token);
      
      // Reverse the array so the newly generated ones appear first
      setQuestions([...qs].reverse());
      
      setCurrentPage(1);
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

  if (!job)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 animate-pulse">Loading job...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        
        <header className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{job.role}</h1>
              <p className="text-lg text-indigo-600 font-medium">{job.company}</p>
            </div>
            <button
              onClick={runATS}
              disabled={atsLoading || !!ats}
              className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {atsLoading ? "Processing..." : ats ? "ATS Analysis Ready" : "Run ATS Scan"}
            </button>
          </div>
          {ats && (
            <div className="mt-8 grid md:grid-cols-4 gap-6 animate-in fade-in duration-500">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <span className="block text-xs uppercase tracking-wider text-indigo-500 font-bold mb-1 text-center">Match Score</span>
                <span className="text-3xl font-black text-indigo-700 block text-center">{ats.matchScore}%</span>
              </div>
              <div className="md:col-span-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">AI Suggestions</span>
                <p className="text-gray-700 leading-relaxed text-sm">{ats.suggestions}</p>
              </div>
            </div>
          )}
        </header>

        
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Mock Interview</h2>
            <div className="flex items-center gap-3">
              {questions.length > 0 && questions.length < QUESTIONS_LIMIT && (
                <button
                  disabled={qLoading}
                  onClick={() => generateQuestions("one")}
                  className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg font-bold transition-all border border-indigo-200"
                >
                  {qLoading ? "Generating..." : "+ Add Question"}
                </button>
              )}
              <div className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                {practiceCount} / {MAX_PRACTICE_PER_JOB} Attempts
              </div>
            </div>
          </div>

          {questions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <button
                disabled={qLoading}
                onClick={() => generateQuestions("all")}
                className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
              >
                {qLoading ? "Generating Questions..." : "Generate Interview Prep"}
              </button>
            </div>
          )}

          {qError && <p className="mb-4 text-red-500 text-center font-medium">{qError}</p>}

          <div className="grid gap-6">
            {currentQuestions.map((q) => (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border transition-all duration-300 ${
                  activeQuestionId === q.id ? "ring-2 ring-indigo-500 border-transparent shadow-md" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="p-6">
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded mb-3">
                    {q.category}
                  </span>
                  <p className="text-lg font-semibold text-gray-900 mb-4">{q.question}</p>

                  <button
                    className={`text-sm font-bold flex items-center gap-1 transition-colors ${activeQuestionId === q.id ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
                    onClick={() => {
                      setActiveQuestionId(q.id);
                      setAnswerText("");
                      setAnswerResult(null);
                    }}
                  >
                    {activeQuestionId === q.id ? "Currently Practicing" : "Practice this question →"}
                  </button>

                  {activeQuestionId === q.id && (
                    <div className="mt-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                      <textarea
                        rows={4}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Type your response here..."
                      />
                      <div className="flex items-center justify-between">
                        <button
                          disabled={answerLoading || practiceCount >= MAX_PRACTICE_PER_JOB}
                          onClick={() => submitAnswer(q.id)}
                          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          {answerLoading ? "Evaluating..." : "Analyze Answer"}
                        </button>
                      </div>
                      {answerResult && (
                        <div className="mt-6 space-y-4 border-t pt-6">
                          <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-sm">
                            <p className="text-green-800 font-bold">Score: {answerResult.score}/10</p>
                            <p className="text-green-700">{answerResult.feedback}</p>
                          </div>
                          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-sm">
                            <p className="text-indigo-800 font-bold uppercase text-[10px]">Suggestion</p>
                            <p className="text-indigo-700 italic">"{answerResult.improvedAnswer}"</p>
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
            <div className="flex items-center justify-center gap-4 mt-10 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="text-sm font-semibold text-gray-500 hover:text-indigo-600 disabled:opacity-30"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="text-sm font-semibold text-gray-500 hover:text-indigo-600 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}