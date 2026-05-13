import { useState } from "react";

function AddPlayers({ playerBalances, setPlayerBalances, setSelectedPlayer }) {
    const [players, setPlayers] = useState("");
    const [totalPlayers, setTotalPlayers] = useState([]);
    const [isActive, setIsActive] = useState(false);

    const addPlayers = () => {
        if (players.trim() === "") {
            alert("Please enter a player number");
            return;
        }

        if (players > 10) {
            alert("Cannot be more than 10");
            return;
        }

        localStorage.setItem("players", players);
        const playerNum = Number(localStorage.getItem("players"));

        const playerList = Array.from(
            { length: playerNum },
            (_, index) => index + 1
        );

        setTotalPlayers(playerList);

        const randomNum = Array.from({ length: playerNum }, () =>
            Math.floor(Math.random() * (8000 - 1000) + 1000)
        );
        setPlayerBalances(randomNum);
    };

    const handleKeyDown = (e) => {
        const invalid = ["e", "E", ".", "+", "-"];
        if (invalid.includes(e.key)) e.preventDefault();
    };

    const handlePlayer = (e) => {
        const activePlayer = Number(e.target.value);
        setIsActive(activePlayer);
        setSelectedPlayer(activePlayer - 1);
    }

    return (
        <>
            <div className="players">
                {totalPlayers.length > 0 ? "" :
                    <>
                        <div className="input-button">
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={players}
                                onKeyDown={handleKeyDown}
                                onChange={(e) => setPlayers(e.target.value)}
                            /> {" "}

                            <button onClick={addPlayers}>Add Players +</button>
                        </div>
                    </>
                }

                <br />
                <div className="player-button">
                    {totalPlayers.map((player, index) => (
                        <div key={player} className="total-players">
                            <button onClick={handlePlayer} className={player === isActive ? "yellow" : "green"} value={player}>Player Number: {player}</button>
                            <p>Bankroll {player} : ₹{playerBalances[index]}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default AddPlayers;
