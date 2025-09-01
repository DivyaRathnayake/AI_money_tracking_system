import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import incomeImage from "../assets/income.png";

// 📌 PDF imports
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AddIncomePage = () => {
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ source: "", income: "" });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // 📌 Toast state
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const fetchIncome = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Please login again", "error");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/income", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setIncomes(data.incomes || []);
        setTotalIncome(data.total || 0);
      } else {
        showToast(data.message || "Failed to fetch incomes", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("❌ Backend not reachable", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login again", "error");
      navigate("/login");
      return;
    }

    try {
      let url = "http://localhost:5000/income";
      let method = "POST";

      if (editMode && currentId) {
        url = `http://localhost:5000/income/${currentId}`;
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
        showToast(
          editMode ? "✅ Income updated successfully!" : "✅ Income added successfully!",
          "success"
        );
        setFormData({ source: "", income: "" });
        setEditMode(false);
        setCurrentId(null);
        fetchIncome();
      } else {
        showToast(data.message || "Operation failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("❌ Backend not reachable", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/income/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        showToast("✅ Income deleted successfully!", "success");
        fetchIncome();
      } else {
        showToast(data.message || "Failed to delete income", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("❌ Backend not reachable", "error");
    }
  };

  const handleEdit = (income) => {
    setFormData({ source: income.source, income: income.income });
    setEditMode(true);
    setCurrentId(income.id);
  };

  // 📌 Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Income Report", 14, 15);

    const tableColumn = ["Source", "Income", "Date"];
    const tableRows = [];

    incomes.forEach((income) => {
      const incomeData = [
        income.source,
        income.income,
        new Date(income.created_at).toLocaleDateString(),
      ];
      tableRows.push(incomeData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
    });

    doc.text(
      `Total Income: Rs. ${totalIncome.toLocaleString()}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    doc.save("Income_Report.pdf");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-200 to-white relative">
      {/* Toast Notification */}
      {toast.message && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg text-white text-lg z-50 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-purple-300 p-4 text-gray-700 shadow-md">
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
            className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center space-x-2"
          >
            <FaUser />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-8 relative z-10">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {editMode ? "Edit Income" : "Your Incomes"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4 max-w-md mx-auto">
          <input
            type="text"
            name="source"
            placeholder="Income Source"
            value={formData.source}
            onChange={handleChange}
            className="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <input
            type="number"
            name="income"
            placeholder="Amount"
            value={formData.income}
            onChange={handleChange}
            className="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-purple-900 text-white px-6 py-2 rounded hover:bg-purple-600 transition-colors"
            >
              {editMode ? "Update" : "Submit"}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setFormData({ source: "", income: "" });
                  setCurrentId(null);
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Incomes Table */}
        {loading ? (
          <p className="text-center">Loading incomes...</p>
        ) : incomes.length === 0 ? (
          <p className="text-center text-gray-500">No incomes found. Add some!</p>
        ) : (
          <>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">Source</th>
                  <th className="border border-gray-300 px-4 py-2">Income</th>
                  <th className="border border-gray-300 px-4 py-2">Date</th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((income) => (
                  <tr key={income.id}>
                    <td className="border border-gray-300 px-4 py-2">{income.source}</td>
                    <td className="border border-gray-300 px-4 py-2">{income.income}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(income.created_at).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(income)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(income.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Income */}
            <div className="text-right mt-4 font-bold text-lg">
              Total Income: Rs. {totalIncome.toLocaleString()}
            </div>
          </>
        )}

        {/* Generate Graph Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate("/IncomeGraphPage")}
            className="bg-purple-700 text-white px-6 py-2 rounded hover:bg-purple-300 transition-colors"
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

      {/* Income image at bottom-right */}
      <img
        src={incomeImage}
        alt="Income"
        className="fixed bottom-4 right-4 w-88 h-48 object-contain pointer-events-none z-0"
      />
    </div>
  );
};

export default AddIncomePage;
