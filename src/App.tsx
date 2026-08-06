import { Navigate, Route, Routes } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import Dex from './pages/Dex';
import PokemonDetail from './pages/PokemonDetail';
import Team from './pages/Team';

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <Routes>
        <Route path="/" element={<Dex />} />
        <Route path="/pokemon/:id" element={<PokemonDetail />} />
        <Route path="/team" element={<Team />} />
        {/* An unknown path used to render a blank page with a footer on it. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Species data from{' '}
            <a
              href="https://pokeapi.co"
              className="underline underline-offset-4 hover:text-foreground"
              target="_blank"
              rel="noreferrer"
            >
              PokeAPI
            </a>
            . Your team is saved on this device only.
          </p>
          <p>Built by Khahlil Gibran Hadi</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
