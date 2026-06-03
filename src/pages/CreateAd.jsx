import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAds } from '../context/AdsContext';
import { CATEGORIES, SIZES, CONDITIONS, MODALITIES } from '../utils/constants';
import { Save, Megaphone } from 'lucide-react';
import './CreateAd.css';

/**
 * CreateAd — Formulário para criar ou editar anúncio.
 */
const CreateAd = () => {
  const { id } = useParams(); // Se existir, modo edição
  const { currentUser } = useAuth();
  const { createAd, updateAd, getAdById } = useAds();
  const navigate = useNavigate();

  const existingAd = id ? getAdById(id) : null;

  const [form, setForm] = useState({
    title: existingAd?.title || '',
    description: existingAd?.description || '',
    category: existingAd?.category || '',
    size: existingAd?.size || '',
    condition: existingAd?.condition || '',
    photo: existingAd?.photo || '',
    modality: existingAd?.modality || '',
    price: existingAd?.price || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Título obrigatório';
    if (!form.description.trim()) newErrors.description = 'Descrição obrigatória';
    if (!form.category) newErrors.category = 'Selecione uma categoria';
    if (!form.size) newErrors.size = 'Selecione um tamanho';
    if (!form.condition) newErrors.condition = 'Selecione o estado';
    if (!form.photo.trim()) newErrors.photo = 'URL da foto obrigatória';
    if (!form.modality) newErrors.modality = 'Selecione a modalidade';
    if (!form.price || Number(form.price) <= 0) newErrors.price = 'Valor deve ser maior que 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const adData = {
      ...form,
      price: Number(form.price),
      userId: currentUser.id,
    };

    if (existingAd) {
      updateAd(id, adData);
    } else {
      createAd(adData);
    }

    navigate('/garage');
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="page-content">
      <div className="container">
        <div className="create-ad-container animate-fade-in-up">
          <div className="card create-ad-card">
            <div className="page-header">
              <h1>{existingAd ? 'Editar Anúncio' : 'Criar Anúncio'}</h1>
              <p>Preencha os detalhes da peça</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="ad-title">Título *</label>
                <input
                  id="ad-title"
                  type="text"
                  className="form-input"
                  placeholder="Ex: Jaqueta Jeans Vintage"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                />
                {errors.title && <span className="form-error">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="ad-description">Descrição *</label>
                <textarea
                  id="ad-description"
                  className="form-textarea"
                  placeholder="Descreva o item com detalhes..."
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
                {errors.description && <span className="form-error">{errors.description}</span>}
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="ad-category">Categoria *</label>
                  <select
                    id="ad-category"
                    className="form-select"
                    value={form.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  {errors.category && <span className="form-error">{errors.category}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="ad-size">Tamanho *</label>
                  <select
                    id="ad-size"
                    className="form-select"
                    value={form.size}
                    onChange={(e) => handleChange('size', e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {SIZES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  {errors.size && <span className="form-error">{errors.size}</span>}
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="ad-condition">Estado de Conservação *</label>
                  <select
                    id="ad-condition"
                    className="form-select"
                    value={form.condition}
                    onChange={(e) => handleChange('condition', e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {CONDITIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  {errors.condition && <span className="form-error">{errors.condition}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="ad-modality">Modalidade *</label>
                  <select
                    id="ad-modality"
                    className="form-select"
                    value={form.modality}
                    onChange={(e) => handleChange('modality', e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {MODALITIES.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  {errors.modality && <span className="form-error">{errors.modality}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="ad-photo">URL da Foto *</label>
                <input
                  id="ad-photo"
                  type="url"
                  className="form-input"
                  placeholder="https://exemplo.com/foto.jpg"
                  value={form.photo}
                  onChange={(e) => handleChange('photo', e.target.value)}
                />
                {errors.photo && <span className="form-error">{errors.photo}</span>}
                {form.photo && (
                  <div className="photo-preview mt-4">
                    <img
                      src={form.photo}
                      alt="Preview"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="ad-price">Valor em VATs *</label>
                <input
                  id="ad-price"
                  type="number"
                  className="form-input"
                  placeholder="Ex: 35"
                  min="1"
                  value={form.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                />
                {errors.price && <span className="form-error">{errors.price}</span>}
              </div>

              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                  {existingAd ? <><Save size={16} /> Salvar Alterações</> : <><Megaphone size={16} /> Publicar Anúncio</>}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={() => navigate(-1)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAd;
