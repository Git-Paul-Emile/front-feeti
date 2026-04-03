import api from '../../routes/axiosConfig';

export interface DeliveryZone {
  id: string;
  name: string;
  countryCode: string;
  fee: number;
  currency: string;
  description?: string;
  isActive: boolean;
  country?: { name: string; flag: string; code: string };
  _count?: { cities: number };
}

export interface DeliveryCity {
  id: string;
  name: string;
  countryCode: string;
  zoneId: string;
  isActive: boolean;
  country?: { name: string; flag: string; code: string };
  zone?: { name: string; fee: number; currency: string };
}

const DeliveryAPI = {
  // Public
  async getZonesByCountry(countryCode: string): Promise<DeliveryZone[]> {
    const res = await api.get('/api/delivery/zones', { params: { countryCode } });
    return res.data.data;
  },

  async getCitiesByCountry(countryCode: string, zoneId?: string): Promise<DeliveryCity[]> {
    const res = await api.get('/api/delivery/cities', { params: { countryCode, ...(zoneId ? { zoneId } : {}) } });
    return res.data.data;
  },

  // Admin
  async getAllZones(): Promise<DeliveryZone[]> {
    const res = await api.get('/api/admin/delivery-zones');
    return res.data.data;
  },

  async createZone(data: { name: string; countryCode: string; fee: number; currency?: string; description?: string }): Promise<DeliveryZone> {
    const res = await api.post('/api/admin/delivery-zones', data);
    return res.data.data;
  },

  async updateZone(id: string, data: Partial<{ name: string; fee: number; currency: string; description: string; isActive: boolean }>): Promise<DeliveryZone> {
    const res = await api.put(`/api/admin/delivery-zones/${id}`, data);
    return res.data.data;
  },

  async deleteZone(id: string): Promise<void> {
    await api.delete(`/api/admin/delivery-zones/${id}`);
  },

  async getAllCities(): Promise<DeliveryCity[]> {
    const res = await api.get('/api/admin/delivery-cities');
    return res.data.data;
  },

  async createCity(data: { name: string; countryCode: string; zoneId: string }): Promise<DeliveryCity> {
    const res = await api.post('/api/admin/delivery-cities', data);
    return res.data.data;
  },

  async updateCity(id: string, data: Partial<{ name: string; zoneId: string; isActive: boolean }>): Promise<DeliveryCity> {
    const res = await api.put(`/api/admin/delivery-cities/${id}`, data);
    return res.data.data;
  },

  async deleteCity(id: string): Promise<void> {
    await api.delete(`/api/admin/delivery-cities/${id}`);
  },
};

export default DeliveryAPI;
