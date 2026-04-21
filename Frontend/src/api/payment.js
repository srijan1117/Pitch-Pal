import api from "./axios";

export const initiateEsewaPayment = async (params) => {
  // params should have booking_id, registration_id, or weekly_booking_id
  const response = await api.post("/futsal/payment/esewa/initiate/", params);
  return response.data;
};

export const verifyEsewaPayment = async (data) => {
  // data is the base64 encoded string from eSewa redirect
  const response = await api.post("/futsal/payment/esewa/verify/", { data });
  return response.data;
};