import { useState } from "react";

function Home() {
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
      <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-md p-8 transition-transform duration-300 hover:scale-105">
        
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          ⚡ Energy Consumption Predictor
        </h1>

        <input
          type="number"
          placeholder="Enter population"
          value={population}
          onChange={(e) => setPopulation(e.target.value)}
          className="w-full p-4 mb-5 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm shadow-inner transition-all duration-300"
        />

        <div className="flex gap-4 mb-6">
          <button
            onClick={getWorldPrediction}
            className="flex-1 py-3 rounded-xl bg-blue-600/70 hover:bg-blue-700/80 text-white font-medium shadow-lg transition-transform duration-200 hover:scale-105"
          >
            Predict World
          </button>
          <button
            onClick={getIndiaPrediction}
            className="flex-1 py-3 rounded-xl bg-green-600/70 hover:bg-green-700/80 text-white font-medium shadow-lg transition-transform duration-200 hover:scale-105"
          >
            Predict India
          </button>
        </div>

        {worldPrediction && (
          <p className="text-center text-lg text-blue-400 mb-2 animate-fadeIn">
            🌎 World Energy: <span className="font-semibold">{worldPrediction} TWh</span>
          </p>
        )}

        {indiaPrediction && (
          <p className="text-center text-lg text-green-400 animate-fadeIn">
            🇮🇳 India Energy: <span className="font-semibold">{indiaPrediction} MU</span>
          </p>
        )}
      </div>
  );
}

export default Home;
