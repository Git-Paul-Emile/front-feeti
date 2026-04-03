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

interface FigmaBlogCardProps {
  post: BlogPost;
  onReadMore: (postId: string) => void;
  variant?: 'default' | 'featured';
}

function CategoryBadge({ category }: { category: string }) {
  const getCategoryInfo = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'events':
        return { label: 'ÉVÉNEMENTS', color: '#de0035' };
      case 'culture':
        return { label: 'CULTURE', color: '#6941c6' };
      case 'lifestyle':
        return { label: 'LIFESTYLE', color: '#059669' };
      case 'tech':
        return { label: 'TECH', color: '#4338ca' };
      case 'nightlife':
        return { label: 'NIGHTLIFE', color: '#de0035' };
      default:
        return { label: category.toUpperCase(), color: '#de0035' };
    }
  };

  const { label, color } = getCategoryInfo(category);

  return (
    <div 
      className="absolute bg-[#de0035] box-border content-stretch flex gap-[4px] items-center justify-center left-[22px] px-[10px] py-[4px] rounded-[6px] top-[16px] z-10 blog-category-badge"
      style={{ backgroundColor: color }}
    >
      <p className="font-medium leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">
        {label}
      </p>
    </div>
  );
}

function BlogImage({ post }: { post: BlogPost }) {
  return (
    <div className="bg-center bg-cover bg-no-repeat h-[240px] overflow-clip relative shrink-0 w-full group-hover:scale-105 transition-transform duration-500">
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
    <div className="relative shrink-0 size-[24px]">
      <ArrowUpRight 
        className="block size-full text-gray-700" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </div>
  );
}

function IconWrap() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[4px] px-0 relative shrink-0">
      <ArrowIcon />
    </div>
  );
}

function HeadingAndIcon({ title }: { title: string }) {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
      <div className="basis-0 font-semibold grow leading-[32px] min-h-px min-w-px not-italic relative shrink-0 text-gray-900 text-[24px]">
        <p className="mb-0 line-clamp-2">{title}</p>
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
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <p className="font-semibold leading-[20px] not-italic relative shrink-0 text-indigo-600 text-[14px] w-full">
        {formatDate(post.publishDate)}
      </p>
      <HeadingAndIcon title={post.title} />
      <p className="font-normal leading-[24px] not-italic relative shrink-0 text-gray-600 text-[16px] w-full line-clamp-3">
        {post.excerpt}
      </p>
    </div>
  );
}

function Content({ post }: { post: BlogPost }) {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full px-6 bg-white">
      <HeadingAndText post={post} />
    </div>
  );
}

export function FigmaBlogCard({ post, onReadMore, variant = 'default' }: FigmaBlogCardProps) {
  if (variant === 'featured') {
    return (
      <article 
        className="content-stretch flex flex-col gap-[24px] items-start relative w-full h-full cursor-pointer group transition-all duration-300 hover:transform hover:scale-[1.02] blog-card-featured bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto pb-6"
        onClick={() => onReadMore(post.id)}
      >
        <BlogImage post={post} />
        <Content post={post} />
      </article>
    );
  }

  return (
    <article 
      className="content-stretch flex flex-col gap-[24px] items-start relative w-full h-full cursor-pointer group transition-all duration-300 hover:transform hover:scale-[1.02] blog-card-enter bg-white rounded-xl shadow-sm hover:shadow-lg overflow-hidden pb-6"
      onClick={() => onReadMore(post.id)}
    >
      <BlogImage post={post} />
      <Content post={post} />
    </article>
  );
}