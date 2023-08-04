import { Route, Routes } from "react-router-dom";
import Pokemon from "./pages/Pokemon";
import axios from "axios";
import { useEffect, useState } from "react";
import Footer from "./components/Footer";


function App() {
  return (
    <div className="bg-neutral-100">
      <Routes>
        <Route path="/" element={<Pokemon />} />
      </Routes>
      <Footer/>
    </div>
  );
}

export default App;
