import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Category from "./pages/Category";
import Signup from "./pages/Signup";

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
   
      <Navbar />

      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cat" element={<Category/>}/>
        <Route path = "/signup" element={<Signup/>} />
      </Routes>
    </div>
  );
}

export default App;
