import React, { useEffect } from "react";
import { FaUser } from "react-icons/fa";
import help from "../assets/help.png";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link } from "react-router-dom";

const HelloPage = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-purple-300 p-4 text-gray-700" data-aos="fade-down">
        <div className="container mx-auto flex justify-between items-center">
          <div className="font-bold text-lg">BudgetBuddy</div>
          <div className="flex justify-center space-x-10 flex-grow">
            <Link to="/" className="hover:text-gray-900" data-aos="fade-down" data-aos-delay="100">Home</Link>
            <Link to="/about" className="hover:text-gray-900" data-aos="fade-down" data-aos-delay="200">About</Link>

          </div>
         
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow text-center p-10">
        <h1 className="text-3xl font-bold mb-4" data-aos="fade-up" data-aos-delay="200">
          Need Help?
        </h1>
        
        <img
          src={help}
          alt="Budget Management"
          className="w-3/5 max-w-lg mb-6"
          data-aos="zoom-in"
          data-aos-delay="600"
        />

        <p className="text-2xl font-semibold text-gray-600 mb-6" data-aos="fade-up" data-aos-delay="400">
        📧 Contact us at budgetbuddysupport@gmail.com for assistance.
        </p>
      </div>
    </div>
  );
};

export default HelloPage;
