import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { transactionAPI } from '../services/api';

const Passbook = () => {
  const { user } = React.useContext(UserContext);
  const navigate = useNavigate();

  const [passbookData, setPassbookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchPassbook = async () => {
      if (!user?.id) {
        setError('No user found');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Fetching passbook for user:', user.id);
        const data = await transactionAPI.getPassbook(user.id);
        console.log('Passbook data received:', data);
        setPassbookData(data);
      } catch (err) {
        console.error('Error fetching passbook:', err);
        setError(err.error || err.message || 'Failed to load passbook');
      } finally {
        setLoading(false);
      }
    };

    fetchPassbook();
  }, [user?.id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredTransactions = () => {
    if (!passbookData?.transactions) return [];
    
    return passbookData.transactions.filter(transaction => {
      if (filter === 'all') return true;
      return transaction.type?.toLowerCase() === filter.toLowerCase();
    });
  };

  const getTransactionCount = (type) => {
    if (!passbookData?.transactions) return 0;
    return passbookData.transactions.filter(t => 
      type === 'all' || t.type?.toLowerCase() === type.toLowerCase()
    ).length;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading passbook...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-message text-center">
          <h3>Error Loading Passbook</h3>
          <p>{error}</p>
          <button className="btn btn-primary mt-2" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const filteredTransactions = getFilteredTransactions();

  return (
    <div>
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title">Transaction Passbook</h1>
            <p className="card-subtitle">
              {passbookData?.customerName && `Welcome, ${passbookData.customerName}`}
            </p>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Account Summary */}
      {passbookData && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Account Summary</h2>
          </div>
          <div className="grid grid-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(passbookData.currentBalance || 0)}
              </div>
              <div className="text-sm text-gray-600">Current Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {passbookData.totalTransactions || 0}
              </div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">
                {passbookData.customerId}
              </div>
              <div className="text-sm text-gray-600">Account ID</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Filter Transactions</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All ({getTransactionCount('all')})
          </button>
          <button 
            className={`btn ${filter === 'deposit' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('deposit')}
          >
            Deposits ({getTransactionCount('deposit')})
          </button>
          <button 
            className={`btn ${filter === 'withdrawal' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('withdrawal')}
          >
            Withdrawals ({getTransactionCount('withdrawal')})
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Transaction History</h2>
          <div className="text-sm text-gray-600">
            Showing {filteredTransactions.length} of {passbookData?.totalTransactions || 0} transactions
          </div>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">No Transactions Found</div>
            <div className="empty-state-description">
              {passbookData?.totalTransactions === 0 
                ? 'No transactions found. Start by making your first deposit or withdrawal.'
                : `No transactions match the "${filter}" filter. Try selecting "All" or a different filter.`
              }
            </div>
            {passbookData?.totalTransactions === 0 && (
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate('/deposit')}
              >
                Make First Deposit
              </button>
            )}
          </div>
        ) : (
          <div className="transaction-list">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <div className="flex items-center gap-2">
                    <div className={`transaction-type ${transaction.type?.toLowerCase() || 'unknown'}`}>
                      {transaction.type === 'DEPOSIT' ? '💰 Deposit' : '💸 Withdrawal'}
                    </div>
                    <div className="text-xs text-gray-500">
                      #{transaction.id}
                    </div>
                  </div>
                  <div className="transaction-description">
                    {transaction.description || 'No description'}
                  </div>
                  <div className="transaction-date">
                    {transaction.timestamp ? formatDate(transaction.timestamp) : 'No date'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Balance after: {formatCurrency(transaction.balanceAfterTransaction || 0)}
                  </div>
                </div>
                <div className={`transaction-amount ${
                  transaction.type === 'DEPOSIT' ? 'positive' : 'negative'
                }`}>
                  {transaction.type === 'DEPOSIT' ? '+' : '-'}
                  {formatCurrency(transaction.amount || 0)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="card">
        <div className="text-center">
          <button 
            className="btn btn-secondary"
            onClick={async () => {
              setLoading(true);
              try {
                const data = await transactionAPI.getPassbook(user.id);
                setPassbookData(data);
                setError(null);
              } catch (err) {
                setError(err.error || err.message || 'Failed to refresh');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Passbook'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Passbook;