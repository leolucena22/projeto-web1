import { Link } from 'react-router-dom';
import { CATEGORIES, CONDITIONS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { Pencil, Trash2, ArrowRightLeft, Diamond } from 'lucide-react';
import './AdCard.css';

/**
 * AdCard — Card de anúncio para listagens.
 * Exibe foto, título, preço, badges e link para detalhe.
 */
const AdCard = ({ ad, showActions = false, onEdit, onDelete, onMove }) => {
  const { getUserById } = useAuth();
  const seller = getUserById(ad.userId);
  const categoryLabel = CATEGORIES.find((c) => c.value === ad.category)?.label || ad.category;
  const conditionLabel = CONDITIONS.find((c) => c.value === ad.condition)?.label || ad.condition;

  const modalityBadge = {
    venda: { class: 'badge-success', label: 'Venda' },
    troca: { class: 'badge-info', label: 'Troca' },
    ambos: { class: 'badge-primary', label: 'Venda/Troca' },
  };

  const statusBadge = {
    available: { class: 'badge-success', label: 'Disponível' },
    negotiating: { class: 'badge-warning', label: 'Em Negociação' },
    sold: { class: 'badge-error', label: 'Vendido/Trocado' },
  };

  return (
    <div className="ad-card card card-interactive stagger-item" id={`ad-card-${ad.id}`}>
      <Link to={`/ad/${ad.id}`} className="ad-card-link">
        <div className="ad-card-image">
          <img
            src={ad.photo}
            alt={ad.title}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop';
            }}
          />
          <div className="ad-card-badges">
            <span className={`badge ${modalityBadge[ad.modality]?.class}`}>
              {modalityBadge[ad.modality]?.label}
            </span>
            {ad.status !== 'available' && (
              <span className={`badge ${statusBadge[ad.status]?.class}`}>
                {statusBadge[ad.status]?.label}
              </span>
            )}
          </div>
        </div>

        <div className="ad-card-body">
          <h3 className="ad-card-title">{ad.title}</h3>
          <div className="ad-card-meta">
            <span className="badge badge-primary">{categoryLabel}</span>
            <span className="badge badge-primary">{ad.size}</span>
            <span className="text-xs text-muted">{conditionLabel}</span>
          </div>
          <div className="ad-card-price">
            <span className="vat-amount"><Diamond size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />{ad.price} VATs</span>
          </div>
          {seller && (
            <div className="ad-card-seller">
              <div className="avatar" style={{ width: 24, height: 24, fontSize: '0.65rem' }}>
                {seller.avatar ? (
                  <img src={seller.avatar} alt={seller.name} />
                ) : (
                  seller.name?.charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-xs text-muted">{seller.name}</span>
            </div>
          )}
        </div>
      </Link>

      {showActions && (
        <div className="ad-card-actions">
          {onEdit && (
            <button className="btn btn-secondary btn-sm" onClick={() => onEdit(ad.id)}>
              <Pencil size={13} /> Editar
            </button>
          )}
          {onDelete && (
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(ad.id)}>
              <Trash2 size={13} /> Excluir
            </button>
          )}
          {onMove && (
            <button className="btn btn-ghost btn-sm" onClick={() => onMove(ad)}>
              <ArrowRightLeft size={13} /> Mover
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdCard;
