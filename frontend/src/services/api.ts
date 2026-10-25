import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach JWT token if available
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Vehicle API calls
export const getVehicles = () => api.get('/vehicles');
export const searchVehicles = (params: any) => api.get('/vehicles/search', { params });
export const createVehicle = (vehicleData: any) => api.post('/vehicles', vehicleData);
export const updateVehicle = (id: string, vehicleData: any) => api.put(`/vehicles/${id}`, vehicleData);
export const deleteVehicle = (id: string) => api.delete(`/vehicles/${id}`);
export const purchaseVehicle = (id: string) => api.post(`/vehicles/${id}/purchase`);
export const restockVehicle = (id: string, quantity: number) => api.post(`/vehicles/${id}/restock`, { quantity });

// Auth API calls
export const registerUser = (userData: any) => api.post('/auth/register', userData);
export const loginUser = (credentials: any) => api.post('/auth/login', credentials);

export default api;