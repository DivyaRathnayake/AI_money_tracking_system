import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import beginner from "../assets/beginner.png";
import pro from "../assets/pro.png";

const WelcomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-purple-300 p-4 text-gray-500" data-aos="fade-down">
        <div className="container mx-auto flex justify-between items-center">
          <div className="font-bold text-m">BudgetBuddy</div>
          <div className="flex justify-center space-x-10 flex-grow">
            <a href="#" className="hover:text-gray-300" onClick={(e) => { e.preventDefault(); navigate("/"); }}>Home</a>
            <a href="#" className="hover:text-gray-300">About</a>
          </div>
         
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="text-center mt-10" data-aos="zoom-in">
          <h1 className="text-4xl font-bold mb-4">Beginner to Pro</h1>
          <p className="text-lg mb-8">Start Your Journey Toward Smarter Financial Management with Budget Buddy!</p>
        </div>

        {/* Flex Container for Left and Right Sections */}
        <div className="flex justify-between items-start mt-12">
          {/* Part 1: For New Users (Left Side) */}
          <div className="w-[40%] bg-purple-100 p-8 rounded-lg shadow-md mr-4" data-aos="fade-right">
            <div className="text-center">
              <div className="text-xl font-semibold">Create your Account</div>
              <p className="text-m mt-4">Start Your Journey with Budget Buddy!</p>
              <img src={beginner} alt="Happy user managing finances" className="max-w-[250px] mx-auto mt-6" />
              <button
                className="mt-6 w-[50%] px-6 py-3 bg-purple-900 text-white rounded-lg shadow-md hover:bg-purple-700"
                onClick={(e) => { e.preventDefault(); navigate("/signup"); }}
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Part 2: For Returning Users (Right Side) */}
          <div className="w-[40%] bg-purple-100 p-8 rounded-lg shadow-md ml-4" data-aos="fade-left">
            <div className="text-center">
              <div className="text-xl font-semibold">Log in to your Account</div>
              <p className="text-m mt-4">Welcome back to Budget Buddy!</p>
              <img src={pro} alt="Happy user managing finances" className="max-w-[250px] mx-auto mt-6" />
              <button
                className="mt-6 w-[50%] px-6 py-3 bg-purple-900 text-white rounded-lg shadow-md hover:bg-purple-700"
                onClick={(e) => { e.preventDefault(); navigate("/login"); }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
