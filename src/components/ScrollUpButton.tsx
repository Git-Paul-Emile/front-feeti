import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export function ScrollUpButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Remonter en haut"
      className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-[#1a0957] text-white shadow-lg flex items-center justify-center hover:bg-[#2d1a8a] hover:scale-110 transition-all duration-200"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}
