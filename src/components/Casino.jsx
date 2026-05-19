import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import "react-tooltip/dist/react-tooltip.css";
import celebrate from "../../public/confetti";
import AddPlayers from "./AddPlayers";
import CasinoMoney from "./CasinoMoney";
import RouletteBoard from "./RouletteBoard";

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

function Casino() {

    const [resultNumber, setResultNumber] = useState("");
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [casinoBalance, setCasinoBalance] = useState(1000000);
    const [players, setPlayers] = useState([{
        bets: [],
        selectedChip: null,
        playerBalance: 0,
        activeBet: [],
        selectedNumber: null
    }]);
    const [resultLines, setResultLines] = useState([]);
    const [resultTab, setResultTab] = useState("");
    const [previewData, setPreviewData] = useState(null);

    const allBets = selectedPlayer !== null ? players[selectedPlayer]?.bets || [] : players.flatMap(player => player.bets);
    const selectedChip = players[selectedPlayer]?.selectedChip || null;
    const playerBalances = players.map(player => player.playerBalance);
    const activeBets = players[selectedPlayer]?.activeBet || [];
    const selectedNumber = players[selectedPlayer]?.selectedNumber ?? null;
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.restoreGame && location.state?.previewData) {
            const restoredPlayers = location.state.previewData.players.map((p) => ({
                bets: p.bets || [],
                selectedChip: p.selectedChip || null,
                playerBalance: p.balance,
                activeBet: p.activeBet || [],
                selectedNumber: p.selectedNumber ?? null,
            }));
            setPlayers(restoredPlayers);
            setSelectedPlayer(location.state.previewData.selectedPlayer ?? null);
        }
    }, [location.state]);

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
                                id: Date.now() + Math.random(),
                                player: selectedPlayer,
                                type: "Single Bet",
                                number,
                                chip: selectedChip,
                            },
                        ],
                    } : player
            ));
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
                                id: Date.now() + Math.random(),
                                player: selectedPlayer,
                                type: betType,
                                chip: selectedChip,
                            },
                        ],
                    } : player));
    };

    const removeBet = (betId) => {
        if (selectedPlayer === null) return;

        setPlayers((prev) =>
            prev.map((player, index) => {
                if (index !== selectedPlayer) return player;

                const updatedBets = player.bets.filter((bet) => bet.id !== betId);
                const updatedActiveBets = updatedBets.filter((bet) => bet.type !== "Single Bet").map((bet) => bet.type);
                const lastSingleBet = [...updatedBets].reverse()
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

        setPreviewData({
            resultNumber: randomNumber,
            players: updatedPlayers.map((player, index) => ({
                player: index,
                balance: player.playerBalance,
                bets: players[index].bets,
                activeBet: players[index].activeBet,
                selectedNumber: players[index].selectedNumber,
                selectedChip: players[index].selectedChip,
            })),
            selectedPlayer,
        });
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
                activeBet: [],
            }))
        );
        if (players.length > 0) {
            setSelectedPlayer(0);
        }
        setSelectedPlayer(null);
    };

    const newGame = () => {
        setResultLines([]);
        setResultTab("");
        setResultNumber("");
        setPreviewData(null);
        setCasinoBalance(1000000);
        setPlayers([{
            bets: [],
            selectedChip: null,
            playerBalance: 0,
            activeBet: [],
            selectedNumber: null
        }]);
        setSelectedPlayer(null);
        navigate(location.pathname, { replace: true, state: {} });
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

    const handlePreview = () => {
        navigate("/preview", {
            state: {
                previewData, NUMBERS,
                BET_OPTIONS, BLACK_NUMBERS,
            },
        });
    };

    return (
        <div>
            <div className="amount-players">
                <h1>European Roulette</h1>
                <CasinoMoney balance={casinoBalance} setBalance={setCasinoBalance} />
            </div>

            <div className="players">
                <AddPlayers players={players} setPlayers={setPlayers}
                    setSelectedPlayer={setSelectedPlayer} selectedPlayer={selectedPlayer} removeBet={removeBet} />
            </div>

            <RouletteBoard
                NUMBERS={NUMBERS} CHIP_NUMBERS={CHIP_NUMBERS} BET_OPTIONS={BET_OPTIONS} BLACK_NUMBERS={BLACK_NUMBERS} PAYOUTS={PAYOUTS}
                selectedChip={selectedChip} selectedNumber={selectedNumber} activeBets={activeBets} players={players} selectedPlayer={selectedPlayer}
                handleSingleBet={handleSingleBet} handleBet={handleBet} handleChipSelect={handleChipSelect} spinWheel={spinWheel} handlePreview={handlePreview}
                clearWheel={clearWheel} newGame={newGame} resultNumber={resultNumber} setResultTab={setResultTab} betCounts={betCounts}
            />

            <div className="message">
                {filteredResults.map((r, i) => (
                    <p key={i} style={{ color: r.type === "WIN" ? "green" : "red" }}
                    > {r.text} </p>
                ))}
            </div>
        </div>
    );
}

export default Casino;