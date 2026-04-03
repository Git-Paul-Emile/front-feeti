import api from '../../routes/axiosConfig';

export interface PlatformSettings {
  platformName: string;
  commissionRate: string;
  tvaRate: string;
  defaultCurrency: string;
  maintenanceMode: string;
}

const SettingsAPI = {
  async get(): Promise<PlatformSettings> {
    const res = await api.get('/api/admin/settings');
    return res.data.data;
  },

  async update(data: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const res = await api.put('/api/admin/settings', data);
    return res.data.data;
  },
};

export default SettingsAPI;
