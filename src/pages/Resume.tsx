import { useEffect, useState } from "react";
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

  const handleUpload = async () => {
    if (!file) return;

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

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      setMessage("Resume uploaded successfully");
      setFile(null);
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
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) =>
            setFile(e.target.files ? e.target.files[0] : null)
          }
        />

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="mt-3 bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Resume"}
        </button>

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
