import { useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import celebrate from "../public/confetti";
import "./App.css";
import AddPlayers from "./components/AddPlayers";
import CasinoMoney from "./components/CasinoMoney";

const NUMBERS = Array.from({ length: 36 }, (_, i) => i + 1);
const CHIP_NUMBERS = ["₹500", "₹1000", "₹1500", "₹2000", "₹3000"];
const BET_OPTIONS = ["1st 12", "2nd 12", "3rd 12", "Odd", "Red", "Even", "1 - 18", "Black", "19 - 36"];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 19, 20, 22, 24, 26, 29, 31, 33, 35];
const PAYOUTS = {
  Odd: 1, Even: 1, Red: 1, Black: 1, "1 - 18": 1, "19 - 36": 1,
  "1st 12": 2, "2nd 12": 2, "3rd 12": 2, "Single Bet": 35,
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

  const [resultNumber, setResultNumber] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [casinoBalance, setCasinoBalance] = useState(100000);
  const [players, setPlayers] = useState([{
    bets: [],
    selectedChip: null,
    playerBalance: 0,
    activeBet: [],
    selectedNumber: null
  }]);
  const [resultLines, setResultLines] = useState([]);
  const [resultTab, setResultTab] = useState("");

  const allBets = selectedPlayer !== null ? players[selectedPlayer]?.bets || [] : players.flatMap(player => player.bets);
  const selectedChip = players[selectedPlayer]?.selectedChip || null;
  const playerBalances = players.map(player => player.playerBalance);
  const activeBets = players[selectedPlayer]?.activeBet || [];
  const selectedNumber = players[selectedPlayer]?.selectedNumber ?? null;

  const validatePlayer = () => {
    if (!playerBalances.length) {
      return alert("Add players first!");
    }
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
    const currentPlayerBalance = players[selectedPlayer]?.playerBalance || 0;
    const currentPlayerBetTotal = getPlayerTotalBetAmount(allBets, selectedPlayer);

    if (currentPlayerBetTotal + selectedChip > currentPlayerBalance) {
      alert("Insufficient balance!");
      return false;
    }
    return true;
  };

  const handleChipSelect = (e) => {
    if (!validatePlayer()) return;
    const chipValue = Number(e.target.value.replace("₹", ""));

    const currentPlayerBalance = players[selectedPlayer]?.playerBalance || 0;
    const availableBalance = currentPlayerBalance - chipValue;
    if (chipValue > currentPlayerBalance) {
      return alert(`Insufficient balance! You only have ₹${availableBalance} available`);
    }
    setPlayers((prev) =>
      prev.map((player, index) =>
        index === selectedPlayer
          ? {
            ...player,
            selectedChip: chipValue,
          } : player
      ));
  };

  const handleSingleBet = (e) => {
    if (!validatePlayer() || !validateChip() ||
      !validatePlayerBalance()) return;

    const number = Number(e.target.value);

    setPlayers((prev) =>
      prev.map((player, index) =>
        index === selectedPlayer
          ? {
            ...player,
            selectedNumber: number,
            bets: [
              ...player.bets,
              {
                player: selectedPlayer,
                type: "Single Bet",
                number,
                chip: selectedChip,
              },
            ],
          } : player
      )
    );
  };

  const handleBet = (e) => {
    if (!validatePlayer() || !validateChip() ||
      !validatePlayerBalance()) return;
    const betType = e.target.value;

    setPlayers((prev) =>
      prev.map((player, index) =>
        index === selectedPlayer
          ? {
            ...player,
            activeBet: player.activeBet.includes(betType)
              ? player.activeBet
              : [...player.activeBet, betType],
            bets: [
              ...player.bets,
              {
                player: selectedPlayer,
                type: betType,
                chip: selectedChip,
              },
            ],
          } : player));
  };

  const spinWheel = () => {
    if (!validatePlayer()) return;
    if (allBets.length === 0) {
      return alert("Place a bet first!");
    }

    const allPlayersBet = players.every(player => player.bets.length > 0);
    if (!allPlayersBet) {
      return alert("All players must place bets first!");
    }

    const totalPay = players.flatMap(p => p.bets).reduce((total, bet) => {
      const multiplier = PAYOUTS[bet.type] ?? 0;
      const payout = bet.chip * (multiplier + 1);
      return total + payout;
    }, 0);

    if (casinoBalance < totalPay) {
      alert("Add balance in casino");
      return;
    }

    const randomNumber = Math.floor(Math.random() * 37);
    setResultNumber(randomNumber);

    let updatedPlayers = [...players];
    let updatedCasinoBalance = casinoBalance;

    const lines = [];

    const everyPlayerBet = players.flatMap(player => player.bets);
    everyPlayerBet.forEach((bet) => {
      const isWin = checkWin(bet, randomNumber);
      const playerIndex = bet.player;

      updatedPlayers[playerIndex].playerBalance -= bet.chip;
      updatedCasinoBalance += bet.chip;

      if (isWin) {
        const wonAmount = bet.chip * PAYOUTS[bet.type] + bet.chip + bet.chip;
        updatedPlayers[playerIndex].playerBalance += wonAmount;
        updatedCasinoBalance -= wonAmount;

        lines.push({
          text: `Player ${playerIndex + 1} WON ₹${wonAmount} (${bet.type}${bet.number !== undefined ? ` ${bet.number}` : ""})`,
          type: "WIN",
        });
      } else {
        lines.push({
          text: `Player ${playerIndex + 1} LOST ₹${bet.chip} (${bet.type}${bet.number !== undefined ? ` ${bet.number}` : ""})`,
          type: "LOSE",
        });
      }
    });

    setPlayers(updatedPlayers);
    setCasinoBalance(updatedCasinoBalance);
    setResultLines(lines);

    const someoneWon = lines.some((l) => l.type === "WIN");
    if (someoneWon) {
      celebrate();
      lines.unshift({ text: "Players WON!", type: "WIN", });
    } else {
      lines.unshift({ text: "Nobody WON!", type: "WIN", });
    }

    const someoneLose = lines.some((l) => l.type === "LOSE");
    someoneLose ? lines.unshift({ text: "Players LOSE!", type: "LOSE", })
      : lines.unshift({ text: "Nobody LOSE!", type: "LOSE", })

    setPlayers((prev) =>
      prev.map((player) => ({
        ...player,
        selectedNumber: null,
        bets: [],
      })));
  };

  const clearWheel = () => {
    setResultLines([]);
    setResultTab("");
    setResultNumber("");
    setPlayers((prev) =>
      prev.map((player) => ({
        ...player,
        selectedNumber: null,
        bets: [],
        selectedChip: null,
        activeBet: []
      }))
    );
    if (players.length > 0) {
      setSelectedPlayer(0);
    }
    setSelectedPlayer(null);
  };

  const undoBet = () => {
    if (selectedPlayer === null) return;

    setPlayers((prev) =>
      prev.map((player, index) => {
        if (index !== selectedPlayer) return player;
        if (player.bets.length === 0) return player;

        const updatedBets = [...player.bets];
        updatedBets.pop();

        const updatedActiveBets = updatedBets.filter((bet) => bet.type !== "Single Bet").map((bet) => bet.type);

        const lastSingleBet = [...updatedBets]
          .reverse()
          .find((bet) => bet.type === "Single Bet");

        return {
          ...player,
          bets: updatedBets,
          activeBet: [...new Set(updatedActiveBets)],
          selectedNumber: lastSingleBet ? lastSingleBet.number : null,
        };
      })
    );
  };

  const filteredResults = resultLines.filter((line) => {
    if (resultTab === "WIN") return line.type === "WIN";
    if (resultTab === "LOSE") return line.type === "LOSE";
    return false;
  });

  const betCounts = allBets.reduce((acc, bet) => {
    let key;
    bet.type === "Single Bet" ? key = `Single-${bet.number}` : key = bet.type;
    if (!acc[key]) {
      acc[key] = {
        count: 0,
        total: 0,
        players: [],
      };
    }

    acc[key].count += 1;
    acc[key].total += bet.chip;
    acc[key].players.push(`P${bet.player + 1} (₹${bet.chip})`);
    return acc;
  }, {});

  return (
    <div>
      <h1>European Roulette</h1>
      <div className="amount-players">
        <CasinoMoney balance={casinoBalance} setBalance={setCasinoBalance} />
      </div>

      <div className="players">
        <AddPlayers players={players} setPlayers={setPlayers}
          setSelectedPlayer={setSelectedPlayer} selectedPlayer={selectedPlayer} />
      </div>

      <div className="table">
        <div className="zero">
          <button
            onClick={handleSingleBet}
            value={0}
            className={selectedNumber === 0 ? "yellow" : "green"}
            data-tooltip-id="chip-tooltip"
            data-tooltip-content={selectedChip ? `Profit: ₹${selectedChip * 35} | Loss: ₹${selectedChip}` : "Select chip first"}
          > 0
            {betCounts["Single-0"]?.count > 0 && (
              <span className="button-count" data-tooltip-id="chip-tooltip" data-tooltip-content={betCounts["Single-0"].players.join(", ")}>
                {betCounts["Single-0"].count}
              </span>
            )} </button>
        </div>

        <div className="other-btn">
          {NUMBERS.map((num) => {
            const isFirst12 = activeBets.includes("1st 12") && num >= 1 && num <= 12;
            const isSecond12 = activeBets.includes("2nd 12") && num >= 13 && num <= 24;
            const isThird12 = activeBets.includes("3rd 12") && num >= 25 && num <= 36;
            const first18 = activeBets.includes("1 - 18") && num >= 1 && num <= 18;
            const second19 = activeBets.includes("19 - 36") && num >= 19 && num <= 36;
            const isEven = activeBets.includes("Even") && num !== 0 && num % 2 === 0;
            const isOdd = activeBets.includes("Odd") && num !== 0 && num % 2 !== 0;

            return (
              <button
                key={num}
                value={num}
                onClick={handleSingleBet}
                className={
                  selectedNumber === num
                    ? "yellow"
                    : isFirst12 || isSecond12 || isThird12 || first18 || second19 || isEven || isOdd
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
                {betCounts[`Single-${num}`]?.count > 0 && (
                  <span className="button-count"
                    data-tooltip-id="chip-tooltip"
                    data-tooltip-content={betCounts[`Single-${num}`].players.join(", ")} >{betCounts[`Single-${num}`].count}</span>
                )}
              </button>
            );
          })}
        </div>
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
              className={chipValue === players[selectedPlayer]?.selectedChip || null ? "yellow" : ""}>{chip} </button>
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

            {betCounts[bet]?.count > 0 && (
              <span className="button-count" data-tooltip-id="chip-tooltip"
                data-tooltip-content={betCounts[bet].players.join(", ")}>
                {betCounts[bet].count}
              </span>
            )}
          </button>
        ))}
      </div>

      <ReactTooltip id="chip-tooltip" place="top"
        style={{
          backgroundColor: "#b4e924", color: "black",
          fontSize: "14px", borderRadius: "10px",
        }}
      />

      <br />
      <div className="spin-win">
        <div className="spin-clear">
          {selectedChip && <button onClick={undoBet}>Undo</button>}
          <button onClick={spinWheel}>SPIN</button>
          <button onClick={clearWheel}>CLEAR</button>
        </div>

        {resultNumber !== "" &&
          <div style={{ marginBottom: "10px" }} className="spin-clear">
            <button onClick={() => setResultTab("WIN")}>Win</button>
            <button onClick={() => setResultTab("LOSE")}>Lose</button>
          </div>}
      </div>

      <div className="message">
        {filteredResults.map((r, i) => (
          <p key={i}
            style={{ color: r.type === "WIN" ? "green" : "red" }}
          > {r.text} </p>
        ))}
      </div>
    </div>
  );
}

export default App;