import axios from 'axios';

// Mock axios instance for tests
const mockApi = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default mockApi;
