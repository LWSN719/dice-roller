import { useState } from "react";
import "./App.css";

const diceTemplates = {
  arcane: { name: "Arcane Blue", background: "#07111f", border: "#38bdf8", text: "#d4af37" },
  ember: { name: "Ember Red", background: "#220606", border: "#ef4444", text: "#facc15" },
  forest: { name: "Forest Green", background: "#052e16", border: "#22c55e", text: "#dcfce7" },
  royal: { name: "Royal Purple", background: "#2e1065", border: "#a855f7", text: "#f5d0fe" },
};

const diceShapes = {
  4: {
    points: "100,15 180,175 20,175",
    faces: ["100,15 100,105 20,175", "100,15 100,105 180,175", "20,175 100,105 180,175"],
    numberY: 128,
  },
  6: {
    points: "45,35 155,35 155,145 45,145",
    faces: ["45,35 155,35 155,145 45,145"],
    numberY: 110,
  },
  8: {
    points: "100,10 180,100 100,190 20,100",
    faces: ["100,10 180,100 100,100", "100,10 20,100 100,100", "20,100 100,190 100,100", "180,100 100,190 100,100"],
    numberY: 112,
  },
  10: {
    points: "100,10 175,55 155,175 45,175 25,55",
    faces: ["100,10 175,55 100,100", "100,10 25,55 100,100", "25,55 45,175 100,100", "175,55 155,175 100,100", "45,175 155,175 100,100"],
    numberY: 115,
  },
  12: {
    points: "70,15 130,15 180,60 165,140 100,185 35,140 20,60",
    faces: ["70,15 130,15 100,95", "130,15 180,60 100,95", "180,60 165,140 100,95", "165,140 100,185 100,95", "100,185 35,140 100,95", "35,140 20,60 100,95", "20,60 70,15 100,95"],
    numberY: 112,
  },
  20: {
    points: "100,8 178,52 178,145 100,192 22,145 22,52",
    faces: ["100,8 178,52 100,95", "100,8 22,52 100,95", "22,52 22,145 100,95", "178,52 178,145 100,95", "22,145 100,192 100,95", "178,145 100,192 100,95", "100,75 135,135 65,135"],
    numberY: 120,
  },
  100: {
    points: "100,10 145,25 178,60 190,105 170,150 130,185 80,185 35,160 12,115 20,65 55,25",
    faces: ["100,10 145,25 100,95", "145,25 178,60 100,95", "178,60 190,105 100,95", "190,105 170,150 100,95", "170,150 130,185 100,95", "130,185 80,185 100,95", "80,185 35,160 100,95", "35,160 12,115 100,95", "12,115 20,65 100,95", "20,65 55,25 100,95", "55,25 100,10 100,95"],
    numberY: 112,
  },
};

function DieSvg({ diceType, value, isRolling, template }) {
  const shape = diceShapes[diceType];

  return (
    <div className={`die-wrapper ${isRolling ? "rolling" : ""}`}>
      <svg viewBox="0 0 200 200" className="die-svg">
        <polygon
          points={shape.points}
          fill={template.background}
          stroke={template.border}
          strokeWidth="6"
        />

        {shape.faces.map((face, index) => (
          <polygon
            key={index}
            points={face}
            fill={index % 2 === 0 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.16)"}
            stroke={template.border}
            strokeWidth="2.5"
          />
        ))}

        <circle cx="100" cy="95" r="3" fill={template.border} opacity="0.8" />

        <text
          x="100"
          y={shape.numberY - 15}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={template.text}
          fontSize={diceType === 100 ? "38" : "48"}
          fontWeight="900"
          className="die-number"
        >
          {value}
        </text>
      </svg>
    </div>
  );
}

function App() {
  const [diceType, setDiceType] = useState(20);
  const [modifier, setModifier] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [displayValue, setDisplayValue] = useState(20);
  const [template, setTemplate] = useState("arcane");

  const currentTemplate = diceTemplates[template];

  const rollDice = () => {
    setIsRolling(true);

    let animationCount = 0;

    const animation = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * diceType) + 1);
      animationCount++;

      if (animationCount > 16) {
        clearInterval(animation);

        const rolls = [];

        for (let i = 0; i < quantity; i++) {
          rolls.push(Math.floor(Math.random() * diceType) + 1);
        }

        const rollTotal = rolls.reduce((sum, roll) => sum + roll, 0);
        const finalTotal = rollTotal + Number(modifier);

        const rollResult = {
          dice: `d${diceType}`,
          rolls,
          modifier: Number(modifier),
          total: finalTotal,
          timestamp: new Date().toLocaleTimeString(),
        };

        setDisplayValue(quantity === 1 ? rolls[0] : finalTotal);
        setResult(rollResult);
        setHistory((prev) => [rollResult, ...prev.slice(0, 9)]);
        setIsRolling(false);
      }
    }, 55);
  };

  const isCriticalSuccess = diceType === 20 && quantity === 1 && result?.rolls[0] === 20;
  const isCriticalFail = diceType === 20 && quantity === 1 && result?.rolls[0] === 1;

  return (
    <div className="container">
      <header className="app-header">
        <h1>Dice Roller</h1>
      </header>

      <section className="roller-panel">
        <div className="controls">
          <div>
            <label>Dice</label>
            <select
              value={diceType}
              onChange={(event) => {
                const newDice = Number(event.target.value);
                setDiceType(newDice);
                setDisplayValue(newDice);
                setResult(null);
              }}
            >
              <option value="4">d4</option>
              <option value="6">d6</option>
              <option value="8">d8</option>
              <option value="10">d10</option>
              <option value="12">d12</option>
              <option value="20">d20</option>
              <option value="100">d100</option>
            </select>
          </div>

          <div>
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              max="20"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </div>

          <div>
            <label>Modifier</label>
            <input
              type="number"
              value={modifier}
              onChange={(event) => setModifier(Number(event.target.value))}
            />
          </div>

          <div>
            <label>Dice Style</label>
            <select value={template} onChange={(event) => setTemplate(event.target.value)}>
              {Object.entries(diceTemplates).map(([key, style]) => (
                <option key={key} value={key}>
                  {style.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="dice-stage">
          <DieSvg
            diceType={diceType}
            value={displayValue}
            isRolling={isRolling}
            template={currentTemplate}
          />
        </div>

        <button className="roll-btn" onClick={rollDice} disabled={isRolling}>
          {isRolling ? "Rolling..." : "Roll Dice"}
        </button>

        {result && (
          <div className="result-card">
            <h2>Result</h2>

            {isCriticalSuccess && <p className="critical success">Natural 20! Critical Success.</p>}
            {isCriticalFail && <p className="critical fail">Natural 1! Critical Failure.</p>}

            <p>
              <strong>Dice:</strong> {quantity}d{diceType}
            </p>

            <p>
              <strong>Rolls:</strong> {result.rolls.join(", ")}
            </p>

            <p>
              <strong>Modifier:</strong> {result.modifier >= 0 ? "+" : ""}
              {result.modifier}
            </p>

            <h3>Total: {result.total}</h3>
          </div>
        )}
      </section>

      <section className="history">
        <h2>Roll History</h2>

        {history.length === 0 ? (
          <p>No rolls yet.</p>
        ) : (
          history.map((entry, index) => (
            <div key={index} className="history-item">
              <span>{entry.timestamp}</span>
              <strong>
                {entry.rolls.length}d{entry.dice.replace("d", "")}
                {entry.modifier >= 0 ? ` + ${entry.modifier}` : ` - ${Math.abs(entry.modifier)}`}
              </strong>
              <span>Total: {entry.total}</span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default App;