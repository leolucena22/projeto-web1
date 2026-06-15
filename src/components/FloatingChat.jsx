import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useProposals } from '../context/ProposalContext';
import { formatDate } from '../utils/formatDate';
import { MessageSquare, X, ChevronLeft, Handshake, Send } from 'lucide-react';
import './FloatingChat.css';

/**
 * FloatingChat — Um widget de chat flutuante minimalista e elegante
 * para conversas rápidas de negociação.
 */
const FloatingChat = () => {
  const { currentUser, getUserById } = useAuth();
  const { getChatsByUser, getUnreadCount, sendMessage, markAsRead, getChatById } = useChat();
  const { getProposalsByUser } = useProposals();
  const location = useLocation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputText, setInputText] = useState('');
  
  const messagesEndRef = useRef(null);
  const activeChat = activeChatId ? getChatById(activeChatId) : null;

  // Auto-scroll inside floating chat
  useEffect(() => {
    if (activeChatId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages?.length, activeChatId]);

  // Mark messages as read when a chat is opened
  useEffect(() => {
    if (activeChatId && currentUser?.id) {
      markAsRead(activeChatId, currentUser.id);
    }
  }, [activeChatId, currentUser?.id, activeChat?.messages?.length, markAsRead]);

  // Hide completely on the negotiations route to avoid two chats on screen
  if (!currentUser || location.pathname === '/negotiations') return null;

  const activeChats = getChatsByUser(currentUser.id).filter(c => c.status === 'active');
  const unreadCount = getUnreadCount(currentUser.id);
  const proposals = getProposalsByUser(currentUser.id);

  const getProposalForChat = (proposalId) => {
    return proposals.find(p => p.id === proposalId);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;
    sendMessage(activeChatId, currentUser.id, inputText.trim());
    setInputText('');
  };

  return (
    <div className="floating-chat-container">
      {/* Floating Button */}
      <button 
        className={`floating-chat-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => {
          setIsOpen(!isOpen);
          setActiveChatId(null);
        }}
        aria-label="Mensagens de Negociação"
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
        {unreadCount > 0 && <span className="floating-chat-badge animate-pulse">{unreadCount}</span>}
      </button>

      {/* Floating Chat Box */}
      {isOpen && (
        <div className="floating-chat-drawer card">
          {activeChatId && activeChat ? (
            /* Compact Chat Stream View */
            <div className="floating-chat-view">
              <div className="floating-chat-view-header">
                <button 
                  className="btn-back"
                  onClick={() => setActiveChatId(null)}
                >
                  <ChevronLeft size={16} /> Voltar
                </button>
                <div className="header-user-info">
                  <h4>
                    {getUserById(activeChat.participants.find(id => id !== currentUser.id))?.name || 'Negociação'}
                  </h4>
                  <span className="subtitle">
                    {getProposalForChat(activeChat.proposalId)?.adTitle || 'Anúncio'}
                  </span>
                </div>
                <button className="btn-close" onClick={() => setIsOpen(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="floating-chat-messages">
                {activeChat.messages.length === 0 ? (
                  <div className="chat-empty">
                    <p>Envie uma mensagem para iniciar a negociação!</p>
                  </div>
                ) : (
                  activeChat.messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`compact-bubble ${msg.userId === currentUser.id ? 'own' : 'other'}`}
                    >
                      <p>{msg.text}</p>
                      <span className="bubble-time">{formatDate(msg.timestamp)}</span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="floating-chat-input-bar" onSubmit={handleSend}>
                <input 
                  type="text" 
                  placeholder="Mensagem..." 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="form-input"
                />
                <button type="submit" className="btn-send">
                  <Send size={14} />
                </button>
              </form>
            </div>
          ) : (
            /* Chats List View */
            <div className="floating-chat-list-view">
              <div className="floating-chat-header">
                <h3>Mensagens</h3>
                <button className="btn-close" onClick={() => setIsOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="floating-chat-list">
                {activeChats.length > 0 ? (
                  activeChats.map((chat) => {
                    const otherUserId = chat.participants.find(id => id !== currentUser.id);
                    const otherUser = getUserById(otherUserId);
                    const proposal = getProposalForChat(chat.proposalId);
                    const lastMessage = chat.messages[chat.messages.length - 1];
                    const isUnread = chat.unreadBy?.[currentUser.id];

                    return (
                      <div 
                        key={chat.id} 
                        className={`floating-chat-item ${isUnread ? 'unread' : ''}`}
                        onClick={() => setActiveChatId(chat.id)}
                      >
                        {proposal && (
                          <img 
                            src={proposal.adPhoto} 
                            alt={proposal.adTitle} 
                            className="floating-chat-item-img"
                          />
                        )}
                        <div className="floating-chat-item-info">
                          <div className="floating-chat-item-top">
                            <h4>{otherUser?.name || 'Usuário'}</h4>
                            {isUnread && <span className="unread-dot"></span>}
                          </div>
                          <p className="floating-chat-item-ad">
                            {proposal?.adTitle || 'Negociação'}
                          </p>
                          <p className="floating-chat-item-preview">
                            {lastMessage ? lastMessage.text : 'Nenhuma mensagem ainda.'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="floating-chat-empty">
                    <Handshake size={28} className="text-muted mb-2" />
                    <p className="text-sm">Nenhuma negociação ativa no momento.</p>
                    <p className="text-xs text-muted">Envie ou receba propostas para iniciar um chat!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingChat;
