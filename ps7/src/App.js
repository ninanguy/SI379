import React, { useState, useEffect } from "react";
import Slider from "./Slider";
import "./index.css";

function App() {
  // state for whether the user's guess is visible live (aka "cheating mode")
  const [cheating, setCheating] = useState(false);

  // state for whether hints will be shown after guessing (if they’re close)
  const [showHints, setShowHints] = useState(false);

  // this tracks whether the user has clicked the guess button at least once
  // used to decide whether we should show their color guess (even if cheating is off)
  const [hasGuessed, setHasGuessed] = useState(false);

  // user's current rgb guess values (starts at middle values)
  const [red, setRed] = useState(127);
  const [green, setGreen] = useState(127);
  const [blue, setBlue] = useState(127);

  // randomly generated target rgb values that user is trying to match
  const [targetRed, setTargetRed] = useState(0);
  const [targetGreen, setTargetGreen] = useState(0);
  const [targetBlue, setTargetBlue] = useState(0);

  // this holds the message shown after a guess and any hint messages
  const [result, setResult] = useState("");

  // on first load, generate a new random color to match
  useEffect(() => {
    handleNewColor();
  }, []);

  // this function runs when user clicks the "guess" button
  const handleGuess = () => {
    const redDiff = Math.abs(red - targetRed);
    const greenDiff = Math.abs(green - targetGreen);
    const blueDiff = Math.abs(blue - targetBlue);
    const totalDiff = redDiff + greenDiff + blueDiff;
  
    setHasGuessed(true);
  
    let message = "";
    let hints = [];
  
    if (totalDiff === 0) {
      message = "perfect match! 🎯";
    } else if (totalDiff < 50) {
      message = "so close! 🔥";
    } else {
      message = "not quite, try again!";
    }
  
    // generate hints ONLY if the toggle is on
    if (showHints) {
      if (red === targetRed) {
        hints.push("red is just right");
      } else if (red < targetRed) {
        hints.push("try bumping red up ↑");
      } else {
        hints.push("red might be too high ↓");
      }
  
      if (green === targetGreen) {
        hints.push("green is just right");
      } else if (green < targetGreen) {
        hints.push("try raising green a bit ↑");
      } else {
        hints.push("green might be too high ↓");
      }
  
      if (blue === targetBlue) {
        hints.push("blue is just right");
      } else if (blue < targetBlue) {
        hints.push("try turning up blue ↑");
      } else {
        hints.push("blue might be too high ↓");
      }
    }
  
    setResult({ main: message, hints });
  };
  

  // this resets everything — gets a new target color and resets sliders and toggles
  const handleNewColor = () => {
    setTargetRed(Math.floor(Math.random() * 256));
    setTargetGreen(Math.floor(Math.random() * 256));
    setTargetBlue(Math.floor(Math.random() * 256));
    setRed(127);
    setGreen(127);
    setBlue(127);
    setResult("");
    setHasGuessed(false);
    setCheating(false);
    setShowHints(false);
  };

  return (
    <main className="app-container">
      {/* toggle to let user choose if they want to preview their color live */}
      <label className="cheat-toggle">
        <input
          type="checkbox"
          checked={cheating}
          onChange={(e) => setCheating(e.target.checked)}
        />
        show my guess (cheating mode)
      </label>

      {/* toggle to let user choose whether to see hint messages when close */}
      <label className="cheat-toggle">
        <input
          type="checkbox"
          checked={showHints}
          onChange={(e) => setShowHints(e.target.checked)}
        />
        show helpful hints
      </label>

      <h2>target color</h2>
      {/* this shows the color you’re trying to match */}
      <div
        className="color-box"
        style={{
          backgroundColor: `rgb(${targetRed}, ${targetGreen}, ${targetBlue})`,
        }}
      />

      <h2>your guess</h2>

      {/* show the user’s current guess color:
          - if cheating is on, show it live
          - OR if they’ve guessed at least once, show it after guessing */}
      {(cheating || hasGuessed) && (
        <div
          className="color-box"
          style={{
            backgroundColor: `rgb(${red}, ${green}, ${blue})`,
          }}
        />
      )}

      {/* the guess button compares user's guess to target color */}
      <button onClick={handleGuess}>guess</button>

      {/* show result message + any hint messages */}
      {result && (
        <div className="result-box">
          <p className="result-main">{result.main}</p>
          {showHints && result.hints.length > 0 && (
            <p className="hint-list">
              {result.hints.map((hint, idx) => (
                <span key={idx}>
                  {hint}
                  <br />
                </span>
              ))}
            </p>          
          )}
        </div>
      )}

      {/* group of sliders with labels for each color */}
      <div className="slider-group">
        <div className="slider-row">
          <span className="slider-name">red</span>
          <Slider min={0} max={255} startingValue={red} onChange={setRed} />
        </div>
        <div className="slider-row">
          <span className="slider-name">green</span>
          <Slider min={0} max={255} startingValue={green} onChange={setGreen} />
        </div>
        <div className="slider-row">
          <span className="slider-name">blue</span>
          <Slider min={0} max={255} startingValue={blue} onChange={setBlue} />
        </div>
      </div>

      {/* this button resets everything and gives a new color to match */}
      <button className="new-color-btn" onClick={handleNewColor}>
        ⟳ new color
      </button>
    </main>
  );
}

export default App;
