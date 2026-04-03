import { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, User, TrendingUp, Grid, List, BookOpen, Star, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FigmaBlogCard } from '../FigmaBlogCard';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import BlogAPI, { type BlogPost, type BlogCategory, parseTags } from '../../services/api/BlogAPI';
import { toast } from 'sonner@2.0.3';

interface BlogPageProps {
  onBack?: () => void;
  onPostSelect?: (postId: string) => void;
  onNavigate?: (page: string, params?: any) => void;
  initialCategory?: string;
  currentUser?: any;
}

// Convert API BlogPost to the shape FigmaBlogCard expects
function toCardPost(post: BlogPost) {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    author: post.author.name,
    publishDate: post.publishDate ?? post.createdAt,
    readTime: post.readTime,
    category: post.categorySlug,
    tags: parseTags(post.tags),
    featuredImage: post.featuredImage,
    status: post.status as 'published' | 'draft',
    views: post.views,
    comments: post.comments,
    isFeatured: post.isFeatured,
  };
}

const staticCategories = [
  { value: 'all', label: 'Tous les articles', icon: BookOpen },
  { value: 'events', label: 'Événements', icon: Calendar },
  { value: 'culture', label: 'Culture', icon: Star },
  { value: 'lifestyle', label: 'Lifestyle', icon: TrendingUp },
  { value: 'tech', label: 'Technologie', icon: User },
];

export function BlogPage({ onBack, onPostSelect, onNavigate, initialCategory = 'all', currentUser }: BlogPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchPosts = useCallback(async (reset = false) => {
    setIsLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const res = await BlogAPI.getPosts({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sort: sortBy,
        page: currentPage,
        limit: 12,
      });
      if (reset) {
        setPosts(res.posts);
        setPage(1);
      } else {
        setPosts(prev => currentPage === 1 ? res.posts : [...prev, ...res.posts]);
      }
      setTotal(res.total);
    } catch {
      toast.error('Erreur lors du chargement des articles');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy, page]);

  useEffect(() => {
    BlogAPI.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    fetchPosts(true);
  }, [selectedCategory, searchQuery, sortBy]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setIsLoading(true);
    try {
      const res = await BlogAPI.getPosts({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sort: sortBy,
        page: nextPage,
        limit: 12,
      });
      setPosts(prev => [...prev, ...res.posts]);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostSelect = (postId: string) => {
    if (onPostSelect) {
      onPostSelect(postId);
    } else if (onNavigate) {
      onNavigate('blog-detail', { postId });
    }
  };

  const featuredPost = posts.find(p => p.isFeatured);
  const regularPosts = posts.filter(p => !p.isFeatured || selectedCategory !== 'all' || searchQuery);
  const displayPosts = selectedCategory === 'all' && !searchQuery ? regularPosts : posts;

  const categoryList = categories.length > 0
    ? [{ value: 'all', label: 'Tous les articles' }, ...categories.map(c => ({ value: c.slug, label: c.name }))]
    : staticCategories.map(c => ({ value: c.value, label: c.label }));

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'moderator' || currentUser?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4338ca] to-[#059669] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button onClick={onBack} variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">Féetiche</h1>
                <p className="text-white/90 text-lg">
                  Actualités, tendances et coulisses de l'événementiel en Afrique Centrale
                </p>
              </div>
            </div>

            {isAdmin && (
              <Button
                onClick={() => onNavigate?.('blog-admin')}
                className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-[#4338ca]"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Administration
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Post */}
        {featuredPost && selectedCategory === 'all' && !searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              Article à la une
            </h2>
            <FigmaBlogCard
              post={toCardPost(featuredPost)}
              onReadMore={handlePostSelect}
              variant="featured"
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Rechercher des articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categoryList.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Plus récents</SelectItem>
                  <SelectItem value="popular">Plus populaires</SelectItem>
                  <SelectItem value="comments">Plus commentés</SelectItem>
                  <SelectItem value="readTime">Lecture rapide</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              {total} article{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}>
                <Grid className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {isLoading && posts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 place-items-start">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-[400px] w-full max-w-[350px] animate-pulse" />
            ))}
          </div>
        ) : displayPosts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun article trouvé</h3>
            <p className="text-gray-500 mb-4">Essayez de modifier vos critères de recherche.</p>
            <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} variant="outline">
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 place-items-start'
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 place-items-start'
          }`}>
            {displayPosts.map((post, index) => (
              <div key={post.id} className="w-full max-w-[350px] mx-auto" style={{ animationDelay: `${index * 150}ms` }}>
                <FigmaBlogCard post={toCardPost(post)} onReadMore={handlePostSelect} variant="default" />
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {posts.length < total && (
          <div className="text-center mt-12">
            <Button onClick={handleLoadMore} variant="outline" size="lg" className="min-w-[200px]" disabled={isLoading}>
              {isLoading ? 'Chargement...' : "Charger plus d'articles"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
