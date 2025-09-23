import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTimes } from "react-icons/fa";

export default function ResetPassword() {
  const { token } = useParams(); 
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(`http://localhost:5000/reset-password/${token}`, { password });
      alert(res.data.message); 
      navigate("/login"); 
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-200 to-white">
      {/* Navbar */}
      <nav className="bg-white p-4 text-gray-500 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="font-bold text-lg text-gray-600">BudgetBuddy</div>
        
        </div>
      </nav>

      <div className="flex-grow flex items-center justify-center p-6">
        <div className="relative bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
  
          <button
            onClick={() => navigate("/login")}
            className="absolute top-3 right-3 text-gray-400 hover:text-pink-500 transition"
            title="Back to Login"
          >
            <FaTimes size={20} />
          </button>

          <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
            Reset Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-300 transition"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
