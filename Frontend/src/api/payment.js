import api from "./axios";

// Before showing the payment button, we first ask our backend to "initiate" the payment. 
// Our backend creates a unique signature so that the transaction is secure and cannot be faked.
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