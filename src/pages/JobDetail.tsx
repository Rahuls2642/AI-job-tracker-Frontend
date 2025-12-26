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

export default function JobDetailPage() {
  const { id } = useParams();

  const [job, setJob] = useState<Job | null>(null);

  // ATS
  const [ats, setATS] = useState<ATSResult | null>(null);
  const [atsLoading, setATSLoading] = useState(false);
  const [atsError, setATSError] = useState("");

  // Questions
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [qLoading, setQLoading] = useState(false);
  const [qError, setQError] = useState("");

  // Practice
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [practiceCount, setPracticeCount] = useState(0);

  
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
      } catch {
        
      }

      
      try {
        const qs = await apiFetch(`/interviews/${id}`, token);
        setQuestions(qs);
      } catch {
    
      }
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
    if (!id || questions.length > 0) return; 

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
      setQuestions(qs);
    } catch {
      setQError("Too many requests. Please wait.");
    } finally {
      setQLoading(false);
    }
  };

  const submitAnswer = async (questionId: string) => {
    if (
      !answerText.trim() ||
      practiceCount >= MAX_PRACTICE_PER_JOB
    )
      return;

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

  if (!job) return <p className="p-6">Loading job...</p>;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold">{job.role}</h1>
      <p className="text-gray-600 mb-4">{job.company}</p>

      {/* ATS */}
      <button
        onClick={runATS}
        disabled={atsLoading || !!ats}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {ats ? "ATS Completed" : "Run ATS Analysis"}
      </button>

      {ats && (
        <div className="mt-4 bg-white p-4 rounded shadow">
          <p><b>Match:</b> {ats.matchScore}%</p>
          <p><b>Suggestions:</b> {ats.suggestions}</p>
        </div>
      )}

      {/* QUESTIONS */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Interview Questions</h2>

        {questions.length === 0 && (
          <div className="flex gap-3 mb-4">
            <button
              disabled={qLoading}
              onClick={() => generateQuestions("one")}
              className="border px-3 py-2 rounded"
            >
              Generate 1 Question
            </button>

            <button
              disabled={qLoading}
              onClick={() => generateQuestions("all")}
              className="border px-3 py-2 rounded"
            >
              Generate All Questions
            </button>
          </div>
        )}

        {qError && <p className="text-red-600">{qError}</p>}

        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-500">{q.category}</p>
              <p className="font-medium">{q.question}</p>

              <button
                className="mt-2 underline text-sm"
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
                    rows={4}
                    className="w-full border p-2"
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                  />

                  <button
                    disabled={answerLoading || practiceCount >= MAX_PRACTICE_PER_JOB}
                    onClick={() => submitAnswer(q.id)}
                    className="mt-2 bg-black text-white px-4 py-2 rounded"
                  >
                    Submit
                  </button>

                  {practiceCount >= MAX_PRACTICE_PER_JOB && (
                    <p className="text-sm text-gray-500 mt-2">
                      Practice limit reached for this job.
                    </p>
                  )}

                  {answerResult && (
                    <div className="mt-3 bg-white p-3 rounded shadow">
                      <p><b>Score:</b> {answerResult.score}/10</p>
                      <p><b>Feedback:</b> {answerResult.feedback}</p>
                      <p><b>Improved:</b> {answerResult.improvedAnswer}</p>
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
