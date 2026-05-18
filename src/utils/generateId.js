/**
 * Gera um ID único usando timestamp + valor aleatório.
 * Formato: base36 do timestamp concatenado com base36 de random.
 * @returns {string} ID único
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};
