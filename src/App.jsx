import "./App.css";
import Casino from "./components/Casino";
import Preview from "./components/Preview";
import { Routes, Route } from "react-router-dom";

function App() {

  return (
    <div>
      <Routes>
        <Route path="/" element={<Casino />} />
        <Route path="/preview" element={<Preview />} />
      </Routes>
    </div>
  );
}

export default App;