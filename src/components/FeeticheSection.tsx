/**
 * FeeticheSection — Articles blog "À la une" sur la homepage
 * Affiche uniquement les articles marqués isFeatured par l'admin.
 * Position : après les sections événements et bon plans.
 */
import { useState, useEffect } from 'react';
import BlogAPI, { type BlogPost, parseTags } from '../services/api/BlogAPI';

interface FeeticheSectionProps {
  onNavigate: (page: string, params?: any) => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function FeeticheSection({ onNavigate }: FeeticheSectionProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    BlogAPI.getPosts({ isFeatured: true, limit: 3, sort: 'date' })
      .then(res => setPosts(res.posts))
      .catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  const [hero, ...rest] = posts;

  return (
    <section className="py-14 bg-[#03033b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">Féétiche</h2>
            <p className="text-white/60 text-sm">Articles sélectionnés par l'équipe Feeti</p>
          </div>
          <button
            onClick={() => onNavigate('blog')}
            className="text-sm font-medium text-[#16bda0] hover:text-[#12a88d] transition-colors"
          >
            Voir tout le blog
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Article principal */}
          <div
            className="lg:col-span-2 relative rounded-2xl overflow-hidden cursor-pointer group min-h-[280px]"
            onClick={() => onNavigate('blog-detail', { postId: hero.id })}
          >
            {hero.featuredImage ? (
              <div
                className="absolute inset-0 bg-center bg-cover bg-no-repeat group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url('${hero.featuredImage}')` }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#4338ca] to-[#16bda0]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#16bda0] mb-2">
                À la une · {hero.categorySlug}
              </span>
              <h3 className="text-white font-bold text-xl sm:text-2xl leading-snug mb-2 line-clamp-2">
                {hero.title}
              </h3>
              <p className="text-white/70 text-sm line-clamp-2 mb-3">{hero.excerpt}</p>
              <div className="flex items-center gap-3 text-white/50 text-xs">
                <span>{hero.author.name}</span>
                <span>·</span>
                <span>{formatDate(hero.publishDate ?? hero.createdAt)}</span>
                <span>·</span>
                <span>{hero.readTime} min</span>
              </div>
            </div>
          </div>

          {/* Articles secondaires */}
          <div className="flex flex-col gap-4">
            {rest.map(post => (
              <div
                key={post.id}
                className="flex gap-3 cursor-pointer group"
                onClick={() => onNavigate('blog-detail', { postId: post.id })}
              >
                <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-800">
                  {post.featuredImage && (
                    <div
                      className="w-full h-full bg-center bg-cover bg-no-repeat group-hover:scale-105 transition-transform duration-300"
                      style={{ backgroundImage: `url('${post.featuredImage}')` }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#16bda0]">
                    {post.categorySlug}
                  </span>
                  <h4 className="text-white text-sm font-semibold leading-snug line-clamp-2 mt-0.5 group-hover:text-[#16bda0] transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-white/40 text-xs mt-1">{formatDate(post.publishDate ?? post.createdAt)}</p>
                </div>
              </div>
            ))}

            <button
              onClick={() => onNavigate('blog')}
              className="mt-auto w-full py-2.5 text-sm font-medium rounded-xl border border-white/20 text-white/70 hover:border-[#16bda0] hover:text-[#16bda0] transition-colors"
            >
              Lire plus d'articles
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
