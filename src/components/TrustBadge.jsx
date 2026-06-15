import { TRUST_LEVELS } from '../utils/constants';
import { Sprout, Star, Trophy } from 'lucide-react';
import './TrustBadge.css';

const trustIcons = {
  iniciante: <Sprout size={14} />,
  confiavel: <Star size={14} />,
  veterano: <Trophy size={14} />,
};

/**
 * TrustBadge — Exibe o selo de confiabilidade baseado em negociações e avaliações.
 */
const TrustBadge = ({ completedDeals = 0, avgRating = 0 }) => {
  // Determinar o maior nível que o usuário atingiu
  let currentLevel = TRUST_LEVELS[0];
  for (const level of TRUST_LEVELS) {
    if (completedDeals >= level.minDeals && avgRating >= level.minRating) {
      currentLevel = level;
    }
  }

  return (
    <div className={`trust-badge trust-badge-${currentLevel.key}`} title={`Selo: ${currentLevel.label}`}>
      <span className="trust-badge-icon">{trustIcons[currentLevel.key]}</span>
      <span className="trust-badge-label">{currentLevel.label}</span>
    </div>
  );
};

export default TrustBadge;
