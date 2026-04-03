// Re-export depuis le fichier TypeScript
export { AppRoutes } from './AppRoutes.tsx';

// API Health (conservée ici)
import api from './axiosConfig';
export const healthApi = {
  getStatus: () => api.get('/health'),
};
