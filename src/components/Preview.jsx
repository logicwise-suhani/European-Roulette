import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { useLocation, useNavigate } from "react-router-dom";

function Preview() {
    const location = useLocation();
    const navigate = useNavigate();

    const { previewData, NUMBERS, BET_OPTIONS, BLACK_NUMBERS,
    } = location.state || {};

    if (!previewData) return <h3>No preview data</h3>;

    const previewBets = previewData.players.flatMap((player) => player.bets);
    const previewActiveBets = previewBets.filter((bet) => bet.type !== "Single Bet")
        .map((bet) => bet.type);

    const betCounts = previewBets.reduce((acc, bet) => {
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
        <>
            <div className="preview">
                <div className="preview-balances">
                    <h3>Player Balances</h3>
                    <div className="players-balance">
                        {previewData.players.map((player) => (
                            <p key={player.player}>
                                Player {player.player + 1} : ₹{player.balance}
                            </p>
                        ))}
                    </div>
                </div>

                <div className="table">
                    <div className="zero">
                        {(() => {
                            const zeroPlayers = previewBets.filter(
                                (bet) => bet.type === "Single Bet" && bet.number === 0
                            );

                            const hasZeroBet = zeroPlayers.length > 0;
                            return (
                                <button
                                    value={0}
                                    className={hasZeroBet ? "yellow" : "green"}
                                    data-tooltip-id="preview-tooltip"
                                    data-tooltip-content={zeroPlayers.length > 0
                                        ? zeroPlayers
                                            .map(
                                                (bet) =>
                                                    `P${bet.player + 1} ₹${bet.chip}`
                                            )
                                            .join(", ")
                                        : null
                                    }
                                >0
                                    {betCounts["Single-0"]?.count > 0 && (
                                        <span className="button-count">
                                            {betCounts["Single-0"].count}
                                        </span>
                                    )}
                                </button>
                            );
                        })()}
                    </div>

                    <div className="other-btn">
                        {NUMBERS.map((num) => {

                            const hasSingleBet = previewBets.some((bet) =>
                                bet.type === "Single Bet" && bet.number === num
                            );

                            const numberPlayers = previewBets.filter((bet) =>
                                bet.type === "Single Bet" && bet.number === num
                            );

                            const isFirst12 =
                                previewActiveBets.includes("1st 12") &&
                                num >= 1 &&
                                num <= 12;

                            const isSecond12 =
                                previewActiveBets.includes("2nd 12") &&
                                num >= 13 &&
                                num <= 24;

                            const isThird12 =
                                previewActiveBets.includes("3rd 12") &&
                                num >= 25 &&
                                num <= 36;

                            const first18 =
                                previewActiveBets.includes("1 - 18") &&
                                num >= 1 &&
                                num <= 18;

                            const second19 =
                                previewActiveBets.includes("19 - 36") &&
                                num >= 19 &&
                                num <= 36;

                            const isEven =
                                previewActiveBets.includes("Even") &&
                                num !== 0 &&
                                num % 2 === 0;

                            const isOdd =
                                previewActiveBets.includes("Odd") &&
                                num !== 0 &&
                                num % 2 !== 0;

                            return (
                                <button
                                    key={num}
                                    value={num}
                                    className={
                                        hasSingleBet
                                            ? "yellow"
                                            : isFirst12 || isSecond12 || isThird12 ||
                                                first18 || second19 || isEven || isOdd
                                                ? "yellow"
                                                : BLACK_NUMBERS.includes(num)
                                                    ? "black"
                                                    : "red"
                                    }
                                    data-tooltip-id="preview-tooltip"
                                    data-tooltip-content={
                                        numberPlayers.length > 0
                                            ? numberPlayers
                                                .map(
                                                    (bet) =>
                                                        `P${bet.player + 1} ₹${bet.chip}`
                                                )
                                                .join(", ")
                                            : null
                                    }
                                >
                                    {num}

                                    {betCounts[`Single-${num}`]?.count > 0 && (
                                        <span className="button-count">
                                            {betCounts[`Single-${num}`].count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="bets">
                    {BET_OPTIONS.map((bet) => {

                        const betPlayers = previewBets.filter(
                            (b) => b.type === bet
                        );

                        const isActive = previewActiveBets.includes(bet);

                        return (
                            <button
                                key={bet}
                                value={bet}
                                className={isActive ? "yellow" : ""}
                                data-tooltip-id="preview-tooltip"
                                data-tooltip-content={
                                    betPlayers.length > 0
                                        ? betPlayers
                                            .map(
                                                (b) =>
                                                    `P${b.player + 1} ₹${b.chip}`
                                            )
                                            .join(", ")
                                        : null
                                }
                            >
                                {bet}

                                {betCounts[bet]?.count > 0 && (
                                    <span className="button-count" >
                                        {betCounts[bet].count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <ReactTooltip
                    id="preview-tooltip" place="top"
                    style={{
                        backgroundColor: "#b4e924", color: "black",
                        fontSize: "14px", borderRadius: "10px",
                    }}
                />
            </div>

            <div>
                <button
                    onClick={() => navigate("/", {
                        state: {
                            restoreGame: true, previewData,
                        },
                    })}> Back</button> {" "}
                <button onClick={() => navigate("/")}>Exit Game</button>
            </div>
        </>

    );
}

export default Preview;