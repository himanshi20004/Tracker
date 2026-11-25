import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  {
    icon: "📚",
    title: "Structured Courses",
    desc: "300+ courses crafted by top educators with clear learning paths, video lessons, and practice sets.",
    bg: "#f3f0ff",
  },
  {
    icon: "🧑‍🏫",
    title: "AI Doubt Mentor",
    desc: "Get personalized step-by-step explanations powered by Gemini AI whenever you get stuck.",
    bg: "#eff6ff",
  },
  {
    icon: "🛠️",
    title: "Smart Study Tools",
    desc: "Personal timetable planner, study resources, and progress trackers to maximize every session.",
    bg: "#f0fdf4",
  },
  {
    icon: "📊",
    title: "Interactive Quizzes",
    desc: "Test your knowledge with timed quizzes, earn points, and climb the classroom leaderboard.",
    bg: "#fff7ed",
  },
  {
    icon: "🎯",
    title: "Goal Tracking",
    desc: "Complete assigned academic tasks before deadlines and stay consistent with gamified rewards.",
    bg: "#fdf2f8",
  },
  {
    icon: "👥",
    title: "Real-Time Chat",
    desc: "Connect instantly with classmates and mentors to discuss coursework and collaborate.",
    bg: "#f0fdfa",
  },
];

const testimonials = [
  {
    name: "Aryan Raj",
    role: "IIT Delhi, CSE",
    initials: "AR",
    avatarBg: "#f3f0ff",
    avatarColor: "#6d28d9",
    quote:
      "StudyWave completely changed how I prepare for exams. The structured paths and AI tutor helped me crack JEE Advanced.",
  },
  {
    name: "Priya Sharma",
    role: "MBBS, AIIMS",
    initials: "PS",
    avatarBg: "#eff6ff",
    avatarColor: "#1d4ed8",
    quote:
      "The timed quizzes and timetable kept me accountable every day. I finally mastered Organic Chemistry.",
  },
  {
    name: "Kartik Mehta",
    role: "Class XII, DPS",
    initials: "KM",
    avatarBg: "#f0fdf4",
    avatarColor: "#15803d",
    quote:
      "I went from struggling with deadlines to scoring 94% in boards. Tracking tasks and points kept me motivated.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

export default function Homepage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden font-sans">
      {/* ── NAVBAR ── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-md">
            <div className="w-2.5 h-2.5 bg-white rounded-full" />
          </div>
          <span className="text-xl font-semibold text-gray-900">StudyWave</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-[14px] text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="px-4 sm:px-5 py-2 text-[14px] font-medium text-white rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 transition shadow-md shadow-purple-100"
          >
            Sign Up Free
          </Link>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="flex flex-col lg:flex-row items-center px-6 md:px-12 pt-12 md:pt-16 pb-16 gap-8 lg:gap-0">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-[52%]"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full mb-5">
            <span className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
            Trusted by 50,000+ students
          </div>

          <h1 className="font-extrabold leading-tight text-gray-900 mb-5 text-4xl sm:text-5xl lg:text-[62px]">
            Learn{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
              Smarter,
            </span>
            <br />
            Not Harder.
          </h1>

          <p className="text-[17px] text-gray-500 leading-relaxed mb-8 max-w-lg">
            Your personalized learning platform with gamified tasks, timed quizzes,
            AI doubt resolution, and real-time collaboration — everything you need to excel.
          </p>

          <div className="flex gap-3 mb-10">
            <Link
              to="/register"
              className="px-7 py-3 text-[15px] font-semibold text-white rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg shadow-purple-200 hover:opacity-90 transition hover:scale-[1.02]"
            >
              Start Learning Free →
            </Link>
          </div>

          <div className="flex items-center gap-6 sm:gap-8">
            {[
              { val: "50K+", lbl: "Active Students" },
              { val: "300+", lbl: "Courses" },
              { val: "98%", lbl: "Satisfaction Rate" },
            ].map((s, i) => (
              <React.Fragment key={s.val}>
                {i > 0 && <div className="w-px h-8 bg-gray-200" />}
                <div>
                  <div className="text-xl font-bold text-gray-900">{s.val}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.lbl}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative flex items-center justify-center w-full lg:w-[48%]"
        >
          <div className="absolute w-72 sm:w-[460px] h-72 sm:h-[480px] bg-gradient-to-b from-purple-200 via-purple-50 to-transparent rounded-full blur-3xl -z-10 opacity-70" />
          <img
            src="/student.png"
            alt="Student studying"
            className="drop-shadow-2xl object-contain relative z-10 w-full max-w-[500px]"
          />
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="px-6 md:px-16 py-20 bg-gray-50">
        <p className="text-xs font-semibold tracking-widest text-purple-600 uppercase mb-3">
          Why StudyWave
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Everything you need to excel
        </h2>
        <p className="text-gray-500 text-[16px] max-w-lg mb-12">
          We combine structured coursework, AI mentorship, and smart productivity tools — all in one place.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: f.bg }}
              >
                {f.icon}
              </div>
              <h3 className="text-[16px] font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="px-6 md:px-16 py-20">
        <p className="text-xs font-semibold tracking-widest text-purple-600 uppercase mb-3">
          Student Love
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
          Real results, real students
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-yellow-400 text-sm mb-3">★★★★★</div>
              <p className="text-[14px] text-gray-600 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{ background: t.avatarBg, color: t.avatarColor }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="mx-6 md:mx-16 mb-20 rounded-3xl bg-gradient-to-r from-purple-600 to-blue-500 p-10 md:p-16 text-center shadow-xl shadow-purple-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to reach your potential?
          </h2>
          <p className="text-white/80 text-[16px] max-w-md mx-auto mb-9">
            Join students already studying smarter on StudyWave. Free to start, no credit card needed.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3.5 text-[15px] font-semibold bg-white text-purple-700 rounded-xl hover:bg-purple-50 transition shadow-md"
            >
              Get Started for Free
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 md:px-16 py-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <span className="text-base font-semibold text-gray-900">StudyWave</span>
        </div>
        <div className="flex gap-7 text-sm text-gray-400">
          <a href="#features" className="hover:text-gray-600 transition">Features</a>
          <Link to="/login" className="hover:text-gray-600 transition">Sign In</Link>
          <Link to="/register" className="hover:text-gray-600 transition">Register</Link>
          <Link to="/forgot-password" className="hover:text-gray-600 transition">Support</Link>
        </div>
        <p className="text-xs text-gray-400">© 2026 StudyWave. All rights reserved.</p>
      </footer>
    </div>
  );
}
