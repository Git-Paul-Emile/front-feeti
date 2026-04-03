import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, User, Tag, Eye, MessageCircle, Share2, Heart, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { BlogPostCard } from '../BlogPostCard';
import { toast } from 'sonner@2.0.3';
import BlogAPI, { type BlogPost, parseTags } from '../../services/api/BlogAPI';

interface BlogDetailPageProps {
  postId: string;
  onBack?: () => void;
  onNavigate?: (page: string, params?: any) => void;
  currentUser?: any;
}

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

export function BlogDetailPage({ postId, onBack, onNavigate }: BlogDetailPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    BlogAPI.getPostById(postId)
      .then((data) => {
        setPost(data);
        return BlogAPI.getRelatedPosts(postId);
      })
      .then(setRelatedPosts)
      .catch(() => toast.error("Erreur lors du chargement de l'article"))
      .finally(() => setIsLoading(false));
  }, [postId]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'events':   return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'culture':  return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'lifestyle':return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'tech':     return 'bg-blue-100 text-blue-800 border-blue-200';
      default:         return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post?.title, text: post?.excerpt, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers !');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Article retiré des favoris' : 'Article ajouté aux favoris');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Marque-page retiré' : 'Article sauvegardé');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-[400px] bg-gray-200 animate-pulse" />
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Article non trouvé</h1>
          <p className="text-gray-500 mb-4">L'article demandé n'existe pas ou a été supprimé.</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retourner au blog
          </Button>
        </div>
      </div>
    );
  }

  const tags = parseTags(post.tags);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <ImageWithFallback src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <div className="absolute top-6 left-6 z-10">
          <Button onClick={onBack} variant="ghost" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>

        <div className="absolute top-6 right-6 z-10 flex items-center space-x-2">
          <Button onClick={handleLike} variant="ghost" size="sm" className={`bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 ${isLiked ? 'text-red-400' : 'text-white'}`}>
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          <Button onClick={handleBookmark} variant="ghost" size="sm" className={`bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 ${isBookmarked ? 'text-yellow-400' : 'text-white'}`}>
            <BookOpen className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
          <Button onClick={handleShare} variant="ghost" size="sm" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <div className="max-w-4xl mx-auto">
            <Badge className={`${getCategoryColor(post.categorySlug)} mb-4`}>
              {post.category?.name ?? post.categorySlug}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center space-x-2"><User className="w-4 h-4" /><span>{post.author.name}</span></div>
              {post.publishDate && (
                <div className="flex items-center space-x-2"><Calendar className="w-4 h-4" /><span>{formatDate(post.publishDate)}</span></div>
              )}
              <div className="flex items-center space-x-2"><Clock className="w-4 h-4" /><span>{post.readTime} min de lecture</span></div>
              <div className="flex items-center space-x-2"><Eye className="w-4 h-4" /><span>{post.views} vues</span></div>
              <div className="flex items-center space-x-2"><MessageCircle className="w-4 h-4" /><span>{post.comments} commentaires</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <div className="text-xl text-gray-600 mb-8 p-6 bg-gray-50 rounded-lg border-l-4 border-[#4338ca]">
            {post.excerpt}
          </div>
          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#4338ca] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    className="flex items-center space-x-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                    onClick={() => onNavigate?.('blog', { search: tag })}
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{post.author.name}</h4>
                <p className="text-gray-600">Contributeur Feeti</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {relatedPosts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Articles similaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((rp) => (
              <BlogPostCard
                key={rp.id}
                post={toCardPost(rp)}
                onReadMore={(id) => onNavigate?.('blog-detail', { postId: id })}
                variant="compact"
              />
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-gradient-to-r from-[#4338ca] to-[#059669] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Découvrez plus d'articles</h2>
          <p className="text-white/90 mb-6">Explorez notre blog pour découvrir les dernières tendances et actualités</p>
          <Button onClick={() => onNavigate?.('blog')} className="bg-white text-[#4338ca] hover:bg-gray-100">
            <BookOpen className="w-4 h-4 mr-2" />
            Voir tous les articles
          </Button>
        </div>
      </div>
    </div>
  );
}
