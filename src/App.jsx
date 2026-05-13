import { useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import celebrate from "../public/confetti";
import "./App.css";
import AddPlayers from "./components/AddPlayers";
import CasinoMoney from "./components/CasinoMoney";

const NUMBERS = Array.from({ length: 36 }, (_, i) => i + 1);
const CHIP_NUMBERS = ["₹500", "₹1000", "₹1500", "₹2000", "₹3000"];
const BET_OPTIONS = [
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
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 19, 20, 22, 24, 26, 29, 31, 33, 35];

const PAYOUTS = {
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

const aggregateBets = (bets) => {
  return Object.values(
    bets.reduce((acc, bet) => {
      const key = `${bet.player}-${bet.type}-${bet.number ?? ""}`;

      if (acc[key]) {
        acc[key].chip += bet.chip;
      } else {
        acc[key] = { ...bet };
      }

      return acc;
    }, {})
  );
};

const checkWin = (bet, randomNumber) => {
  switch (bet.type) {
    case "Odd":
      return randomNumber % 2 !== 0 && randomNumber !== 0;
    case "Even":
      return randomNumber % 2 === 0 && randomNumber !== 0;
    case "Red":
      return !BLACK_NUMBERS.includes(randomNumber) && randomNumber !== 0;
    case "Black":
      return BLACK_NUMBERS.includes(randomNumber);
    case "1st 12":
      return randomNumber >= 1 && randomNumber <= 12;
    case "2nd 12":
      return randomNumber >= 13 && randomNumber <= 24;
    case "3rd 12":
      return randomNumber >= 25 && randomNumber <= 36;
    case "1 - 18":
      return randomNumber >= 1 && randomNumber <= 18;
    case "19 - 36":
      return randomNumber >= 19 && randomNumber <= 36;
    case "Single Bet":
      return randomNumber === bet.number;
    default:
      return false;
  }
};

const getPlayerTotalBetAmount = (bets, playerIndex) => {
  return bets
    .filter((bet) => bet.player === playerIndex)
    .reduce((total, bet) => total + bet.chip, 0);
};

function App() {
  const [bets, setBets] = useState([]);
  const [selectedChip, setSelectedChip] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [message, setMessage] = useState("");
  const [resultNumber, setResultNumber] = useState("");
  const [playerBalances, setPlayerBalances] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [casinoBalance, setCasinoBalance] = useState(100000);

  const validatePlayer = () => {
    if (selectedPlayer === null) {
      alert("Select player first!");
      return false;
    }
    return true;
  };

  const validateChip = () => {
    if (!selectedChip) {
      alert("Select chip first!");
      return false;
    }
    return true;
  };

  const validatePlayerBalance = () => {
    const currentPlayerBalance =
      playerBalances[selectedPlayer];

    const currentPlayerBetTotal =
      getPlayerTotalBetAmount(
        bets,
        selectedPlayer
      );

    if (
      currentPlayerBetTotal + selectedChip >
      currentPlayerBalance
    ) {
      alert("Insufficient balance!");
      return false;
    }

    return true;
  };

  const handleChipSelect = (e) => {
    if (!validatePlayer()) return;

    const chipValue = Number(
      e.target.value.replace("₹", "")
    );

    setSelectedChip(chipValue);
  };

  const handleSingleBet = (e) => {
    if (!validatePlayer() || !validateChip() ||
      !validatePlayerBalance()) return;

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

  const handleBet = (e) => {
    if (!validatePlayer() || !validateChip() ||
      !validatePlayerBalance()) return;
    const betType = e.target.value;

    setBets((prev) => [
      ...prev,
      {
        player: selectedPlayer,
        type: betType,
        chip: selectedChip,
      },
    ]);
  };

  const spinWheel = () => {
    if (!validatePlayer()) return;

    if (bets.length === 0) {
      return alert("Place a bet first!");
    }

    const allPlayersBet =
      new Set(bets.map((b) => b.player)).size ===
      playerBalances.length;

    if (!allPlayersBet) {
      return alert("All players must place bets first!");
    }

    const randomNumber = Math.floor(Math.random() * 37);
    setResultNumber(randomNumber);

    let updatedBalances = [...playerBalances];
    let updatedCasinoBalance = casinoBalance;

    const playerResults = {};

    bets.forEach((bet) => {
      const isWin = checkWin(bet, randomNumber);
      const playerIndex = bet.player;

      if (!playerResults[playerIndex]) {
        playerResults[playerIndex] = {
          total: 0,
          details: [],
        };
      }

      updatedBalances[playerIndex] -= bet.chip;
      updatedCasinoBalance += bet.chip;

      if (isWin) {
        const wonAmount =
          bet.chip * PAYOUTS[bet.type] + bet.chip;

        updatedBalances[playerIndex] += wonAmount;
        updatedCasinoBalance -= wonAmount;

        playerResults[playerIndex].total += wonAmount;

        playerResults[playerIndex].details.push(
          `${bet.type}${bet.number !== undefined
            ? ` [${bet.number}]`
            : ""
          } won ₹${wonAmount}`
        );
      } else {
        playerResults[playerIndex].total -= bet.chip;

        playerResults[playerIndex].details.push(
          `${bet.type}${bet.number !== undefined
            ? ` [${bet.number}]`
            : ""
          } lost ₹${bet.chip}`
        );
      }
    });

    setPlayerBalances(updatedBalances);
    setCasinoBalance(updatedCasinoBalance);

    const someoneWon = Object.values(playerResults).some(
      (player) => player.total > 0
    );

    if (someoneWon) {
      celebrate();
    }

    const finalMessages = Object.entries(playerResults).map(
      ([player, result]) => {
        return `Player ${Number(player) + 1}
${result.details.join("\n")}
Net: ${result.total >= 0 ? "+" : ""}₹${result.total}`;
      }
    );

    setMessage(finalMessages.join("\n\n"));
    setBets([]);
    setSelectedNumber(null);
  };

  const clearWheel = () => {
    setMessage("");
    setResultNumber("");
    setBets([]);
    setSelectedChip(null);
    setSelectedNumber(null);
  };

  const aggregatedBets = aggregateBets(bets);

  const betCounts = bets.reduce((acc, bet) => {
    acc[bet.type] = (acc[bet.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1>European Roulette</h1>

      <div className="amount-players">
        <div className="amount">
          <CasinoMoney
            balance={casinoBalance}
            setBalance={setCasinoBalance}
          />
        </div>

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
          <button
            onClick={handleSingleBet}
            value={0}
            className={
              selectedNumber === 0
                ? "yellow"
                : "green"
            }
            data-tooltip-id="chip-tooltip"
            data-tooltip-content={
              selectedChip
                ? `Profit: ₹${selectedChip * 35
                } | Loss: ₹${selectedChip}`
                : "Select chip first"
            }
          > 0 </button>
        </div>

        <div className="other-btn">
          {NUMBERS.map((num) => (
            <button
              key={num}
              value={num}
              onClick={handleSingleBet}
              className={
                selectedNumber === num
                  ? "yellow"
                  : BLACK_NUMBERS.includes(num)
                    ? "black"
                    : "red"
              }
              data-tooltip-id="chip-tooltip"
              data-tooltip-content={
                selectedChip
                  ? `Profit: ₹${selectedChip * 35
                  } | Loss: ₹${selectedChip}`
                  : "Select chip first"
              }
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className="selected">
        <h2>Selected Bets:</h2>

        {aggregatedBets.map((bet, index) => (
          <p key={index}>
            Player Number: {bet.player + 1}
            <br />

            {bet.type}
            {bet.number !== undefined &&
              ` [ ${bet.number} ]`}
            {" "}₹{bet.chip}
          </p>
        ))}
      </div>

      <div className="chips">
        {CHIP_NUMBERS.map((chip) => {
          const chipValue = Number(
            chip.replace("₹", "")
          );

          return (
            <button
              key={chip}
              value={chip}
              onClick={handleChipSelect}
              className={
                chipValue === selectedChip
                  ? "yellow"
                  : ""
              }
            >
              {chip}
            </button>
          );
        })}
      </div>

      <div className="bets">
        {BET_OPTIONS.map((bet) => (
          <button
            key={bet}
            value={bet}
            onClick={handleBet}
            data-tooltip-id="chip-tooltip"
            data-tooltip-content={`Profit: ₹${selectedChip * (PAYOUTS[bet] ?? 0)
              }, Return: ₹${selectedChip *
              ((PAYOUTS[bet] ?? 0) + 1)
              }, Loss: ₹${selectedChip}`}
          >
            {bet}

            {betCounts[bet] > 0 && (
              <span className="button-count">
                {betCounts[bet]}
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
      <button onClick={spinWheel}>SPIN</button>
      <button onClick={clearWheel}>CLEAR</button>

      <div className="result">
        {resultNumber !== "" && (
          <p>Result: {resultNumber}</p>
        )}
      </div>

      <div className="message">
        <p style={{ whiteSpace: "pre-line" }}> {message} </p>
      </div>
    </div>
  );
}

export default App;