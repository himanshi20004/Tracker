import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";

const Registration = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (username.trim().length < 2) {
      setError("Username must be at least 2 characters.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/register", {
        username: username.trim(),
        email: email.trim(),
        password,
      });

      if (response.data.message) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1200);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL ── */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center px-16 py-12 relative overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="absolute w-72 h-72 rounded-full bg-purple-200 opacity-40 blur-3xl -top-20 -left-20 pointer-events-none" />
        <div className="absolute w-60 h-60 rounded-full bg-blue-200 opacity-40 blur-3xl -bottom-16 -right-16 pointer-events-none" />

        <div className="relative z-10 text-center max-w-sm">
          <Link to="/" className="flex items-center justify-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-md">
              <div className="w-2.5 h-2.5 bg-white rounded-full" />
            </div>
            <span className="text-xl font-bold text-indigo-900">StudyWave</span>
          </Link>

          <h2 className="text-3xl font-extrabold text-indigo-900 leading-snug mb-4">
            Start your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
              learning journey.
            </span>
          </h2>

          <p className="text-gray-500 text-[15px] leading-relaxed mb-10">
            Join students already learning smarter with structured tasks, interactive quizzes, and smart study tools.
          </p>

          <div className="flex flex-col gap-4 text-left">
            {[
              { icon: "📚", text: "Structured resources and study materials" },
              { icon: "🤖", text: "AI-powered step-by-step doubt solving" },
              { icon: "🏆", text: "Gamified tasks, quizzes, and leaderboards" },
            ].map((f) => (
              <div key={f.text} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center text-base shrink-0">
                  {f.icon}
                </div>
                <p className="text-[14px] text-gray-600 leading-snug pt-1">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-14 bg-white border-l border-gray-100">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2.5 mb-10 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span className="text-lg font-bold text-indigo-900">StudyWave</span>
          </Link>

          <p className="text-xs font-semibold tracking-widest text-purple-600 uppercase mb-2">
            Student Registration
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Sign up</h1>
          <p className="text-sm text-gray-400 mb-8">Create your free student account</p>

          {error && (
            <div role="alert" className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div role="status" className="mb-5 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="reg-username" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <input
                id="reg-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={2}
                placeholder="e.g. aryan_raj"
                className="w-full px-4 py-2.5 text-[14px] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 text-[14px] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-2.5 pr-16 text-[14px] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <input
                id="reg-confirm"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Re-enter password"
                className="w-full px-4 py-2.5 text-[14px] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-[15px] font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl shadow-md shadow-purple-100 hover:opacity-90 transition hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Creating account..." : "Create student account →"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">Already have an account?</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-[13px] text-gray-500">
            Have an account?{" "}
            <Link
              to="/login"
              className="text-purple-600 font-semibold hover:text-purple-800 transition"
            >
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;
