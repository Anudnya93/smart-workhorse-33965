import { API } from './'

export const signupUser = payload => {
  return API.post('api/v1/auth/signup/', payload)
}

export const loginUser = payload => {
  return API.post('api/v1/auth/login/', payload)
}

export const resetEmail = payload => {
  return API.post('api/v1/auth/reset_password/', payload)
}

export const verifyEmail = payload => {
  return API.post('api/v1/auth/validateOTP/', payload)
}

export const setPassword = (payload, token) => {
  return API.post('api/v1/auth/confirm_reset_password/', payload, token)
}

export const changePassword = (payload, token) => {
  return API.post('rest-auth/password/change/', payload, token)
}

export const updateProfile = async (payload, user_id, token) => {
  return API.patch(`api/v1/users/${user_id}/`, payload, token)
}

export const editProfile = (id, payload, token) => {
  return API.patch(`api/v1/users/${id}/`, payload, token)
}

export const deleteAccount = (client_id, token) => {
  return API.delete(`api/v1/client/${client_id}/`, {}, token)
}

export const forgotpasswordCode = payload => {
  return API.post('api/v1/forgotpasswordcode', payload)
}

export const forgotpassword = payload => {
  return API.post('api/v1/users/otp/', payload)
}

export const getProfile = token => {
  return API.get(`api/v1/profile/`, token)
}

export const createAdminProfile = (payload, token) => {
  return API.post(`api/v1/profile/`, payload, token)
}

export const updateAdminProfile = (payload, token) => {
  return API.put(`api/v1/profile/`, payload, token)
}

export const getMyReviews = token => {
  return API.get('api/v1/my-reviews/', token)
}

export const getCategories = token => {
  return API.get('api/v1/categories/', token)
}

export const getFavoriteFoodtruck = token => {
  return API.get('api/v1/customers/favorite/', token)
}

export const addFavoriteFoodtruck = (body, token) => {
  return API.post('api/v1/customers/favorite/', body, token)
}

export const sendEmailForVerification = (body, token) => {
  return API.post('api/v1/users/verify_email/', body, token)
}

export const veriOTP = (body, token) => {
  return API.get(`api/v1/users/verify_email/${body}`, token)
}

export const sendOTPForVerification = (body, token) => {
  return API.post('api/v1/users/verify_phone/', body, token)
}

export const veriPhoneOTP = (body, token) => {
  return API.get(`api/v1/users/verify_phone/${body}`, token)
}

export const getCountries = token => {
  return API.get(`api/v1/country/`, token)
}

export const getCities = token => {
  return API.get(`api/v1/city/`, token)
}

export const getStates = token => {
  return API.get(`api/v1/state/`, token)
}