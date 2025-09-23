import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import jsPDF from "jspdf";

ChartJS.register(ArcElement, Tooltip, Legend);

const IncomeGraphPage = () => {
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  const fetchIncome = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again");
        navigate("/login");
        return;
      }
      const response = await fetch("http://localhost:5000/income", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setIncomes(Array.isArray(data.incomes) ? data.incomes : []);
      else alert(data.message || "Failed to fetch incomes");
    } catch (err) {
      console.error(err);
      alert("Backend not reachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const incomeArray = Array.isArray(incomes) ? incomes : [];
  const total = incomeArray.reduce((sum, i) => sum + Number(i.income), 0);

  const chartData = {
    labels: incomeArray.map((i) => i.source),
    datasets: [
      {
        data: incomeArray.map((i) => (total > 0 ? ((Number(i.income) / total) * 100).toFixed(2) : 0)),
        backgroundColor: ["#8b5cf6", "#ef4444", "#3b82f6", "#10b981", "#934790", "#8ACCD5"],
        borderWidth: 1,
      },
    ],
  };

  // Generate PDF with total income at top, chart below, then list
  const generatePDF = () => {
    if (!chartRef.current) return;
    const chartImage = chartRef.current.toBase64Image();

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;

    
    pdf.setFontSize(16);
    pdf.text(`Total Income: ${total}`, pageWidth / 2, 15, { align: "center" });

    
    const chartWidth = 120; 
    const chartHeight = (chartRef.current.height / chartRef.current.width) * chartWidth;
    const chartX = (pageWidth - chartWidth) / 2; // center horizontally
    pdf.addImage(chartImage, "PNG", chartX, 25, chartWidth, chartHeight);

    
    let yPos = 25 + chartHeight + 10; 
    pdf.setFontSize(12);
    incomeArray.forEach((item, index) => {
      const percent = total > 0 ? ((item.income / total) * 100).toFixed(2) : 0;
      pdf.text(`${index + 1}. ${item.source}: ${percent}%`, margin, yPos);
      yPos += 8;
    });

    pdf.save("income_chart.pdf");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-200 to-white">
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
            <FaUser /><span>Logout</span>
          </button>
        </div>
      </nav>

      
      <div className="bg-white p-6 rounded-lg shadow-lg mt-10 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Your Total Income</h2>

        {loading ? (
          <p className="text-center">Loading incomes...</p>
        ) : incomeArray.length === 0 ? (
          <p className="text-center text-gray-500">No incomes found. Add some first!</p>
        ) : (
          <div className="flex flex-col items-center">
            {/* Chart on screen (normal size) */}
            <div style={{ width: "300px", height: "300px" }}>
              <Doughnut ref={chartRef} data={chartData} options={{ maintainAspectRatio: false }} />
            </div>

            <ul className="mt-4 w-full">
              {incomeArray.map((i, index) => (
                <li key={index} className="flex justify-between p-2 border-b">
                  <span>{i.source}</span>
                  <span>{total > 0 ? ((i.income / total) * 100).toFixed(2) : 0}%</span>
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

export default IncomeGraphPage;
