import axios from 'axios';
import { fallbackAPI } from './api-fallback';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

const shouldUseFallback = (error) => {
  return error.code === 'ECONNREFUSED' ||
         error.code === 'NETWORK_ERROR' ||
         error.code === 'ECONNABORTED' ||
         error.message.includes('Network Error') ||
         error.message.includes('timeout');
};

export const customerAPI = {
  register: async (customerData) => {
    try {
      const response = await api.post('/api/customers/register', customerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  login: async (username, password) => {
    try {
      const response = await api.post('/api/customer/login', {
        username,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCustomerById: async (customerId) => {
    try {
      const response = await api.get(`/api/customers/${customerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getByUsername: async (username) => {
    try {
      console.log(`API: Getting customer by username: ${username}`);
      const response = await api.get(`/api/customers/username/${username}`);
      console.log('API: Customer by username response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Get customer by username error:', error);
      if (error.code === 'ECONNABORTED') {
        console.log('Retrying customer search with longer timeout...');
        try {
          const retryResponse = await api.get(`/api/customers/username/${username}`, { timeout: 15000 });
          return retryResponse.data;
        } catch (retryError) {
          console.log('Customer search retry also failed');
          throw retryError.response?.data || retryError.message;
        }
      }
      throw error.response?.data || error.message;
    }
  },

  getBalance: async (customerId) => {
    try {
      console.log(`API: Getting balance for customer ${customerId}`);
      const response = await api.get(`/api/customers/${customerId}/balance`);
      console.log('API: Balance response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Balance error:', error);
      if (error.code === 'ECONNABORTED') {
        console.log('Retrying balance request with longer timeout...');
        try {
          const retryResponse = await api.get(`/api/customers/${customerId}/balance`, { timeout: 15000 });
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

export const transactionAPI = {
  deposit: async (customerId, amount, description) => {
    try {
      const response = await api.post('/api/transactions/deposit', {
        customerId,
        amount,
        description
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  withdraw: async (customerId, amount, description) => {
    try {
      const response = await api.post('/api/transactions/withdraw', {
        customerId,
        amount,
        description
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  transfer: async (fromCustomerId, toCustomerId, amount, description) => {
    try {
      console.log(`API: Transferring ${amount} from customer ${fromCustomerId} to ${toCustomerId}`);
      const response = await api.post('/api/transactions/transfer', {
        fromCustomerId,
        toCustomerId,
        amount,
        description
      });
      console.log('API: Transfer response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Transfer error:', error);
      if (error.code === 'ECONNABORTED') {
        console.log('Retrying transfer request with longer timeout...');
        try {
          const retryResponse = await api.post('/api/transactions/transfer', {
            fromCustomerId,
            toCustomerId,
            amount,
            description
          }, { timeout: 20000 });
          return retryResponse.data;
        } catch (retryError) {
          console.log('Transfer retry also failed');
          throw retryError.response?.data || retryError.message;
        }
      }
      throw error.response?.data || error.message;
    }
  },

  getTransactions: async (customerId) => {
    try {
      console.log(`API: Getting transactions for customer ${customerId}`);
      const response = await api.get(`/api/transactions/customer/${customerId}`);
      console.log('API: Transactions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Transactions error:', error);
      if (error.code === 'ECONNABORTED') {
        console.log('Retrying transactions request with longer timeout...');
        try {
          const retryResponse = await api.get(`/api/transactions/customer/${customerId}`, { timeout: 15000 });
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

  getPassbook: async (customerId) => {
    try {
      const response = await api.get(`/api/transactions/customer/${customerId}/passbook`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  debugTransactions: async (customerId) => {
    try {
      console.log(`API: Debug transactions for customer ${customerId}`);
      const response = await api.get(`/api/transactions/debug/customer/${customerId}`);
      console.log('API: Debug response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Debug error:', error);
      throw error.response?.data || error.message;
    }
  },

  getTransaction: async (transactionId) => {
    try {
      const response = await api.get(`/api/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default api;
