import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, Calendar, User, BarChart3, BookOpen,
  Save, X, Tag, Clock, ArrowLeft, FolderOpen, AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
import BlogAPI, {
  type BlogPost, type BlogCategory, type BlogStats,
  type CreateBlogPostPayload, parseTags,
} from '../../services/api/BlogAPI';

interface BlogAdminPageProps {
  onBack?: () => void;
  currentUser?: any;
}

const emptyPostForm: CreateBlogPostPayload & { isFeatured: boolean } = {
  title: '',
  excerpt: '',
  content: '',
  categorySlug: '',
  tags: [],
  featuredImage: '',
  status: 'draft',
  isFeatured: false,
};

const emptyCategoryForm = { name: '', slug: '', icon: '' };

export function BlogAdminPage({ onBack, currentUser }: BlogAdminPageProps) {
  // ── Posts state
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [postsLoading, setPostsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // ── Categories state
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // ── Stats state
  const [stats, setStats] = useState<BlogStats | null>(null);

  // ── Post form
  const [postForm, setPostForm] = useState(emptyPostForm);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [postSaving, setPostSaving] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  // ── Category form
  const [catForm, setCatForm] = useState(emptyCategoryForm);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [catSaving, setCatSaving] = useState(false);

  // ── Delete confirmations
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  const loadPosts = async () => {
    setPostsLoading(true);
    try {
      const res = await BlogAPI.getAdminPosts({
        search: searchQuery || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        limit: 50,
      });
      setPosts(res.posts);
      setTotal(res.total);
    } catch {
      toast.error('Erreur lors du chargement des articles');
    } finally {
      setPostsLoading(false);
    }
  };

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const cats = await BlogAPI.getCategories();
      setCategories(cats);
    } catch {
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const s = await BlogAPI.getStats();
      setStats(s);
    } catch {}
  };

  useEffect(() => {
    loadPosts();
  }, [searchQuery, filterStatus, filterCategory]);

  useEffect(() => {
    loadCategories();
    loadStats();
  }, []);

  // ─── Post CRUD ───────────────────────────────────────────────────────────────
  const openCreatePost = () => {
    setPostForm({ ...emptyPostForm, categorySlug: categories[0]?.slug ?? '' });
    setTagsInput('');
    setEditingPostId(null);
    setIsPostDialogOpen(true);
  };

  const openEditPost = (post: BlogPost) => {
    setPostForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      categorySlug: post.categorySlug,
      tags: parseTags(post.tags),
      featuredImage: post.featuredImage,
      status: post.status,
      isFeatured: post.isFeatured,
    });
    setTagsInput(parseTags(post.tags).join(', '));
    setEditingPostId(post.id);
    setIsPostDialogOpen(true);
  };

  const handleSavePost = async () => {
    if (!postForm.title.trim() || !postForm.excerpt.trim() || !postForm.content.trim() || !postForm.categorySlug) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setPostSaving(true);
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const payload = { ...postForm, tags };
    try {
      if (editingPostId) {
        await BlogAPI.updatePost(editingPostId, payload);
        toast.success('Article mis à jour !');
      } else {
        await BlogAPI.createPost(payload);
        toast.success('Article créé !');
      }
      setIsPostDialogOpen(false);
      loadPosts();
      loadStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Erreur lors de l'enregistrement");
    } finally {
      setPostSaving(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await BlogAPI.deletePost(id);
      toast.success('Article supprimé');
      setDeletingPostId(null);
      loadPosts();
      loadStats();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  // ─── Category CRUD ───────────────────────────────────────────────────────────
  const openCreateCat = () => {
    setCatForm(emptyCategoryForm);
    setEditingCatId(null);
    setIsCatDialogOpen(true);
  };

  const openEditCat = (cat: BlogCategory) => {
    setCatForm({ name: cat.name, slug: cat.slug, icon: cat.icon ?? '' });
    setEditingCatId(cat.id);
    setIsCatDialogOpen(true);
  };

  const handleSaveCat = async () => {
    if (!catForm.name.trim() || !catForm.slug.trim()) {
      toast.error('Nom et slug sont requis');
      return;
    }
    setCatSaving(true);
    try {
      if (editingCatId) {
        await BlogAPI.updateCategory(editingCatId, catForm);
        toast.success('Catégorie mise à jour !');
      } else {
        await BlogAPI.createCategory(catForm);
        toast.success('Catégorie créée !');
      }
      setIsCatDialogOpen(false);
      loadCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erreur lors de la sauvegarde');
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCat = async (id: string) => {
    try {
      await BlogAPI.deleteCategory(id);
      toast.success('Catégorie supprimée');
      setDeletingCatId(null);
      loadCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erreur lors de la suppression');
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const autoSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button onClick={onBack} variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Administration Blog</h1>
                <p className="text-gray-500">Gérez vos articles et catégories</p>
              </div>
            </div>
            <Button onClick={openCreatePost} className="bg-[#4338ca] hover:bg-[#4338ca]/90">
              <Plus className="w-4 h-4 mr-2" />
              Nouvel article
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" /><span>Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" /><span>Articles ({total})</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <FolderOpen className="w-4 h-4" /><span>Catégories ({categories.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { label: 'Total Articles', value: stats?.total ?? 0, icon: BookOpen, color: '' },
                { label: 'Publiés', value: stats?.published ?? 0, icon: Eye, color: 'text-green-600' },
                { label: 'Brouillons', value: stats?.draft ?? 0, icon: Edit, color: 'text-orange-600' },
                { label: 'Vues totales', value: (stats?.totalViews ?? 0).toLocaleString(), icon: BarChart3, color: '' },
                { label: 'Commentaires', value: stats?.totalComments ?? 0, icon: User, color: '' },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{label}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Articles récents</CardTitle>
                <CardDescription>Vos derniers articles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.slice(0, 5).map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                          <ImageWithFallback src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 line-clamp-1">{post.title}</h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span>{post.publishDate ? new Date(post.publishDate).toLocaleDateString('fr-FR') : '—'}</span>
                            <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                              {post.status === 'published' ? 'Publié' : 'Brouillon'}
                            </Badge>
                            <span>{post.views} vues</span>
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => openEditPost(post)} variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Posts ── */}
          <TabsContent value="posts" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="published">Publiés</SelectItem>
                  <SelectItem value="draft">Brouillons</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Articles ({posts.length})</h3>
              </div>
              {postsLoading ? (
                <div className="p-8 text-center text-gray-500">Chargement...</div>
              ) : posts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Aucun article trouvé</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {posts.map((post) => (
                    <div key={post.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <ImageWithFallback src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-lg font-medium text-gray-900 truncate">{post.title}</h4>
                              {post.isFeatured && <Badge className="bg-yellow-100 text-yellow-800">À la une</Badge>}
                            </div>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{post.excerpt}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1"><User className="w-3 h-3" /><span>{post.author.name}</span></div>
                              <div className="flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>{post.publishDate ? new Date(post.publishDate).toLocaleDateString('fr-FR') : '—'}</span></div>
                              <div className="flex items-center space-x-1"><Clock className="w-3 h-3" /><span>{post.readTime} min</span></div>
                              <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                {post.status === 'published' ? 'Publié' : 'Brouillon'}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span>{post.views} vues</span>
                              <span>{post.comments} commentaires</span>
                              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{post.category?.name ?? post.categorySlug}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button onClick={() => openEditPost(post)} variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => setDeletingPostId(post.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Categories ── */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={openCreateCat} className="bg-[#4338ca] hover:bg-[#4338ca]/90">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle catégorie
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Catégories ({categories.length})</h3>
              </div>
              {categoriesLoading ? (
                <div className="p-8 text-center text-gray-500">Chargement...</div>
              ) : categories.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Aucune catégorie</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-5 hover:bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-[#4338ca]/10 rounded-lg flex items-center justify-center">
                          <Tag className="w-5 h-5 text-[#4338ca]" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{cat.name}</h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span>slug : <code className="bg-gray-100 px-1 rounded">{cat.slug}</code></span>
                            {cat.icon && <span>icône : {cat.icon}</span>}
                            <span>{cat._count?.posts ?? 0} article(s)</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button onClick={() => openEditCat(cat)} variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => setDeletingCatId(cat.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Post Dialog ── */}
      <Dialog open={isPostDialogOpen} onOpenChange={(open) => { if (!open) setIsPostDialogOpen(false); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPostId ? "Modifier l'article" : 'Créer un nouvel article'}</DialogTitle>
            <DialogDescription>
              {editingPostId ? "Modifiez les informations de votre article." : "Remplissez les informations du nouvel article."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="post-title">Titre *</Label>
              <Input id="post-title" placeholder="Titre de l'article" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-excerpt">Résumé *</Label>
              <Textarea id="post-excerpt" placeholder="Résumé court de l'article" value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-content">Contenu * (HTML supporté)</Label>
              <Textarea id="post-content" placeholder="Contenu complet..." value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} rows={12} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select value={postForm.categorySlug} onValueChange={(v) => setPostForm({ ...postForm, categorySlug: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={postForm.status} onValueChange={(v: 'draft' | 'published') => setPostForm({ ...postForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-tags">Tags (séparés par des virgules)</Label>
              <Input id="post-tags" placeholder="tag1, tag2, tag3" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-image">Image à la une (URL)</Label>
              <Input id="post-image" placeholder="https://..." value={postForm.featuredImage} onChange={(e) => setPostForm({ ...postForm, featuredImage: e.target.value })} />
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                id="post-featured"
                checked={postForm.isFeatured}
                onCheckedChange={(v) => setPostForm({ ...postForm, isFeatured: v })}
              />
              <Label htmlFor="post-featured">Article à la une</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="ghost" onClick={() => setIsPostDialogOpen(false)} disabled={postSaving}>
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleSavePost} className="bg-[#4338ca] hover:bg-[#4338ca]/90" disabled={postSaving}>
              <Save className="w-4 h-4 mr-2" />
              {postSaving ? 'Enregistrement...' : editingPostId ? 'Mettre à jour' : "Créer l'article"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Category Dialog ── */}
      <Dialog open={isCatDialogOpen} onOpenChange={(open) => { if (!open) setIsCatDialogOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCatId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
            <DialogDescription>
              {editingCatId ? 'Modifiez les informations de la catégorie.' : 'Créez une nouvelle catégorie de blog.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                placeholder="Ex: Événements"
                value={catForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setCatForm({ ...catForm, name, slug: editingCatId ? catForm.slug : autoSlug(name) });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input
                placeholder="ex: evenements"
                value={catForm.slug}
                onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Icône (nom Lucide)</Label>
              <Input
                placeholder="ex: calendar, star, cpu"
                value={catForm.icon}
                onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="ghost" onClick={() => setIsCatDialogOpen(false)} disabled={catSaving}>
              <X className="w-4 h-4 mr-2" />Annuler
            </Button>
            <Button onClick={handleSaveCat} className="bg-[#4338ca] hover:bg-[#4338ca]/90" disabled={catSaving}>
              <Save className="w-4 h-4 mr-2" />
              {catSaving ? 'Enregistrement...' : editingCatId ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Post Confirm ── */}
      <Dialog open={!!deletingPostId} onOpenChange={(open) => { if (!open) setDeletingPostId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>Supprimer l'article</span>
            </DialogTitle>
            <DialogDescription>Cette action est irréversible. L'article sera définitivement supprimé.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" onClick={() => setDeletingPostId(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deletingPostId && handleDeletePost(deletingPostId)}>Supprimer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Category Confirm ── */}
      <Dialog open={!!deletingCatId} onOpenChange={(open) => { if (!open) setDeletingCatId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>Supprimer la catégorie</span>
            </DialogTitle>
            <DialogDescription>Cette action est irréversible. La catégorie sera supprimée si aucun article ne lui est associé.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" onClick={() => setDeletingCatId(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deletingCatId && handleDeleteCat(deletingCatId)}>Supprimer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
