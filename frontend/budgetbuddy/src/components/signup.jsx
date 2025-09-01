import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AOS from "aos";
import "aos/dist/aos.css";
import { CheckCircleIcon, XCircleIcon } from "lucide-react"; // ✅ icons
import girl from "../assets/girl.jpg";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Popup state
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: '', type: '' }), 2500);
  };

  const validateField = (name, value) => {
    switch (name) {
      case "username":
        if (!value) return "Username is required";
        if (value.length < 3) return "Username must be at least 3 characters";
        return "";
      case "email":
        if (!value) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Invalid email format";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    // Validate field live
    const error = validateField(id, value);
    setFormErrors({ ...formErrors, [id]: error });
  };

  const handleSignUp = async (event) => {
    event.preventDefault();

    // Validate all fields before submitting
    const errors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        showPopup("Sign up successful!", "success");
        setTimeout(() => navigate('/hello'), 1500);
      } else {
        showPopup(data.message || "Sign up failed.", "error");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      showPopup("Server error. Please try again later.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* ✅ Top Center Popup */}
      {popup.show && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
          <div
            className={`flex items-center space-x-3 px-6 py-3 rounded-xl shadow-lg text-white text-lg font-semibold ${popup.type === "success" ? "bg-green-600" : "bg-red-600"
              }`}
          >
            {popup.type === "success" ? (
              <CheckCircleIcon className="w-6 h-6" />
            ) : (
              <XCircleIcon className="w-6 h-6" />
            )}
            <span>{popup.message}</span>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="bg-purple-300 p-4 text-gray-500" data-aos="fade-down">
        <div className="container mx-auto flex justify-between items-center">
          <div className="font-bold text-m">BudgetBuddy</div>
          <div className="flex justify-center space-x-10 flex-grow">
            <a href="#" className="hover:text-gray-300">Home</a>
            <a href="#" className="hover:text-gray-300">About</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-[900px] flex" data-aos="zoom-in">
          {/* Left Side - Form */}
          <div className="w-1/2 pr-8" data-aos="fade-right">
            <h1 className="text-2xl font-bold text-center mb-6">BUDGET BUDDY</h1>
            <form onSubmit={handleSignUp}>
              {/* Username */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Divya Rathnayake"
                  value={formData.username}
                  onChange={handleChange}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 ${formErrors.username ? 'border-red-500' : ''}`}
                />
                {formErrors.username && <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 ${formErrors.email ? 'border-red-500' : ''}`}
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 ${formErrors.password ? 'border-red-500' : ''}`}
                />
                {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                />
                {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="w-[50%] bg-purple-900 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded"
                  disabled={loading}
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>
              </div>
            </form>

            <p className="text-center text-gray-500 text-xs mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-purple-900 hover:text-purple-500">
                Login Now
              </Link>
            </p>
          </div>

          {/* Right Side - Image */}
          <div className="w-1/2 flex items-center justify-center" data-aos="fade-left">
            <img src={girl} alt="Happy girl" className="max-w-xs md:max-w-md rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
