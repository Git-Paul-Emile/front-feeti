import api from '../../routes/axiosConfig';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  createdAt: string;
  _count?: { posts: number };
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  categorySlug: string;
  category: BlogCategory;
  tags: string; // JSON string
  status: 'draft' | 'published';
  isFeatured: boolean;
  views: number;
  comments: number;
  readTime: number;
  authorId: string;
  author: { id: string; name: string };
  publishDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostsResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogStats {
  total: number;
  published: number;
  draft: number;
  totalViews: number;
  totalComments: number;
}

export interface CreateBlogPostPayload {
  title: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  tags?: string[];
  featuredImage?: string;
  status?: 'draft' | 'published';
  isFeatured?: boolean;
  readTime?: number;
}

export interface CreateBlogCategoryPayload {
  name: string;
  slug: string;
  icon?: string;
}

export function parseTags(tagsJson: string): string[] {
  try {
    return JSON.parse(tagsJson);
  } catch {
    return [];
  }
}

const BlogAPI = {
  // ─── Categories ──────────────────────────────────────────────────────────────
  async getCategories(): Promise<BlogCategory[]> {
    const res = await api.get('/api/blog/categories');
    return res.data.data as BlogCategory[];
  },

  async createCategory(payload: CreateBlogCategoryPayload): Promise<BlogCategory> {
    const res = await api.post('/api/blog/categories', payload);
    return res.data.data as BlogCategory;
  },

  async updateCategory(id: string, payload: Partial<CreateBlogCategoryPayload>): Promise<BlogCategory> {
    const res = await api.put(`/api/blog/categories/${id}`, payload);
    return res.data.data as BlogCategory;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/api/blog/categories/${id}`);
  },

  // ─── Public posts ────────────────────────────────────────────────────────────
  async getPosts(params?: {
    category?: string;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<BlogPostsResponse> {
    const res = await api.get('/api/blog/posts', { params });
    return res.data.data as BlogPostsResponse;
  },

  async getPostById(id: string): Promise<BlogPost> {
    const res = await api.get(`/api/blog/posts/${id}`);
    return res.data.data as BlogPost;
  },

  async getRelatedPosts(id: string): Promise<BlogPost[]> {
    const res = await api.get(`/api/blog/posts/${id}/related`);
    return res.data.data as BlogPost[];
  },

  // ─── Admin posts ─────────────────────────────────────────────────────────────
  async getAdminPosts(params?: {
    category?: string;
    status?: string;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<BlogPostsResponse> {
    const res = await api.get('/api/blog/admin/posts', { params });
    return res.data.data as BlogPostsResponse;
  },

  async getStats(): Promise<BlogStats> {
    const res = await api.get('/api/blog/admin/stats');
    return res.data.data as BlogStats;
  },

  async createPost(payload: CreateBlogPostPayload): Promise<BlogPost> {
    const res = await api.post('/api/blog/posts', payload);
    return res.data.data as BlogPost;
  },

  async updatePost(id: string, payload: Partial<CreateBlogPostPayload>): Promise<BlogPost> {
    const res = await api.put(`/api/blog/posts/${id}`, payload);
    return res.data.data as BlogPost;
  },

  async deletePost(id: string): Promise<void> {
    await api.delete(`/api/blog/posts/${id}`);
  },
};

export default BlogAPI;
