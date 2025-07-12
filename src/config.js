// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://notechat-backend-production.up.railway.app';

export const API_ENDPOINTS = {
  // Auth endpoints
  SEND_EMAIL_OTP: `${API_BASE_URL}/api/auth/send-email-otp`,
  VERIFY_EMAIL_OTP: `${API_BASE_URL}/api/auth/verify-email-otp`,
  CREATE_USER: `${API_BASE_URL}/api/auth/createuser`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  GET_USER: `${API_BASE_URL}/api/auth/getuser`,
  DELETE_USER: `${API_BASE_URL}/api/auth/deleteuser`,
  
  // Notes endpoints
  FETCH_ALL_NOTES: `${API_BASE_URL}/api/notes/fetchallnotes`,
  ADD_NOTE: `${API_BASE_URL}/api/notes/addnote`,
  UPDATE_NOTE: `${API_BASE_URL}/api/notes/updatenote`,
  DELETE_NOTE: `${API_BASE_URL}/api/notes/deletenote`,
};

export default API_ENDPOINTS; 