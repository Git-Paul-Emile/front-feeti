import { useState, useEffect } from 'react';
import svgPaths from "../imports/svg-61wsnipctn";
import BlogAPI from '../services/api/BlogAPI';
import type { BlogPost } from '../services/api/BlogAPI';

interface BonPlanEvasionSectionProps {
  onNavigate: (page: string) => void;
}

function formatBlogDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));
}

function MPostCardOverlay({ post, onNavigate }: { post: BlogPost; onNavigate: (page: string) => void }) {
  return (
    <div
      className="absolute bg-[position:0%_0%,_50%_50%] bg-[rgba(20,22,36,0.4)] bg-size-[auto,cover] box-border content-stretch flex flex-col gap-[10px] h-[450px] items-center justify-end left-0 overflow-clip p-[20px] sm:p-[40px] rounded-[12px] top-0 w-full max-w-5xl cursor-pointer hover:opacity-90 transition-opacity duration-200"
      data-name="m-post-card-overlay"
      style={{ backgroundImage: `url('${post.featuredImage}')` }}
      onClick={() => onNavigate('blog')}
    >
      <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
        <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
          <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] items-center justify-center px-[10px] py-[4px] relative rounded-[6px] shrink-0">
            <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">
              {post.category?.name?.toUpperCase() || 'ARTICLE'}
            </p>
          </div>
          <p className="font-['Work_Sans:SemiBold',_sans-serif] font-semibold leading-[40px] relative shrink-0 text-[36px] text-white w-[720px]">
            {post.title}
          </p>
        </div>
        <div className="content-stretch flex gap-[20px] items-center relative shrink-0">
          <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
            <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">
              {post.author?.name || 'Auteur'}
            </p>
          </div>
          <p className="font-['Work_Sans:Regular',_sans-serif] font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">
            {formatBlogDate(post.publishDate || post.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Féetiche
          </h2>
          <p className="text-gray-600">
            Découvrez avec nous, les meilleures offres, les meilleures découvertes, et meilleurs moments d'évasion
          </p>
        </div>

        {/* See More Button */}
        <button
          onClick={() => onNavigate('blog')}
          className="h-10 lg:h-11 px-6 lg:px-8 border border-[#000441] bg-transparent text-[#000441] rounded-lg flex items-center justify-center gap-3 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000441] relative overflow-hidden group transition-colors duration-300"
        >
          {/* Fill Animation Background */}
          <div className="absolute inset-0 bg-[#000441] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left rounded-lg"></div>

          {/* Button Content */}
          <span className="text-sm lg:text-base relative z-10 group-hover:text-white transition-colors duration-300">
            voir plus
          </span>
          <div className="w-4 h-4 lg:w-5 lg:h-5 relative z-10 group-hover:text-white transition-colors duration-300">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 21">
              <path
                d={svgPaths.p1a3da900}
                fill="currentColor"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}

export function BonPlanEvasionSection({ onNavigate }: BonPlanEvasionSectionProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    BlogAPI.getPosts({ limit: 4 })
      .then(res => setPosts(res.posts))
      .catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  const [featuredPost, ...cardPosts] = posts;

  return (
    <section className="bg-white py-8 sm:py-12 lg:py-16 mx-4 sm:mx-6 lg:mx-8 xl:mx-12 rounded-lg">
      <SectionHeader onNavigate={onNavigate} />

      {/* Article à la une */}
      {featuredPost && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="relative h-[300px] sm:h-[400px] lg:h-[450px] w-full">
            <MPostCardOverlay post={featuredPost} onNavigate={onNavigate} />
          </div>
        </div>
      )}

      {/* Grid des cartes */}
      {cardPosts.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {cardPosts.slice(0, 3).map((post) => (
              <div
                key={post.id}
                className="flex flex-col cursor-pointer hover:opacity-90 transition-opacity duration-200"
                onClick={() => onNavigate('blog')}
              >
                <div className="relative h-60 rounded-lg overflow-hidden mb-6">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${post.featuredImage}')` }} />
                  <div className="absolute top-4 left-4 bg-[#de0035] px-3 py-1 rounded-md">
                    <span className="text-white text-sm font-medium">{post.category?.name?.toUpperCase() || 'ARTICLE'}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[#6941c6] text-sm font-semibold mb-3">{formatBlogDate(post.publishDate || post.createdAt)}</p>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-xl font-semibold text-[#000441] leading-tight">{post.title}</h3>
                    <div className="w-6 h-6 flex-shrink-0 text-[#000441]">
                      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l10-10M17 7H7m10 0v10" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#c0c5d0] leading-relaxed">{post.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
