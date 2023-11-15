import { API_URL } from './config'
import axios from 'axios'

const buildRequest = request => {
  const { body, method, url, token } = request

  const contentType =
    body instanceof FormData ? 'multipart/form-data' : 'application/json'

  const headers = {
    Accept: 'application/json',
    Authorization: token ? `Token ${token}` : '',
    'Content-Type': contentType
  }

  const apiUrl = API_URL()

  const requestConfig = {
    baseURL: apiUrl,
    data: body,
    headers: headers,
    method,
    url
  }
  return requestConfig
}

export const defaultResponse = {
  status: 500,
  data: {
    error: 'Server error'
  }
}

export const formatError = responseError => {
  const response = responseError || defaultResponse
  const errors = response.data
  return {
    code: response.status,
    message: errors
  }
}

export const makeRequest = async request => {
  console.log({ request })
  const requestConfig = buildRequest(request)
  return new Promise((resolve, reject) => {
    const axiosRequest = axios(requestConfig)
    axiosRequest.then(resolve).catch(error => {
      reject(error)
    })
  })

  // const axiosRequest = axios(requestConfig)
  //   return {
  //     status: (await axiosRequest).status,
  //     data: (await axiosRequest).data
  //   }
}
