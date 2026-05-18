/**
 * Formata um timestamp para exibição legível.
 * @param {number|string} timestamp - Timestamp em ms ou string de data
 * @returns {string} Data formatada (ex: "19/05/2026 20:30")
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formata um timestamp para exibição curta (só data).
 * @param {number|string} timestamp
 * @returns {string} Data formatada (ex: "19/05/2026")
 */
export const formatDateShort = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Retorna tempo relativo (ex: "há 2 horas", "há 3 dias")
 * @param {number} timestamp
 * @returns {string}
 */
export const timeAgo = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes}min`;
  if (hours < 24) return `há ${hours}h`;
  if (days < 30) return `há ${days}d`;
  return formatDateShort(timestamp);
};
