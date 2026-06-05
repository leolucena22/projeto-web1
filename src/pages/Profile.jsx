import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRatings } from '../context/RatingContext';
import StarRating from '../components/StarRating';
import TrustBadge from '../components/TrustBadge';
import { formatDateShort } from '../utils/formatDate';
import { UserCircle, MapPin, Diamond, Pencil, Star } from 'lucide-react';
import './Profile.css';

/**
 * Profile — Página de perfil (próprio ou de outro usuário).
 */
const Profile = () => {
  const { id } = useParams();
  const { currentUser, getUserById, updateProfile } = useAuth();
  const { getUserRatings, getUserAvgRating } = useRatings();

  const isOwnProfile = !id || id === currentUser?.id;
  const user = isOwnProfile ? currentUser : getUserById(id);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    avatar: user?.avatar || '',
  });

  if (!user) {
    return (
      <div className="page-content">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon"><UserCircle size={36} /></div>
            <h3>Usuário não encontrado</h3>
          </div>
        </div>
      </div>
    );
  }

  const ratings = getUserRatings(user.id);
  const { avg, total } = getUserAvgRating(user.id);

  const handleSave = () => {
    updateProfile(form);
    setEditing(false);
  };

  return (
    <div className="page-content">
      <div className="container">
        <div className="profile-layout animate-fade-in-up">
          {/* Profile card */}
          <div className="profile-card card">
            <div className="profile-header">
              <div className="avatar avatar-xl">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </div>
              <h1>{user.name}</h1>
              <TrustBadge completedDeals={user.completedDeals || 0} avgRating={avg} />
              {user.address && <p className="text-sm text-muted mt-2"><MapPin size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />{user.address}</p>}
              <p className="text-xs text-muted">Membro desde {formatDateShort(user.createdAt)}</p>
            </div>

            <div className="profile-stats mt-6">
              <div className="stat-card">
                <div className="stat-value"><Diamond size={22} style={{ display: 'inline', verticalAlign: '-3px' }} /> {user.vatBalance}</div>
                <div className="stat-label">VATs</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{user.completedDeals || 0}</div>
                <div className="stat-label">Negociações</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{avg > 0 ? avg : '—'}</div>
                <div className="stat-label">Avaliação ({total})</div>
              </div>
            </div>

            {/* Edit form */}
            {isOwnProfile && editing && (
              <div className="profile-edit mt-6">
                <div className="form-group">
                  <label>Nome</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Cidade / Estado</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Avatar URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={form.avatar}
                    onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                  />
                </div>
                <div className="flex gap-3">
                  <button className="btn btn-primary" onClick={handleSave}>Salvar</button>
                  <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancelar</button>
                </div>
              </div>
            )}

            {isOwnProfile && !editing && (
              <button className="btn btn-secondary btn-block mt-6" onClick={() => setEditing(true)}>
                <Pencil size={14} style={{ marginRight: '6px' }} /> Editar Perfil
              </button>
            )}
          </div>

          {/* Ratings */}
          <div className="profile-ratings">
            <h2 className="mb-4"><Star size={18} style={{ display: 'inline', verticalAlign: '-3px', marginRight: '6px' }} />Avaliações Recebidas ({total})</h2>
            {ratings.length > 0 ? (
              ratings.map((rating) => {
                const fromUser = getUserById(rating.fromUserId);
                return (
                  <div key={rating.id} className="card mb-4 stagger-item">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                        {fromUser?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-sm">{fromUser?.name}</span>
                        <span className="text-xs text-muted" style={{ marginLeft: 8 }}>
                          {formatDateShort(rating.createdAt)}
                        </span>
                      </div>
                    </div>
                    <StarRating value={rating.stars} readOnly size="sm" />
                    {rating.comment && (
                      <p className="text-sm text-secondary mt-2">{rating.comment}</p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <p className="text-muted">Nenhuma avaliação ainda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
