/**
 * Constantes globais do Brechó Online.
 * Categorias, tamanhos, condições, modalidades e configurações.
 */

export const CATEGORIES = [
  { value: 'camisa', label: 'Camisa' },
  { value: 'calca', label: 'Calça' },
  { value: 'calcado', label: 'Calçado' },
  { value: 'acessorio', label: 'Acessório' },
  { value: 'vestido', label: 'Vestido' },
  { value: 'saia', label: 'Saia' },
  { value: 'bermuda', label: 'Bermuda' },
  { value: 'jaqueta', label: 'Jaqueta' },
  { value: 'moletom', label: 'Moletom' },
  { value: 'outro', label: 'Outro' },
];

export const SIZES = [
  { value: 'PP', label: 'PP' },
  { value: 'P', label: 'P' },
  { value: 'M', label: 'M' },
  { value: 'G', label: 'G' },
  { value: 'GG', label: 'GG' },
];

export const CONDITIONS = [
  { value: 'novo', label: 'Novo' },
  { value: 'bom', label: 'Bom' },
  { value: 'regular', label: 'Regular' },
  { value: 'marcas', label: 'Marcas de uso' },
];

export const MODALITIES = [
  { value: 'venda', label: 'Venda' },
  { value: 'troca', label: 'Troca' },
  { value: 'ambos', label: 'Ambos' },
];

// Status possíveis de um anúncio
export const AD_STATUS = {
  AVAILABLE: 'available',
  NEGOTIATING: 'negotiating',
  SOLD: 'sold',
};

// Status possíveis de uma proposta
export const PROPOSAL_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COUNTERED: 'countered',
  CONCLUDED: 'concluded',
};

// Selos de confiabilidade
export const TRUST_LEVELS = [
  { key: 'iniciante', label: 'Iniciante', icon: 'sprout', minDeals: 0, minRating: 0 },
  { key: 'confiavel', label: 'Confiável', icon: 'star', minDeals: 5, minRating: 7 },
  { key: 'veterano', label: 'Veterano', icon: 'trophy', minDeals: 20, minRating: 8 },
];

// Tempo de expiração do chat (7 dias em ms)
export const CHAT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

// Diferença máxima de VATs em troca pura antes de avisar (20%)
export const TRADE_VAT_DIFF_THRESHOLD = 0.20;
