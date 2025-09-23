import React, { useEffect } from "react";
import { FaUser } from "react-icons/fa";
import welcomehome from "../assets/welcome.png";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link, useNavigate } from "react-router-dom";

const HelloPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const handleLogout = () => {
    
    localStorage.removeItem("token"); 
    navigate("/"); 
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-pink-300 p-4 text-gray-700" data-aos="fade-down">
        <div className="container mx-auto flex justify-between items-center">
          <div className="font-bold text-lg">BudgetBuddy</div>
          <div className="flex justify-center space-x-10 flex-grow">
            <Link to="/" className="hover:text-gray-900" data-aos="fade-down" data-aos-delay="100">Home</Link>
            <Link to="/about" className="hover:text-gray-900" data-aos="fade-down" data-aos-delay="200">About</Link>
            <Link to="/addincome" className="hover:text-gray-900" data-aos="fade-down" data-aos-delay="300">Income</Link>
            <Link to="/expenses" className="hover:text-gray-900" data-aos="fade-down" data-aos-delay="400">Expenses</Link>
            <Link to="/recommendations" className="hover:text-gray-900" data-aos="fade-down" data-aos-delay="500">Recommendations</Link>
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

    
      <div className="flex flex-col items-center justify-center flex-grow text-center p-10">
        <h1 className="text-5xl font-bold mb-4" data-aos="fade-up">Hello,</h1>
        <h1 className="text-5xl font-bold mb-4" data-aos="fade-up" data-aos-delay="200">
          Welcome to Budget Buddy!
        </h1>
        <p className="text-medium text-gray-600 mb-6" data-aos="fade-up" data-aos-delay="400">
          Simplify your financial management with easy tracking, smart insights, and personalized budgeting tools.
        </p>
        <img
          src={welcomehome}
          alt="Budget Management"
          className="w-3/5 max-w-lg mb-6"
          data-aos="zoom-in"
          data-aos-delay="600"
        />
      </div>
    </div>
  );
};

export default HelloPage;
