import { useState } from "react";

function AddPlayers({ players, setPlayers, setSelectedPlayer, selectedPlayer }) {
    const [input, setInput] = useState("");

    const addPlayers = () => {
        const count = Number(input);

        if (!input.trim()) {
            alert("Please enter number of players");
            return;
        }
        if (count === 1 || count > 10) {
            alert("Players can be from 2 to 10");
            return;
        }

        const newPlayers = Array.from({ length: count }, () => ({
            bets: [],
            selectedChip: null,
            playerBalance: Math.floor(Math.random() * (8000 - 1000) + 1000),
            activeBet: [],
            selectedNumber: null
        }));
        setPlayers(newPlayers);
        setSelectedPlayer(0);
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
                        min="0"
                        max="10"
                        value={input}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button onClick={addPlayers}>Add Players +</button>
                </div>
            )}

            <br />
            {players.length > 1 &&
                <div className="player-button">
                    {players.map((player, index) => (
                        <div key={index} className="total-players">
                            <button
                                onClick={() => handlePlayer(index)}
                                className={selectedPlayer === index ? "yellow" : "green"}
                            >
                                Player Number: {index + 1}

                                {player.bets.length > 0 && (
                                    <div className="player-chip">
                                        {player.bets.map((bet, i) => (
                                            <span key={i}>₹{bet.chip} </span>
                                        ))}
                                    </div>
                                )}
                            </button>

                            <p>Bankroll {index + 1} : ₹{player.playerBalance}</p>
                        </div>
                    ))}
                </div>
            }
        </div>
    );
}

export default AddPlayers;