import { Route, Routes } from "react-router-dom";
import Pokemon from "./pages/Pokemon";
import axios from "axios";
import { useEffect, useState } from "react";
import Footer from "./components/Footer";
import PokemonDetail from "./pages/PokemonDetail";


function App() {
  return (
    <div className="bg-neutral-100">
      <Routes>
        <Route path="/" element={<Pokemon />} />
        <Route path="/pokemon/:id" element={<PokemonDetail />} />
      </Routes>
      <Footer/>
    </div>
  );
}

export default App;
