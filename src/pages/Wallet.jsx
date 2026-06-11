import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import VatChart from '../components/VatChart';
import { formatDate } from '../utils/formatDate';
import { Wallet as WalletIcon, Diamond, CreditCard, Landmark, TrendingUp, History } from 'lucide-react';
import './Wallet.css';

/**
 * Wallet — Carteira de VATs com compra, resgate e histórico.
 */
const Wallet = () => {
  const { currentUser, updateVatBalance } = useAuth();
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');

  const handleBuyVats = () => {
    const amount = Number(buyAmount);
    if (amount <= 0) { alert('Valor deve ser maior que 0.'); return; }
    updateVatBalance(currentUser.id, amount, `Compra de ${amount} VATs`);
    setBuyAmount('');
  };

  const handleSellVats = () => {
    const amount = Number(sellAmount);
    if (amount <= 0) { alert('Valor deve ser maior que 0.'); return; }
    if (amount > currentUser.vatBalance) { alert('Saldo insuficiente.'); return; }
    updateVatBalance(currentUser.id, -amount, `Resgate de ${amount} VATs`);
    setSellAmount('');
  };

  const history = currentUser?.vatHistory || [];

  return (
    <div className="page-content">
      <div className="container">
        <div className="page-header">
          <h1><WalletIcon size={24} style={{ display: 'inline', verticalAlign: '-4px', marginRight: '8px' }} />Carteira de VATs</h1>
          <p>Gerencie sua moeda virtual</p>
        </div>

        {/* Balance */}
        <div className="wallet-balance card animate-fade-in-up">
          <div className="wallet-balance-inner">
            <span className="wallet-balance-label">Saldo Atual</span>
            <span className="wallet-balance-value"><Diamond size={28} style={{ display: 'inline', verticalAlign: '-4px', marginRight: '4px' }} /> {currentUser?.vatBalance || 0} VATs</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid-2 mt-6 animate-fade-in-up">
          <div className="card">
            <h3 className="mb-4"><CreditCard size={18} style={{ display: 'inline', verticalAlign: '-3px', marginRight: '6px' }} />Comprar VATs</h3>
            <p className="text-sm text-muted mb-4">Simule a compra de VATs (incrementa saldo)</p>
            <div className="flex gap-3">
              <input
                type="number"
                className="form-input"
                placeholder="Quantidade"
                min="1"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn btn-success" onClick={handleBuyVats} disabled={!buyAmount}>
                Comprar
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="mb-4"><Landmark size={18} style={{ display: 'inline', verticalAlign: '-3px', marginRight: '6px' }} />Trocar por Dinheiro</h3>
            <p className="text-sm text-muted mb-4">Simule o resgate de VATs (decrementa saldo)</p>
            <div className="flex gap-3">
              <input
                type="number"
                className="form-input"
                placeholder="Quantidade"
                min="1"
                max={currentUser?.vatBalance}
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn btn-danger" onClick={handleSellVats} disabled={!sellAmount}>
                Resgatar
              </button>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="card mt-6">
          <h3 className="mb-4"><TrendingUp size={18} style={{ display: 'inline', verticalAlign: '-3px', marginRight: '6px' }} />Evolução do Saldo</h3>
          <VatChart history={history} />
        </div>

        {/* History */}
        <div className="card mt-6">
          <h3 className="mb-4"><History size={18} style={{ display: 'inline', verticalAlign: '-3px', marginRight: '6px' }} />Histórico de Transações</h3>
          {history.length > 0 ? (
            <div className="wallet-history">
              {[...history].reverse().map((entry) => (
                <div key={entry.id} className="wallet-history-item">
                  <div className="flex items-center gap-3">
                    <span className={`wallet-history-icon ${entry.type === 'credit' ? 'credit' : 'debit'}`}>
                      {entry.type === 'credit' ? '↑' : '↓'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{entry.description}</p>
                      <span className="text-xs text-muted">{formatDate(entry.timestamp)}</span>
                    </div>
                  </div>
                  <span className={`wallet-history-amount ${entry.type === 'credit' ? 'credit' : 'debit'}`}>
                    {entry.type === 'credit' ? '+' : '-'}{entry.amount} VATs
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <p className="text-muted">Nenhuma transação registrada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
