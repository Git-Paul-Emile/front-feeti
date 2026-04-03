import { cn } from './ui/utils';

interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Tag({ 
  children, 
  variant = 'default', 
  size = 'sm',
  className 
}: TagProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 whitespace-nowrap';
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm', 
    lg: 'px-4 py-1.5 text-base'
  };

  const variantStyles = {
    default: 'bg-muted text-muted-foreground border-muted hover:bg-muted/80',
    primary: 'bg-primary text-primary-foreground border-primary hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/90',
    accent: 'bg-accent text-accent-foreground border-accent hover:bg-accent/80',
    muted: 'bg-muted/50 text-muted-foreground border-muted/50 hover:bg-muted/70'
  };

  return (
    <span className={cn(
      baseStyles,
      sizeStyles[size],
      variantStyles[variant],
      className
    )}>
      {children}
    </span>
  );
}