import { useState } from "react";

function AddPlayers({
    players,
    setPlayers,
    setSelectedPlayer,
    selectedPlayer,
    removeBet
}) {
    const [input, setInput] = useState("");
    const getTotalBetAmount = (bets) => {
        return bets.reduce((total, bet) => total + bet.chip, 0);
    };

    const addPlayers = () => {
        const count = Number(input);

        if (!input.trim()) {
            alert("Please enter number of players");
            return;
        }
        if (count <= 1 || count > 10) {
            alert("Players can be from 2 to 10");
            return;
        }

        const newPlayers = Array.from({ length: count }, () => ({
            bets: [],
            selectedChip: null,
            playerBalance: Math.floor(Math.random() * (8000 - 1000) + 1000),
            activeBet: [],
            selectedNumber: null,
        }));
        setPlayers(newPlayers);
        setSelectedPlayer(0);
        setInput("");
    };

    const handleKeyDown = (e) => {
        const invalid = ["e", "E", ".", "+", "-"];
        if (invalid.includes(e.key)) e.preventDefault();
    };

    const handlePlayer = (index) => {
        if (selectedPlayer !== null && players[selectedPlayer]?.bets.length == 0) {
            return alert("Place atleast one bet!");
        }
        setSelectedPlayer(index);
    };

    return (
        <div className="players">
            {players.length === 1 && players[0].playerBalance === 0 && (
                <div className="input-button">
                    <input
                        type="number"
                        min="2"
                        max="10"
                        value={input}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button onClick={addPlayers}>Add Players +</button>
                </div>
            )}

            <div className="players">
                {players.length > 1 && (
                    <div className="player-cards">
                        {players.map((player, index) => {
                            const totalBet = getTotalBetAmount(player.bets);
                            const remainingBalance = player.playerBalance - totalBet;

                            return (
                                <button
                                    key={index}
                                    onClick={() => handlePlayer(index)}
                                    className={`player-card ${selectedPlayer === index ? "active-player" : ""}`}
                                >
                                    <div className="player-header">
                                        <div className="player-info">
                                            <div>
                                                <h3> Player {index + 1}</h3>
                                                <p> Bankroll: ₹{player.playerBalance}</p>
                                                <p>Remaining after spin: ₹{remainingBalance}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bid-container">
                                        {player.bets.map((bet) => (
                                            <div key={bet.id} className="bid-row">
                                                <div className="bid-left">
                                                    <span className="bet-chip">₹{bet.chip}</span>
                                                    <span className="bet-text">
                                                        on{" "}
                                                        {bet.type === "Single Bet" ? bet.number : bet.type}
                                                    </span>
                                                </div>

                                                <div className="bid-right">
                                                    <button className="cancel-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedPlayer(index);
                                                            removeBet(bet.id)
                                                        }}
                                                    >  Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={`total-bid ${selectedPlayer === index ? "yellow-footer" : "green-footer"}`}>
                                        Total: ₹{totalBet}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AddPlayers;
