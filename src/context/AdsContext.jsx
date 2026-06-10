import { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../utils/generateId';
import { SAMPLE_ADS } from '../data/sampleData';
import { AD_STATUS } from '../utils/constants';

/**
 * AdsContext — CRUD completo de anúncios com filtros.
 */
const AdsContext = createContext();

export const AdsProvider = ({ children }) => {
  const [ads, setAds] = useLocalStorage('brecho_ads', SAMPLE_ADS);

  /** Criar anúncio */
  const createAd = useCallback((adData) => {
    const newAd = {
      id: generateId(),
      ...adData,
      status: AD_STATUS.AVAILABLE,
      createdAt: Date.now(),
    };
    setAds((prev) => [newAd, ...prev]);
    return newAd;
  }, [setAds]);

  /** Atualizar anúncio */
  const updateAd = useCallback((id, data) => {
    setAds((prev) => prev.map((ad) => (ad.id === id ? { ...ad, ...data } : ad)));
  }, [setAds]);

  /** Excluir anúncio */
  const deleteAd = useCallback((id) => {
    setAds((prev) => prev.filter((ad) => ad.id !== id));
  }, [setAds]);

  /** Buscar anúncio por ID */
  const getAdById = useCallback((id) => {
    return ads.find((ad) => ad.id === id) || null;
  }, [ads]);

  /** Buscar anúncios de um usuário */
  const getAdsByUser = useCallback((userId) => {
    return ads.filter((ad) => ad.userId === userId);
  }, [ads]);

  /** Filtrar anúncios (listagem pública) */
  const filterAds = useCallback((filters = {}) => {
    let result = ads.filter((ad) => ad.status !== AD_STATUS.SOLD || filters.includeSold);

    if (filters.category) {
      result = result.filter((ad) => ad.category === filters.category);
    }
    if (filters.size) {
      result = result.filter((ad) => ad.size === filters.size);
    }
    if (filters.modality) {
      result = result.filter((ad) => ad.modality === filters.modality || ad.modality === 'ambos');
    }
    if (filters.minPrice !== undefined && filters.minPrice !== '') {
      result = result.filter((ad) => ad.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
      result = result.filter((ad) => ad.price <= Number(filters.maxPrice));
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (ad) =>
          ad.title.toLowerCase().includes(searchLower) ||
          ad.description.toLowerCase().includes(searchLower)
      );
    }
    if (filters.excludeUserId) {
      result = result.filter((ad) => ad.userId !== filters.excludeUserId);
    }

    return result.sort((a, b) => b.createdAt - a.createdAt);
  }, [ads]);

  return (
    <AdsContext.Provider
      value={{ ads, createAd, updateAd, deleteAd, getAdById, getAdsByUser, filterAds }}
    >
      {children}
    </AdsContext.Provider>
  );
};

export const useAds = () => {
  const context = useContext(AdsContext);
  if (!context) throw new Error('useAds deve ser usado dentro de AdsProvider');
  return context;
};
