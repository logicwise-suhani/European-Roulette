import { useState } from 'react';
import './App.css'
import celebrate from "../public/confetti";

function App() {
  const [value, setValue] = useState(null);
  const numbers = [];
  const CHIP_NUMBERS = ['₹500', '₹1000', '₹1500', '₹2000', '₹3000'];
  const BETS = ["1st 12", "2nd 12", "3rd 12", "Odd", "Red", "Even", "1 - 18", "Black", "19 - 36"];
  const [bets, setBets] = useState([]);
  const [selectedChip, setSelectedChip] = useState(null);
  const [message, setMessage] = useState("");
  const [resultNumber, setResultNumber] = useState("");
  const BLACK_NUM = [2, 4, 6, 8, 10, 11, 13, 15, 17, 19, 20, 22, 24, 26, 29, 31, 33, 35];
  const payouts = {
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
  }
  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState(5000);

  for (let i = 1; i <= 36; i++) {
    numbers.push(i);
  }

  const handleClick = (e) => {
    const chip = Number(e.target.value.replace("₹", ""));
    setSelectedChip(chip);
    setValue(`₹${chip}`);
  }

  const handleSingleBet = (e) => {

    if (!selectedChip) {
      return alert("Select chip first!");
    }

    const number = Number(e.target.value);

    setBets((prev) => [
      ...prev,
      {
        type: "Single Bet",
        number,
        chip: selectedChip,
      }
    ]);
  }

  const spinWheel = () => {

    if (bets.length === 0) {
      return alert("Place a bet first!");
    }

    const randomNumber = Math.floor(Math.random() * numbers.length);

    setResultNumber(randomNumber);

    let updatedBalance = balance;
    let totalWin = 0;
    let messages = [];

    bets.forEach((bet) => {

      let isWin = false;

      switch (bet.type) {

        case "Odd":
          isWin = randomNumber % 2 !== 0 && randomNumber !== 0;
          break;

        case "Even":
          isWin = randomNumber % 2 === 0 && randomNumber !== 0;
          break;

        case "Red":
          isWin = !BLACK_NUM.includes(randomNumber) && randomNumber !== 0;
          break;

        case "Black":
          isWin = BLACK_NUM.includes(randomNumber);
          break;

        case "1st 12":
          isWin = randomNumber >= 1 && randomNumber <= 12;
          break;

        case "2nd 12":
          isWin = randomNumber >= 13 && randomNumber <= 24;
          break;

        case "3rd 12":
          isWin = randomNumber >= 25 && randomNumber <= 36;
          break;

        case "1 - 18":
          isWin = randomNumber >= 1 && randomNumber <= 18;
          break;

        case "19 - 36":
          isWin = randomNumber >= 19 && randomNumber <= 36;
          break;

        case "Single Bet":
          isWin = randomNumber === bet.number;
          break;

        default:
          break;
      }

      updatedBalance -= bet.chip;

      if (isWin) {
        const wonAmount = bet.chip * payouts[bet.type] + bet.chip;
        updatedBalance += wonAmount;
        totalWin += wonAmount;

        messages.push(
          ` ${bet.type} won ₹${wonAmount}`
        );

      } else {
        totalWin -= bet.chip;

        messages.push(
          ` ${bet.type} lost ₹${bet.chip}`
        );
      }
    });

    setBalance(updatedBalance);

    if (totalWin > 0) {
      celebrate();
    }

    setAmount((prev) => prev + totalWin);

    setMessage(messages.join("\n"));

    setBets([]);
  }

  const handleBets = (e) => {

    if (!selectedChip) {
      return alert("Select chip first!");
    }

    const betType = e.target.value;

    setBets((prev) => [
      ...prev,
      {
        type: betType,
        chip: selectedChip,
      }
    ]);
  }

  const clearWheel = () => {
    setMessage("");
    setResultNumber("");
    setBets([]);
    setSelectedChip(null);
    setValue(null);
    setAmount(0);
    setBalance(5000);
  }

  return (
    <>
      <div>
        <h1>European Roulette</h1>

        <div className='amount'>
          <p>Bankroll: ₹{balance}</p>
          <p>Net Profit/Loss: ₹{amount}</p>
        </div>

        <div className='table'>
          <div className='zero'>
            <button onClick={handleSingleBet} value={0}>0</button>
          </div>
          <div className='other-btn'>
            {numbers.map((num) => (
              <button
                key={num}
                className={
                  num === 0
                    ? "green"
                    : BLACK_NUM.includes(num)
                      ? "black"
                      : "red"
                }
                onClick={handleSingleBet} value={num}>{num}</button>
            ))}
          </div>
        </div>

        <div className='selected'>
          <div>
            <h2>Selected Bets:</h2>
            {bets.map((bet, index) => (
              <p key={index}>
                {bet.type} <br />
                {bet.number !== undefined && ` [ ${bet.number} ]`} {" "}
                ₹{bet.chip}
              </p>
            ))}
          </div>
          <h2>Chip: {value}</h2>
        </div>

        <div className='chips'>
          {CHIP_NUMBERS.map((chip) => (
            <button onClick={handleClick} value={chip} key={chip}>{chip}</button>
          ))}
        </div>

        <br />
        <div className='bets'>
          {BETS.map((bet) => (
            <button onClick={handleBets} value={bet} key={bet}>{bet}</button>
          ))}
        </div>

        <br />
        <button onClick={spinWheel}>SPIN</button> {" "}
        <button onClick={clearWheel}>CLEAR</button>

        <div className='result'>
          {resultNumber && <p>Result: {resultNumber}</p>}
        </div>

        <div className='message'>
          {message} <br />
        </div>
      </div>

    </>
  )
}

export default App;

