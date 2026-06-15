import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { formatDate } from '../utils/formatDate';
import { X, Send } from 'lucide-react';
import './ChatWindow.css';

/**
 * ChatWindow — Janela de chat temporário entre comprador e vendedor.
 */
const ChatWindow = ({ chatId, onClose }) => {
  const { currentUser, getUserById } = useAuth();
  const { getChatById, sendMessage, concludeChat, isChatExpired, markAsRead } = useChat();
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  const chat = getChatById(chatId);

  // Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  // Mark messages as read on load or when new messages arrive
  useEffect(() => {
    if (chatId && currentUser?.id) {
      markAsRead(chatId, currentUser.id);
    }
  }, [chatId, currentUser?.id, chat?.messages?.length, markAsRead]);

  if (!chat) return null;

  const expired = isChatExpired(chat);
  const otherUserId = chat.participants.find((id) => id !== currentUser.id);
  const otherUser = getUserById(otherUserId);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || expired || chat.status === 'concluded') return;
    sendMessage(chatId, currentUser.id, text.trim());
    setText('');
  };

  const handleConclude = () => {
    if (window.confirm('Deseja encerrar esta negociação?')) {
      concludeChat(chatId);
    }
  };

  const daysRemaining = chat.concludedAt
    ? Math.max(0, 7 - Math.floor((Date.now() - chat.concludedAt) / 86400000))
    : null;

  return (
    <div className="chat-window card">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div>
            <h4>{otherUser?.name || 'Usuário'}</h4>
            <span className="text-xs text-muted">
              {chat.status === 'active' ? 'Negociação Ativa' : 'Encerrada'}
            </span>
          </div>
        </div>
        <div className="chat-header-actions">
          {chat.status === 'active' && (
            <button className="btn btn-secondary btn-sm" onClick={handleConclude}>
              Encerrar Negociação
            </button>
          )}
          {onClose && (
            <button className="modal-close" onClick={onClose} aria-label="Close Chat">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {chat.messages.length === 0 && (
          <div className="chat-empty">
            <p>Nenhuma mensagem ainda. Diga olá!</p>
          </div>
        )}
        {chat.messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-bubble ${msg.userId === currentUser.id ? 'own' : 'other'}`}
          >
            <p>{msg.text}</p>
            <span className="chat-bubble-time">{formatDate(msg.timestamp)}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!expired && chat.status === 'active' && (
        <form className="chat-input-bar" onSubmit={handleSend}>
          <input
            type="text"
            className="form-input"
            placeholder="Digite sua mensagem..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="btn-send-round" aria-label="Enviar Mensagem">
            <Send size={14} />
          </button>
        </form>
      )}

      {chat.status === 'concluded' && (
        <div className="chat-expired-banner">
          <p>
            Esta negociação foi concluída.{' '}
            {daysRemaining !== null && `O chat expirará em ${daysRemaining} dias.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
