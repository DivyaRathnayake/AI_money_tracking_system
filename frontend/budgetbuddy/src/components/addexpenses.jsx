import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import expenseImage from "../assets/expenses.png";

// 📌 PDF imports
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AddExpensesPage() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ source: "", amount: "" });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // ✅ Notification state
  const [notification, setNotification] = useState({ message: "", type: "" });

  // Show notification for 3s
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  // Fetch expenses
  const fetchExpenses = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Please login first!", "error");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/expense", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setExpenses(data.expenses || []);
        setTotalExpense(data.total || 0);
      } else {
        showNotification(data?.message || "Failed to fetch expenses", "error");
      }
    } catch (error) {
      console.error("Network error:", error);
      showNotification("Failed to fetch expenses. Is the server running?", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Add / Update expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Please login first!", "error");
      navigate("/login");
      return;
    }

    try {
      let url = "http://localhost:5000/expense";
      let method = "POST";

      if (editMode && currentId) {
        url = `http://localhost:5000/expense/${currentId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        showNotification(editMode ? "Expense updated!" : "Expense added!", "success");
        setFormData({ source: "", amount: "" });
        setEditMode(false);
        setCurrentId(null);
        fetchExpenses();
      } else {
        showNotification(data?.message || "Failed to save expense", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("Failed to save expense", "error");
    }
  };

  // Delete expense
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/expense/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        showNotification("Expense deleted successfully!", "success");
        fetchExpenses();
      } else {
        showNotification(data?.message || "Failed to delete expense", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("Failed to delete expense", "error");
    }
  };

  // Edit expense
  const handleEdit = (expense) => {
    setFormData({ source: expense.source, amount: expense.amount });
    setEditMode(true);
    setCurrentId(expense.id);
  };

  // 📌 Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Expense Report", 14, 15);

    const tableColumn = ["Source", "Amount", "Date"];
    const tableRows = [];

    expenses.forEach((exp) => {
      const expData = [
        exp.source,
        exp.amount,
        new Date(exp.created_at).toLocaleDateString(),
      ];
      tableRows.push(expData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
    });

    doc.text(
      `Total Expense: Rs. ${totalExpense.toLocaleString()}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    doc.save("Expense_Report.pdf");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-100 to-white relative">
      {/* ✅ Notification */}
      {notification.message && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg text-white z-50 ${
            notification.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-pink-300 p-4 text-gray-700 shadow-md">
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

      {/* Main Container */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-8 relative z-10">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {editMode ? "Edit Expense" : "Your Expenses"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4 max-w-md mx-auto">
          <input
            type="text"
            name="source"
            placeholder="Expense Source"
            value={formData.source}
            onChange={handleChange}
            className="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            required
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            className="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-pink-800 text-white px-6 py-2 rounded hover:bg-pink-600 transition-colors"
            >
              {editMode ? "Update" : "Submit"}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setFormData({ source: "", amount: "" });
                  setCurrentId(null);
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Expenses Table */}
        {loading ? (
          <p className="text-center">Loading expenses...</p>
        ) : expenses.length === 0 ? (
          <p className="text-center text-gray-500">No expenses found. Add some!</p>
        ) : (
          <>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">Source</th>
                  <th className="border border-gray-300 px-4 py-2">Amount</th>
                  <th className="border border-gray-300 px-4 py-2">Date</th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td className="border border-gray-300 px-4 py-2">{exp.source}</td>
                    <td className="border border-gray-300 px-4 py-2">{exp.amount}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(exp.created_at).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="bg-pink-600 text-white px-3 py-1 rounded hover:bg-pink-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Expense */}
            <div className="text-right mt-4 font-bold text-lg">
              Total Expense: Rs. {totalExpense.toLocaleString()}
            </div>
          </>
        )}

        {/* Generate Graph Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate("/ExpensesGraphPage")}
            className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-300 transition-colors"
          >
            Generate Graph
          </button>
        </div>

        {/* Download PDF Button */}
        <div className="flex justify-center mt-4">
          <button
            onClick={generatePDF}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-300 transition-colors"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Expense image at bottom-right */}
      <img
        src={expenseImage}
        alt="Expense"
        className="fixed bottom-4 right-4 w-88 h-48 object-contain pointer-events-none z-0"
      />
    </div>
  );
}
