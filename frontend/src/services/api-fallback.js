// Fallback API service for when backend is not available
export const fallbackAPI = {
  // Mock customer data
  getBalance: async (customerId) => {
    console.log('Using fallback API for balance');
    return {
      customerId: customerId,
      username: 'demo_user',
      balance: 0
    };
  },

  getTransactions: async (customerId) => {
    console.log('Using fallback API for transactions');
    return [];
  },

  deposit: async (customerId, amount, description) => {
    console.log('Using fallback API for deposit');
    return {
      id: Date.now(),
      type: 'DEPOSIT',
      amount: amount,
      description: description,
      timestamp: new Date().toISOString(),
      balanceAfterTransaction: amount
    };
  },

  withdraw: async (customerId, amount, description) => {
    console.log('Using fallback API for withdrawal');
    return {
      id: Date.now(),
      type: 'WITHDRAWAL',
      amount: amount,
      description: description,
      timestamp: new Date().toISOString(),
      balanceAfterTransaction: 0
    };
  }
};



