import axios from 'axios';

let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

API.interceptors.request.use(config => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

API.interceptors.response.use(
  res => res,
  err => {
    const originalRequest = err.config;
    if (!originalRequest) return Promise.reject(err);

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return axios(originalRequest);
        }).catch(e => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          const resp = await axios.post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true });
          const newToken = resp.data.access;
          setAccessToken(newToken);
          processQueue(null, newToken);
          originalRequest.headers.Authorization = 'Bearer ' + newToken;
          resolve(axios(originalRequest));
        } catch (e) {
          processQueue(e, null);
          reject(e);
        } finally {
          isRefreshing = false;
        }
      });
    }
    return Promise.reject(err);
  }
);

export default API;
