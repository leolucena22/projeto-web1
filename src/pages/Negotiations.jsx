import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProposals } from '../context/ProposalContext';
import { useChat } from '../context/ChatContext';
import { useRatings } from '../context/RatingContext';
import { useAds } from '../context/AdsContext';
import ProposalTimeline from '../components/ProposalTimeline';
import ChatWindow from '../components/ChatWindow';
import StarRating from '../components/StarRating';
import { PROPOSAL_STATUS } from '../utils/constants';
import {
  Handshake,
  MessageCircle,
  Star,
  Diamond,
  X,
  Inbox,
  CheckCircle,
  XCircle,
  RefreshCw,
  PartyPopper
} from 'lucide-react';
import './Negotiations.css';

/**
 * Negotiations — Lista de negociações do usuário com chat e avaliações.
 */
const Negotiations = () => {
  const { currentUser, getUserById, updateVatBalance, incrementDeals } = useAuth();
  const {
    getProposalsByUser,
    acceptProposal,
    rejectProposal,
    counterProposal,
    concludeProposal,
    setChatForProposal
  } = useProposals();
  const { getChatByProposal, isChatExpired, getChatById, createChat } = useChat();
  const { submitRating, hasRated } = useRatings();
  const { updateAd } = useAds();

  const [activeTab, setActiveTab] = useState('active');
  const [activeChatId, setActiveChatId] = useState(null);
  const [ratingModal, setRatingModal] = useState(null);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  // Counter proposal local states
  const [activeCounterId, setActiveCounterId] = useState(null);
  const [counterValue, setCounterValue] = useState('');

  const myProposals = getProposalsByUser(currentUser?.id);

  const activeProposals = myProposals.filter(
    (p) =>
      p.status === PROPOSAL_STATUS.PENDING ||
      p.status === PROPOSAL_STATUS.COUNTERED ||
      p.status === PROPOSAL_STATUS.ACCEPTED
  );
  const concludedProposals = myProposals.filter(
    (p) =>
      p.status === PROPOSAL_STATUS.CONCLUDED ||
      p.status === PROPOSAL_STATUS.REJECTED
  );

  const tabItems = activeTab === 'active' ? activeProposals : concludedProposals;

  // Aceitar proposta
  const handleAccept = (proposal) => {
    acceptProposal(proposal.id);

    // Transferir VATs
    if (proposal.type === 'buy' || !proposal.type) {
      const amount = proposal.offeredValue;
      if (amount > 0) {
        updateVatBalance(proposal.buyerId, -amount, `Compra: ${proposal.adTitle}`);
        updateVatBalance(proposal.sellerId, amount, `Venda: ${proposal.adTitle}`);
      }
    } else if (proposal.type === 'trade') {
      const vatDiff = proposal.vatDifference || 0;
      if (vatDiff > 0) {
        // Buyer pays seller
        updateVatBalance(proposal.buyerId, -vatDiff, `Troca (adicional): ${proposal.adTitle}`);
        updateVatBalance(proposal.sellerId, vatDiff, `Troca (adicional): ${proposal.adTitle}`);
      } else if (vatDiff < 0) {
        // Seller pays buyer (negative vatDifference)
        const absDiff = Math.abs(vatDiff);
        updateVatBalance(proposal.buyerId, absDiff, `Troca (retorno): ${proposal.adTitle}`);
        updateVatBalance(proposal.sellerId, -absDiff, `Troca (retorno): ${proposal.adTitle}`);
      }
    }

    // Criar chat se não existir (deve existir se criamos na proposta)
    const chat = createChat(proposal.id, proposal.buyerId, proposal.sellerId);
    setChatForProposal(proposal.id, chat.id);

    // Atualizar status do produto anunciado
    updateAd(proposal.adId, { status: 'negotiating' });
    // Atualizar status de todos os produtos oferecidos em troca
    if (proposal.type === 'trade' && proposal.offeredItems && proposal.offeredItems.length > 0) {
      proposal.offeredItems.forEach((itemId) => {
        updateAd(itemId, { status: 'negotiating' });
      });
    }
  };

  // Rejeitar proposta
  const handleReject = (proposalId) => {
    rejectProposal(proposalId);
  };

  // Contraproposta
  const handleCounter = (proposalId) => {
    const val = Number(counterValue);
    if (val <= 0) {
      alert('Insira um valor válido de VATs.');
      return;
    }
    counterProposal(proposalId, { offeredValue: val }, currentUser.id);
    setActiveCounterId(null);
    setCounterValue('');
  };

  // Concluir negociação
  const handleConclude = (proposal) => {
    concludeProposal(proposal.id);
    updateAd(proposal.adId, { status: 'sold' });
    if (proposal.type === 'trade' && proposal.offeredItems && proposal.offeredItems.length > 0) {
      proposal.offeredItems.forEach((itemId) => {
        updateAd(itemId, { status: 'sold' });
      });
    }
    incrementDeals(proposal.buyerId);
    incrementDeals(proposal.sellerId);
  };

  const handleSubmitRating = () => {
    if (ratingStars === 0) {
      alert('Selecione uma nota.');
      return;
    }

    const otherUserId =
      ratingModal.buyerId === currentUser.id
        ? ratingModal.sellerId
        : ratingModal.buyerId;

    const result = submitRating({
      fromUserId: currentUser.id,
      toUserId: otherUserId,
      negotiationId: ratingModal.id,
      stars: ratingStars,
      comment: ratingComment,
    });

    if (result.success) {
      setRatingModal(null);
      setRatingStars(0);
      setRatingComment('');
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="page-content">
      <div className="container">
        <div className="page-header">
          <h1>
            <Handshake
              size={24}
              style={{ display: 'inline', verticalAlign: '-4px', marginRight: '8px' }}
            />
            Suas Negociações
          </h1>
          <p>Acompanhe propostas e converse com compradores ou vendedores</p>
        </div>

        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Ativas ({activeProposals.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'concluded' ? 'active' : ''}`}
            onClick={() => setActiveTab('concluded')}
          >
            Concluídas/Recusadas ({concludedProposals.length})
          </button>
        </div>

        <div className="negotiations-layout">
          <div className="negotiations-list">
            {tabItems.length > 0 ? (
              tabItems.map((proposal) => {
                const otherUserId =
                  proposal.buyerId === currentUser.id
                    ? proposal.sellerId
                    : proposal.buyerId;
                const otherUser = getUserById(otherUserId);
                const isBuyer = proposal.buyerId === currentUser.id;
                const isOwner = currentUser?.id === proposal.sellerId;
                
                // Fetch or automatically initialize chat if not exists for active proposals
                let chat = getChatByProposal(proposal.id);
                if (!chat && proposal.status !== PROPOSAL_STATUS.CONCLUDED && proposal.status !== PROPOSAL_STATUS.REJECTED) {
                  chat = createChat(proposal.id, proposal.buyerId, proposal.sellerId);
                  setChatForProposal(proposal.id, chat.id);
                }

                const canRate =
                  proposal.status === PROPOSAL_STATUS.CONCLUDED &&
                  !hasRated(proposal.id, currentUser.id);
                const canAct = isOwner || currentUser?.id === proposal.buyerId;
                const isPending =
                  proposal.status === 'pending' ||
                  proposal.status === 'countered';

                return (
                  <div key={proposal.id} className="card negotiation-card animate-fade-in-up">
                    <div className="negotiation-card-header">
                      <div className="negotiation-item-info">
                        <img
                          src={proposal.adPhoto}
                          alt={proposal.adTitle}
                          className="negotiation-item-img"
                        />
                        <div>
                          <h3>
                            <Link to={`/ad/${proposal.adId}`} className="hover-link">
                              {proposal.adTitle}
                            </Link>
                          </h3>
                          <div className="text-xs text-muted">
                            {isBuyer ? 'Você → ' : ''}
                            {otherUser?.name}
                            {!isBuyer ? ' → Você' : ''}
                            {' • '}
                            <Diamond
                              size={11}
                              style={{ display: 'inline', verticalAlign: '-1px' }}
                            />{' '}
                            {proposal.offeredValue} VATs
                          </div>
                        </div>
                      </div>
                      <span
                        className={`badge ${
                          proposal.status === 'accepted'
                            ? 'badge-success'
                            : proposal.status === 'rejected'
                            ? 'badge-error'
                            : proposal.status === 'concluded'
                            ? 'badge-info'
                            : 'badge-warning'
                        }`}
                      >
                        {proposal.status === 'pending'
                          ? 'Pendente'
                          : proposal.status === 'accepted'
                          ? 'Aceita'
                          : proposal.status === 'rejected'
                          ? 'Recusada'
                          : proposal.status === 'countered'
                          ? 'Contraproposta'
                          : 'Concluída'}
                      </span>
                    </div>

                    <ProposalTimeline timeline={proposal.timeline} />

                    <div className="flex gap-3 mt-4 flex-wrap">
                      {chat && !isChatExpired(getChatById(chat.id) || chat) && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            setActiveChatId(activeChatId === chat.id ? null : chat.id)
                          }
                        >
                          <MessageCircle size={14} />{' '}
                          {activeChatId === chat.id ? 'Fechar Chat' : 'Abrir Chat'}
                        </button>
                      )}

                      {/* Pending actions */}
                      {canAct && isPending && (
                        <>
                          {isOwner && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleAccept(proposal)}
                              >
                                <CheckCircle size={13} /> Aceitar
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleReject(proposal.id)}
                              >
                                <XCircle size={13} /> Recusar
                              </button>
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() =>
                                  setActiveCounterId(
                                    activeCounterId === proposal.id ? null : proposal.id
                                  )
                                }
                              >
                                <RefreshCw size={13} /> Contrapropor
                              </button>
                            </>
                          )}
                          {!isOwner && proposal.status === 'countered' && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleAccept(proposal)}
                              >
                                <CheckCircle size={13} /> Aceitar Contraproposta
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleReject(proposal.id)}
                              >
                                <XCircle size={13} /> Recusar
                              </button>
                            </>
                          )}
                        </>
                      )}

                      {/* Conclude Action */}
                      {proposal.status === 'accepted' && canAct && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleConclude(proposal)}
                        >
                          <PartyPopper size={14} /> Marcar como Concluída
                        </button>
                      )}

                      {canRate && (
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => setRatingModal(proposal)}
                        >
                          <Star size={14} /> Avaliar
                        </button>
                      )}
                    </div>

                    {/* Counter Form */}
                    {activeCounterId === proposal.id && (
                      <div className="flex gap-3 mt-4 items-center animate-fade-in-up">
                        <input
                          type="number"
                          className="form-input"
                          placeholder="Novo valor em VATs"
                          value={counterValue}
                          onChange={(e) => setCounterValue(e.target.value)}
                          style={{ maxWidth: 200 }}
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleCounter(proposal.id)}
                        >
                          Enviar Contraproposta
                        </button>
                      </div>
                    )}

                    {activeChatId && chat && activeChatId === chat.id && (
                      <div className="mt-4">
                        <ChatWindow
                          chatId={chat.id}
                          onClose={() => setActiveChatId(null)}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Inbox size={36} />
                </div>
                <h3>
                  Nenhuma negociação {activeTab === 'active' ? 'ativa' : 'concluída'}
                </h3>
                <p>
                  {activeTab === 'active'
                    ? 'Explore anúncios e faça propostas!'
                    : 'Suas negociações concluídas aparecerão aqui.'}
                </p>
                {activeTab === 'active' && (
                  <Link to="/explore" className="btn btn-primary mt-4">
                    Explorar Anúncios
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rating Modal */}
        {ratingModal && (
          <div className="modal-overlay" onClick={() => setRatingModal(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  <Star
                    size={18}
                    style={{ display: 'inline', verticalAlign: '-3px', marginRight: '6px' }}
                  />
                  Avaliar Negociação
                </h2>
                <button className="modal-close" onClick={() => setRatingModal(null)}>
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-muted mb-4">
                Como foi sua experiência com{' '}
                <strong>
                  {
                    getUserById(
                      ratingModal.buyerId === currentUser.id
                        ? ratingModal.sellerId
                        : ratingModal.buyerId
                    )?.name
                  }
                </strong>
                ?
              </p>

              <div className="form-group">
                <label>Nota (1 a 10 estrelas)</label>
                <StarRating
                  value={ratingStars}
                  onChange={setRatingStars}
                  max={10}
                  size="lg"
                />
              </div>

              <div className="form-group">
                <label>Comentário (opcional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Conte como foi a experiência..."
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                />
              </div>

              <button
                className="btn btn-primary btn-lg btn-block"
                onClick={handleSubmitRating}
              >
                Enviar Avaliação
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Negotiations;
