import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:3001/api' });

export const getRiskScore = (farmId, investorBudget, investorHorizonMonths) =>
  API.post(`/farms/${farmId}/risk-score`, { investorBudget, investorHorizonMonths });

export const getMatches = (budget, horizonMonths, riskTolerance) =>
  API.get('/farms/matches', { params: { budget, horizonMonths, riskTolerance } });

export const validateHarvest = (data) =>
  API.post('/farms/harvest-validate', data);

export const submitKYC = (formData) =>
  API.post('/ai/kyc', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getSummary = (farm_id) =>
  API.post('/ai/summarise', { farm_id });

export const naturalSearch = (query) =>
  API.post('/ai/search', { query });

export const getFarms = () =>
  API.get('/farms');