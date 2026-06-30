import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("${import.meta.env.VITE_API_URL}/api/v1/login", {
        email,
        password,
      });

      const { user } = response.data;
      if (user && user.role && response.data.token) {
        const { role } = user;
        const userData = { id: response.data.user.id, role: response.data.user.role };

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", role);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("userId", user.id);

        if (role === "admin") {
          navigate("/adminDashboard");
        } else {
          navigate("/userDashboard");
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center px-16 py-12 relative overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50">
        {/* Decorative blobs */}
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
            Welcome back,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
              keep learning.
            </span>
          </h2>

          <p className="text-gray-500 text-[15px] leading-relaxed mb-10">
            Log in to access your courses, mentors, and study tools — all in one place.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8">
            {[
              { val: "50K+", lbl: "Students" },
              { val: "300+", lbl: "Courses" },
              { val: "98%", lbl: "Satisfaction" },
            ].map((s, i) => (
              <React.Fragment key={s.val}>
                {i > 0 && <div className="w-px h-8 bg-gray-200" />}
                <div>
                  <div className="text-xl font-bold text-indigo-900">{s.val}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{s.lbl}</div>
                </div>
              </React.Fragment>
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
          Student Portal
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Sign in</h1>
        <p className="text-sm text-gray-400 mb-8">Enter your credentials to continue</p>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-medium text-gray-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-[12px] text-purple-600 hover:text-purple-800 transition"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-[14px] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-[15px] font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl shadow-md shadow-purple-100 hover:opacity-90 transition hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {loading ? "Signing in..." : "Sign in to StudyWave"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">New to StudyWave?</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Sign up link */}
        <p className="text-center text-[13px] text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-purple-600 font-semibold hover:text-purple-800 transition"
          >
            Sign up free →
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;