import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { apiFetch } from "../lib/api";

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

  const handleButtonClick = async () => {
    // No file yet → open file picker
    if (!file) {
      fileInputRef.current?.click();
      return;
    }

    // File exists → upload
    handleUpload();
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

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      loadResumes();
    } catch (err: any) {
      setMessage(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Resume</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) =>
            setFile(e.target.files ? e.target.files[0] : null)
          }
        />

        <button
          onClick={handleButtonClick}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading
            ? "Uploading..."
            : file
            ? "Upload Resume"
            : "Choose Resume"}
        </button>

        {file && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {file.name}
          </p>
        )}

        {message && (
          <p className="mt-2 text-sm text-gray-700">{message}</p>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-2">Uploaded Resumes</h2>

        {resumes.length === 0 && (
          <p className="text-sm text-gray-500">
            No resumes uploaded yet.
          </p>
        )}

        <ul className="space-y-2">
          {resumes.map((r) => (
            <li
              key={r.id}
              className="bg-gray-100 p-2 rounded text-sm"
            >
              Uploaded on{" "}
              {new Date(r.createdAt).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
