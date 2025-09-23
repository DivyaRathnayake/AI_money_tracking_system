import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import girlhome from "../assets/img.png"; 
import AOS from "aos"; 
import "aos/dist/aos.css"; 

const LandingPage = () => {
  const navigate = useNavigate(); 

  useEffect(() => {
    AOS.init({
      duration: 1000, 
      once: true, // animation should happen only once
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-200 to-white flex flex-col">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center p-4 bg-white shadow-md">
        <h1 className="text-m font-bold text-gray-700">BudgetBuddy</h1>
        <div className="flex items-center font-semibold space-x-6 text-gray-600 justify-center flex-grow">
          <div className="flex space-x-10">
            <a
              href="#"
              className="hover:text-purple-600"
              onClick={(e) => {
                e.preventDefault();
                navigate("/"); 
              }}
            >
              Home
            </a>
            <a
              href="#"
              className="hover:text-purple-600"
              onClick={(e) => {
                e.preventDefault();
                navigate("/about"); 
              }}
            >
              About
            </a>
          </div>
        </div>
        <div className="flex items-center font-semibold space-x-6 text-gray-600">
          <a
            href="#"
            className="hover:text-purple-600"
            onClick={(e) => {
              e.preventDefault(); 
              navigate("/login"); 
            }}
          >
            Login
          </a>
          <span className="text-gray-600">|</span>
          <a
            href="#"
            className="hover:text-purple-600"
            onClick={(e) => {
              e.preventDefault();
              navigate("/signup"); 
            }}
          >
            Signup
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col-reverse lg:flex-row items-center justify-center flex-grow px-6 lg:px-24 py-12">
        <div className="lg:w-1/2 text-center lg:text-left">
          <h2 className="text-5xl font-bold text-gray-900" data-aos="fade-right">
            Your Friendly Budget Assistant
          </h2>
          <p
            className="text-gray-700 font-semibold mt-6 text-lg"
            data-aos="fade-right"
            data-aos-delay="200"
          >
            Take control of your finances with Budget Buddy! Track, analyze, and
            optimize your income and expenses effortlessly. Start your smart
            financial journey today!
          </p>
          <button
            className="mt-6 px-6 py-3 bg-purple-900 text-white rounded-lg shadow-md hover:bg-purple-700"
            data-aos="fade-up"
            data-aos-delay="400"
            onClick={(e) => {
              e.preventDefault();
              navigate("/welcome"); 
            }}
          >
            Get Started
          </button>
        </div>

        <div className="lg:w-1/2 flex justify-center mb-8 lg:mb-0 relative" data-aos="fade-left" data-aos-delay="600">
          <img src={girlhome} alt="Happy user managing finances" className="max-w-xs md:max-w-md" />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
