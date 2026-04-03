import { ArrowUpRight } from 'lucide-react';
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

interface FigmaBlogPostCardProps {
  post: BlogPost;
  onReadMore: (postId: string) => void;
}

function CategoryBadge({ category }: { category: string }) {
  const getCategoryInfo = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'nightlife':
        return { label: 'NIGHTLIFE', color: '#de0035' };
      case 'events':
        return { label: 'ÉVÉNEMENTS', color: '#6941c6' };
      case 'culture':
        return { label: 'CULTURE', color: '#f59e0b' };
      case 'lifestyle':
        return { label: 'LIFESTYLE', color: '#059669' };
      case 'tech':
        return { label: 'TECH', color: '#4338ca' };
      default:
        return { label: category.toUpperCase(), color: '#de0035' };
    }
  };

  const { label, color } = getCategoryInfo(category);

  return (
    <div 
      className="absolute left-[22px] top-[16px] z-10 flex items-center justify-center gap-[4px] rounded-[6px] px-[10px] py-[4px] blog-category-badge"
      style={{ backgroundColor: color }}
    >
      <p className="font-['Work_Sans'] font-medium text-[14px] leading-[20px] text-white whitespace-nowrap">
        {label}
      </p>
    </div>
  );
}

function BlogImage({ post }: { post: BlogPost }) {
  return (
    <div className="relative h-[240px] w-full overflow-hidden bg-center bg-cover bg-no-repeat">
      <ImageWithFallback
        src={post.featuredImage}
        alt={post.title}
        className="h-full w-full object-cover"
      />
      <CategoryBadge category={post.category} />
    </div>
  );
}

function ArrowIcon() {
  return (
    <div className="relative size-[24px]">
      <ArrowUpRight 
        className="block size-full" 
        stroke="#000441" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </div>
  );
}

function IconWrap() {
  return (
    <div className="flex flex-col items-start pb-0 pt-[4px] px-0">
      <ArrowIcon />
    </div>
  );
}

function HeadingAndIcon({ title }: { title: string }) {
  return (
    <div className="flex gap-[16px] items-start w-full">
      <div className="flex-1 min-w-0">
        <h3 className="font-['Inter'] font-semibold text-[24px] leading-[32px] text-[#000441] mb-0">
          {title}
        </h3>
      </div>
      <IconWrap />
    </div>
  );
}

function HeadingAndText({ post }: { post: BlogPost }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col gap-[12px] items-start w-full">
      <p className="font-['Inter'] font-semibold text-[14px] leading-[20px] text-[#6941c6] w-full">
        {formatDate(post.publishDate)}
      </p>
      <HeadingAndIcon title={post.title} />
      <p className="font-['Inter'] font-normal text-[16px] leading-[24px] text-[#c0c5d0] w-full">
        {post.excerpt}
      </p>
    </div>
  );
}

function Content({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-col gap-[24px] items-start w-full">
      <HeadingAndText post={post} />
    </div>
  );
}

export function FigmaBlogPostCard({ post, onReadMore }: FigmaBlogPostCardProps) {
  return (
    <article 
      className="flex flex-col gap-[32px] items-start w-full h-full cursor-pointer group transition-all duration-300 hover:transform hover:scale-[1.02] blog-card-enter"
      onClick={() => onReadMore(post.id)}
    >
      <BlogImage post={post} />
      <Content post={post} />
    </article>
  );
}