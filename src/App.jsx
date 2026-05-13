import { useState } from "react";
import "./App.css";
import celebrate from "../public/confetti";
import AddPlayers from "./components/AddPlayers";
import CasinoMoney from "./components/CasinoMoney";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

function App() {
  const numbers = [];
  const CHIP_NUMBERS = ["₹500", "₹1000", "₹1500", "₹2000", "₹3000"];
  const BETS = [
    "1st 12",
    "2nd 12",
    "3rd 12",
    "Odd",
    "Red",
    "Even",
    "1 - 18",
    "Black",
    "19 - 36",
  ];
  const [bets, setBets] = useState([]);
  const [selectedChip, setSelectedChip] = useState(null);
  const [message, setMessage] = useState("");
  const [resultNumber, setResultNumber] = useState("");
  const BLACK_NUM = [2, 4, 6, 8, 10, 11, 13, 15, 17, 19, 20, 22, 24, 26, 29, 31, 33, 35,];
  const payouts = {
    Odd: 1,
    Even: 1,
    Red: 1,
    Black: 1,
    "1 - 18": 1,
    "19 - 36": 1,
    "1st 12": 2,
    "2nd 12": 2,
    "3rd 12": 2,
    "Single Bet": 35,
  };
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [playerBalances, setPlayerBalances] = useState([]);
  const [casinoBalance, setCasinoBalance] = useState(100000);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isActive, setIsActive] = useState(false);

  for (let i = 1; i <= 36; i++) {
    numbers.push(i);
  }

  const handleClick = (e) => {
    if (selectedPlayer === null) return alert("Select player first!");
    const chip = Number(e.target.value.replace("₹", ""));
    setSelectedChip(chip);
  };

  const handleSingleBet = (e) => {
    if (selectedPlayer === null) return alert("Select player first!");
    if (!selectedChip) {
      return alert("Select chip first!");
    }

    const number = Number(e.target.value);
    setBets((prev) => [
      ...prev,
      {
        player: selectedPlayer,
        type: "Single Bet",
        number,
        chip: selectedChip,
      },
    ]);

    setSelectedNumber(number);
  };

  const spinWheel = () => {
    if (selectedPlayer === null) return alert("Select player first!");
    if (bets.length === 0) {
      return alert("Place a bet first!");
    }
    if (new Set(bets.map(b => b.player)).size !== playerBalances.length) return alert("All players must place bets first!");

    const randomNumber = Math.floor(Math.random() * 37);
    setResultNumber(randomNumber);

    let updatedBalance = [...playerBalances];
    let updatedCasinoBalance = casinoBalance;
    let playerResults = {};

    bets.forEach((bet) => {
      let isWin = false;

      switch (bet.type) {
        case "Odd":
          isWin = randomNumber % 2 !== 0 && randomNumber !== 0;
          break;

        case "Even":
          isWin = randomNumber % 2 === 0 && randomNumber !== 0;
          break;

        case "Red":
          isWin = !BLACK_NUM.includes(randomNumber) && randomNumber !== 0;
          break;

        case "Black":
          isWin = BLACK_NUM.includes(randomNumber);
          break;

        case "1st 12":
          isWin = randomNumber >= 1 && randomNumber <= 12;
          break;

        case "2nd 12":
          isWin = randomNumber >= 13 && randomNumber <= 24;
          break;

        case "3rd 12":
          isWin = randomNumber >= 25 && randomNumber <= 36;
          break;

        case "1 - 18":
          isWin = randomNumber >= 1 && randomNumber <= 18;
          break;

        case "19 - 36":
          isWin = randomNumber >= 19 && randomNumber <= 36;
          break;

        case "Single Bet":
          isWin = randomNumber === bet.number;
          break;

        default:
          break;
      }

      const playerIndex = bet.player;

      if (!playerResults[playerIndex]) {
        playerResults[playerIndex] = {
          total: 0,
          details: [],
        };
      }

      updatedBalance[playerIndex] -= bet.chip;
      updatedCasinoBalance += bet.chip;

      if (isWin) {
        const wonAmount = bet.chip * payouts[bet.type] + bet.chip;

        updatedBalance[playerIndex] += wonAmount;
        updatedCasinoBalance -= wonAmount;
        playerResults[playerIndex].total += wonAmount;

        playerResults[playerIndex].details.push(
          `${bet.type}${bet.number !== undefined ? ` [${bet.number}]` : ""
          } won ₹${wonAmount}`,
        );
      } else {
        playerResults[playerIndex].total -= bet.chip;

        playerResults[playerIndex].details.push(
          ` ${bet.type}${bet.number !== undefined ? ` [${bet.number}]` : ""
          } lost ₹${bet.chip}`,
        );
      }
    });

    setPlayerBalances(updatedBalance);
    setCasinoBalance(updatedCasinoBalance);

    const someoneWon = Object.values(playerResults).some((p) => p.total > 0);
    if (someoneWon > 0) {
      celebrate();
    }

    let finalMessages = [];

    Object.entries(playerResults).forEach(([player, result]) => {
      finalMessages.push(`Player ${Number(player) + 1}
      ${result.details.join("\n")}
      Net: ${result.total >= 0 ? "+" : ""}
      ₹${result.total}`);
    });

    setMessage(finalMessages.join("\n\n"));
    setBets([]);
    setSelectedNumber(null);
  };

  const handleBets = (e) => {
    if (selectedPlayer === null) return alert("Select player first!");
    if (!selectedChip) return alert("Select chip first!");

    const betType = e.target.value;

    setIsActive(betType);
    setBets((prev) => [
      ...prev,
      {
        player: selectedPlayer,
        type: betType,
        chip: selectedChip,
      },
    ]);

  };

  const clearWheel = () => {
    setMessage("");
    setResultNumber("");
    setBets([]);
    setSelectedChip(null);
    setSelectedNumber(null);
  };

  const betCounts = bets.reduce((acc, bet) => {
    acc[bet.type] = (acc[bet.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <div>
        <h1>European Roulette</h1>
        <div className="amount-players">
          <div className="amount">
            <CasinoMoney
              balance={casinoBalance}
              setBalance={setCasinoBalance}
            />
          </div>

          <br />
          <div className="players">
            <AddPlayers
              playerBalances={playerBalances}
              setPlayerBalances={setPlayerBalances}
              setSelectedPlayer={setSelectedPlayer}
            />
          </div>
        </div>
        <div className="table">
          <div className="zero">
            <button onClick={handleSingleBet} value={0} className={selectedNumber === 0 ? "yellow" : "green"}
              data-tooltip-id="chip-tooltip"
              data-tooltip-content={
                selectedNumber === 0
                  ? `Profit: ₹${selectedChip * 35} | Loss: ₹${selectedChip}`
                  : `Select chip first`
              }
            >
              0
            </button>
          </div>
          <div className="other-btn">
            {numbers.map((num) => (
              <button
                key={num}
                className={
                  selectedNumber === num ? "yellow" : num === 0 ? "green" : BLACK_NUM.includes(num)
                    ? "black" : "red"
                }
                onClick={handleSingleBet}
                value={num}
                data-tooltip-id="chip-tooltip"
                data-tooltip-content={
                  selectedChip
                    ? `Profit: ₹${selectedChip * 35} | Loss: ₹${selectedChip}`
                    : `Select chip first`
                }
              >
                {num}
              </button>
            ))}
          </div>
        </div>
        <div className="selected">
          <div>
            <h2>Selected Bets:</h2>
            {/* {Object.values(
              bets.reduce((acc, bet) => {
                const key = `${bet.player}-${bet.type}-${bet.number ?? ""}`;

                if (acc[key]) {
                  acc[key].chip += bet.chip;
                } else {
                  acc[key] = { ...bet };
                }

                return acc;
              }, {}),
            ).map((bet, index) => (
              <p key={index}>
                Player Number: {bet.player + 1} <br />
                {bet.type}
                {bet.number !== undefined && ` [ ${bet.number} ]`} ₹{bet.chip}
              </p>
            ))} */}
          </div>
        </div>
        <div className="chips">
          {CHIP_NUMBERS.map((chip) => (
            <button onClick={handleClick} value={chip} key={chip}
              className={Number(chip.replace("₹", "")) === selectedChip ? "yellow" : ""}
            >
              {chip}
            </button>
          ))}
        </div>
        <br />
        <div className="bets">
          {BETS.map((bet) => (
            <button
              onClick={handleBets}
              value={bet}
              key={bet}
              data-tooltip-id="chip-tooltip"
              data-tooltip-content={`Profit: ${selectedChip * (payouts[bet] ?? 0)}, Return: ₹${selectedChip * ((payouts[bet] ?? 0) + 1)}, Loss: ${selectedChip}`}
            >
              {bet}
              {betCounts[bet] > 0 && (
                <span className={isActive ? "button-count" : ""}> {Object.values(
                  bets.reduce((acc, bet) => {
                    const key = `${bet.player}-${bet.type}-${bet.number ?? ""}`;

                    if (acc[key]) {
                      acc[key].chip += bet.chip;
                    } else {
                      acc[key] = { ...bet };
                    }

                    return acc;
                  }, {}),
                ).map((bet, index) => (
                  <p key={index}>
                    Player Number: {bet.player + 1} <br />
                    {bet.type}
                    {bet.number !== undefined && ` [ ${bet.number} ]`} ₹{bet.chip}
                  </p>
                ))}
                  {/* {betCounts[bet]}  */}
                </span>
              )}
            </button>
          ))}
        </div>

        <ReactTooltip
          id="chip-tooltip"
          place="top"
          style={{
            backgroundColor: "#b4e924",
            color: "black",
            fontSize: "14px",
            borderRadius: "10px",
          }}
        />
        <br />
        <button onClick={spinWheel}>SPIN</button>{" "}
        <button onClick={clearWheel}>CLEAR</button>
        <div className="result">
          {resultNumber !== "" && <p>Result: {resultNumber}</p>}
        </div>
        <div className="message">
          <p style={{ whiteSpace: "pre-line" }}>{message}</p>
        </div>
      </div>
    </>
  );
}

export default App;