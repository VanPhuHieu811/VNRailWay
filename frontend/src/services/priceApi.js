import client from '../api/client';

export const getTrainCarriagePrices = async () => {
    return await client.get('/api/v1/prices/train-carriage');
};

export const updateTrainCarriagePrice = async (id, price) => {
    return await client.put(`/api/v1/prices/train-carriage/${id}`, { price });
};

export const getTrainFloorPrices = async () => {
    return await client.get('/api/v1/prices/floor');
};

export const updateTrainFloorPrice = async (id, price) => {
    return await client.put(`/api/v1/prices/floor/${id}`, { price });
};

export const getTrainTypePrices = async () => {
    return await client.get('/api/v1/prices/type-train');
};

export const updateTrainTypePrice = async (id, price) => {
    return await client.put(`/api/v1/prices/type-train/${id}`, { price });
};

export const getKilometerPrice = async () => {
    return await client.get('/api/v1/prices/kilometer');
};

export const updateKilometerPrice = async (id, price) => {
    return await client.put(`/api/v1/prices/kilometer/${id}`, { price });
};
