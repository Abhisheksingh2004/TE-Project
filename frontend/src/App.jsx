import React from "react";
import Home from "./pages/Home.jsx"; // Make sure the path matches the file
import LiquidEther from "./components/LiquidEther.jsx";

function App() {
  return (
    <div className="relative w-full h-screen bg-[#060010] overflow-hidden">
      <LiquidEther
    colors={[ '#5227FF', '#FF9FFC', '#B19EEF' ]}
    mouseForce={20}
    cursorSize={100}
    isViscous={false}
    viscous={30}
    iterationsViscous={32}
    iterationsPoisson={32}
    resolution={0.5}
    isBounce={false}
    autoDemo={true}
    autoSpeed={0.5}
    autoIntensity={2.2}
    takeoverDuration={0.25}
    autoResumeDelay={3000}
    autoRampDuration={0.6}
  />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <Home />
      </div>
    </div>
  );
}

export default App;
