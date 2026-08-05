import axios from 'axios';

// Cambia esta IP por la IPv4 de tu computadora.
const api = axios.create({
  baseURL: 'http://192.168.1.241:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;