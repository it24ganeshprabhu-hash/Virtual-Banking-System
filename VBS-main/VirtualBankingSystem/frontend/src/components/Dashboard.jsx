import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { customerAPI, transactionAPI } from '../services/api';

const Dashboard = () => {
  const { user, updateUser } = React.useContext(UserContext);
  const navigate = useNavigate();
  
  const [balance, setBalance] = useState(user?.balance || 0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Initialize with user data immediately
    if (user) {
      setBalance(user.balance || 0);
      setDataLoaded(true);
      // Try to fetch fresh data in background once per user id change
      fetchDashboardData();
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch current balance
      const balanceData = await customerAPI.getBalance(user.id);
      setBalance(balanceData.balance);
      
      // Fetch recent transactions
      console.log('Dashboard: Fetching transactions for user ID:', user.id);
      let transactionsData = await transactionAPI.getTransactions(user.id);
      console.log('Dashboard: Raw transactions response:', transactionsData);
      console.log('Dashboard: Transactions type:', typeof transactionsData);
      console.log('Dashboard: Is array:', Array.isArray(transactionsData));
      
      // If we somehow received an object (e.g., passbook wrapper), try to unwrap
      if (transactionsData && !Array.isArray(transactionsData) && transactionsData.transactions) {
        console.log('Dashboard: Unwrapping transactions from object');
        transactionsData = transactionsData.transactions;
      }
      
      // If still empty, try alternate endpoint (passbook) as fallback
      if (!transactionsData || transactionsData.length === 0) {
        console.log('Dashboard: No transactions found, trying passbook endpoint');
        try {
          const passbook = await transactionAPI.getPassbook(user.id);
          console.log('Dashboard: Passbook response:', passbook);
          transactionsData = passbook?.transactions || [];
        } catch (passbookError) {
          console.log('Dashboard: Passbook fetch failed:', passbookError);
        }
      }
      
      console.log('Dashboard: Final transactions data:', transactionsData);
      console.log('Dashboard: Final transactions length:', transactionsData?.length || 0);
      
      // Ensure we have a proper array and set it
      const transactionsArray = Array.isArray(transactionsData) ? transactionsData : [];
      console.log('Dashboard: Setting transactions array:', transactionsArray);
      setRecentTransactions(transactionsArray.slice(0, 5));
      
      setDataLoaded(true);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      // Don't show error, just use existing data
      setDataLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleQuickAction = (action) => {
    navigate(`/${action}`);
  };

  // Show loading only if we have no user data at all
  if (!user) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title">Welcome back, {user?.firstName}!</h1>
           
          </div>
         
        </div>
      </div>

      {/* Balance Card */}
      <div className="card">
        <div className="balance-card">
          <div className="balance-label">Current Balance</div>
          <div className="balance-amount">
            {formatCurrency(balance || 0)}
          </div>
          <div className="balance-currency">INR</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="quick-actions">
          <button
            className="quick-action-btn"
            onClick={() => handleQuickAction('deposit')}
          >
            <div className="quick-action-icon">💰</div>
            <div className="quick-action-label">Deposit Money</div>
          </button>
          <button
            className="quick-action-btn"
            onClick={() => handleQuickAction('withdraw')}
          >
            <div className="quick-action-icon">💸</div>
            <div className="quick-action-label">Withdraw Money</div>
          </button>
          <button
            className="quick-action-btn"
            onClick={() => handleQuickAction('transfer')}
          >
            <div className="quick-action-icon">💳</div>
            <div className="quick-action-label">Transfer Money</div>
          </button>
          <button
            className="quick-action-btn"
            onClick={() => handleQuickAction('passbook')}
          >
            <div className="quick-action-icon">📋</div>
            <div className="quick-action-label">View Passbook</div>
          </button>
        </div>
      </div>



   

      {/* Account Information */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Account Information</h2>
        </div>
        <div className="grid grid-2">
          <div>
            <h3 className="mb-2">Personal Details</h3>
            <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
            <p><strong>Username:</strong> {user?.username}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Phone:</strong> {user?.phoneNumber}</p>
          </div>
          <div>
            <h3 className="mb-2">Account Status</h3>
            <p><strong>Account ID:</strong> {user?.id}</p>
            <p><strong>Member Since:</strong> {formatDate(user?.id ? new Date().toISOString() : '')}</p>
            <p><strong>Status:</strong> <span className="text-success">Active</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;