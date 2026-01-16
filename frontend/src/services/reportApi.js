import axiosClient from '../api/client';

export const getRevenueReportService = async (type, month, year) => {
  return await axiosClient.get('/api/v1/reports/revenue', {
    params: { 
        type: type,
        month: month,
        year: year
    }
  });
};

export const exportRevenueReportService = async (type, month, year) => {
  return await axiosClient.get('/api/v1/reports/revenue/export', {
    params: { 
        type: type,
        month: month,
        year: year
    },
    responseType: 'blob' 
  });
};