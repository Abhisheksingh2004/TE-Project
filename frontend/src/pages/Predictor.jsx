import { useState, useRef } from "react";
import './Predictor.css'

function Predictor() {
  const [population, setPopulation] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [predictionType, setPredictionType] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [glow, setGlow] = useState(false);

  const audioRef = useRef(null); // To control sound playback

  // Play sound + trigger glow + delay result
  const triggerPrediction = (value, type) => {
    setGlow(true);
    setShowResult(false);
    setPrediction(null);
    setPredictionType("");

    // Play sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to start
      audioRef.current.play().catch((err) => console.warn("Audio play failed:", err));
    }

    // Show result after 2 seconds (sync with glow + sound)
    setTimeout(() => {
      setPrediction(value);
      setPredictionType(type);
      setShowResult(true);
      setGlow(false);
    }, 1000);
  };

  const getWorldPrediction = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/world/${population}`);
      const data = await res.json();
      const value = data["Predicted Energy Consumption (TWh)"];
      triggerPrediction(value, "world");
    } catch (err) {
      console.error("World prediction failed:", err);
    }
  };

  const getIndiaPrediction = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/india/${population}`);
      const data = await res.json();
      const value = data["Predicted Energy Consumption (TWh)"];
      triggerPrediction(value, "india");
    } catch (err) {
      console.error("India prediction failed:", err);
    }
  };

  return (
    <>
      {/* Hidden Audio Player */}
      <audio ref={audioRef} src="/voice/sweep1.mp3" preload="auto" />

      {/* ========== EDGE GLOW BARS ========== */}
      <div
        className={`edge top ${glow ? "active" : ""}`}
        style={{ background: "linear-gradient(to right, #ff3399, #3399ff)" }}
      />
      <div
        className={`edge bottom ${glow ? "active" : ""}`}
        style={{ background: "linear-gradient(to right, #ff9933, #9933ff)" }}
      />
      <div
        className={`edge left ${glow ? "active" : ""}`}
        style={{ background: "linear-gradient(to bottom, #ff3399, #ff9933)" }}
      />
      <div
        className={`edge right ${glow ? "active" : ""}`}
        style={{ background: "linear-gradient(to bottom, #3399ff, #9933ff)" }}
      />

      {/* ========== MAIN CARD ========== */}
      <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-md p-8 
                        transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/20 pointer-events-auto">

          <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-6 tracking-tight">
            ⚡ Energy Prediction Based on Population
          </h1>

          <input
            type="number"
            placeholder="Enter population"
            value={population}
            onChange={(e) => setPopulation(e.target.value)}
            className="w-full p-4 mb-2 rounded-xl border border-white/20 bg-white/10 text-white 
                       placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 
                       backdrop-blur-sm shadow-inner transition-all duration-300 
                       focus:bg-white/20 focus:scale-[1.01]"
          />
          {population && Number(population) <= 0 && (
            <p className="text-red-500 text-sm mb-3">Population must be greater than 0</p>
          )}

          <div className="flex gap-3 mb-6">
            <button
              onClick={getWorldPrediction}
              disabled={glow || !population || Number(population) <= 0}
              className="flex-1 py-3 rounded-xl bg-blue-600/70 hover:bg-blue-700/80 text-white font-semibold 
                         shadow-lg transition-all duration-200 hover:scale-105 
                         hover:shadow-blue-500/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Predict World
            </button>
            <button
              onClick={getIndiaPrediction}
              disabled={glow || !population || Number(population) <= 0}
              className="flex-1 py-3 rounded-xl bg-green-600/70 hover:bg-green-700/80 text-white font-semibold 
                         shadow-lg transition-all duration-200 hover:scale-105 
                         hover:shadow-green-500/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Predict India
            </button>
          </div>

          {/* ========== SINGLE RESULT – AFTER GLOW + SOUND ========== */}
          {showResult && prediction !== null && (
            <div
              className={`text-center text-lg animate-in fade-in slide-in-from-bottom duration-700 ${predictionType === "world" ? "text-white" : "text-white"
                }`}
            >
              <span className="font-medium">
                {predictionType === "world" ? "World Energy:" : "India Energy:"}
              </span>{' '}
              <span className="font-bold text-xl">
                {prediction} TWh
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Predictor;