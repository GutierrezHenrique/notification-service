// Mock api module before importing
jest.mock('../api', () => {
  const axios = require('axios');
  return axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
      'Content-Type': 'application/json',
    },
  });
});

import api from '../api';

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should have correct base URL', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:3000');
  });

  it('should have JSON content type header', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });
});
