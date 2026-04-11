import api from "./axios";

export const initiateKhaltiPayment = async (bookingId) => {
  const response = await api.post("/futsal/payment/khalti/initiate/", {
    booking_id: bookingId,
  });
  return response.data;
};

export const initiateTournamentPayment = async (registrationId) => {
  const response = await api.post("/futsal/payment/khalti/initiate/", {
    registration_id: registrationId,
  });
  return response.data;
};

export const verifyKhaltiPayment = async (params) => {
  // params should contain pidx and either booking_id or registration_id
  const response = await api.post("/futsal/payment/khalti/verify/", params);
  return response.data;
};