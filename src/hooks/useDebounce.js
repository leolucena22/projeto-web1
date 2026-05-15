import { useState, useEffect } from 'react';

/**
 * Hook de debounce — atrasa a atualização de um valor.
 * Útil para campos de busca, evitando filtrar a cada tecla.
 * @param {*} value - Valor a debounce
 * @param {number} delay - Delay em ms (padrão 300)
 * @returns {*} Valor debounced
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
