import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import jsPDF from "jspdf";

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpensesGraphPage = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  // Fetch expenses and total from backend
  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/expense", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setExpenses(Array.isArray(data.expenses) ? data.expenses : []);
        setTotal(Number(data.total || 0));
      } else {
        alert(data.message || "Failed to fetch expenses");
      }
    } catch (err) {
      console.error(err);
      alert("Backend not reachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const chartData = {
    labels: expenses.map((i) => i.source),
    datasets: [
      {
        data: expenses.map((i) => (total > 0 ? ((Number(i.amount) / total) * 100).toFixed(2) : 0)),
        backgroundColor: ["#8b5cf6", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"],
        borderWidth: 1,
      },
    ],
  };

  const generatePDF = () => {
    if (!chartRef.current) return;
    const chartImage = chartRef.current.toBase64Image();

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;

    pdf.setFontSize(16);
    pdf.text(`Total Expenses: ${total}`, pageWidth / 2, 15, { align: "center" });

    const chartWidth = 120;
    const chartHeight = (chartRef.current.height / chartRef.current.width) * chartWidth;
    const chartX = (pageWidth - chartWidth) / 2;
    pdf.addImage(chartImage, "PNG", chartX, 25, chartWidth, chartHeight);

    let yPos = 25 + chartHeight + 10;
    pdf.setFontSize(12);
    expenses.forEach((item, index) => {
      const percent = total > 0 ? ((item.amount / total) * 100).toFixed(2) : 0;
      pdf.text(`${index + 1}. ${item.source}: ${percent}%`, margin, yPos);
      yPos += 8;
    });

    pdf.save("expenses_chart.pdf");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-200 to-white">
      {/* Navbar */}
      <nav className="bg-pink-300 p-4 text-gray-700 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="font-bold text-lg">BudgetBuddy</div>
          <div className="flex justify-center space-x-10 flex-grow">
            <Link to="/" className="hover:text-gray-900">Home</Link>
            <Link to="/about" className="hover:text-gray-900">About</Link>
            <Link to="/addincome" className="hover:text-gray-900">Income</Link>
            <Link to="/expenses" className="hover:text-gray-900">Expenses</Link>
            <Link to="/recommendations" className="hover:text-gray-900">Recommendations</Link>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center space-x-2"
          >
            <FaUser /><span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Chart and Expenses List */}
      <div className="bg-white p-6 rounded-lg shadow-lg mt-10 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Your Total Expenses</h2>

        {loading ? (
          <p className="text-center">Loading expenses...</p>
        ) : expenses.length === 0 ? (
          <p className="text-center text-gray-500">No expenses found. Add some first!</p>
        ) : (
          <div className="flex flex-col items-center">
            <div style={{ width: "300px", height: "300px" }}>
              <Doughnut ref={chartRef} data={chartData} options={{ maintainAspectRatio: false }} />
            </div>

            <ul className="mt-4 w-full">
              {expenses.map((i, index) => (
                <li key={index} className="flex justify-between p-2 border-b">
                  <span>{i.source}</span>
                  <span>{total > 0 ? ((i.amount / total) * 100).toFixed(2) : 0}%</span>
                </li>
              ))}
            </ul>

            <p className="mt-2 font-semibold text-lg">Total: {total}</p>
          </div>
        )}

        <button
          onClick={generatePDF}
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-500"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default ExpensesGraphPage;
