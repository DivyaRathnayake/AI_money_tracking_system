import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import recommendationsImage from "../assets/recommendations.png";

export default function RecommendationPage() {
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [itemPrice, setItemPrice] = useState("");
  const [message, setMessage] = useState("");
  const [budgetPlan, setBudgetPlan] = useState([]);
  const [balance, setBalance] = useState(0);
  const [price, setPrice] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

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

  const handleCheck = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/recommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ income, expenses, itemPrice }),
      });

      const data = await res.json();
      setMessage(data.recommendation || "No recommendation received.");
      setBudgetPlan(data.budgetPlan || []);
      setBalance(data.balance || 0);
      setPrice(data.price || 0);

      if (data.budgetPlan && data.budgetPlan.length > 0) {
        setShowModal(true); 
      }
    } catch (err) {
      console.error("Error fetching recommendation:", err);
      setMessage("Something went wrong while fetching recommendation.");
      setBudgetPlan([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-100 to-white relative items-center">
    
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

    
      <img
        src={recommendationsImage}
        alt="Recommendations"
        className="absolute top-20 right-20 w-60 h-70 object-contain"
      />

      <h1 className="text-3xl font-bold mt-14 mb-14 text-center">
        We give recommendations for your future purchases
      </h1>

   
      <div className="bg-pink-100 p-10 rounded-lg shadow-lg w-96">
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

        <label className="block font-semibold mb-2">
          Price of Item you want to buy
        </label>
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

   
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg relative">
            <h2 className="text-xl font-bold mb-4 text-center">Budget Plan</h2>
            <p className="mb-2">Current Balance: LKR {balance.toFixed(2)}</p>
            <p className="mb-4">Item Price: LKR {price.toFixed(2)}</p>
            <ul className="list-disc ml-5 mb-4">
              {budgetPlan.map((plan, index) => (
                <li key={index}>
                  Save LKR {plan.savePerMonth.toLocaleString()} per month for {plan.months} {plan.months === 1 ? "month" : "months"}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowModal(false)}
              className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-800 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
