import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import ThemeToggle from './ThemeToggle';
import { Store, Diamond } from 'lucide-react';
import './Navbar.css';

/**
 * Navbar — Menu de navegação principal com responsividade.
 */
const Navbar = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { getUnreadCount } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const unreadCount = isAuthenticated && currentUser ? getUnreadCount(currentUser.id) : 0;

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar" id="main-navbar">
      {/* Overlay Mobile */}
      <div className={`navbar-overlay ${menuOpen ? 'open' : ''}`} onClick={closeMenu} />

      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <Store size={20} className="logo-icon" />
          <span className="logo-text">Brechó Online</span>
        </Link>

        {/* Hamburger (mobile) */}
        <button
          className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <div className="hamburger-box">
            <span className="hamburger-line top"></span>
            <span className="hamburger-line bottom"></span>
          </div>
        </button>

        {/* Links */}
        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          <div className="navbar-links">
            <Link
              to="/"
              className={`navbar-link ${isActive('/') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              to="/explore"
              className={`navbar-link ${isActive('/explore') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Explorar
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/garage"
                  className={`navbar-link ${isActive('/garage') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Garagem
                </Link>
                <Link
                  to="/negotiations"
                  className={`navbar-link ${isActive('/negotiations') ? 'active' : ''} navbar-link-badge`}
                  onClick={closeMenu}
                >
                  <span>Negociações</span>
                  {unreadCount > 0 && (
                    <span className="navbar-badge animate-pulse">{unreadCount}</span>
                  )}
                </Link>
              </>
            )}
          </div>

          <div className="navbar-actions">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <Link to="/wallet" className="navbar-vat" onClick={closeMenu}>
                  <Diamond size={14} className="vat-icon-nav" />
                  <span className="vat-balance">{currentUser?.vatBalance || 0} VATs</span>
                </Link>
                <Link
                  to="/profile"
                  className="navbar-avatar"
                  onClick={closeMenu}
                  title="Meu Perfil"
                >
                  <div className="avatar">
                    {currentUser?.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} />
                    ) : (
                      currentUser?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                </Link>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  Sair
                </button>
              </>
            ) : (
              <div className="navbar-auth">
                <Link to="/login" className="btn btn-ghost btn-sm" onClick={closeMenu}>
                  Entrar
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
