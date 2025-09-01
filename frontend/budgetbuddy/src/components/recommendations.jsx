import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import recommendationsImage from "../assets/recommendations.png";

export default function RecommendationPage() {
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [itemPrice, setItemPrice] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // 🔹 Fetch total income & expenses automatically from backend
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/summary", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setIncome(data.total_income || 0);
        setExpenses(data.total_expenses || 0);
      })
      .catch((err) => console.error("Error fetching summary:", err));
  }, []);

  const handleCheck = () => {
    const totalIncome = parseFloat(income) || 0;
    const totalExpenses = parseFloat(expenses) || 0;
    const price = parseFloat(itemPrice) || 0;

    const balance = totalIncome - totalExpenses;

    if (balance <= 0) {
      setMessage("⚠️ You don’t have any savings. Better to save before buying.");
    } else if (price <= balance * 0.3) {
      setMessage("✅ Good choice! You can afford this purchase safely.");
    } else if (price <= balance) {
      setMessage("🟡 You can buy it, but it may affect your savings.");
    } else {
      setMessage("❌ Not affordable right now. Try saving more first.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-100 to-white relative items-center">
      {/* Navbar */}
      <nav className="bg-pink-300 p-4 text-gray-700 shadow-md w-full">
        <div className="container mx-auto flex justify-between items-center">
          <div className="font-bold text-lg">BudgetBuddy</div>
          <div className="flex justify-center space-x-10 flex-grow">
            <Link to="/" className="hover:text-gray-900">Home</Link>
            <Link to="/about" className="hover:text-gray-900">About</Link>
            <Link to="/addincome" className="hover:text-gray-900">Income</Link>
            <Link to="/addexpenses" className="hover:text-gray-900">Expenses</Link>
            <Link to="/recommendations" className="hover:text-gray-900">Recommendations</Link>
          </div>
          <button
            onClick={handleLogout}
            className="bg-pink-800 text-white px-4 py-2 rounded hover:bg-pink-600 flex items-center space-x-2"
          >
            <FaUser />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* ✅ Image in top-right corner */}
      <img
        src={recommendationsImage}
        alt="Recommendations"
        className="absolute top-20 right-20 w-60 h-70 object-contain"
      />

      {/* Topic with extra spacing */}
      <h1 className="text-3xl font-bold mt-14 mb-14 text-center">
        We give recommendations for your future purchases
      </h1>
      
      {/* Body section */}
      <div className="bg-pink-100 p-10 rounded-lg shadow-lg w-96">
        {/* Auto-filled */}
        <label className="block font-semibold mb-2">Total Income</label>
        <input
          type="number"
          value={income}
          readOnly
          className="w-full p-2 border rounded mb-4 bg-gray-100"
        />

        <label className="block font-semibold mb-2">Total Expenses</label>
        <input
          type="number"
          value={expenses}
          readOnly
          className="w-full p-2 border rounded mb-4 bg-gray-100"
        />

        <label className="block font-semibold mb-2">Price of Item you want to buy</label>
        <input
          type="number"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <button
          onClick={handleCheck}
          className="bg-purple-700 text-white px-6 py-2 rounded-full hover:bg-purple-800 w-full"
        >
          Check Recommendation
        </button>

        {message && (
          <div className="mt-4 text-center font-medium text-gray-800">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
