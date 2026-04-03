import { Clock, User, Tag, ArrowRight, Eye, MessageCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  readTime: number;
  category: string;
  tags: string[];
  featuredImage: string;
  status: 'published' | 'draft';
  views: number;
  comments: number;
  isFeatured?: boolean;
}

interface BlogPostCardProps {
  post: BlogPost;
  onReadMore: (postId: string) => void;
  variant?: 'default' | 'featured' | 'compact';
}

export function BlogPostCard({ post, onReadMore, variant = 'default' }: BlogPostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'events':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'culture':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'lifestyle':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'tech':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (variant === 'featured') {
    return (
      <article className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 group blog-card-featured">
        <div className="aspect-[16/9] relative overflow-hidden">
          <ImageWithFallback
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Featured Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-[#de0035] text-white px-3 py-1 text-sm font-semibold">
              À la une
            </Badge>
          </div>
          
          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <Badge className={`${getCategoryColor(post.category)} px-3 py-1 text-sm font-medium border`}>
              {post.category}
            </Badge>
          </div>
          
          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-2xl font-bold mb-3 leading-tight group-hover:text-[#53e88b] transition-colors">
              {post.title}
            </h2>
            
            <p className="text-white/90 mb-4 line-clamp-2">
              {post.excerpt}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-white/80">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime} min</span>
                </div>
              </div>
              
              <Button
                onClick={() => onReadMore(post.id)}
                className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300 group/btn"
              >
                Lire la suite
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group border border-gray-100">
        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
          <ImageWithFallback
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <Badge className={`${getCategoryColor(post.category)} mb-2 text-xs px-2 py-1`}>
            {post.category}
          </Badge>
          
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#4338ca] transition-colors line-clamp-2 mb-2">
            {post.title}
          </h3>
          
          <div className="flex items-center text-sm text-gray-500 space-x-3">
            <span>{formatDate(post.publishDate)}</span>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{post.readTime} min</span>
            </div>
          </div>
        </div>
        
        <Button
          onClick={() => onReadMore(post.id)}
          variant="ghost"
          size="sm"
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100 blog-card-enter">
      <div className="aspect-[16/10] relative overflow-hidden">
        <ImageWithFallback
          src={post.featuredImage}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${getCategoryColor(post.category)} px-2 py-1 text-xs font-medium border`}>
            {post.category}
          </Badge>
        </div>
        
        {/* Stats */}
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1 text-white text-xs">
            <Eye className="w-3 h-3" />
            <span>{post.views}</span>
          </div>
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1 text-white text-xs">
            <MessageCircle className="w-3 h-3" />
            <span>{post.comments}</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <User className="w-4 h-4" />
            <span>{post.author}</span>
          </div>
          <span className="text-sm text-gray-500">{formatDate(post.publishDate)}</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#4338ca] transition-colors line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">{post.readTime} min de lecture</span>
          </div>
          
          <Button
            onClick={() => onReadMore(post.id)}
            variant="ghost"
            className="text-[#4338ca] hover:text-[#059669] hover:bg-[#4338ca]/5 group/btn"
          >
            Lire la suite
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
        
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {post.tags.slice(0, 3).map((tag) => (
              <div key={tag} className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                <Tag className="w-3 h-3" />
                <span>{tag}</span>
              </div>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{post.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}