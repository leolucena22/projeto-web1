import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAds } from '../context/AdsContext';
import { AD_STATUS } from '../utils/constants';
import AdCard from '../components/AdCard';
import { LayoutGrid, Plus, CheckCircle, Handshake, Package, X } from 'lucide-react';
import './Garage.css';

/**
 * Garage — Garagem virtual com 3 listas: Disponível, Em Negociação, Vendido/Trocado.
 */
const Garage = () => {
  const { currentUser } = useAuth();
  const { ads, updateAd, deleteAd } = useAds();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('available');
  const [moveModal, setMoveModal] = useState(null);

  const myAds = ads.filter((ad) => ad.userId === currentUser?.id);
  const available = myAds.filter((ad) => ad.status === AD_STATUS.AVAILABLE);
  const negotiating = myAds.filter((ad) => ad.status === AD_STATUS.NEGOTIATING);
  const sold = myAds.filter((ad) => ad.status === AD_STATUS.SOLD);

  const tabData = {
    available: { label: `Disponível (${available.length})`, items: available },
    negotiating: { label: `Em Negociação (${negotiating.length})`, items: negotiating },
    sold: { label: `Vendido/Trocado (${sold.length})`, items: sold },
  };

  const handleEdit = (adId) => {
    navigate(`/edit-ad/${adId}`);
  };

  const handleDelete = (adId) => {
    if (window.confirm('Tem certeza que deseja excluir este anúncio?')) {
      deleteAd(adId);
    }
  };

  const handleMoveSelect = (ad) => {
    setMoveModal(ad);
  };

  const handleMove = (newStatus) => {
    if (moveModal) {
      updateAd(moveModal.id, { status: newStatus });
      setMoveModal(null);
    }
  };

  return (
    <div className="page-content">
      <div className="container">
        <div className="page-header flex justify-between items-center">
          <div>
            <h1><LayoutGrid size={24} style={{ display: 'inline', verticalAlign: '-4px', marginRight: '8px' }} />Minha Garagem</h1>
            <p>Gerencie seus anúncios</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/create-ad')}>
            <Plus size={16} /> Novo Anúncio
          </button>
        </div>

        <div className="tabs">
          {Object.entries(tabData).map(([key, data]) => (
            <button
              key={key}
              className={`tab ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {data.label}
            </button>
          ))}
        </div>

        <div className="animate-fade-in">
          {tabData[activeTab].items.length > 0 ? (
            <div className="grid-auto">
              {tabData[activeTab].items.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  showActions
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onMove={handleMoveSelect}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><Package size={36} /></div>
              <h3>Nenhum anúncio nesta lista</h3>
              <p>
                {activeTab === 'available'
                  ? 'Crie um anúncio para começar a vender!'
                  : 'Itens aparecerão aqui conforme suas negociações avançarem.'}
              </p>
            </div>
          )}
        </div>

        {/* Move modal */}
        {moveModal && (
          <div className="modal-overlay" onClick={() => setMoveModal(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Mover "{moveModal.title}"</h2>
                <button className="modal-close" onClick={() => setMoveModal(null)}><X size={18} /></button>
              </div>
              <p className="text-sm text-muted mb-6">Selecione a nova lista:</p>
              <div className="flex flex-col gap-3">
                {moveModal.status !== AD_STATUS.AVAILABLE && (
                  <button className="btn btn-success btn-block" onClick={() => handleMove(AD_STATUS.AVAILABLE)}>
                    <CheckCircle size={16} /> Disponível
                  </button>
                )}
                {moveModal.status !== AD_STATUS.NEGOTIATING && (
                  <button className="btn btn-warning btn-block" onClick={() => handleMove(AD_STATUS.NEGOTIATING)}>
                    <Handshake size={16} /> Em Negociação
                  </button>
                )}
                {moveModal.status !== AD_STATUS.SOLD && (
                  <button className="btn btn-secondary btn-block" onClick={() => handleMove(AD_STATUS.SOLD)}>
                    <Package size={16} /> Vendido/Trocado
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Garage;
