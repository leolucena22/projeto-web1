import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AdsProvider } from './context/AdsContext';
import { ProposalProvider } from './context/ProposalContext';
import { ChatProvider } from './context/ChatContext';
import { RatingProvider } from './context/RatingContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import FloatingChat from './components/FloatingChat';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import AdDetail from './pages/AdDetail';
import CreateAd from './pages/CreateAd';
import Profile from './pages/Profile';
import Garage from './pages/Garage';
import Negotiations from './pages/Negotiations';
import Wallet from './pages/Wallet';

/**
 * App — Componente raiz com providers, roteamento e layout.
 */
const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdsProvider>
          <ProposalProvider>
            <ChatProvider>
              <RatingProvider>
                <Router>
                  <Navbar />
                  <Routes>
                    {/* Rotas públicas */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/ad/:id" element={<AdDetail />} />
                    <Route path="/profile/:id" element={<Profile />} />

                    {/* Rotas protegidas */}
                    <Route path="/create-ad" element={
                      <ProtectedRoute><CreateAd /></ProtectedRoute>
                    } />
                    <Route path="/edit-ad/:id" element={
                      <ProtectedRoute><CreateAd /></ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute><Profile /></ProtectedRoute>
                    } />
                    <Route path="/garage" element={
                      <ProtectedRoute><Garage /></ProtectedRoute>
                    } />
                    <Route path="/negotiations" element={
                      <ProtectedRoute><Negotiations /></ProtectedRoute>
                    } />
                    <Route path="/wallet" element={
                      <ProtectedRoute><Wallet /></ProtectedRoute>
                    } />
                  </Routes>
                  <FloatingChat />
                  <Footer />
                </Router>
              </RatingProvider>
            </ChatProvider>
          </ProposalProvider>
        </AdsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
