import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import aboutImage from "../assets/about.png"; // Make sure this image exists
import AOS from "aos";
import "aos/dist/aos.css";

const About = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-200 to-white">
      {/* Navbar */}
      <nav className="bg-white p-4 text-gray-500">
        <div className="container mx-auto flex justify-between items-center">
          <div className="font-bold text-m">BudgetBuddy</div>
          <div className="flex justify-center space-x-10 flex-grow">
            <a href="/" className="hover:text-gray-300">Home</a>
            <a href="#" className="hover:text-gray-300">About</a>
          </div>
        </div>
      </nav>

      {/* About Section */}
      <div className="flex flex-col items-center justify-center py-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4" data-aos="fade-up">About Us</h1>

        <div className="flex flex-col lg:flex-row items-center justify-center py-10 px-6 lg:px-16">
          <div className="lg:w-1/2 text-center lg:text-left" data-aos="fade-right">
            <p className="pt-2 text-2xl italic text-gray-700">
              Our platform helps you track income, expenses, and set budgets, making financial decisions simple and smart.
            </p>
            <p className="text-2xl pt-4 italic text-gray-700 mt-2">
              With AI-powered recommendations, automatic expense categorization, and visual insights, Budget Buddy helps you understand
              your spending patterns and stay on track with your goals.
            </p>
            <button
              className="mt-10 px-6 py-3 bg-purple-900 text-white rounded-lg shadow-md hover:bg-purple-700"
              onClick={() => navigate("/help")}
              data-aos="zoom-in"
            >
              Help and Support
            </button>
          </div>

          <div className="lg:w-1/2 flex justify-center mt-6 lg:mt-0" data-aos="fade-left">
            <img src={aboutImage} alt="Financial Planning" className="max-w-xs md:max-w-md" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-lg py-1 text-gray-700 font-semibold mt-[40px]" data-aos="fade-up">
        Join us today and let Budget Buddy be your trusted companion on the path to financial freedom!
      </div>
    </div>
  );
};

export default About;
