import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { transactionAPI, customerAPI } from '../services/api';

const WithdrawModal = () => {
  const { user, updateUser } = React.useContext(UserContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ amount: '', description: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(user?.balance || 0);

  // Fetch current balance when component mounts
  useEffect(() => {
    const fetchCurrentBalance = async () => {
      if (user?.id) {
        try {
          const balanceData = await customerAPI.getBalance(user.id);
          setCurrentBalance(balanceData.balance);
          console.log('WithdrawModal: Fetched current balance:', balanceData.balance);
        } catch (error) {
          console.error('WithdrawModal: Error fetching balance:', error);
          // Fallback to user balance from context
          setCurrentBalance(user.balance || 0);
        }
      }
    };
    
    fetchCurrentBalance();
  }, [user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const amt = parseFloat(formData.amount);
    const balance = parseFloat(currentBalance || 0);
    console.log('WithdrawModal: Validating withdrawal. Amount:', amt, 'Balance:', balance);
    
    if (isNaN(amt) || amt <= 0) {
      newErrors.amount = 'Enter a valid amount > 0';
    } else if (amt > balance) {
      newErrors.amount = `Insufficient balance. Available: ₹${balance.toFixed(2)}`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const amt = parseFloat(formData.amount);
      const tx = await transactionAPI.withdraw(user.id, amt, formData.description || 'Money withdrawn');
      updateUser({ ...user, balance: tx.balanceAfterTransaction });
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: error.error || 'Withdrawal failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => navigate('/dashboard');

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Withdraw Money</h2>
          <div className="flex gap-2">
            <button 
              onClick={async () => {
                try {
                  const balanceData = await customerAPI.getBalance(user.id);
                  setCurrentBalance(balanceData.balance);
                  console.log('WithdrawModal: Refreshed balance:', balanceData.balance);
                } catch (error) {
                  console.error('WithdrawModal: Error refreshing balance:', error);
                }
              }}
              className="btn btn-secondary"
              type="button"
            >
              Refresh Balance
            </button>
            <button onClick={handleClose} className="close-btn">×</button>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          {errors.general && <div className="error-message mb-3 text-center">{errors.general}</div>}
          
          {/* Current Balance Display */}
          <div className="form-group">
            <label className="form-label">Current Balance</label>
            <div className="balance-display">
              ₹{parseFloat(currentBalance || 0).toFixed(2)}
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} className={`form-input ${errors.amount ? 'error' : ''}`} step="0.01" min="0.01" placeholder="0.00" />
            {errors.amount && <div className="error-message">{errors.amount}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <input name="description" value={formData.description} onChange={handleChange} className="form-input" placeholder="Enter description" />
          </div>
          <div className="flex justify-between mt-4">
            <button type="button" onClick={handleClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-danger" disabled={loading}>{loading ? 'Processing...' : 'Withdraw Money'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal;
