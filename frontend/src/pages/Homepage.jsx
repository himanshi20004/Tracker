import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-white overflow-hidden">

      {/* NAVBAR */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full flex justify-between items-center px-12 py-6 shadow-sm bg-white/70 backdrop-blur-lg"
      >
        {/* Logo */}
        <div className="flex gap-2 items-center">
          <div className="p-2 bg-purple-300 rounded-full shadow">
            <span className="text-purple-800 text-xl font-bold">📘</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">StudyWave</h1>
        </div>

        {/* Menu */}
        <div className="flex gap-10 text-lg text-gray-700 font-medium">
          <Link to="/courses" className="hover:text-purple-600 transition">Courses</Link>
          <Link to="/mentorship" className="hover:text-purple-600 transition">Mentorship</Link>
          <Link to="/tools" className="hover:text-purple-600 transition">Study Tools</Link>
          <Link to="/contact" className="hover:text-purple-600 transition">Contact</Link>
        </div>

        {/* Right Buttons */}
        <div className="flex gap-6">
          <Link 
            to="/login"
            className="text-gray-800 hover:text-purple-600 transition"
          >
            Log In
          </Link>

          <Link
            to="/register"
            className="px-5 py-2 rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-500 shadow hover:scale-105 transition"
          >
            Sign Up
          </Link>
        </div>
      </motion.nav>

      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row items-center justify-between px-20 pt-20 pb-10">

        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
          className="max-w-xl"
        >
          <h1 className="text-6xl font-extrabold leading-tight text-gray-900">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
              Learn Smarter,
            </span>
            <br /> Not Harder.
          </h1>

          <p className="mt-6 text-gray-600 text-lg">
            Your personalized learning platform with structured courses,
            live mentorship, productivity tools, and performance boosters —
            everything you need to reach your highest potential.
          </p>

          <div className="flex gap-6 mt-10">
            <Link
              to="/register"
              className="px-7 py-3 text-lg font-medium rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg hover:scale-105 transition"
            >
              Start Learning
            </Link>

            <Link
              to="/login"
              className="px-7 py-3 text-lg font-medium rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-100 transition shadow"
            >
              Log In
            </Link>
          </div>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="relative mt-14 md:mt-0"
        >
          {/* Purple Glow */}
          <div className="w-[420px] h-[500px] bg-gradient-to-b from-purple-200 via-purple-50 to-transparent rounded-full absolute top-10 blur-3xl -z-10"></div>

          <img
            src="/student.png"
            alt="Student"
            className="w-[380px] drop-shadow-2xl object-cover"
          />
        </motion.div>

      </div>
    </div>
  );
};

export default Homepage;
