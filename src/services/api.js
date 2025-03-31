const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const auth = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getProfile: async () => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: getHeaders()
    });
    return response.json();
  }
};

export const sleepData = {
  save: async (data) => {
    const response = await fetch(`${API_URL}/sleep-data`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  getMyData: async () => {
    const response = await fetch(`${API_URL}/sleep-data/my-data`, {
      headers: getHeaders()
    });
    return response.json();
  },

  getUserData: async (userId) => {
    const response = await fetch(`${API_URL}/sleep-data/user/${userId}`, {
      headers: getHeaders()
    });
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_URL}/sleep-data/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/sleep-data/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.json();
  }
}; 