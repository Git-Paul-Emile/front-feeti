import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { Button } from './ui/button';

interface ThemeToggleProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function ThemeToggle({ variant = 'ghost', size = 'default', className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
      aria-label={`Basculer vers le mode ${theme === 'light' ? 'sombre' : 'clair'}`}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon */}
        <Sun 
          className={`absolute inset-0 w-5 h-5 transition-all duration-500 transform ${
            theme === 'light' 
              ? 'rotate-0 scale-100 opacity-100' 
              : 'rotate-90 scale-0 opacity-0'
          }`}
        />
        
        {/* Moon Icon */}
        <Moon 
          className={`absolute inset-0 w-5 h-5 transition-all duration-500 transform ${
            theme === 'dark' 
              ? 'rotate-0 scale-100 opacity-100' 
              : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </div>
      
      {/* Animated background effect */}
      <div 
        className={`absolute inset-0 rounded-full transition-all duration-300 ${
          theme === 'light'
            ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20'
            : 'bg-gradient-to-r from-blue-600/20 to-purple-600/20'
        }`}
      />
    </Button>
  );
}