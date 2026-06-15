import { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../utils/generateId';
import { PROPOSAL_STATUS } from '../utils/constants';

/**
 * ProposalContext — Sistema de propostas e negociação.
 * Cada proposta contém um timeline[] com o histórico de ações.
 */
const ProposalContext = createContext();

export const ProposalProvider = ({ children }) => {
  const [proposals, setProposals] = useLocalStorage('brecho_proposals', []);

  /** Enviar nova proposta */
  const sendProposal = useCallback((proposalData) => {
    const newProposal = {
      id: generateId(),
      adId: proposalData.adId,
      adTitle: proposalData.adTitle,
      adPhoto: proposalData.adPhoto,
      sellerId: proposalData.sellerId,
      buyerId: proposalData.buyerId,
      type: proposalData.type, // 'buy' ou 'trade'
      offeredValue: proposalData.offeredValue || 0,
      offeredItems: proposalData.offeredItems || [], // IDs de anúncios para troca
      vatDifference: proposalData.vatDifference || 0,
      status: PROPOSAL_STATUS.PENDING,
      chatId: null,
      timeline: [
        {
          id: generateId(),
          action: 'proposal_sent',
          fromUserId: proposalData.buyerId,
          message: proposalData.type === 'buy'
            ? `Proposta de compra: ${proposalData.offeredValue} VATs`
            : `Proposta de troca: "${proposalData.offeredItemTitle || 'item'}" ${
                proposalData.vatDifference > 0
                  ? `+ ${proposalData.vatDifference} VATs`
                  : proposalData.vatDifference < 0
                  ? `(com retorno de ${Math.abs(proposalData.vatDifference)} VATs)`
                  : '(equivalente)'
              }`,
          data: { ...proposalData },
          timestamp: Date.now(),
        },
      ],
      createdAt: Date.now(),
    };
    setProposals((prev) => [newProposal, ...prev]);
    return newProposal;
  }, [setProposals]);

  /** Aceitar proposta */
  const acceptProposal = useCallback((proposalId) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          return {
            ...p,
            status: PROPOSAL_STATUS.ACCEPTED,
            timeline: [
              ...p.timeline,
              {
                id: generateId(),
                action: 'accepted',
                fromUserId: p.sellerId,
                message: 'Proposta aceita!',
                timestamp: Date.now(),
              },
            ],
          };
        }
        return p;
      })
    );
  }, [setProposals]);

  /** Rejeitar proposta */
  const rejectProposal = useCallback((proposalId, reason = '') => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          return {
            ...p,
            status: PROPOSAL_STATUS.REJECTED,
            timeline: [
              ...p.timeline,
              {
                id: generateId(),
                action: 'rejected',
                fromUserId: p.sellerId,
                message: reason || 'Proposta recusada.',
                timestamp: Date.now(),
              },
            ],
          };
        }
        return p;
      })
    );
  }, [setProposals]);

  /** Contraproposta */
  const counterProposal = useCallback((proposalId, counterData, fromUserId) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          return {
            ...p,
            status: PROPOSAL_STATUS.COUNTERED,
            offeredValue: counterData.offeredValue ?? p.offeredValue,
            offeredItems: counterData.offeredItems ?? p.offeredItems,
            vatDifference: counterData.vatDifference ?? p.vatDifference,
            timeline: [
              ...p.timeline,
              {
                id: generateId(),
                action: 'counter',
                fromUserId,
                message: p.type === 'buy'
                  ? `Contraproposta: ${counterData.offeredValue} VATs`
                  : `Contraproposta de troca: ${
                      counterData.vatDifference > 0
                        ? `+ ${counterData.vatDifference} VATs`
                        : counterData.vatDifference < 0
                        ? `com retorno de ${Math.abs(counterData.vatDifference)} VATs`
                        : '(equivalente)'
                    }`,
                data: counterData,
                timestamp: Date.now(),
              },
            ],
          };
        }
        return p;
      })
    );
  }, [setProposals]);

  /** Marcar como concluída */
  const concludeProposal = useCallback((proposalId) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          return {
            ...p,
            status: PROPOSAL_STATUS.CONCLUDED,
            concludedAt: Date.now(),
            timeline: [
              ...p.timeline,
              {
                id: generateId(),
                action: 'concluded',
                message: 'Negociação concluída!',
                timestamp: Date.now(),
              },
            ],
          };
        }
        return p;
      })
    );
  }, [setProposals]);

  /** Associar chat a proposta */
  const setChatForProposal = useCallback((proposalId, chatId) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, chatId } : p))
    );
  }, [setProposals]);

  /** Buscar propostas por anúncio */
  const getProposalsByAd = useCallback((adId) => {
    return proposals.filter((p) => p.adId === adId);
  }, [proposals]);

  /** Buscar propostas de um usuário (como comprador ou vendedor) */
  const getProposalsByUser = useCallback((userId) => {
    return proposals.filter((p) => p.buyerId === userId || p.sellerId === userId);
  }, [proposals]);

  /** Buscar proposta por ID */
  const getProposalById = useCallback((id) => {
    return proposals.find((p) => p.id === id) || null;
  }, [proposals]);

  return (
    <ProposalContext.Provider
      value={{
        proposals,
        sendProposal,
        acceptProposal,
        rejectProposal,
        counterProposal,
        concludeProposal,
        setChatForProposal,
        getProposalsByAd,
        getProposalsByUser,
        getProposalById,
      }}
    >
      {children}
    </ProposalContext.Provider>
  );
};

export const useProposals = () => {
  const context = useContext(ProposalContext);
  if (!context) throw new Error('useProposals deve ser usado dentro de ProposalProvider');
  return context;
};
