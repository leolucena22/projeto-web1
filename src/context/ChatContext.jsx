import { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../utils/generateId';
import { CHAT_EXPIRY_MS } from '../utils/constants';

/**
 * ChatContext — Chat temporário criado quando uma proposta é ativa ou aceita.
 * Expira 7 dias após a conclusão da negociação.
 */
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useLocalStorage('brecho_chats', []);

  /** Criar chat vinculado a uma proposta */
  const createChat = useCallback((proposalId, user1Id, user2Id) => {
    const existing = chats.find((c) => c.proposalId === proposalId);
    if (existing) return existing;

    const newChat = {
      id: generateId(),
      proposalId,
      participants: [user1Id, user2Id],
      messages: [],
      status: 'active', // 'active' | 'concluded'
      concludedAt: null,
      createdAt: Date.now(),
      unreadBy: {
        [user1Id]: false,
        [user2Id]: false
      }
    };
    setChats((prev) => [...prev, newChat]);
    return newChat;
  }, [chats, setChats]);

  /** Enviar mensagem */
  const sendMessage = useCallback((chatId, senderId, text) => {
    const message = {
      id: generateId(),
      userId: senderId,
      text,
      timestamp: Date.now(),
    };

    setChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const otherUserId = c.participants.find((id) => id !== senderId);
          return {
            ...c,
            messages: [...c.messages, message],
            unreadBy: {
              ...c.unreadBy,
              [otherUserId]: true,
            }
          };
        }
        return c;
      })
    );

    return message;
  }, [setChats]);

  /** Marcar chat como lido para um usuário */
  const markAsRead = useCallback((chatId, userId) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          return {
            ...c,
            unreadBy: {
              ...c.unreadBy,
              [userId]: false
            }
          };
        }
        return c;
      })
    );
  }, [setChats]);

  /** Obter total de conversas não lidas */
  const getUnreadCount = useCallback((userId) => {
    if (!userId) return 0;
    return chats.reduce((acc, c) => {
      if (c.unreadBy?.[userId] && c.status === 'active') {
        return acc + 1;
      }
      return acc;
    }, 0);
  }, [chats]);

  /** Encerrar chat (marcar como concluído) */
  const concludeChat = useCallback((chatId) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, status: 'concluded', concludedAt: Date.now() } : c
      )
    );
  }, [setChats]);

  /** Verificar se chat expirou */
  const isChatExpired = useCallback((chat) => {
    if (chat.status !== 'concluded' || !chat.concludedAt) return false;
    return Date.now() - chat.concludedAt > CHAT_EXPIRY_MS;
  }, []);

  /** Buscar chat por ID */
  const getChatById = useCallback((id) => {
    return chats.find((c) => c.id === id) || null;
  }, [chats]);

  /** Buscar chat por proposta */
  const getChatByProposal = useCallback((proposalId) => {
    return chats.find((c) => c.proposalId === proposalId) || null;
  }, [chats]);

  /** Buscar chats de um usuário */
  const getChatsByUser = useCallback((userId) => {
    return chats.filter((c) => c.participants.includes(userId) && !isChatExpired(c));
  }, [chats, isChatExpired]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        createChat,
        sendMessage,
        markAsRead,
        getUnreadCount,
        concludeChat,
        isChatExpired,
        getChatById,
        getChatByProposal,
        getChatsByUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat deve ser usado dentro de ChatProvider');
  return context;
};
