import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAds } from '../context/AdsContext';
import AdCard from '../components/AdCard';
import { Search, Plus, TrendingUp, Shirt, ShoppingBag, Footprints, Camera, Handshake, MessageCircle, Star, ArrowRight, Diamond } from 'lucide-react';
import './Home.css';

/**
 * Home — Landing page com hero, destaques e estatísticas.
 */
const Home = () => {
  const { isAuthenticated, users } = useAuth();
  const { ads } = useAds();

  // Últimos 4 anúncios disponíveis
  const featuredAds = ads
    .filter((ad) => ad.status === 'available')
    .slice(0, 4);

  const totalAds = ads.filter((a) => a.status === 'available').length;
  const totalUsers = users.length;

  return (
    <div className="page-content">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-text animate-fade-in-up">
            <h1 className="hero-title">
              Moda sustentável<br />
              com <span className="hero-highlight">VATs</span>
            </h1>
            <p className="hero-subtitle">
              Compre, venda e troque roupas no maior brechó online.
              Use nossa moeda virtual VAT para negociações justas e sustentáveis.
            </p>
            <div className="hero-actions">
              <Link to="/explore" className="btn btn-primary btn-lg">
                <Search size={16} /> Explorar Anúncios
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn btn-secondary btn-lg">
                  Criar Conta Grátis
                </Link>
              )}
              {isAuthenticated && (
                <Link to="/create-ad" className="btn btn-secondary btn-lg">
                  <Plus size={16} /> Anunciar Peça
                </Link>
              )}
            </div>
          </div>
          <div className="hero-visual animate-fade-in-up">
            <div className="hero-card-stack">
              <div className="hero-card hc-1"><Shirt size={36} /></div>
              <div className="hero-card hc-2"><Footprints size={36} /></div>
              <div className="hero-card hc-3"><ShoppingBag size={36} /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mt-8">
        <div className="grid-3">
          <div className="stat-card stagger-item">
            <div className="stat-value">{totalAds}</div>
            <div className="stat-label">Anúncios Ativos</div>
          </div>
          <div className="stat-card stagger-item">
            <div className="stat-value">{totalUsers}</div>
            <div className="stat-label">Usuários</div>
          </div>
          <div className="stat-card stagger-item">
            <div className="stat-value"><Diamond size={28} /></div>
            <div className="stat-label">Moeda Virtual VAT</div>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featuredAds.length > 0 && (
        <section className="container mt-8">
          <div className="section-header">
            <h2><TrendingUp size={20} style={{ display: 'inline', verticalAlign: '-3px', marginRight: '8px' }} />Destaques Recentes</h2>
            <Link to="/explore" className="btn btn-ghost">
              Ver todos <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid-auto">
            {featuredAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="container mt-8">
        <h2 className="text-center mb-6" style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
          Como funciona?
        </h2>
        <div className="grid-4 how-it-works">
          <div className="how-step stagger-item">
            <div className="how-step-icon"><Camera size={28} /></div>
            <h3>Anuncie</h3>
            <p>Tire uma foto e crie seu anúncio com preço em VATs</p>
          </div>
          <div className="how-step stagger-item">
            <div className="how-step-icon"><Handshake size={28} /></div>
            <h3>Negocie</h3>
            <p>Receba propostas de compra ou troca de outros usuários</p>
          </div>
          <div className="how-step stagger-item">
            <div className="how-step-icon"><MessageCircle size={28} /></div>
            <h3>Converse</h3>
            <p>Chat temporário para combinar os detalhes da entrega</p>
          </div>
          <div className="how-step stagger-item">
            <div className="how-step-icon"><Star size={28} /></div>
            <h3>Avalie</h3>
            <p>Construa sua reputação avaliando e sendo avaliado</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
