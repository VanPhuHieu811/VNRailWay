import axiosClient from '../api/client';
const BASE_URL = '/api/v1/trains';

// --- Train Endpoints ---

export const getAllTrainsService = async () => {
  return await client.get(`${BASE_URL}`);
};

export const getTrainByIdService = async (id) => {
  return await client.get(`${BASE_URL}/${id}`);
};

export const createTrainService = async (data) => {
  return await client.post(`${BASE_URL}`, data);
};

export const updateTrainService = async (id, data) => {
  return await client.patch(`${BASE_URL}/${id}`, data);
};

// --- Carriage Endpoints ---

export const getTrainCarriagesService = async (trainId) => {
  return await client.get(`${BASE_URL}/${trainId}/carriages`);
};

export const createCarriageService = async (data) => {
  return await client.post(`${BASE_URL}/carriages`, data);
};

export const updateCarriageService = async (carriageId, data) => {
  return await client.patch(`${BASE_URL}/carriages/${carriageId}`, data);
};