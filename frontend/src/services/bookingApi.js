import client from '../api/client';

export const bookingApi = {
  // Lấy sơ đồ ghế
  getSeatMap: (tripId) => {
    // Đã đổi URL sang customers
    return client.get(`/api/v1/customers/seats/${tripId}`);
  },
  // Gửi thông tin thanh toán
  submitPayment: (paymentData) => {
    return client.post('/api/v1/customers/payment', paymentData);
  },

  getMyTickets: (email) => {
    return client.get('/api/v1/customers/my-tickets', {
      params: { email }
    });
  }

};