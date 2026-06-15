import { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../utils/generateId';
import { SAMPLE_RATINGS } from '../data/sampleData';

/**
 * RatingContext — Avaliações pós-negociação.
 * Nota de 1 a 10 + comentário opcional.
 */
const RatingContext = createContext();

export const RatingProvider = ({ children }) => {
  const [ratings, setRatings] = useLocalStorage('brecho_ratings', SAMPLE_RATINGS);

  /** Enviar avaliação */
  const submitRating = useCallback((ratingData) => {
    // Verificar se já avaliou essa negociação
    const existing = ratings.find(
      (r) => r.negotiationId === ratingData.negotiationId && r.fromUserId === ratingData.fromUserId
    );
    if (existing) return { success: false, error: 'Você já avaliou esta negociação.' };

    const newRating = {
      id: generateId(),
      fromUserId: ratingData.fromUserId,
      toUserId: ratingData.toUserId,
      negotiationId: ratingData.negotiationId,
      stars: ratingData.stars,
      comment: ratingData.comment || '',
      createdAt: Date.now(),
    };
    setRatings((prev) => [...prev, newRating]);
    return { success: true, rating: newRating };
  }, [ratings, setRatings]);

  /** Buscar avaliações recebidas por um usuário */
  const getUserRatings = useCallback((userId) => {
    return ratings.filter((r) => r.toUserId === userId);
  }, [ratings]);

  /** Calcular média de avaliações de um usuário */
  const getUserAvgRating = useCallback((userId) => {
    const userRatings = ratings.filter((r) => r.toUserId === userId);
    if (userRatings.length === 0) return { avg: 0, total: 0 };
    const sum = userRatings.reduce((acc, r) => acc + r.stars, 0);
    return {
      avg: Math.round((sum / userRatings.length) * 10) / 10,
      total: userRatings.length,
    };
  }, [ratings]);

  /** Verificar se um usuário já avaliou uma negociação */
  const hasRated = useCallback((negotiationId, fromUserId) => {
    return ratings.some(
      (r) => r.negotiationId === negotiationId && r.fromUserId === fromUserId
    );
  }, [ratings]);

  return (
    <RatingContext.Provider
      value={{ ratings, submitRating, getUserRatings, getUserAvgRating, hasRated }}
    >
      {children}
    </RatingContext.Provider>
  );
};

export const useRatings = () => {
  const context = useContext(RatingContext);
  if (!context) throw new Error('useRatings deve ser usado dentro de RatingProvider');
  return context;
};
