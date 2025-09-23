import { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { CheckCircleIcon, XCircleIcon } from "lucide-react"; 
import moneypig from "../assets/moneypig.jpg";

const LoginPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: '', type: '' }), 2500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (username.trim() === '' || password.trim() === '') {
      showPopup("Please enter both username and password.", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        showPopup("Login successful!", "success");
        localStorage.setItem("token", data.token);
        setTimeout(() => navigate("/hello"), 1500);
      } else {
        showPopup(data.message || "Login failed", "error");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      showPopup("Something went wrong", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative">
    
      {popup.show && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
          <div
            className={`flex items-center space-x-3 px-6 py-3 rounded-xl shadow-lg text-white text-lg font-semibold animate-fadeIn ${
              popup.type === "success" ? "bg-green-600" : "bg-red-600"
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

    
      <nav className="bg-purple-300 p-4 text-gray-500">
        <div className="container mx-auto flex justify-between items-center">
          <div className="font-bold text-m">BudgetBuddy</div>
          <div className="flex justify-center space-x-10 flex-grow">
            <a href="/" className="hover:text-gray-300">Home</a>
            <a href="/about" className="hover:text-gray-300">About</a>
          </div>
        </div>
      </nav>

    
      <div className="flex items-center justify-center h-full flex-grow">
        <div className="bg-white p-8 rounded-lg shadow-lg flex w-3/4 max-w-4xl">
      
          <div className="hidden lg:flex w-3/4 justify-center items-center">
            <img
              src={moneypig}
              alt="money pig"
              className="max-w-xs md:max-w-md rounded-lg"
            />
          </div>

        
          <div className="w-1/2 p-6">
            <h1 className="text-2xl font-bold text-center mb-6">BUDGET BUDDY</h1>
            <h2 className="text-xl font-semibold text-center mb-4">Login</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-purple-900 hover:bg-purple-500 text-white w-[50%] font-bold py-2 px-4 rounded"
                >
                  Login
                </button>
          
                <Link className="text-purple-900 hover:text-purple-500" to="/forgotpassword">
                  Forgot password?
                </Link>
              </div>
              <div className="text-center mt-6">
                <span className="text-gray-600">Don't have an account? </span>
                <Link to="/signup" className="text-blue-500 hover:text-blue-800">Sign up now</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
