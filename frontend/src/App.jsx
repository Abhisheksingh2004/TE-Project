import React from "react";
import Predictor from "./pages/Predictor.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Navbar from "./components/Navbar.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div className="bg-black w-full min-h-screen relative">
        <Navbar />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/predictor" element={<Predictor />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
