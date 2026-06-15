import { useState, useMemo } from 'react';
import { useAds } from '../context/AdsContext';
import { useDebounce } from '../hooks/useDebounce';
import AdCard from '../components/AdCard';
import FilterBar from '../components/FilterBar';
import { SearchX } from 'lucide-react';
import './Explore.css';

/**
 * Explore — Listagem pública de anúncios com filtros.
 */
const Explore = () => {
  const filterAds = useAds().filterAds;
  const [filters, setFilters] = useState({
    category: '', size: '', modality: '', minPrice: '', maxPrice: '', search: '',
  });

  const debouncedSearch = useDebounce(filters.search);

  const filteredAds = useMemo(() => {
    return filterAds({
      ...filters,
      search: debouncedSearch,
    });
  }, [filters, debouncedSearch, filterAds]);

  return (
    <div className="page-content">
      <div className="container">
        <div className="page-header">
          <h1>Explorar Anúncios</h1>
          <p>Encontre peças incríveis no brechó</p>
        </div>

        <FilterBar filters={filters} onFilterChange={setFilters} />

        <div className="explore-results-info">
          <span className="text-sm text-muted">
            {filteredAds.length} anúncio{filteredAds.length !== 1 ? 's' : ''} encontrado{filteredAds.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredAds.length > 0 ? (
          <div className="grid-auto">
            {filteredAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"><SearchX size={36} /></div>
            <h3>Nenhum anúncio encontrado</h3>
            <p>Tente ajustar os filtros ou buscar por outros termos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
