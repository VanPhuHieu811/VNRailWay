import client from '../api/client'; 


export const loginUser = async (credentials) => {
  return await client.post('/api/v1/auth/login', credentials);
};

export const registerUser = async (data) => {
  return await client.post('/api/v1/auth/register', data);
};

export const getCurrentUserInfo = async () => {
  return await client.get('/api/v1/users/me');
};


export const checkTicketByCodeAndCCCD = async (ticketCode, passengerCCCD) => {
  return await client.get('/api/v1/tickets/check-status', {
    params: {
      code: ticketCode,
      cccd: passengerCCCD
    }
  });
};