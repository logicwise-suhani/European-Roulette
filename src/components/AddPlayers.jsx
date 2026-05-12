import { useState } from "react";

function AddPlayers() {
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
    };

    const handleKeyDown = (e) => {
        const invalid = ["e", "E", ".", "+", "-"];
        if (invalid.includes(e.key)) e.preventDefault();
    };

    const handlePlayer = (e) => {
        const activeButton = Number(e.target.value);
        setIsActive(activeButton);
    }

    return (
        <>
            <div className="players">

                {totalPlayers.length > 0 ? "" :
                    <>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={players}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => setPlayers(e.target.value)}
                        /> {" "}

                        <button onClick={addPlayers}>
                            Add Players +
                        </button>
                    </>
                }

                <br />
                <div className="player-button">
                    {totalPlayers.map((player) => (
                        <div key={player} className="total-players">
                            <button onClick={handlePlayer} className={player === isActive ? "yellow" : "green"} value={player}>Player Number: {player}</button>
                        </div>
                    ))}
                </div>

            </div>
        </>
    );
}

export default AddPlayers;