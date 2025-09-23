import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from './components/Home';
import WelcomePage from './components/Welcome';
import SignUpPage from './components/signup';
import LoginPage from './components/login';
import HelloPage from './components/hello';
import AboutPage from './components/about';
import HelpPage from './components/help';
import AddIncomePage from './components/addincome';
import AddExpensesPage from './components/addexpenses';
import IncomeGraphPage from './components/IncomeGraphPage';
import ExpensesGraphPage from './components/ExpensesGraphPage';
import Recommendations from './components/recommendations';
import ForgotPassword from "./components/forgotpassword";
import ResetPassword from "./components/resetpassword";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/hello' element={<HelloPage />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path='/help' element={<HelpPage />} />
        <Route path="/addincome" element={<AddIncomePage />} />
        <Route path="/addexpenses" element={<AddExpensesPage />} />
        <Route path="/IncomeGraphPage" element={<IncomeGraphPage />} />
        <Route path="/ExpensesGraphPage" element={<ExpensesGraphPage />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />


      </Routes>
    </Router>
  );
}

export default App;
