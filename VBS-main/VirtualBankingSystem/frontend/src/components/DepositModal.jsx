import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { transactionAPI } from '../services/api';

const DepositModal = () => {
  const { user, updateUser } = React.useContext(UserContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ amount: '', description: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) newErrors.amount = 'Enter a valid amount > 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const amt = parseFloat(formData.amount);
      const tx = await transactionAPI.deposit(user.id, amt, formData.description || 'Money deposited');
      updateUser({ ...user, balance: tx.balanceAfterTransaction });
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: error.error || 'Deposit failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => navigate('/dashboard');

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Deposit Money</h2>
          <button onClick={handleClose} className="close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          {errors.general && <div className="error-message mb-3 text-center">{errors.general}</div>}
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
            <button type="submit" className="btn btn-success" disabled={loading}>{loading ? 'Processing...' : 'Deposit Money'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepositModal;


