import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Registration = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("http://localhost:5000/api/v1/register", {
        username,
        email,
        password,
        role,
      });

      if (response.data.message) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setError(
        err.response ? err.response.data.message : "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center px-16 py-12 relative overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50">
        {/* Blobs */}
        <div className="absolute w-72 h-72 rounded-full bg-purple-200 opacity-40 blur-3xl -top-20 -left-20 pointer-events-none" />
        <div className="absolute w-60 h-60 rounded-full bg-blue-200 opacity-40 blur-3xl -bottom-16 -right-16 pointer-events-none" />

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-md">
              <div className="w-2.5 h-2.5 bg-white rounded-full" />
            </div>
            <span className="text-xl font-bold text-indigo-900">StudyWave</span>
          </div>

          <h2 className="text-3xl font-extrabold text-indigo-900 leading-snug mb-4">
            Start your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
              learning journey.
            </span>
          </h2>

          <p className="text-gray-500 text-[15px] leading-relaxed mb-10">
            Join 500+ students already learning smarter with structured courses, live mentors, and smart study tools.
          </p>

          {/* Feature bullets */}
          <div className="flex flex-col gap-4 text-left">
            {[
              { icon: "📚", text: "300+ structured courses across all subjects" },
              { icon: "🧑‍🏫", text: "1-on-1 mentorship with verified experts" },
              { icon: "📊", text: "Performance analytics to track your progress" },
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
      <div className="flex-1 flex flex-col items-center justify-center px-10 py-14 bg-white border-l border-gray-100">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span className="text-lg font-bold text-indigo-900">StudyWave</span>
          </div>

          <p className="text-xs font-semibold tracking-widest text-purple-600 uppercase mb-2">
            Create Account
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Sign up</h1>
          <p className="text-sm text-gray-400 mb-8">It's free — no credit card needed</p>

          {/* Alerts */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Username */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="e.g. aryan_raj"
                className="w-full px-4 py-2.5 text-[14px] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 text-[14px] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min. 8 characters"
                className="w-full px-4 py-2.5 text-[14px] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                I am a
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-[14px] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition appearance-none"
              >
                <option value="user">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-[15px] font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl shadow-md shadow-purple-100 hover:opacity-90 transition hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Creating account..." : "Create free account →"}
            </button>
          </form>

          {/* Divider */}
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