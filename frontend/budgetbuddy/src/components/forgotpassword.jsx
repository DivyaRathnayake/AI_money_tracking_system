import React, { useState } from "react";
import axios from "axios";
import { FaTimes } from "react-icons/fa"; // ❌ Cut/close icon

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/forgot-password", { email });
      alert(res.data.message); // ✅ Success popup
      setEmail(""); // clear input
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong"); // ❌ Error popup
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-200 to-white">
      {/* Navbar */}
      <nav className="bg-white p-4 text-gray-500 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="font-bold text-lg text-purple-gray">BudgetBuddy</div>
          
        </div>
      </nav>

      {/* Forgot Password Box */}
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="relative bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
          {/* Cut Mark (Return to Login) */}
          <a
            href="/login"
            className="absolute top-3 right-3 text-gray-400 hover:text-purple-500 transition"
            title="Back to Login"
          >
            <FaTimes size={20} />
          </a>

          <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
            Forgot Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              type="submit"
              className="w-full bg-purple-900 text-white py-3 rounded-lg hover:bg-purple-500 transition"
            >
              Send Reset Link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
