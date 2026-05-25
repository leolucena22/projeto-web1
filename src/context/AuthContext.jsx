import { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../utils/generateId';
import { SAMPLE_USERS } from '../data/sampleData';

/**
 * AuthContext — Gerencia autenticação simulada.
 * Armazena lista de usuários e sessão atual no localStorage.
 */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useLocalStorage('brecho_users', SAMPLE_USERS);
  const [currentUserId, setCurrentUserId] = useLocalStorage('brecho_current_user', null);

  // Usuário logado (derivado do array de users)
  const currentUser = currentUserId ? users.find((u) => u.id === currentUserId) || null : null;

  /** Registrar novo usuário */
  const register = useCallback((userData) => {
    // Verificar se e-mail já existe
    const exists = users.find((u) => u.email === userData.email);
    if (exists) return { success: false, error: 'E-mail já cadastrado.' };

    const newUser = {
      id: generateId(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || '',
      address: userData.address || '',
      avatar: userData.avatar || '',
      vatBalance: 0,
      vatHistory: [],
      createdAt: Date.now(),
      completedDeals: 0,
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    return { success: true, user: newUser };
  }, [users, setUsers, setCurrentUserId]);

  /** Login */
  const login = useCallback((email, password) => {
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) return { success: false, error: 'E-mail ou senha incorretos.' };
    setCurrentUserId(user.id);
    return { success: true, user };
  }, [users, setCurrentUserId]);

  /** Logout */
  const logout = useCallback(() => {
    setCurrentUserId(null);
  }, [setCurrentUserId]);

  /** Atualizar perfil */
  const updateProfile = useCallback((data) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUserId ? { ...u, ...data } : u))
    );
  }, [currentUserId, setUsers]);

  /** Atualizar saldo de VATs */
  const updateVatBalance = useCallback((userId, amount, description) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newBalance = u.vatBalance + amount;
          const historyEntry = {
            id: generateId(),
            type: amount >= 0 ? 'credit' : 'debit',
            amount: Math.abs(amount),
            description,
            timestamp: Date.now(),
            balance: newBalance,
          };
          return {
            ...u,
            vatBalance: newBalance,
            vatHistory: [...(u.vatHistory || []), historyEntry],
          };
        }
        return u;
      })
    );
  }, [setUsers]);

  /** Incrementar negociações concluídas */
  const incrementDeals = useCallback((userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, completedDeals: (u.completedDeals || 0) + 1 } : u
      )
    );
  }, [setUsers]);

  /** Buscar usuário por ID */
  const getUserById = useCallback((id) => {
    return users.find((u) => u.id === id) || null;
  }, [users]);

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        isAuthenticated: !!currentUser,
        register,
        login,
        logout,
        updateProfile,
        updateVatBalance,
        incrementDeals,
        getUserById,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};
