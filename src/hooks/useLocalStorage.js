import { useState, useEffect } from 'react';

/**
 * Hook genérico para sincronizar estado com localStorage com suporte a multi-tab.
 * @param {string} key - Chave no localStorage
 * @param {*} initialValue - Valor inicial caso a chave não exista
 * @returns {[*, Function]} - [valor, setter]
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Atualiza o localStorage sempre que o estado interno mudar
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Erro ao salvar localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Sincroniza estado em tempo real entre abas/janelas do mesmo navegador
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Erro ao sincronizar aba para chave "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setStoredValue];
};
