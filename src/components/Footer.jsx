import { Store } from 'lucide-react';
import './Footer.css';

/**
 * Footer — Rodapé do site.
 */
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo"><Store size={16} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '6px' }} />Brechó Online</span>
            <p className="text-sm text-muted">
              Compre, venda e troque roupas de forma sustentável.
            </p>
          </div>
          <div className="footer-info">
            <p className="text-sm text-muted">
              Projeto acadêmico — Moeda fictícia VAT
            </p>
            <p className="text-xs text-muted">
              © {new Date().getFullYear()} Brechó Online. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
