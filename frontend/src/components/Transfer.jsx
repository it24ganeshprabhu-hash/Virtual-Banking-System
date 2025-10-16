import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { customerAPI, transactionAPI } from '../services/api';

const Transfer = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    amount: '',
    description: ''
  });
  
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [step, setStep] = useState('search'); // 'search', 'confirm', 'complete'

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear recipient when username changes
    if (name === 'username') {
      setRecipient(null);
      setError(null);
    }
  };

  const searchRecipient = async () => {
    if (!formData.username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (formData.username.toLowerCase() === user.username.toLowerCase()) {
      setError('Cannot transfer money to your own account');
      return;
    }

    setSearching(true);
    setError(null);

    try {
      const data = await customerAPI.getByUsername(formData.username);
      setRecipient(data);
      setStep('confirm');
    } catch (error) {
      console.error('Search error:', error);
      setError(error.error || 'Customer not found');
      setRecipient(null);
    } finally {
      setSearching(false);
    }
  };

  const validateTransfer = () => {
    const amount = parseFloat(formData.amount);
    
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return false;
    }

    if (amount > user.balance) {
      setError(`Insufficient balance. Available: $${user.balance.toFixed(2)}`);
      return false;
    }

    return true;
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    
    if (!validateTransfer()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await transactionAPI.transfer(
        user.id,
        recipient.id,
        parseFloat(formData.amount),
        formData.description || `Transfer to ${recipient.firstName} ${recipient.lastName}`
      );

      setSuccess(`Successfully transferred ₹${formData.amount} to ${recipient.firstName} ${recipient.lastName}`);
      setStep('complete');
      
      // Reset form
      setFormData({
        username: '',
        amount: '',
        description: ''
      });
      setRecipient(null);
    } catch (error) {
      console.error('Transfer error:', error);
      setError(error.error || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const resetTransfer = () => {
    setStep('search');
    setRecipient(null);
    setError(null);
    setSuccess(null);
    setFormData({
      username: '',
      amount: '',
      description: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (!user) {
    return <div>Please log in to transfer money.</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Transfer Money</h1>
          <p className="text-muted">Send money to another customer</p>
        </div>

        <div className="card-content">
          {/* Current Balance */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">Available Balance</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(user.balance)}
            </div>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <span>⚠️ {error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-4">
              <span>✅ {success}</span>
            </div>
          )}

          {/* Step 1: Search for recipient */}
          {step === 'search' && (
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Recipient Username</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="form-input flex-1"
                    placeholder="Enter recipient's username"
                    onKeyPress={(e) => e.key === 'Enter' && searchRecipient()}
                  />
                  <button
                    type="button"
                    onClick={searchRecipient}
                    disabled={searching || !formData.username.trim()}
                    className="btn btn-primary"
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Confirm transfer details */}
          {step === 'confirm' && recipient && (
            <form onSubmit={handleTransfer} className="space-y-4">
              {/* Recipient Info */}
              <div className="p-4 bg-green-50 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Recipient Found</h3>
                <div className="space-y-1 text-green-700">
                  <p><strong>Name:</strong> {recipient.firstName} {recipient.lastName}</p>
                  <p><strong>Username:</strong> {recipient.username}</p>
                  <p><strong>Email:</strong> {recipient.email}</p>
                </div>
              </div>

              {/* Transfer Amount */}
              <div className="form-group">
                <label className="form-label">Transfer Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  max={user.balance}
                  required
                />
                <div className="text-sm text-gray-500 mt-1">
                  Maximum: {formatCurrency(user.balance)}
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter transfer description"
                  maxLength={100}
                />
              </div>

              {/* Transfer Summary */}
              {formData.amount && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Transfer Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>To:</strong> {recipient.firstName} {recipient.lastName} ({recipient.username})</p>
                    <p><strong>Amount:</strong> {formatCurrency(parseFloat(formData.amount) || 0)}</p>
                    <p><strong>Description:</strong> {formData.description || `Transfer to ${recipient.firstName} ${recipient.lastName}`}</p>
                    <p><strong>Remaining Balance:</strong> {formatCurrency(user.balance - (parseFloat(formData.amount) || 0))}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-12 pt-4">
                <button
                  type="button"
                  onClick={resetTransfer}
                  className="btn btn-secondary "
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.amount}
                  className="btn btn-primary "
                >
                  {loading ? 'Processing...' : 'Transfer Money'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Transfer complete */}
          {step === 'complete' && (
            <div className="text-center space-y-4">
              <div className="text-6xl">✅</div>
              <h2 className="text-2xl font-bold text-green-600">Transfer Successful!</h2>
              
              <div className="space-y-3">
                <button
                  onClick={resetTransfer}
                  className="btn btn-primary"
                >
                  Make Another Transfer
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-secondary flex-1"
                  >
                    Back to Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/passbook')}
                    className="btn btn-secondary flex-1"
                  >
                    View Passbook
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transfer;