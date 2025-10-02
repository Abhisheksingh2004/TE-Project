import React, { useState } from "react";

function App() {
  const [population, setPopulation] = useState("");
  const [worldPrediction, setWorldPrediction] = useState(null);
  const [indiaPrediction, setIndiaPrediction] = useState(null);

  const getWorldPrediction = async () => {
    const res = await fetch(`http://127.0.0.1:5000/api/world/${population}`);
    const data = await res.json();
    setWorldPrediction(data["Predicted Energy Consumption (TWh)"]);
  };

  const getIndiaPrediction = async () => {
    const res = await fetch(`http://127.0.0.1:5000/api/india/${population}`);
    const data = await res.json();
    setIndiaPrediction(data["Predicted Energy Consumption (MU)"]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">Energy Prediction</h1>

        <input
          type="number"
          placeholder="Enter population"
          value={population}
          onChange={(e) => setPopulation(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="flex gap-4 mb-6">
          <button
            onClick={getWorldPrediction}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Predict World
          </button>
          <button
            onClick={getIndiaPrediction}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
          >
            Predict India
          </button>
        </div>

        {worldPrediction && (
          <p className="text-center text-lg text-blue-700 mb-2">
            World Energy: <span className="font-semibold">{worldPrediction} TWh</span>
          </p>
        )}

        {indiaPrediction && (
          <p className="text-center text-lg text-green-700">
             India Energy: <span className="font-semibold">{indiaPrediction} MU</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
