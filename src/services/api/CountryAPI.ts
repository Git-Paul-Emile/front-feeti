import api from '../../routes/axiosConfig';

export interface Country {
  id: string;
  code: string;
  name: string;
  flag: string;
  isActive: boolean;
}

const CountryAPI = {
  async getAll(): Promise<Country[]> {
    const res = await api.get('/api/countries');
    return res.data.data;
  },

  async getAllAdmin(): Promise<Country[]> {
    const res = await api.get('/api/admin/countries');
    return res.data.data;
  },

  async create(data: { code: string; name: string; flag?: string }): Promise<Country> {
    const res = await api.post('/api/countries', data);
    return res.data.data;
  },

  async update(code: string, data: { name?: string; flag?: string; isActive?: boolean }): Promise<Country> {
    const res = await api.patch(`/api/countries/${code}`, data);
    return res.data.data;
  },

  async remove(code: string): Promise<void> {
    await api.delete(`/api/countries/${code}`);
  },
};

export default CountryAPI;
