import { useEffect, useState } from 'react';
import { FigmaBlogPostCard } from './FigmaBlogPostCard';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import BlogAPI, { parseTags, type BlogPost as ApiBlogPost } from '../services/api/BlogAPI';

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

interface FigmaBlogSectionProps {
  posts?: BlogPost[];
  onPostSelect: (postId: string) => void;
  onNavigateToBlog: () => void;
}

function toSectionPost(post: ApiBlogPost): BlogPost {
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
    status: post.status,
    views: post.views,
    comments: post.comments,
    isFeatured: post.isFeatured,
  };
}

export function FigmaBlogSection({
  posts,
  onPostSelect,
  onNavigateToBlog,
}: FigmaBlogSectionProps) {
  const [fetchedPosts, setFetchedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (posts && posts.length > 0) return;

    let isMounted = true;

    BlogAPI.getPosts({ limit: 4 })
      .then((response) => {
        if (!isMounted) return;
        setFetchedPosts(response.posts.map(toSectionPost));
      })
      .catch(() => {
        if (!isMounted) return;
        setFetchedPosts([]);
      });

    return () => {
      isMounted = false;
    };
  }, [posts]);

  const displayPosts = (posts && posts.length > 0 ? posts : fetchedPosts).slice(0, 4);

  if (displayPosts.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 md:mb-16">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-[#000441] text-3xl md:text-4xl lg:text-[48px] font-bold leading-[1.005] max-w-4xl mb-4">
                Derniers articles du blog
              </h2>
              <p className="text-[#c0c5d0] text-lg md:text-xl max-w-2xl">
                Découvrez nos conseils, guides et actualités pour profiter au maximum de vos sorties
              </p>
            </div>

            <Button
              onClick={onNavigateToBlog}
              variant="outline"
              className="hidden md:flex border-[#6941c6] text-[#6941c6] hover:bg-[#6941c6] hover:text-white px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 group"
            >
              Voir tous les articles
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10 place-items-start">
          {displayPosts.map((post, index) => (
            <div
              key={post.id}
              className="w-full max-w-[350px] mx-auto"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <FigmaBlogPostCard
                post={post}
                onReadMore={onPostSelect}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12 md:hidden">
          <Button
            onClick={onNavigateToBlog}
            variant="outline"
            className="border-[#6941c6] text-[#6941c6] hover:bg-[#6941c6] hover:text-white px-8 py-3 font-semibold transition-all duration-300 hover:scale-105 group"
          >
            Voir tous les articles
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}
