import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(email, password);
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Create account
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Start preparing smarter for your job search.
            </p>
          </div>

         
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

       
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  w-full rounded-lg border border-slate-300
                  px-3 py-2 text-sm
                  outline-none
                  focus:ring-2 focus:ring-indigo-500
                  focus:border-indigo-500
                  transition
                "
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  w-full rounded-lg border border-slate-300
                  px-3 py-2 text-sm
                  outline-none
                  focus:ring-2 focus:ring-indigo-500
                  focus:border-indigo-500
                  transition
                "
              />
              <p className="mt-1 text-xs text-slate-400">
                Use at least 8 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                mt-6 w-full rounded-lg
                bg-indigo-600 text-white
                py-2.5 text-sm font-medium
                hover:bg-indigo-700
                transition
                disabled:opacity-50
              "
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Secure sign-up • No spam • Cancel anytime
        </p>
      </div>
    </div>
  );
}
