interface FeetiLogoProps {
  onClick?: () => void;
  className?: string;
}

export function FeetiLogo({ onClick, className = "" }: FeetiLogoProps) {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      onClick={onClick}
      className={`hover:opacity-80 transition-opacity duration-200 ${className}`}
      data-name="feeti-logo"
    >
      <img src="/logo.png" alt="Feeti" className="h-full w-auto object-contain" />
    </Component>
  );
}
