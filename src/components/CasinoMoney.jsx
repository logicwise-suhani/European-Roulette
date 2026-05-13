function CasinoMoney({ balance, setBalance }) {
    return (
        <>
            <div className="casino-btn">
                <button onClick={() => setBalance(balance + 5000)}>Add + </button>
                <p>Casino Balance: ₹{balance}</p>
            </div>
        </>
    )
}
 
export default CasinoMoney;