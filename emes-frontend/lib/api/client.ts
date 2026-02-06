import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// TODO: 운영 시 JWT 인증 인터셉터 복원
// apiClient.interceptors.request.use(...)
// apiClient.interceptors.response.use(...)
