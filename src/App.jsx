import { useState } from 'react';
import './App.css'
import celebrate from '../public/confetti';

function App() {
  const [value, setValue] = useState(null);
  const numbers = [];
  const CHIP_NUMBERS = ['₹5', '₹10', '₹50', '₹100', '₹500'];
  const BETS = ["1st 12", "2nd 12", "3rd 12", "Odd", "Red", "Even", "1 - 18", "Black", "19 - 36"];
  const [selectedBet, setSelectedBet] = useState("");
  // const [selectedBet, setSelectedBet] = useState([]);
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

  // const [multipleBets, setMultipleBets] = useState([]);

  for (let i = 1; i <= 36; i++) {
    numbers.push(i);
  }

  const handleClick = (e) => {
    const targetValue = e.target.value;
    setValue(targetValue);
    localStorage.setItem("selectedChip", targetValue);
  }

  const handleSingleBet = (e) => {
    const singleBet = e.target.value;
    localStorage.setItem("singleBet", singleBet);
    setSelectedBet("Single Bet");
  }

  const spinWheel = () => {

    let selectChip = "";
    try {
      selectChip = localStorage.getItem("selectedChip")?.replace("₹", "");
      if (!selectChip) return alert("Select a chip first!");
    }
    catch (error) {
      console.error("Error getting chip!", error);
    }

    if (!selectedBet) {
      return alert("Select a bet first!");
    }

    const randomShit = Math.floor(Math.random() * numbers.length);
    setResultNumber(randomShit);

    let result = "";

    switch (selectedBet) {
      case "Odd":
        result = randomShit % 2 !== 0 && randomShit !== 0 ? "Win" : "Lose";
        break;

      case "Even":
        result = randomShit % 2 === 0 && randomShit !== 0 ? "Win" : "Lose";
        break;

      case "Red":
        result = !BLACK_NUM.includes(randomShit) ? "Win" : "Lose";
        break;

      case "Black":
        result = BLACK_NUM.includes(randomShit) ? "Win" : "Lose";
        break;

      case "1st 12":
        result = randomShit >= 1 && randomShit <= 12 ? "Win" : "Lose";
        break;

      case "2nd 12":
        result = randomShit > 12 && randomShit <= 24 ? "Win" : "Lose";
        break;

      case "3rd 12":
        result = randomShit > 24 && randomShit <= 36 ? "Win" : "Lose";
        break;

      case "1 - 18":
        result = randomShit >= 1 && randomShit <= 18 ? "Win" : "Lose";
        break;

      case "19 - 36":
        result = randomShit >= 19 && randomShit <= 36 ? "Win" : "Lose";
        break;
      case "Single Bet":
        {
          const singleBet = JSON.parse(localStorage.getItem("singleBet"));
          result = randomShit === singleBet ? "Win" : "Lose";
          break;
        }

      default:
        break;
    }

    setMessage(result);

    const chipValue = Number(selectChip);

    let win = Number(localStorage.getItem("winAmount")) || 0;

    if (result === "Win") {
      celebrate();
      win += chipValue * payouts[selectedBet];

      localStorage.setItem("winAmount", win);
      setMessage(`${result}: ${win}`);

    } else {
      if (win === 0) {
        win = 0;
        localStorage.setItem("winAmount", win);
        setMessage(`${result}: ${win}`)
      }
      else {
        win -= chipValue;
        localStorage.setItem("winAmount", win);
        setMessage(`${result}: ${win}`);
      }

    }
  }

  const clearWheel = () => {
    setMessage("");
    setResultNumber("");
    setSelectedBet("");
    setValue(null);
    localStorage.clear();
  }

  // const handleBets = (e) => {
  //   setSelectedBet(e.target.value);

  //   setMultipleBets([...selectedBet]);
  // }

  return (
    <>
      <div>
        <h1>European Roulette</h1>

        <div className='amount'>
          <p>Total Amount: </p>
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
          <h2>Bet Type: {selectedBet}</h2>
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
            <button onClick={(e) => setSelectedBet(e.target.value)} value={bet} key={bet}>{bet}</button>
          ))}
        </div>

        <br />
        <button onClick={spinWheel}>SPIN</button> {" "}
        <button onClick={clearWheel}>CLEAR</button>

        <div className='result'>
          {resultNumber && <p>Result: {resultNumber}</p>}
        </div>

        <div className='message'>
          {message}
        </div>
      </div>

    </>
  )
}

export default App;
