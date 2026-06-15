import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatDate';
import { Handshake, CheckCircle, XCircle, RefreshCw, PartyPopper, MapPin } from 'lucide-react';
import './ProposalTimeline.css';

/**
 * ProposalTimeline — Exibe o histórico de ações de uma proposta.
 */
const ProposalTimeline = ({ timeline }) => {
  const { getUserById } = useAuth();

  const actionConfig = {
    proposal_sent: { icon: <Handshake size={14} />, color: 'var(--color-primary)' },
    accepted: { icon: <CheckCircle size={14} />, color: 'var(--color-success)' },
    rejected: { icon: <XCircle size={14} />, color: 'var(--color-error)' },
    counter: { icon: <RefreshCw size={14} />, color: 'var(--color-warning)' },
    concluded: { icon: <PartyPopper size={14} />, color: 'var(--color-success)' },
  };

  const defaultConfig = { icon: <MapPin size={14} />, color: 'var(--color-text-muted)' };

  return (
    <div className="proposal-timeline">
      {timeline.map((entry, index) => {
        const config = actionConfig[entry.action] || defaultConfig;
        const user = entry.fromUserId ? getUserById(entry.fromUserId) : null;

        return (
          <div key={entry.id} className="timeline-item" style={{ '--timeline-color': config.color }}>
            <div className="timeline-dot">
              <span>{config.icon}</span>
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                {user && <span className="timeline-user">{user.name}</span>}
                <span className="timeline-time">{formatDate(entry.timestamp)}</span>
              </div>
              <p className="timeline-message">{entry.message}</p>
            </div>
            {index < timeline.length - 1 && <div className="timeline-line" />}
          </div>
        );
      })}
    </div>
  );
};

export default ProposalTimeline;
