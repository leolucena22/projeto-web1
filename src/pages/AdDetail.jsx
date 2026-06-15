import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAds } from '../context/AdsContext';
import { useProposals } from '../context/ProposalContext';
import { useChat } from '../context/ChatContext';
import ProposalTimeline from '../components/ProposalTimeline';
import { CATEGORIES, SIZES, CONDITIONS, MODALITIES, TRADE_VAT_DIFF_THRESHOLD } from '../utils/constants';
import { formatDate } from '../utils/formatDate';
import { Diamond, Handshake, Pencil, ShoppingCart, RefreshCw, CheckCircle, XCircle, PartyPopper, MessageCircle, ClipboardList, X, AlertCircle } from 'lucide-react';
import './AdDetail.css';

/**
 * AdDetail — Página de detalhe de um anúncio com sistema de propostas.
 */
const AdDetail = () => {
  const { id } = useParams();
  const { currentUser, isAuthenticated, getUserById } = useAuth();
  const { getAdById, updateAd, getAdsByUser: getAdsForUser } = useAds();
  const { sendProposal, getProposalsByAd, acceptProposal, rejectProposal, counterProposal, concludeProposal, setChatForProposal } = useProposals();
  const { createChat } = useChat();
  const { updateVatBalance, incrementDeals } = useAuth();

  const ad = getAdById(id);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalType, setProposalType] = useState('buy');
  const [offeredValue, setOfferedValue] = useState('');
  const [counterValue, setCounterValue] = useState('');
  const [activeCounterId, setActiveCounterId] = useState(null);

  const [selectedMyAdIds, setSelectedMyAdIds] = useState([]);
  const [vatDiffInput, setVatDiffInput] = useState('');

  const myAvailableAds = currentUser ? getAdsForUser(currentUser.id).filter((a) => a.status === 'available') : [];
  const selectedMyAds = myAvailableAds.filter((a) => selectedMyAdIds.includes(a.id));

  if (!ad) {
    return (
      <div className="page-content">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon"><AlertCircle size={36} /></div>
            <h3>Anúncio não encontrado</h3>
            <Link to="/explore" className="btn btn-primary mt-4">Explorar Anúncios</Link>
          </div>
        </div>
      </div>
    );
  }

  const seller = getUserById(ad.userId);
  const isOwner = currentUser?.id === ad.userId;
  const proposals = getProposalsByAd(ad.id);
  const categoryLabel = CATEGORIES.find((c) => c.value === ad.category)?.label || ad.category;
  const sizeLabel = SIZES.find((s) => s.value === ad.size)?.label || ad.size;
  const conditionLabel = CONDITIONS.find((c) => c.value === ad.condition)?.label || ad.condition;
  const modalityLabel = MODALITIES.find((m) => m.value === ad.modality)?.label || ad.modality;

  // Enviar proposta
  const handleSendProposal = () => {
    let offeredVal = 0;
    let vatDiff = 0;
    let offeredItems = [];
    let offeredItemTitle = '';

    if (proposalType === 'trade') {
      if (selectedMyAdIds.length === 0) {
        alert('Por favor, selecione pelo menos um produto para a troca.');
        return;
      }
      if (selectedMyAdIds.length > 5) {
        alert('Você pode selecionar no máximo 5 produtos para a troca.');
        return;
      }
      
      const selectedAds = myAvailableAds.filter((a) => selectedMyAdIds.includes(a.id));
      if (selectedAds.length !== selectedMyAdIds.length) {
        alert('Algum produto selecionado é inválido.');
        return;
      }

      offeredItems = selectedAds.map((a) => a.id);
      offeredItemTitle = selectedAds.map((a) => a.title).join(', ');

      const offeredSum = selectedAds.reduce((sum, item) => sum + item.price, 0);
      const valDiff = Number(vatDiffInput) || 0;
      if (valDiff < 0) {
        alert('O valor da diferença deve ser positivo.');
        return;
      }

      if (offeredSum < ad.price) {
        // Cheaper: buyer adds money
        if (valDiff > 0) {
          if (currentUser.vatBalance < valDiff) {
            alert('Saldo de VATs insuficiente para o dinheiro adicional.');
            return;
          }
          vatDiff = valDiff;
        }
      } else if (offeredSum > ad.price) {
        // More expensive: buyer wants money back (negative vatDifference)
        if (valDiff > 0) {
          vatDiff = -valDiff;
        }
      }
    } else {
      offeredVal = Number(offeredValue);
      if (offeredVal <= 0 || offeredVal > ad.price) {
        alert('O valor deve ser maior que 0 e não pode exceder o preço anunciado.');
        return;
      }
      if (currentUser.vatBalance < offeredVal) {
        alert('Saldo de VATs insuficiente.');
        return;
      }
    }

    const newProp = sendProposal({
      adId: ad.id,
      adTitle: ad.title,
      adPhoto: ad.photo,
      sellerId: ad.userId,
      buyerId: currentUser.id,
      type: proposalType,
      offeredValue: proposalType === 'buy' ? offeredVal : 0,
      offeredItems,
      offeredItemTitle,
      vatDifference: vatDiff,
    });

    // Create chat immediately so they can start negotiating in real-time
    const chat = createChat(newProp.id, newProp.buyerId, newProp.sellerId);
    setChatForProposal(newProp.id, chat.id);

    updateAd(ad.id, { status: 'negotiating' });
    if (proposalType === 'trade' && offeredItems.length > 0) {
      offeredItems.forEach((itemId) => {
        updateAd(itemId, { status: 'negotiating' });
      });
    }

    setShowProposalForm(false);
    setOfferedValue('');
    setSelectedMyAdIds([]);
    setVatDiffInput('');
  };

  // Aceitar proposta
  const handleAccept = (proposal) => {
    acceptProposal(proposal.id);

    // Transferir VATs
    if (proposal.type === 'buy') {
      const amount = proposal.offeredValue;
      if (amount > 0) {
        updateVatBalance(proposal.buyerId, -amount, `Compra: ${ad.title}`);
        updateVatBalance(proposal.sellerId, amount, `Venda: ${ad.title}`);
      }
    } else if (proposal.type === 'trade') {
      const vatDiff = proposal.vatDifference || 0;
      if (vatDiff > 0) {
        // Buyer pays seller
        updateVatBalance(proposal.buyerId, -vatDiff, `Troca (adicional): ${ad.title}`);
        updateVatBalance(proposal.sellerId, vatDiff, `Troca (adicional): ${ad.title}`);
      } else if (vatDiff < 0) {
        // Seller pays buyer (negative vatDifference)
        const absDiff = Math.abs(vatDiff);
        updateVatBalance(proposal.buyerId, absDiff, `Troca (retorno): ${ad.title}`);
        updateVatBalance(proposal.sellerId, -absDiff, `Troca (retorno): ${ad.title}`);
      }
    }

    // Criar chat
    const chat = createChat(proposal.id, proposal.buyerId, proposal.sellerId);
    setChatForProposal(proposal.id, chat.id);

    updateAd(ad.id, { status: 'negotiating' });
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
  const handleCounter = (proposal) => {
    const value = Number(counterValue);
    if (value < 0) {
      alert('Informe um valor válido.');
      return;
    }
    if (proposal.type === 'trade') {
      let newVatDiff = value;
      if (proposal.vatDifference < 0) {
        newVatDiff = -value;
      }
      counterProposal(proposal.id, { vatDifference: newVatDiff }, currentUser.id);
    } else {
      counterProposal(proposal.id, { offeredValue: value }, currentUser.id);
    }
    setActiveCounterId(null);
    setCounterValue('');
  };

  // Concluir negociação
  const handleConclude = (proposal) => {
    concludeProposal(proposal.id);
    updateAd(ad.id, { status: 'sold' });
    if (proposal.type === 'trade' && proposal.offeredItems && proposal.offeredItems.length > 0) {
      proposal.offeredItems.forEach((itemId) => {
        updateAd(itemId, { status: 'sold' });
      });
    }
    incrementDeals(proposal.buyerId);
    incrementDeals(proposal.sellerId);
  };

  return (
    <div className="page-content">
      <div className="container">
        <div className="ad-detail animate-fade-in-up">
          {/* Main content */}
          <div className="ad-detail-main">
            <div className="ad-detail-image">
              <img
                src={ad.photo}
                alt={ad.title}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop';
                }}
              />
            </div>

            <div className="ad-detail-info">
              <div className="ad-detail-badges">
                <span className="badge badge-primary">{categoryLabel}</span>
                <span className="badge badge-primary">{sizeLabel}</span>
                <span className="badge badge-info">{modalityLabel}</span>
                <span className="badge badge-success">{conditionLabel}</span>
              </div>

              <h1 className="ad-detail-title">{ad.title}</h1>

              <div className="ad-detail-price">
                <span className="vat-amount" style={{ fontSize: 'var(--font-size-3xl)' }}>
                  <Diamond size={22} style={{ display: 'inline', verticalAlign: '-4px', marginRight: '4px' }} /> {ad.price} VATs
                </span>
              </div>

              <p className="ad-detail-description">{ad.description}</p>

              <div className="ad-detail-meta">
                <span className="text-sm text-muted">Publicado em {formatDate(ad.createdAt)}</span>
              </div>

              {/* Seller info */}
              {seller && (
                <Link to={`/profile/${seller.id}`} className="ad-detail-seller card">
                  <div className="avatar">
                    {seller.avatar ? (
                      <img src={seller.avatar} alt={seller.name} />
                    ) : (
                      seller.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4>{seller.name}</h4>
                    <span className="text-xs text-muted">{seller.address || 'Local não informado'}</span>
                  </div>
                </Link>
              )}

              {/* Actions */}
              {isAuthenticated && !isOwner && ad.status === 'available' && (
                <div className="mt-6">
                  <button
                    className="btn btn-primary btn-lg btn-block"
                    onClick={() => setShowProposalForm(true)}
                  >
                    <Handshake size={16} /> Fazer Proposta
                  </button>
                </div>
              )}

              {isOwner && (
                <div className="flex gap-3 mt-6">
                  <Link to={`/edit-ad/${ad.id}`} className="btn btn-secondary" style={{ flex: 1 }}>
                    <Pencil size={14} /> Editar
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Proposal Form Modal */}
          {showProposalForm && (
            <div className="modal-overlay" onClick={() => setShowProposalForm(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Fazer Proposta</h2>
                  <button className="modal-close" onClick={() => setShowProposalForm(false)}><X size={18} /></button>
                </div>

                <div className="form-group">
                  <label>Tipo de proposta</label>
                  <div className="flex gap-3">
                    {(ad.modality === 'venda' || ad.modality === 'ambos') && (
                      <button
                        type="button"
                        className={`btn ${proposalType === 'buy' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => {
                          setProposalType('buy');
                          setSelectedMyAdIds([]);
                          setVatDiffInput('');
                        }}
                      >
                        <ShoppingCart size={14} /> Compra
                      </button>
                    )}
                    {(ad.modality === 'troca' || ad.modality === 'ambos') && (
                      <button
                        type="button"
                        className={`btn ${proposalType === 'trade' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => {
                          setProposalType('trade');
                          setOfferedValue('');
                        }}
                      >
                        <RefreshCw size={14} /> Troca
                      </button>
                    )}
                  </div>
                </div>

                {proposalType === 'buy' && (
                  <div className="form-group animate-fade-in">
                    <label htmlFor="offered-value">Valor em VATs (max: {ad.price})</label>
                    <input
                      id="offered-value"
                      type="number"
                      className="form-input"
                      placeholder="Ex: 30"
                      min="1"
                      max={ad.price}
                      value={offeredValue}
                      onChange={(e) => setOfferedValue(e.target.value)}
                    />
                    {currentUser && (
                      <span className="form-help">Seu saldo: <Diamond size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> {currentUser.vatBalance} VATs</span>
                    )}
                  </div>
                )}

                {proposalType === 'trade' && (
                  <>
                    <div className="form-group animate-fade-in">
                      <label>Selecione as suas peças para troca (de 1 a 5 peças)</label>
                      {myAvailableAds.length === 0 ? (
                        <div className="alert-message warning text-sm p-3" style={{ border: '1px solid var(--color-warning)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-warning)' }}>
                          Você não possui nenhum produto disponível para troca no momento. Crie um anúncio antes de propor uma troca!
                        </div>
                      ) : (
                        <div className="my-ads-checkbox-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', padding: '12px', marginTop: '8px' }}>
                          {myAvailableAds.map(item => {
                            const isSelected = selectedMyAdIds.includes(item.id);
                            return (
                              <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-text)' }}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setSelectedMyAdIds(prev => prev.filter(id => id !== item.id));
                                    } else {
                                      if (selectedMyAdIds.length >= 5) {
                                        alert('Você pode selecionar no máximo 5 peças para a troca.');
                                        return;
                                      }
                                      setSelectedMyAdIds(prev => [...prev, item.id]);
                                    }
                                    setVatDiffInput('');
                                  }}
                                />
                                <img src={item.photo} alt={item.title} style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} />
                                <span>{item.title} <strong>({item.price} VATs)</strong></span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {selectedMyAds.length > 0 && (() => {
                      const offeredSum = selectedMyAds.reduce((sum, item) => sum + item.price, 0);
                      const diffRatio = Math.abs(offeredSum - ad.price) / ad.price;
                      const diffPercent = (diffRatio * 100).toFixed(0);
                      const isNotEquivalent = diffRatio > TRADE_VAT_DIFF_THRESHOLD;

                      return (
                        <>
                          {isNotEquivalent && (
                            <div className="alert-message warning text-xs p-3 mb-3 animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--color-warning)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-warning)', backgroundColor: 'rgba(230, 162, 60, 0.05)', lineHeight: '1.4' }}>
                              <AlertCircle size={16} style={{ flexShrink: 0 }} />
                              <span>
                                <strong>Sugestão de Equivalência:</strong> A diferença de valor entre as peças é de {diffPercent}% (limite recomendado para troca direta: 20%). Recomendamos complementar a oferta ajustando a diferença em VATs.
                              </span>
                            </div>
                          )}

                          <div className="trade-comparison-box card p-3 mt-3 animate-fade-in" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)' }}>
                            <p className="text-sm font-semibold mb-2">
                              Total oferecido em troca: {offeredSum} VATs ({selectedMyAds.length} peça{selectedMyAds.length > 1 ? 's' : ''})
                            </p>
                            {offeredSum < ad.price ? (
                              <>
                                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <AlertCircle size={14} /> Suas peças são mais baratas que o anunciado ({ad.price} VATs).
                                </p>
                                <div className="form-group mb-0 mt-3">
                                  <label htmlFor="vat-diff-add" className="text-xs">Deseja adicionar dinheiro à proposta? (Diferença de {ad.price - offeredSum} VATs)</label>
                                  <input
                                    id="vat-diff-add"
                                    type="number"
                                    className="form-input mt-1"
                                    placeholder="Ex: 5"
                                    min="0"
                                    max={currentUser?.vatBalance || 0}
                                    value={vatDiffInput}
                                    onChange={(e) => setVatDiffInput(e.target.value)}
                                  />
                                  {currentUser && (
                                    <span className="form-help">Seu saldo: <Diamond size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> {currentUser.vatBalance} VATs</span>
                                  )}
                                </div>
                              </>
                            ) : offeredSum > ad.price ? (
                              <>
                                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <CheckCircle size={14} /> Suas peças são mais caras que o anunciado ({ad.price} VATs).
                                </p>
                                <div className="form-group mb-0 mt-3">
                                  <label htmlFor="vat-diff-back" className="text-xs">Quanto você quer de volta em VATs? (Sugerido: {offeredSum - ad.price} VATs)</label>
                                  <input
                                    id="vat-diff-back"
                                    type="number"
                                    className="form-input mt-1"
                                    placeholder="Ex: 10"
                                    min="0"
                                    value={vatDiffInput}
                                    onChange={(e) => setVatDiffInput(e.target.value)}
                                  />
                                </div>
                              </>
                            ) : (
                              <p className="text-sm font-semibold mb-0" style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircle size={14} /> Troca equivalente (sem adicional).
                              </p>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}

                <button
                  className="btn btn-primary btn-lg btn-block mt-4"
                  onClick={handleSendProposal}
                  disabled={proposalType === 'buy' ? !offeredValue : selectedMyAdIds.length === 0}
                >
                  Enviar Proposta
                </button>
              </div>
            </div>
          )}

          {/* Proposals */}
          {proposals.length > 0 && (
            <div className="ad-detail-proposals mt-8">
              <h2 className="mb-4"><ClipboardList size={18} style={{ display: 'inline', verticalAlign: '-3px', marginRight: '6px' }} />Propostas ({proposals.length})</h2>
              {proposals.map((proposal) => {
                const buyer = getUserById(proposal.buyerId);
                const canAct = isOwner || currentUser?.id === proposal.buyerId;
                const isPending = proposal.status === 'pending' || proposal.status === 'countered';
                const offeredAd = proposal.type === 'trade' && proposal.offeredItems?.length > 0 ? getAdById(proposal.offeredItems[0]) : null;

                return (
                  <div key={proposal.id} className="card mb-4 animate-fade-in">
                    <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: '8px' }}>
                      <div className="flex items-center gap-3">
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                          {buyer?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold">{buyer?.name}</h4>
                          {proposal.type === 'buy' ? (
                            <span className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <ShoppingCart size={12} /> Compra — <Diamond size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> {proposal.offeredValue} VATs
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1 mt-1 text-xs text-muted">
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <RefreshCw size={12} /> Proposta de Troca
                              </span>
                              {offeredAd ? (
                                <Link to={`/ad/${offeredAd.id}`} className="flex items-center gap-2 mt-1 p-2 border-hover" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-border)', textDecoration: 'none', transition: 'all var(--transition-fast)' }}>
                                  <img src={offeredAd.photo} alt={offeredAd.title} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: '4px' }} />
                                  <div style={{ textAlign: 'left' }}>
                                    <span className="font-semibold block" style={{ color: 'var(--color-text)', fontSize: '0.75rem' }}>{offeredAd.title}</span>
                                    <span className="text-xxs text-muted block" style={{ fontSize: '0.65rem' }}>Original: {offeredAd.price} VATs</span>
                                  </div>
                                </Link>
                              ) : (
                                <span className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>Produto oferecido em troca não está mais disponível</span>
                              )}
                              <span className="mt-1 font-semibold" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: proposal.vatDifference > 0 ? 'var(--color-warning)' : proposal.vatDifference < 0 ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                                {proposal.vatDifference > 0 ? (
                                  <><Diamond size={11} /> + {proposal.vatDifference} VATs adicionais</>
                                ) : proposal.vatDifference < 0 ? (
                                  <><Diamond size={11} /> Com retorno de {Math.abs(proposal.vatDifference)} VATs</>
                                ) : (
                                  <>Troca equivalente (sem adicional)</>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`badge ${
                        proposal.status === 'accepted' ? 'badge-success' :
                        proposal.status === 'rejected' ? 'badge-error' :
                        proposal.status === 'concluded' ? 'badge-info' :
                        'badge-warning'
                      }`}>
                        {proposal.status === 'pending' ? 'Pendente' :
                         proposal.status === 'accepted' ? 'Aceita' :
                         proposal.status === 'rejected' ? 'Recusada' :
                         proposal.status === 'countered' ? 'Contraproposta' :
                         'Concluída'}
                      </span>
                    </div>

                    <ProposalTimeline timeline={proposal.timeline} />

                    {/* Actions */}
                    {canAct && isPending && (
                      <div className="flex gap-3 mt-4" style={{ flexWrap: 'wrap' }}>
                        {isOwner && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleAccept(proposal)}>
                              <CheckCircle size={13} /> Aceitar
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleReject(proposal.id)}>
                              <XCircle size={13} /> Recusar
                            </button>
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => setActiveCounterId(activeCounterId === proposal.id ? null : proposal.id)}
                            >
                              <RefreshCw size={13} /> Contrapropor
                            </button>
                          </>
                        )}
                        {!isOwner && proposal.status === 'countered' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleAccept(proposal)}>
                              <CheckCircle size={13} /> Aceitar Contraproposta
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleReject(proposal.id)}>
                              <XCircle size={13} /> Recusar
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Counter form */}
                    {activeCounterId === proposal.id && (
                      <div className="flex gap-3 mt-4 items-center">
                        <input
                          type="number"
                          className="form-input"
                          placeholder="Novo valor em VATs"
                          value={counterValue}
                          onChange={(e) => setCounterValue(e.target.value)}
                          style={{ maxWidth: 200 }}
                        />
                        <button className="btn btn-primary btn-sm" onClick={() => handleCounter(proposal)}>
                          Enviar
                        </button>
                      </div>
                    )}

                    {/* Conclude */}
                    {proposal.status === 'accepted' && canAct && (
                      <div className="mt-4">
                        <button className="btn btn-success btn-sm" onClick={() => handleConclude(proposal)}>
                          <PartyPopper size={14} /> Marcar como Concluída
                        </button>
                        {proposal.chatId && (
                          <Link to={`/negotiations`} className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }}>
                            <MessageCircle size={14} /> Ir ao Chat
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdDetail;
