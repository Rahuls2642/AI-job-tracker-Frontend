import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { apiFetch } from "../lib/api";
import { Upload, FileText } from "lucide-react";

type Resume = {
  id: string;
  createdAt: string;
};

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resumes, setResumes] = useState<Resume[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadResumes = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    const result = await apiFetch("/resumes", token);
    setResumes(result);
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleButtonClick = () => {
    if (!file) {
      fileInputRef.current?.click();
    } else {
      handleUpload();
    }
  };

  const handleUpload = async () => {
    if (!file || loading) return;

    setLoading(true);
    setMessage("");

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/resumes/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      setMessage("Resume uploaded successfully");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      loadResumes();
    } catch (err: any) {
      setMessage(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-slate-50">
   
    <div className="px-4 sm:px-6 lg:px-8">
      <main className="max-w-7xl mx-auto py-8">
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">

       
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Resume
            </h2>
            <p className="text-sm text-slate-500">
              Upload and manage the resume used for ATS analysis.
            </p>
          </div>

      
          <div className="border border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 bg-slate-50">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) =>
                setFile(e.target.files ? e.target.files[0] : null)
              }
            />

            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Upload size={18} className="text-indigo-600" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700">
                {file ? file.name : "Upload your resume (PDF)"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Used for ATS scoring & interview prep
              </p>
            </div>

            <button
              onClick={handleButtonClick}
              disabled={loading}
              className="
                mt-2 inline-flex items-center gap-2
                px-4 py-2
                text-sm font-medium
                rounded-lg
                bg-indigo-600 text-white
                hover:bg-indigo-700
                transition
                disabled:opacity-50
              "
            >
              {loading ? "Uploading…" : file ? "Upload Resume" : "Choose File"}
            </button>

            {message && (
              <p className="text-xs text-slate-600 mt-2">
                {message}
              </p>
            )}
          </div>

         
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">
              Uploaded resumes
            </h3>

            {resumes.length === 0 && (
              <p className="text-sm text-slate-500">
                No resumes uploaded yet.
              </p>
            )}

            <ul className="space-y-2">
  {[...resumes]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .map((r) => (
      <li
        key={r.id}
        className="flex items-center gap-3 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
      >
        <FileText size={16} className="text-slate-500" />
        <span className="text-slate-700">
          Uploaded on{" "}
          {new Date(r.createdAt).toLocaleDateString()}
        </span>
      </li>
    ))}
</ul>

          </div>

        </section>
      </main>
    </div>
  </div>
);

}
