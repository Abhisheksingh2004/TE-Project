import { useState, useRef } from "react";
import './Predictor.css'

function Predictor() {
  const [population, setPopulation] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [predictionType, setPredictionType] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [glow, setGlow] = useState(false);
  const [mode, setMode] = useState('simple'); // 'simple' or 'precision'

  // Precision flow state
  const [sessionId, setSessionId] = useState(null);
  const [sessionTarget, setSessionTarget] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [precisionReason, setPrecisionReason] = useState("");
  const [loading, setLoading] = useState(false);

  const [fallbackUsed, setFallbackUsed] = useState(false); // new: indicate fallback
  const audioRef = useRef(null); // To control sound playback

  // Model parameters (from your training output)
  const INDIA_INTERCEPT = 24555.33815149112;
  const INDIA_SLOPE = 0.00039834694212827833;

  const WORLD_INTERCEPT = 718.7845234720688;
  const WORLD_SLOPE = 2.1107729485592695e-06;

  // Play sound + trigger glow + delay result
  const triggerPrediction = (value, type, usedFallback = false) => {
    setGlow(true);
    setShowResult(false);
    setPrediction(null);
    setPredictionType("");
    setFallbackUsed(usedFallback);

    // Play sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to start
      audioRef.current.play().catch((err) => console.warn("Audio play failed:", err));
    }

    // Show result after 1 second (sync with glow + sound)
    setTimeout(() => {
      setPrediction(value);
      setPredictionType(type);
      setShowResult(true);
      setGlow(false);
    }, 2000);
  };

  // Fallback prediction using linear regression y = a + b*x
  const computeFallback = (pop, target) => {
    const x = Number(pop);
    if (!isFinite(x)) return null;

    let y;
    if (target === 'india') {
      y = INDIA_INTERCEPT + INDIA_SLOPE * x;
    } else {
      // default to world
      y = WORLD_INTERCEPT + WORLD_SLOPE * x;
    }
    // Round to 2 decimals for display
    return Math.round(y * 100) / 100;
  };

  const safeFetchJson = async (url, options) => {
    // wrapper that returns { ok, data, error }
    try {
      const res = await fetch(url, options);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        return { ok: false, error: json || { message: 'Request failed' } };
      }
      return { ok: true, data: json };
    } catch (err) {
      return { ok: false, error: err };
    }
  };

  const getWorldPrediction = async () => {
    if (!population || Number(population) <= 0) return;
    setFallbackUsed(false);
    try {
      const { ok, data } = await safeFetchJson(`http://127.0.0.1:5000/api/world/${population}`);
      if (ok && data && data["Predicted Energy Consumption (TWh)"] != null) {
        triggerPrediction(data["Predicted Energy Consumption (TWh)"], "world", false);
      } else {
        // fallback
        const fallbackValue = computeFallback(population, 'world');
        if (fallbackValue == null) throw new Error('Invalid population for fallback');
        console.warn('World API failed — using frontend fallback linear model.');
        triggerPrediction(fallbackValue, "world", true);
      }
    } catch (err) {
      console.error("World prediction failed:", err);
      const fallbackValue = computeFallback(population, 'world');
      if (fallbackValue != null) {
        triggerPrediction(fallbackValue, "world", true);
      } else {
        alert('Could not compute prediction. Check population input.');
      }
    }
  };

  const getIndiaPrediction = async () => {
    if (!population || Number(population) <= 0) return;
    setFallbackUsed(false);
    try {
      const { ok, data } = await safeFetchJson(`http://127.0.0.1:5000/api/india/${population}`);
      if (ok && data && data["Predicted Energy Consumption (TWh)"] != null) {
        triggerPrediction(data["Predicted Energy Consumption (TWh)"], "india", false);
      } else {
        // fallback
        const fallbackValue = computeFallback(population, 'india');
        if (fallbackValue == null) throw new Error('Invalid population for fallback');
        console.warn('India API failed — using frontend fallback linear model.');
        triggerPrediction(fallbackValue, "india", true);
      }
    } catch (err) {
      console.error("India prediction failed:", err);
      const fallbackValue = computeFallback(population, 'india');
      if (fallbackValue != null) {
        triggerPrediction(fallbackValue, "india", true);
      } else {
        alert('Could not compute prediction. Check population input.');
      }
    }
  };

  // Precision (RAG-style) flow: start session
  const startPrecision = async (target) => {
    if (!population || Number(population) <= 0) return;
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/precision/start", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ population: Number(population), target }),
      });
      const data = await res.json();
      if (res.ok) {
        setSessionId(data.session_id);
        setSessionTarget(target);
        setCurrentQuestion(data.question);
      } else {
        console.error(data);
        alert(data.error || 'Failed to start precision flow');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const sendPrecisionAnswer = async (answer) => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/precision/respond", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, answer }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        alert(data.error || 'Failed to send answer');
        return;
      }

      if (data.done) {
        setPrecisionReason(data.reason || '');
        // finalize and show prediction
        setSessionId(null);
        // If server gave prediction use it, otherwise fallback compute
        const finalPrediction = data.prediction ?? computeFallback(population, sessionTarget || 'world');
        const usedFallback = data.prediction == null;
        triggerPrediction(finalPrediction, sessionTarget || 'world', usedFallback);
      } else {
        setCurrentQuestion(data.question);
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setLoading(false);
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

          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3">
              ⚡ Energy Prediction Based on Population
            </h1>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setMode('simple')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${mode==='simple' ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-200'}`}>
                Simple
              </button>
              <button
                onClick={() => setMode('precision')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${mode==='precision' ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-200'}`}>
                Precision
              </button>
            </div>
          </div>

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
            {mode === 'simple' ? (
              <>
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
              </>
            ) : (
              // Precision mode: buttons start the precision flow
              <>
                <button
                  onClick={() => startPrecision('world')}
                  disabled={loading || glow || !population || Number(population) <= 0}
                  className="flex-1 py-3 rounded-xl bg-blue-600/70 hover:bg-blue-700/80 text-white font-semibold 
                             shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Starting...' : 'Precision World'}
                </button>
                <button
                  onClick={() => startPrecision('india')}
                  disabled={loading || glow || !population || Number(population) <= 0}
                  className="flex-1 py-3 rounded-xl bg-green-600/70 hover:bg-green-700/80 text-white font-semibold 
                             shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Starting...' : 'Precision India'}
                </button>
              </>
            )}
          </div>

          {/* Precision question flow UI */}
          {mode === 'precision' && sessionId && currentQuestion && (
            <div className="mb-4">
              <div className="text-white mb-2">{currentQuestion}</div>
              <div className="flex gap-3">
                <button onClick={() => sendPrecisionAnswer('yes')} disabled={loading} className="flex-1 py-2 rounded-xl bg-green-600 text-white">Yes</button>
                <button onClick={() => sendPrecisionAnswer('no')} disabled={loading} className="flex-1 py-2 rounded-xl bg-red-600 text-white">No</button>
              </div>
            </div>
          )}

          {/* ========== SINGLE RESULT – AFTER GLOW + SOUND ========== */}
          {showResult && prediction !== null && (
            <div
              className={`text-center text-lg animate-in fade-in slide-in-from-bottom duration-700 ${predictionType === "world" ? "text-white" : "text-white"
                }`}
            >
              <div className="mb-2">
                <span className="font-medium">
                  {predictionType === "world" ? "World Energy:" : "India Energy:"}
                </span>{' '}
                <span className="font-bold text-xl">
                  {prediction} TWh
                </span>
              </div>

              {/* small badge to indicate fallback */}
              {/* {fallbackUsed && (
                <div className="text-sm text-yellow-300">
                  (Displayed using local linear regression fallback)
                </div>
              )} */}

              {/* show precision reason if any */}
              {precisionReason && (
                <div className="mt-2 text-sm text-gray-300">{precisionReason}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Predictor;
