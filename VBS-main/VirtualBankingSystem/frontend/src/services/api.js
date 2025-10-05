import axios from 'axios';
import { fallbackAPI } from './api-fallback';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout - increased for slower backends
});

// Helper function to check if we should use fallback
const shouldUseFallback = (error) => {
  return error.code === 'ECONNREFUSED' || 
         error.code === 'NETWORK_ERROR' || 
         error.code === 'ECONNABORTED' ||
         error.message.includes('Network Error') ||
         error.message.includes('timeout');
};

// Customer API endpoints
export const customerAPI = {
  // Register a new customer
  register: async (customerData) => {
    try {
      const response = await api.post('/customers/register', customerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login customer
  login: async (username, password) => {
    try {
      const response = await api.post('/customers/login', {
        username,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get customer by ID
  getCustomerById: async (customerId) => {
    try {
      const response = await api.get(`/customers/${customerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get customer by username - NEW METHOD FOR TRANSFER
  getByUsername: async (username) => {
    try {
      console.log(`API: Getting customer by username: ${username}`);
      const response = await api.get(`/customers/username/${username}`);
      console.log('API: Customer by username response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Get customer by username error:', error);
      
      // If it's a timeout, try once more with longer timeout
      if (error.code === 'ECONNABORTED') {
        console.log('Retrying customer search with longer timeout...');
        try {
          const retryResponse = await api.get(`/customers/username/${username}`, { timeout: 15000 });
          return retryResponse.data;
        } catch (retryError) {
          console.log('Customer search retry also failed');
          throw retryError.response?.data || retryError.message;
        }
      }
      
      throw error.response?.data || error.message;
    }
  },

  // Get customer balance
  getBalance: async (customerId) => {
    try {
      console.log(`API: Getting balance for customer ${customerId}`);
      const response = await api.get(`/customers/${customerId}/balance`);
      console.log('API: Balance response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Balance error:', error);
      
      // If it's a timeout, try once more with longer timeout
      if (error.code === 'ECONNABORTED') {
        console.log('Retrying balance request with longer timeout...');
        try {
          const retryResponse = await api.get(`/customers/${customerId}/balance`, { timeout: 15000 });
          return retryResponse.data;
        } catch (retryError) {
          console.log('Balance retry also failed, using fallback');
          return await fallbackAPI.getBalance(customerId);
        }
      }
      
      if (shouldUseFallback(error)) {
        console.log('Using fallback API for balance');
        return await fallbackAPI.getBalance(customerId);
      }
      throw error.response?.data || error.message;
    }
  }
};

// Transaction API endpoints
export const transactionAPI = {
  // Deposit money
  deposit: async (customerId, amount, description) => {
    try {
      const response = await api.post('/transactions/deposit', {
        customerId,
        amount,
        description
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Withdraw money
  withdraw: async (customerId, amount, description) => {
    try {
      const response = await api.post('/transactions/withdraw', {
        customerId,
        amount,
        description
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Transfer money - NEW METHOD
  transfer: async (fromCustomerId, toCustomerId, amount, description) => {
    try {
      console.log(`API: Transferring ${amount} from customer ${fromCustomerId} to ${toCustomerId}`);
      const response = await api.post('/transactions/transfer', {
        fromCustomerId,
        toCustomerId,
        amount,
        description
      });
      console.log('API: Transfer response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Transfer error:', error);
      
      // If it's a timeout, try once more with longer timeout
      if (error.code === 'ECONNABORTED') {
        console.log('Retrying transfer request with longer timeout...');
        try {
          const retryResponse = await api.post('/transactions/transfer', {
            fromCustomerId,
            toCustomerId,
            amount,
            description
          }, { timeout: 20000 }); // Extra long timeout for critical transfer operation
          return retryResponse.data;
        } catch (retryError) {
          console.log('Transfer retry also failed');
          throw retryError.response?.data || retryError.message;
        }
      }
      
      throw error.response?.data || error.message;
    }
  },

  // Get customer transactions
  getTransactions: async (customerId) => {
    try {
      console.log(`API: Getting transactions for customer ${customerId}`);
      const response = await api.get(`/transactions/customer/${customerId}`);
      console.log('API: Transactions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Transactions error:', error);
      
      // If it's a timeout, try once more with longer timeout
      if (error.code === 'ECONNABORTED') {
        console.log('Retrying transactions request with longer timeout...');
        try {
          const retryResponse = await api.get(`/transactions/customer/${customerId}`, { timeout: 15000 });
          console.log('API: Transactions retry response:', retryResponse.data);
          return retryResponse.data;
        } catch (retryError) {
          console.log('Transactions retry also failed, using fallback');
          return await fallbackAPI.getTransactions(customerId);
        }
      }
      
      if (shouldUseFallback(error)) {
        console.log('Using fallback API for transactions');
        return await fallbackAPI.getTransactions(customerId);
      }
      throw error.response?.data || error.message;
    }
  },

  // Get customer passbook
  getPassbook: async (customerId) => {
    try {
      const response = await api.get(`/transactions/customer/${customerId}/passbook`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Debug endpoint to check transactions
  debugTransactions: async (customerId) => {
    try {
      console.log(`API: Debug transactions for customer ${customerId}`);
      const response = await api.get(`/transactions/debug/customer/${customerId}`);
      console.log('API: Debug response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Debug error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get specific transaction
  getTransaction: async (transactionId) => {
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default api;