import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

function RouletteBoard({
    NUMBERS, CHIP_NUMBERS, BET_OPTIONS, BLACK_NUMBERS, PAYOUTS, allBets, selectedChip,
    selectedNumber, activeBets, players, selectedPlayer, handleSingleBet, handleBet, newGame,
    handleChipSelect, removeBet, spinWheel, clearWheel, resultNumber, setResultTab, betCounts,
}) {

    return (
        <>
            <div className="table">
                <div className="zero">
                    <button
                        onClick={handleSingleBet}
                        onContextMenu={(e) => {
                            e.preventDefault();

                            const lastBet = [...allBets]
                                .reverse()
                                .find(
                                    (bet) =>
                                        bet.type === "Single Bet" &&
                                        bet.number === 0
                                );

                            if (lastBet) {
                                removeBet(lastBet.id);
                            }
                        }}
                        value={0}
                        className={selectedNumber === 0 ? "yellow" : "green"}
                        data-tooltip-id="chip-tooltip"
                        data-tooltip-content={
                            selectedChip ? `Profit: ₹${selectedChip * 35} | Loss: ₹${selectedChip}`
                                : "Select chip first"
                        }
                    >0
                        {betCounts["Single-0"]?.count > 0 && (
                            <span className="button-count"
                                data-tooltip-id="chip-tooltip"
                                data-tooltip-content={betCounts["Single-0"].players.join(", ")}
                            >
                                {betCounts["Single-0"].count}
                            </span>
                        )}
                    </button>
                </div>

                <div className="other-btn">
                    {NUMBERS.map((num) => {
                        const isFirst12 =
                            activeBets.includes("1st 12") && num >= 1 && num <= 12;

                        const isSecond12 =
                            activeBets.includes("2nd 12") && num >= 13 && num <= 24;

                        const isThird12 =
                            activeBets.includes("3rd 12") && num >= 25 && num <= 36;

                        const first18 =
                            activeBets.includes("1 - 18") && num >= 1 && num <= 18;

                        const second19 =
                            activeBets.includes("19 - 36") && num >= 19 && num <= 36;

                        const isEven =
                            activeBets.includes("Even") && num !== 0 && num % 2 === 0;

                        const isOdd =
                            activeBets.includes("Odd") && num !== 0 && num % 2 !== 0;

                        return (
                            <button
                                key={num}
                                value={num}
                                onClick={handleSingleBet}
                                onContextMenu={(e) => {
                                    e.preventDefault();

                                    const lastBet = [...allBets]
                                        .reverse()
                                        .find(
                                            (bet) =>
                                                bet.type === "Single Bet" &&
                                                bet.number === num
                                        );

                                    if (lastBet) {
                                        removeBet(lastBet.id);
                                    }
                                }}
                                className={
                                    selectedNumber === num
                                        ? "yellow"
                                        : isFirst12 || isSecond12 || isThird12 ||
                                            first18 || second19 || isEven || isOdd
                                            ? "yellow"
                                            : BLACK_NUMBERS.includes(num)
                                                ? "black"
                                                : "red"
                                }
                                data-tooltip-id="chip-tooltip"
                                data-tooltip-content={
                                    selectedChip
                                        ? `Profit: ₹${selectedChip * 35} | Loss: ₹${selectedChip}`
                                        : "Select chip first"
                                }
                            >
                                {num}
                                {betCounts[`Single-${num}`]?.count > 0 && (
                                    <span
                                        className="button-count"
                                        data-tooltip-id="chip-tooltip"
                                        data-tooltip-content={
                                            betCounts[`Single-${num}`].players.join(", ")
                                        }
                                    >
                                        {betCounts[`Single-${num}`].count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="chips">
                {CHIP_NUMBERS.map((chip) => {
                    const chipValue = Number(chip.replace("₹", ""));

                    return (
                        <button
                            key={chip}
                            value={chip}
                            onClick={handleChipSelect}
                            className={
                                chipValue === players[selectedPlayer]?.selectedChip
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
                        onContextMenu={(e) => {
                            e.preventDefault();

                            const lastBet = [...allBets]
                                .reverse()
                                .find((b) => b.type === bet);

                            if (lastBet) {
                                removeBet(lastBet.id);
                            }
                        }}
                        data-tooltip-id="chip-tooltip"
                        data-tooltip-content={`Profit: ₹${selectedChip * (PAYOUTS[bet] ?? 0)
                            }, Return: ₹${selectedChip *
                            ((PAYOUTS[bet] ?? 0) + 1)
                            }, Loss: ₹${selectedChip}`}
                    >
                        {bet}

                        {betCounts[bet]?.count > 0 && (
                            <span
                                className="button-count"
                                data-tooltip-id="chip-tooltip"
                                data-tooltip-content={betCounts[bet].players.join(", ")}
                            >
                                {betCounts[bet].count}
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
            <div className="spin-win">
                <div className="spin-clear">
                    <button onClick={spinWheel}>SPIN</button>
                    <button onClick={clearWheel}>CLEAR BOARD</button>
                    <button onClick={newGame}>NEW GAME</button>
                </div>

                {resultNumber !== "" && (
                    <div style={{ marginBottom: "10px" }} className="spin-clear">
                        <button onClick={() => setResultTab("WIN")}> Win </button>
                        <button onClick={() => setResultTab("LOSE")}>  Lose </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default RouletteBoard;