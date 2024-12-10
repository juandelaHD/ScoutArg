import './App.css';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import LandingPage from './pages/landingPage';
import SignIn from './pages/signIn';
import SignUp from './pages/signUp';
import Home from './pages/home';
import Team from './pages/team';
import Player from './pages/player';
import Header from './components/header/header';
import Footer from './components/footer/footer';

function App() {
  return (
    <BrowserRouter>
      <ConditionalHeader /> 
      <Routes>
        <Route index element={<LandingPage />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/teams" element={<Home />} />
        <Route path="/teams/:teamId/:teamName" element={<Team />} />
        <Route path="/teams/:teamName/:playerId/:playerName" element={<Player />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

function ConditionalHeader() {
  const location = useLocation(); 
  const noHeader = ['/', '/sign-in', '/sign-up']; 

  const isSpecialHeader = noHeader.includes(location.pathname);

  return isSpecialHeader ? "" : <Header />;
}

export default App;
