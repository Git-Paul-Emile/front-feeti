import api from '../../routes/axiosConfig';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  createdAt: string;
}

const CategoriesAPI = {
  async getAll(): Promise<Category[]> {
    const res = await api.get('/api/categories');
    return res.data.data as Category[];
  },

  async create(data: { name: string; slug: string; icon?: string }): Promise<Category> {
    const res = await api.post('/api/categories', data);
    return res.data.data as Category;
  },

  async update(id: string, data: { name?: string; slug?: string; icon?: string }): Promise<Category> {
    const res = await api.put(`/api/categories/${id}`, data);
    return res.data.data as Category;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/categories/${id}`);
  },
};

export default CategoriesAPI;
