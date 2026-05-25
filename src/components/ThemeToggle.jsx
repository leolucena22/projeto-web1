import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import './ThemeToggle.css';

/**
 * ThemeToggle — Botão para alternar entre modo claro e escuro.
 */
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
      aria-label="Alternar tema"
    >
      <span className="theme-toggle-icon">
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </span>
    </button>
  );
};

export default ThemeToggle;
