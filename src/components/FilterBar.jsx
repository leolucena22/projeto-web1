import { CATEGORIES, SIZES, MODALITIES } from '../utils/constants';
import { Search, X } from 'lucide-react';
import './FilterBar.css';

/**
 * FilterBar — Barra de filtros para a listagem de anúncios.
 */
const FilterBar = ({ filters, onFilterChange }) => {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      category: '',
      size: '',
      modality: '',
      minPrice: '',
      maxPrice: '',
      search: '',
    });
  };

  const hasFilters = Object.values(filters).some((v) => v !== '' && v !== undefined);

  return (
    <div className="filter-bar" id="filter-bar">
      <div className="filter-bar-search">
        <span className="search-icon"><Search size={15} /></span>
        <input
          type="text"
          className="form-input filter-search-input"
          placeholder="Buscar por título ou descrição..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
        />
      </div>

      <div className="filter-bar-selects">
        <select
          className="form-select"
          value={filters.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
        >
          <option value="">Categoria</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <select
          className="form-select"
          value={filters.size || ''}
          onChange={(e) => handleChange('size', e.target.value)}
        >
          <option value="">Tamanho</option>
          {SIZES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          className="form-select"
          value={filters.modality || ''}
          onChange={(e) => handleChange('modality', e.target.value)}
        >
          <option value="">Modalidade</option>
          {MODALITIES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <div className="filter-price-range">
          <input
            type="number"
            className="form-input"
            placeholder="Min VATs"
            min="0"
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value)}
          />
          <span className="text-muted">—</span>
          <input
            type="number"
            className="form-input"
            placeholder="Max VATs"
            min="0"
            value={filters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
          />
        </div>

        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
            <X size={13} /> Limpar
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
